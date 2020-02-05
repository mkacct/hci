var fs = require('fs')
var http = require('http');
var fileList = [
	'/css/global.css',
	'/css/index.css',
	'/js/global.js',
	'/js/indexInterpreter.js',
	'/js/indexUi.js',
	'/js/watchForHover.js',
	'/res/fontAwesome/css/fontawesome.css',
	'/res/fontAwesome/css/solid.css',
	'/res/fontAwesome/webfonts/fa-brands-400.eot',
	'/res/fontAwesome/webfonts/fa-brands-400.svg',
	'/res/fontAwesome/webfonts/fa-brands-400.tff',
	'/res/fontAwesome/webfonts/fa-brands-400.woff',
	'/res/fontAwesome/webfonts/fa-brands-400.woff2',
	'/res/fontAwesome/webfonts/fa-regular-400.eot',
	'/res/fontAwesome/webfonts/fa-regular-400.woff',
	'/res/fontAwesome/webfonts/fa-regular-400.woff2',
	'/res/fontAwesome/webfonts/fa-solid-900.eot',
	'/res/fontAwesome/webfonts/fa-solid-900.svg',
	'/res/fontAwesome/webfonts/fa-solid-900.ttf',
	'/res/fontAwesome/webfonts/fa-solid-900.woff',
	'/res/fontAwesome/webfonts/fa-solid-900.woff2',
	'/res/cred.png',
	'/res/logo.png',
	'/404.html',
	'/config.js',
	'/favicon-16x16.png',
	'/favicon-32x32.png',
	'/favicon-96x96.png',
	'/favicon.ico',
	'/index.html'
];

http.createServer(function (req, res) {
	let url = req.url;
	if (url == '/') {url = '/index.html'}
	if (fileList.indexOf(url) > -1) {
		fs.readFile(__dirname + url, function(err, data) {
			if (err) {
				res.writeHead(500);
				res.end('The resource should exist, but it doesn\'t');
			} else {
				res.writeHead(200);
				res.end(data);
			}
		});
	} else {
		four04(res);
	}
}).listen(8080);

function four04(res){
	fs.readFile(__dirname + '/404.html', function(err, data) {
		res.writeHead(404);
		if (err) {
			res.end('404 not found');
		} else {
			res.end(data);
		}
	});
}