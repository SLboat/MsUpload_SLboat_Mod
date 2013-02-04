var gallery_arr = new Array();

$(document).ready(function () { //jquery      
/* Check if we are in edit mode and the required modules are available and then customize the toolbar */
if ( $.inArray( mw.config.get( 'wgAction' ), ['edit', 'submit'] ) !== -1 ) {
	mw.loader.using( 'user.options', function () {
		if ( mw.user.options.get('usebetatoolbar') ) {
	    	mw.loader.using( 'ext.wikiEditor.toolbar', function () { createUpload(true); });
		}else{ createUpload(false); }
	});
}
});

function createUpload(wikiEditor){
		
	if(wikiEditor==true){		
		
		//create upload button
		var upload_tab = $(document.createElement("span")).attr('class','tab tab-msupload').prependTo('#wikiEditor-ui-toolbar .tabs');
				
		var upload_button = $(document.createElement("span")).attr({ 
		     id: "upload_select",
		     title: mw.msg('msu-button_title')
		}).append('<img src="'+msu_vars.path+'/images/button_upload.gif">').appendTo(upload_tab); 
		
		//create upload div  
    	var upload_container = $(document.createElement("div")).attr('id',"upload_container").insertAfter('#wikiEditor-ui-toolbar');
   		var upload_div = $(document.createElement("div")).attr("id","upload_div").appendTo(upload_container); 
		var container_msu = 'upload_container';
		$('#wikiEditor-ui-toolbar .tool .options').css('z-index', '2'); //headline dropdown
	
	}else{ //only standard editor
		
	  var upload_button = $(document.createElement("a")).attr({ 
      id: "upload_select",
      title: mw.msg('msu-button_title')
      }).append('<img src="'+msu_vars.path+'/images/button_upload.gif">').appendTo("#toolbar"); 
	  
	  var upload_div = $(document.createElement("div")).attr("id","upload_div").insertAfter("#toolbar"); 
	  var container_msu = 'toolbar';
	}  
	      
    var status_div = $(document.createElement("div")).attr("id","upload_status").html('No runtime found.').appendTo(upload_div); 
    var upload_list = $(document.createElement("ul")).attr("id","upload_list").appendTo(upload_div);
    var bottom_div = $(document.createElement("div")).attr("id","upload_bottom").appendTo(upload_div).hide(); 
    var start_button = $(document.createElement("a")).attr("id","upload_files").appendTo(bottom_div).hide();
    var spacer = $(document.createElement("span")).attr("class", "spacer").appendTo(bottom_div).hide();
    var gallery_insert = $(document.createElement("a")).attr("id","gallery_insert").appendTo(bottom_div).hide();
	//加上清除按钮到最后
    var gallery_clean = $(document.createElement("a")).attr("id","gallery_clean").text(mw.msg('msu-clean_gallery')).appendTo(bottom_div);

       var uploader = new plupload.Uploader({
    		//runtimes : 'html5,flash',
    		runtimes : 'html5,flash,silverlight,html4',
    		browse_button : 'upload_select',
    		container : container_msu,
    		max_file_size : '100mb',
    		drop_element: 'upload_drop',
    		unique_names: false,
    		//multipart_params: {} ,     
        	url : msu_vars.path+'/../../api.php',
    		flash_swf_url : msu_vars.path+'/js/plupload/plupload.flash.swf',
    		silverlight_xap_url : msu_vars.path+'/js/plupload/plupload.silverlight.xap'
    		
	     /*
	     // Specify what files to browse for
        filters : [
	            {title : "Image files", extensions : "jpg,gif,png"},
	            {title : "Zip files", extensions : "zip"}
        ],
        // resize pictures
        //resize : {width : 320, height : 240, quality : 90}
        */	
    	});
    
    	uploader.bind('Init', function(up, params) {
    		status_div.html("<b>Debug</b> runtime: " + params.runtime + " drag/drop: "+ (!!up.features.dragdrop));
    		if(msu_vars.debugMode == 'false') status_div.hide(); //hide status if debug mode is disabled

    		if(up.features.dragdrop){
	        	
	        	var upload_drop = $(document.createElement("div")).attr("id","upload_drop").html('<span class="drop_text">'+mw.msg('msu-dropzone')+'</span>').insertAfter(status_div); 
	        	upload_drop.bind('dragover',function(event){
					   $(this).addClass('drop_over').css('padding','30px');
				}).bind('dragleave',function(event){
					   $(this).removeClass('drop_over').css('padding','0px');
				}).bind('drop',function(event){
					   $(this).removeClass('drop_over').css('padding','0px');
				});

	        }
    		
    	});


      uploader.bind('FilesAdded', function(up, files) { // slboat:文件添加后的事件，看起来就在这里进行处理了
			var file_index = 0; // SLBoat-森亮号IOS6修改: 初始化文件的索引为0
    		$.each(files, function(i, file){
				// SLBoat:这里的file是完整的file类，它有所有的属性

				/*  森亮号IOS6修改
				* 当为iPad平台的情况下，文件名包含image并且小于7个字符的情况下，进行自动命名文件名
				* 它的缺陷是它无法再判断是否上传过一样的文件了
				* 它的默认的名字是 iamge.jpg 9个字符长度
				* @done：简化到一个函数里面-直接交由isIOS6函数来处理
				*/
				if (isIOS6(file.name)){
					file.name=getTimeFileName(file_index);// SLBoat:引入新文件名
				}				

				// SLBoat:开始显示出来到列表里-展现所有添加的文件
    			file.li = $(document.createElement("li")).attr("id",file.id).attr("class","file").appendTo(upload_list);
	            
	            file.li.type = $(document.createElement("span")).attr("class","file-type").appendTo(file.li);
	            file.li.title = $(document.createElement("span")).attr("class","file-title").text(file.name).appendTo(file.li);
	            file.li.size = $(document.createElement("span")).attr("class","file-size").text(plupload.formatSize(file.size)).appendTo(file.li);
	            file.li.warning = $(document.createElement("span")).attr("class","file-warning").appendTo(file.li);
	            file.li.container = $(document.createElement("span")).appendTo(file.li);
	            
	            check_extension(file,up);  // slboat:检查文件后缀
            	file_index++; // slboat森亮号IOS6修改:索引加1
    		});
    		up.refresh(); // Reposition Flash/Silverlight
    	});
	
     uploader.bind('QueueChanged', function(up) { //这里看起来是文件被改名后的事件
		uploader.trigger("CheckFiles", up);
     });
      
     uploader.bind('StateChanged', function(up) {
		if(msu_vars.debugMode == 'true') console.log(up.state);
		
		if (up.files.length === (up.total.uploaded + up.total.failed)) {
			//console.log('state: '+up.files.length)// all files uploaded --> trigger
		}
	});
	
	uploader.bind('FilesRemoved', function(up,files) {
		if(msu_vars.debugMode == 'true') console.log('file removed');
		uploader.trigger("CheckFiles", up);
	});

    uploader.bind('BeforeUpload', function(up, file) {
    	   	
    	file.li.title.text(file.name).show(); //show title
    	$('#' + file.id + " input.input_change").hide(); //hide input
    	
    	up.settings.multipart_params = {
    		filename : file.name,
    		token: mw.user.tokens.get( 'editToken' ),
    		action:"upload",
    		ignorewarnings:true,
    		comment:mw.msg('msu-comment'),
    		format:"json"
    	}; //set multipart_params
    	$('#' + file.id + " div.file-progress-bar").progressbar({value: '1'});
    	$('#' + file.id + " span.file-progress-state").html("0%");
    	
     });
      
     uploader.bind('UploadProgress', function(up, file) {
    	
    		$('#' + file.id + " span.file-progress-state").html(file.percent + "%");
        	$('#' + file.id + " div.file-progress-bar").progressbar({value: file.percent});
      		$('#' + file.id + ' div.file-progress-bar .ui-progressbar-value').removeClass('ui-corner-left');
      });
   
     uploader.bind('Error', function(up, err) {
    		
        	$('#' + err.file.id + " span.file-warning")
        	.html("Error: " + err.code +", Message: " + err.message + (err.file ? ", File: " + err.file.name : ""));
        	
    		status_div.append(err.message);
    		up.refresh(); // Reposition Flash/Silverlight
     });
    
     uploader.bind('FileUploaded', function(up, file, success) {

		if(msu_vars.debugMode == 'true') console.log(success);
		
		file.li.title.unbind('click');
		file.li.title.unbind('mouseover');
			
        $('#' + file.id + " div.file-progress").fadeOut("slow");
        $('#' + file.id + " div.file-progress-bar").fadeOut("slow");
        $('#' + file.id + " span.file-progress-state").fadeOut("slow");
            
            
		try{
			result = jQuery.parseJSON( success.response );
			
			if(result.error){
				//{"servedby":"taken-alpha","error":{"code":"nofilename","info":"The filename parameter must be set"}}
				file_error(file,result.error.info);
				
			} else {
			
			//alert(result.upload.result);
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
							"comment":"MsUpload",
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

    		if(file.kat == true){ //should the categroy be set?
		        
		         sajax_do_call( 'wfMsUploadSaveKat', [file.name,wgPageName],function (response) {
		             //alert(response.responseText);
		         });
		        
		     } //if
    		
    		$(document.createElement("a")).text(mw.msg('msu-insert_link')).click(function(e) { //click
  			    if(msu_vars.use_mslinks == 'true'){
  			    	msu_vorlage_insert('{{#l:'+file.name+'}}','',''); // insert link		
  			    } else {
  			    	//msu_vorlage_insert('[[File:'+file.name+']]','',''); // insert link
					msu_vorlage_insert(':[[File:'+file.name+']]','',''); // 单个文件插入——这里与图片是隔开的
  			    }
  			    
        	}).appendTo(file.li);
    		
            if (file.group == "pic"){
        		  
        		gallery_arr.push(file.name); //push 置入到数组里..仅仅置入文件名,因为已经上传成功

        		//问题出在这里,拥有两个文件的时候进行添加,但是删除的时候依然如此
        		  		
        		  if(gallery_arr.length== 2){ //only at first time add click function
							gallery_insert.unbind("click"); //取消上次绑定,这是个比较土的临时方案
	        		  		gallery_insert.click(function(e) { //click
	  			
	  							add_gallery(); //to take always the actual list

	        				}).text(mw.msg('msu-insert_gallery')).show();
	        				//spacer.show();
        		  } else if(gallery_arr.length< 2) {
        		  		
        		  	gallery_insert.html('');
        		  }

        		$(document.createElement("span")).text(' | ').appendTo(file.li);
        		$(document.createElement("a")).text(mw.msg('msu-insert_picture')).click(function(e) { //click
        			
        			msu_vorlage_insert(':[[File:'+file.name+']]','',''); //插入单张图片
        			
        		}).appendTo(file.li);
        		
                
        	} else if (file.group == "mov") { //mov  
        		  
        		
        		$(document.createElement("span")).text(' | ').appendTo(file.li);
        		$(document.createElement("a")).text(mw.msg('msu-insert_movie')).click(function(e) { //click

        			msu_vorlage_insert('[[File:'+file.name+']]','','');
        			
        		}).appendTo(file.li);

        	} //movie
        	
        	}//else error
        	
        }catch(e){//try
			
			file_error(file,"Error: " + success.response.replace(/(<([^>]+)>)/ig,"")); //remove html tags

		}
		
		up.removeFile(file); //for preventing a second upload afterwards
		
     });
     
	 uploader.bind('UploadComplete', function(up, files) { 
	 		
	    	uploader.trigger("CheckFiles", up);  //trigger --> state changed
	    	start_button.hide();

	 });
	 
    uploader.bind('CheckFiles', function(up) {  //附加了一个检查文件的事件

	   	if(msu_vars.debugMode == 'true') console.log(up.files.length);

	    if(gallery_arr.length >= 2){ 
	    	gallery_insert.show();
	        spacer.show();	
	   	}else{
	   		spacer.hide();
         	gallery_insert.hide();
	   	}
	   	
	    if (up.files.length==1){
        	bottom_div.show();
        	start_button.text(mw.msg('msu-upload_this')).show();
        } else if (up.files.length>1){
        	bottom_div.show();
        	start_button.text(mw.msg('msu-upload_all')).show();
        } else {
        	//bottom_div.hide();
         	start_button.hide();
         	if(gallery_arr.length < 2){ 
	    	bottom_div.hide();
	    	}
         	
        }
        
        up.refresh();
	 });
	  //绑定清空事件	
    	$('#gallery_clean').click(function(e) {
			/*---注销麻烦的对话框，它不是个好主意
			if (!(confirm(mw.msg("msu-clean_confirm"))))
			{
				return false;
			}
			*/
			//虽然这些删除实际只是隐藏、去除索引，但还是很酷的
			$(".green.file:not([style])>.file-cancel").click(); //清空可以取消的文件
			$(".yellow.file").attr("style","display:none"); //清空黄色文件
			$(".file:not([style])[class='file']>.file-cancel").click() //清空所有待上传的文件
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
                
   uploader.init();

	

};//function

function add_gallery(){ //插入整个相册就在这里了，而这里将变成我们的插入一系列图片
	gallery_text = ":[[Image:"; //第一个单个标签的左边部分
	gallery_text += gallery_arr.join("]]<br />\n:[[Image:");//中间的一直在继承，\n是实际的硬回车，php里看起来是这样的
	gallery_text +=']]<br />';//最后一个标签的右边部分
	msu_vorlage_insert(gallery_text,'\n','\n');  //插入头部和尾部
}

function check_extension(file,uploader){
		if(msu_vars.debugMode == 'true') console.log(file);
		
        file.li.warning.html("<img src='"+msu_vars.path+"/images/loading.png'>");
		file.extension = file.name.split('.').pop().toLowerCase();

		if($.inArray(file.extension, wgFileExtensions) != -1) {
		    
		    switch(file.extension) {
			  // SLBoat:图片文档增加图标
       	 	  case 'jpg': case 'jpeg': case 'png': case 'gif': case 'bmp': case 'tif': case 'tiff': //pictures
       	 		file.group = "pic";
				// SLBoat:根据IOS6进行不同的图标展示
				if (isIOS6(file.name)){
					// SLBoat:显示特制的ios6图标
	       	 		file.li.type.addClass('picture_ios6');
				}else{
					file.li.type.addClass('picture');
				}
            	break;
			  case 'mov':
       	 		file.group = "mov";
             	break;
        	//case 'pdf':
            /* handle */
            //break;
    		}
    		
            check_file(file.name,file.li);
			//删除文件就在这里
	        file.li.cancel = $(document.createElement("span")).attr("title",mw.msg('msu-cancel_upload')).click(function(e) {
	                file.li.fadeOut("slow");  //淡出显示,最后会变成隐藏,因此dead

	                if (file.group == "pic"){
					 	var idx = gallery_arr.indexOf(file.name); 	// Find the index
					 	if(idx!=-1) gallery_arr.splice(idx, 1); 	// 如果找到在图片数组里,那么序号
					 	uploader.trigger("CheckFiles", uploader); 	// 删除图片后,重新检查文件,刷新按钮等玩意吧
        			}
        			uploader.removeFile(file); //移除文件,不知道真实的移除了什么
        			uploader.refresh();  //刷新显示
        			
	        }).attr("class","file-cancel").appendTo(file.li);
	            
            build(file); // alles aufbauen
            	

      } else { // wrong datatype
				
			file.li.container.hide(1, function() { //create callback
				uploader.removeFile(file);
				uploader.refresh();  	
			});

            file_error(file,mw.msg('msu-ext_not_allowed')+' '+wgFileExtensions.join(','));

      }//else
}

function check_file(filename,file_li){
		 	
          file_li.warning.html("<img src='"+msu_vars.path+"/images/loading.png'>");
              		         
          sajax_do_call( 'SpecialUpload::ajaxGetExistsWarning', [filename], 
        		function (result) {
        				
        		warning = result.responseText.replace(/(<([^>]+)>)/ig,"");

        		if ( warning == '' || warning == '&nbsp;' || warning =='&#160;') {
        			
        			file_li.warning.text(mw.msg('msu-upload_possible')).removeClass('small_warn');

        		} else {
        		
                	// errorhandling (string eventuell noch kuerzen)
                	file_li.warning.html('<span class=\'small_warn\'>'+warning+'</span>');
             
                } //else
       				
        	});
}

function file_error(file,error_text){
	
	file.li.warning.text(error_text);
    //file.li.type.addClass('document');
    file.li.addClass('yellow');
    file.li.type.addClass('error');
    
    file.li.click(function(e) { //bei klick li löschen
	   file.li.fadeOut("slow");
	})
	
	
}


function build(file){
   

      //fileindexer
      //if(autoIndex){
        	// new Element('input', {name:'fi['+file.id+']', 'class':'check_index',type: 'checkbox', 'checked': true}).inject(file.ui.title, 'after');
    	  //new Element('span', {'class':'check_span',html: 'Index erstellen'}).inject(file.ui.title, 'after'); 
      //}

      //autokat
      if(msu_vars.autoKat){ //自动分类，如果是分类页的话-开启
      	file.kat = false;
        if(wgNamespaceNumber==14){ //category page
        	
        	if(msu_vars.autoChecked=='true')  file.kat = true; //predefine

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
	          name:'filename', //原始文件名
	          value:file.name
        	}).insertAfter($(this));  
        
	        input_change.change(function(e) {  //处理了文件变更-直接针对filename
	        
	          file.name = this.value; //这里就是赋予了新的文件名
	          check_file(this.value,file.li);
	        
	        });
  			
  		});

    file.li.append('<div class="file-progress"><div class="file-progress-bar"></div><span class="file-progress-state"></span></div>'); 
    
}

/* 森亮号IOS6修改函数
 * 作用：判断是否为IOS6配套
 * 判断依据：
                   1. 浏览器标识为iPad，或者iPhone
				   2. 图片名称为image开头
				   3. 图片名称小于11个字符
 * 效果：当为IOS6的时候返回true
 * 参数：传入文件名实际参数为file_name
 */
function isIOS6(file_name){
	if (typeof(file_name)=="undefined")
	{
		file_name=""; // 未定义的时候得到空白-不认ios6
	}
	return true; //just for test
	return (navigator.platform == "iPad" || navigator.platform == "iPhone") && file_name.indexOf("image")==0 && file_name.length<11
}

/* 森亮号IOS6修改函数
* 作用：获得一个文件名标记的时间
* 效果：得到的文件名类似slboat_ios6_2013-1-3_23.26.13_0.jpg
* 参数：传入参数file_index为所在的文件序号
*/
function getTimeFileName(file_index){
	if (typeof(file_index)=="undefined")
	{
		file_index=0; // 未定义的时候得到0 
	}
	// 文件名后缀，暂时只处理jpg，因为ios6的相册都是jpg
	var file_ext=".jpg"; 
	//得到一个新的时间类
	var now=new Date(); 
	//获得日期串
	var datastr = now.getFullYear()+"-"+now.getMonth()+"-"+now.getDate(); 
	//获得时间串
	var timestr = now.getHours() + "." + now.getMinutes() + "." + now.getSeconds();
	//得到最终的新文件名
	return "slboat_ios6_" + datastr +"_" + timestr +"_" + file_index + file_ext
}