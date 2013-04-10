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
		
		// SLBoat:创建新版的上传按钮
		var upload_tab = $(document.createElement("span")).attr('class','tab tab-msupload').prependTo('#wikiEditor-ui-toolbar .tabs');
				
		var upload_button = $(document.createElement("span")).attr({ 
		     id: "upload_select",
		     title: mw.msg('msu-button_title')
		}).append('<img src="'+msu_vars.path+'/images/button_upload_slboat.png">').appendTo(upload_tab);  // SLBoat:修改上传图片为透明的
		
		//create upload div  
    	var upload_container = $(document.createElement("div")).attr('id',"upload_container").insertAfter('#wikiEditor-ui-toolbar');
   		var upload_div = $(document.createElement("div")).attr("id","upload_div").appendTo(upload_container); 
		var container_msu = 'upload_container';
		$('#wikiEditor-ui-toolbar .tool .options').css('z-index', '2'); //headline dropdown
	
	}else{ // SLBoat:创建经典的上传按钮
		
	  var upload_button = $(document.createElement("a")).attr({ 
      id: "upload_select",
      title: mw.msg('msu-button_title')
      }).append('<img src="'+msu_vars.path+'/images/button_upload_slboat.png">').appendTo("#toolbar"); // SLBoat:透明上传图片，尽管很少机会用到标准按钮
	  
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
    		max_file_size : '20mb',
    		drop_element: 'upload_drop',
    		unique_names: false,
    		//multipart_params: {} ,     
        	url : msu_vars.path+'/../../api.php', // SLBoat:这就是负责上传的最终API
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
    
    	uploader.bind('Init', function(up, params) { // SLBoat:初始化上传组件
    		status_div.html("<b>Debug</b> runtime: " + params.runtime + " drag/drop: "+ (!!up.features.dragdrop));
    		if(msu_vars.debugMode == 'false') status_div.hide(); //hide status if debug mode is disabled

    		if(up.features.dragdrop && !isIOS6() ){ // SLBoat:支持拖放
	        	// SLBoat: 增加了在IOS6上不需要显示这个，显示也没啥用
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
    		up.refresh(); // Reposition Flash/Silverlight，这里刷新了还是啥子的
    	});
	
     uploader.bind('QueueChanged', function(up) { //这里看起来是文件被改名后的事件
		uploader.trigger("CheckFiles", up);
     });
      
     uploader.bind('StateChanged', function(up) { // SLBoat:状态改变了。。为何而改变呢
		if(msu_vars.debugMode == 'true') console.log(up.state);
		
		if (up.files.length === (up.total.uploaded + up.total.failed)) {  // SLBoat:全部上传完毕后的一次触发，在这里看起来只被用来做调试输出
			//console.log('state: '+up.files.length)// all files uploaded --> trigger
		}
	});
	
	uploader.bind('FilesRemoved', function(up,files) { // SLBoat:文件被移除了，触发检查文件
		if(msu_vars.debugMode == 'true') console.log('file removed');
		uploader.trigger("CheckFiles", up);
	});

    uploader.bind('BeforeUpload', function(up, file) { // SLBoat:在上传之前的处理
    	   	
    	file.li.title.text(file.name).show(); //show title
    	$('#' + file.id + " input.input_change").hide(); //hide input
    	
    	up.settings.multipart_params = {
    		filename : file.name, //看起来是传入的文件名
    		token: mw.user.tokens.get( 'editToken' ),
    		action:"upload", //这是传入的操作方式
    		ignorewarnings:true,
    		comment:mw.msg('msu-comment')+autoAddKat(file.name),  // SLBoat:注入了备注消息就在这里
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
   
     uploader.bind('Error', function(up, err) { // SLBoat:出错的时候进行回调处理
    		
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
			result = jQuery.parseJSON( success.response ); 	// SLBoat:这里并不是处理上传，而只是处理回馈信息
			// SLBoat: 这里也不是获得数据，而只是解析数据-解析JSON
			if(result.error){
				//{"servedby":"taken-alpha","error":{"code":"nofilename","info":"The filename parameter must be set"}}
				file_error(file,result.error.info); //上传发生错误了
				
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
							"comment":"MsUpload", //这就是上传备注
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
	 
    uploader.bind('CheckFiles', function(up) {  // SLBoat:附加了一个检查文件的事件，绑定上去咯

	   	if(msu_vars.debugMode == 'true') console.log(up.files.length);

	    if(gallery_arr.length >= 2){ 
	    	gallery_insert.show();
	        spacer.show();	
	   	}else{
	   		spacer.hide();
         	gallery_insert.hide();
	   	}
	   	
	    if (up.files.length==1){	// SLBoat:只有一个文件的时候，显示插入图片
        	bottom_div.show();
        	start_button.text(mw.msg('msu-upload_this')).show();
        } else if (up.files.length>1){ // SLBoat:不止一个文件的时候，显示插入全部的
        	bottom_div.show();
        	start_button.text(mw.msg('msu-upload_all')).show();
        } else { // SLBoat:别的情况，全部隐起来咯
        	//bottom_div.hide();
         	start_button.hide();
         	if(gallery_arr.length < 2){ 
	    	bottom_div.hide();
	    	}
         	
        }
        
        up.refresh(); // SLBoat:进行刷新，看起来对于flash之类的很要紧
	 });
	  //绑定清空事件	
    	$('#gallery_clean').click(function(e) {
			/*---注销麻烦的对话框，它不是个好主意
			if (!(confirm(mw.msg("msu-clean_confirm"))))
			{
				return false;
			}
			*/
			// SLBoat:虽然这些删除实际只是隐藏、去除索引，但还是很酷的
			$(".green.file:not([style])>.file-cancel").click(); // SLBoat:清空可以取消的文件
			$(".yellow.file").attr("style","display:none"); // SLBoat:清空黄色文件
			$(".file:not([style])[class='file']>.file-cancel").click(); // SLBoat:清空所有待上传的文件
    	});	
    	$('#upload_files').click(function(e) { // SLBoat:点击开始上传后的触发
    		uploader.start();
    		e.preventDefault();
    	});		
    /*
    $('uploadfiles').onclick = function() {
          	uploader.start();
          	return false;
          };
        */
                
   uploader.init(); // SLBoat:再次进行初始化？

	

};//function

function add_gallery(){ //插入整个相册就在这里了，而这里将变成我们的插入一系列图片
	gallery_text = ":[[Image:"; //第一个单个标签的左边部分
	//去除BR标记，不再需要
	gallery_text += gallery_arr.join("]]\n:[[Image:");//中间的一直在继承，\n是实际的硬回车，php里看起来是这样的
	gallery_text +=']]';//最后一个标签的右边部分
	msu_vorlage_insert(gallery_text,'\n','\n');  //插入头部和尾部
}

function check_extension(file,uploader){
		if(msu_vars.debugMode == 'true') console.log(file);
		
        file.li.warning.html("<img src='"+msu_vars.path+"/images/loading.png'>");
		file.extension = file.name.split('.').pop().toLowerCase(); // SLBoat:获得后缀类型，看起来被附加到了一个新属性里哦

		if($.inArray(file.extension, wgFileExtensions) != -1) { // SLBoat:有效文件类型
		    
		    switch(file.extension) {
			  // SLBoat:图片文档增加图标
       	 	  case 'jpg': case 'jpeg': case 'png': case 'gif': case 'bmp': case 'tif': case 'tiff': //pictures
       	 		file.group = "pic";
				// SLBoat:根据IOS6进行不同的图标展示
				if (isIOS6()){ // SLBoat:注意这里强制不检查文件名称
					// SLBoat:显示特制的ios6图标
	       	 		file.li.type.addClass('picture_ios6');
				}else{
					file.li.type.addClass('picture');
				}
            	break;
			  case 'mov':
       	 		file.group = "mov";
             	break;
     		  case 'mp3': //音乐文件
			    file.li.type.addClass('music');
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
	        // SLBoat:建造file？    
            build(file); // alles aufbauen 
            	

      } else { // wrong datatype
			// SLBoat:无效文件类型，只在js里处理？
			file.li.container.hide(1, function() { //create callback
				uploader.removeFile(file);
				uploader.refresh();  	
			});

            file_error(file,mw.msg('msu-ext_not_allowed')+' '+wgFileExtensions.join(','));

      }//else
}

function check_file(filename,file_li){ // SLBoat:检查文件信息的玩意
		 	
          file_li.warning.html("<img src='"+msu_vars.path+"/images/loading.png'>");              		         
          sajax_do_call( 'SpecialUpload::ajaxGetExistsWarning', [filename],  // SLBoat:检查是否重复文件名
			  function (result) {        				
        		warning = result.responseText.replace(/(<([^>]+)>)/ig,""); // SLBoat:初次过滤的信息
				// SLBoat:整理掉该死的strong返回玩意，alex见证
				warning = warning.replace("&lt;strong&gt;","[[").replace("&lt;/strong&gt;","]]");
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
	          name:'filename', // SLBoat:这是它的输入框name属性，类似于ID
	          value:file.name // SLBoat:似乎是赋予初始化值
        	}).insertAfter($(this));  // SLBoat:this真有趣
        
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
		file_name="image.jpg"; // 未定义的时候强制为默认名字-就认ios6
	}
	// return true; //just for test
	return (navigator.platform == "iPad" || navigator.platform == "iPhone") && file_name.indexOf("image")==0 && file_name.length<11
}

/* 森亮号IOS6修改函数
* 作用：获得一个文件名标记的时间
* 效果：得到的文件名类似slboat_ios6_2013-1-3_23.26.13_0.jpg
* 参数：传入参数file_index为所在的文件序号
*/
function getTimeFileName(file_index){
	if (typeof(file_index) == "undefined")
	{
		file_index = 0; // 未定义的时候得到0 
	}
	// 文件名后缀，暂时只处理jpg，因为ios6的相册都是jpg
	var file_ext = ".jpg"; 
	//得到一个新的时间类
	var now = new Date(); 
	//获得日期串
	var datastr = now.getFullYear()+"-"+(now.getMonth()+1)+"-"+now.getDate(); 
	//获得时间串
	var timestr = now.getHours() + "." + now.getMinutes() + "." + now.getSeconds();
	//得到最终的新文件名
	return "slboat_ios6_" + datastr +"_" + timestr +"_" + file_index + file_ext
}

/* 森亮号IOS6修改函数
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
	// SLBoat:尝试从文件读取日期
	var file_data_arr = file_name.match(/(?:\D|^)(\d{2})(\d{2})(\d{2})_/); // SLBoat:匹配正则 [非数字]（年份2位）（月份2位）（日期2位）_
	if (file_data_arr != null){
		month=parseInt(file_data_arr[2]);
		if (month>0 && month<=12) //必须是12之内的月份，没做月份
		{
			file_data_str = "20" + file_data_arr[1] + "年" + month +"月"; //过滤掉多位的月份
		}		
	}
	// SLBoat:提取不到任何日期的时候
	if (file_data_str == "") {//最坏的情况发生了，提取不到任何日期
			// SLBoat:增加月份见识
			if(msu_vars.debugMode == 'true') console.log ("slboat: 尝试对音频见识获取分类失败呢!");
			var now = new Date();
			file_data_str = now.getFullYear()+"年"+(now.getMonth()+1)+"月";
		}
	// SLBoat:尝试从文件名提取月份，如果顺利的话，如果不的话采取当前的月份
	kat_mp3 = kat_mp3+" [[分类:音频见识 " + file_data_str+ "]]";
	if (file_extension == "mp3") //如果是音频见识文件
	{
		kat_text = "\n"+kat_mp3; //加在最后面咯
	}
	// SLBoat:todo：增加图片见识？
	return kat_text;
}