/* ------------------------------------------
LICENSE

 * \version 
 * \date    2017-5-13
 * \author  Xiangcai Huang
 * \brief	the functions about the http server.
--------------------------------------------- */
var http = require('http'),
	url = require('url'),
	fs = require('fs'),
	mine = require('./type').types,
	config = require('./config').httpServer,
	path = require('path');

var server = http.createServer(function (request, response)
{
	var pathname = url.parse(request.url).pathname;
	// console.log("\nurl-request:%s\npathname:%s", request.url, pathname);
	if (pathname.slice(-1) === "/") {
		pathname = pathname + "index-auto.html";
		// console.log("pathname2:%s", pathname);
	}
	var realPath = path.join(".././ibaby_freeboard_ui", pathname);
	// console.log("realPath:%s", realPath);
	var ext = path.extname(realPath);
	ext = ext ? ext.slice(1) : 'unknown';
	fs.exists(realPath, function (exists) {
		if (!exists) {
			response.writeHead(404, {
				'Content-Type': 'text/plain'
			});

			response.write("This request URL " + pathname + " was not found on this server.");
			response.end();
		} else {
			fs.readFile(realPath, "binary", function (err, file) {
				if (err) {
					response.writeHead(500, {
						'Content-Type': 'text/plain'
					});
					response.end(err);
					// console.log('500 error');
				} else {
					var contentType = mine[ext] || "text/plain";
					response.writeHead(200, {
						'Content-Type': contentType
					});
					response.write(file, "binary");
					response.end();
					// console.log('200 response');
				}
			});
		}
	});
});
function start(port)
{
	if(port == undefined)
		port = config.port;
	server.listen(port);
	console.log("\nHttp : Server runing at port " + port);
}
module.exports.start = start;