var express = require('express');
var router = express.Router();

var cheerio = require('cheerio');
var request = require('request');

router.get('/', function(req, res, next) {
    res.json({success:true, name:"Rooms.kg proxy"});
});

router.post('/namba/movie/', function(req,res,next){
    if (!req.body.episode || !req.body.client_ip || !req.body.referer || !req.body.user_agent) {
        return res.json({success:false, error:'You have to provide parameters (episode,client_ip, referer, user_agent)'});
    }
    
    const baseUrl = 'http://api.namba.kg/mov-unprotected.php?' +
                    `id=${req.body.episode}&`+
                    `client_ip=${req.body.client_ip}&`+
                    `referer=${req.body.referer}&`+
                    `user_agent=${req.body.user_agent}`;
    request(baseUrl, function(err, response, body){
        if (err) res.json({status:false, data:err});

        const serieData = JSON.parse(body);
        if (serieData.video_link) {
            res.json({success:true, data:serieData.video_link });        
        } else {
            res.json({success:false, data:'No_video'});
        }
    })
})

router.post('/namba/serials/', function(req,res,next){
    if (!req.body.episode || !req.body.client_ip || !req.body.referer || !req.body.user_agent) {
        return res.json({success:false, error:'You have to provide parameters (episode,client_ip, referer, user_agent)'});
    }
    const baseUrl = 'http://api.namba.kg/serial-p2.php?' +
                    `episode_id=${req.body.episode}&`+
                    `client_ip=${req.body.client_ip}&`+
                    `referer=${req.body.referer}&`+
                    `user_agent=${req.body.user_agent}`;

    request(baseUrl, function(err, response, body){
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

router.post('/ockg', function(req, res, next) {
    const url = req.body.url;
    var path = require('path')
    var childProcess = require('child_process')
    var phantomjs = require('phantomjs')
    var binPath = phantomjs.path
    console.log(__dirname)
    var childArgs = [
        path.join(__dirname, '../parse/ockg.js'),
        url
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
