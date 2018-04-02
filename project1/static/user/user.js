
let cookies = getCookies();
document.title = cookies['name'];
//let requestURL = window.location.toString().replace('/user/','/file/');

setAjax(window.location.toString().replace('/user/','/file/'))


$('#undo2').click(function(){
    let depth = parseInt($('#content').attr('data-depth'));
    if(depth === 1){
        alert('已在最顶层文件夹');
    }
    else{
        let origin_url = $('#content').attr('data-url');
        let url_array = origin_url.split('/');
        url_array.length -=2;
        let new_url = url_array.join('/') +'/';
        $('#content').attr('data-url',new_url);
        $('#content').attr('data-depth',--depth);
        setAjax(new_url);
    }
})

$('#folder-plus').click(function(){
    $('#check-area').show();
})

$('#cross').click(function(){
    $('#new_folder').val('');
    $('#check-area').hide();
})

$('#checkmark').click(function(){
    let new_addr = $('#content').attr('data-url') + $('#new_folder').val() +'/';
    let target_url = 'http://localhost:8082/createDir/';
    createDir(target_url,new_addr,$('#new_folder').val());
    $('#new_folder').val('');
    $('#check-area').hide();
})

$('#cloud-upload').click(function(){
    $('#file-upload').click();
})

$('#make-sure').click(function(){
    var file = document.getElementById('file-upload').files[0];
    if(file === undefined){
        alert('no files');
    }
    else{
        alert(decodeURI(file.name));
    }
})

$('#upload-send').click(function(){
    var file = document.getElementById('file-upload').files[0];
    if(file === undefined){
        alert('no files');
    }
    else{
        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function(){
            if(xhr.readyState === 4){
                createFile({name:decodeURI(file.name)},$('#content').attr('data-url'));
                alert(xhr.responseText);
                document.getElementById('file-upload').value = '';
            }
        }
        let file_url = $('#content').attr('data-url').replace('file','fileupload')+ encodeURI(file.name);
        var fr = new FileReader();
        fr.readAsArrayBuffer(file);
        fr.onload = function(e){
            data = fr.result;
            xhr.upload.onload = function(event){
                //console.log('上传成功');
            }
            xhr.open('post',file_url);

            xhr.send(data);
        }
    }
    
})





function createDiretory(data,requrl){
    requrl += (data['name']+'/');
    var a_dom = $('<a></a>').text(' '+data['name']);
    a_dom.attr('href',requrl);
    a_dom.click(function(event){
        event.preventDefault();
        setAjax(requrl);
        let depth = parseInt($('#content').attr('data-depth'));
        depth++;
        $('#content').attr('data-depth',depth);
    })
    var li_dom = $('<li></li>').html(a_dom);
    li_dom.addClass('icon-folder-open diretory');
    $('#content').append(li_dom);
}
function createFile(data,requrl){
    requrl += (data['name']);
    var a_dom = $('<a></a>').text(' '+data['name']);
    a_dom.attr('href',requrl);
    a_dom.attr('download',data['name']);
    var li_dom = $('<li></li>').html(a_dom);
    li_dom.addClass('icon-file-text2 file');
    $('#content').append(li_dom);
}

function setAjax(requestURL){
    $.ajax({
        url:requestURL,
        method:'GET',
        success:function(data,status,jqXHR){
            $('#content').empty();
            $('#content').attr('data-url',requestURL);
            for(let index in data){
                let file = JSON.parse(data[index]);
                if(file['type']==='directory'){
                    createDiretory(file,requestURL);
                }
                else{
                    createFile(file,requestURL);
                }

            }

        },
        error:function(jqXHR,status,error){
            alert(error);
        }
    })
}


function getCookies(){
    let cookiesString = document.cookie;
    let cookies = {};
    if(cookiesString){
        cookiesArray = cookiesString.split('; ');
        for(let i=0;i<cookiesArray.length;i++){
            let para = /(\w+)=(\w+)/.exec(cookiesArray[i]);
            cookies[para[1]] = para[2];
        }
    }
    return cookies;
}

function createDir(url,addr,name){
    $.ajax({
        url:url,
        method:'POST',
        data:addr,
        success:function(data,status,jqXHR){
            alert(jqXHR.responseText);
            createDiretory({'name':name},$('#content').attr('data-url'))
        },
        error:function(jqXHR,status,error){
            alert(jqXHR.responseText);
        }
    })
}