############################################################
#Author:
#Martin Schwindl, msupload@ratin.de
#
#Icons: 
#Some icons by Yusuke Kamiyamane. All rights reserved. Licensed under a Creative Commons Attribution 3.0 License.
#http://p.yusukekamiyamane.com
#
#Usage:
#LocalSettings.php:
#
##Start --------------------------------------- MsUpload
##if necessary
##$wgEnableWriteAPI = true; //API
##$wgEnableUploads = true; // Enable uploads
##$wgFileExtensions = array('png','gif','jpg','jpeg','doc','xls','mpp','pdf','ppt','tiff','bmp','docx', 'xlsx', 'pptx','ps','odt','ods','odp','odg');
#
#$wgMSU_ShowAutoKat = true;     #autokategorisierung
#$wgMSU_CheckedAutoKat = true;  #checkbox: checked = true/false
#$wgMSU_debug = false;
#$wgMSU_ImgParams = "400px";
$wgMSU_UseDragDrop = true; 	#show Drag&Drop Area?	
#require_once("$IP/extensions/MsUpload/msupload.php");
##End  --------------------------------------- MsUpload
#
#
############################################################
####--------------------------------------------SLboat Mod
## 森亮号大船修改版MsUpload，主要修改了
# 修改了上传图标
# 修改支持IOS6
# 修改了支持音频见识自动分类
# 修改自动缩进
# 森亮号大船关于扩展的页面
# http://see.sl088.com/wiki/%E6%89%A9%E5%B1%95:MsUpload
# 像原作者致敬！