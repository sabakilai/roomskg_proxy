var express = require('express');
var router = express.Router();

var cheerio = require('cheerio');
var request = require('request');

/* GET home page. */
router.get('/', function(req, res, next) {
    res.json({success:true, name:"Rooms.kg proxy"});
});

router.get('/namba/movie/:id', function(req, res, next) {
    const movieId = req.params.id;
    const baseUrl = 'http://namba.kg/movie/watch.php?id=';

    request(baseUrl + movieId, function(err, response, body){
        if (err) res.json({status:false, data:err});
        $ = cheerio.load(body);
        if ($('#download')[0] && $('#download')[0].attribs && $('#download')[0].attribs.href) {
            let data = $('#download')[0].attribs.href;
            res.json({success:true, data:data});
        } else {
            res.json({success:false, data:'No_video'});
        }
    })
});

router.get('/namba/serial/:id', function(req,res,next){
    const serialId = req.params.id;
    const baseUrl = 'http://api.namba.kg/serial.php?episode_id=';
    request(baseUrl + serialId, function(err, response, body){
        if (err) res.json({status:false, data:err});

        const serieData = JSON.parse(body);
        if (serieData.video_link) {
            res.json({success:true, data:serieData.video_link });        
        } else {
            res.json({success:false, data:'No_video'});
        }
    })
})

router.post('/tskg', function(req, res, next) {
    const url = req.body.url;
    request(url, function(err, response, body){
        if (err) res.json({status:false, data:err});
        $ = cheerio.load(body);
        if ($('#download-button')['0'] && $('#download-button')['0'].attribs && $('#download-button')['0'].attribs.href) {
            let nextUrl = $('#download-button')['0'].attribs.href
            request('https://www.ts.kg' + nextUrl, function(err,response, body){
                if (err) res.json({status:false, data:err});

                $ = cheerio.load(body);
                if($('#dl-button')['0'] && $('#dl-button')['0'].children[0] && $('#dl-button')['0'].children[0].attribs && $('#dl-button')['0'].children[0].attribs.href){
                    let downloadUrl = $('#dl-button')['0'].children[0].attribs.href;
                    res.json({success:true, data:'https://www.ts.kg' +downloadUrl})
                } else {
                    res.json({success:false, data:'No_video'})
                }
            })
        } else {
            res.json({success:false, data:'No_video'})
        }  
    })
});

router.get('/ockg', function(req, res, next) {
    var path = require('path')
    var childProcess = require('child_process')
    var phantomjs = require('phantomjs')
    var binPath = phantomjs.path
    console.log(__dirname)
    var childArgs = [
        path.join(__dirname, '../parse/ockg.js'),
        'http://oc.kg/#/movie/id/12660'
    ]
    
    childProcess.execFile(binPath, childArgs, function(err, stdout, stderr) {
        if (err) res.json({success:false, data:err  })
        if (stdout.includes('oc.kg')) {
            let link =  stdout.substring(0, (stdout.length-1))
            res.json({success:true, data:link});
        } else {
            res.json({success:false, data:'No_video'})
        }
        
    })
});

module.exports = router;
