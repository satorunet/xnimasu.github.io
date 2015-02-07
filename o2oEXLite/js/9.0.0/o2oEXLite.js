var PC = ($('#portalGlobalHeader').length == 0) ? true : false;
var MODE = {L: 0, M: 1, H: 2};
var MODE_NAME = {L: '軽量', M: '通常', H: '高機能'};
var LS_KEY_PREFIX = 'o2oEXLite_';
var LS_KEY = {
	VERSION: LS_KEY_PREFIX + 'version',
	MODE: LS_KEY_PREFIX + 'mode',
	FONT: LS_KEY_PREFIX + 'font'
}
var DEF_VERSION = '0.0.0';
var DEF_MODE = MODE.M;
var DEF_FONT = [];
var DEF_FONT_NUM = 5;
var TOOL = {
	MARKER: 'marker',
	PATH: 'path',
	FIGURE: 'figure',
	EFFECT: 'effect',
	SPOIT: 'spoit',
	ERASER: 'eraser',
	FILL: 'fill',
	MOJI: 'moji',
	SETTINGS: 'settings'
}
var MARKER_TYPE = {
	NORMAL: '',
	PENCIL: 'pencil',
	SPRAY: 'spray',
	SHARP: 'sharp',
	PATTERN: 'pattern',
	CORRECT: 'correct'
}
var EFFECT_TYPE = {
	BLUR: 'blur'
}
var PAT_TYPE = {
	DOT: 'dot',
	STAR: 'star',
	LINE: 'line'
}
var POINT_TYPE = {
	NONE: 0,
	ANCHOR: 1,
	CONTROL: 2
}
var LINE_CAP = {B: 'butt', R: 'round', S: 'square'};
var LINE_JOIN = {M: 'miter', R: 'round', B: 'bavel'};
var MERGE_TYPE = {
	ALL_LAYER_BG: 0,
	ALL_LAYER: 1,
	SELECT_LAYER_BG: 2,
	SELECT_LAYER: 3
}
var PREVIEW_SIZE = 0.25;
var PENCIL_SIZE = 20;
var MAX_LAYER = PC ? 12 : 4;
var MAX_BGCOLOR_GRAD = 10;
var MOVE_POINT_R = 100;
var ICON_BASE_URL = 'https://googledrive.com/host/0B1BW1N6rqpWFZkRzMVNvTTE1dlE/';

var ls = {
	version: loadStorage(LS_KEY.VERSION, false) || DEF_VERSION,
	mode: loadStorage(LS_KEY.MODE, false) || DEF_MODE,
	font: loadStorage(LS_KEY.FONT, true) || DEF_FONT
}
var sketch = $('#sketch').sketch();
var canvas = {
	layers: [],
	layerNum: 0,
	layer: {},
	tools: {},
	marker: {
		width: sketch.size,
		color: $("#colorPicker").spectrum('get').toRgbString(),
		cap: LINE_CAP.R,
		join: LINE_JOIN.R,
		pat: {}
	},
	path: {
		type: 'line',
		width: sketch.size,
		color: $("#colorPicker").spectrum('get').toRgbString()
	},
	eraser: {
		width: sketch.size,
		color: 'rgba(0, 0, 0, 1)',
		cap: LINE_CAP.R,
		join: LINE_JOIN.R
	},
	effect: {
		type: 'blur',
		size: 10,
		lv: 1
	},
	moji: {},
	bgcolor: {el: [], grad: false},
	w: getCanvasSize().w,
	h: getCanvasSize().h,
	scale: 1
};
var tools = [TOOL.MARKER, TOOL.ERASER, TOOL.SPOIT];
var redoList = [];
var icons = {
	markerIcon: {img: $('label[for=kaku]')},
	pathIcon: {file: ICON_BASE_URL + 'path2.png'},
	figureIcon: {file: ICON_BASE_URL + 'figure.png'},
	effectIcon: {file: ICON_BASE_URL + 'water.png'},
	eraserIcon: {img: $('label[for=kesu]')},
	spoitIcon: {img: $('label[for=spoit]')},
	fillIcon: {file: 'http://image.open2ch.net/image/oekaki/nuri.png'},
	mojiIcon: {file: ICON_BASE_URL + 'moji.png'},
	figureIcon: {file: ICON_BASE_URL + 'figure.png'},
	settingsIcon: {file: ICON_BASE_URL + 'settings.png'}
};
var clearImageData;

function checkNewVersion(version, versionInfo) {
	if(ls.version != version){
		saveStorage(LS_KEY.VERSION, version, false);
		var versionInfoBox = $('<div>', {id: 'versionInfoBox', title: ' 更新履歴'});
		versionInfoBox.append($('<p>', {text: 'Ver' + version + ' ' + versionInfo[version].Date}));
		versionInfoBox.append($('<p>', {text: versionInfo[version].Info}));
		versionInfoBox.dialog({
			modal: true,
			buttons: {
				OK: function() {
					$( this ).dialog( "destroy" );
				}
			}
		});
	}
}

function crUI() {
	if (ls.mode >= MODE.L) changeOriginalUI();
	if (ls.mode >= MODE.L) crCanvas();
	if (ls.mode >= MODE.M) crLayerUI();
	if (ls.mode >= MODE.M) crScaleUI();
	if (ls.mode >= MODE.M) crMarkerUI();
//	if (ls.mode >= MODE.M) crPathUI();
	if (ls.mode >= MODE.M) crFigureUI();
	if (ls.mode >= MODE.M) crFillUI();
	if (ls.mode >= MODE.H) crEffectUI();
	if (ls.mode >= MODE.M) crEraserUI();
	if (ls.mode >= MODE.M) crSpoitUI();
	if (ls.mode >= MODE.M) crMojiUI();
	if (ls.mode >= MODE.M) crBgcolorUI();
	if (ls.mode >= MODE.L) crSettingsUI();
	if (ls.mode >= MODE.L) crMainMenuUI();
	if (ls.mode >= MODE.L) crGoBtn();
	
	function changeOriginalUI() {
		var mode
		for (var key in MODE) {
			if (ls.mode == MODE[key]) mode = MODE_NAME[key]; 
		}
		if (PC) {
			$('[for=oekakiMode] font').text('お絵かきモード（拡張機能ON：' + mode + 'モード）');
		} else {
			$('#oekakiMode').before($('<font>').text('（拡張機能ON：' + mode + 'モード）'));
		}

		var penSizeList = [0.5, 1, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 24, 28, 32, 36, 40, 48, 56, 64, 72, 80, 100];
		var penSizeSelect = crSelectEl('penSizeSelect', ' 太さ：', penSizeList, penSizeList, 2);
		$('#psize').children().remove();
		$('#psize').append(penSizeSelect.children('#penSizeSelect').children());

		$("#bgcolorPicker").spectrum({
			preferredFormat: 'rgb',
			showInput: true,
			showAlpha: true,
			color: sketch.bgcolor,
			showPalette: true,
			move: function(color) {
				sketch.bgcolor = color.toRgbString();
				changeBgColor(color.toRgbString());
			},
			change: function(color) {
				sketch.bgcolor = color.toRgbString();
				changeBgColor(color.toRgbString());
			}
		});
	}
	
	function crCanvas() {
		var inputEl = crCanvasEl('inputCanvas', 'layer', MAX_LAYER + 1);
		var previewEl = crCanvasEl('previewCanvas', 'layer', 0);
		var tmpEl = crCanvasEl('tmpCanvas', 'layer', -1);
		var patEl = crCanvasEl('patCanvas', 'pattern', 0);
		var patPreviewEl = crCanvasEl('patPreviewCanvas', 'pattern', 0);
		$('#sketch').before(inputEl);
		$('#sketch').before(previewEl);
		$('#sketch').before(tmpEl);
		
		canvas.inputEl = inputEl;
		canvas.previewEl = previewEl;
		canvas.previewCtx = previewEl[0].getContext('2d');
		canvas.tmpEl = tmpEl;
		canvas.tmpCtx = tmpEl[0].getContext('2d');
		canvas.patEl = patEl;
		canvas.patCtx = patEl[0].getContext('2d');
		canvas.patPreviewEl = patPreviewEl;
		canvas.patPreviewCtx = patPreviewEl[0].getContext('2d');
	}
	
	function crLayerUI() {
		var layerTool = $('<div>', {
			id: 'layerTool',
			align: 'left',
			class: 'layerTool'
		});
		var layerText = $('<b>', {text: '[レイヤ]：'});

		var addLayerBtn = $('<input>', {
			id: 'addLayerBtn',
			type: 'button',
			value: '追加'
		});
		var changeLayerDisplayBtn = $('<input>', {
			id: 'changeLayerDisplayBtn',
			type: 'button',
			value: '表示'
		});
		var changeLayerLeftBtn = $('<input>', {
			id: 'changeLayerLeftBtn',
			type: 'button',
			value: '←'
		});
		var changeLayerRightBtn = $('<input>', {
			id: 'changeLayerRightBtn',
			type: 'button',
			value: '→'
		});
		var mergeLayerBtn = $('<input>', {
			id: 'mergeLayerBtn',
			type: 'button',
			value: '結合'
		});
		var deleteLayerBtn = $('<input>', {
			id: 'deleteLayerBtn',
			type: 'button',
			value: '削除'
		});
		var layerPreviewBox = $('<div>', {
			id: 'layerPreviewBox',
			align: 'left'
		});

		layerTool.append(layerText, addLayerBtn, changeLayerDisplayBtn, changeLayerLeftBtn, changeLayerRightBtn, deleteLayerBtn, layerPreviewBox);
		if (PC) {
			$('#_canvas').after(layerTool);
		} else {
			$('#oekakiCanvas').append(layerTool);
		}
		
		var clearAllBtn = $('<input>', {
			id: 'clearAllBtn',
			type: 'button',
			value: '全消'
		});
		$('#clearButton').after(clearAllBtn);
	}

	function crScaleUI() {
		var scaleValueList = [0.5, 0.75, 1, 1.25, 1.5, 2, 2.5, 3, 4, 5];
		var scaleTextList = ['50%', '75%', '100%', '125%', '150%', '200%', '250%', '300%', '400%', '500%'];
		var scaleSelect = crSelectEl('scaleSelect', 'x', scaleValueList, scaleTextList, 2);
		$('#canvasSize').after(scaleSelect);
	}
	
	function crMarkerUI() {
		var mrkTypeValueList = [MARKER_TYPE.NORMAL, MARKER_TYPE.PENCIL, MARKER_TYPE.PATTERN];
		var mrkTypeTextList = ['通常', '鉛筆', 'パターン'];
		var mrkTypeSelect = crSelectEl('mrkTypeSelect', '種類：', mrkTypeValueList, mrkTypeTextList, 0);		
		var mrkCapValueList = [LINE_CAP.R, LINE_CAP.S];
		var mrkCapTextList = ['●', '■'];
		var mrkCapSelect = crSelectEl('mrkCapSelect', '　ペン先：', mrkCapValueList, mrkCapTextList, 0);
	
		var mrkCorrectBox = $('<div>', {id: 'mrkCorrectBox', style: 'display: none'});
		var mrkCorrectLength = [1, 2, 4, 6, 8, 10];
		var mrkInCorrectCheck = crCheckboxEl('mrkInCorrectCheck', '入り', false);
		var mrkInCorrectLengthSelect = crSelectEl('mrkInCorrectLengthSelect', '　長さ：', mrkCorrectLength, mrkCorrectLength, 2);
		var mrkOutCorrectCheck = crCheckboxEl('mrkOutCorrectCheck', '抜き', false);
		var mrkOutCorrectLengthSelect = crSelectEl('mrkOutCorrectLengthSelect', '　長さ：', mrkCorrectLength, mrkCorrectLength, 2);
		mrkCorrectBox.append($('<hr style="margin: 5px">'), mrkInCorrectCheck, mrkInCorrectLengthSelect, br(), mrkOutCorrectCheck, mrkOutCorrectLengthSelect);
		
		var mrkPatBox = $('<div>', {id: 'mrkPatBox', style: 'display: none'});
		var mrkPatTypeValueList = [PAT_TYPE.DOT, PAT_TYPE.STAR, PAT_TYPE.LINE];
		var mrkPatTypeTextList = ['ドット', '星', 'ライン'];
		var mrkPatTypeSelect = crSelectEl('mrkPatTypeSelect', 'パターン：', mrkPatTypeValueList, mrkPatTypeTextList, 0);
		var mrkPatSizeList = [0, 0.5, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
		
		var mrkPatDotBox = $('<span>', {id: 'mrkPatDotBox', style: 'display: none'});
		var mrkPatDotSizeList = [0.5, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
		var mrkPatDotSizeSelect = crSelectEl('mrkPatDotSizeSelect', '　サイズ：', mrkPatDotSizeList, mrkPatDotSizeList, 0);
		var mrkPatDotHSpaceSelect = crSelectEl('mrkPatDotHSpaceSelect', '　間隔（横）：', mrkPatSizeList, mrkPatSizeList, 3);
		var mrkPatDotVSpaceSelect = crSelectEl('mrkPatDotVSpaceSelect', '　間隔（縦）：', mrkPatSizeList, mrkPatSizeList, 3);
		mrkPatDotBox.append(mrkPatDotSizeSelect, br(), mrkPatDotHSpaceSelect, mrkPatDotVSpaceSelect);

		var mrkPatStarBox = $('<span>', {id: 'mrkPatStarBox', style: 'display: none'});
		var mrkPatStarSizeList = [2, 3, 4, 5, 6, 7, 8, 9, 10];
		var mrkPatStarSizeSelect = crSelectEl('mrkPatStarSizeSelect', '　サイズ：', mrkPatStarSizeList, mrkPatStarSizeList, 3);
		var mrkPatStarPointList = [3, 4, 5, 6, 7, 8];
		var mrkPatStarPointSelect = crSelectEl('mrkPatStarPointSelect', '　角：', mrkPatStarPointList, mrkPatStarPointList, 2);
		var mrkPatStarRoundList = [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0];
		var mrkPatStarRoundSelect = crSelectEl('mrkPatStarRoundSelect', '　丸み：', mrkPatStarRoundList, mrkPatStarRoundList, 4);
		var mrkPatStarHSpaceSelect = crSelectEl('mrkPatStarHSpaceSelect', '　間隔（横）：', mrkPatSizeList, mrkPatSizeList, 3);
		var mrkPatStarVSpaceSelect = crSelectEl('mrkPatStarVSpaceSelect', '　間隔（縦）：', mrkPatSizeList, mrkPatSizeList, 3);
		mrkPatStarBox.append(mrkPatStarSizeSelect, br(), mrkPatStarPointSelect, mrkPatStarRoundSelect, br(), mrkPatStarHSpaceSelect, mrkPatStarVSpaceSelect);

		var mrkPatLineBox = $('<span>', {id: 'mrkPatLineBox', style: 'display: none'});
		var mrkPatLineHSizeSelect = crSelectEl('mrkPatLineHSizeSelect', '　太さ（横線）：', mrkPatSizeList, mrkPatSizeList, 2);
		var mrkPatLineVSizeSelect = crSelectEl('mrkPatLineVSizeSelect', '　太さ（縦線）：', mrkPatSizeList, mrkPatSizeList, 2);
		var mrkPatLineHSpaceSelect = crSelectEl('mrkPatLineHSpaceSelect', '　間隔：', mrkPatSizeList, mrkPatSizeList, 6);
		var mrkPatLineVSpaceSelect = crSelectEl('mrkPatLineVSpaceSelect', '　間隔：', mrkPatSizeList, mrkPatSizeList, 6);
		mrkPatLineBox.append(br(), mrkPatLineHSizeSelect, mrkPatLineVSpaceSelect, br(), mrkPatLineVSizeSelect, mrkPatLineHSpaceSelect);
		
		mrkPatBox.append($('<hr style="margin: 5px">'), mrkPatTypeSelect, mrkPatDotBox, mrkPatStarBox, mrkPatLineBox);
		setCanvasSize(canvas.patEl[0], PENCIL_SIZE, PENCIL_SIZE, 1);
		var markerMenu = $('<div>', {id: 'markerMenu'}).append(mrkTypeSelect, canvas.patEl, mrkCapSelect, br(), mrkCorrectBox, mrkPatBox);
		$('body').append(markerMenu);
	}
	
	function crPathUI() {
		tools.push(TOOL.PATH);
		var pathConnectTypeValueList = ['line', 'spline', 'quadratic', 'cubic'];
		var pathConnectTypeTextList = ['直線', 'スプライン曲線', '2次ペジェ曲線', '3次ペジェ曲線'];
		var pathConnectTypeSelect = crSelectEl('pathConnectTypeSelect', '結合：', pathConnectTypeValueList, pathConnectTypeTextList, 0);
		var pathMenu = $('<div>', {id: 'pathMenu'}).append(pathConnectTypeSelect);
		$('body').append(pathMenu);
	}
	
	function crFigureUI() {
		tools.push(TOOL.FIGURE);
		var figureTypeValueList = ['line', 'strokeRect', 'fillRect', 'strokeCircle', 'fillCircle'];
		var figureTypeTextList = ['－', '□', '■', '○', '●'];
		var figureTypeSelect = crSelectEl('figureTypeSelect', '図形：', figureTypeValueList, figureTypeTextList, 0);
		var figureMenu = $('<div>', {id: 'figureMenu'}).append(figureTypeSelect);
		$('body').append(figureMenu);
	}
	
  function crFillUI() {
		tools.push(TOOL.FILL);
		var fillMenu = $('<div>', {id: 'fillMenu'});
		$('body').append(fillMenu);
	}
  
	function crEffectUI() {
		tools.push(TOOL.EFFECT);
		
		var effectTypeValueList = [EFFECT_TYPE.BLUR];
		var effectTypeTextList = ['ぼかし'];
		var effectTypeSelect = crSelectEl('effectTypeSelect', '種類：', effectTypeValueList, effectTypeTextList, 0);
		var effectSizeList = [2, 5, 10, 15, 20];
		var effectSizeSelect = crSelectEl('effectSizeSelect', '　範囲：', effectSizeList, effectSizeList, 1);
		var effectMenu = $('<div>', {id: 'effectMenu'}).append(effectTypeSelect, effectSizeSelect);
		$('body').append(effectMenu);
	}
	
	function crEraserUI() {
		var eraserCapValueList = [LINE_CAP.R, LINE_CAP.S];
		var eraserCapTextList = ['●', '■'];
		var eraserCapSelect = crSelectEl('eraserCapSelect', '形：', eraserCapValueList, eraserCapTextList, 0);
		var eraserPressureValueList = [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1];
		var eraserPressureTextList = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100];
		var eraserPressureSelect = crSelectEl('eraserPressureSelect', '　圧力：', eraserPressureValueList, eraserPressureTextList, 9);
		var eraserMenu = $('<div>', {id: 'eraserMenu'}).append(eraserCapSelect, eraserPressureSelect);
		$('body').append(eraserMenu);
	}
	
	function crSpoitUI() {
		var spoitLayerValueList = [MERGE_TYPE.ALL_LAYER_BG, MERGE_TYPE.ALL_LAYER, MERGE_TYPE.SELECT_LAYER_BG, MERGE_TYPE.SELECT_LAYER];
		var spoitLayerTextList = ['全レイヤ+背景', '全レイヤ', '選択中レイヤ+背景', '選択中レイヤ'];
		var spoitLayerSelect = crSelectEl('spoitLayerSelect', '抽出先：', spoitLayerValueList, spoitLayerTextList, 0);
		var spoitAlphaCheck = crCheckboxEl('spoitAlphaCheck', '透明度　', false);
		var spoitMenu = $('<div>', {id: 'spoitMenu'}).append(spoitLayerSelect, spoitAlphaCheck);
		$('body').append(spoitMenu);
	}
	
	function crMojiUI() {
		tools.push(TOOL.MOJI);
		
		var mojiColorPicker = $('<input>', {id: 'mojiColorPicker', type: 'color'}).before(crLabelEl('mojiColorPicker', '色：'));
		var mojiSizeList = [4, 8, 10, 12, 14, 16, 18, 20, 24, 28, 32, 36, 40, 48, 56, 64, 72, 80, 100];
		var mojiSizeSelect = crSelectEl('mojiSizeSelect', ' 　大きさ：', mojiSizeList, mojiSizeList, 7);
		var mojiFontValueList = ['sans-serif','serif','cursive','fantasy','monospace'];
		var mojiFontTextList = ['ゴシック','明朝','筆記体','装飾','等幅'];
		if (ls.font.length) {
			mojiFontValueList.push(ls.font);
			mojiFontTextList.push(ls.font);
		}
		var mojiFontSelect = crSelectEl('mojiFontSelect', ' フォント：', mojiFontValueList, mojiFontTextList, 0);
		var mojiVerticalCheck = crCheckboxEl('mojiVerticalCheck', '縦書　', false);
		var mojiEdgeCheck = crCheckboxEl('mojiEdgeCheck', '縁取　', false);
		var mojiBoldCheck = crCheckboxEl('mojiBoldCheck', 'B　', false);
		var mojiItalickCheck = crCheckboxEl('mojiItalickCheck', 'I　', false);
		var addFontBtn = $('<input>', {id: 'addFontBtn', type: 'button', value: '追加'});
		var deleteFontBtn = $('<input>', {id: 'deleteFontBtn', type: 'button', value: '削除'});
		var mojiMenu = $('<div>', {id: 'mojiMenu'})
			.append(mojiColorPicker, mojiSizeSelect, $('<br>'))
			.append(mojiFontSelect, addFontBtn, deleteFontBtn, $('<br>'))
			.append(mojiVerticalCheck, mojiEdgeCheck, mojiBoldCheck, mojiItalickCheck);
		$('body').append(mojiMenu);
	}
	
	function crBgcolorUI() {
		var bgcolorGradCheck = crCheckboxEl('bgcolorGradCheck', 'グラデ', false);
		$($('.sp-button-container')[1]).append($('<div>').append(bgcolorGradCheck));
		var gradTypeValueList = ['liner_h', 'liner_v', 'liner_lr', 'liner_lu', 'radial'];
		var gradTypeTextList = ['線形（→）', '線形（↓）', '線形（↘）', '線形（↗）','円形'];
		var gradTypeSelect = crSelectEl('gradTypeSelect', '', gradTypeValueList, gradTypeTextList, 0);
		$('#bgcolorGradCheck').after(gradTypeSelect);

		var addGradBtn = $('<input>', {
			id: 'addGradBtn',
			type: 'button',
			value: '追加',
			style: 'display: none'
		});
		var deleteGradBtn = $('<input>', {
			id: 'deleteGradBtn',
			type: 'button',
			value: '削除',
			style: 'display: none'
		});
		$('#psize').after(deleteGradBtn, addGradBtn);
	}

	function crSettingsUI() {
		tools.push(TOOL.SETTINGS);
		var modeValueList = [MODE.L, MODE.M, MODE.H];
		var modeTextList = [MODE_NAME.L, MODE_NAME.M, MODE_NAME.H];
		var modeSelect = crSelectEl('modeSelect', 'モード：', modeValueList, modeTextList, ls.mode);
		var settingsMenu = $('<div>', {id: 'settingsMenu'}).append(modeSelect);
		$('body').append(settingsMenu);
	}
	
	function crMainMenuUI() {
		var mainMenu = $('<div>', {id: mainMenu}).append($('<ul>'));
		for (var i in tools) {
			var tool = tools[i];
			crMenu(tool, mainMenu, $('#' + tool + 'Menu'));
		}
		mainMenu.tabs({active: 0});
		$('#upImage').after(mainMenu);
		$('#upImage').insertAfter($('#clearAllBtn'));
		$('[name=pmode]').hide();

		function crMenu(tool, mainMenu, subMenu) {
			var li = $('<li>').append($('<a>', {
				href: '#tab-' + tool,
				click: function() {$('[data-tool=' + tool + ']').click()}
			}).append(icons[tool+'Icon'].img));
			mainMenu.children('ul').append(li);

			var menu = $('<div>', {id: 'tab-' + tool}).append(subMenu);
			mainMenu.append(menu);

			$('.tools').after($('<a>', {href: '#sketch', 'data-tool': tool}));
			$('a[href=#tab-' + tool + ']').click(function(){$('[data-tool=' + tool + ']').click()});
		}
	}

	function crGoBtn() {
		var goBtn = $('<input>', {
			id: 'goBtn',
			type: 'button',
			value: '進'
		});
		$('#backButton').after(goBtn);
	}
}

function setEvent() {
	changeOriginalEvent();
	setKeyDownEvent();
	setLayerEvent();
	
	canvas.inputEl.bind('mousedown touchstart', function() {isOekakiDone = 1});
	canvas.inputEl.bind('click mousedown mouseup mousemove mouseleave mouseout touchstart touchmove touchend touchcancel',
		function(e) {
			if (e.originalEvent && e.originalEvent.targetTouches) {
				e.pageX = e.originalEvent.targetTouches[0].pageX;
				e.pageY = e.originalEvent.targetTouches[0].pageY;
			}
			e.preventDefault();
			canvas.tools[sketch.tool].onEvent(e);
		}
	);
	canvas.inputEl[0].addEventListener("touchend", function(e) {
		if (e.originalEvent && e.originalEvent.targetTouches) {
			e.pageX = e.originalEvent.targetTouches[0].pageX;
			e.pageY = e.originalEvent.targetTouches[0].pageY;
		}
		e.preventDefault();
		canvas.tools[sketch.tool].onEvent(e);
	});
	
	$('#goBtn').click(function(){changeAction(redoList, canvas.layer.actions)});
	
	$('#gradTypeSelect').change(sketch.clear);
	$('#addGradBtn').click(addGrad);
	$('#deleteGradBtn').click(deleteGrad);
		
	$('#clearAllBtn').click(function(){
		if(confirm("全てのレイヤの内容をクリアします。よろしいですか？")){
			var layerNum = canvas.layerNum;
			for (var i in canvas.layers) {
				selectLayer(i);
				clear();
			}
			$("#parent_pid").val("");
			isOekakiDone = 0;
			selectLayer(layerNum);
		}
	});
	
	$('#scaleSelect').change(changeCanvasSize);
	
	$('#bgcolorGradCheck').click(function() {
		if ($(this).is(':checked')) {
			crBgcolorSlider();
			$('#bgcolorSlider').css('display', '');
			$('#addGradBtn').css('display', '');
			$('#deleteGradBtn').css('display', '');
			canvas.bgcolor.grad = true;
		} else {
			$('#bgcolorSlider').css('display', 'none');
			$('#addGradBtn').css('display', 'none');
			$('#deleteGradBtn').css('display', 'none');
			canvas.bgcolor.grad = false;
		}
	});
	
	$('#mrkTypeSelect').change(function() {
		canvas.marker.type = $(this).val();
		if (canvas.marker.type == MARKER_TYPE.PATTERN) {
			$('#mrkPatBox').show();
			$('#mrkPatTypeSelect').trigger('change');
		} else {
			$('#mrkPatBox').hide();
		}
		
		if (canvas.marker.type == MARKER_TYPE.CORRECT) {
			$('#mrkCorrectBox').show();
		} else {
			$('#mrkCorrectBox').hide();
		}
	});
	$('#mrkCapSelect').change(function() {
		canvas.marker.cap = $(this).val();
	});
	$('#mrkPatTypeSelect').change(function() {
		canvas.marker.pat.type = $(this).val();
		switch ($(this).val()) {
			case PAT_TYPE.DOT:
				$('#mrkPatDotBox').show();
				$('#mrkPatStarBox').hide();
				$('#mrkPatLineBox').hide();
				$('#mrkPatDotSizeSelect').trigger('change');
				$('#mrkPatDotHSpaceSelect').trigger('change');
				$('#mrkPatDotVSpaceSelect').trigger('change');
				break;
			case PAT_TYPE.STAR:
				$('#mrkPatDotBox').hide();
				$('#mrkPatStarBox').show();
				$('#mrkPatLineBox').hide();
				$('#mrkPatStarSizeSelect').trigger('change');
				$('#mrkPatStarPointSelect').trigger('change');
				$('#mrkPatStarRoundSelect').trigger('change');
				$('#mrkPatStarHSpaceSelect').trigger('change');
				$('#mrkPatStarVSpaceSelect').trigger('change');
				break;
			case PAT_TYPE.LINE:
				$('#mrkPatDotBox').hide();
				$('#mrkPatStarBox').hide();
				$('#mrkPatLineBox').show();
				$('#mrkPatLineHSizeSelect').trigger('change');
				$('#mrkPatLineVSizeSelect').trigger('change');
				$('#mrkPatLineHSpaceSelect').trigger('change');
				$('#mrkPatLineVSpaceSelect').trigger('change');
				break;
		}
	});
	$('#mrkPatDotSizeSelect').change(function() {
		canvas.marker.pat.size = $(this).val();
	});
	$('#mrkPatDotHSpaceSelect').change(function() {
		canvas.marker.pat.hspace = $(this).val();
	});
	$('#mrkPatDotVSpaceSelect').change(function() {
		canvas.marker.pat.vspace = $(this).val();
	});
	$('#mrkPatStarSizeSelect').change(function() {
		canvas.marker.pat.size = $(this).val();
	});
	$('#mrkPatStarPointSelect').change(function() {
		canvas.marker.pat.point = $(this).val();
	});
	$('#mrkPatStarRoundSelect').change(function() {
		canvas.marker.pat.round = $(this).val();
	});
	$('#mrkPatStarHSpaceSelect').change(function() {
		canvas.marker.pat.hspace = $(this).val();
	});
	$('#mrkPatStarVSpaceSelect').change(function() {
		canvas.marker.pat.vspace = $(this).val();
	});
	$('#mrkPatLineHSizeSelect').change(function() {
		canvas.marker.pat.lineHSize = $(this).val();
	});
	$('#mrkPatLineVSizeSelect').change(function() {
		canvas.marker.pat.lineVSize = $(this).val();
	});
	$('#mrkPatLineHSpaceSelect').change(function() {
		canvas.marker.pat.hspace = $(this).val();
	});
	$('#mrkPatLineVSpaceSelect').change(function() {
		canvas.marker.pat.vspace = $(this).val();
	});

	$('#effectTypeSelect').change(function() {
		canvas.effect.type = $(this).val();
	});
	$('#effectSizeSelect').change(function() {
		canvas.effect.size = $(this).val();
	});
	
	$('#eraserCapSelect').change(function() {
		canvas.eraser.cap = $(this).val();
	});
	$('#eraserPressureSelect').change(function() {
		canvas.eraser.color = 'rgba(0, 0, 0, ' + $(this).val() + ')';
	});
	
	
	$("#mojiColorPicker").spectrum({
		preferredFormat: 'rgb',
		showInput: true,
		showAlpha: true,
		showPalette: true,
		move: function(color) {
	//
		}
	});
	$('#addFontBtn').click(function() {
		var font = prompt('追加フォント名');
		if (font) {
			ls.font.push(font);
			saveStorage(LS_KEY.FONT, ls.font, true);
			addSelectOption('mojiFontSelect', font, font);
		}
	});
	$('#deleteFontBtn').click(function() {
		var selected = $('#mojiFontSelect > option:selected');
		if (selected.index() >= DEF_FONT_NUM && confirm('「' + selected.val() + '」を削除しますか？')) {
			var delFont = selected.val();
			for (var i in ls.font) {
				var font = ls.font[i];
				if (font == delFont) {
					ls.font.splice(i, 1);
					saveStorage(LS_KEY.FONT, ls.font, true);
					selected.remove();
				}
			}
		}
	});
	
	$('#modeSelect').change(function() {
		saveStorage(LS_KEY.MODE, $('#modeSelect').val());
		var modeChangeDialog = $('<div>', {id: 'modeChangeDialog', title: 'モード変更'});
		modeChangeDialog.append($('<p>', {text: '適用する場合はページをリロードして再度ブックマークレットを起動してください。'}));
		modeChangeDialog.dialog({
			modal: true,
			buttons: {
				'OK': function() {
					$(this).dialog("destroy");
				}
			}
		});
	});
	
	canvas.tools.marker = {
		onEvent: function(e) {
			switch (e.type) {
				case 'mousedown':
				case 'touchstart':
					startMarkerPreview(e);
					break;
				case 'mouseup':
				case 'mouseout':
				case 'mouseleave':
				case 'touchend':
				case 'touchcancel':
					if (canvas.previewStart) {
						stopMarkerPreview(e);
					}
			}
			if(canvas.previewStart) previewMarker(e);
		},
		draw: function(action) {
			setStyle(action.line);
			drawLine(canvas.layer.ctx, action);
		}
	}
	
	canvas.tools.path = {
		onEvent: function(e) {
			switch (e.type) {
				case 'mousedown':
				case 'touchstart':
					startPathPreview(e);
					break;
				case 'mouseup':
				case 'mouseout':
				case 'mouseleave':
				case 'touchend':
				case 'touchcancel':
					if (canvas.previewStart) {
						stopPathPreview(e);
					}
			}
			if(canvas.previewStart) previewPath(e);
		},
		draw: function(action) {
			drawPath(canvas.layer.ctx, action);
		}
	}

	canvas.tools.figure = {
		onEvent: function(e) {
			switch (e.type) {
				case 'mousedown':
				case 'touchstart':
					startFigurePreview(e);
					break;
				case 'mouseup':
				case 'mouseout':
				case 'mouseleave':
				case 'touchend':
				case 'touchcancel':
					if (canvas.previewStart) {
						stopFigurePreview(e);
					}
			}
			if(canvas.previewStart) previewFigure(e);
		},
		draw: function(action) {
			drawFigure(canvas.layer.ctx, action);
		}
	}
		
	canvas.tools.effect = {
		onEvent: function(e) {
			switch (e.type) {
				case 'mousedown':
				case 'touchstart':
					startEffectPreview(e);
					break;
				case 'mouseup':
				case 'mouseout':
				case 'mouseleave':
				case 'touchend':
				case 'touchcancel':
					if (canvas.previewStart) {
						stopEffectPreview(e);
					}
			}
			if(canvas.previewStart) previewEffect(e);
			showEffectArea(canvas.previewCtx, e, canvas.effect.size);
		},
		draw: function(action) {
			drawEffect(canvas.layer.ctx, action);
		}
	}
	
	canvas.tools.spoit = {
		onEvent: function(e) {
			switch (e.type) {
				case 'mousedown':
				case 'touchstart':
					mergeCanvas(canvas.tmpCtx, $('#spoitLayerSelect').val() || MERGE_TYPE.ALL_LAYER_BG);
					var pos = getPosition(e);
					var spoitImage = canvas.tmpCtx.getImageData(pos.x, pos.y, 1, 1);
					var r = spoitImage.data[0];
					var g = spoitImage.data[1];
					var b = spoitImage.data[2];
					var a = $('#spoitAlphaCheck').is(':checked') ? spoitImage.data[3]/255 : 1;
					var spoitColor = 'rgba(' + r + ',' + g + ',' + b + ',' + a + ')';
					canvas.marker.color = spoitColor;
					setPaletColor(spoitColor);
					break;
			}
	}};
	
	canvas.tools.eraser = {
		onEvent: function(e) {
			switch (e.type) {
				case 'mousedown':
				case 'touchstart':
					startEraserPreview(e);
					break;
				case 'mouseup':
				case 'mouseout':
				case 'mouseleave':
				case 'touchend':
				case 'touchcancel':
					if (canvas.previewStart) {
						stopEraserPreview(e);
						redraw();
					}
			}
			if(canvas.previewStart) previewEraser(e);
		},
		draw: function(action) {
			setStyle(action.line);
			eraseLine(canvas.layer.ctx, action);
			//drawLine(canvas.layer.ctx, action);
		}
	};
	
	canvas.tools.fill = {
		onEvent: function(e) {
			switch (e.type) {
				case 'mousedown':
				case 'touchstart':
					startFill(e);
					break;
			}
		},
		draw: function(action) {
			fill(action);
		}
	}
	
	canvas.tools.moji = {
		onEvent: function(e) {
			switch (e.type) {
				case 'mousedown':
				case 'touchstart':
					inputText(e);
					break;
			}
		},
		draw: function(action) {
			drawText(canvas.layer.ctx, action);
		}
	};
	
	canvas.tools.settings = {onEvent: function() {return}}
	
	$('#submit_button, #resSubmit').click(function() {
		mergeCanvas(canvas.tmpCtx, MERGE_TYPE.ALL_LAYER_BG);
		var imgData = canvas.tmpCtx.getImageData(0, 0, canvas.w, canvas.h);
		sketch.context.putImageData(imgData, 0, 0);
		clearCanvas(canvas.tmpCtx);
		sketch.actions = canvas.layer.actions;
		sketch.baseImageURL = canvas.layer.baseImageURL;
		//canvas.layer.actions = [];
	});
		
	$(window).bind('beforeunload', function(e) {
		if(isOekakiDone){
			return 'お絵かきの途中のようです。';
		}
	});

	function changeOriginalEvent() {
		$("#sketch").unbind();

		$("#colorPicker").spectrum({
			preferredFormat: 'rgb',
			showInput: true,
			showAlpha: true,
			showPalette: true,
			move: function(color) {
				canvas.marker.color = color.toRgbString();
			},
			change: function(color) {
				canvas.marker.color = color.toRgbString();
			}
		});
		
		$('#psize').unbind();
		$('#psize').change(function() {
			canvas.marker.width = $(this).val();
			canvas.eraser.width = $(this).val();
		});
		
		$("#backButton").unbind();
		$("#backButton").click(function() {
			changeAction(canvas.layer.actions, redoList);
		});

		$("#clearButton").unbind();
		$("#clearButton").click(function() {
			if(confirm("お絵かきをクリアします。よろしいですか？")){
				clear();
				isOekakiDone = 0;
				$("#parent_pid").val("");
			}
		});

		$('#canvasSize').unbind();
		$('#canvasSize').change(changeCanvasSize);
		
		$("#saveButton").unbind();
		$("#saveButton").click(function(){
			var saveDialog = $('<div>', {id: 'saveDialog', title: '保存する画像を選択してください'});
			var saveImages = [];
			var mergeLayer = crCanvasEl('saveMergeLayer', '', '');
			var mergeCtx = mergeLayer[0].getContext('2d');
			mergeCanvas(mergeCtx, MERGE_TYPE.ALL_LAYER_BG);
			mergeLayer.addClass('layerPreview selected');
			saveImages.push(mergeLayer);
			saveDialog.append(mergeLayer);
			saveDialog.append($('<hr>'), crLabelEl('', 'レイヤ全選択'));
			saveDialog.append($('<input>', {
				id: 'saveLayerCheckAll',
				type: 'checkbox',
				click: function() {
					if ($(this).is(':checked')) {
						$('canvas[id^=saveLayer]').addClass('selected');
					} else {
						$('canvas[id^=saveLayer]').removeClass('selected');
					}
				}
			}), $('<br>'));
			for (var i in canvas.layers) {
				var saveLayer = crCanvasEl('saveLayer'+i, 'layerPreview', '');
				setCanvasSize(saveLayer[0], canvas.w, canvas.h, PREVIEW_SIZE);
				var ctx = saveLayer[0].getContext('2d');
				ctx.drawImage(canvas.layers[i].el[0], 0, 0);
				saveDialog.append(saveLayer);
				saveImages.push(saveLayer);
			}
			for (var i in saveImages) {
				var img = saveImages[i];
				img.click(function() {
					if ($(this).hasClass('selected')) {
						$(this).removeClass('selected');
					} else {
						$(this).addClass('selected');
					}
				});
			}
			saveDialog.dialog({
				modal: true,
				width: parseInt(canvas.w) + 50,
				buttons: {
					'保存': function() {
						var pref =	["open2ch",new Date().getTime()].join("-");
						for (var i in saveImages) {
							var img = saveImages[i];
							if (img.hasClass('selected')) {
								var link = document.createElement('a');
								link.download = pref +	(i==0 ? '' : '_' + i) + ".png";
								link.href = img[0].toDataURL();
								link.click();
							}
						}
						$(this).dialog('destroy');
					},
					'キャンセル': function() {
						$(this).dialog('destroy');
					}
				}
			});
		});

		setFile = function(file) {
			var img = new Image();
			var fileReader = new FileReader();
			fileReader.onload = function(event) {
				$(img).attr('src', event.target.result);
			}
			fileReader.readAsDataURL(file);
			img.onload = function() {
				redraw(canvas.tmpCtx);
				fitImage(canvas.tmpCtx, img);
				sketch.setBaseImageURL(canvas.tmpEl[0].toDataURL());
				isOekakiDone = 1;
			};
		}
		funcDragAndDrop = function() {
			var droppable = canvas.inputEl;
			var cancelEvent = function(event) {
				droppable.css('border', '2pt dashed #444');
				event.preventDefault();
				event.stopPropagation();
				return false;
			}
			var handleDroppedFile = function(event) {
				cancelEvent(event);
				var file = event.originalEvent.dataTransfer.files[0];
				droppable.css('border', '');
				setFile(file);
				redraw();
				return false;
			}
			var handleDragOver = function(event) {
				cancelEvent(event);
				return false;
			}
			var handleDragLeave = function(event) {
				cancelEvent(event);
				droppable.css('border', '');
				return false;
			}
			droppable.bind('dragover', handleDragOver);
			droppable.bind('dragenter', cancelEvent);
			droppable.bind('dragleave', handleDragLeave);
			droppable.bind('drop', handleDroppedFile);
		}
		funcDragAndDrop();

		sketch.setBaseImageURL = function(url) {
			canvas.layer.baseImageURL = url;
			canvas.layer.baseImageCache = '';
			redraw();
		}

		sketch.clear = function() {
			clearCanvas(sketch.context);
			if (canvas.bgcolor.grad) {
				var grad;
				if ($('#gradTypeSelect').val() == 'liner_h') {
					grad = sketch.context.createLinearGradient(0, 0, canvas.w, 0);
				} else if ($('#gradTypeSelect').val() == 'liner_v') {
					grad = sketch.context.createLinearGradient(0, 0, 0, canvas.h);
				} else if ($('#gradTypeSelect').val() == 'liner_lr') {
					grad = sketch.context.createLinearGradient(0, 0, canvas.w, canvas.h);
				} else if ($('#gradTypeSelect').val() == 'liner_lu') {
					grad = sketch.context.createLinearGradient(0, canvas.h, canvas.w, 0);
				} else {
					var x0 = x1 = canvas.w/2;
					var y0 = y1 = canvas.h/2;
					var r0 = 0;
					var r1 = (x1 > y1) ? x1 : y1;
					grad = sketch.context.createRadialGradient(x0, y0, r0, x1, y1, r1);
				}
				for (var i = 0; i < canvas.bgcolor.el.length; i++) {
					var el = canvas.bgcolor.el[i];
					var p = el.style.left.replace('%', '')/100;
					var c = $(el).css('background-color');
					grad.addColorStop(p, c);
				}
				sketch.context.fillStyle = grad;
			} else {
				sketch.context.fillStyle = sketch.bgcolor;
			}
			sketch.context.fillRect(0, 0, canvas.w, canvas.h);
		}
	}

	function setKeyDownEvent() {
		$(document).unbind('keydown');
		$(document).keydown(function(e){
			keydownEvent(e, 90, canvas.layer.actions, redoList);
			keydownEvent(e, 89, redoList, canvas.layer.actions);
		});

		function keydownEvent(e, keyNum, popList, pushList){
			if(e.which === keyNum && e.ctrlKey && popList.length > 0){
				changeAction(popList, pushList);
				return false;
			}
		}
	}

	function setLayerEvent() {
		$('#addLayerBtn').click(addLayer);
		$('#changeLayerDisplayBtn').click(changeLayerDisplay);
		$('#changeLayerLeftBtn').click(function(){changeLayer(-1)});
		$('#changeLayerRightBtn').click(function(){changeLayer(1)});
		//$('#mergeLayerBtn').click(mergeLayer);
		$('#deleteLayerBtn').click(deleteLayer);
	}

}

function setLiteModeEvent() {
	getPosition = function(e) {
		var offset = canvas.layer.el.offset();
		var offsetX = offset.left;
		var offsetY = offset.top;
		var x = e.pageX - offsetX;
		var y = e.pageY - offsetY;

		return {x: x, y: y};
	}
	
	startDraw = function(ctx, action) {
		var line = action.line;
		ctx.lineJoin = line.join;
		ctx.lineCap = line.cap;
		ctx.lineWidth = line.width;
		ctx.strokeStyle = line.color;
		ctx.beginPath();
		ctx.moveTo(action.events[0].x, action.events[0].y);
	}
}

function setHighModeEvent() {
	addSelectOption('mrkTypeSelect', MARKER_TYPE.SPRAY, 'スプレー');
	addSelectOption('mrkTypeSelect', MARKER_TYPE.SHARP, 'シャープ');
	//addSelectOption('mrkTypeSelect', MARKER_TYPE.CORRECT, '入り抜き補正');
	canvas.tools.marker.draw = function(action) {
		setStyle(action.line);
		switch (action.line.type) {
			case MARKER_TYPE.SPRAY:
				sprayLine(canvas.layer.ctx, action);
				break;
			case MARKER_TYPE.SHARP:
				sharpLine(action.line.imageData);
				break;
			case MARKER_TYPE.CORRECT:
				correctLine(canvas.layer.ctx, action);
			default:
				drawLine(canvas.layer.ctx, action);
		}
	}
	
	previewMarker = function(e){
		var p = getPosition(e);
		canvas.action.events.push({x: p.x, y: p.y});
		clearCanvas(canvas.previewCtx);
		switch (canvas.action.line.type) {
			case MARKER_TYPE.SPRAY:
				sprayLine(canvas.previewCtx, canvas.action);
				break;
			default:
				drawLine(canvas.previewCtx, canvas.action);
		}
	}
	
	stopMarkerPreview = function () {
		stopDraw(canvas.previewCtx);
		canvas.previewStart = '';
		canvas.marker.seed = '';
		switch (canvas.action.line.type) {
			case MARKER_TYPE.SPRAY:
				sprayLine(canvas.layer.ctx, canvas.action);
				break;
			case MARKER_TYPE.SHARP:
				sharp(canvas.previewCtx, canvas.action);
				break;
			case MARKER_TYPE.CORRECT:
				correctLine(canvas.layer.ctx, canvas.action);
				break;
			default:
				drawLine(canvas.layer.ctx, canvas.action);
		}
		clearCanvas(canvas.previewCtx);
		canvas.style = '';
		canvas.layer.actions.push(canvas.action);
		updateLayerPreview();
	}
	
	previewEraser = function(e){
		var p = getPosition(e);
		canvas.action.events.push({x: p.x, y: p.y});
		clearCanvas(canvas.previewCtx);
		canvas.previewCtx.drawImage(canvas.layer.el[0], 0, 0);
		eraseLine(canvas.previewCtx, canvas.action);
		//drawLine(canvas.previewCtx, canvas.action);
	}
}

function crBgcolorSlider() {
	canvas.bgcolor.values = [0, 100];
	var color = sketch.bgcolor;
	canvas.bgcolor.colors = [color, color];
	initSlider();
}

function initCanvas() {
	addLayer();
	canvas.layer = canvas.layers[0];
	canvas.layer.actions = convertActions(sketch.actions);
	canvas.layer.baseImageURL = sketch.baseImageURL;
	canvas.layer.baseImageCache = sketch.baseImageCache;
	canvas.layer.preview.el.addClass('selected');
	sketch.actions = [];
	sketch.baseImageURL = '';
	sketch.baseImageCache = '';
	sketch.clear();
	redraw();
}

function convertActions(actions) {
	var newActions = [];
	for (var i in actions) {
		var action = actions[i];
		action.line = {};
		action.line.type = MARKER_TYPE.NORMAL;
		action.line.width = action.size;
		action.line.color = action.color;
		action.line.cap = LINE_CAP.R;
		action.line.join = LINE_JOIN.R;
		newActions.push(action);
	}
	return newActions;
}

function addLayer() {
	if (canvas.layers.length >= MAX_LAYER) return; 
	crLayer();
}

function crLayer() {
	var num = canvas.layers.length;
	var layer = crCanvasEl('layer' + num, 'layer', num);
	canvas.layers[num] = {
		el: layer,
		ctx: layer[0].getContext('2d'),
		index: num,
		display: true,
		preview: {},
		actions: [],
		baseImageURL: '',
		baseImageCache: ''
	}
	$('#previewCanvas').before(layer);
	setCanvasSize(layer[0], canvas.w, canvas.h, canvas.scale);
	crLayerPreview(num);

	selectLayer(num);
}

function crLayerPreview(num) {
	var layerPreview = crCanvasEl('layerPreview' + num, 'layerPreview', num);
	layerPreview.click(function() {selectLayer(num)});
	canvas.layers[num].preview.el = layerPreview;
	canvas.layers[num].preview.ctx = layerPreview[0].getContext('2d');
	$('#layerPreviewBox').append(layerPreview);
	setCanvasSize(layerPreview[0], canvas.w, canvas.h, PREVIEW_SIZE);
}

function selectLayer(num) {
	log('selectLayer->' + num);
	var layerNum = canvas.layerNum;
	if (num == layerNum) return;
		
	var oldLayer = canvas.layers[layerNum];
	var newLayer = canvas.layers[num];
	oldLayer.preview.el.removeClass('selected');
	newLayer.preview.el.addClass('selected');
	canvas.layerNum = num;
	canvas.layer = newLayer;
	canvas.previewEl.css('z-index', num);

	redraw();
}

function updateLayerPreview() {
	log('updateLayerPreview');
	var layer = canvas.layers[canvas.layerNum];
	var preview = layer.preview;
	var imgData = layer.ctx.getImageData(0, 0, canvas.w, canvas.h);
	preview.ctx.putImageData(imgData, 0, 0);
}
	
function changeLayerDisplay() {
	log('changeLayerDisplay');
	var layer = canvas.layers[canvas.layerNum];
	layer.display = !layer.display;
	if (layer.display) {
		layer.el.removeClass('layerDisplayNone');
		layer.preview.el.removeClass('previewDisplayNone');
	} else {
		layer.el.addClass('layerDisplayNone');
		layer.preview.el.addClass('previewDisplayNone');
	}
}

function changeLayer(move) {
	log('changeLayer-> ' + move);
	var oldNum = canvas.layerNum;
	var newNum = canvas.layerNum + move;
	if (newNum < 0 || newNum >= canvas.layers.length) return;
	canvas.layerNum = newNum;
	var oldLayer = canvas.layer;
	var newLayer = canvas.layers[newNum];
	var tmpLayer = {};
	
	tmpLayer.display = newLayer.display;
	tmpLayer.actions = newLayer.actions;
	tmpLayer.layerClass = newLayer.el[0].className;
	tmpLayer.previewClass = newLayer.preview.el[0].className;
	tmpLayer.baseImageURL = newLayer.baseImageURL;
	tmpLayer.baseImageCache = newLayer.baseImageCache;
	
	newLayer.display = oldLayer.display;
	newLayer.actions = oldLayer.actions;
	newLayer.el[0].className = oldLayer.el[0].className;
	newLayer.preview.el[0].className = oldLayer.preview.el[0].className;
	newLayer.baseImageURL = oldLayer.baseImageURL;
	newLayer.baseImageCache = oldLayer.baseImageCache;
	
	oldLayer.display = tmpLayer.display;
	oldLayer.actions = tmpLayer.actions;
	oldLayer.el[0].className = tmpLayer.layerClass;
	oldLayer.preview.el[0].className = tmpLayer.previewClass;
	oldLayer.baseImageURL = tmpLayer.baseImageURL;
	oldLayer.baseImageCache = tmpLayer.baseImageCache;
	
	selectLayer(oldNum);
	selectLayer(newNum);
}

function deleteLayer() {
	if (canvas.layers.length == 1 || !confirm('選択中のレイヤを削除します。よろしいですか？')) return;
	
	var layerNum = canvas.layerNum;
	var endNum = canvas.layers.length - 1;
	for (var i = 0; i < endNum - layerNum; i++) {
		changeLayer(1);
	}
	selectLayer(layerNum < endNum ? layerNum : endNum - 1);
	
	var removeLayer = canvas.layers[endNum];
	removeLayer.el.remove();
	removeLayer.preview.el.remove();
	canvas.layers.splice(endNum, 1);
}

function redraw(ctx) {
	log('redraw');
	if (!ctx) ctx = canvas.layer.ctx;
	clearCanvas(ctx);
	if (canvas.layer.baseImageURL) {
		if (canvas.layer.baseImageCache) {
			ctx.drawImage(canvas.layer.baseImageCache, 0, 0);
		} else {
			var img = new Image();
			img.src = canvas.layer.baseImageURL;
			img.onload = function() {
				canvas.layer.baseImageCache = img;
				ctx.drawImage(img, 0, 0);
				updateLayerPreview();
			}
		}
	}
	
	$.each(canvas.layer.actions, function() {
		if (this.tool) {
			canvas.tools[this.tool].draw(this);
		}
	});
	updateLayerPreview();
}

function startMarkerPreview(e) {
	canvas.previewStart = Date.now();
	var p = getPosition(e);
	if (canvas.marker.type == MARKER_TYPE.PENCIL) {
		canvas.marker.seed = crSeed(Math.pow(PENCIL_SIZE,2));
	} else if (canvas.marker.type == MARKER_TYPE.PATTERN) {
		//canvas.marker.seed = cr;
	} else if (canvas.marker.type == MARKER_TYPE.SPRAY) {
		canvas.marker.seed = crSeed(Math.pow(canvas.marker.width,2));
	}
	canvas.action = {
		tool: sketch.tool,
		line: clone(canvas.marker),
		events: [{x: p.x, y: p.y}]
	};
	setStyle(canvas.action.line);
	startDraw(canvas.previewCtx, canvas.action);
}

function stopMarkerPreview() {
	stopDraw(canvas.previewCtx);
	canvas.previewStart = '';
	canvas.marker.seed = '';
	drawLine(canvas.layer.ctx, canvas.action);
	clearCanvas(canvas.previewCtx);
	canvas.style = '';
	canvas.layer.actions.push(canvas.action);
	updateLayerPreview();
}

function previewMarker(e) {
	var p = getPosition(e);
	canvas.action.events.push({x: p.x, y: p.y});
	canvas.previewCtx.lineTo(p.x, p.y);
	stopDraw(canvas.previewCtx);
	var action = {
		tool: canvas.action.tool,
		line: canvas.action.line,
		events: [{x: p.x, y: p.y}]
	}
	startDraw(canvas.previewCtx, action);
}

function startDraw(ctx, action) {
	var line = action.line;
	ctx.lineJoin = line.join;
	ctx.lineCap = line.cap;
	ctx.lineWidth = line.width;
	ctx.strokeStyle = canvas.style;
	ctx.beginPath();
	ctx.moveTo(action.events[0].x, action.events[0].y);
}

function stopDraw(ctx) {
	ctx.stroke();
}

function drawLine(ctx, action) {
	startDraw(ctx, action);
	for (var i in action.events) {
		var e = action.events[i];
		ctx.lineTo(e.x, e.y);
	}
	stopDraw(ctx);
}

function sprayLine(ctx, action) {
	var events = action.events;
	var w = action.line.width/2;
	var a = clone(action);
	for (var i in events) {
		var e = events[i];
		var e0 = {x: w, y: w}
		var e1 = {x: w, y: w+1}
		a.events = [e0, e1];
		ctx.translate(e.x - w, e.y - w);
		drawLine(context, a);
		ctx.translate(w-e.x, w-e.y);
	}
}

function sharp(ctx, action) {
	var th = 0.6;
	var rgba = splitRGBA(action.line.color);
	var imageData = ctx.getImageData(0, 0, canvas.w, canvas.h);
	var data = imageData.data;

	for (var x = 0; x	< canvas.w; x++) {
		for (var y = 0; y < canvas.h; y++) {
			var i = (x + y * canvas.w) * 4;
			var a = data[i + 3];
			if (a >= rgba.a * 255 * th) {
				data[i + 3] = rgba.a * 255;
			} else {
				data[i + 3] = 0;
			}
		}
	}
	imageData.data = data;
	action.line.imageData = imageData;
	sharpLine(imageData);
}

function sharpLine(imageData) {
		clearCanvas(canvas.tmpCtx);
		canvas.tmpCtx.putImageData(imageData, 0, 0);
		canvas.layer.ctx.drawImage(canvas.tmpEl[0], 0, 0);
}

function correctLine(ctx, action) {
	var inLen =  $('#mrkInCorrectCheck').is(':checked') ? $('#mrkInCorrectLengthSelect').val() : 0;
	var outLen = $('#mrkOutCorrectCheck').is(':checked') ? $('#mrkOutCorrectLengthSelect').val() : 0;
	
	var lim = action.line.width;
	var r = action.line.width/2;
	var events = action.events;
	var p0 = [];
	var p1 = [];
	var pi2 = Math.PI/2;
	var e0 = events[0];
	var j = 0;
	for (var i = 0; i < events.length-1; i++) {
		//var e0 = events[i];
		var e1 = events[i+1];
		
		var dx = e1.x - e0.x;
		var dy = e1.y - e0.y;
		var rad = Math.atan2(dy, dx);
		var dr = Math.pow(dx, 2) + Math.pow(dy, 2);
		if (dr > lim && inLen > j) {
			var l = Math.log(j/inLen);
			p0.push({x: Math.floor(e0.x + r*l*Math.cos(rad+pi2)), y: Math.floor(e0.y + r*l*Math.sin(rad+pi2))});
			p1.unshift({x: Math.floor(e0.x + r*l*Math.cos(rad-pi2)), y: Math.floor(e0.y + r*l*Math.sin(rad-pi2))});
			e0 = e1;
			j++;
		} 
		//drawArrow(ctx, e0.x, e0.y, dr, rad);
	}
	
	action.events = p0.concat(p1);
	drawCorrectLine(ctx, action);
}

function drawCorrectLine(ctx, action) {
	var events = action.events;
	var e0 = events[0];
	ctx.lineWidth = 1;
	ctx.fillStyle = action.line.color;
	ctx.beginPath();
	ctx.moveTo(e0.x, e0.y);
	for (var i in events) {
		var e = events[i];
		ctx.lineTo(e.x, e.y);
	}
	ctx.fill();
}

function drawArrow(ctx, x, y, r, rad) {
	ctx.lineWidth = 1;
	ctx.strokeStyle = 'red';
	ctx.beginPath();
	ctx.moveTo(x, y);
	ctx.lineTo(x + r * Math.cos(rad), y + r * Math.sin(rad));
	ctx.lineTo(x + r * 0.8 * Math.cos(rad+0.2), y + r * 0.8 * Math.sin(rad+0.2));
	ctx.lineTo(x + r * 0.8 * Math.cos(rad-0.2), y + r * 0.8 * Math.sin(rad-0.2));
	ctx.lineTo(x + r * Math.cos(rad), y + r * Math.sin(rad));
	ctx.stroke();
}

function startPathPreview(e) {
	canvas.previewStart = Date.now();
	var p = getPosition(e);
	
	var targetPoint = checkTarget(p);
	
	switch (canvas.path.type) {
		case 'line':
			break;
		case 'spline':
			break;
		case 'quadratic':
			break;
		case 'cubic':
			break;
	}
	canvas.action = {
		tool: sketch.tool,
		path: clone(canvas.path),
		events: [{x: p.x, y: p.y}],
		controls: []
	};
	setStyle(canvas.action.line);
	startDraw(canvas.previewCtx, canvas.action);
	
	function checkTarget(p) {
		var result = {
			type: POINT_TYPE.NONE
		}
		for (var i in canvas.action.controlls) {
			var c = canvas.action.points[i];
			var r = Math.pow(p.x - c.x, 2) + Math.pow(p.y - c.y, 2);
			if (r < MOVE_POINT_R) {
				result.type = POINT_TYPE.CONTROL;
				result.index = i;
			}
		}
		for (var i in canvas.action.events) {
			var e = canvas.action.points[i];
			var r = Math.pow(p.x - e.x, 2) + Math.pow(p.y - e.y, 2);
			if (r < MOVE_POINT_R) {
				result.type = POINT_TYPE.ANCHOR;
				result.index = i;
			}
		}
	}
	
	return result;
}

function stopPathPreview() {
	stopDraw(canvas.previewCtx);
	canvas.previewStart = '';
	canvas.marker.seed = '';
	drawLine(canvas.layer.ctx, canvas.action);
	clearCanvas(canvas.previewCtx);
	canvas.style = '';
	canvas.layer.actions.push(canvas.action);
	updateLayerPreview();
}

function previewPath(e) {
	var p = getPosition(e);
	canvas.action.events.push({x: p.x, y: p.y});
	canvas.previewCtx.lineTo(p.x, p.y);
	stopDraw(canvas.previewCtx);
	var action = {
		tool: canvas.action.tool,
		line: canvas.action.line,
		events: [{x: p.x, y: p.y}]
	}
	startDraw(canvas.previewCtx, action);
}

function startFigurePreview(e) {
	canvas.previewStart = Date.now();
	var p = getPosition(e);
	canvas.action = {
		tool: sketch.tool,
		color: canvas.marker.color,
		width: canvas.marker.width,
		type: $('#figureTypeSelect').val(),
		events: [{x: p.x, y: p.y}, {x: p.x, y: p.y}]
	};
}

function stopFigurePreview() {
	canvas.previewStart = '';
	drawFigure(canvas.layer.ctx, canvas.action);
	clearCanvas(canvas.previewCtx);
	canvas.layer.actions.push(canvas.action);
	updateLayerPreview();
}

function previewFigure(e) {
	var p = getPosition(e);
	canvas.action.events[1] = p;
	clearCanvas(canvas.previewCtx);
	drawFigure(canvas.previewCtx, canvas.action);
}

function drawFigure(ctx, action) {
	var e0 = action.events[0];
	var e1 = action.events[1];

	ctx.beginPath();
	ctx.lineJoin = LINE_JOIN.B;
	ctx.lineCap = LINE_CAP.B;
	ctx.lineWidth = action.width;
	switch (action.type) {
		case 'line':
			ctx.moveTo(e0.x, e0.y);
			ctx.lineTo(e1.x, e1.y);
			ctx.strokeStyle = action.color;
			ctx.stroke();
			break;
		case 'strokeRect':
			ctx.strokeStyle = action.color;
			ctx.strokeRect(e0.x, e0.y, e1.x-e0.x, e1.y-e0.y);
			break;
		case 'fillRect':
			ctx.fillStyle = action.color;
			ctx.fillRect(e0.x, e0.y, e1.x-e0.x, e1.y-e0.y);
			break;
		case 'strokeCircle':
			var dx = Math.abs(e0.x-e1.x)/2;
			var dy = Math.abs(e0.y-e1.y)/2;
			var r = Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));
			//var l = dx > dy ? dx : dy;
			//ctx.save();
			//ctx.scale(dx/l, dy/l);
			
			ctx.strokeStyle = action.color;
			ctx.arc((e0.x + e1.x)/2, (e0.y + e1.y)/2, r, 0, Math.PI*2, false);
			ctx.stroke();
			//ctx.restore();
			break;
		case 'fillCircle':
			var dx = Math.abs(e0.x-e1.x)/2;
			var dy = Math.abs(e0.y-e1.y)/2;
			var r = Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));
			ctx.fillStyle = action.color;
			ctx.arc((e0.x + e1.x)/2, (e0.y + e1.y)/2, r, 0, Math.PI*2, false);
			ctx.fill();
			break;
	}
}

function crSeed(digits) {
	var seed = '';
	while (seed.length < digits) {
		seed += Math.random().toString().slice(3);
	}
	return seed;
}

function setStyle(line) {
	if (line.type == MARKER_TYPE.PENCIL || line.type == MARKER_TYPE.SPRAY || line.type == MARKER_TYPE.PATTERN) {
		canvas.style = crPattern(line);
	} else {
		canvas.style = line.color;
	}
}

function crPattern(line) {
	switch (line.type) {
		case MARKER_TYPE.PENCIL:
			var p = PENCIL_SIZE;
			setCanvasSize(canvas.patEl[0], p, p, 1);
			var imageData = canvas.patCtx.createImageData(p, p);
			var data = imageData.data;
			var rgba = splitRGBA(line.color);
			for (var x = 0; x	< p; x++) {
				for (var y = 0; y < p; y++) {
					var i = (x + y * p) * 4;
                    var a = line.seed[i/4]*1.5/10;
					data[i + 0] = rgba.r;
					data[i + 1] = rgba.g;
					data[i + 2] = rgba.b;
					data[i + 3] = rgba.a * 255 * a;
				}
			}
			imageData.data = data;
			canvas.patCtx.putImageData(imageData, 0, 0);
			break;
		case MARKER_TYPE.SPRAY:
			var p = line.width;
			var ph = p/2;
			var r2 = Math.pow(ph, 2);
			setCanvasSize(canvas.patEl[0], p, p, PENCIL_SIZE/p);
			var imageData = canvas.patCtx.createImageData(p, p);
			var data = imageData.data;
			var rgba = splitRGBA(line.color);
			for (var x = 0; x	< p; x++) {
				for (var y = 0; y < p; y++) {
					var i = (x + y * p) * 4;
					var a2 = Math.pow(ph - x, 2);
					var b2 = Math.pow(ph - y, 2);
					data[i + 0] = rgba.r;
					data[i + 1] = rgba.g;
					data[i + 2] = rgba.b;
					data[i + 3] = rgba.a * 255 * line.seed[i/4]/40 * (1 - (a2 + b2) / r2);
				}
			}
			imageData.data = data;
			canvas.patCtx.putImageData(imageData, 0, 0);
			break;
		case MARKER_TYPE.PATTERN:
			var ctx = canvas.patCtx;
			switch (line.pat.type) {
				case PAT_TYPE.DOT:
					var r = parseFloat(line.pat.size);
					var hs = parseFloat(line.pat.hspace);
					var vs = parseFloat(line.pat.vspace);
					var x = hs + r;
					var y = vs + r;
					setCanvasSize(canvas.patEl[0], x + r, y + r, 0);

					ctx.beginPath();
					ctx.arc(x, y, r, 0, 2 * Math.PI, false);
					ctx.fillStyle = line.color;
					ctx.fill();
					break;
				case PAT_TYPE.STAR:
					var r = parseFloat(line.pat.size);
					var p = parseInt(line.pat.point);
					var m = parseFloat(line.pat.round);
					var hs = parseFloat(line.pat.hspace);
					var vs = parseFloat(line.pat.vspace);
					var x = hs + r;
					var y = vs + r;
					setCanvasSize(canvas.patEl[0], x + r, y + r, 0);
					
					star(ctx, line.color, x, y, r, p, m);
					break;
				case PAT_TYPE.LINE:
					var hw = parseFloat(line.pat.lineHSize);
					var vw = parseFloat(line.pat.lineVSize);
					var hs = parseFloat(line.pat.hspace);
					var vs = parseFloat(line.pat.vspace);
					var x = hs + hw/2;
					var y = vs + vw/2;
					var w = hs + hw;
					var h = vs + vw;
					setCanvasSize(canvas.patEl[0], w, h, 1);
					
					if (hw) {
						ctx.beginPath();
						ctx.moveTo(0, y);
						ctx.lineTo(w, y);
						ctx.lineWidth = hw;
						ctx.strokeStyle = line.color;
						ctx.stroke();
					}
					if (vw) {
						ctx.beginPath();
						ctx.moveTo(x, 0);
						ctx.lineTo(x, h);
						ctx.lineWidth = vw;
						ctx.strokeStyle = line.color;
						ctx.stroke();
						break;
					}
			}
			break;
	}
	
	return canvas.patCtx.createPattern(canvas.patEl[0], 'repeat');
}

function startFill(e) {
	var p = getPosition(e);

	var action = {
		tool: sketch.tool,
			x: Math.floor(p.x),
			y: Math.floor(p.y),
			color: canvas.marker.color,
			alphaCheck: $('#fillAlphaCheck').is(':checked')
	};
	canvas.layer.actions.push(action);
	fill(action);
}

var seeds;
var getColor;
var fillCanvas;
function fill(action) {
	fillCanvas = canvas.layer.ctx.getImageData(0, 0, canvas.layer.el[0].width, canvas.layer.el[0].height);
	
	getColor = getRGBA;
	fillColor = fillRGBA;
	
	var rgba = action.color.match(/(\d|\.)+/g);
	var alpha;
    if(rgba[3] == undefined){
        alpha = 255;
    }else{
        alpha = parseInt(Number(rgba[3] * 255));
    }
	var color = ((Number(rgba[0]) << 24) + (Number(rgba[1]) << 16) + (Number(rgba[2]) << 8) + alpha)>>>0;
	var target = getColor(action.x, action.y);
	seeds = [{
		x: action.x,
		y: action.y
	}];
	
	while (seeds.length > 0) {
		var seed = seeds.shift();
		paint(seed.x, seed.y, color, target);
	}
		
	canvas.layer.ctx.putImageData(fillCanvas, 0, 0);
	updateLayerPreview();
}

function paint(x, y, c, target) {
	var color = getColor(x, y);
	if (color == c) return;
	
	fillColor(x, y, c);
	
	var rX = x + 1;
	while (rX < canvas.tmpEl[0].width) {
		color = getColor(rX, y);
		if (color == target) {
			fillColor(rX, y, c);
		} else {
			//fillColor(rX, y, c);
			break;
		}
		rX++;
	}
	
	var lX = x - 1;
	while (lX >= 0) {
		color = getColor(lX, y);
		if (color == target) {
			fillColor(lX, y, c);
		} else {
			//fillColor(rX, y, c);
			break;
		}
		lX--;
	}

	if (y-1 >= 0) scanSeed(lX, rX, y-1, target);
	if (y+1 <= canvas.tmpEl[0].height) scanSeed(lX, rX, y+1, target);
}

function scanSeed(lX, rX, y, target) {
	var seed = false;
	
	for (var x = lX+1; x < rX; x++) {
		var color = getColor(x, y);
		if (color == target) {
			seed = true;
		} else if (seed) {
			seeds.push({x: x-1, y: y});
			seed = false;
		}
	}
	
	if (seed) {
		seeds.push({x: rX-1, y: y});
		seed = false;
	}
}

function getRGBA(x, y){
	var img = fillCanvas.data;
	var w = fillCanvas.width;
	var h = fillCanvas.height;
	var p = ((w * y) + x) * 4;
	return ((img[p] << 24) + (img[p+1] << 16) + (img[p+2] << 8) + img[p+3])>>>0;
}

function getRGB(x, y){
	var img = fillCanvas.data;
	var w = fillCanvas.width;
	var h = fillCanvas.height;
	var p = ((w * y) + x) * 4;
	return ((img[p] << 24) + (img[p+1] << 16) + (img[p+2] << 8))>>>0;
}

function fillRGBA(x, y, color) {
	var img = fillCanvas.data;
	var w = fillCanvas.width;
	var h = fillCanvas.height;
	var p = ((w * y) + x) * 4;
	img[p]   = (color & 0xFF000000) >>> 24;
	img[p+1] = (color & 0xFF0000) >> 16;
	img[p+2] = (color & 0xFF00) >> 8;
	img[p+3] = color & 0xFF;
}

function fillRGB(x, y, color) {
	var img = fillCanvas.data;
	var w = fillCanvas.width;
	var h = fillCanvas.height;
	var p = ((w * y) + x) * 4;
	img[p]   = (color & 0xFF0000) >> 16;
	img[p+1] = (color & 0xFF00) >> 8;
	img[p+2] = color & 0xFF;
	img[p+3] = 0xFF;
}

function startEffectPreview(e) {
	canvas.previewStart = Date.now();
	var p = getPosition(e);
	var s = canvas.effect.size/2;
	canvas.action = {
		tool: sketch.tool,
		effect: clone(canvas.effect),
		events: []
	}
	
	clearCanvas(canvas.tmpCtx);
}

function stopEffectPreview() {
	canvas.previewStart = '';
	canvas.layer.actions.push(canvas.action);
	updateLayerPreview();
}

function previewEffect(e) {
	var p = getPosition(e);
	var s = canvas.action.effect.size/2;
	var e = {x: parseInt(p.x - s), y: parseInt(p.y - s)};
	canvas.action.events.push(e);
	var a = clone(canvas.action);
	a.events = [e];
	drawEffect(canvas.layer.ctx, a);
}

function drawEffect(ctx, action) {
	switch (action.effect.type) {
		case EFFECT_TYPE.BLUR:
			var events = action.events;
			var s = parseInt(action.effect.size)+2;
			var sh = s/2
			var sh2 = sh*sh;
			var s4 = s*4;
			for (var i in events) {
				var e = events[i];
				var srcImgData = ctx.getImageData(e.x-1, e.y-1, s, s);
				var src = srcImgData.data;
				var dstImgData = ctx.createImageData(s, s);
				var dst = dstImgData.data;
                var count = [];
                for (var i = 0; i < s*s; i++) count[i] = 9;
                for (var x = 0; x  < s; x++) {
                  for (var y = 0; y < s; y++) {
                    var i = (x + y * s) * 4;
                    var c = i/4;
                    var p = c - s;
                    var n = c + s;
                    if (!src[i+3]) {
                      src[i+0] = 0; src[i+1] = 0; src[i+2] = 0;
                      count[p-1]--; count[p-0]--; count[p+1]--;
                      count[c-1]--; count[c+1]--;
                      count[n-1]--; count[n-0]--; count[n+1]--;
                    }
                  }
                }
                for (var x = 1; x  < s-1; x++) {
                  for (var y = 1; y < s-1; y++) {
                    var i = (x + y * s) * 4;
                    var p = i - s4;
                    var n = i + s4;
                    dst[i+0] = (src[p-4] + src[p+0] + src[p+4] + src[i-4] + src [i+4] + src[n-4] + src[n+0] + src [n+4] + src[i+0])/count[i/4];
                    dst[i+1] = (src[p-3] + src[p+1] + src[p+5] + src[i-3] + src [i+5] + src[n-3] + src[n+1] + src [n+5] + src[i+1])/count[i/4];
                    dst[i+2] = (src[p-2] + src[p+2] + src[p+6] + src[i-2] + src [i+6] + src[n-2] + src[n+2] + src [n+6] + src[i+2])/count[i/4];
                    dst[i+3] = (src[p-1] + src[p+3] + src[p+7] + src[i-1] + src [i+7] + src[n-1] + src[n+3] + src [n+7] + src[i+3])/9;
                  }
                }
				dstImgData.data = dst;
				ctx.putImageData(dstImgData, e.x-1, e.y-1, 1, 1, s-2, s-2);
			}
			break;
	}
}

function showEffectArea(ctx, e, size) {
	var p = getPosition(e);
	var s = size/2
	ctx.clearRect(0, 0, canvas.w, canvas.h);
	ctx.lineWidth = 1;
	ctx.strokeStyle = 'rgb(0, 0, 0)'
	ctx.strokeRect(parseInt(p.x - s), parseInt(p.y - s), size, size);
}

function crClearImageData() {
	var s = 20;
	var imageData = canvas.tmpCtx.createImageData(s, s);
	var data = imageData.data;
	for (var x; x < s; x++) {
		for (var y; y < s; y++) {
			var i = (x + y * s) * 4;
			data[i+0] = 255;
			data[i+1] = 255;
			data[i+2] = 255;
			data[i+3] = 0;
		}
	}
	imageData.data = data;
	clearImageData = imageData;
}

function startEraserPreview(e) {
	canvas.previewStart = Date.now();
	var p = getPosition(e);
	canvas.action = {
		tool: sketch.tool,
		line: clone(canvas.eraser),
		events: [{x: p.x, y: p.y}]
	};

	clearCanvas(canvas.previewCtx);
	canvas.previewCtx.drawImage(canvas.layer.el[0], 0, 0);
	canvas.layer.el.css('visibility', 'hidden');
	setStyle(canvas.action.line);
	startDraw(canvas.previewCtx, canvas.action);
}

function stopEraserPreview() {
	stopDraw(canvas.previewCtx);
	canvas.layer.el.css('visibility', '');
	canvas.previewStart = '';
	clearCanvas(canvas.previewCtx);
	canvas.layer.actions.push(canvas.action);
	updateLayerPreview();
}

function previewEraser(e) {
	var p = getPosition(e);
	canvas.action.events.push({x: p.x, y: p.y});
	eraseLine(canvas.previewCtx, canvas.action);
}

function eraseLine(ctx, action) {
	canvas.comp = ctx.globalCompositeOperation;
	ctx.globalCompositeOperation = "destination-out";
	drawLine(ctx, action, action.line.color);
	ctx.globalCompositeOperation = canvas.comp;
}

function mergeCanvas(ctx, type) {
	clearCanvas(ctx);
	if (type == MERGE_TYPE.ALL_LAYER_BG || type == MERGE_TYPE.SELECT_LAYER_BG) ctx.drawImage(sketch.el, 0, 0);
	if (type == MERGE_TYPE.SELECT_LAYER || type == MERGE_TYPE.SELECT_LAYER_BG) {
		ctx.drawImage(canvas.layers[canvas.layerNum].el[0], 0, 0);
	} else {
		mergeLayer(ctx);
	}
}

function mergeLayer(ctx) {
	for (var i in canvas.layers) {
		var layer = canvas.layers[i];
		if (layer.display) ctx.drawImage(layer.el[0], 0, 0);
	}
}

function clear() {
	clearCanvas(canvas.layer.ctx);
	canvas.layer.actions = [];
	canvas.layer.baseImageURL = "";
	canvas.layer.baseImageCache = "";
	redraw();
}

function clearCanvas(ctx) {
	ctx.clearRect(0, 0, canvas.w, canvas.h);
}

function getPosition(e) {
	var offset = canvas.layer.el.offset();
	var offsetX = offset.left;
	var offsetY = offset.top;
	var x = (e.pageX - offsetX) / canvas.scale;
	var y = (e.pageY - offsetY) / canvas.scale;

	return {x: x, y: y};
}

function changeCanvasSize() {
	var size = getCanvasSize();
	canvas.w = size.w;
	canvas.h = size.h;
	canvas.scale = $('#scaleSelect').val() || 1;

	setCanvasSize(sketch.el, size.w, size.h, canvas.scale);
	setCanvasSize(canvas.inputEl[0], size.w, size.h, canvas.scale);
	setCanvasSize(canvas.tmpEl[0], size.w, size.h, canvas.scale);
	setCanvasSize(canvas.previewEl[0], size.w, size.h, canvas.scale);

	var layerNum = canvas.layerNum;
	for (var i in canvas.layers) {
		var layer = canvas.layers[i];
		setCanvasSize(layer.el[0], size.w, size.h, canvas.scale);
		setCanvasSize(layer.preview.el[0], size.w, size.h, PREVIEW_SIZE);
		selectLayer(i);
	}
	selectLayer(layerNum);
	redraw();
	
	sketch.clear();
}

function getCanvasSize() {
	var size = $('#canvasSize').val().split("x");
	return {w: size[0], h: size[1]}
}

function setCanvasSize(el, w, h, scale) {
	el.width = w;
	el.height = h;
	el.style.width = w * scale;
	el.style.height = h * scale;
}

function changeBgColor(color) {
	if (canvas.bgcolor.grad) canvas.bgcolor.select.css('background-color', color);
	sketch.clear();
}

function initSlider() {
	var slider = $('#bgcolorSlider');
	slider.remove();
	slider = $('<div>', {id: 'bgcolorSlider'});
	$('#psize').after(slider);
	slider.slider({
		min: 0,
		max: 100,
		values: canvas.bgcolor.values,
		slide: function(ev, ui) {
			sketch.clear();
		},
		start: function(ev, ui) {
			var el = $(ui.handle);
			$('#bgcolorPicker').spectrum('set', el.css('background-color'));
			canvas.bgcolor.select = el;
			sketch.clear();
		}
	});
	slider.css({margin: '10px'});
	canvas.bgcolor.select = $(slider.children()[0]);	
	canvas.bgcolor.el = slider.children();
	for (var i = 0; i < canvas.bgcolor.el.length; i++) {
		var el = canvas.bgcolor.el[i];
		$(el).css('background', canvas.bgcolor.colors[i]);
	}
	sketch.clear();
}

function addGrad() {
	var len = canvas.bgcolor.values.length;
	if (len > MAX_BGCOLOR_GRAD) return;

	canvas.bgcolor.values = [];
	canvas.bgcolor.colors = [];
	var slider = $('#bgcolorSlider');
	for (var i = 0; i < len; i++) {
		var el = canvas.bgcolor.el[i];
		canvas.bgcolor.values.push(Math.floor(el.style.left.replace('%', '')));
		canvas.bgcolor.colors.push($(el).css('background-color'));
	}
	var addValue = (canvas.bgcolor.values[len-1] + canvas.bgcolor.values[len-2])/2;
	var addColor = canvas.bgcolor.colors[len-1];
	canvas.bgcolor.values.splice(len-1, 0, addValue);
	canvas.bgcolor.colors.splice(len-1, 0, addColor);
	initSlider();
}

function deleteGrad() {
	var index = canvas.bgcolor.el.index(canvas.bgcolor.select);
	var len = canvas.bgcolor.values.length;
	if (index == 0 || index == len-1) return;
	
	canvas.bgcolor.values = [];
	canvas.bgcolor.colors = [];
	var slider = $('#bgcolorSlider');
	for (var i = 0; i < len; i++) {
		if (i != index) {
			var el = canvas.bgcolor.el[i];
			canvas.bgcolor.values.push(Math.floor(el.style.left.replace('%', '')));
			canvas.bgcolor.colors.push($(el).css('background-color'));
		}
	}
	initSlider();
}

function inputText(e) {
	//$('#mojiForm').remove();
	var mojiForm = $('<div>', {id: 'mojiForm', title: '	文字を入力してください'});
	mojiForm.append($('<textarea>', {id: 'mojiInput', rows: 3, cols: 30}).addClass('mojiInput'));
	mojiForm.dialog({
		resizable: true,
		width: 350,
		height: 220,
		modal: true,
		buttons: {
			OK: function() {
				makeText(e);
				$( this ).dialog( "destroy" );
			},
			CANCEL: function() {
				$( this ).dialog( "destroy" );
			}
		}
	});
}

function makeText(e) {
	var pos = getPosition(e);
	canvas.action = {
		tool: 'moji',
		size: $('#mojiSizeSelect').val(),
		color: $('#mojiColorPicker').spectrum('get').toRgbString(),
		events: [{x: pos.x, y:pos.y}],
		options: {
			text: $('#mojiInput').val(),
			font: $('#mojiFontSelect').val(),
			vertical: $('#mojiVerticalCheck').is(':checked') ? 'v' : 'h',
			bold: $('#mojiBoldCheck').is(':checked') ? ' bold ' : ' ',
			italic: $('#mojiItalicCheck').is(':checked') ? ' italic ' : ' ',
			edge: $('#mojiEdgeCheck').is(':checked'),
			width: canvas.marker.width,
			color: canvas.marker.color
		}
	}
	drawText(canvas.layer.ctx, canvas.action);
	canvas.layer.actions.push(canvas.action);
}

function drawText(ctx, action) {
	var drawTextFunc;
	if (action.options.edge) {
		drawTextFunc = strokeText;
	} else {
		drawTextFunc = fillText;
	}
	
	var lines = action.options.text.split('\n');
	var size = measureTextAreaSize(lines, action);
	var h = ctx.measureText("あ").width;

	ctx.textBaseline = 'top';
	ctx.fillStyle = action.color;
	ctx.font = action.options.bold + action.options.italic + action.size + 'px ' + action.options.font;
	ctx.translate(action.events[0].x + size.w/2, action.events[0].y + size.h/2);
	var h = ctx.measureText("あ").width;
	jQuery.each(lines, function(i, line) {
		if(action.options.vertical == 'h'){
			ctx.textAlign = 'left'
			drawTextFunc(line, -size.w/2, -size.h/2 + h*i);
		}else{
			jQuery.each(line, function(j, char){
				ctx.textAlign = 'center';
				drawTextFunc(char, -size.w/2 - h*i, -size.h/2 + h*j);
			});
		}
	});
	ctx.setTransform(1,0,0,1,0,0);
	updateLayerPreview();
	
	function strokeText(text, x, y) {
		ctx.strokeStyle = action.options.color;
		ctx.lineWidth = action.options.width;
		ctx.fillText(text, x, y);
		ctx.strokeText(text, x, y);
	}
	
	function fillText(text, x, y) {
		ctx.fillText(text, x, y);
	}
}

function measureTextAreaSize(lines, action) {
	var ctx = canvas.tmpCtx;
	var h = ctx.measureText("あ").width;
	var maxW = 0;
	var maxH = 0;
	jQuery.each(lines, function(i, line) {
		if(!action.options.vertical){
			var w = ctx.measureText(line).width;
			if(w > maxW){maxW = w;}
			maxH = h * (i+1);
		}else{
			jQuery.each(line, function(j, char){
				if(h * (j+1) > maxH){maxH = h * (j+1)};
			});
			maxW = h * (i+1);
		}
	});

	return {w: maxW, h: maxH}
}

function star(ctx, color, x, y, r, p, m) {
	ctx.save();
	ctx.beginPath();
	ctx.translate(x, y);
	ctx.moveTo(0, 0 - r);
	for (var i = 0; i < p; i++) {
		ctx.rotate(Math.PI / p);
		ctx.lineTo(0, 0 - (r*m));
		ctx.rotate(Math.PI / p);
		ctx.lineTo(0, 0 - r);
	}
	ctx.fillStyle = color;
	ctx.fill();
	ctx.restore();
}

function setImageSmooting(ctx, state) {
	ctx.mozImageSmoothingEnabled = state;
	ctx.oImageSmoothingEnabled = state;
	ctx.webkitImageSmoothingEnabled = state;
	ctx.imageSmoothingEnabled = state;
}

function crSelectEl(id, label, valueList, textList, selected) {
	var labelEl = crLabelEl(id, label);
	var selectEl = $('<select>', {id: id});
	for(var i in valueList){
		$('<option>', {
			value: valueList[i],
			text: textList[i],
			selected: (i == selected) ? true : false,
		}).appendTo(selectEl);	
	}
	
	return labelEl.append(selectEl);
}

function crCheckboxEl(id, label, checked) {
	return $('<input>', {id: id, type: 'checkbox', checked: checked}).after(crLabelEl(id, label));
}

function crCanvasEl(id, className, zIndex) {
	return $('<canvas>').attr({
		id: id,
		class: className,
		width: canvas.w,
		height: canvas.h,
		style: 'z-index: ' + zIndex + ';'
	});
}

function crLabelEl(id, text) {
	return $('<label>', {for: id, text: text});
}

function br() {
	return $('<br>');
}

function addSelectOption(id, value, text) {
	$('#' + id).append($('<option>', {value: value, text: text}));
}

function changeAction(popList, pushList){
	pushList.push(popList.pop());
	redraw();
}

function loadIcons() {
	for(var key in icons){
		if (icons[key].file) {
			var img = new Image();
			img.id = key;
			img.src = icons[key].file;
			icons[key].img = $(img);
		}
	}
}

function saveStorage(key, item, json) {
	if (json) {
		localStorage.setItem(key, JSON.stringify(item));
	} else {
		localStorage.setItem(key, item);
	}
}

function loadStorage(key, json) {
	var val = localStorage.getItem(key);
	if (json) {
		return val ? JSON.parse(val) : val;
	} else {
		return val;
	}
}

function clone(obj) {
	return $.extend(true, {}, obj);
}

function splitRGBA(color) {
	var reg = /(\d+\.?\d*)/g;
	var split = color.match(reg);
	return {r: split[0], g: split[1], b:split[2], a:split[3] || '1.0'}
}

function log(msg) {
	console.log(msg);
}

if (!Date.now) {
	Date.now = function now() {
	return new Date().getTime();
	};
}