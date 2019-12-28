(function() {

let PC = ($('#portalGlobalHeader').length == 0) ? true : false;

let MODE = {L: 0, M: 1, H: 2};

this.MODE = function (){return MODE};


let MODE_NAME = {L: '軽量', M: '通常', H: '高機能'};
let LS_KEY_PREFIX = 'o2oEXLite_';
let LS_KEY = {
	VERSION: LS_KEY_PREFIX + 'version',
	MODE: LS_KEY_PREFIX + 'mode',
	FONT: LS_KEY_PREFIX + 'font',
	PICT_MODE: LS_KEY_PREFIX + 'pictMode',
	CORRECT_LV: LS_KEY_PREFIX + 'correctLv',
	GUIDE: LS_KEY_PREFIX + 'guide'
}
let DEF_VERSION = '0.0.0';
let DEF_MODE = MODE.M;
let DEF_FONT = [];
let DEF_FONT_NUM = 5;
let DEF_PICT_MODE = true;
let DEF_CORRECT_LV = 0;
let DEF_GUIDE = true;
let TOOL = {
	MARKER: 'marker',
	CUSTOM: 'custom',
	PATH: 'path',
	FIGURE: 'figure',
	EFFECT: 'effect',
	SPOIT: 'spoit',
	ERASER: 'eraser',
	FILL: 'fill',
	MOJI: 'moji',
	SEL: 'sel',
	OBJECT: 'object',
	FILTER: 'filter',
	PICT: 'pict',
	SETTINGS: 'settings'
}
let MARKER_TYPE = {
	NORMAL: '',
	PENCIL: 'pencil',
	SPRAY: 'spray',
	SHARP: 'sharp',
	PATTERN: 'pattern',
	CORRECT: 'correct'
}
let EFFECT_TYPE = {
	BLUR: 'blur'
}
let PAT_TYPE = {
	DOT: 'dot',
	STAR: 'star',
	LINE: 'line'
}
let POINT_TYPE = {
	NONE: 0,
	ANCHOR: 1,
	CONTROL: 2
}
let PATH_STATE = {
	INIT: 0,
	NONE: 1,
	MOVE: 2,
	ADD: 3,
	DRAW: 4
}
let COMP = {
	SA: 'source-atop',
	SI: 'source-in',
	SO: 'source-out',
	SV: 'source-over',
	DA: 'destination-atop',
	DI: 'destination-in',
	DO: 'destination-out',
	DV: 'destination-over',
	LI: 'lighter',
	DK: 'darker',
	CO: 'copy',
	XO: 'xor',
	DEF: 'source-over'
}
let BLEND_MODE = {
	'normal': '通常',
	'multiply': '乗算',
	'screen': 'スクリーン',
	'overlay': 'オーバーレイ',
	'darken': '比較（暗）',
	'lighten': '比較（明）',
	'color-dodge': '覆い焼き（カラー）',
	'color-burn': '焼き込み（カラー）',
	'hard-light': 'ハードライト',
	'soft-light': 'ソフトライト',
	'difference': '差の絶対値',
	'exclusion': '除外',
	'hue': '色相',
	'saturation': '彩度',
	'color': 'カラー',
	'luminosity': '光度',
}
let LINE_CAP = {B: 'butt', R: 'round', S: 'square'};
let LINE_JOIN = {M: 'miter', R: 'round', B: 'bavel'};
let MERGE_TYPE = {
	ALL_LAYER_BG: 0,
	ALL_LAYER: 1,
	SELECT_LAYER_BG: 2,
	SELECT_LAYER: 3
}
let PREVIEW_SIZE = 0.25;
let PENCIL_SIZE = 20;
let MAX_LAYER = PC ? 12 : 4;
let MAX_BGCOLOR_GRAD = 10;
let MOVE_POINT_R = 100;
let SEL_TYPE = {COPY: 0, CUT: 1};
let SEL_BORDER = 2;
let OBJ_LINE_WIDTH = 5;
let OBJ_LINE_CHECK = 'blue';
let OBJ_LINE_SELECT = 'red';
let CANVAS_SIZE_PC = ['490x50', '490x200', '490x120', '490x300', '490x490'];
let CANVAS_SIZE_MOB = ['180x180','270x50', '270x220', '300x300','270x490'];

let ls = {
	version: loadStorage(LS_KEY.VERSION, false) || DEF_VERSION,
	mode: loadStorage(LS_KEY.MODE, false) || DEF_MODE,
	font: loadStorage(LS_KEY.FONT, true) || DEF_FONT,
	pictMode: loadStorage(LS_KEY.PICT_MODE, true),
	correctLv: loadStorage(LS_KEY.CORRECT_LV, false) || DEF_CORRECT_LV,
	guide: loadStorage(LS_KEY.GUIDE, true)
}
let sketch = $('#sketch').sketch();
let canvas = {
	layers: [],
	layerNum: 0,
	layer: {},
	tools: {},
	w: getCanvasSize().w,
	h: getCanvasSize().h,
	scale: 1,
	marker: {
		width: 6,//sketch.size,
		color: $("#colorPicker").spectrum('get').toRgbString(),
		comp: COMP.SV,
		cap: LINE_CAP.R,
		join: LINE_JOIN.R,
		pat: {}
	},
	eraser: {
		width: sketch.size,
		color: 'rgba(0, 0, 0, 1)',
		comp: COMP.DO,
		cap: LINE_CAP.R,
		join: LINE_JOIN.R
	},
	effect: {
		type: 'blur',
		size: 10,
		lv: 1
	},
	moji: {},
	path: {
		state: PATH_STATE.INIT,
		mode: 'click',
		mp: -1,
		type: 'line',
		interpolate: 15,
		extract: 5
	},
	filters: {},
	bgcolor: {el: [], grad: false},
	pointer: {
		w: sketch.size
	},
	object: {}
};
let tools = [TOOL.MARKER, TOOL.ERASER, TOOL.SPOIT];
let redoList = [];
let icons = {
	markerIcon: {img: $('label[for=kaku]')},
	customIcon: {file: 'brush.png'},
	pathIcon: {file: 'path2.png'},
	figureIcon: {file: 'figure.png'},
	effectIcon: {file: 'water.png'},
	eraserIcon: {img: $('label[for=kesu]')},
	spoitIcon: {img: $('label[for=spoit]')},
	fillIcon: {file: 'nuri.png'},
	mojiIcon: {file: 'moji.png'},
	figureIcon: {file: 'figure.png'},
	selIcon: {file: 'selection.png'},
	objectIcon: {file: 'object.png'},
	filterIcon: {file: 'filter.png'},
	pictIcon: {file: 'pict.png'},
	settingsIcon: {file: 'settings.png'}
};
let clearImageData;
let pict = {};
let korabo = {};
let rclick = false;
let bTool;
let aTool = TOOL.ERASER;
let seq = 0;
let mixBlendModeSupport = checkBlendModeSupport();
let webGlSupport = checkWebGlSupport();

function checkBlendModeSupport() {
	let cssMixBlendMode = 'mix-blend-mode' in document.body.style;
	
	let canvasMixBlendMode = false;
	let orgComposite = sketch.context.globalCompositeOperation;
	sketch.context.globalCompositeOperation = 'multiply';
	if (sketch.context.globalCompositeOperation == 'multiply') {
		canvasMixBlendMode = true;
	}
	sketch.context.globalCompositeOperation = orgComposite;

	
	return cssMixBlendMode && canvasMixBlendMode;
}

function checkWebGlSupport() {
	try {
		canvas.fxCanvas = fx.canvas();
		return true;
	} catch (e) {
		return false;
	}
}

let fool = false;

this.checkNewVersion = function(version, versionInfo){
	if(ls.version != version && versionInfo[version]){
		saveStorage(LS_KEY.VERSION, version, false);
		let versionInfoBox = $('<div>', {id: 'versionInfoBox', title: ' 更新履歴'});
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
};


this.crUI = function() {
	if (ls.mode >= MODE.L) changeOriginalUI();
	if (ls.mode >= MODE.L) crCanvas();
	if (ls.mode >= MODE.M) crLayerUI();
	if (ls.mode >= MODE.M) crScaleUI();
	if (ls.mode >= MODE.M) crMarkerUI();
	//if (ls.mode >= MODE.H) crCustomUI();
	if (ls.mode >= MODE.M) crPathUI();
	if (ls.mode >= MODE.M) crFigureUI();
	if (ls.mode >= MODE.M) crFillUI();
	if (ls.mode >= MODE.H) crEffectUI();
	if (ls.mode >= MODE.M) crEraserUI();
	if (ls.mode >= MODE.M) crSpoitUI();
	if (ls.mode >= MODE.M) crMojiUI();
	if (ls.mode >= MODE.M) crSelectionUI();
	//if (ls.mode >= MODE.M) crObjectUI();
	if (ls.mode >= MODE.H && webGlSupport) crFilterUI();
	if (ls.mode >= MODE.M) crPictUI();
	if (ls.mode >= MODE.M) crBgcolorUI();
	if (ls.mode >= MODE.L) crSettingsUI();
	if (ls.mode >= MODE.L) crMainMenuUI();
	if (ls.mode >= MODE.L) crGoBtn();
	
	function changeOriginalUI() {
		let mode
		for (let key in MODE) {
			if (ls.mode == MODE[key]) mode = MODE_NAME[key]; 
		}
		if (PC) {
			$('[for=oekakiMode] font').text('お絵かきモード（拡張機能ON：' + mode + 'モード）');
		} else {
			/*$('#oekakiMode').before($('<font>').text('（拡張機能ON：' + mode + 'モード）'));*/
		}

		let penSizeList = [0.5, 1, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 24, 28, 32, 36, 40, 48, 56, 64, 72, 80, 100];
		let penSizeSelect = crSelectEl('penSizeSelect', ' 太さ：', penSizeList, penSizeList, 2);
		$('#psize').children().remove();
		$('#psize').append(penSizeSelect.children().children());
		
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
		
		let s = $('#canvasSize').val();
		let canvasSizeList = CANVAS_SIZE_PC.concat(CANVAS_SIZE_MOB);
		let canvasSizeOption = crSelectEl('canvasSizeOption', '', canvasSizeList, canvasSizeList, 1);
		let canvasSize2 = crSelectEl('canvasSize2', '', [], [], 0);
		canvasSize2.children().append($('#canvasSize').children());
		$('#canvasSize').append(canvasSizeOption.children().children());
		$('#canvasSize').before(canvasSize2).hide();
		$('#canvasSize2').val(s);
	}
	
	function crCanvas() {
		let inputEl = crCanvasEl('inputCanvas', 'layer', MAX_LAYER + 1);
		let previewEl = crCanvasEl('previewCanvas', 'layer', 0);
		let tmpEl = crCanvasEl('tmpCanvas', 'layer', -1);
		let patEl = crCanvasEl('patCanvas', 'pattern', 0);
		let patPreviewEl = crCanvasEl('patPreviewCanvas', 'pattern', 0);
		$('#sketch').before(inputEl);
		$('#sketch').before(previewEl);
		$('#sketch').before(tmpEl);
		
		canvas.inputEl = inputEl;
		canvas.inputCtx = inputEl[0].getContext('2d');
		canvas.inputCtx.lineWidth = 1;
		canvas.inputCtx.lineCap = 'round';
		canvas.inputCtx.lineJoin = 'round';
		canvas.inputCtx.strokeStyle = '#666';
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
		let layerTool = $('<div>', {
			id: 'layerTool',
			align: 'left',
			class: 'layerTool'
		});
		let layerText = $('<b>', {text: '[レイヤ]：'});

		let addLayerBtn = $('<input>', {
			id: 'addLayerBtn',
			type: 'button',
			value: '追加'
		});
		let changeLayerDisplayBtn = $('<input>', {
			id: 'changeLayerDisplayBtn',
			type: 'button',
			value: '表示'
		});
		let changeLayerLeftBtn = $('<input>', {
			id: 'changeLayerLeftBtn',
			type: 'button',
			value: '←'
		});
		let changeLayerRightBtn = $('<input>', {
			id: 'changeLayerRightBtn',
			type: 'button',
			value: '→'
		});
		let copyLayerBtn = $('<input>', {
			id: 'copyLayerBtn',
			type: 'button',
			value: '複製'
		});
		let mergeLayerBtn = $('<input>', {
			id: 'mergeLayerBtn',
			type: 'button',
			value: '結合'
		});
		let deleteLayerBtn = $('<input>', {
			id: 'deleteLayerBtn',
			type: 'button',
			value: '削除'
		});
		let layerPreviewBox = $('<div>', {
			id: 'layerPreviewBox',
			align: 'left'
		});

		let layerAlphaBox = $('<div>', {
			id: 'layerAlphaBox'
		});
		let layerAlphaText = $('<label>', {id: 'layerAlphaText', text: '不透明度：100'});
		let layerAlphaSlider = $('<div>', {id: 'layerAlphaSlider'}).slider({
			min: 0,
			max: 100,
			value: 100,
			slide: function(ev, ui) {
				changeLayerAlpha(ui.value);
			}
		});
		
		let blendValueList = [];
		let blendTextList = [];
		for (let key in BLEND_MODE) {
			blendValueList.push(key);
			blendTextList.push(BLEND_MODE[key]);
		}
		let layerBlendSelect = crSelectEl('layerBlendSelect', 'ブレンドモード：', blendValueList, blendTextList, 0);
		if (!mixBlendModeSupport) layerBlendSelect.hide();
		
		layerAlphaBox.append(layerAlphaText, layerAlphaSlider, layerBlendSelect);
		
		layerTool.append(
			layerText, addLayerBtn, changeLayerDisplayBtn, changeLayerLeftBtn, changeLayerRightBtn,
			copyLayerBtn, mergeLayerBtn, deleteLayerBtn, layerAlphaBox, layerPreviewBox
		);
		if (PC) {
			$('#_canvas').after(layerTool);
		} else {
			$('#oekakiCanvas').append(layerTool);
		}
		
		let clearAllBtn = $('<input>', {
			id: 'clearAllBtn',
			type: 'button',
			value: '全消'
		});
		$('#clearButton').after(clearAllBtn);
	}

	function crScaleUI() {
		let scaleValueList = [0.5, 0.75, 1, 1.25, 1.5, 2, 2.5, 3, 4, 5];
		let scaleTextList = ['50%', '75%', '100%', '125%', '150%', '200%', '250%', '300%', '400%', '500%'];
		let scaleSelect = crSelectEl('scaleSelect', 'x', scaleValueList, scaleTextList, 2);
		$('#canvasSize2').after(scaleSelect);
	}
	
	function crMarkerUI() {
		let mrkTypeValueList = [MARKER_TYPE.NORMAL, MARKER_TYPE.PENCIL, MARKER_TYPE.PATTERN];
		let mrkTypeTextList = ['通常', '鉛筆', 'パターン'];
		let mrkTypeSelect = crSelectEl('mrkTypeSelect', '種類：', mrkTypeValueList, mrkTypeTextList, 0);		
		let mrkCapValueList = [LINE_CAP.R, LINE_CAP.S];
		let mrkCapTextList = ['●', '■'];
		let mrkCapSelect = crSelectEl('mrkCapSelect', '　ペン先：', mrkCapValueList, mrkCapTextList, 0);
		//let mrkCompList = [COMP.SA, COMP.SI, COMP.SO, COMP.SV, COMP.DA, COMP.DI, COMP.DO, COMP.DV, COMP.LI, COMP.DK, COMP.XO];
		//let mrkCompSelect = crSelectEl('mrkCompSelect', '　合成：', mrkCompList, mrkCompList, 3);
		let alphaLockCheck = (ls.mode >= MODE.H) ? crCheckboxEl('alphaLockCheck', '透明色保護', false) : '';
		
		let mrkCorrectLv = [0, 1, 2, 3, 4, 5];
		let mrkCorrectLvSelect = crSelectEl('mrkCorrectLvSelect', '手ぶれ補正レベル：', mrkCorrectLv, mrkCorrectLv, ls.correctLv);
	
		let mrkPatBox = $('<div>', {id: 'mrkPatBox', style: 'display: none'});
		let mrkPatTypeValueList = [PAT_TYPE.DOT, PAT_TYPE.STAR, PAT_TYPE.LINE];
		let mrkPatTypeTextList = ['ドット', '星', 'ライン'];
		let mrkPatTypeSelect = crSelectEl('mrkPatTypeSelect', 'パターン：', mrkPatTypeValueList, mrkPatTypeTextList, 0);
		let mrkPatSizeList = [0, 0.5, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
		
		let mrkPatDotBox = $('<span>', {id: 'mrkPatDotBox', style: 'display: none'});
		let mrkPatDotSizeList = [0.5, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
		let mrkPatDotSizeSelect = crSelectEl('mrkPatDotSizeSelect', '　サイズ：', mrkPatDotSizeList, mrkPatDotSizeList, 0);
		let mrkPatDotHSpaceSelect = crSelectEl('mrkPatDotHSpaceSelect', '　間隔（横）：', mrkPatSizeList, mrkPatSizeList, 3);
		let mrkPatDotVSpaceSelect = crSelectEl('mrkPatDotVSpaceSelect', '　間隔（縦）：', mrkPatSizeList, mrkPatSizeList, 3);
		mrkPatDotBox.append(mrkPatDotSizeSelect, br(), mrkPatDotHSpaceSelect, mrkPatDotVSpaceSelect);

		let mrkPatStarBox = $('<span>', {id: 'mrkPatStarBox', style: 'display: none'});
		let mrkPatStarSizeList = [2, 3, 4, 5, 6, 7, 8, 9, 10];
		let mrkPatStarSizeSelect = crSelectEl('mrkPatStarSizeSelect', '　サイズ：', mrkPatStarSizeList, mrkPatStarSizeList, 3);
		let mrkPatStarPointList = [3, 4, 5, 6, 7, 8];
		let mrkPatStarPointSelect = crSelectEl('mrkPatStarPointSelect', '　角：', mrkPatStarPointList, mrkPatStarPointList, 2);
		let mrkPatStarRoundList = [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0];
		let mrkPatStarRoundSelect = crSelectEl('mrkPatStarRoundSelect', '　丸み：', mrkPatStarRoundList, mrkPatStarRoundList, 4);
		let mrkPatStarHSpaceSelect = crSelectEl('mrkPatStarHSpaceSelect', '　間隔（横）：', mrkPatSizeList, mrkPatSizeList, 3);
		let mrkPatStarVSpaceSelect = crSelectEl('mrkPatStarVSpaceSelect', '　間隔（縦）：', mrkPatSizeList, mrkPatSizeList, 3);
		mrkPatStarBox.append(mrkPatStarSizeSelect, br(), mrkPatStarPointSelect, mrkPatStarRoundSelect, br(), mrkPatStarHSpaceSelect, mrkPatStarVSpaceSelect);

		let mrkPatLineBox = $('<span>', {id: 'mrkPatLineBox', style: 'display: none'});
		let mrkPatLineHSizeSelect = crSelectEl('mrkPatLineHSizeSelect', '　太さ（横線）：', mrkPatSizeList, mrkPatSizeList, 2);
		let mrkPatLineVSizeSelect = crSelectEl('mrkPatLineVSizeSelect', '　太さ（縦線）：', mrkPatSizeList, mrkPatSizeList, 2);
		let mrkPatLineHSpaceSelect = crSelectEl('mrkPatLineHSpaceSelect', '　間隔：', mrkPatSizeList, mrkPatSizeList, 6);
		let mrkPatLineVSpaceSelect = crSelectEl('mrkPatLineVSpaceSelect', '　間隔：', mrkPatSizeList, mrkPatSizeList, 6);
		mrkPatLineBox.append(br(), mrkPatLineHSizeSelect, mrkPatLineVSpaceSelect, br(), mrkPatLineVSizeSelect, mrkPatLineHSpaceSelect);
		
		mrkPatBox.append(hr(), mrkPatTypeSelect, mrkPatDotBox, mrkPatStarBox, mrkPatLineBox);
		setCanvasSize(canvas.patEl[0], PENCIL_SIZE, PENCIL_SIZE, 1);
		let markerMenu = $('<div>', {id: 'markerMenu'}).append(mrkTypeSelect, mrkCapSelect, alphaLockCheck, br(), mrkCorrectLvSelect, br(), mrkPatBox);
		$('body').append(markerMenu);
	}
	
	function crCustomUI() {
		tools.push(TOOL.CUSTOM);
		let customCorrectBox = $('<div>', {id: 'customCorrectBox'});
		let customCorrectLv = [1, 2, 3, 4, 5];
		let customCorrectCheck = crCheckboxEl('customCorrectCheck', '手ブレ補正', false);
		let customCorrectLvSelect = crSelectEl('customCorrectLvSelect', '　補正レベル：', customCorrectLv, customCorrectLv, 0);
		customCorrectBox.append(customCorrectCheck, customCorrectLvSelect);
		let customMenu = $('<div>', {id: 'customMenu'}).append(customCorrectBox);
		$('body').append(customMenu);
	}
	
	function crPathUI() {
		tools.push(TOOL.PATH);
		let pathDrawModeValueList = ['click', 'free'];
		let pathDrawModeTextList = ['クリック', 'フリーハンド'];
		let pathDrawModeSelect = crSelectEl('pathDrawModeSelect', 'モード：', pathDrawModeValueList, pathDrawModeTextList, 0).change(function() {
			canvas.path.mode = $('#pathDrawModeSelect').val();
			if (canvas.path.mode == 'click') {
				$('label[for=pathFreeExtractSelect]').hide();
			} else {
				$('label[for=pathFreeExtractSelect]').show();
			}
		});
		//let pathTypeValueList = ['line', 'spline', 'quadratic', 'cubic'];
//		let pathTypeTextList = ['直線', 'スプライン曲線', '2次ペジェ曲線', '3次ペジェ曲線'];
		let pathTypeValueList = ['line', 'spline'];
		let pathTypeTextList = ['直線', '曲線'];
		let pathTypeSelect = crSelectEl('pathTypeSelect', '　種類：', pathTypeValueList, pathTypeTextList, 0).change(function() {
			canvas.path.type = $('#pathTypeSelect').val();
			changeToolAction();
			if (canvas.path.type == 'line') {
				$('label[for=pathSplineInterpolateSelect]').hide();
			} else {
				$('label[for=pathSplineInterpolateSelect]').show();
			}
		});
		let pathAnchorSizeList = [4, 8, 16, 32];
		let pathAnchorSizeSelect = crSelectEl('pathAnchorSizeSelect', '　アンカーサイズ：', pathAnchorSizeList, pathAnchorSizeList, 0).change(changeToolAction);
		let pathFreeExtractList = [2, 4, 8, 16];
		let pathFreeExtractSelect = crSelectEl('pathFreeExtractSelect', '　アンカー抽出間隔：', pathFreeExtractList, pathFreeExtractList, 1).change(function() {
			canvas.path.extract = $('#pathFreeExtractSelect').val();
			if (canvas.action.path.op) canvas.action.path.ap = extractAnchor(canvas.action.path.op); 
			changeToolAction();
		}).hide();
		let pathSplineInterpolateList = [10, 15, 20];
		let pathSplineInterpolateSelect = crSelectEl('pathSplineInterpolateSelect', '　曲線補完：', pathSplineInterpolateList, pathSplineInterpolateList, 0).change(function() {
			canvas.path.interpolate = $('#pathSplineInterpolateSelect').val();
			changeToolAction();
		}).hide();
		let pathEraseCheck = crCheckboxEl('pathEraseCheck', '消しゴム', false);
		let pathCommitBtn = $('<input>', {
			id: 'pathCommitBtn',
			type: 'button',
			value: '確定',
		}).click(commitPath);
		let pathMenu = $('<div>', {id: 'pathMenu'}).append(pathDrawModeSelect, pathAnchorSizeSelect, pathFreeExtractSelect, br(), pathTypeSelect, pathSplineInterpolateSelect, pathEraseCheck, hr(), pathCommitBtn);
		$('body').append(pathMenu);
	}
	
	function crFigureUI() {
		tools.push(TOOL.FIGURE);
		let figureTypeValueList = ['line', 'strokeRect', 'fillRect', 'strokeCircle', 'fillCircle'];
		let figureTypeTextList = ['－', '□', '■', '○', '●'];
		let figureTypeSelect = crSelectEl('figureTypeSelect', '図形：', figureTypeValueList, figureTypeTextList, 0);
		let figureMenu = $('<div>', {id: 'figureMenu'}).append(figureTypeSelect);
		$('body').append(figureMenu);
	}
	
  function crFillUI() {
		tools.push(TOOL.FILL);
		let fillMenu = $('<div>', {id: 'fillMenu'});
		$('body').append(fillMenu);
	}
  
	function crEffectUI() {
		tools.push(TOOL.EFFECT);
		
		let effectTypeValueList = [EFFECT_TYPE.BLUR];
		let effectTypeTextList = ['ぼかし'];
		let effectTypeSelect = crSelectEl('effectTypeSelect', '種類：', effectTypeValueList, effectTypeTextList, 0);
		let effectSizeList = [2, 5, 10, 15, 20];
		let effectSizeSelect = crSelectEl('effectSizeSelect', '　範囲：', effectSizeList, effectSizeList, 1);
		let effectMenu = $('<div>', {id: 'effectMenu'}).append(effectTypeSelect, effectSizeSelect);
		$('body').append(effectMenu);
	}
	
	function crEraserUI() {
		let eraserCapValueList = [LINE_CAP.R, LINE_CAP.S];
		let eraserCapTextList = ['●', '■'];
		let eraserCapSelect = crSelectEl('eraserCapSelect', '形：', eraserCapValueList, eraserCapTextList, 0);
		let eraserPressureValueList = [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1];
		let eraserPressureTextList = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100];
		let eraserPressureSelect = crSelectEl('eraserPressureSelect', '　圧力：', eraserPressureValueList, eraserPressureTextList, 9);
		let eraserMenu = $('<div>', {id: 'eraserMenu'}).append(eraserCapSelect, eraserPressureSelect, br(), br());
		$('body').append(eraserMenu);
	}
	
	function crSpoitUI() {
		let spoitLayerValueList = [MERGE_TYPE.ALL_LAYER_BG, MERGE_TYPE.ALL_LAYER, MERGE_TYPE.SELECT_LAYER_BG, MERGE_TYPE.SELECT_LAYER];
		let spoitLayerTextList = ['全レイヤ+背景', '全レイヤ', '選択中レイヤ+背景', '選択中レイヤ'];
		let spoitLayerSelect = crSelectEl('spoitLayerSelect', '抽出先：', spoitLayerValueList, spoitLayerTextList, 0);
		let spoitAlphaCheck = crCheckboxEl('spoitAlphaCheck', '透明度　', false);
		let spoitMenu = $('<div>', {id: 'spoitMenu'}).append(spoitLayerSelect, spoitAlphaCheck, br(), br());
		$('body').append(spoitMenu);
	}
	
	function crMojiUI() {
		tools.push(TOOL.MOJI);
		
		let mojiColorPicker = $('<input>', {id: 'mojiColorPicker', type: 'color'}).before(crLabelEl('mojiColorPicker', '色：'));
		let mojiSizeList = [4, 8, 10, 12, 14, 16, 18, 20, 24, 28, 32, 36, 40, 48, 56, 64, 72, 80, 100];
		let mojiSizeSelect = crSelectEl('mojiSizeSelect', ' 　大きさ：', mojiSizeList, mojiSizeList, 7);
		let mojiFontValueList = ['sans-serif','serif','cursive','fantasy','monospace'];
		let mojiFontTextList = ['ゴシック','明朝','筆記体','装飾','等幅'];
		if (ls.font.length) {
			mojiFontValueList.push(ls.font);
			mojiFontTextList.push(ls.font);
		}
		let mojiFontSelect = crSelectEl('mojiFontSelect', ' フォント：', mojiFontValueList, mojiFontTextList, 0);
		let mojiVerticalCheck = crCheckboxEl('mojiVerticalCheck', '縦書　', false);
		let mojiEdgeCheck = crCheckboxEl('mojiEdgeCheck', '縁取　', false);
		let mojiBoldCheck = crCheckboxEl('mojiBoldCheck', 'B　', false);
		let mojiItalickCheck = crCheckboxEl('mojiItalickCheck', 'I　', false);
		let addFontBtn = $('<input>', {id: 'addFontBtn', type: 'button', value: '追加'});
		let deleteFontBtn = $('<input>', {id: 'deleteFontBtn', type: 'button', value: '削除'});
		let mojiMenu = $('<div>', {id: 'mojiMenu'})
			.append(mojiColorPicker, mojiSizeSelect, $('<br>'))
			.append(mojiFontSelect, addFontBtn, deleteFontBtn, $('<br>'))
			.append(mojiVerticalCheck, mojiEdgeCheck, mojiBoldCheck, mojiItalickCheck);
		$('body').append(mojiMenu);
	}
	
	function crSelectionUI() {
		tools.push(TOOL.SEL);
		let selTypeValueList = [SEL_TYPE.COPY, SEL_TYPE.CUT];
		let selTypeTextList = ['コピー', '切り取り'];
		let selTypeSelect = crSelectEl('selTypeSelect', '動作：', selTypeValueList, selTypeTextList, 0);
		let selScaleLabel = crLabelEl('selScaleSpinner', '　拡大：');
		let selScaleSpinner = $('<input>', {id: 'selScaleSpinner', value: '100'});
		let selPasteBtn = $('<input>', {id: 'selPasteBtn', type: 'button', value: '貼り付け'});
		let selPasteCanselBtn = $('<input>', {id: 'selPasteCancelBtn', type: 'button', value: 'キャンセル'});
		//let selContinuePasteCheck = crCheckboxEl('selContinuePasteCheck', '連続貼り付け', false);
		//let selMenu = $('<div>', {id: 'selMenu'}).append(selTypeSelect, selContinuePasteCheck, br(), selPasteBtn, selPasteCanselBtn);
		let selMenu = $('<div>', {id: 'selMenu'}).append(selTypeSelect, selScaleLabel, selScaleSpinner, br(), selPasteBtn, selPasteCanselBtn);
		$('body').append(selMenu);
	}
	
	function crObjectUI() {
		tools.push(TOOL.OBJECT);
		let objDeleteBtn = $('<input>', {id: 'objDeleteBtn', type: 'button', value: '削除'});
		let objCancelBtn = $('<input>', {id: 'objDeleteBtn', type: 'button', value: 'キャンセル'});
		let objMenu = $('<div>', {id: 'objectMenu'}).append(objDeleteBtn, objCancelBtn);
		$('body').append(objMenu);
	}
	
	function crFilterUI() {
		tools.push(TOOL.FILTER);
		let filterTypeValueList = [
			'brightnessContrast', 'hueSaturation', 'vibrance', 'sepia', 'denoise', 'noise', 'unsharpMask', 'vignette',
			'triangleBlur', 'zoomBlur', 'lensBlur', 'tiltShift',
			'swirl', 'bulgePinch', 'perspective',
			'ink', 'edgeWork', 'hexagonalPixelate', 'dotScreen', 'colorHalftone'
		];
		let filterTypeTextList = [
			'明るさ・コントラスト', '色相・彩度', '自然な彩度', 'セピア', 'ノイズ除去', 'ノイズ', 'アンシャープマスク', 'ビネット',
			'ぼかし', 'ぼかし（ズーム）', 'ぼかし（レンズ）', 'ティルトシフト',
			'渦', '膨張/収縮', '遠近法',
			'インク', '輪郭抽出', 'モザイク', 'ハーフトーン', 'カラーハーフトーン'
		];
		let filterTypeSelect = crSelectEl('filterTypeSelect', 'フィルタ：', filterTypeValueList, filterTypeTextList, 0);
		
		canvas.filters.brightnessContrast = new Filter(
			'明るさ・コントラスト', 'brightnessContrast', function() {
				this.addSlider('明るさ', 'brightness', -1, 1, 0, 0.01);
				this.addSlider('コントラスト', 'contrast', -1, 1, 0, 0.01);
			}, function() {
				this.previewFilter('canvas.fxCanvas.draw(texture).brightnessContrast('+this.brightness+', '+this.contrast+').update();');
		});
		canvas.filters.hueSaturation = new Filter(
			'色相・彩度', 'hueSaturation', function() {
				this.addSlider('色相', 'hue', -1, 1, 0, 0.01);
				this.addSlider('彩度', 'saturation', -1, 1, 0, 0.01);
			}, function() {
				this.previewFilter('canvas.fxCanvas.draw(texture).hueSaturation('+this.hue+', '+this.saturation+').update();');
		});
		canvas.filters.vibrance = new Filter(
			'自然な彩度', 'Vibrance', function() {
				this.addSlider('自然な彩度', 'vibrance', -1, 1, 0, 0.01);
			}, function() {
				this.previewFilter('canvas.fxCanvas.draw(texture).vibrance('+this.vibrance+').update();');
		});
		canvas.filters.sepia = new Filter(
			'セピア', 'sepia', function() {
				this.addSlider('量', 'amount', 0, 1, 1, 0.01);
			}, function() {
				this.previewFilter('canvas.fxCanvas.draw(texture).sepia('+this.amount+').update();');
		});
		canvas.filters.denoise = new Filter(
			'ノイズ除去', 'denoise', function() {
				this.addSlider('指数', 'exponent', 0, 50, 20, 1);
			}, function() {
				this.previewFilter('canvas.fxCanvas.draw(texture).denoise('+this.exponent+').update();');
		});
		canvas.filters.noise = new Filter(
			'ノイズ', 'noise', function() {
				this.addSlider('量', 'amount', 0, 1, 0.5, 0.01);
			}, function() {
				this.previewFilter('canvas.fxCanvas.draw(texture).noise('+this.amount+').update();');
		});
		canvas.filters.unsharpMask = new Filter(
			'アンシャープマスク', 'unsharpMask', function() {
				this.addSlider('半径', 'radius', 0, 200, 20, 1);
				this.addSlider('強さ', 'strength', 0, 5, 2, 0.01);
			}, function() {
				this.previewFilter('canvas.fxCanvas.draw(texture).unsharpMask('+this.radius+', '+this.strength+').update();');
		});
		canvas.filters.vignette = new Filter(
			'ビネット', 'vignette', function() {
				this.addSlider('サイズ', 'size', 0, 1, 0.5, 0.01);
				this.addSlider('量', 'amount', 0, 1, 0.5, 0.01);
			}, function() {
				this.previewFilter('canvas.fxCanvas.draw(texture).vignette('+this.size+', '+this.amount+').update();');
		});

		canvas.filters.triangleBlur = new Filter(
			'ぼかし', 'triangleBlur', function() {
				this.addSlider('半径', 'radius', 0, 200, 20, 1);
			}, function() {
				this.previewFilter('canvas.fxCanvas.draw(texture).triangleBlur('+this.radius+', '+this.strength+').update();');
		});
		canvas.filters.zoomBlur = new Filter(
			'ぼかし（ズーム）', 'zoomBlur', function() {
				this.addNub('center', 0.5, 0.5);
				this.addSlider('強さ', 'strength', 0, 1, 0.3, 0.01);
			}, function() {
				this.previewFilter('canvas.fxCanvas.draw(texture).zoomBlur('+this.center.x+', '+this.center.y+', '+this.strength+').update();');
		});
		canvas.filters.lensBlur = new Filter(
			'ぼかし(レンズ)', 'lensBlur', function() {
				this.addSlider('半径', 'radius', 0, 50, 10, 1);
				this.addSlider('明度', 'brightness', -1, 1, 0.75, 0.01);
				this.addSlider('角度', 'angle', -Math.PI, Math.PI, 0, 0.01);
			}, function() {
				this.previewFilter('canvas.fxCanvas.draw(texture).lensBlur('+this.radius+', '+this.brightness+', '+this.angle+').update();');
		});
		canvas.filters.tiltShift = new Filter(
			'ティルトシフト', 'tiltShift', function() {
				this.addNub('start', 0.25, 0.75);
				this.addNub('end', 0.75, 0.25);
				this.addSlider('強さ', 'blurRadius', 0, 50, 15, 1);
				this.addSlider('半径', 'gradientRadius', 0, canvas.w/2, 15, 1);
			}, function() {
				this.previewFilter('canvas.fxCanvas.draw(texture).tiltShift('+this.start.x+', '+this.start.y+', '+this.end.x+', '+this.end.y+', '+this.blurRadius+', '+this.gradientRadius+').update();');
		});
		
		canvas.filters.swirl = new Filter(
			'渦', 'swirl', function() {
				this.addNub('center', 0.5, 0.5);
				this.addSlider('半径', 'radius', 0, canvas.w*1.5, canvas.w/2, 1);
				this.addSlider('角度', 'angle', -25, 25, 3, 0.1);
			}, function() {
				this.previewFilter('canvas.fxCanvas.draw(texture).swirl('+this.center.x+', '+this.center.y+', '+this.radius+', '+this.angle+').update();');
		});
		canvas.filters.bulgePinch = new Filter(
			'膨張/収縮', 'bulgePinch', function() {
				this.addNub('center', 0.5, 0.5);
				this.addSlider('半径', 'radius', 0, canvas.w*1.5, canvas.w/2, 1);
				this.addSlider('強さ', 'strength', -1, 1, 0.5, 0.01);
			}, function() {
				this.previewFilter('canvas.fxCanvas.draw(texture).bulgePinch('+this.center.x+', '+this.center.y+', '+this.radius+', '+this.strength+').update();');
		});
		
		let pNubs = [
			0.25*canvas.w, 0.25*canvas.h,
			0.75*canvas.w, 0.25*canvas.h,
			0.25*canvas.w, 0.75*canvas.h,
			0.75*canvas.w, 0.75*canvas.h
		];
		canvas.filters.perspective = new Filter(
			'遠近法', 'perspective', function() {
				this.addNub('a', pNubs[0]/canvas.w, pNubs[1]/canvas.h);
				this.addNub('b', pNubs[2]/canvas.w, pNubs[3]/canvas.h);
				this.addNub('c', pNubs[4]/canvas.w, pNubs[5]/canvas.h);
				this.addNub('d', pNubs[6]/canvas.w, pNubs[7]/canvas.h);
			}, function() {
				let before = pNubs;
				let after = [this.a.x, this.a.y, this.b.x, this.b.y, this.c.x, this.c.y, this.d.x, this.d.y];
				this.previewFilter('canvas.fxCanvas.draw(texture).perspective([' + before + '], [' + after + ']).update();');
		});
		
		canvas.filters.ink = new Filter(
			'インク', 'ink', function() {
				this.addSlider('強さ', 'strength', 0, 1, 0.25, 0.01);
			}, function() {
				this.previewFilter('canvas.fxCanvas.draw(texture).ink('+this.strength+').update();');
		});
		canvas.filters.edgeWork = new Filter(
			'輪郭抽出', 'edgeWork', function() {
				this.addSlider('半径', 'radius', 0, 200, 10, 1);
			}, function() {
				this.previewFilter('canvas.fxCanvas.draw(texture).edgeWork('+this.radius+').update();');
		});
		canvas.filters.hexagonalPixelate = new Filter(
			'モザイク', 'hexagonalPixelate', function() {
				this.addNub('center', 0.5, 0.5);
				this.addSlider('サイズ', 'size', 3, 100, 10, 1);
			}, function() {
				this.previewFilter('canvas.fxCanvas.draw(texture).hexagonalPixelate('+this.center.x+', '+this.center.y+', '+this.size+').update();');
		});
		canvas.filters.dotScreen = new Filter(
			'ハーフトーン', 'dotScreen', function() {
				this.addNub('center', 0.5, 0.5);
				this.addSlider('角度', 'angle', 0, Math.PI / 2, 1.1, 0.01);
				this.addSlider('サイズ', 'size', 3, 20, 3, 0.01);
			}, function() {
				this.previewFilter('canvas.fxCanvas.draw(texture).dotScreen('+this.center.x+', '+this.center.y+', '+this.angle+', '+this.size+').update();');
		});
		canvas.filters.colorHalftone = new Filter(
			'カラーハーフトーン', 'colorHalftone', function() {
				this.addNub('center', 0.5, 0.5);
				this.addSlider('角度', 'angle', 0, Math.PI / 2, 0.25, 0.01);
				this.addSlider('サイズ', 'size', 3, 20, 4, 0.01);
			}, function() {
				this.previewFilter('canvas.fxCanvas.draw(texture).colorHalftone('+this.center.x+', '+this.center.y+', '+this.angle+', '+this.size+').update();');
		});
		
		let filterCommitBtn = $('<input>', {
			id: 'filterCommitBtn',
			type: 'button',
			value: '適用',
		}).click(commitFilter);
		let filterClearBtn = $('<input>', {
			id: 'filterClearBtn',
			type: 'button',
			value: 'クリア',
		}).click(clearFilter);
		let filterSliderArea = $('<div>', {id: 'filterSliderArea'}).css('text-align', 'left');
		
		let filterMenu = $('<div>', {id: 'filterMenu'}).append(
			filterTypeSelect, filterSliderArea, filterCommitBtn, filterClearBtn
		);
		$('body').append(filterMenu);
		/*
		let filterNubsArea = $('<div>', {
			id: 'filterNubsArea',
			width: canvas.w,
			height: canvas.h
		}).css({
			position: 'absolute',
			zIndex: MAX_LAYER+2
		});
		$('#inputCanvas').parent().prepend(filterNubsArea);
		*/
	}
	
	function crPictUI() {
		if (PC) {
			if (ls.pictMode == undefined) { 
				ls.pictMode = confirm('画像貼り付け拡張機能をONにしますか？');
				saveStorage(LS_KEY.PICT_MODE, ls.pictMode, false);
			}
		} else {
			ls.pictMode = false;
			return;
		}
		
		tools.push(TOOL.PICT);
		let pictModeCheck = crCheckboxEl('pictModeCheck', '拡張機能ON', ls.pictMode);
		let pictSizeValueList = [1.0, 'canvas'];
		let pictSizeTextList = ['オリジナルサイズ', 'キャンバスサイズ'];
		let pictSizeSelect = crSelectEl('pictSizeSelect', '　画像サイズ：', pictSizeValueList, pictSizeTextList, 1);
		let pictToCanvasBtn = $('<input>', {
			id: 'pictToCanvasBtn',
			type: 'button',
			value: 'キャンバスへ貼る',
			disabled: 'disabled'
		});
		let pictContinueToCanvasCheck = crCheckboxEl('pictContinueToCanvasCheck', '連続貼り付け', false);
		let pictMenu = $('<div>', {id: 'pictMenu'}).append(pictModeCheck, br(), pictSizeSelect, br(), pictToCanvasBtn, pictContinueToCanvasCheck);
		$('body').append(pictMenu);
	}
	
	function crBgcolorUI() {
		let bgcolorGradCheck = crCheckboxEl('bgcolorGradCheck', 'グラデ', false);
		$($('.sp-button-container')[1]).append($('<div>').append(bgcolorGradCheck));
		let gradTypeValueList = ['liner_h', 'liner_v', 'liner_lr', 'liner_lu', 'radial'];
		let gradTypeTextList = ['線形（→）', '線形（↓）', '線形（↘）', '線形（↗）','円形'];
		let gradTypeSelect = crSelectEl('gradTypeSelect', '', gradTypeValueList, gradTypeTextList, 0);
		$('#bgcolorGradCheck').after(gradTypeSelect);

		let addGradBtn = $('<input>', {
			id: 'addGradBtn',
			type: 'button',
			value: '追加',
			style: 'display: none'
		});
		let deleteGradBtn = $('<input>', {
			id: 'deleteGradBtn',
			type: 'button',
			value: '削除',
			style: 'display: none'
		});
		$('#psize').after(deleteGradBtn, addGradBtn);
	}

	function crSettingsUI() {
		tools.push(TOOL.SETTINGS);
		let modeValueList = [MODE.L, MODE.M, MODE.H];
		let modeTextList = [MODE_NAME.L, MODE_NAME.M, MODE_NAME.H];
		let modeSelect = crSelectEl('modeSelect', 'モード：', modeValueList, modeTextList, ls.mode);

		if (PC) {
			if (ls.guide == undefined) ls.guide = DEF_GUIDE; 
		} else {
			ls.guide = false;
		}
		let guideCheck = crCheckboxEl('guideCheck', 'ポインター表示', ls.guide);
		let settingsMenu = $('<div>', {id: 'settingsMenu'}).append(modeSelect, " ", PC ? guideCheck : "");
		$('body').append(settingsMenu);
	}
	
	function crMainMenuUI() {
		let mainMenu = $('<div>', {id: "mainMenu"}).append($('<ul>'));
		for (let i in tools) {
			let tool = tools[i];
			crMenu(tool, mainMenu, $('#' + tool + 'Menu'));
		}
		mainMenu.tabs({active: 0});
		$('#upImage').after(mainMenu);
		$('#upImage').insertAfter($('#clearAllBtn'));
		$('[name=pmode]').hide();

		function crMenu(tool, mainMenu, subMenu) {
			let li = $('<li>').append($('<a>', {
				href: '#tab-' + tool,
				click: function() {
					clickMenu(sketch.tool, tool);
					$('[data-tool=' + tool + ']').click()
				}
			}).append(icons[tool+'Icon'].img).addClass('toolIcon'));
			mainMenu.children('ul').append(li);

			let menu = $('<div>', {id: 'tab-' + tool}).append(subMenu);
			mainMenu.append(menu);

			$('.tools').after($('<a>', {href: '#sketch', 'data-tool': tool}));
			$('a[href=#tab-' + tool + ']').click(function(){$('[data-tool=' + tool + ']').click()});
		}
	}

	function crGoBtn() {
		let goBtn = $('<input>', {
			id: 'goBtn',
			type: 'button',
			value: '進'
		});
		$('#backButton').after(goBtn);
	}
}

function clickMenu(beforeTool, afterTool) {
	commitAction(beforeTool);

	if (afterTool == 'eraser') {
		$('#psize').val(canvas.eraser.width);
	} else {
		$('#psize').val(canvas.marker.width);
	}
	canvas.pointer.w = $('#psize').val();
	
	switch (afterTool) {
		case TOOL.PICT:
			setPictArea();
			break;
		case TOOL.FILTER:
			canvas.layer.el.hide();
			$('#filterTypeSelect').trigger('change');
			break;
	}
	
}

function commitAction(tool) {
	switch (tool) {
		case TOOL.PATH:
			commitPath();
			break;
		case TOOL.SEL:
			cancelSelPaste();
			break;
		case TOOL.OBJECT:
			cancelObject();
			break;
		case TOOL.PICT:
			clearPictCrop();
			break;
		case TOOL.FILTER:
			clearCanvas(canvas.previewCtx);
			canvas.layer.el.show();
			$('#nubsArea').remove();
			break;
	}
}

this.setEvent = function() {
	changeOriginalEvent();
	setKeyDownEvent();
	setLayerEvent();
	
	canvas.inputEl.bind('mousedown touchstart', function(e){
		$("body").trigger("OEKAKI_FOCUS");
		//console.log('mousedown');
		isOekakiDone = 1;
		if (e.button == 2) {
			rclick = true;
			clickMenu(sketch.tool, aTool);
			bTool = sketch.tool;
			sketch.tool = aTool;
		}
		draw(e);
		return false;
	});
	canvas.inputEl.bind('click dblclick mousemove touchmove',	function(e) {
		//console.log('mousemove');
		draw(e);
		return false;
	});
	canvas.inputEl.bind('mouseleave mouseout mouseup touchcancel',	function(e) {
		//console.log('mouseup');
		draw(e);
		if (rclick) {
			rclick = false;
			clickMenu(sketch.tool, bTool);
			sketch.tool = bTool;
		}
		canvas.inputCtx.clearRect(0, 0, canvas.w, canvas.h);
		return false;
	});
	canvas.inputEl[0].addEventListener('touchend', function(e) {
		draw(e);
		if (rclick) {
			rclick = false;
			clickMenu(bTool, sketch.tool)
			sketch.tool = bTool;
		}
		canvas.inputCtx.clearRect(0, 0, canvas.w, canvas.h);
		return false;
	});
	canvas.inputEl.bind('contextmenu', function() {return false;});
	
	
	$('#gradTypeSelect').change(sketch.clear);
	$('#addGradBtn').click(addGrad);
	$('#deleteGradBtn').click(deleteGrad);
		
	function clearAllLayer(){
		let layerNum = canvas.layerNum;
		for (let i in canvas.layers) {
			selectLayer(i);
			clear();
		}

		for (let i=0;i<layerNum;i++) {
			selectLayer(i);
			setTimeout(function(){
				deleteLayer(false);
			},10*i);
		}


		
		$("#parent_pid").val("");
		isOekakiDone = 0;
		selectLayer(layerNum);
	}

	$('#clearAllBtn').click(function(){
		if(confirm("全てのレイヤの内容をクリアします。よろしいですか？")){
			clearAllLayer();
		}
	});

	
	$('#scaleSelect').change(changeCanvasSize);
	
	$('#alphaLockCheck').click(function() {
		if ($(this).is(':checked')) {
			canvas.marker.comp = COMP.SA;
		} else {
			canvas.marker.comp = COMP.DEF;
		}
	});
	
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
	});
	$('#mrkCapSelect').change(function() {
		canvas.marker.cap = $(this).val();
	});
	//$('#mrkCompSelect').change(function() {
	//	canvas.marker.comp = $(this).val();
	//});
	$('#mrkCorrectLvSelect').click(function() {
		saveStorage(LS_KEY.CORRECT_LV, $(this).val(), false);
		ls.correctLv = $(this).val();
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
		showPalette: true
	});
	$('#addFontBtn').click(function() {
		let font = prompt('追加フォント名');
		if (font) {
			ls.font.push(font);
			saveStorage(LS_KEY.FONT, ls.font, true);
			addSelectOption('mojiFontSelect', font, font);
		}
	});
	$('#deleteFontBtn').click(function() {
		let selected = $('#mojiFontSelect > option:selected');
		if (selected.index() >= DEF_FONT_NUM && confirm('「' + selected.val() + '」を削除しますか？')) {
			let delFont = selected.val();
			for (let i in ls.font) {
				let font = ls.font[i];
				if (font == delFont) {
					ls.font.splice(i, 1);
					saveStorage(LS_KEY.FONT, ls.font, true);
					selected.remove();
				}
			}
		}
	});
	
	$('#selPasteBtn').click(function() {
		selPaste(canvas.layers[canvas.layerNum].ctx, canvas.action);
	});
	$('#selPasteCancelBtn').click(function() {
		cancelSelPaste();
	});
	$('#selScaleSpinner').spinner({
		min: 10,
		max: 500,
		step: 10,
		numberFormat: 'P',
		spin: function(event, ui) {
			changeSelScale(ui.value/100);
		}
	});
	
	$('#objDeleteBtn').click(function() {
		deleteObject();
	});
	$('#objCancelBtn').click(function() {
		cancelObject();
	});
	
	$('#filterTypeSelect').change(function() {
		canvas.filters[$(this).val()].use();
	});
	
	$('#pictModeCheck').click(function() {
		saveStorage(LS_KEY.PICT_MODE, $(this).is(':checked'), false);
		ls.pictMode = $(this).is(':checked');
	});
	$('#pictSizeSelect').change(function() {
		setPictCrop();
	});
	$('#pictToCanvasBtn').click(function() {
		pictToCanvas();
	});
	
	$('#modeSelect').change(function() {
		saveStorage(LS_KEY.MODE, $(this).val());
		let modeChangeDialog = $('<div>', {id: 'modeChangeDialog', title: 'モード変更'});
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
	$('#guideCheck').change(function() {
		saveStorage(LS_KEY.GUIDE, $(this).is(':checked'), false);
		ls.guide = $(this).is(':checked');
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
		draw: function(ctx, action) {
			setStyle(action.line);
			drawLine(ctx, action);
		}
	}
	
	canvas.tools.custom = {
		onEvent: function(e) {
			switch (e.type) {
				case 'mousedown':
				case 'touchstart':
					startCustomPreview(e);
					break;
				case 'mouseup':
				case 'mouseout':
				case 'mouseleave':
				case 'touchend':
				case 'touchcancel':
					if (canvas.previewStart) {
						stopCustomPreview(e);
					}
			}
			if(canvas.previewStart) previewCustom(e);
		},
		draw: function(ctx, action) {
			setStyle(action.line);
			drawCustomLine(ctx, action);
		}
	}
		
	canvas.tools.path = {
		onEvent: function(e) {
			switch (e.type) {
				case 'mousedown':
				case 'touchstart':
					startPath(e);
					break;
				case 'mouseup':
				case 'mouseout':
				case 'mouseleave':
				case 'touchend':
				case 'touchcancel':
					stopPath();
					break;
			}
			previewPath(e);
		},
		draw: function(ctx, action) {
			drawPath(ctx, action);
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
		draw: function(ctx, action) {
			drawFigure(ctx, action);
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
		draw: function(ctx, action) {
			drawEffect(ctx, action);
		}
	}
	
	canvas.tools.spoit = {
		onEvent: function(e) {
			switch (e.type) {
				case 'mousedown':
				case 'touchstart':
					mergeCanvas(canvas.tmpCtx, $('#spoitLayerSelect').val() || MERGE_TYPE.ALL_LAYER_BG);
					let pos = getPosition(e);
					let spoitImage = canvas.tmpCtx.getImageData(pos.x, pos.y, 1, 1);
					let r = spoitImage.data[0];
					let g = spoitImage.data[1];
					let b = spoitImage.data[2];
					let a = $('#spoitAlphaCheck').is(':checked') ? spoitImage.data[3]/255 : 1;
					let spoitColor = 'rgba(' + r + ',' + g + ',' + b + ',' + a + ')';
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
		draw: function(ctx, action) {
			setStyle(action.line);
			eraseLine(ctx, action);
			//drawLine(ctx, action);
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
		draw: function(ctx, action) {
			fill(ctx, action);
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
		draw: function(ctx, action) {
			drawText(ctx, action);
		}
	};
	
	canvas.tools.sel = {
		onEvent: function(e) {
			switch (e.type) {
				case 'mousedown':
				case 'touchstart':
					startSelPreview(e);
					break;
				case 'mouseup':
				case 'mouseout':
				case 'mouseleave':
				case 'touchend':
				case 'touchcancel':
					if (canvas.previewStart) {
						stopSelPreview(e);
					}
			}
			if(canvas.previewStart) previewSel(e);
		},
		draw: function(ctx, action) {
			drawSelPaste(ctx, action);
		}
	}
	
	canvas.tools.object = {
		onEvent: function(e) {
			switch (e.type) {
				case 'mousedown':
				case 'touchstart':
					break;
				case 'mouseup':
				case 'mouseout':
				case 'mouseleave':
				case 'touchend':
				case 'touchcancel':
					selectObject(e);
					break;
			}
			checkObject(e);
		},
		draw: function(ctx, action) {
			//
		}
	}
	
	canvas.tools.filter = {
		onEvent: function(e) {
			//
		},
		draw: function(ctx, action) {
			drawFilter(ctx, action);
		}
	}

	canvas.tools.pict = {onEvent: function() {return}}
	canvas.tools.settings = {onEvent: function() {return}}
	
	$('#submit_button, #resSubmit').click(function() {
		commitAction(sketch.tool);
		mergeCanvas(canvas.tmpCtx, MERGE_TYPE.ALL_LAYER_BG);
		let imgData = canvas.tmpCtx.getImageData(0, 0, canvas.w, canvas.h);
		
		if (isOekakiDone) {
			let submitDialog = $('<div>', {id: 'submitDialog', title: '画像を投稿します'});
			let submitLayer = crCanvasEl('submitLayer', '', '');
			let submitCtx = submitLayer[0].getContext('2d');
			submitCtx.putImageData(imgData, 0, 0);
			submitDialog.append(submitLayer);
			submitDialog.dialog({
				modal: true,
				width: parseInt(canvas.w) + 50,
				buttons: {
					'書き込む': function() {
						sketch.context.putImageData(imgData, 0, 0);
						clearCanvas(canvas.tmpCtx);
						sketch.actions = canvas.layer.actions;
						sketch.baseImageURL = canvas.layer.baseImageURL;
						//canvas.layer.actions = [];
						$('#form1').submit();
						$(this).dialog('destroy');
						clearAllLayer();
					},
					'キャンセル': function() {
						$(this).dialog('destroy');
						oekaki.isOekakiDone = 1;
					}
				}
			});
			return false;
		}
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
				fool = false;
				canvas.marker.color = color.toRgbString();
				changeToolAction();
			},
			change: function(color) {
				fool = false;
				canvas.marker.color = color.toRgbString();
				changeToolAction();
			}
		});
		
		$('#psize').unbind();
		$('#psize').change(function() {
			if (sketch.tool == 'eraser') {
				canvas.eraser.width = $(this).val();
			} else {
				canvas.marker.width = $(this).val();
			}
			canvas.pointer.w = $(this).val();
			changeToolAction();
		});
		

		$(canvas).bind("ACTION_UPDATED",function(){

			$("#backButton").prop("disabled",canvas.layer.actions.length ? "" : true);
			$("#goBtn").prop("disabled",redoList.length ? "" : true);

		});

		$("#backButton").unbind();

		$("#backButton").prop("disabled","").click(function() {
			changeAction(canvas.layer.actions, redoList);
		});

		$('#goBtn').click(function(){
			changeAction(redoList, canvas.layer.actions)
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
		$('#canvasSize').change(function() {
			let size = $(this).val();
			if ((PC && checkCanvasSize(CANVAS_SIZE_PC, size)) || (!PC && checkCanvasSize(CANVAS_SIZE_MOB, size))) {
				$('#canvasSize2').val(size).trigger('change');
			}
			
			function checkCanvasSize(list, size) {
				for (let i in list) {
					if (list[i] == size) return true;
				}
				return false;
			}
		});
		$('#canvasSize2').change(function() {
			changeCanvasSize();
		});
		
		$("#saveButton").unbind();
		$("#saveButton").click(function(){
			let saveDialog = $('<div>', {id: 'saveDialog', title: '保存する画像を選択してください'});
			let saveImages = [];
			let mergeLayer = crCanvasEl('saveMergeLayer', '', '');
			let mergeCtx = mergeLayer[0].getContext('2d');
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
			}), br());
			for (let i in canvas.layers) {
				let saveLayer = crCanvasEl('saveLayer'+i, 'layerPreview', '');
				setCanvasSize(saveLayer[0], canvas.w, canvas.h, PREVIEW_SIZE);
				let ctx = saveLayer[0].getContext('2d');
				ctx.drawImage(canvas.layers[i].el[0], 0, 0);
				saveDialog.append(saveLayer);
				saveImages.push(saveLayer);
			}
			for (let i in saveImages) {
				let img = saveImages[i];
				img.click(function() {
					if ($(this).hasClass('selected')) {
						$(this).removeClass('selected');
					} else {
						$(this).addClass('selected');
					}
				});
			}
			saveDialog.append(br(), $('<font>', {color: 'red', size: 2, text: '※Chromeではダウンロードフォルダに画像ファイルがダウンロードされます。'}));
			saveDialog.append(br(), $('<font>', {color: 'red', size: 2, text: '※Chrome以外ではダウンロードできないため、画像を右クリックし「名前をつけて画像を保存」してください。'}), br());
			saveDialog.dialog({
				modal: true,
				width: parseInt(canvas.w) + 50,
				buttons: {
					'保存': function() {
						let pref =	["open2ch",new Date().getTime()].join("-");
						for (let i in saveImages) {
							let img = saveImages[i];
							if (img.hasClass('selected')) {
								let link = document.createElement('a');
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
			if (ls.pictMode) $('#pictIcon').click();
			if (pict.el) pict.el.remove();
			
			let img = new Image();
			let fileReader = new FileReader();
			fileReader.onload = function(event) {
				img.id = 'pict';
				img.src = event.target.result;
			}
			fileReader.readAsDataURL(file);
			img.onload = function() {
				if (ls.pictMode) {
					pict.el = $(img);
					pict.preview = img.cloneNode();
					pict.preview.id = 'pictPreview';
					setPictCrop();
				} else {
					fitImage(canvas.layer.ctx, img);
					sketch.setBaseImageURL(canvas.layer.el[0].toDataURL());
				}
				redraw();
				isOekakiDone = 1;
			};
		}
		funcDragAndDrop = function() {
			let droppable = canvas.inputEl;
			let cancelEvent = function(event) {
				droppable.css('border', '2pt dashed #444');
				event.preventDefault();
				event.stopPropagation();
				return false;
			}
			let handleDroppedFile = function(event) {
				cancelEvent(event);
				let file = event.originalEvent.dataTransfer.files[0];
				droppable.css('border', '');
				setFile(file);
				redraw();
				return false;
			}
			let handleDragOver = function(event) {
				cancelEvent(event);
				return false;
			}
			let handleDragLeave = function(event) {
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
		
		set_imgur_to_oekaki = function(url) {

			alert("set_imgur_to_oekaki:" + url);

			if (ls.pictMode) $('#pictIcon').click();
			if (pict.el) pict.el.remove();

			let img = new Image();
			img.id = 'pict';
			img.src = url;
			img.onload = function() {
				if (ls.pictMode) {
					pict.el = $(img);
					pict.preview = img.cloneNode();
					pict.preview.id = 'pictPreview';
					setPictCrop();
				} else {
					fitImage(canvas.layer.ctx, img);
					sketch.setBaseImageURL(canvas.layer.el[0].toDataURL());
				}
				redraw();
				isOekakiDone = 1;
			};
		}
		
		sketch.setBaseImageURL = function(url) {
			canvas.layer.baseImageURL = url;
			canvas.layer.baseImageCache = '';
			canvas.layer.actions = [];
			$(canvas).trigger("ACTION_UPDATED");
			redraw();
		}

		sketch.clear = function() {
			clearCanvas(sketch.context);
			if (canvas.bgcolor.grad) {
				let grad;
				if ($('#gradTypeSelect').val() == 'liner_h') {
					grad = sketch.context.createLinearGradient(0, 0, canvas.w, 0);
				} else if ($('#gradTypeSelect').val() == 'liner_v') {
					grad = sketch.context.createLinearGradient(0, 0, 0, canvas.h);
				} else if ($('#gradTypeSelect').val() == 'liner_lr') {
					grad = sketch.context.createLinearGradient(0, 0, canvas.w, canvas.h);
				} else if ($('#gradTypeSelect').val() == 'liner_lu') {
					grad = sketch.context.createLinearGradient(0, canvas.h, canvas.w, 0);
				} else {
					let x0 = x1 = canvas.w/2;
					let y0 = y1 = canvas.h/2;
					let r0 = 0;
					let r1 = (x1 > y1) ? x1 : y1;
					grad = sketch.context.createRadialGradient(x0, y0, r0, x1, y1, r1);
				}
				for (let i = 0; i < canvas.bgcolor.el.length; i++) {
					let el = canvas.bgcolor.el[i];
					let p = el.style.left.replace('%', '')/100;
					let c = $(el).css('background-color');
					grad.addColorStop(p, c);
				}
				sketch.context.fillStyle = grad;
			} else {
				sketch.context.fillStyle = sketch.bgcolor;
			}
			sketch.context.fillRect(0, 0, canvas.w, canvas.h);
		}
		
		handleDroppedFile = function(event, _files) {
			if (!window.FileReader) {
					alert("File APIがサポートされていないブラウザなので、imgurl自動変換は使えないようです。(推奨ブラウザchrome)");
					return false;
			}
			$_this = $(this);
			$_this.trigger("uploading");
			let files = _files ? _files : event.originalEvent.dataTransfer.files;
			uploadImgur(files, 0);
			cancelEvent(event);
			return false;

			function uploadImgur(files, targetNum) {
				let msgEl = $(".uploadingMessage");
				let clientIDList = ['ed3688de8608b9d', '748d59c92850044', '34644a43024038f', '0eded37ec44c993'];
				$.each(files, function(index, file) {
						let fileReader = new FileReader();
						fileReader.onload = function(e) {
								e.preventDefault();
								let data = e.target.result;
								data = new String(data).replace(/^[^,]+;base64,/, "");
								$.ajax({
										dataType: 'json',
										headers: {
												"Authorization": 'Client-ID ' + clientIDList[targetNum]
										},
										url: "https://api.imgur.com/3/image.json",
										type: "POST",
										data: {
												image: data
										},
										success: function(res) {
											console.log(res);
											let dhash = res.data.deletehash;
											let link = res.data.link;
											$_this.trigger("uploadComplete", [link, dhash]);
										},
										error: function(res) {
											let resObj = JSON.parse(res.responseText);
											console.log(resObj);
											msgEl.append($('<div>', {class: 'errmsg', text: resObj.data.error}));
											if (clientIDList.length > ++targetNum) {
												msgEl.append($('<div>', {class: 'errmsg', text: '別のアップロード先に切り替えます。'}));
												uploadImgur(files, ++targetNum);
											} else {
												msgEl.append($('<div>', {class: 'errmsg', text: 'アップロードできませんでした。'}));
											}
										}
								});
						}
						fileReader.readAsDataURL(file);
				});
			}
		}
		$("[name=MESSAGE]").unbind("drop")
		$("[name=MESSAGE]").bind("drop", handleDroppedFile);
		
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
		$('#copyLayerBtn').click(copyLayer);
		$('#mergeLayerBtn').click(mergeTwoLayer);
		$('#deleteLayerBtn').click(function(){deleteLayer(true)});
		$('#layerBlendSelect').change(function() {changeLayerBlend($(this).val())});
	}

}

function draw(e) {
	if (e.originalEvent && e.originalEvent.targetTouches) {
		e.pageX = e.originalEvent.targetTouches[0].pageX;
		e.pageY = e.originalEvent.targetTouches[0].pageY;
	}
	e.preventDefault();
	showPointer(e);
	canvas.tools[sketch.tool].onEvent(e);
}

this.setLiteModeEvent = function(){
	ls.pictMode = false;
	
	getPosition = function(e) {
		let offset = canvas.layer.el.offset();
		let offsetX = offset.left;
		let offsetY = offset.top;
		let x = e.pageX - offsetX;
		let y = e.pageY - offsetY;

		return {x: x, y: y};
	}
	
	startDraw = function(ctx, action) {
		let line = action.line;
		ctx.globalCompositeOperation = line.comp;
		ctx.lineJoin = line.join;
		ctx.lineCap = line.cap;
		ctx.lineWidth = line.width;
		ctx.strokeStyle = line.color;
		ctx.beginPath();
		ctx.moveTo(action.events[0].x, action.events[0].y);
	}
}

this.setHighModeEvent = function() {
	addSelectOption('mrkTypeSelect', MARKER_TYPE.SPRAY, 'スプレー');
	addSelectOption('mrkTypeSelect', MARKER_TYPE.SHARP, 'シャープ');
	//addSelectOption('mrkTypeSelect', MARKER_TYPE.CORRECT, '入り抜き補正');
	canvas.tools.marker.draw = function(ctx, action) {
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
		let p = getPosition(e);
		canvas.action.events.push({x: p.x, y: p.y});
		clearCanvas(canvas.previewCtx);
		canvas.previewCtx.drawImage(canvas.layer.el[0], 0, 0);
		switch (canvas.action.line.type) {
			case MARKER_TYPE.SPRAY:
				sprayLine(canvas.previewCtx, canvas.action);
				break;
			default:
				drawLine(canvas.previewCtx, canvas.action);
		}
	}
	
	startMarkerPreview = function(e) {
		canvas.previewStart = Date.now();
		clearCanvas(canvas.previewCtx);
		canvas.previewCtx.drawImage(canvas.layer.el[0], 0, 0);
		canvas.layer.el.css('visibility', 'hidden');
		let p = getPosition(e);
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
			events: [{x: p.x, y: p.y}],
			seq: seq++,
			delete: false
		};
		setStyle(canvas.action.line);
		startDraw(canvas.previewCtx, canvas.action);


		previewMarker(e);
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
			default:
				if(ls.correctLv > 0) {
					canvas.action.events = getExtractPoints(canvas.action.events, parseInt(ls.correctLv)+1);
					canvas.action.events = getSplinePoints(canvas.action.events, parseInt(ls.correctLv)*5);
				}
				drawLine(canvas.layer.ctx, canvas.action);
		}
		clearCanvas(canvas.previewCtx);
		canvas.layer.el.css('visibility', '');
		canvas.style = '';
		canvas.layer.actions.push(canvas.action);
		$(canvas).trigger("ACTION_UPDATED");

		updateLayerPreview();
	}
	
	previewEraser = function(e){
		let p = getPosition(e);
		canvas.action.events.push({x: p.x, y: p.y});
		clearCanvas(canvas.previewCtx);
		canvas.previewCtx.drawImage(canvas.layer.el[0], 0, 0);
		eraseLine(canvas.previewCtx, canvas.action);
		//drawLine(canvas.previewCtx, canvas.action);
	}
}

function showPointer(e) {
	if (!PC || !ls.guide) return;
	let p = getPosition(e);
	canvas.inputCtx.clearRect(0, 0, canvas.w, canvas.h);
	canvas.inputCtx.beginPath();
	canvas.inputCtx.arc(p.x, p.y, canvas.pointer.w/2, 0, Math.PI*2, false);
	canvas.inputCtx.stroke();
}

function crBgcolorSlider() {
	canvas.bgcolor.values = [0, 100];
	let color = sketch.bgcolor;
	canvas.bgcolor.colors = [color, color];
	initSlider();
}

this.initCanvas = function() {
	addLayer();
	canvas.layer = canvas.layers[0];
	canvas.layer.actions = convertActions(sketch.actions);
	canvas.layer.baseImageURL = sketch.baseImageURL;
	canvas.layer.baseImageCache = sketch.baseImageCache;
	canvas.layer.preview.el.addClass('selected');
	sketch.actions = [];
	$(canvas).trigger("ACTION_UPDATED");

	sketch.baseImageURL = '';
	sketch.baseImageCache = '';
	sketch.clear();
	redraw();
}

function convertActions(actions) {
	let newActions = [];
	for (let i in actions) {
		let action = actions[i];
		action.line = {};
		action.line.type = MARKER_TYPE.NORMAL;
		action.line.width = action.size;
		action.line.color = action.color;
		action.line.cap = LINE_CAP.R;
		action.line.join = LINE_JOIN.R;
		newActions.push(action);
	}
	$(canvas).trigger("ACTION_UPDATED");
	return newActions;
}

function addLayer() {
	if (canvas.layers.length >= MAX_LAYER) return; 
	crLayer();
}

function crLayer() {
	let num = canvas.layers.length;
	let layer = crCanvasEl('layer' + num, 'layer', num);
	canvas.layers[num] = {
		el: layer,
		ctx: layer[0].getContext('2d'),
		index: num,
		display: true,
		preview: {},
		actions: [],
		baseImageURL: '',
		baseImageCache: '',
		alpha: 100,
		blend: 'normal',
		name: 'レイヤ' + (1+num)
	}
	$('#previewCanvas').before(layer);
	setCanvasSize(layer[0], canvas.w, canvas.h, canvas.scale);
	crLayerPreview(num);

	selectLayer(num);
}

function crLayerPreview(num) {
	let layerPreviewDiv = $('<div>', {class: 'layerPreviewDiv'});
	let layerNameDisp = $('<div>', {class: 'layerNameDisp'});
	let layerNameInput = $('<input>', {class: 'layerNameInput'});
	let layerPreview = crCanvasEl('layerPreview' + num, 'layerPreview', num);

	layerNameDisp.text(canvas.layers[num].name);
	layerNameDisp.dblclick(function() {
		layerNameDisp.hide();
		layerNameInput.val(canvas.layers[num].name);
		layerNameInput.show();
		layerNameInput.focus();
	});
	layerNameInput.keypress(function(e) {
		if ((e.which && e.which == 13) || (e.keyCode && e.keyCode == 13)) {
			layerNameInput.blur();
			return false;
		}
	});
	
	layerNameInput.focusout(function() {
		layerNameDisp.show();
		layerNameInput.hide();
		canvas.layers[num].name = $(this).val();
		layerNameDisp.text(canvas.layers[num].name);
		console.log($(this).val());
	});

	layerPreview.click(function() {selectLayer(num)});
	canvas.layers[num].preview.el = layerPreview;
	canvas.layers[num].preview.ctx = layerPreview[0].getContext('2d');
	$('#layerPreviewBox').append(layerPreviewDiv.append(layerNameDisp, layerNameInput, layerPreview));
	setCanvasSize(layerPreview[0], canvas.w, canvas.h, PREVIEW_SIZE);
}

function selectLayer(num) {
	//log('selectLayer->' + num);
	let layerNum = canvas.layerNum;
	if (num == layerNum) return;
		
	let oldLayer = canvas.layers[layerNum];
	let newLayer = canvas.layers[num];
	oldLayer.preview.el.removeClass('selected');
	newLayer.preview.el.addClass('selected');
	canvas.layerNum = num;
	canvas.layer = newLayer;
	canvas.previewEl.css('z-index', num);
	$('#layerAlphaSlider').slider({value: canvas.layer.alpha});
	$('#layerBlendSelect').val(canvas.layer.blend);
	changeLayerAlpha(canvas.layer.alpha);
	changeLayerBlend(canvas.layer.blend);
	redraw();
}

function updateLayerPreview() {
	//log('updateLayerPreview');
	let layer = canvas.layers[canvas.layerNum];
	let preview = layer.preview;
	let imgData = layer.ctx.getImageData(0, 0, canvas.w, canvas.h);
	preview.ctx.putImageData(imgData, 0, 0);
	
	let layerPreviewDisplay = preview.el.parent().children('.layerNameDisp');
	layerPreviewDisplay.text(layer.name);

	$(canvas).trigger("ACTION_UPDATED");


}
	
function changeLayerDisplay() {
	//log('changeLayerDisplay');
	let layer = canvas.layers[canvas.layerNum];
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
	//log('changeLayer-> ' + move);
	let oldNum = canvas.layerNum;
	let newNum = canvas.layerNum + move;
	if (newNum < 0 || newNum >= canvas.layers.length) return;
	canvas.layerNum = newNum;
	let oldLayer = canvas.layer;
	let newLayer = canvas.layers[newNum];
	let tmpLayer = {};
	
	tmpLayer.display = newLayer.display;
	tmpLayer.actions = newLayer.actions;
	tmpLayer.layerClass = newLayer.el[0].className;
	tmpLayer.previewClass = newLayer.preview.el[0].className;
	tmpLayer.baseImageURL = newLayer.baseImageURL;
	tmpLayer.baseImageCache = newLayer.baseImageCache;
	tmpLayer.alpha = newLayer.alpha; 
	tmpLayer.blend = newLayer.blend;
	tmpLayer.name = newLayer.name;
	
	newLayer.display = oldLayer.display;
	newLayer.actions = oldLayer.actions;
	newLayer.el[0].className = oldLayer.el[0].className;
	newLayer.preview.el[0].className = oldLayer.preview.el[0].className;
	newLayer.baseImageURL = oldLayer.baseImageURL;
	newLayer.baseImageCache = oldLayer.baseImageCache;
	newLayer.alpha = oldLayer.alpha;
	newLayer.blend = oldLayer.blend;
	newLayer.name = oldLayer.name;
	
	oldLayer.display = tmpLayer.display;
	oldLayer.actions = tmpLayer.actions;
	oldLayer.el[0].className = tmpLayer.layerClass;
	oldLayer.preview.el[0].className = tmpLayer.previewClass;
	oldLayer.baseImageURL = tmpLayer.baseImageURL;
	oldLayer.baseImageCache = tmpLayer.baseImageCache;
	oldLayer.alpha = tmpLayer.alpha;
	oldLayer.blend = tmpLayer.blend;
	oldLayer.name = tmpLayer.name;
	
	selectLayer(oldNum);
	selectLayer(newNum);

}

function deleteLayer(confirmFlag) {
	if (canvas.layers.length == 1 || (confirmFlag && !confirm('選択中のレイヤを削除します。よろしいですか？'))) return;
	
	let layerNum = canvas.layerNum;
	let endNum = canvas.layers.length - 1;
	for (let i = 0; i < endNum - layerNum; i++) {
		changeLayer(1);
	}
	selectLayer(layerNum < endNum ? layerNum : endNum - 1);
	
	let removeLayer = canvas.layers[endNum];
	removeLayer.el.remove();
	removeLayer.preview.el.parent().remove();
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
			let img = new Image();
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
			canvas.tools[this.tool].draw(ctx, this);
		}
	});
	updateLayerPreview();
}

function changeLayerAlpha(alpha) {
	$('#layerAlphaText').text('不透明度：' + alpha);
	let layer = canvas.layers[canvas.layerNum];
	//layer.ctx.globalAlpha = alpha/100;
	//redraw();
	canvas.previewEl.css('opacity', alpha/100);
	layer.el.css('opacity', alpha/100);
	layer.alpha = alpha;
}

function changeLayerBlend(blend) {
	let layer = canvas.layers[canvas.layerNum];
	canvas.previewEl.css('mix-blend-mode', blend);
	layer.el.css('mix-blend-mode', blend);
	layer.blend = blend;
}

function changeToolAction() {
	switch (sketch.tool) {
		case TOOL.PATH:
			if (canvas.action) {
				canvas.action.path.type = $('#pathTypeSelect').val();
				canvas.action.width = canvas.marker.width;
				canvas.action.color = canvas.marker.color;
				previewPath();
			}
			break;
	}
}

function startMarkerPreview(e) {
	canvas.previewStart = Date.now();
	clearCanvas(canvas.previewCtx);
	let p = getPosition(e);
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
		events: [{x: p.x, y: p.y}],
		seq: seq++
	};
	setStyle(canvas.action.line);
	startDraw(canvas.previewCtx, canvas.action);
}

function stopMarkerPreview() {
	stopDraw(canvas.previewCtx);
	canvas.previewStart = '';
	canvas.marker.seed = '';
	if(ls.correctLv > 0) {
		canvas.action.events = getExtractPoints(canvas.action.events, parseInt(ls.correctLv)+1);
		canvas.action.events = getSplinePoints(canvas.action.events, parseInt(ls.correctLv)*5);
	}
	drawLine(canvas.layer.ctx, canvas.action);
	clearCanvas(canvas.previewCtx);
	canvas.style = '';
	canvas.layer.actions.push(canvas.action);
	$(canvas).trigger("ACTION_UPDATED");

	updateLayerPreview();
}

function previewMarker(e) {
	let p = getPosition(e);
	canvas.action.events.push({x: p.x, y: p.y});
	canvas.previewCtx.lineTo(p.x, p.y);
	stopDraw(canvas.previewCtx);
	let action = {
		tool: canvas.action.tool,
		line: canvas.action.line,
		events: [{x: p.x, y: p.y}]
	}
	startDraw(canvas.previewCtx, action);
}

function startDraw(ctx, action) {
	let grad;
	if (fool) {
		let colors = ['#2D4', '#2D4', '#F45', '#F45', '#FFF', '#2D4', '#2D4', '#F45', '#F45', '#FFF', 
									'#2D4', '#2D4', '#F45', '#F45', '#FFF', '#2D4', '#2D4', '#F45', '#F45', '#FFF', 
									'#2D4', '#2D4', '#F45', '#F45', '#FFF', '#2D4', '#2D4', '#F45', '#F45', '#FFF', 
									'#2D4', '#2D4', '#F45', '#F45', '#FFF', '#2D4', '#2D4', '#F45', '#F45', '#FFF',
									'#2D4', '#2D4', '#F45', '#F45', '#FFF', '#2D4', '#2D4', '#F45', '#F45', '#FFF', 
									'#2D4', '#2D4', '#F45', '#F45', '#FFF', '#2D4', '#2D4', '#F45', '#F45', '#FFF', 
									'#2D4', '#2D4', '#F45', '#F45', '#FFF', '#2D4', '#2D4', '#F45', '#F45', '#FFF', 
									'#2D4', '#2D4', '#F45', '#F45', '#FFF', '#2D4', '#2D4', '#F45', '#F45', '#FFF',
									'#2D4', '#2D4', '#F45', '#F45', '#FFF', '#2D4', '#2D4', '#F45', '#F45', '#FFF', 
									'#2D4', '#2D4', '#F45', '#F45', '#FFF', '#2D4', '#2D4', '#F45', '#F45', '#FFF', 
									'#2D4', '#2D4', '#F45', '#F45', '#FFF', '#2D4', '#2D4', '#F45', '#F45', '#FFF', 
									'#2D4', '#2D4', '#F45', '#F45', '#FFF', '#2D4', '#2D4', '#F45', '#F45', '#FFF',];
		grad = ctx.createLinearGradient(0, 0, canvas.w, canvas.h);
		for (let i in colors) {
			let s = 1 / (colors.length-1) * i;
			grad.addColorStop(s, colors[i]);
		}
	}
	
	let line = action.line;
	ctx.globalCompositeOperation = line.comp;
	ctx.lineJoin = line.join;
	ctx.lineCap = line.cap;
	ctx.lineWidth = line.width;
	ctx.strokeStyle = fool ? grad : canvas.style;
	ctx.beginPath();
	ctx.moveTo(action.events[0].x, action.events[0].y);
}

function stopDraw(ctx) {
	ctx.stroke();
	ctx.globalCompositeOperation = COMP.DEF;
}

function drawLine(ctx, action) {
	if (action.delete) return;
	
	startDraw(ctx, action);
	for (let i in action.events) {
		let e = action.events[i];
		ctx.lineTo(e.x, e.y);
	}
	stopDraw(ctx);
}

function sprayLine(ctx, action) {
	let events = action.events;
	let w = action.line.width/2;
	let a = clone(action);
	for (let i in events) {
		let e = events[i];
		let e0 = {x: w, y: w}
		let e1 = {x: w, y: w+1}
		a.events = [e0, e1];
		ctx.translate(e.x - w, e.y - w);
		drawLine(ctx, a);
		ctx.translate(w-e.x, w-e.y);
	}
}

function sharp(ctx, action) {
	let th = 0.6;
	let rgba = splitRGBA(action.line.color);
	let imageData = ctx.getImageData(0, 0, canvas.w, canvas.h);
	let data = imageData.data;

	for (let x = 0; x	< canvas.w; x++) {
		for (let y = 0; y < canvas.h; y++) {
			let i = (x + y * canvas.w) * 4;
			let a = data[i + 3];
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

function startCustomPreview(e) {
	canvas.previewStart = Date.now();
	clearCanvas(canvas.previewCtx);
	let p = getPosition(e);

	canvas.action = {
		tool: sketch.tool,
		line: clone(canvas.marker),
		events: [{x: p.x, y: p.y}]
	};
	setStyle(canvas.action.line);
	startCustomDraw(canvas.previewCtx, canvas.action);
}

function stopCustomPreview() {
	stopCustomDraw(canvas.previewCtx);
	canvas.previewStart = '';
	correctLine(canvas.layer.ctx, canvas.action);
	clearCanvas(canvas.previewCtx);
	canvas.style = '';
	canvas.layer.actions.push(canvas.action);
	$(canvas).trigger("ACTION_UPDATED");

	updateLayerPreview();
}

function previewCustom(e) {
	let p = getPosition(e);
	canvas.action.events.push({x: p.x, y: p.y});
	canvas.previewCtx.lineTo(p.x, p.y);
	stopCustomDraw(canvas.previewCtx);
	let action = {
		tool: canvas.action.tool,
		line: canvas.action.line,
		events: [{x: p.x, y: p.y}]
	}
	startCustomDraw(canvas.previewCtx, action);
}

function startCustomDraw(ctx, action) {
	let line = action.line;
	ctx.globalCompositeOperation = line.comp;
	ctx.lineJoin = line.join;
	ctx.lineCap = line.cap;
	ctx.lineWidth = line.width;
	ctx.strokeStyle = canvas.style;
	ctx.beginPath();
	ctx.moveTo(action.events[0].x, action.events[0].y);
}

function stopCustomDraw(ctx) {
	ctx.stroke();
	ctx.globalCompositeOperation = COMP.DEF;
}

function drawCustomLine(ctx, action) {
	startCustomDraw(ctx, action);
	for (let i in action.events) {
		let e = action.events[i];
		ctx.lineTo(e.x, e.y);
	}
	stopCustomDraw(ctx);
}

function startPath(e) {
	let p = getPosition(e);
	canvas.layer.el.css('visibility', 'hidden');
	clearCanvas(canvas.previewCtx);
	canvas.previewCtx.drawImage(canvas.layer.el[0], 0, 0);
	
	switch (canvas.path.state) {
		case PATH_STATE.INIT:
			if (canvas.path.mode == 'click') {
				canvas.action = {
					tool: sketch.tool,
					comp: $('#pathEraseCheck').is(':checked') ? canvas.eraser.comp : canvas.marker.comp,
					width: canvas.marker.width,
					color: $('#pathEraseCheck').is(':checked') ? 'rgb(0, 0, 0)' : canvas.marker.color,
					path: {
						type: $('#pathTypeSelect').val(),
						ap: []
					},
					events: []
				}
			} else {
				canvas.previewStart = Date.now();
				canvas.action = {
					tool: sketch.tool,
					comp: $('#pathEraseCheck').is(':checked') ? canvas.eraser.comp : canvas.marker.comp,
					width: canvas.marker.width,
					color: $('#pathEraseCheck').is(':checked') ? 'rgb(0, 0, 0)' : canvas.marker.color,
					path: {
						type: $('#pathTypeSelect').val(),
						op: [p]
					}
				}
				startFreePath(canvas.previewCtx, canvas.action);
				canvas.path.state = PATH_STATE.DRAW;
				break;
			}
		case PATH_STATE.NONE:
			canvas.path.state = PATH_STATE.MOVE;

			let i = checkPoint(canvas.previewCtx, p, canvas.action.path.ap, 'red');
			if (i < 0) {
				canvas.action.path.ap.push(p);
				canvas.path.mp = canvas.action.path.ap.length-1;
			} else {
				canvas.path.mp = i;
			}
			break;
	}
}

function startFreePath(ctx, action) {
	ctx.globalCompositeOperation = action.comp;
	ctx.lineWidth = action.width;
	ctx.strokeStyle = action.color;
	ctx.beginPath();
	ctx.moveTo(action.path.op[0].x, action.path.op[0].y);
}

function stopFreePath(ctx) {
	ctx.stroke();
	ctx.globalCompositeOperation = COMP.DEF;
}

function stopPath() {
	switch (canvas.path.state) {
		case PATH_STATE.MOVE:
			canvas.path.state = PATH_STATE.NONE;
			let i = checkPoint(canvas.previewCtx, canvas.path.lp, canvas.action.path.ap, 'red');
			if (i >= 0) canvas.action.path.ap[canvas.path.mp] = canvas.action.path.ap[i];
			canvas.path.mp = -1;
			break;
		case PATH_STATE.DRAW:
			stopFreePath(canvas.previewCtx);
			canvas.previewStart = '';
			canvas.action.path.ap = getExtractPoints(canvas.action.path.op, canvas.path.extract);
			canvas.path.state = PATH_STATE.NONE;
	}
}

function getExtractPoints(op, ext) {
	let ap = [];
	for (let i in op) {
		if(i%ext == 0) {
			ap.push(op[i]);
		}
	}
	return ap;
}

function commitPath() {
	if (canvas.path.state != PATH_STATE.INIT) {
		canvas.path.state = PATH_STATE.INIT;
		drawPath(canvas.layer.ctx, canvas.action);
		clearCanvas(canvas.previewCtx);
		canvas.layer.actions.push(canvas.action);
		$(canvas).trigger("ACTION_UPDATED");
	
		canvas.action = '';
		canvas.layer.el.css('visibility', '');
		updateLayerPreview();
	}
}

function previewPath(e) {
	switch (canvas.path.state) {
		case PATH_STATE.INIT:
			break;
		case PATH_STATE.NONE:
		case PATH_STATE.MOVE:
			let p = e ? getPosition(e) : {x: 0, y: 0};

			let ap = canvas.action.path.ap;
			switch (canvas.action.path.type) {
				case 'line':
					canvas.action.events = ap;
					break;
				case 'spline':
					if (ap.length > 1) {
						canvas.action.events = getSplinePoints(ap, canvas.path.interpolate);
					} else {
						canvas.action.events = ap;
					}
					break;
			}

			switch (canvas.path.state) {
				case PATH_STATE.MOVE:
					canvas.action.path.ap[canvas.path.mp] = p;
					clearCanvas(canvas.previewCtx);
					canvas.previewCtx.drawImage(canvas.layer.el[0], 0, 0);
					drawPath(canvas.previewCtx, canvas.action);
					drawAnchors(canvas.previewCtx, canvas.action.path.ap);
					checkPoint(canvas.previewCtx, p, canvas.action.path.ap, 'red');
					break;
				case PATH_STATE.NONE:
					clearCanvas(canvas.previewCtx);
					canvas.previewCtx.drawImage(canvas.layer.el[0], 0, 0);
					drawPath(canvas.previewCtx, canvas.action);
					drawAnchors(canvas.previewCtx, canvas.action.path.ap);
					checkPoint(canvas.previewCtx, p, canvas.action.path.ap, 'red');
					break;
			}

			canvas.path.lp = p;
			break;
		case PATH_STATE.DRAW:
			{
				let p = getPosition(e);
				canvas.action.path.op.push({x: p.x, y: p.y});
				canvas.previewCtx.lineTo(p.x, p.y);
				stopFreePath(canvas.previewCtx);
				let action = {
					tool: canvas.action.tool,
					comp: canvas.action.comp,
					width: canvas.action.width,
					color: canvas.action.color,
					path: {op:[p]}
				}
				startFreePath(canvas.previewCtx, action);
			}
			break;
	}
}

function checkPoint(ctx, pos, points, color) {
	let r = $('#pathAnchorSizeSelect').val();
	for (let i = points.length-1; i >= 0; i--) {
		if (i != canvas.path.mp) {
			let p = points[i];
			if (checkInner(p.x, p.y, r, pos.x, pos.y)) {
				drawCircle(ctx, p.x, p.y, r, 2, color, true);
				return i;
			}
		}
	}
	return -1;
}

function checkInner(x, y, r, cx, cy) {
	let dx2 = Math.pow(x - cx, 2);
	let dy2 = Math.pow(y - cy, 2);
	let dr2 = dx2 + dy2;
	let r2 = Math.pow(r, 2);
	return r2 > dr2 ? true : false;
}

function drawPath(ctx, action) {
	ctx.globalCompositeOperation = action.comp;
	ctx.lineCap = LINE_CAP.R;
	ctx.lineJoin = LINE_JOIN.R;
	ctx.lineWidth = action.width;
	let events = action.events;
	ctx.beginPath();
	ctx.moveTo(events[0].x, events[0].y);
	for (let i in events) {
		let e = events[i];
		ctx.lineTo(e.x, e.y);
	}
	ctx.strokeStyle = action.color;
	ctx.stroke();
	ctx.globalCompositeOperation = COMP.DEF;
}

function drawAnchors(ctx, ap) {
	let r = $('#pathAnchorSizeSelect').val();
	for (let i in ap) {
		let a = ap[i];
		drawCircle(ctx, a.x, a.y, r, 1, 'blue');
	}
}
	
function drawCircle(ctx, x, y, r, w, color, fill) {
	ctx.beginPath();
	ctx.lineWidth = w;
	ctx.arc(x, y, r, Math.PI*2, false);
	if (fill) {
		ctx.fillStyle = color;
		ctx.fill();
	} else {
		ctx.strokeStyle = color;
		ctx.stroke();
	}
}

function getSplinePoints(ap, interpolate) {
	let a0 = ap[0];
	let p = [a0];
	for (let i = 1; i < ap.length; i++) {
		let a1 = ap[i];
		if (a0.x != a1.x || a0.y != a1.y) p.push(a1);
		a0 = a1;
	}
	
	if (p.length < 2) {
		return ap;
	}	else {
		return splineStream(p, interpolate);
	}
}

function startFigurePreview(e) {
	canvas.previewStart = Date.now();
	let p = getPosition(e);
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
	$(canvas).trigger("ACTION_UPDATED");
	
	updateLayerPreview();
}

function previewFigure(e) {
	let p = getPosition(e);
	canvas.action.events[1] = p;
	clearCanvas(canvas.previewCtx);
	drawFigure(canvas.previewCtx, canvas.action);
}

function drawFigure(ctx, action) {
	let e0 = action.events[0];
	let e1 = action.events[1];

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
			{
				let dx = Math.abs(e0.x-e1.x)/2;
				let dy = Math.abs(e0.y-e1.y)/2;
				let r = Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));
				//let l = dx > dy ? dx : dy;
				//ctx.save();
				//ctx.scale(dx/l, dy/l);
				
				ctx.strokeStyle = action.color;
				ctx.arc((e0.x + e1.x)/2, (e0.y + e1.y)/2, r, 0, Math.PI*2, false);
				ctx.stroke();
				//ctx.restore();
			}
			break;
		case 'fillCircle':
			{
				let dx = Math.abs(e0.x-e1.x)/2;
				let dy = Math.abs(e0.y-e1.y)/2;
				let r = Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));
				ctx.fillStyle = action.color;
				ctx.arc((e0.x + e1.x)/2, (e0.y + e1.y)/2, r, 0, Math.PI*2, false);
				ctx.fill();
			}
			break;
	}
}

function crSeed(digits) {
	let seed = '';
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
			let p = PENCIL_SIZE;
			setCanvasSize(canvas.patEl[0], p, p, 1);
			let imageData = canvas.patCtx.createImageData(p, p);
			let data = imageData.data;
			let rgba = splitRGBA(line.color);
			for (let x = 0; x	< p; x++) {
				for (let y = 0; y < p; y++) {
					let i = (x + y * p) * 4;
                    let a = line.seed[i/4]*1.5/10;
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
			{
				let p = line.width;
				let ph = p/2;
				let r2 = Math.pow(ph, 2);
				setCanvasSize(canvas.patEl[0], p, p, PENCIL_SIZE/p);
				let imageData = canvas.patCtx.createImageData(p, p);
				let data = imageData.data;
				let rgba = splitRGBA(line.color);
				for (let x = 0; x	< p; x++) {
					for (let y = 0; y < p; y++) {
						let i = (x + y * p) * 4;
						let a2 = Math.pow(ph - x, 2);
						let b2 = Math.pow(ph - y, 2);
						data[i + 0] = rgba.r;
						data[i + 1] = rgba.g;
						data[i + 2] = rgba.b;
						data[i + 3] = rgba.a * 255 * line.seed[i/4]/40 * (1 - (a2 + b2) / r2);
					}
				}
				imageData.data = data;
				canvas.patCtx.putImageData(imageData, 0, 0);
			}
			break;
		case MARKER_TYPE.PATTERN:
			let ctx = canvas.patCtx;
			switch (line.pat.type) {
				case PAT_TYPE.DOT:
					{
						let r = parseFloat(line.pat.size);
						let hs = parseFloat(line.pat.hspace);
						let vs = parseFloat(line.pat.vspace);
						let x = hs + r;
						let y = vs + r;
						setCanvasSize(canvas.patEl[0], x + r, y + r, 0);

						ctx.beginPath();
						ctx.arc(x, y, r, 0, 2 * Math.PI, false);
						ctx.fillStyle = line.color;
						ctx.fill();
					}
					break;
				case PAT_TYPE.STAR:
					{
						let r = parseFloat(line.pat.size);
						let p = parseInt(line.pat.point);
						let m = parseFloat(line.pat.round);
						let hs = parseFloat(line.pat.hspace);
						let vs = parseFloat(line.pat.vspace);
						let x = hs + r;
						let y = vs + r;
						setCanvasSize(canvas.patEl[0], x + r, y + r, 0);
						
						star(ctx, line.color, x, y, r, p, m);
					}
					break;
				case PAT_TYPE.LINE:
					{
						let hw = parseFloat(line.pat.lineHSize);
						let vw = parseFloat(line.pat.lineVSize);
						let hs = parseFloat(line.pat.hspace);
						let vs = parseFloat(line.pat.vspace);
						let x = hs + hw/2;
						let y = vs + vw/2;
						let w = hs + hw;
						let h = vs + vw;
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
			}
			break;
	}
	
	return canvas.patCtx.createPattern(canvas.patEl[0], 'repeat');
}

function startFill(e) {

	let p = getPosition(e);

	let action = {
		tool: sketch.tool,
			x: Math.floor(p.x),
			y: Math.floor(p.y),
			color: canvas.marker.color,
			alphaCheck: $('#fillAlphaCheck').is(':checked')
	};
	canvas.layer.actions.push(action);
	$(canvas).trigger("ACTION_UPDATED");

	fill(canvas.layer.ctx, action);
}

let seeds;
let getColor;
let fillCanvas;
function fill(ctx, action) {
	fillCanvas = ctx.getImageData(0, 0, canvas.layer.el[0].width, canvas.layer.el[0].height);
	
	getColor = getRGBA;
	fillColor = fillRGBA;
	
	let rgba = action.color.match(/(\d|\.)+/g);
	let alpha;
    if(rgba[3] == undefined){
        alpha = 255;
    }else{
        alpha = parseInt(Number(rgba[3] * 255));
    }
	let color = ((Number(rgba[0]) << 24) + (Number(rgba[1]) << 16) + (Number(rgba[2]) << 8) + alpha)>>>0;
	let target = getColor(action.x, action.y);
	seeds = [{
		x: action.x,
		y: action.y
	}];
	
	while (seeds.length > 0) {
		let seed = seeds.shift();
		paint(seed.x, seed.y, color, target);
	}
		
	ctx.putImageData(fillCanvas, 0, 0);
	updateLayerPreview();
}

function paint(x, y, c, target) {
	let color = getColor(x, y);
	if (color == c) return;
	
	fillColor(x, y, c);
	
	let rX = x + 1;
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
	
	let lX = x - 1;
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
	if (y+1 < canvas.tmpEl[0].height) scanSeed(lX, rX, y+1, target);
}

function scanSeed(lX, rX, y, target) {
	let seed = false;
	
	for (let x = lX+1; x < rX; x++) {
		let color = getColor(x, y);
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
	let img = fillCanvas.data;
	let w = fillCanvas.width;
	let h = fillCanvas.height;
	let p = ((w * y) + x) * 4;
	return ((img[p] << 24) + (img[p+1] << 16) + (img[p+2] << 8) + img[p+3])>>>0;
}

function getRGB(x, y){
	let img = fillCanvas.data;
	let w = fillCanvas.width;
	let h = fillCanvas.height;
	let p = ((w * y) + x) * 4;
	return ((img[p] << 24) + (img[p+1] << 16) + (img[p+2] << 8))>>>0;
}

function fillRGBA(x, y, color) {
	let img = fillCanvas.data;
	let w = fillCanvas.width;
	let h = fillCanvas.height;
	let p = ((w * y) + x) * 4;
	img[p]   = (color & 0xFF000000) >>> 24;
	img[p+1] = (color & 0xFF0000) >> 16;
	img[p+2] = (color & 0xFF00) >> 8;
	img[p+3] = color & 0xFF;
}

function fillRGB(x, y, color) {
	let img = fillCanvas.data;
	let w = fillCanvas.width;
	let h = fillCanvas.height;
	let p = ((w * y) + x) * 4;
	img[p]   = (color & 0xFF0000) >> 16;
	img[p+1] = (color & 0xFF00) >> 8;
	img[p+2] = color & 0xFF;
	img[p+3] = 0xFF;
}

function startEffectPreview(e) {
	canvas.previewStart = Date.now();
	let p = getPosition(e);
	let s = canvas.effect.size/2;
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
	$(canvas).trigger("ACTION_UPDATED");

	updateLayerPreview();
}

function previewEffect(e) {

	let p = getPosition(e);
	let s = canvas.action.effect.size/2;
	let _e = {x: parseInt(p.x - s), y: parseInt(p.y - s)};
	canvas.action.events.push(_e);
	let a = clone(canvas.action);
	a.events = [_e];
	drawEffect(canvas.layer.ctx, a);
}

function drawEffect(ctx, action) {
	switch (action.effect.type) {
		case EFFECT_TYPE.BLUR:
			let events = action.events;
			let s = parseInt(action.effect.size)+2;
			let sh = s/2
			let sh2 = sh*sh;
			let s4 = s*4;
			for (let i in events) {
				let e = events[i];
				let srcImgData = ctx.getImageData(e.x-1, e.y-1, s, s);
				let src = srcImgData.data;
				let dstImgData = ctx.createImageData(s, s);
				let dst = dstImgData.data;
                let count = [];
                for (let i = 0; i < s*s; i++) count[i] = 9;
                for (let x = 0; x  < s; x++) {
                  for (let y = 0; y < s; y++) {
                    let i = (x + y * s) * 4;
                    let c = i/4;
                    let p = c - s;
                    let n = c + s;
                    if (!src[i+3]) {
                      src[i+0] = 0; src[i+1] = 0; src[i+2] = 0;
                      count[p-1]--; count[p-0]--; count[p+1]--;
                      count[c-1]--; count[c+1]--;
                      count[n-1]--; count[n-0]--; count[n+1]--;
                    }
                  }
                }
                for (let x = 1; x  < s-1; x++) {
                  for (let y = 1; y < s-1; y++) {
                    let i = (x + y * s) * 4;
                    let p = i - s4;
                    let n = i + s4;
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
	let p = getPosition(e);
	let s = size/2
	ctx.clearRect(0, 0, canvas.w, canvas.h);
	ctx.lineWidth = 1;
	ctx.strokeStyle = 'rgb(0, 0, 0)'
	ctx.strokeRect(parseInt(p.x - s), parseInt(p.y - s), size, size);
}

function startSelPreview(e) {
	$('#moveCanvas').remove();
	canvas.layers[canvas.layerNum].el.css('display', '');
	
	canvas.previewStart = Date.now();
	let p = getPosition(e);
	canvas.action = {
		tool: sketch.tool,
		type: $('#selTypeSelect').val(),
		events: [{x: p.x, y: p.y}, {x: p.x, y: p.y}],
		scale: $('#selScaleSpinner').spinner('value')/100
	};
}

function stopSelPreview() {
	canvas.previewStart = '';
	clearCanvas(canvas.previewCtx);
	let scale = canvas.action.scale;
	
	let nowLayer = canvas.layers[canvas.layerNum];
	canvas.previewCtx.drawImage(nowLayer.el[0], 0, 0);
	nowLayer.el.css('display', 'none');
	
	let offsetX = $('#sketch').offset().left;
	let offsetY = $('#sketch').offset().top;
	let selArea = getSelArea(canvas.action);
	let imgData = nowLayer.ctx.getImageData(selArea.x, selArea.y, selArea.w, selArea.h);
	let moveCanvas = $('<canvas>').attr({
        id: 'moveCanvas',
        width: selArea.w,
        height: selArea.h,
        style: 'border:' + SEL_BORDER + 'pt dotted #666; position:absolute; ' + 
               'top: ' + (selArea.y + offsetY - SEL_BORDER)+ '; ' + 
               'left: ' + (selArea.x + offsetX - SEL_BORDER) + '; ' + 
               'width: ' + selArea.w*scale + '; ' + 
               'height: ' + selArea.h*scale + '; ' + 
               'z-index:' + MAX_LAYER+2 + '; cursor: move'
    });
	moveCanvas.pep({shouldEase: false});
	let ctx = moveCanvas[0].getContext('2d');
	ctx.putImageData(imgData, 0, 0);
	$('#sketch').before(moveCanvas);
	if (canvas.action.type == SEL_TYPE.CUT) {
		canvas.previewCtx.clearRect(selArea.x, selArea.y, selArea.w, selArea.h);
	}
}

function previewSel(e) {
	let p = getPosition(e);
	canvas.action.events[1] = p;
	clearCanvas(canvas.previewCtx);
	drawSelArea(canvas.previewCtx, canvas.action);
}

function drawSelArea(ctx, action) {
	let e0 = action.events[0];
	let e1 = action.events[1];

	ctx.beginPath();
	ctx.lineWidth = SEL_BORDER;
	ctx.setLineDash([3, 3]);
	ctx.strokeStyle = '#666';
	ctx.strokeRect(e0.x, e0.y, e1.x-e0.x, e1.y-e0.y);
	ctx.setLineDash([]);
}

function selPaste(ctx, action) {
	let moveCanvas = $('#moveCanvas');
	action.events[2] = {}
	action.events[2].x = moveCanvas.offset().left - moveCanvas.next().offset().left + SEL_BORDER;
	action.events[2].y = moveCanvas.offset().top - moveCanvas.next().offset().top + SEL_BORDER;
	
	drawSelPaste(ctx, action);
	
	//canvas.previewCtx.drawImage(moveCanvas[0], action.events[2].x, action.events[2].y, selArea.w, selArea.h);
	//if (!$('#selContinuePasteCheck').is(':checked')) {
		cancelSelPaste();
	//}
	canvas.layer.actions.push(action);
	$(canvas).trigger("ACTION_UPDATED");

}

function cancelSelPaste() {
	$('#moveCanvas').remove();
	clearCanvas(canvas.previewCtx);
	canvas.layers[canvas.layerNum].el.css('display', '');
	updateLayerPreview();
}

function drawSelPaste(ctx, action) {
	let nowLayer = canvas.layers[canvas.layerNum];
	clearCanvas(canvas.tmpCtx);
	let selArea = getSelArea(action);
	//let imgData = nowLayer.ctx.getImageData(selArea.x, selArea.y, selArea.w, selArea.h);
	//canvas.tmpCtx.putImageData(imgData, 0, 0);
	canvas.tmpCtx.drawImage(nowLayer.el[0], selArea.x, selArea.y, selArea.w, selArea.h, 0, 0, selArea.w, selArea.h);
	
	if (action.type == SEL_TYPE.CUT) {
		nowLayer.ctx.clearRect(selArea.x, selArea.y, selArea.w, selArea.h);
	}

	ctx.drawImage(canvas.tmpEl[0], 0, 0, selArea.w, selArea.h, action.events[2].x, action.events[2].y, selArea.w*action.scale, selArea.h*action.scale);
}

function getSelArea(action) {
	let x1 = action.events[0].x;
	let y1 = action.events[0].y;
	let x2 = action.events[1].x;
	let y2 = action.events[1].y;
	let x = x1 < x2 ? x1 : x2;
	let y = y1 < y2 ? y1 : y2;
	let w = x1 < x2 ? x2 - x1 : x1 - x2;
	let h = y1 < y2 ? y2 - y1 : y1 - y2;
	return {x: x, y: y, w: w, h: h}
}

function changeSelScale(scale) {
	let moveCanvas = $('#moveCanvas');
	if (moveCanvas.length > 0) {
		let selArea = getSelArea(canvas.action);
		moveCanvas.css({
			width: selArea.w * scale,
			height: selArea.h * scale
		});
		canvas.action.scale = scale;
	}
}

function checkObject(e) {
	let p = getPosition(e);
	
	if (!canvas.object.map) {
		canvas.object.map = [];
		let actions = canvas.layer.actions;
		for (let i in actions) {
			let action = actions[i];
			if (action.tool == TOOL.MARKER) canvas.object.map.push(action);
		}
	}
	
	clearCanvas(canvas.previewCtx);
	
	if (canvas.object.select) {
		drawObject(canvas.object.select, OBJ_LINE_SELECT);
	}
	
	for (let i = canvas.object.map.length-1; i >= 0; i--) {
		let action = canvas.object.map[i];
		let r = parseInt(action.line.width/2) + OBJ_LINE_WIDTH;
		let events = action.events;
		for (let j in events) {
			let e = events[j];
			if (checkInner(e.x, e.y, r, p.x, p.y)) {
				drawObject(action, OBJ_LINE_CHECK);
				return action;
			}
		}
	}
	return null;
	
	function drawObject(action, color) {
		let newAction = clone(action);
		let r = parseInt(action.line.width/2) + OBJ_LINE_WIDTH;
		newAction.line.width = r;
		newAction.line.color = color;
		setStyle(newAction.line);
		drawLine(canvas.previewCtx, newAction);
		setStyle(action.line);
		drawLine(canvas.previewCtx, action);
	}
}

function selectObject(e) {
	action = checkObject(e);
	if (action) {
		canvas.object.select = action;
	}
}

function deleteObject() {
	let action = {
		tool: TOOL.OBJECT,
		type: 'delete',
		seq: canvas.object.select.seq
	}
	canvas.layer.actions.push(action);
	$(canvas).trigger("ACTION_UPDATED");

	cancelObject();
	redraw();
}

function cancelObject() {
	canvas.object.select = null;
	clearCanvas(canvas.previewCtx);
}

function getAction(seq) {
	for (let num in canvas.layers) {
		let layer = canvas.layers[num];
		for (let i in layer.actions) {
			let action = layer.actions[i];
			if (action.seq == seq) return action;
		}
	}
	return null;
}

function objectEdit() {
	
}

function crClearImageData() {
	let s = 20;
	let imageData = canvas.tmpCtx.createImageData(s, s);
	let data = imageData.data;
	for (let x; x < s; x++) {
		for (let y; y < s; y++) {
			let i = (x + y * s) * 4;
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
	let p = getPosition(e);
	canvas.action = {
		tool: sketch.tool,
		line: clone(canvas.eraser),
		events: [{x: p.x, y: p.y}]
	};
	//canvas.action.line.comp = COMP.DO;

	clearCanvas(canvas.previewCtx);
	canvas.previewCtx.drawImage(canvas.layer.el[0], 0, 0);
	canvas.layer.el.css('visibility', 'hidden');
	setStyle(canvas.action.line);
	startDraw(canvas.previewCtx, canvas.action);
	previewEraser(e);
}

function stopEraserPreview() {
	stopDraw(canvas.previewCtx);
	canvas.layer.el.css('visibility', '');
	canvas.previewStart = '';
	clearCanvas(canvas.previewCtx);
	canvas.layer.actions.push(canvas.action);
	$(canvas).trigger("ACTION_UPDATED");

	updateLayerPreview();
}

function previewEraser(e) {
	let p = getPosition(e);
	canvas.action.events.push({x: p.x, y: p.y});
	eraseLine(canvas.previewCtx, canvas.action);
}

function eraseLine(ctx, action) {
	//canvas.comp = ctx.globalCompositeOperation;
	drawLine(ctx, action, action.line.color);
	//ctx.globalCompositeOperation = canvas.comp;
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
	let orgAlpha = ctx.globalAlpha;
	let orgBlend = ctx.globalCompositeOperation;
	for (let i in canvas.layers) {
		let layer = canvas.layers[i];
		let alpha = layer.alpha/100;
		let blend = layer.blend;
		if (layer.display) {
			ctx.globalAlpha = alpha;
			ctx.globalCompositeOperation = blend;
			ctx.drawImage(layer.el[0], 0, 0);
		}
	}
	ctx.globalAlpha = orgAlpha;
	ctx.globalCompositeOperation = orgBlend;
}

function copyLayer() {
	let actions = cloneArray(canvas.layer.actions);
	let baseImageURL = canvas.layer.baseImageURL;
	let layerName = canvas.layer.name;
	addLayer();
	canvas.layer.actions = actions;
	canvas.layer.baseImageURL = baseImageURL;
	canvas.layer.name = layerName + 'Copy';
	$(canvas).trigger("ACTION_UPDATED");

	redraw();
}

function mergeTwoLayer() {
	if (canvas.layers.length == 1 || canvas.layerNum == 0 || !confirm('下のレイヤと結合します。よろしいですか？\n※この処理はUNDOできません')) return;
	let layerNum = canvas.layerNum;
	let toLayer = canvas.layers[canvas.layerNum-1];
	let fromLayer = canvas.layers[canvas.layerNum];
	let orgAlpha = toLayer.ctx.globalAlpha;
	let orgBlend = toLayer.ctx.globalCompositeOperation;
	toLayer.ctx.globalAlpha = fromLayer.alpha/100;
	toLayer.ctx.globalCompositeOperation = fromLayer.blend;
	toLayer.ctx.drawImage(fromLayer.el[0], 0, 0);
	toLayer.ctx.globalAlpha = orgAlpha;
	toLayer.ctx.globalCompositeOperation = orgBlend;
	let url = toLayer.el[0].toDataURL();
	deleteLayer(false);
	selectLayer(layerNum-1);
	sketch.setBaseImageURL(url);
}

function clear() {
	clearCanvas(canvas.layer.ctx);
	canvas.layer.actions = [];
	canvas.layer.baseImageURL = "";
	canvas.layer.baseImageCache = "";
	$(canvas).trigger("ACTION_UPDATED");

	redraw();
}

function clearCanvas(ctx) {
	ctx.clearRect(0, 0, canvas.w, canvas.h);
}

function getPosition(e) {
	let offset = canvas.layer.el.offset();
	let offsetX = offset.left;
	let offsetY = offset.top;
	let x = (e.pageX - offsetX) / canvas.scale;
	let y = (e.pageY - offsetY) / canvas.scale;

	return {x: x, y: y};
}

function changeCanvasSize() {
	let size = getCanvasSize2();
	canvas.w = size.w;
	canvas.h = size.h;
	canvas.scale = $('#scaleSelect').val() || 1;

	setCanvasSize(sketch.el, size.w, size.h, canvas.scale);
	setCanvasSize(canvas.inputEl[0], size.w, size.h, canvas.scale);
	setCanvasSize(canvas.tmpEl[0], size.w, size.h, canvas.scale);
	setCanvasSize(canvas.previewEl[0], size.w, size.h, canvas.scale);
	setPictCrop();

	let layerNum = canvas.layerNum;
	for (let i in canvas.layers) {
		let layer = canvas.layers[i];
		setCanvasSize(layer.el[0], size.w, size.h, canvas.scale);
		setCanvasSize(layer.preview.el[0], size.w, size.h, PREVIEW_SIZE);
		selectLayer(i);
	}
	selectLayer(layerNum);
	redraw();
	
	sketch.clear();
}

function getCanvasSize() {
	let size = $('#canvasSize').val().split("x");
	return {w: size[0], h: size[1]}
}

function getCanvasSize2() {
	let size = $('#canvasSize2').val().split("x");
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
	let slider = $('#bgcolorSlider');
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
			let el = $(ui.handle);
			$('#bgcolorPicker').spectrum('set', el.css('background-color'));
			canvas.bgcolor.select = el;
			sketch.clear();
		}
	});
	slider.css({margin: '10px'});
	canvas.bgcolor.select = $(slider.children()[0]);	
	canvas.bgcolor.el = slider.children();
	for (let i = 0; i < canvas.bgcolor.el.length; i++) {
		let el = canvas.bgcolor.el[i];
		$(el).css('background', canvas.bgcolor.colors[i]);
	}
	sketch.clear();
}

function addGrad() {
	let len = canvas.bgcolor.values.length;
	if (len > MAX_BGCOLOR_GRAD) return;

	canvas.bgcolor.values = [];
	canvas.bgcolor.colors = [];
	let slider = $('#bgcolorSlider');
	for (let i = 0; i < len; i++) {
		let el = canvas.bgcolor.el[i];
		canvas.bgcolor.values.push(Math.floor(el.style.left.replace('%', '')));
		canvas.bgcolor.colors.push($(el).css('background-color'));
	}
	let addValue = (canvas.bgcolor.values[len-1] + canvas.bgcolor.values[len-2])/2;
	let addColor = canvas.bgcolor.colors[len-1];
	canvas.bgcolor.values.splice(len-1, 0, addValue);
	canvas.bgcolor.colors.splice(len-1, 0, addColor);
	initSlider();
}

function deleteGrad() {
	let index = canvas.bgcolor.el.index(canvas.bgcolor.select);
	let len = canvas.bgcolor.values.length;
	if (index == 0 || index == len-1) return;
	
	canvas.bgcolor.values = [];
	canvas.bgcolor.colors = [];
	let slider = $('#bgcolorSlider');
	for (let i = 0; i < len; i++) {
		if (i != index) {
			let el = canvas.bgcolor.el[i];
			canvas.bgcolor.values.push(Math.floor(el.style.left.replace('%', '')));
			canvas.bgcolor.colors.push($(el).css('background-color'));
		}
	}
	initSlider();
}

function inputText(e) {
	//$('#mojiForm').remove();
	let mojiForm = $('<div>', {id: 'mojiForm', title: '	文字を入力してください'});
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
	let pos = getPosition(e);
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
	$(canvas).trigger("ACTION_UPDATED");

}

function drawText(ctx, action) {
	let drawTextFunc;
	if (action.options.edge) {
		drawTextFunc = strokeText;
	} else {
		drawTextFunc = fillText;
	}
	
	let lines = action.options.text.split('\n');
	let size = measureTextAreaSize(lines, action);

	let h = ctx.measureText("あ").width;

	ctx.textBaseline = 'top';
	ctx.fillStyle = action.color;
	ctx.font = action.options.bold + action.options.italic + action.size + 'px ' + action.options.font;
	ctx.translate(action.events[0].x + size.w/2, action.events[0].y + size.h/2);

//	let h = ctx.measureText("あ").width;
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
	let ctx = canvas.tmpCtx;
	let h = ctx.measureText("あ").width;
	let maxW = 0;
	let maxH = 0;
	jQuery.each(lines, function(i, line) {
		if(!action.options.vertical){
			let w = ctx.measureText(line).width;
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
	for (let i = 0; i < p; i++) {
		ctx.rotate(Math.PI / p);
		ctx.lineTo(0, 0 - (r*m));
		ctx.rotate(Math.PI / p);
		ctx.lineTo(0, 0 - r);
	}
	ctx.fillStyle = color;
	ctx.fill();
	ctx.restore();
}

function setPictCrop() {
	if (!pict.el) return;
	
	$('#pictToCanvasBtn').removeAttr('disabled');

	if (pict.jcrop) pict.jcrop.destroy();
	
	$('#pictToCanvasBtn').before(pict.el);	
	
	let size = getCanvasSize2();
	if($('#pictSizeSelect').val() == 'canvas') {
		pict.r = getFitRatio(pict.el.width(), pict.el.height(), size.w, size.h);
	} else {
		pict.r = 1;
	}
	pict.el.css({
		width: pict.el[0].width * pict.r,
		height: pict.el[0].height * pict.r
	});
	$('#pict').Jcrop({
		onChange: setPictCoords,
		onSelect: setPictCoords
	}, function() {
		pict.jcrop = this;
		clearPictCoords();
	});
	let r = getFitRatio(pict.w, pict.h, size.w, size.h); 
	initPictArea((size.w-pict.w*r)/2, (size.h-pict.h*r)/2, pict.w*r, pict.h*r);
}

function pictToCanvas() {
	if (pict.w == 0 || pict.h == 0) clearPictCoords(); 
	let size = getCanvasSize2();
	let r = getFitRatio(pict.w, pict.h, size.w, size.h);
	let border = 3;
	let cp = $('#sketch').parent().offset();
	let ap = $('#pictArea').offset();
	let left = ap.left - cp.left + border;
	let top = ap.top - cp.top + border;
	canvas.layer.ctx.drawImage(pict.el[0], pict.x1/pict.r, pict.y1/pict.r, pict.w/pict.r, pict.h/pict.r, left, top, pict.w*r, pict.h*r);
	sketch.setBaseImageURL(canvas.layer.el[0].toDataURL());
	redraw();
	if (!$('#pictContinueToCanvasCheck').is(':checked')) clearPictCrop();
}

function initPictArea(x, y, w, h) {
	try {
	$('#pictArea').remove();
	
	let border = 3;
	let left = $('#sketch').parent().offset().left  + x - border;
	let top = $('#sketch').parent().offset().top + y - border;
	let pictArea = $('<div>', {
		id: 'pictArea',
		width: w,
		height: h,
		style:
			'border: ' + border + 'px dotted #333; position: absolute; overflow: hidden; cursor: move; z-index: 100;' +
			'left:' + left + '; ' +
			'top:' + top + '; ' +
			'width:' + w + '; ' +
			'height:' + h + '; '
	});
	
	$('#sketch').after(pictArea.append(pict.preview));
	/*
	pictArea.draggable({
		//containment: 'parent'
	});
	*/
	pictArea.pep({shouldEase: false});
	showPictPreview();
	} catch(e) {
		alert(e);
	}
}

function clearPictCrop() {
	pict.el = '';
	if (pict.jcrop) pict.jcrop.destroy();
	$('#pictToCanvasBtn').attr('disabled', 'disabled');
	$('#pictArea').remove();
	$('#pict').remove();
}

function setPictArea(x, y, w, h) {
	
}

function getFitRatio(sw, sh, dw, dh) {
	let r;
	let rw = dw / sw;
	let rh = dh / sh;
	if (rw < rh) {
			r = rw;
	} else {
			r = rh;
	}
	if (r > 1) r = 1;
	return r;
}

function setPictCoords(c) {
	pict.x1 = c.x;
	pict.y1 = c.y;
	pict.x2 = c.x2;
	pict.y2 = c.y2;
	pict.w = c.w;
	pict.h = c.h;
	
	let size = getCanvasSize2();
	let r = getFitRatio(pict.w, pict.h, size.w, size.h); 
	setPictArea((size.w-pict.w*r)/2, (size.h-pict.h*r)/2, pict.w*r, pict.h*r);
	showPictPreview();
}

function showPictPreview() {
	if (pict.w == 0 || pict.h == 0) clearPictCoords();
	let r = pict.r;
	$('#pictArea').css({
		width: Math.round(pict.w) + 'px',
		height: Math.round(pict.h) + 'px', 
	});
	$('#pictPreview').css({
		width: Math.round(pict.el.width()) + 'px',
		height: Math.round(pict.el.height()) + 'px', 
		marginLeft: '-' + Math.round(pict.x1) + 'px',
		marginTop: '-' + Math.round(pict.y1) + 'px'
	});
}

function clearPictCoords() {
	setPictCoords({
		x: 0,
		y: 0,
		x2: 0,
		y2: 0,
		w: pict.el.width(),
		h: pict.el.height()
	});
}

function Filter(label, type, init, update) {
	this.label = label;
	this.type = type;
	this.update = update;

	this.sliders = [];
	this.nubs = [];
	init.call(this);
}

Filter.prototype.addNub = function(name, x, y) {
	this.nubs.push({name: name, x: x, y: y});
}

Filter.prototype.addSlider = function(label, type, min, max, value, step) {
	this.sliders.push({label: label, type: type, min: min, max: max, value: value, step: step});
}

Filter.prototype.previewFilter = function(filter) {
	let texture = canvas.fxCanvas.texture(canvas.layer.el[0]);
	eval(filter);
	clearCanvas(canvas.previewCtx);
	canvas.previewCtx.drawImage(canvas.fxCanvas, 0, 0);
	canvas.action = {
		tool: sketch.tool,
		filter: filter
	};
}

Filter.prototype.use = function() {
	let filterSliderArea = $('#filterSliderArea');
	
	filterSliderArea.children().remove();
	$('#nubsArea').remove();
	let nubsArea = $('<div>', {id: 'nubsArea'}).css({
		position: 'absolute',
		width: canvas.w,
		height: canvas.h,
		zIndex: 15
	});
	$('#inputCanvas').before(nubsArea);
	
	for (let i in this.sliders) {
		let slider = this.sliders[i];
		let sliderEl = $('<div>', {id: slider.type + 'Slider'});
		let labelEl = crLabelEl(slider.type + 'Slider', slider.label + ':' + slider.value);
		filterSliderArea.append(labelEl, sliderEl);
		
		let func = (function(_this, slider) { return function(ev, ui) {
			_this[slider.type] = ui.value;
			_this.update();
			$('[for='+slider.type+'Slider]').text(slider.label + ':' + ui.value);
		}})(this, slider);
		
		sliderEl.slider({
			min: slider.min,
			max: slider.max,
			value: slider.value,
			step: slider.step,
			change: func,
			slide: func
		});
		this[slider.type] = slider.value;
	}
	
	for (let i in this.nubs) {
		let nub = this.nubs[i];
		let nubEl = $('<div>', {id: 'nub'+i, class: 'nub'});
		nubsArea.append(nubEl);
		
		let x = nub.x * canvas.w;
		let y = nub.y * canvas.h;
		
		let func = (function(_this, nub) { return function(ev, ui) {
			let offset = $(ev.target.parentNode).offset();
			_this[nub.name] = {x: ui.offset.left - offset.left, y: ui.offset.top - offset.top}
			_this.update();
		}})(this, nub);
		
		nubEl.draggable({
			drag: func,
			containment: 'parent',
			scroll: false
		}).css({left: x, top: y});
		this[nub.name] = { x: x, y: y };
	}
	
	this.update();
}

function commitFilter() {
	canvas.layer.actions.push(canvas.action);
	$(canvas).trigger("ACTION_UPDATED");

	redraw();
	clearFilter();
}

function clearFilter() {
	$('#filterTypeSelect').trigger('change');
}

function drawFilter(ctx, action) {
	let texture = canvas.fxCanvas.texture(canvas.layer.el[0]);
	eval(action.filter);
	clearCanvas(ctx);
	clearCanvas(canvas.previewCtx);
	ctx.drawImage(canvas.fxCanvas, 0, 0);
}

function setImageSmooting(ctx, state) {
	ctx.mozImageSmoothingEnabled = state;
	ctx.oImageSmoothingEnabled = state;
	ctx.webkitImageSmoothingEnabled = state;
	ctx.imageSmoothingEnabled = state;
}

function crSelectEl(id, label, valueList, textList, selected) {
	let labelEl = crLabelEl(id, label);
	let selectEl = $('<select>', {id: id});
	for(let i in valueList){
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

function hr() {
	return $('<hr style="margin: 5px">');
}

function addSelectOption(id, value, text) {
	$('#' + id).append($('<option>', {value: value, text: text}));
}

function changeAction(popList, pushList){
	pushList.push(popList.pop());

	$(canvas).trigger("ACTION_UPDATED");

	redraw();
}

this.loadIcons = function(url){
	for(let key in icons){
		if (icons[key].file) {
			let img = new Image();
			img.id = key;
			img.src = url + icons[key].file;
			icons[key].img = $(img);
		}
	}
};

function saveStorage(key, item, json) {
	if (json) {
		localStorage.setItem(key, JSON.stringify(item));
	} else {
		localStorage.setItem(key, item);
	}
}

function loadStorage(key, json) {
	let val = localStorage.getItem(key);
	if (json) {
		return val ? JSON.parse(val) : val;
	} else {
		return val;
	}
}

function clone(obj) {
	return $.extend(true, {}, obj);
}

function cloneArray(arr) {
	return $.extend(true, [], arr);
}

function splitRGBA(color) {
	let reg = /(\d+\.?\d*)/g;
	let split = color.match(reg);
	return {r: split[0], g: split[1], b:split[2], a:split[3] || '1.0'}
}

function log(msg) {
	console.log(msg);
}

if (!Date.now) {
	Date.now = function now() {
		return new Date().getTime();
	}
}

}());
