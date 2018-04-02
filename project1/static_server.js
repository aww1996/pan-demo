var http = require('http');
var path = require('path');
var url = require('url');
var fs = require('fs');

var mime = {
    'woff' :  'application/font-woff',
    'ttf'  :  'application/font-ttf',
    'eot'  :  'application/vnd.ms-fontobject',
    'otf'  :  'application/font-otf',
    'svg'  :  'image/svg+xml',
    "css"  :  "text/css",
    "gif"  :  "image/gif",
    "html" :  "text/html",
    "ico"  :  "image/x-icon",
    "jpeg" :  "image/jpeg",
    "jpg"  :  "image/jpeg",
    "js"   :  "text/javascript",
    "json" :  "application/json",
    "pdf"  :  "application/pdf",
    "png"  :  "image/png",
    "swf"  :  "application/x-shockwave-flash",
    "tiff" :  "image/tiff",
    "txt"  :  "text/plain",
    "wav"  :  "audio/x-wav",
    "wma"  :  "audio/x-ms-wma",
    "wmv"  :  "video/x-ms-wmv",
    "xml"  :  "text/xml"
}

var server = http.createServer(function(request,response){
    var request_url = url.parse(request.url);
    var local_path =  path.resolve('static/',request_url.pathname.slice(1));
    //console.log(local_path);
    fs.stat(local_path,function(err,stats){
        if(err){
            console.log(err.message);
            response.writeHead(404);
            response.end('error');
        }
        else {
            if(stats.isFile()){
                let ext = path.extname(local_path).slice(1);
                let type = mime[ext];
                response.writeHead(200,{
                    'content-type':type,
                    'Access-Control-Allow-Origin':'*'
                })
                fs.createReadStream(local_path).pipe(response);
            }
        }
    })
}).listen(8080);