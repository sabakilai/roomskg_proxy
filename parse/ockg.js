
var page = require("webpage").create();
var args = require('system').args;
var url = args[1];
page.open(url, function(status) {
	if(status === "success") {
		var title = page.evaluate(function() {
            return document.getElementsByClassName('dwnld')[1].href;
        });
        console.log(title);
	}
	phantom.exit();
});
