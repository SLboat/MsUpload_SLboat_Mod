<?php
/**
 * Body file for extension MsUpload.
 *  
 * @author Martin Schwindl  <martin.schwindl@ratin.de> 
 * @copyright 2013 by Martin Schwindl
 *
 * @licence GNU General Public Licence 2.0 or later
 */

if( !defined( 'MEDIAWIKI' ) ) {
  echo( "This file is an extension to the MediaWiki software and cannot be used standalone.\n" );
  die();
}

$wgAjaxExportList[] = 'wfMsUploadSaveKat';
//自动保存上传分类,这里看起来导出了一个js api
function wfMsUploadSaveKat($name,$kat) { // SLBoat:修改类的玩意，看起来是

        global $wgContLang,$wgUser;
        
        $mediaString = strtolower( $wgContLang->getNsText( NS_FILE ) );
        
        $title = $mediaString.':'.$name;
        $text = "\n[[".$kat."]]"; // SLBoat:回车然后加上类别的玩意

        $wgEnableWriteAPI = true;    
        $params = new FauxRequest(array (
        	'action' => 'edit',
        	'section'=>  'new',
        	'title' =>  $title,
        	'text' => $text,
        	'token' => $wgUser->editToken(),//$token."%2B%5C",
        ), true, $_SESSION );

        $enableWrite = true; // This is set to false by default, in the ApiMain constructor
        $api = new ApiMain($params,$enableWrite);
        #$api = new ApiMain($params);
        $api->execute();
        $data = & $api->getResultData();
        
  return $mediaString;
}