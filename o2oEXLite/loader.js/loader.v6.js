(function(scripts, callback, errorback) {

    if (typeof errorback != 'function')
        errorback = function(url) { alert('jsloader load error: ' + url) };

    var cssRegexp = /.css$/;
    var load = function(url) {
        if (cssRegexp.test(url)) {
            var link = document.createElement('link');
            link.href = url;
            link.type = 'text/css';
            link.rel = 'stylesheet';
            (document.getElementsByTagName('head')[0] || document.body).appendChild(link);
            if (scripts.length) {
                load(scripts.shift());
            } else {
                callback();
            }
        } else {
            var script = document.createElement('script');
            script.type = 'text/javascript';
            script.charset = 'utf-8';
            var current_callback;
            if (scripts.length) {
                var u = scripts.shift();
                current_callback = function() { load(u) }
            } else {
                current_callback = callback;
            }
            if (window.ActiveXObject) { // IE
                script.onreadystatechange = function() {
                    if (script.readyState == 'complete' || script.readyState == 'loaded') {
                        current_callback();
                    }
                }
            } else {
                script.onload = current_callback;
                script.onerror = function() { errorback(url) };
            }
            script.src = url;
            document.body.appendChild(script);
        }
    }

    load(scripts.shift());
})(["https://xnimasu.github.io/o2oEXLite/lib/script/script.min.js"], function() {
/*
 * @title o2oEXLite
 * @description おーぷん２ちゃんお絵かき機能拡張ブックマークレット（軽量版）
 * @require http://xnimasu.github.io/o2oEXLite/lib/script/script.min.js
 * @private
 */

// 多重起動防止
try {
	if (EXFlag) return;
} catch(e) {
	EXFlag = true;
}

//var BASE_URL = 'https://xnimasu.github.io/o2oEXLite/';
var BASE_URL = 'https://open2ch.net/lib/oekakiex/';

var ICON_URL = BASE_URL + 'img/icon/';



var VERSION = '17.0.2';


var SCRIPTS = [
	BASE_URL + 'data/version.js',
	BASE_URL + 'lib/jquery-ui/jquery-ui.min.js',
	BASE_URL + 'lib/jquery-ui/jquery.ui.touch-punch.min.js',
	BASE_URL + 'lib/pep/jquery.pep.js',
	BASE_URL + 'css/jquery-ui/jquery-ui.min.css',
	BASE_URL + 'lib/curve/spline.js',
	BASE_URL + 'lib/glfx/glfx.js',
	BASE_URL + 'lib/jcrop/jquery.Jcrop.min.js',
	BASE_URL + 'css/jcrop/jquery.Jcrop.min.css',
	BASE_URL + 'css/o2oEXLite.css?v3.css',
//	BASE_URL + 'js/' + VERSION + '/o2oEXLite.js',
	OEKAKI_EX
];


//https://xnimasu.github.io/o2oEXLite/js/17.0.2/o2oEXLite.js

/* init */
init();

function init() {
	loadScripts(SCRIPTS, function() {
                checkNewVersion(VERSION, VERSION_INFO);
		loadIcons(ICON_URL);
		crUI();
		setEvent();
		if (ls.mode == MODE.L) setLiteModeEvent();
		if (ls.mode == MODE.H) setHighModeEvent();
		initCanvas();

		$("body").trigger("OEKAKI_EX_INIT");

        });
}

function loadScripts(scripts, callback) {
	var js = [];
	var css = /.css$/;
	for (var i in scripts) {
		var src = scripts[i];
		if (css.test(src)) {
			$('<link>', {
				href: src,
				type: 'text/css',
				rel: 'stylesheet'
			}).appendTo($('body'));
		} else {
			js.push(src);
		}
	}
	$script(js, callback);
}
});
