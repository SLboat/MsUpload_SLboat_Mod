var gallery_arr = new Array();

$(document).ready(function () { //jquery      
/* Check if we are in edit mode and the required modules are available and then customize the toolbar */
if ( $.inArray( mw.config.get( 'wgAction' ), ['edit', 'submit'] ) !== -1 ) {	//注入工具栏
	mw.loader.using( 'user.options', function () {
		if ( mw.user.options.get('usebetatoolbar') ) {
	    	mw.loader.using( 'ext.wikiEditor.toolbar', function () { createUpload(true); });	//创建现代工具栏按钮
		}else{ createUpload(false); }	//创建经典工具栏
	});
}
});

function createUpload(wikiEditor){

		// SLboat: 创建上传按钮
		var upload_button = $(document.createElement("div")).attr('id',"upload_select"); //建立上传按钮
    	var upload_container = $(document.createElement("div")).attr({ //按钮的容器
      			id: "upload_container",
      			title: mw.msg('msu-button_title'),
      			'class': 'start-loading'
     	}).append(upload_button);
      
		if(wikiEditor==true){		
			// SLboat: 只添加到主要工具栏后面，单独获得一个组，有趣的是这里就是个基本的原型，手动添加按钮的
			var upload_tab = $(document.createElement("div")).attr('class','group group-msupload').insertAfter('#wikiEditor-ui-toolbar .section-main .group-format'); //按钮的分类
			upload_container.appendTo(upload_tab);
			//create upload div  
			var upload_div = $(document.createElement("div")).attr("id","upload_div").insertAfter('#wikiEditor-ui-toolbar'); 
			$('#wikiEditor-ui-toolbar .tool .options').css('z-index', '2'); //headline dropdown		
		}else{ //only standard editor // SLboat: V9.4作者增加了一些CSS玩意
	      upload_container.css('display','inline-block').css('vertical-align', 'middle').appendTo("#toolbar"); 
	      upload_button.addClass('old_button');
		  var upload_div = $(document.createElement("div")).attr("id","upload_div").insertAfter("#toolbar"); 
		} 
		
		   	
		var status_div = $(document.createElement("div")).attr("id","upload_status").html('No runtime found.').appendTo(upload_div).hide(); 
	    var upload_list = $(document.createElement("ul")).attr("id","upload_list").appendTo(upload_div);
	    var bottom_div = $(document.createElement("div")).attr("id","upload_bottom").appendTo(upload_div).hide(); 
	    var start_button = $(document.createElement("a")).attr("id","upload_files").appendTo(bottom_div).hide();
	    var spacer1 = $(document.createElement("span")).attr("class", "spacer").appendTo(bottom_div).hide();
		// SLboat: 插入的顺序至关重要
    	var clean_all = $(document.createElement("a")).attr("id","clean_all").text(mw.msg('msu-clean_all')).appendTo(bottom_div).hide();	
		var spacer2 = $(document.createElement("span")).attr("class", "spacer").appendTo(bottom_div).hide();
		var gallery_insert = $(document.createElement("a")).attr("id","gallery_insert").appendTo(bottom_div).hide();
		var upload_drop = $(document.createElement("div")).attr("id","upload_drop").insertAfter(status_div).hide();
	     
        var uploader = new plupload.Uploader({
    		runtimes : 'html5,flash,silverlight,html4',
    		browse_button : 'upload_select',
    		container : 'upload_container', //官方V9.3后变更了容器名称
    		max_file_size : '20mb',
    		drop_element: 'upload_drop',
    		//unique_names: true,  
    		//multipart: false, //evtl i	// SLboat: 官方V9.4后增加了这个带注释的
        	url : msu_vars.path+'/../../api.php',
    		flash_swf_url : msu_vars.path+'/js/plupload/Moxie.swf', // SLboat: 官方V9.5引入新的plupload库后这里的文件名变更了
    		silverlight_xap_url : msu_vars.path+'/js/plupload/Moxie.xap'
    		
    		//resize : {width : 320, height : 240, quality : 90}, //resize pictures

	     /* Specify what files to browse for
        filters : [
	            {title : "Image files", extensions : "jpg,gif,png"},
	            {title : "Zip files", extensions : "zip"}
        ], */	
    	});
    
    	uploader.bind('PostInit', function(up) {

	    	upload_container.removeClass('start-loading');
	    	if(msu_vars.debugMode){
    		status_div.html("<b>Debug</b> runtime: " + up.runtime + " features: "+ JSON.stringify(up.features)).show();
    		}
	        // SLboat: 显示拖放区域,包括提醒灯,我们修改了在IOS上不需要显示这个，显示也没啥用
    		if(up.features.dragdrop && !isIOS()  && msu_vars.dragdrop){ // SLboat:支持拖放
	        	upload_drop.text(mw.msg('msu-dropzone')).show();
	        	upload_drop.bind('dragover',function(event){
					   $(this).addClass('drop_over').css('padding','20px');
				}).bind('dragleave',function(event){
					   $(this).removeClass('drop_over').css('padding','0px');
				}).bind('drop',function(event){
					   $(this).removeClass('drop_over').css('padding','0px');
				});

	       	}else{
	       		upload_div.addClass('nodragdrop'); // SLboat: V9.4作者引入了没有拖入框
	       	} //if
    		
    	});

      uploader.bind('FilesAdded', function(up, files) { // SLboat:文件添加后的事件，看起来就在这里进行处理了
			var file_index = 0; // SLboat-森亮号IOS修改: 初始化文件的索引为0
    		$.each(files, function(i, file){
				// SLboat:这里的file是完整的file类，它有所有的属性

				/*  森亮号IOS修改
				* 当为iPad平台的情况下，文件名包含image并且小于7个字符的情况下，进行自动命名文件名
				* 它的缺陷是它无法再判断是否上传过一样的文件了
				* 它的默认的名字是 iamge.jpg 9个字符长度
				* @done：简化到一个函数里面-直接交由isIOS函数来处理
				*/
				if (isIOS(file.name)){
					file.name=getTimeFileName(file_index);// SLboat:引入新文件名
				}				

				// SLboat:开始显示出来到列表里-展现所有添加的文件
    			file.li = $(document.createElement("li")).attr("id",file.id).attr("class","file").appendTo(upload_list);
	            
	            file.li.type = $(document.createElement("span")).attr("class","file-type").appendTo(file.li);
	            file.li.title = $(document.createElement("span")).attr("class","file-title").text(file.name).appendTo(file.li);
	            file.li.size = $(document.createElement("span")).attr("class","file-size").text(plupload.formatSize(file.size)).appendTo(file.li);
	            file.li.loading = $(document.createElement("span")).attr("class","file-loading").appendTo(file.li);
	            file.li.warning = $(document.createElement("span")).attr("class","file-warning").appendTo(file.li);
	            
	            check_extension(file,up);  // SLboat:检查文件后缀
            	file_index++; // SLboat森亮号IOS修改:索引加1
    		});

    		up.refresh(); // Reposition Flash/Silverlight，这里刷新了还是啥子的
    		up.trigger("CheckFiles"); //V9.5 作者增加了触发检查文件(难道不会自动检测了?)
    	});
	
     uploader.bind('QueueChanged', function(up) { //这里看起来是文件被改名后的事件
		up.trigger("CheckFiles"); //看起来这里作者修复了一个uploadder的问题(uploadder.trig 污染了全局)
     });
      
    uploader.bind('StateChanged', function(up) { // SLboat:状态改变了。。通常是上传的状态改变了
		if(msu_vars.debugMode) console.log(up.state); // SLboat: V9.5以后作者去掉了(vale=="true")这样字符方式i到检测
		
		if (up.files.length === (up.total.uploaded + up.total.failed)) {  // SLboat:全部上传完毕后的一次触发，在这里看起来只被用来做调试输出
			//console.log('state: '+up.files.length)// all files uploaded --> trigger
		}
	});
	
	uploader.bind('FilesRemoved', function(up,files) { // SLboat:文件被移除了，触发检查文件
		if(msu_vars.debugMode) console.log('files removed'); //V9.5 作者修改了这里为files,有可能不止一次的文件移除了
		//uploader.trigger("CheckFiles", up); //删除文件后不触发检查文件了..
	});

    uploader.bind('BeforeUpload', function(up, file) { // SLboat:在上传之前的处理
    	   	
    	file.li.title.text(file.name).show(); //show title
    	$('#' + file.id + " input.input_change").hide(); //hide input
    	
    	up.settings.multipart_params = {
    		filename : file.name, //看起来是传入的文件名
    		token: mw.user.tokens.get( 'editToken' ),
    		action:"upload", //这是传入的操作方式
    		ignorewarnings:true,
    		comment:mw.msg('msu-comment')+autoAddKat(file.name),  // SLboat:注入了备注消息就在这里，这里是提前申请备注
    		format:"json"
    	}; //set multipart_params
    	$('#' + file.id + " div.file-progress-bar").progressbar({value: '1'});
    	$('#' + file.id + " span.file-progress-state").html("0%");
    	// SLboat: 这里处理完后就交给API去上传了
     });
      
     uploader.bind('UploadProgress', function(up, file) {
    		$('#' + file.id + " span.file-progress-state").html(file.percent + "%");
        	$('#' + file.id + " div.file-progress-bar").progressbar({value: file.percent});
      		$('#' + file.id + ' div.file-progress-bar .ui-progressbar-value').removeClass('ui-corner-left');
      });
   
     uploader.bind('Error', function(up, err) { // SLboat:出错的时候进行回调处理
    		
        	$('#' + err.file.id + " span.file-warning")
        	.html("Error: " + err.code +", Message: " + err.message + (err.file ? ", File: " + err.file.name : ""));
        	
    		status_div.append(err.message);
    		up.refresh(); // Reposition Flash/Silverlight
     });
    //文件上传成功后，处理些后面的事情
     uploader.bind('FileUploaded', function(up, file, success) {

		if(msu_vars.debugMode) console.log(success);
		
		file.li.title.unbind('click');
		file.li.title.unbind('mouseover');
			
        $('#' + file.id + " div.file-progress").fadeOut("slow");
        $('#' + file.id + " div.file-progress-bar").fadeOut("slow");
        $('#' + file.id + " span.file-progress-state").fadeOut("slow");
            
		try{
			result = jQuery.parseJSON( success.response ); 	// SLboat:这里并不是处理上传，而只是处理回馈信息
			
			if(result.error){
				//{"servedby":"taken-alpha","error":{"code":"nofilename","info":"The filename parameter must be set"}}
				file_error(up,file,result.error.info); //上传出错了..作者在这里看起来改成了up(代替了file),也许是因为目标函数变了
				
			} else {
			
			//console.log(result.upload.result); // SLboat: V9.4作者改成了有趣的方式
			/*{"upload":{"result":"Success",
						"filename":"Msupload_v8.4.jpg",
						"imageinfo":{
							"timestamp":"2012-02-28T14:52:05Z",
							"user":"L\u00fctz",
							"userid":4,
							"size":35491,
							"width":865,
							"height":292,
							"parsedcomment":"MsUpload",
							"comment":"MsUpload", //这就是上传备注,这是一个返回参考的例子里的一部
							"url":"...",
							"descriptionurl":"...",
							"sha1":"...",
							"metadata":...,
							"mime":"image\/jpeg",
							"mediatype":"BITMAP",
							"bitdepth":8
			}}}*/
			
			file.li.type.addClass('ok');
            file.li.addClass('green');
            file.li.warning.fadeOut("slow");
            
    		if(file.kat){ //should the categroy be set? // V9.5 作者该用了jquery的$.get()
		    	$.get( mw.util.wikiScript(), { action: 'ajax', rs: 'wfMsUploadSaveKat',  rsargs: [file.name,wgPageName]} ,"json");
		    } //if category
    		
    		$(document.createElement("a")).text(mw.msg('msu-insert_link')).click(function(e) { //click
  			    if(msu_vars.use_mslinks == 'true'){ // SLboat: 这里的ms是啥意思,看起来作者这里么有改变值
  			    	mw.toolbar.insertTags( '{{#l:'+file.name+'}}', '', '', '' ); // 仅仅是插入文件的连接	
  			    } else {// SLboat: 换成中文的文件名？那不完全失去了国际性
  			    	mw.toolbar.insertTags( '[[:File:'+file.name+']]', '', '', '' ); // SLboat: 单个文件插入——这里与图片是隔开的，只是插入链接
  			    }
  			    
        	}).appendTo(file.li);
    		
            if (file.group == "pic"){ //只对图片又批量插入的功能
        		// SLboat: 这是作者的神奇的预览功能！哇喔！
        		//file.li.type.addClass('picture_load'); // preview -> no need for this any more
            	//file.li.type.html('<img src="'+result.upload.imageinfo.url+'" height="18">');
        		gallery_arr.push(file.name); //push 置入到数组里..仅仅置入文件名,因为已经上传成功	
				//看起来作者已经变换了它的机制,早期的修改重复插入的问题出在这里,拥有两个文件的时候进行添加,但是删除的时候依然如此
        		if(gallery_arr.length == 2){ //only at first time add click function
	        		gallery_insert.click(function(e) { //click
	  					add_gallery(); //to take always the current list
	        		}).text(mw.msg('msu-insert_gallery')).show(); //显示插入图库按钮,或许倒序也很近了..
	        		//spacer.show();
        		} else if(gallery_arr.length< 2) {	
        		  	gallery_insert.html(''); //删除值内容...没有别的方式吗?不插入批量插入的按钮
        		}

        		$(document.createElement("span")).text(' | ').appendTo(file.li);
        		$(document.createElement("a")).text(mw.msg('msu-insert_picture')).click(function(e) { //click
        			
        			//mw.toolbar.insertTags('[[File:'+file.name+msu_vars.imgParams+']]','','',''); //V9.3 增加了图片的尺寸
					mw.toolbar.insertTags(':[[File:'+file.name+']]','','',''); //SLboat - 插入单张图片，仅仅单张图片
        		
        		}).appendTo(file.li);
        		
                
        	} else if (file.group == "mov") { //mov  
        		  
        		$(document.createElement("span")).text(' | ').appendTo(file.li);//这是电影的特别玩意，改变图标文字
        		$(document.createElement("a")).text(mw.msg('msu-insert_movie')).click(function(e) { //click

        			mw.toolbar.insertTags( ':[[File:'+file.name+']]','','',''); //森亮号加入了个缩进
        			
        		}).appendTo(file.li);// SLboat: 到这里已经创建了插入影片按钮

        	} else{ // SLboat: 其它文件也有个插入文件	
				// SLboat: 插入一根竖线
				$(document.createElement("span")).text(' | ').appendTo(file.li); // SLboat: 插入图标和文字?
				// SLboat: 插入一个按钮-第二按钮
        		$(document.createElement("a")).text(mw.msg('msu-insert_file')).click(function(e) { //click

        			mw.toolbar.insertTags(':[[File:'+file.name+']]','','','');
        			
        		}).appendTo(file.li);// SLboat: 创建插入其他文件按钮

        	}// SLboat: 下面还有一个换行是的花括号?
        	
        	}//全部处理完了
        	
        }catch(e){//try		
			file_error(up,file,"Error: " + success.response.replace(/(<([^>]+)>)/ig,"")); //remove html tags
		}
		
		up.removeFile(file); //for preventing a second upload afterwards
		
     });
     
	 uploader.bind('UploadComplete', function(up, files) {  		
	    	uploader.trigger("CheckFiles");  //trigger --> state changed
	    	//start_button.hide();
	 });
	 
    uploader.bind('CheckFiles', function() { 
    	
    	var file_len = uploader.files.length;
		var gal_len = gallery_arr.length;
		var li_len = $('#upload_list li').length;
		
	   	if(msu_vars.debugMode) console.log("files:"+file_len+" gallery:"+gal_len+" list: "+li_len);

        if (file_len>0){
        	
        	bottom_div.show();
        	
        	if (file_len==1){
        		start_button.text(mw.msg('msu-upload_this')).show();
        	} else {
        		start_button.text(mw.msg('msu-upload_all')).show();
        	} 
        	
        	spacer1.show();	
	       	
       } else { //0 files in list
         	start_button.hide();
         	spacer1.hide();	
        }  
       
       if(gal_len >= 2){ 
	    	spacer2.show();	
	    	gallery_insert.show();
	    	bottom_div.show();
	   	}else{
         	gallery_insert.hide();
         	spacer2.hide();	
	   	}
	   	
	   	if(li_len > 0){
	   		bottom_div.show();
	   		clean_all.text(mw.msg('msu-clean_all')).click(function(){
	        				
				gallery_arr.length = 0; // reset
				
				uploader.splice(0, uploader.files.length);
				
				$('#upload_list .file').hide( "slow", function() {
					$(this).remove();
					$(this).hide(); //clear_all button
					gallery_insert.unbind('click');
					bottom_div.hide();
				});
				//uploader.trigger("CheckFiles", uploader);
	       	}).show();
	       	
	   	} else {
	   		bottom_div.hide();
	   	}

       uploader.refresh(); // Reposition Flash/Silverlight
	 });
    	
    	
    	$('#upload_files').click(function(e) {
    		uploader.start();
    		e.preventDefault();
    	});
    	
    /*
    $('uploadfiles').onclick = function() {
          	uploader.start();
          	return false;
          };
        */
                
   uploader.init(); // SLboat:再次进行初始化？!不它是正式测试号,之前是绑定事件,现在是开始干活



};//function

function add_gallery(){ //森亮号守旧的保留这里,不使用难看的相册玩意
	gallery_text = ":[[Image:"; //第一个单个标签的左边部分
	//去除BR标记，不再需要
	gallery_text += gallery_arr.join("]]\n:[[Image:");//中间的一直在继承，\n是实际的硬回车，php里看起来是这样的
	gallery_text +=']]';//最后一个标签的右边部分
	mw.toolbar.insertTags('\n' + gallery_text + '\n', '', '', '');  //或许的，只要tagopen就够了
}

function check_extension(file,uploader){
		if(msu_vars.debugMode) console.log(file);
		
        file.li.loading.show();
		file.extension = file.name.split('.').pop().toLowerCase(); // SLboat:获得后缀类型，看起来被附加到了一个新属性里哦

		if($.inArray(file.extension, wgFileExtensions) != -1) { // SLboat:有效文件类型
		    
		    switch(file.extension) {

       	 	  case 'jpg': case 'jpeg': case 'png': case 'gif': case 'bmp': case 'tif': case 'tiff': //pictures
       	 		file.group = "pic";
       	 		//file.li.type.addClass('picture');
       	 		try{ //preview picture
	       	 		var img = new o.Image(); 
	                img.onload = function() {
	                  // embed the actual thumbnail
	                  	this.embed(file.li.type.get(0), {
	                    	width: 30,
	                       	height: 17,
	                        crop: false
	                	});
	                };
	    			img.load(file.getSource());
					file.li.type.addClass('picture_load');		
	       	 	}catch(e){//try
	       	 		file.li.type.addClass('picture');
	       	 	}
            	break;
			  case 'mov':
       	 		file.group = "mov"; //电影文件
       	 		file.li.type.addClass('film');
             	break;
        	  case 'pdf': //官方V9.3以后增加的pdf支持
        	    file.li.type.addClass('pdf');
             	break;
     		  case 'mp3': //音频见识MP3
			    file.group = "music"; //添加音频见识分组
			    file.li.type.addClass('music');
				break;
    		}
    		
            check_upload_warning(file.name,file.li);
            //删除文件就在这里
                   				
	        file.li.cancel = $(document.createElement("span")).attr("title",mw.msg('msu-cancel_upload')).click(function(e) {
	                
	                uploader.removeFile(file); //移除容器里的文件
	                if (file.group == "pic"){
	                	var idx = jQuery.inArray(file.name,gallery_arr); // Find the index (indexOf not possible in ie8)
					 	if(idx!=-1) gallery_arr.splice(idx, 1); 	// 如果找到在图片数组里,那么序号
					 	//uploader.trigger("CheckFiles", uploader); 	//  删除图片后,重新检查文件,刷新按钮等玩意吧
        			}
        			file.li.fadeOut( "slow", function() { 
        				$(this).remove(); 
        				uploader.trigger("CheckFiles");
        			});
        			//uploader.refresh(); 
        			
        			
	        }).attr("class","file-cancel").appendTo(file.li);
	        // SLboat:建造file？    
            build(file); // alles aufbauen
            	

      } else { // wrong datatype
			// SLboat:无效文件类型，只在js里处理？这里是隐藏并且处理
			file.li.loading.hide(1, function() { //create callback 
				uploader.removeFile(file); // SLboat: 删除文件
				uploader.refresh();  // SLboat: 刷新上传控件
			});

            file_error(uploader,file,mw.msg('msu-ext_not_allowed')+' '+wgFileExtensions.join(','));

      }//else
}

function check_upload_warning(filename,file_li){  // SLboat:检查文件信息的玩意
	 
	var mw_version = parseInt(wgVersion.substr(2,2));
	if(mw_version > 21){
		
		$.ajax({ url: mw.util.wikiScript( 'api' ), dataType: 'json', type: 'POST',
        data: {
            format: 'json',
            action: 'query',
            titles: 'File:'+filename,
            prop: 'imageinfo',
            iiprop: 'uploadwarning'
        }, success: function( data ) {
            if ( data && data.query && data.query.pages) {
                var pages = data.query.pages;
				//warning_text(file_li,pages[Object.keys(pages)[0]].imageinfo[0].html); //.keys possible in ie8
				$.each(pages, function(index,val){
                	warning_text(file_li,val.imageinfo[0].html);
                	return false; //break out
                });
				
            } else {
                warning_text(file_li,'Error: Unknown result from API.');
            }
        },
        error: function( xhr ) { warning_text(file_li,'Error: Request failed.'); }
    	});
		
	} else {
		// 看起来V9.5 作者还没变更这里嘛
		sajax_do_call( 'SpecialUpload::ajaxGetExistsWarning', [filename], function (result) {
			warning_text(file_li,result.responseText);
		});
	}	      	
}

function warning_text(file_li,warning){
    if ( warning == '' || warning == '&nbsp;' || warning =='&#160;') {    			
        	file_li.warning.text(mw.msg('msu-upload_possible')).removeClass('small_warn');      			
    } else {
		// errorhandling,错误信息得到
        warning = warning.replace(/(<([^>]+)>)/ig,"");
		// SLboat:整理掉该死的strong返回玩意，alex见证
		warning = warning.replace("&lt;strong&gt;","[[").replace("&lt;/strong&gt;","]]");		
		//切分错误啥的
		warning_split = warning.split(". "); //split error
        $(document.createElement("span")).attr("class","small_warn").text(warning_split[0]).click(function(e) {
        	$(this).text(warning_split[0]+'. '+warning_split[1]);
        }).appendTo(file_li.warning);
    } //else
    file_li.loading.hide();	
}

function file_error(uploader,file,error_text){
	file.li.warning.text(error_text);//显示错误信息
    file.li.addClass('yellow');
    file.li.type.addClass('error');
    file.li.click(function(e) { //remove li at click
		file.li.fadeOut( "slow", function() { 
	   	$(this).remove(); 
	   	uploader.trigger("CheckFiles");
	   	});
	});
}

function build(file){
   
      //fileindexer
      //if(autoIndex){
        	// new Element('input', {name:'fi['+file.id+']', 'class':'check_index',type: 'checkbox', 'checked': true}).inject(file.ui.title, 'after');
    	  //new Element('span', {'class':'check_span',html: 'Index erstellen'}).inject(file.ui.title, 'after'); 
      //}

      //autokat
      if(msu_vars.autoKat){ // SLboat: 自动分类，如果是分类页的话-开启，它看起来并不是那么实用
      	file.kat = false;
        if(wgNamespaceNumber == 14){ //category page
        	
        	$(document.createElement("input")).attr({
        		'class':'check_index',	
        		type: 'checkbox',
        		'checked': file.kat
        	}).change(function(e) {
	        
	          file.kat = this.checked; // save
	        
	        }).appendTo(file.li);
    	  	
    	  	$(document.createElement("span")).attr("class","check_span").text(wgPageName.replace(/_/g, " ")).appendTo(file.li); 
   
        }
      } 
      
		
    	file.li.title.mouseover(function() { //mouseover
			$(this).addClass('title_over');
    	 }).mouseleave(function() {		//mouseout	
    		$(this).removeClass('title_over');
  		}).click(function(e) { //click
  			
  			$(this).hide();
  			var input_change = $(document.createElement("input")).attr({
	          'class':'input_change',
	          size:file.name.length,
	          //id: 'input_change-'+file.id,
	          name:'filename', // SLboat:这是它的输入框name属性，类似于ID
	          value:file.name // SLboat:似乎是赋予初始化值
        	}).insertAfter($(this));  // SLboat:this真有趣，看起来就是自身
        
	        input_change.change(function(e) {  //处理了文件变更-直接针对filename
	        
	          file.name = this.value; //这里就是赋予了新的文件名
	          check_file(this.value,file.li);
	        
	        });
  			
  		});

    file.li.append('<div class="file-progress"><div class="file-progress-bar"></div><span class="file-progress-state"></span></div>'); 
    
}

/* 森亮号IOS修改函数
 * 作用：判断是否为IOS配套
 * 判断依据：
                   1. 浏览器标识为iPad，或者iPhone
				   2. 图片名称为image开头
				   3. 图片名称小于11个字符
 * 效果：当为IOS的时候返回true
 * 参数：传入文件名实际参数为file_name
 */
function isIOS(file_name){
	if (typeof(file_name)=="undefined")
	{
		file_name="image.jpg"; // 未定义的时候强制为默认名字-就认IOS
	}
	// return true; //just for test
	return (navigator.platform == "iPad" || navigator.platform == "iPhone") && file_name.indexOf("image")==0 && file_name.length<11
}

/* 森亮号IOS修改函数
* 作用：获得一个文件名标记的时间
* 效果：得到的文件名类似SLboat_IOS_2013-1-3_23.26.13_0.jpg
* 参数：传入参数file_index为所在的文件序号
*/
function getTimeFileName(file_index){
	if (typeof(file_index) == "undefined")
	{
		file_index = 0; // 未定义的时候得到0 
	}
	// 文件名后缀，暂时只处理jpg，因为IOS的相册都是jpg
	var file_ext = ".jpg"; 
	//得到一个新的时间类
	var now = new Date(); 
	//获得日期串
	var datastr = now.getFullYear()+"-"+(now.getMonth()+1)+"-"+now.getDate(); 
	//获得时间串
	var timestr = now.getHours() + "." + now.getMinutes() + "." + now.getSeconds();
	//得到最终的新文件名
	return "SLboat_IOS_" + datastr +"_" + timestr +"_" + file_index + file_ext
}

/* 森亮号IOS修改函数
* 作用：自动添加分类的备注里
* 效果：输出+\n+分类
* 例如：
  ***********
  ***森亮号航海见识上传***
  ***[[分类:音频见识]]****
* 参数：传入参数file_name文件名
* 返回：分类信息或者空白信息
*/
function autoAddKat(file_name){
	var kat_mp3 = "[[分类:音频见识]]";
	var kat_text = "";
	var file_data_str = ""; //文件日期字符串
	var file_extension = file_name.split('.').pop().toLowerCase();
	var year,month; //月份
	// todo：检查是否为有效mp3后缀，不是的话跳出工作
	// SLboat:尝试从文件读取日期
	var file_data_arr = file_name.match(/(?:\D|^)(\d{2})(\d{2})(\d{2})_/); // SLboat:匹配正则 [非数字]（年份2位）（月份2位）（日期2位）_
	if (file_data_arr != null){
		month=parseInt(file_data_arr[2]);
		if (month>0 && month<=12) //必须是12之内的月份，没做月份
		{
			file_data_str = "20" + file_data_arr[1] + "年" + month +"月"; //过滤掉多位的月份
		}		
	}
	// SLboat:提取不到任何日期的时候
	if (file_data_str == "") {//最坏的情况发生了，提取不到任何日期
			// SLboat:增加月份见识
			if(msu_vars.debugMode == 'true') console.log ("SLboat: 尝试对音频见识获取分类失败呢!");
			var now = new Date();
			file_data_str = now.getFullYear()+"年"+(now.getMonth()+1)+"月";
		}
	// SLboat:尝试从文件名提取月份，如果顺利的话，如果不的话采取当前的月份
	kat_mp3 += " [[分类:音频见识 " + file_data_str+ "]]"; //额外增加音频见识月份
	if (file_extension == "mp3") //如果是音频见识文件
	{
		kat_text = "\n"+kat_mp3; //加在最后面咯，也就是起到作用了
	}
	// SLboat:todo：增加图片见识？
	return kat_text;
}