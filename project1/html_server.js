var http = require('http');
var url  = require('url');
var fs = require('fs');
var path = require('path');


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
    "xml"  :  "text/xml",
    "mp3"  :  "audio/x-mpeg",
    "mp4"  :  "video/mp4"
}

// database  user
var user_database = [
    {
        user:'aww123',
        password:'123',
        name:'person1',
        data_url:'http://localhost:8082/user/aww123/',
        cookie:{
            'id':'aww123',
            'permission':'1'
        }
    },
    {
        user:'aww456',
        password:'456',
        name:'person2',
        data_url:'http://localhost:8082/user/aww456/',
        cookie:{
            'id':'aww456',
            'permission':'2'
        }
    }
];
//database  cookies
var cookies_database = [
    {
        path:'/aww123/',
        cookie:{
            'id':'aww123',
            'permission':'1'
        }
    },
    {
        path:'/aww456/',
        cookie:{
            'id':'aww456',
            'permission':'2'
        }
    }
]

//handle cookies
function handle_cookies(data){
    if(!data){
        return {};
    }
    var result = {};
    let cookies = data.split('; ');
    for(let cookie of cookies){
        let arr = cookie.split('=');
        result[arr[0]] = arr[1];
    }
    return result;
}



http.createServer(function(request,response){
    if(request.method === 'GET'){
        let request_url = url.parse(request.url);
        let obj_pathName = request_url.pathname;
        if(!obj_pathName.endsWith('/')&& path.extname(obj_pathName)=== ''){
            request_url.pathname = obj_pathName + '/';
            let location = 'http://localhost:8082' + url.parse(url.format(request_url)).path;
            response.writeHead(301,{
                'location':location
            })
            response.end();
        }
        else{
            if(obj_pathName === '/'){
                response.writeHead(301,{
                    'location':'http://localhost:8082/login/'
                })
                response.end();
            }
            //登录界面
            else if(obj_pathName.startsWith('/login/')){
                if(obj_pathName.length !== 7){
                    response.writeHead(301,{
                        'location':'http://localhost:8082/login/'
                    })
                    response.end();
                }
                else{
                    response.writeHead(200,{
                        'content-Type':'text/html'
                    })
                    fs.createReadStream('html/login/login.html').pipe(response);
                }
                
            }
            //用户网盘界面
            else if(obj_pathName.startsWith('/user/')){
                let original_pathName = obj_pathName.slice(5);
                let regexp_result = /\/(\w+)\//.exec(original_pathName);

                if(regexp_result === null){
                    response.writeHead(301,{
                        'location':'http://localhost:8082/login/'
                    })
                    response.end();
                }
                else{
                    if(regexp_result[0].length + 5 !==obj_pathName.length){
                        response.writeHead(301,{
                            'location':'http://localhost:8082/user' + regexp_result[0]
                        })
                        response.end();
                    }
                    else{
                        //console.log(regexp_result[0]);
                        let user_cookies = handle_cookies(request.headers.cookie);
                        let isTrue = false;
                        for(let cookies of cookies_database){
                            if(cookies['path'] === regexp_result[0]){
                                if(user_cookies['id'] === cookies['cookie']['id']){
                                    response.writeHead(200,{
                                        'content-type':'text/html'
                                    });
                                    fs.createReadStream('html/user/user.html').pipe(response);
                                }
                                else{
                                    response.writeHead(200);
                                    response.end('no access');
                                }

                                isTrue = true;
                            }
                        }
                        //console.log(isTrue);
                        if(!isTrue){
                            response.writeHead(404,{
                                'content-type':'text/html'
                            });
                            response.end('not found');
                        }

                    }
                    
                }
            }
            //前端通过Ajax获取文件夹信息
            else if(obj_pathName.startsWith('/file/')){
                let original_pathName = obj_pathName.slice(6);
                let local_pathName =  path.resolve('user/',original_pathName);
                //console.log(local_pathName);
                fs.stat(local_pathName,(err,stats)=>{
                    if(err){
                        response.writeHead(404);
                        response.end('error');
                    }
                    else{
                        if(stats.isDirectory()){
                            fs.readdir(local_pathName,(err,files)=>{
                                if(err){
                                    response.writeHead(404);
                                    response.end('error');
                                }
                                else{
                                    let data = {};
                                    response.writeHead(200,{
                                        'content-type':'application/json'
                                    });
                                    let paraID = 0;
                                    for(let file of files){
                                        if(file === '.DS_Store'){
                                            continue;
                                        }
                                        else{
                                            let file_ext = path.extname(file);
                                            let file_data = {
                                                'name':file,
                                                'type':file_ext?mime[file_ext.slice(1)]:'directory'
                                            }
                                            data[`para${paraID}`]=JSON.stringify(file_data);
                                            paraID++;
                                        }
                                        
                                    }
                                    response.end(JSON.stringify(data));
                                }
                            })
                        }
                        else if(stats.isFile()){
                            //console.log('file');
                            let file_ext = path.extname(local_pathName).slice(1);
                            response.writeHead(200,{
                                'content-type':mime[file_ext]
                            });
                            fs.createReadStream(local_pathName).pipe(response);
                        }
                        else{
                            response.writeHead(404);
                            response.end();
                        }
                    }
                })
            }
        }

    }
    else if(request.method === 'POST'){
        let referrer = request.headers.referer;
        let objURL = url.parse(referrer);
        //用户上传登陆数据
        if(objURL.pathname === '/login/'){
            let = login_data = '';
            request.on('data',(chunk)=>{
                login_data+=chunk;
            })
            request.on('end',()=>{
                login_data = JSON.parse(login_data);
                let isTrue = false;
                for(let user_data of user_database){
                    if(login_data['user'] === user_data['user'] && 
                    login_data['password'] === user_data['password']){
                        //console.log(user_data);
                        response.writeHead(200,{
                            'Set-cookie':[`id=${user_data['cookie']['id']};Max-Age=3600;path=/user/${user_data['user']}`,
                                          `name=${user_data['name']};Max-Age=3600;path=/user/${user_data['user']}`,
                                          `permission=${user_data['cookie']['permission']};Max-Age=3600;path=/file/${user_data['user']}`]
                        });
                        //console.log(user_data['data_url'])
                        response.end(user_data['data_url']);
                        isTrue = true;
                    }
                }
                if(!isTrue){
                    response.writeHead(404);
                    response.end('用户名错误或者密码错误');
                }
            })
        }
        //用户操作服务器文件
        else{
            let request_url = url.parse(request.url);
            let obj_pathName = request_url.pathname;
            //建立新文件夹
            if(obj_pathName === '/createDir/'){
                let new_dir = '';
                request.on('data',(chunk)=>{
                    new_dir += chunk;
                })
                request.on('end',()=>{
                    new_dir = new_dir.replace('file','user');
                    new_dir = url.parse(new_dir).pathname;
                    new_dir = path.resolve(new_dir.slice(1));
                    fs.mkdir(new_dir,function(err){
                        if(err){
                            response.writeHead(404);
                            if(err.code === 'EEXIST'){
                                response.end('该文件夹已存在');
                            }
                            else{
                                response.end('error');
                            }
                        }
                        else{
                            response.writeHead(200);
                            response.end('新建完毕');
                        }
                    })
                    
                })
            }
            //上传新文件
            else if(obj_pathName.startsWith('/fileupload/')){
                obj_pathName = obj_pathName.replace('fileupload','user');
                obj_pathName = path.resolve(obj_pathName.slice(1));
                obj_pathName = decodeURI(obj_pathName);
                //console.log(file_name);
                var wrStream = fs.createWriteStream(obj_pathName);
                request.pipe(wrStream);
                response.writeHead(200);
                response.end('上传成功');
            }
        }
    }
    
}).listen(8082);