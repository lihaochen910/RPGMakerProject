(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
(function (process){
PIXI.settings.PRECISION_FRAGMENT = PIXI.PRECISION.HIGH;

class _app {

	get renderer () {
		return Graphics._renderer;
	}

	get view () {
		return Graphics._renderer.view;
	}

	get screen () {
		return Graphics._renderer.screen;
	}

	get renderingLayers () {
		return this._renderingLayers;
	}

	constructor () {
		// super ( {
		// 	width: 800,
		// 	height: 600,
		// 	antialias: true,
		// 	transparent: false,
		// 	resolution: 2,
		// 	sharedTicker: true,
		// 	backgroundColor: 0x303030
		// 	// powerPreference: SLI&CrossFire GPU, TODO: study me
		// } );

		Graphics.initialize ( 816, 624, 'webgl' );
		Graphics.showFps ();
		// document.body.appendChild ( this.renderer.view );

		this.nwjs = this.isNwjs () && this.initNwjs ();
		//this.nwjs.win.showDevTools() //auto-start devTool chromium

		// Rendering Layers
		// TODO: 从配置文件中加载Layer
		this._renderingLayers = new Map ();
		this._renderingLayers.set ( 'Default', new PIXI.display.Layer () );
		this._renderingLayers.set ( 'Map', new PIXI.display.Layer () );
		this._renderingLayers.set ( 'GUI', new PIXI.display.Layer () );
		
		// document.body.onresize = () => {
		// 	this.scaleToWindow ()
		// };

		window.addEventListener ( 'error', this.onError.bind ( this ) );
	};

	// Boot App
	run () {
		try {

			this.stage = new _stage ();
			this.stage.initialize ();

			this.initialize_ECS ();
			this.test ();

			this.ticker = PIXI.ticker.shared.add ( this.update, this );

		} catch ( e ) {
			throw console.error ( e.stack );
		}
	};

	initialize_ECS () {

		this.ecs = new ECS ();
		window.$ecs = this.ecs;

		require ( './ecs/systems/index' );
		require ( './ecs/components/index' );

		this.ecs.addSystem ( ECS.GROUP_Action, new SpriteRenderingSystem ( this.ecs ) );
		this.ecs.addSystem ( ECS.GROUP_Action, new TilemapLoadSystem ( this.ecs ) );
		this.ecs.addSystem ( ECS.GROUP_Action, new CameraFollowTargetSystem ( this.ecs ) );
		this.ecs.addSystem ( ECS.GROUP_Action, new DebugMoveSystem ( this.ecs ) );
		this.ecs.addSystem ( ECS.GROUP_Render, new RenderingSystem ( this.ecs ) );

		// Test
		let camera = $ecs.createEntity ( {
			id: 'Main Camera',
			Transform: {
				position: new PIXI.Point (),
				localPosition: new PIXI.Point (),
			},
			Camera: {
				renderingLayers: [ 'Map', 'Default' ],
				zoom: 1,
				depth: 0
			},
			// DebugMove: {
			// 	speedX: -120.0,
			// 	speedY: -120.0,
			// }
		} );

		// let camera_2 = $ecs.createEntity ( {
		// 	id: 'UI Camera',
		// 	Transform: {
		// 		position: new PIXI.Point (),
		// 		localPosition: new PIXI.Point (),
		// 	},
		// 	Camera: {
		// 		renderingLayers: [ 'GUI' ],
		// 		depth: 1
		// 	}
		// } );

		let spriteObj = $ecs.createEntity ( {
			id: 'Sprite Object',
			Transform: {
				position: new PIXI.Point (),
				localPosition: new PIXI.Point (),
			},
			Sprite: {
				res: 'img/faces/Actor1',
				frame: new PIXI.Rectangle ( 0, 0, 144, 144 ),
				layer: 'Default',
				zIndex: 1,
				zOrder: 0,
			},
			// DebugMove: {
			// 	speedX: 100.0,
			// 	speedY: 100.0,
			// }
		} );

		let spriteObj_2 = $ecs.createEntity ( {
			id: 'Sprite Object 2',
			Transform: {
				position: new PIXI.Point ( 550, 550 ),
				localPosition: new PIXI.Point (),
			},
			Sprite: {
				res: 'img/faces/Actor1',
				frame: new PIXI.Rectangle ( 0, 144, 144, 144 ),
				layer: 'Default',
				zIndex: 1,
				zOrder: -1,
			},
			DebugMove: {
				speedX: 200.0,
				speedY: 200.0,
			}
		} );

		let tilemap = $ecs.createEntity ( {
			id: 'Map',
			Transform: {
				position: new PIXI.Point (),
				localPosition: new PIXI.Point (),
			},
			Tilemap: {
				res: 'maps/map001.json',
				layer: 'Default',
				zIndex: 0,
				zOrder: 0,
			}
		} );

		camera.addComponent ('CameraFollowTarget', {
			smoothTimeX: 0.15,
			smoothTimeY: 0.15,
			// offsetX: Graphics.width / 2,
			// offsetY: Graphics.height / 2,
			target: spriteObj_2,
		} );
	}

	test () {
		
	}

	update ( delta ) {
		// try {
		//	
		// } catch ( e ) {
		// 	// $app.nwjs.win.showDevTools ();
		// 	throw console.error ( e.message + "\n" + e.stack );
		// }

		// if ( this.nextScene ) {
		// 	this.scene = this.nextScene;
		// } else if ( this.scene._started ) {
		// 	this.scene.update ( delta );
		// 	$mouse.update (); // FIXME: mettre dans scene udpate ? permetra etre controler par les event de scene ?
		// } else if ( this.scene && !this.scene._started ) {
		// 	this.scene.start ();
		// }

		this.deltaTime = delta / 100.0;

		this.ecs.tick ();
		this.ecs.runSystemGroup ( ECS.GROUP_Input );
		this.ecs.runSystemGroup ( ECS.GROUP_Action );
		this.ecs.runSystemGroup ( ECS.GROUP_Render );
	};

	isNwjs () {
		return typeof require === 'function' && typeof process === 'object';
	};

	initNwjs () {
		// let dw = 800 - window.innerWidth;
		// let dh = 600 - window.innerHeight;
		// let gui = require ( 'nw.gui' );
		// let win = gui.Window.get ();
		// win.focus ();
		// window.moveBy ( -dw / 2, -dh / 2 );
		// window.resizeBy ( dw, dh );
		// if ( process.platform === 'darwin' && !win.menu ) {
		// 	var menubar = new gui.Menu ( { type: 'menubar' } );
		// 	var option = { hideEdit: true, hideWindow: true };
		// 	menubar.createMacBuiltin ( 'Game', option );
		// 	win.menu = menubar;
		// }
		// return { gui, win };
	};

	requestFullScreen () {
		var element = document.body;
		if ( element.requestFullScreen ) {
			element.requestFullScreen ();
		} else if ( element.mozRequestFullScreen ) {
			element.mozRequestFullScreen ();
		} else if ( element.webkitRequestFullScreen ) {
			element.webkitRequestFullScreen ( Element.ALLOW_KEYBOARD_INPUT );
		} else if ( element.msRequestFullscreen ) {
			element.msRequestFullscreen ();
		}
		this._fullScreen = true;
	};

	cancelFullScreen () {
		if ( document.cancelFullScreen ) {
			document.cancelFullScreen ();
		} else if ( document.mozCancelFullScreen ) {
			document.mozCancelFullScreen ();
		} else if ( document.webkitCancelFullScreen ) {
			document.webkitCancelFullScreen ();
		} else if ( document.msExitFullscreen ) {
			document.msExitFullscreen ();
		}
		this._fullScreen = false;
	};

	scaleToWindow () {
		const canvas = this.view;
		let scaleX, scaleY, scale, center;
		scaleX = window.innerWidth / canvas.offsetWidth;
		scaleY = window.innerHeight / canvas.offsetHeight;
		scale = Math.min ( scaleX, scaleY );
		canvas.style.transformOrigin = "0 0";
		canvas.style.transform = "scale(" + scale + ")";
		if ( canvas.offsetWidth > canvas.offsetHeight ) {
			if ( canvas.offsetWidth * scale < window.innerWidth ) {
				center = "horizontally"
			} else {
				center = "vertically"
			}

		} else {
			if ( canvas.offsetHeight * scale < window.innerHeight ) {
				center = "vertically"
			} else {
				center = "horizontally";
			}

		}

		let margin;
		if ( center === "horizontally" ) {
			margin = ( window.innerWidth - canvas.offsetWidth * scale ) / 2;
			canvas.style.marginTop = 0 + "px";
			canvas.style.marginBottom = 0 + "px";
			canvas.style.marginLeft = margin + "px";
			canvas.style.marginRight = margin + "px";
		}

		if ( center === "vertically" ) {
			margin = ( window.innerHeight - canvas.offsetHeight * scale ) / 2;
			canvas.style.marginTop = margin + "px";
			canvas.style.marginBottom = margin + "px";
			canvas.style.marginLeft = 0 + "px";
			canvas.style.marginRight = 0 + "px";
		}

		canvas.style.paddingLeft = 0 + "px";
		canvas.style.paddingRight = 0 + "px";
		canvas.style.paddingTop = 0 + "px";
		canvas.style.paddingBottom = 0 + "px";
		canvas.style.display = "-webkit-inline-box";
		return scale;
	};

	// Get a ratio for resize in a bounds
	getRatio ( obj, w, h ) {
		let r = Math.min ( w / obj.width, h / obj.height );
		return r;
	};

	hitCheck ( a, b ) { // colision
		var ab = a._boundsRect;
		var bb = b._boundsRect;
		return ab.x + ab.width > bb.x && ab.x < bb.x + bb.width && ab.y + ab.height > bb.y && ab.y < bb.y + bb.height;
	};

	onError ( e ) {
		console.error ( e.message );
		console.error ( e.filename, e.lineno );
		try {
			// this.stop();
			Graphics.printError ( 'Error', e.message );
			Graphics.printError ( 'StackTrace', e.filename );
			// AudioManager.stopAll();
		} catch ( e2 ) {
		}
	};

} //END CLASS

require ( './core/stage' );

$app = new _app (); // new PIXI.Application

if ( $app.isNwjs () ) {
	window.global = window;
}

// global.$app = $app;

//Add the canvas that Pixi automatically created for you to the HTML document
// document.body.appendChild ( $app.view );


document.addEventListener ( 'contextmenu', event => {
	event.path[ 0 ] === $app.renderer.view && event.preventDefault (); // FIXME: premet enpecher right click dans editeur ,mais autorise les html
} );

// disable nwjs right click
document.addEventListener ( 'keydownL', ( event ) => {
	if ( event.target.type ) {
		return
	}
	; // si dans un div input, cancel
	if ( event.keyCode === 115 ) { // F4
		return $app._fullScreen && $app.cancelFullScreen () || $app.requestFullScreen ();
	}
	;
	if ( event.keyCode === 116 ) { // F5 refresh
		document.location.reload ( true );
	}
	;

	//TODO: REMOVE ME , is for debug pixi-projections
	const fpX = $camera._fpX;
	const fpY = $camera._fpY;
	const fpf = $camera._fpF;

	if ( event.keyCode === 37 ) { // arowLeft
		if ( event.ctrlKey ) {
			const pos = $camera.scene.position;
			TweenLite.to ( pos, 1, { y: pos.x - 20, ease: Power4.easeOut } );
		} else {
			$camera.pivot.x -= 20;
		}

		//TweenLite.to($camera, 1, { _fpX: fpX-120, ease: Power4.easeOut });
		//$camera.updateFarPointFromTarget(fpX-120);
	}
	if ( event.keyCode === 38 ) { // arrowUp
		if ( event.ctrlKey ) {
			const pos = $camera.scene.position;
			TweenLite.to ( pos, 1, { y: pos.y + 20, ease: Power4.easeOut } );
		} else {
			$camera.pivot.y -= 20;
		}
		//TweenLite.to($camera, 1, { _fpY: fpY-120, ease: Power4.easeOut });
		//$camera.updateFarPointFromTarget(null,fpY-120);
	}
	if ( event.keyCode === 39 ) { // arrowRight
		if ( event.ctrlKey ) {
			const pos = $camera.scene.position;
			TweenLite.to ( pos, 1, { y: pos.x + 20, ease: Power4.easeOut } );
		} else {
			$camera.pivot.x += 20;
		}
		//TweenLite.to($camera, 1, { _fpX: fpX+120, ease: Power4.easeOut });
		//$camera.updateFarPointFromTarget(fpX+120);
	}
	if ( event.keyCode === 40 ) { // arrowDown
		if ( event.ctrlKey ) {
			const pos = $camera.scene.position;
			TweenLite.to ( pos, 1, { y: pos.y - 20, ease: Power4.easeOut } );
		} else {
			$camera.pivot.y += 20;
		}
		//TweenLite.to($camera, 1, { _fpY: fpY+120, ease: Power4.easeOut });
		//$camera.updateFarPointFromTarget(null,fpY+120);
	}
	if ( event.keyCode === 107 ) { // pad+
		const acc = TweenLite.getTweensOf ( $camera ).length;
		TweenLite.to ( $camera, 1, { _fpF: fpf + 0.02, ease: Power4.easeOut } );
		event.ctrlKey && TweenLite.to ( $camera, 1, { _fpY: fpY - 30, ease: Power4.easeOut } );
		//$camera.updateFarPointFromTarget(null,null,fpf+0.1);
	}
	if ( event.keyCode === 109 ) { // pad-
		const acc = TweenLite.getTweensOf ( $camera ).length;
		TweenLite.to ( $camera, 1, { _fpF: fpf - 0.01 - ( 0.04 * acc ), ease: Power4.easeOut } );
		//TweenLite.to($camera, 0.5, { _fpf: fpf-0.1, ease: Power4.easeOut });
		//$camera.updateFarPointFromTarget(null,null,fpf-0.1);
	}
	if ( event.keyCode === 100 || event.keyCode === 102 ) { // numpad 4||6 (lock the X _fpX)
		event.keyCode === 100 && TweenLite.to ( $camera, 0.7, { _fpX: fpX + 25, ease: Power4.easeOut } );
		event.keyCode === 102 && TweenLite.to ( $camera, 0.7, { _fpX: fpX - 25, ease: Power4.easeOut } );
		//$camera._fpXLock = !$camera._fpXLock;
		//$camera.redrawDebugScreen();
	}
	if ( event.keyCode === 104 || event.keyCode === 98 ) { // numpad 8||2 (lock the Y _fpY)
		event.keyCode === 104 && TweenLite.to ( $camera, 0.7, { _fpY: fpY + 25, ease: Power4.easeOut } );
		event.keyCode === 98 && TweenLite.to ( $camera, 0.7, { _fpY: fpY - 25, ease: Power4.easeOut } );
	}
	if ( event.keyCode === 101 ) { // numpad 5 copy
		window.prompt ( "Copy this to $camera.cameraSetup",
			`{_fpX:${ $camera._fpX.toFixed ( 2 ) },_fpY:${ $camera._fpY.toFixed ( 2 ) },_fpF:${ $camera._fpF.toFixed ( 2 ) },_zoom:${ $camera._zoom.toFixed ( 2 ) }}`
		);
	}
} );

}).call(this,require('_process'))

},{"./core/stage":2,"./ecs/components/index":6,"./ecs/systems/index":12,"_process":16}],2:[function(require,module,exports){
(function (process){
/*
* Les stage rend les scenes
*/
class _stage extends PIXI.display.Stage {
	
	constructor () {
		super ();
		// TODO: PEUT ETRE MODIFIER POUR LES FABRIER AU BOOT, class direct [huds,screenMesage,mouse]
		// this.CAGE_GUI = new PIXI.Container (); // screen menue gui huds
		// this.CAGE_MESSAGE = new PIXI.Container (); // screen message
		// this.CAGE_MOUSE = new PIXI.Container (); // store master mouse sprite and FX, toujours top
		// this.LIGHTS = { ambientLight: {}, PointLight_mouse: {} }; //, directionalLight: new PIXI.ContainerDirectionalLight() }; // the global configurable on sceneChange
	};

	// change scene in camera viewPort
	set scene ( nextScene ) {
		if ( this._scene ) { // initialise camera with new scene
			this.scene.onStop ();
			//this.scene.onEnd();
			//this.scene.unLoad(); // quand on change de scenePack
			this._scene = null;
		}
		
		if ( nextScene ) {
			document.title = document.title + ` =>[${ nextScene.constructor.name }] `;
			this._scene = nextScene;
			this.nextScene = null;
		}
		
	};

	get scene () {
		return this._scene || false
	};

	initialize () {
		this.initialize_Layers ();
		this.initialize_Camera ();
		this.initialize_Lights ();
		// this.goto ( 'Scene_Boot', {} );
	};

	initialize_Camera () {
		// this.addChild ( $camera ); // camera can hold scene with projections
	};

	initialize_Layers () {
		// this.addChild ( this.CAGE_GUI, this.CAGE_MESSAGE, this.CAGE_MOUSE );
		// this.CAGE_MOUSE.parentGroup = $displayGroup.group[ 6 ];
		// this.CAGE_MOUSE.parentLayer = $displayGroup.layersGroup[0]; //FIXME: EXPERIMENTAL
		// this.CAGE_GUI.parentGroup = $displayGroup.group[ 4 ];
		// this.addChild ( // lights groups
		// 	$displayGroup._spriteBlack_d,
		// 	$displayGroup._layer_diffuseGroup,
		// 	$displayGroup._layer_normalGroup,
		// 	$displayGroup._layer_lightGroup,
		// 	...$displayGroup.layersGroup // displayGroups
		// );
	};

	initialize_Lights () {
		// this.LIGHTS.ambientLight = new PIXI.lights.AmbientLight ();//$objs.newContainer_light('AmbientLight'    );
		// this.LIGHTS.PointLight_mouse = new PIXI.lights.PointLight ();//$objs.newContainer_light('PointLight'      );
		// this.LIGHTS.DirectionalLight = new PIXI.lights.DirectionalLight();//$objs.newContainer_light('DirectionalLight');
		// this.addChild ( ...Object.values ( this.LIGHTS ) );
	};
	
	// see http://pixijs.download/dev/docs/PIXI.prepare.html for gpu cache 
	goto ( targetSceneName, options ) {
		// check if loaderKit asigned to class are loaded, if yes get the scene, if no , goto loader scene and load all kit and scene
		this.nextScene = $Loader.getNextScene ( targetSceneName ); //|| $Loader.loadSceneKit(sceneName); //$Loader.needLoaderKit(sceneName);
	};
	
	// get stage system informations
	getDataValues () {
		const list = $objs.get_list; // getter Obj from current scene
		// lister objet par containerType
		const total_containerType = {};
		Object.keys ( $systems.classType.containers ).forEach ( ctype => {
			total_containerType[ ctype ] = list.filter ( ( o ) => {
				return o.dataValues.b.containerType === ctype
			} );
		} );
		const total_dataType = {};
		Object.keys ( $systems.classType.datas ).forEach ( dtype => {
			total_dataType[ dtype ] = list.filter ( ( o ) => {
				return o.dataValues.b.dataType === dtype
			} );
		} );
		const total_sheets = {};
		list.forEach ( dataObj => {
			total_sheets[ dataObj._dataBaseName ] = dataObj.dataBase;
		} );
		if ( this.scene.background.dataObj._dataBaseName ) { // also add bg
			total_sheets[ this.scene.background.dataObj._dataBaseName ] = this.scene.background.dataObj.dataBase;
		}
		;
		const memoryUsage = ( () => {
			const m = process.memoryUsage ();
			Object.keys ( m ).map ( ( i ) => {
				return m[ i ] = ( m[ i ] / 1024 / 1024 ).toFixed ( 2 )
			} );
			return m;
		} ) ();
		return {
			memoryUsage,
			currentScene: this.scene.name,
			savePath: `data/${ this.scene.name }.json`,
			total_containerType,
			total_dataType,
			total_sheets,
			totalObjs: list.length,
		};
	};
}

window._stage = _stage;
// global.$stage = new _stage ();
// $app.stage = $stage;
// console.log1 ( '$stage: ', $stage );

}).call(this,require('_process'))

},{"_process":16}],3:[function(require,module,exports){
CameraComponent = {
	properties: {
		backgroundColor: 0x000000,
		renderingLayers: [],
		zoom: 1,
		depth: 0,
		renderTexture: null,
		renderTarget: null,
		renderSprite: null,
		screenW: 0,
		screenH: 0,
		worldW: 0,
		worldH: 0,
		cam: new Camera ()
	},
	serialize: {
		skip: [ 'cam', 'renderTexture', 'renderTarget', 'renderSprite' ]
	}
};

$ecs.registerComponent ( 'Camera', CameraComponent );

},{}],4:[function(require,module,exports){
DebugMoveComponent = {
	properties: {
		speedX: 3.0,
		speedY: 3.0
	}
};

$ecs.registerComponent ( 'DebugMove', DebugMoveComponent );

},{}],5:[function(require,module,exports){
CameraFollowTargetComponent = {
	properties: {
		smoothTimeX: 0.5,
		smoothTimeY: 0.5,
		offsetX: 0,
		offsetY: 0,
		target: null,	// <Entity>
		smoothXSpeed: 0,
		smoothYSpeed: 0,
	},
	serialize: {
		skip: [ 'target' ]
	}
};

$ecs.registerComponent ( 'CameraFollowTarget', CameraFollowTargetComponent );

},{}],6:[function(require,module,exports){
// module.exports = {
// 	ECS: require ( './ecs' ),
// 	System: require ( './system' ),
// 	Component: require ( './component' )
// }

require ( './transform' );
require ( './camera' );
require ( './sprite' );
require ( './tilemap' );
require ( './debug_move' );
require ( './follow_target' );

$ecs.registerAllDefinedComponents = function () {

	console.log ( 'loading components ...' );
	for ( const [key, value] of ComponentExports ) {
	// for ( const name of Object.keys ( ComponentExports ) ) {
		console.log ( `registering ${ key }` );
		SceneManager._ecs.registerComponent ( key, value );
	}
};

},{"./camera":3,"./debug_move":4,"./follow_target":5,"./sprite":7,"./tilemap":8,"./transform":9}],7:[function(require,module,exports){
SpriteComponent = {
	properties: {
		res: '',
		frame: null,
		tint: 0x000000,
		layer: 'Default',
		zIndex: 0,
		zOrder: 0,
		sprite: null
	},
	serialize: {
		skip: [ 'sprite' ]
	}
};

$ecs.registerComponent ( 'Sprite', SpriteComponent );

},{}],8:[function(require,module,exports){
TilemapComponent = {
	properties: {
		res: '',	// path to tmx
		tint: 0x000000,
		layer: 'Default',
		zIndex: 0,
		zOrder: 0,
		isReady: false,
		isLoading: false,
		tilemap: null	// PIXI.extras.TiledMap
	},
	serialize: {
		skip: [ 'tilemap' ]
	}
};

$ecs.registerComponent ( 'Tilemap', TilemapComponent );

},{}],9:[function(require,module,exports){
// class TransformComponent extends BaseComponent {
// 	localPosition = glMatrix.vec2.create ();
// 	position = glMatrix.vec2.create ();
// 	rotation = 0.0;
// }

TransformComponent = {
	properties: {
		localPosition: null,
		position: null,
		rotation: 0.0,
		parent: null
	}
};

$ecs.registerComponent ( 'Transform', TransformComponent );

},{}],10:[function(require,module,exports){
(function (global){
class DebugMoveSystem extends System {

	constructor ( ecs ) {
		super ( ecs );
		
		this.horizontal = 0;
		this.vertical = 0;
		
		document.addEventListener ( 'keydown', ( event ) => {
			if ( event.key == 'w' ) {
				this.vertical = -1;
			}
			if ( event.key == 's' ) {
				this.vertical = 1;
			}
			if ( event.key == 'a' ) {
				this.horizontal = -1;
			}
			if ( event.key == 'd' ) {
				this.horizontal = 1;
			}
		} );

		document.addEventListener ( 'keyup', ( event ) => {
			if ( event.key == 'w' ) {
				this.vertical = 0;
			}
			if ( event.key == 's' ) {
				this.vertical = 0;
			}
			if ( event.key == 'a' ) {
				this.horizontal = 0;
			}
			if ( event.key == 'd' ) {
				this.horizontal = 0;
			}
		} );
	}

	update ( tick, entities ) {

		for ( const entity of entities ) {
			if ( this.horizontal != 0 || this.vertical != 0 ) {
				let position = entity.Transform.position;
				entity.Transform.position.set ( position.x + entity.DebugMove.speedX * this.horizontal * $app.deltaTime, position.y + entity.DebugMove.speedY * this.vertical * $app.deltaTime )

				// console.log1 ( entity.id, 'Debug Move:', entity.Transform.position.x, entity.Transform.position.y );
			}
		}
	}
}

DebugMoveSystem.query = {
	has: [ 'Transform', 'DebugMove' ]
};

global.DebugMoveSystem = DebugMoveSystem;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],11:[function(require,module,exports){
(function (global){
class CameraFollowTargetSystem extends System {

	constructor ( ecs ) {
		super ( ecs );
		this.speed = 0.0;
	}

	update ( tick, entities ) {

		for ( const entity of entities ) {

			if ( !entity.CameraFollowTarget.target ) {
				continue;
			}

			let cameraComponent = entity.Camera;
			let followComponent = entity.CameraFollowTarget;
			let targetPosition = followComponent.target.Transform.position;
			let cameraCenter = cameraComponent.cam.center;
			let x = 0;
			let y = 0;

			this.speed = followComponent.smoothXSpeed;
			x = this.inertialDamp ( cameraCenter.x, targetPosition.x + followComponent.offsetX, followComponent.smoothTimeX );
			followComponent.smoothXSpeed = this.speed;

			this.speed = followComponent.smoothYSpeed;
			y = this.inertialDamp ( cameraCenter.y, targetPosition.y + followComponent.offsetY, followComponent.smoothTimeY );
			followComponent.smoothYSpeed = this.speed;
			
			// console.log2 ( `target: (${entity.Transform.position.x}, ${entity.Transform.position.y}) (${entity.FollowTarget.target.Transform.position.x}, ${entity.FollowTarget.target.Transform.position.y})` );

			cameraComponent.cam.moveCenter ( x, y );
			entity.Transform.position.set ( cameraComponent.cam.position.x, cameraComponent.cam.position.y );
		}
	}

	smoothDamp ( previousValue, targetValue, smoothTime ) {
		let T1 = 0.36 * smoothTime;
		let T2 = 0.64 * smoothTime;
		let x = previousValue - targetValue;
		let newSpeed = this.speed + $app.deltaTime * ( -1 / ( T1 * T2 ) * x - ( T1 + T2 ) / ( T1 * T2 ) * this.speed );
		let newValue = x + $app.deltaTime * this.speed;
		this.speed = newSpeed;
		return targetValue + newValue;
	}

	inertialDamp ( previousValue, targetValue, smoothTime ) {
		let x = previousValue - targetValue;
		let newValue = x + $app.deltaTime * ( -1.0 / smoothTime * x );
		return targetValue + newValue;
	}
}

CameraFollowTargetSystem.query = {
	has: [ 'Transform', 'Camera', 'CameraFollowTarget' ]
};

global.CameraFollowTargetSystem = CameraFollowTargetSystem;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],12:[function(require,module,exports){
require ( './rendering_system' );
require ( './sprite_rendering_system' );
require ( './tilemap_load_system' );
require ( './debug_move_system' );
require ( './follow_target_system' );

},{"./debug_move_system":10,"./follow_target_system":11,"./rendering_system":13,"./sprite_rendering_system":14,"./tilemap_load_system":15}],13:[function(require,module,exports){
(function (global){
class RenderingSystem extends System {

	constructor ( ecs ) {
		super ( ecs );
		this.cameraComponents = [];
		this.renderSprite = new PIXI.Sprite ();
		this.renderSprite.blendMode = PIXI.BLEND_MODES.SCREEN;

		// for ( const layerName of $app.renderingLayers.keys () ) {
		// 	if ( $app.renderingLayers.has ( layerName )  ) {
		// 		let layer = $app.renderingLayers.get ( layerName );
		// 		$app.stage.addChild ( layer );
		// 	}
		// }

		// debug
		document.addEventListener ( 'keydown', ( event ) => {
			if ( event.key == 'p' ) {
				for ( const camera of this.cameraComponents ) {
					Graphics.dumpRenderTexture ( camera.renderTexture );
				}
				console.log0 ( 'renderTexture dumped!' );
			}
			if ( event.key == 'o' ) {
				for ( const camera of this.cameraComponents ) {
					Graphics.dumpRenderTexture ( camera.renderSprite );
				}
				console.log0 ( 'renderSprite dumped!' );
			}
		} );
	}

	update ( tick, entities ) {

		this.cameraComponents.splice ( 0, this.cameraComponents.length );
		
		for ( const entity of entities ) {
			this.cameraComponents.push ( entity.Camera );
		}

		this.cameraComponents.sort ( this.sortCameraDepth );
		
		Graphics.tickStart ();

		// rendering every camera viewport to rendertexture
		for ( const camera of this.cameraComponents ) {

			if ( camera.renderingLayers.length === 0 ) {
				continue;
			}
			
			if ( camera.renderTexture == null ) {
				camera.renderTexture = PIXI.RenderTexture.create ( Graphics.width, Graphics.height, PIXI.SCALE_MODES.NEAREST, 1 );
			}

			if ( camera.renderTarget == null ) {
				camera.renderTarget = new PIXI.RenderTarget ( Graphics._renderer.gl, Graphics.width, Graphics.height, PIXI.SCALE_MODES.NEAREST );
			}
			
			if ( camera.renderSprite == null ) {
				camera.renderSprite = new PIXI.Sprite ();
				camera.renderSprite.texture = camera.renderTexture;
			}
			
			// if ( camera.cam.zoom !== camera.zoom ) {
			// 	camera.cam.zoom = camera.zoom;
			// }
			
			// remove all
			$app.stage.removeChildren ();

			// add current render camera
			$app.stage.addChild ( camera.cam );
			
			// add camera rendering layer
			for ( const layerName of camera.renderingLayers ) {
				if ( $app.renderingLayers.has ( layerName )  ) {
					let layer = $app.renderingLayers.get ( layerName );
					if ( layer.visible ) {
						camera.cam.addChild ( layer );
					}
				}
			}
			
			if ( camera.cam.children.length === 0 ) {
				continue;
			}

			// rendering stage
			// Graphics.render ( $app.stage );
			Graphics.render ( $app.stage, camera.renderTexture, camera.renderTarget );

			// remove camera all rendering layer
			camera.cam.removeChildren ();
		}

		// render final result
		this.renderSprite.removeChildren ();
		for ( const camera of this.cameraComponents ) {
			this.renderSprite.addChild ( camera.renderSprite );
		}
		Graphics._renderer.render ( this.renderSprite );
		// Graphics._renderer.gl.flush ();
		
		Graphics.tickEnd ();
	}
	
	sortCameraDepth ( a, b ) {
		return a.depth - b.depth;
	}
}

RenderingSystem.query = {
	has: [ 'Transform', 'Camera' ]
};

global.RenderingSystem = RenderingSystem;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],14:[function(require,module,exports){
(function (global){
class SpriteRenderingSystem extends System {

	constructor ( ecs ) {
		super ( ecs );
	}

	update ( tick, entities ) {
		
		for ( const entity of entities ) {
			
			if ( !entity.Sprite.sprite ) {
				let filename = entity.Sprite.res.substring ( entity.Sprite.res.lastIndexOf ( '/' ) + 1, entity.Sprite.res.length );
				let folder = entity.Sprite.res.contains ( '/' ) ? entity.Sprite.res.substring ( 0, entity.Sprite.res.lastIndexOf ( '/' ) + 1 ) : '';
				entity.Sprite.sprite = new Sprite ();
				entity.Sprite.sprite.bitmap = ImageManager.loadBitmap ( folder, filename, 0, false );
				entity.Sprite.sprite.setFrame ( entity.Sprite.frame.x, entity.Sprite.frame.y, entity.Sprite.frame.width, entity.Sprite.frame.height );
				if ( $app.renderingLayers.has ( entity.Sprite.layer ) ) {
					$app.renderingLayers.get ( entity.Sprite.layer ).addChild ( entity.Sprite.sprite );
				}
			}
			
			if ( entity.Transform && entity.Sprite.sprite ) {
				entity.Sprite.sprite.position.set ( entity.Transform.position.x, entity.Transform.position.y );
				// entity.Sprite.sprite.x = entity.Transform.position.x;
				// entity.Sprite.sprite.y = entity.Transform.position.y;
				
				let enableSort = false;
				if ( entity.Sprite.sprite.zIndex !== entity.Sprite.zIndex ) {
					entity.Sprite.sprite.zIndex = entity.Sprite.zIndex;
					enableSort = true;
				}
				if ( entity.Sprite.sprite.zOrder !== entity.Sprite.zOrder ) {
					entity.Sprite.sprite.zOrder = entity.Sprite.zOrder;
					enableSort = true;
				}
				
				if ( enableSort ) {
					$app.renderingLayers.get ( entity.Sprite.layer ).group.enableSort = enableSort;
				}
				
				// Graphics._renderer.render ( entity.Sprite.sprite );
			}
		}
	}
}

SpriteRenderingSystem.query = {
	has: [ 'Transform', 'Sprite' ]
};

global.SpriteRenderingSystem = SpriteRenderingSystem;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],15:[function(require,module,exports){
(function (global){
class TilemapLoadSystem extends System {

	constructor ( ecs ) {
		super ( ecs );
	}

	update ( tick, entities ) {

		for ( const entity of entities ) {

			if ( !entity.Tilemap.tilemap && !entity.Tilemap.isReady && !entity.Tilemap.isLoading ) {
				let component = entity.Tilemap;
				let filename = component.res.substring ( component.res.lastIndexOf ( '/' ) + 1, component.res.length );
				let folder = component.res.contains ( '/' ) ? component.res.substring ( 0, component.res.lastIndexOf ( '/' ) + 1 ) : '';

				// TODO: move to ResManager
				PIXI.loader
					.add ( component.res )
					// .error ( ( err, loader, resource ) => {
					// 	entity.Tilemap.isLoading = false;
					// } )
					.load ( () => {
						/**
						 *   PIXI.extras.TiledMap() is an extended PIXI.Container()
						 *   so you can render it right away
						 */
						component.tilemap = new PIXI.tilemap.TiledMap ( component.res );
						component.isReady = true;
						component.isLoading = false;

						if ( $app.renderingLayers.has ( component.layer ) ) {
							$app.renderingLayers.get ( component.layer ).addChild ( component.tilemap );
						}
						
						console.log3 ( 'TiledMap: ' + component.res, 'loaded!' );
					} );

				component.isLoading = true;
			}

			if ( entity.Transform && entity.Tilemap.tilemap ) {
				entity.Tilemap.tilemap.position.set ( entity.Transform.position.x, entity.Transform.position.y );

				let enableSort = false;
				if ( entity.Tilemap.tilemap.zIndex !== entity.Tilemap.zIndex ) {
					entity.Tilemap.tilemap.zIndex = entity.Tilemap.zIndex;
					enableSort = true;
				}
				if ( entity.Tilemap.tilemap.zOrder !== entity.Tilemap.zOrder ) {
					entity.Tilemap.tilemap.zOrder = entity.Tilemap.zOrder;
					enableSort = true;
				}

				if ( enableSort ) {
					$app.renderingLayers.get ( entity.Tilemap.layer ).group.enableSort = enableSort;
				}
				
				// Graphics._renderer.render ( entity.Tilemap.tilemap );
			}
		}
	}
}

TilemapLoadSystem.query = {
	has: [ 'Transform', 'Tilemap' ]
};

global.TilemapLoadSystem = TilemapLoadSystem;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],16:[function(require,module,exports){
// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;
process.prependListener = noop;
process.prependOnceListener = noop;

process.listeners = function (name) { return [] }

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3Vzci9sb2NhbC9saWIvbm9kZV9tb2R1bGVzL3dhdGNoaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJqcy9hcHAuanMiLCJqcy9jb3JlL3N0YWdlLmpzIiwianMvZWNzL2NvbXBvbmVudHMvY2FtZXJhLmpzIiwianMvZWNzL2NvbXBvbmVudHMvZGVidWdfbW92ZS5qcyIsImpzL2Vjcy9jb21wb25lbnRzL2ZvbGxvd190YXJnZXQuanMiLCJqcy9lY3MvY29tcG9uZW50cy9pbmRleC5qcyIsImpzL2Vjcy9jb21wb25lbnRzL3Nwcml0ZS5qcyIsImpzL2Vjcy9jb21wb25lbnRzL3RpbGVtYXAuanMiLCJqcy9lY3MvY29tcG9uZW50cy90cmFuc2Zvcm0uanMiLCJqcy9lY3Mvc3lzdGVtcy9kZWJ1Z19tb3ZlX3N5c3RlbS5qcyIsImpzL2Vjcy9zeXN0ZW1zL2ZvbGxvd190YXJnZXRfc3lzdGVtLmpzIiwianMvZWNzL3N5c3RlbXMvaW5kZXguanMiLCJqcy9lY3Mvc3lzdGVtcy9yZW5kZXJpbmdfc3lzdGVtLmpzIiwianMvZWNzL3N5c3RlbXMvc3ByaXRlX3JlbmRlcmluZ19zeXN0ZW0uanMiLCJqcy9lY3Mvc3lzdGVtcy90aWxlbWFwX2xvYWRfc3lzdGVtLmpzIiwiLi4vLi4vLi4vLi4vLi4vdXNyL2xvY2FsL2xpYi9ub2RlX21vZHVsZXMvd2F0Y2hpZnkvbm9kZV9tb2R1bGVzL3Byb2Nlc3MvYnJvd3Nlci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7O0FDbGJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDeEhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDUkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUNoQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7O0FDekRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQzNEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQ0xBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7OztBQ3JIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7QUNuREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDcEVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbigpe2Z1bmN0aW9uIHIoZSxuLHQpe2Z1bmN0aW9uIG8oaSxmKXtpZighbltpXSl7aWYoIWVbaV0pe3ZhciBjPVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmU7aWYoIWYmJmMpcmV0dXJuIGMoaSwhMCk7aWYodSlyZXR1cm4gdShpLCEwKTt2YXIgYT1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK2krXCInXCIpO3Rocm93IGEuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixhfXZhciBwPW5baV09e2V4cG9ydHM6e319O2VbaV1bMF0uY2FsbChwLmV4cG9ydHMsZnVuY3Rpb24ocil7dmFyIG49ZVtpXVsxXVtyXTtyZXR1cm4gbyhufHxyKX0scCxwLmV4cG9ydHMscixlLG4sdCl9cmV0dXJuIG5baV0uZXhwb3J0c31mb3IodmFyIHU9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZSxpPTA7aTx0Lmxlbmd0aDtpKyspbyh0W2ldKTtyZXR1cm4gb31yZXR1cm4gcn0pKCkiLCJQSVhJLnNldHRpbmdzLlBSRUNJU0lPTl9GUkFHTUVOVCA9IFBJWEkuUFJFQ0lTSU9OLkhJR0g7XG5cbmNsYXNzIF9hcHAge1xuXG5cdGdldCByZW5kZXJlciAoKSB7XG5cdFx0cmV0dXJuIEdyYXBoaWNzLl9yZW5kZXJlcjtcblx0fVxuXG5cdGdldCB2aWV3ICgpIHtcblx0XHRyZXR1cm4gR3JhcGhpY3MuX3JlbmRlcmVyLnZpZXc7XG5cdH1cblxuXHRnZXQgc2NyZWVuICgpIHtcblx0XHRyZXR1cm4gR3JhcGhpY3MuX3JlbmRlcmVyLnNjcmVlbjtcblx0fVxuXG5cdGdldCByZW5kZXJpbmdMYXllcnMgKCkge1xuXHRcdHJldHVybiB0aGlzLl9yZW5kZXJpbmdMYXllcnM7XG5cdH1cblxuXHRjb25zdHJ1Y3RvciAoKSB7XG5cdFx0Ly8gc3VwZXIgKCB7XG5cdFx0Ly8gXHR3aWR0aDogODAwLFxuXHRcdC8vIFx0aGVpZ2h0OiA2MDAsXG5cdFx0Ly8gXHRhbnRpYWxpYXM6IHRydWUsXG5cdFx0Ly8gXHR0cmFuc3BhcmVudDogZmFsc2UsXG5cdFx0Ly8gXHRyZXNvbHV0aW9uOiAyLFxuXHRcdC8vIFx0c2hhcmVkVGlja2VyOiB0cnVlLFxuXHRcdC8vIFx0YmFja2dyb3VuZENvbG9yOiAweDMwMzAzMFxuXHRcdC8vIFx0Ly8gcG93ZXJQcmVmZXJlbmNlOiBTTEkmQ3Jvc3NGaXJlIEdQVSwgVE9ETzogc3R1ZHkgbWVcblx0XHQvLyB9ICk7XG5cblx0XHRHcmFwaGljcy5pbml0aWFsaXplICggODE2LCA2MjQsICd3ZWJnbCcgKTtcblx0XHRHcmFwaGljcy5zaG93RnBzICgpO1xuXHRcdC8vIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQgKCB0aGlzLnJlbmRlcmVyLnZpZXcgKTtcblxuXHRcdHRoaXMubndqcyA9IHRoaXMuaXNOd2pzICgpICYmIHRoaXMuaW5pdE53anMgKCk7XG5cdFx0Ly90aGlzLm53anMud2luLnNob3dEZXZUb29scygpIC8vYXV0by1zdGFydCBkZXZUb29sIGNocm9taXVtXG5cblx0XHQvLyBSZW5kZXJpbmcgTGF5ZXJzXG5cdFx0Ly8gVE9ETzog5LuO6YWN572u5paH5Lu25Lit5Yqg6L29TGF5ZXJcblx0XHR0aGlzLl9yZW5kZXJpbmdMYXllcnMgPSBuZXcgTWFwICgpO1xuXHRcdHRoaXMuX3JlbmRlcmluZ0xheWVycy5zZXQgKCAnRGVmYXVsdCcsIG5ldyBQSVhJLmRpc3BsYXkuTGF5ZXIgKCkgKTtcblx0XHR0aGlzLl9yZW5kZXJpbmdMYXllcnMuc2V0ICggJ01hcCcsIG5ldyBQSVhJLmRpc3BsYXkuTGF5ZXIgKCkgKTtcblx0XHR0aGlzLl9yZW5kZXJpbmdMYXllcnMuc2V0ICggJ0dVSScsIG5ldyBQSVhJLmRpc3BsYXkuTGF5ZXIgKCkgKTtcblx0XHRcblx0XHQvLyBkb2N1bWVudC5ib2R5Lm9ucmVzaXplID0gKCkgPT4ge1xuXHRcdC8vIFx0dGhpcy5zY2FsZVRvV2luZG93ICgpXG5cdFx0Ly8gfTtcblxuXHRcdHdpbmRvdy5hZGRFdmVudExpc3RlbmVyICggJ2Vycm9yJywgdGhpcy5vbkVycm9yLmJpbmQgKCB0aGlzICkgKTtcblx0fTtcblxuXHQvLyBCb290IEFwcFxuXHRydW4gKCkge1xuXHRcdHRyeSB7XG5cblx0XHRcdHRoaXMuc3RhZ2UgPSBuZXcgX3N0YWdlICgpO1xuXHRcdFx0dGhpcy5zdGFnZS5pbml0aWFsaXplICgpO1xuXG5cdFx0XHR0aGlzLmluaXRpYWxpemVfRUNTICgpO1xuXHRcdFx0dGhpcy50ZXN0ICgpO1xuXG5cdFx0XHR0aGlzLnRpY2tlciA9IFBJWEkudGlja2VyLnNoYXJlZC5hZGQgKCB0aGlzLnVwZGF0ZSwgdGhpcyApO1xuXG5cdFx0fSBjYXRjaCAoIGUgKSB7XG5cdFx0XHR0aHJvdyBjb25zb2xlLmVycm9yICggZS5zdGFjayApO1xuXHRcdH1cblx0fTtcblxuXHRpbml0aWFsaXplX0VDUyAoKSB7XG5cblx0XHR0aGlzLmVjcyA9IG5ldyBFQ1MgKCk7XG5cdFx0d2luZG93LiRlY3MgPSB0aGlzLmVjcztcblxuXHRcdHJlcXVpcmUgKCAnLi9lY3Mvc3lzdGVtcy9pbmRleCcgKTtcblx0XHRyZXF1aXJlICggJy4vZWNzL2NvbXBvbmVudHMvaW5kZXgnICk7XG5cblx0XHR0aGlzLmVjcy5hZGRTeXN0ZW0gKCBFQ1MuR1JPVVBfQWN0aW9uLCBuZXcgU3ByaXRlUmVuZGVyaW5nU3lzdGVtICggdGhpcy5lY3MgKSApO1xuXHRcdHRoaXMuZWNzLmFkZFN5c3RlbSAoIEVDUy5HUk9VUF9BY3Rpb24sIG5ldyBUaWxlbWFwTG9hZFN5c3RlbSAoIHRoaXMuZWNzICkgKTtcblx0XHR0aGlzLmVjcy5hZGRTeXN0ZW0gKCBFQ1MuR1JPVVBfQWN0aW9uLCBuZXcgQ2FtZXJhRm9sbG93VGFyZ2V0U3lzdGVtICggdGhpcy5lY3MgKSApO1xuXHRcdHRoaXMuZWNzLmFkZFN5c3RlbSAoIEVDUy5HUk9VUF9BY3Rpb24sIG5ldyBEZWJ1Z01vdmVTeXN0ZW0gKCB0aGlzLmVjcyApICk7XG5cdFx0dGhpcy5lY3MuYWRkU3lzdGVtICggRUNTLkdST1VQX1JlbmRlciwgbmV3IFJlbmRlcmluZ1N5c3RlbSAoIHRoaXMuZWNzICkgKTtcblxuXHRcdC8vIFRlc3Rcblx0XHRsZXQgY2FtZXJhID0gJGVjcy5jcmVhdGVFbnRpdHkgKCB7XG5cdFx0XHRpZDogJ01haW4gQ2FtZXJhJyxcblx0XHRcdFRyYW5zZm9ybToge1xuXHRcdFx0XHRwb3NpdGlvbjogbmV3IFBJWEkuUG9pbnQgKCksXG5cdFx0XHRcdGxvY2FsUG9zaXRpb246IG5ldyBQSVhJLlBvaW50ICgpLFxuXHRcdFx0fSxcblx0XHRcdENhbWVyYToge1xuXHRcdFx0XHRyZW5kZXJpbmdMYXllcnM6IFsgJ01hcCcsICdEZWZhdWx0JyBdLFxuXHRcdFx0XHR6b29tOiAxLFxuXHRcdFx0XHRkZXB0aDogMFxuXHRcdFx0fSxcblx0XHRcdC8vIERlYnVnTW92ZToge1xuXHRcdFx0Ly8gXHRzcGVlZFg6IC0xMjAuMCxcblx0XHRcdC8vIFx0c3BlZWRZOiAtMTIwLjAsXG5cdFx0XHQvLyB9XG5cdFx0fSApO1xuXG5cdFx0Ly8gbGV0IGNhbWVyYV8yID0gJGVjcy5jcmVhdGVFbnRpdHkgKCB7XG5cdFx0Ly8gXHRpZDogJ1VJIENhbWVyYScsXG5cdFx0Ly8gXHRUcmFuc2Zvcm06IHtcblx0XHQvLyBcdFx0cG9zaXRpb246IG5ldyBQSVhJLlBvaW50ICgpLFxuXHRcdC8vIFx0XHRsb2NhbFBvc2l0aW9uOiBuZXcgUElYSS5Qb2ludCAoKSxcblx0XHQvLyBcdH0sXG5cdFx0Ly8gXHRDYW1lcmE6IHtcblx0XHQvLyBcdFx0cmVuZGVyaW5nTGF5ZXJzOiBbICdHVUknIF0sXG5cdFx0Ly8gXHRcdGRlcHRoOiAxXG5cdFx0Ly8gXHR9XG5cdFx0Ly8gfSApO1xuXG5cdFx0bGV0IHNwcml0ZU9iaiA9ICRlY3MuY3JlYXRlRW50aXR5ICgge1xuXHRcdFx0aWQ6ICdTcHJpdGUgT2JqZWN0Jyxcblx0XHRcdFRyYW5zZm9ybToge1xuXHRcdFx0XHRwb3NpdGlvbjogbmV3IFBJWEkuUG9pbnQgKCksXG5cdFx0XHRcdGxvY2FsUG9zaXRpb246IG5ldyBQSVhJLlBvaW50ICgpLFxuXHRcdFx0fSxcblx0XHRcdFNwcml0ZToge1xuXHRcdFx0XHRyZXM6ICdpbWcvZmFjZXMvQWN0b3IxJyxcblx0XHRcdFx0ZnJhbWU6IG5ldyBQSVhJLlJlY3RhbmdsZSAoIDAsIDAsIDE0NCwgMTQ0ICksXG5cdFx0XHRcdGxheWVyOiAnRGVmYXVsdCcsXG5cdFx0XHRcdHpJbmRleDogMSxcblx0XHRcdFx0ek9yZGVyOiAwLFxuXHRcdFx0fSxcblx0XHRcdC8vIERlYnVnTW92ZToge1xuXHRcdFx0Ly8gXHRzcGVlZFg6IDEwMC4wLFxuXHRcdFx0Ly8gXHRzcGVlZFk6IDEwMC4wLFxuXHRcdFx0Ly8gfVxuXHRcdH0gKTtcblxuXHRcdGxldCBzcHJpdGVPYmpfMiA9ICRlY3MuY3JlYXRlRW50aXR5ICgge1xuXHRcdFx0aWQ6ICdTcHJpdGUgT2JqZWN0IDInLFxuXHRcdFx0VHJhbnNmb3JtOiB7XG5cdFx0XHRcdHBvc2l0aW9uOiBuZXcgUElYSS5Qb2ludCAoIDU1MCwgNTUwICksXG5cdFx0XHRcdGxvY2FsUG9zaXRpb246IG5ldyBQSVhJLlBvaW50ICgpLFxuXHRcdFx0fSxcblx0XHRcdFNwcml0ZToge1xuXHRcdFx0XHRyZXM6ICdpbWcvZmFjZXMvQWN0b3IxJyxcblx0XHRcdFx0ZnJhbWU6IG5ldyBQSVhJLlJlY3RhbmdsZSAoIDAsIDE0NCwgMTQ0LCAxNDQgKSxcblx0XHRcdFx0bGF5ZXI6ICdEZWZhdWx0Jyxcblx0XHRcdFx0ekluZGV4OiAxLFxuXHRcdFx0XHR6T3JkZXI6IC0xLFxuXHRcdFx0fSxcblx0XHRcdERlYnVnTW92ZToge1xuXHRcdFx0XHRzcGVlZFg6IDIwMC4wLFxuXHRcdFx0XHRzcGVlZFk6IDIwMC4wLFxuXHRcdFx0fVxuXHRcdH0gKTtcblxuXHRcdGxldCB0aWxlbWFwID0gJGVjcy5jcmVhdGVFbnRpdHkgKCB7XG5cdFx0XHRpZDogJ01hcCcsXG5cdFx0XHRUcmFuc2Zvcm06IHtcblx0XHRcdFx0cG9zaXRpb246IG5ldyBQSVhJLlBvaW50ICgpLFxuXHRcdFx0XHRsb2NhbFBvc2l0aW9uOiBuZXcgUElYSS5Qb2ludCAoKSxcblx0XHRcdH0sXG5cdFx0XHRUaWxlbWFwOiB7XG5cdFx0XHRcdHJlczogJ21hcHMvbWFwMDAxLmpzb24nLFxuXHRcdFx0XHRsYXllcjogJ0RlZmF1bHQnLFxuXHRcdFx0XHR6SW5kZXg6IDAsXG5cdFx0XHRcdHpPcmRlcjogMCxcblx0XHRcdH1cblx0XHR9ICk7XG5cblx0XHRjYW1lcmEuYWRkQ29tcG9uZW50ICgnQ2FtZXJhRm9sbG93VGFyZ2V0Jywge1xuXHRcdFx0c21vb3RoVGltZVg6IDAuMTUsXG5cdFx0XHRzbW9vdGhUaW1lWTogMC4xNSxcblx0XHRcdC8vIG9mZnNldFg6IEdyYXBoaWNzLndpZHRoIC8gMixcblx0XHRcdC8vIG9mZnNldFk6IEdyYXBoaWNzLmhlaWdodCAvIDIsXG5cdFx0XHR0YXJnZXQ6IHNwcml0ZU9ial8yLFxuXHRcdH0gKTtcblx0fVxuXG5cdHRlc3QgKCkge1xuXHRcdFxuXHR9XG5cblx0dXBkYXRlICggZGVsdGEgKSB7XG5cdFx0Ly8gdHJ5IHtcblx0XHQvL1x0XG5cdFx0Ly8gfSBjYXRjaCAoIGUgKSB7XG5cdFx0Ly8gXHQvLyAkYXBwLm53anMud2luLnNob3dEZXZUb29scyAoKTtcblx0XHQvLyBcdHRocm93IGNvbnNvbGUuZXJyb3IgKCBlLm1lc3NhZ2UgKyBcIlxcblwiICsgZS5zdGFjayApO1xuXHRcdC8vIH1cblxuXHRcdC8vIGlmICggdGhpcy5uZXh0U2NlbmUgKSB7XG5cdFx0Ly8gXHR0aGlzLnNjZW5lID0gdGhpcy5uZXh0U2NlbmU7XG5cdFx0Ly8gfSBlbHNlIGlmICggdGhpcy5zY2VuZS5fc3RhcnRlZCApIHtcblx0XHQvLyBcdHRoaXMuc2NlbmUudXBkYXRlICggZGVsdGEgKTtcblx0XHQvLyBcdCRtb3VzZS51cGRhdGUgKCk7IC8vIEZJWE1FOiBtZXR0cmUgZGFucyBzY2VuZSB1ZHBhdGUgPyBwZXJtZXRyYSBldHJlIGNvbnRyb2xlciBwYXIgbGVzIGV2ZW50IGRlIHNjZW5lID9cblx0XHQvLyB9IGVsc2UgaWYgKCB0aGlzLnNjZW5lICYmICF0aGlzLnNjZW5lLl9zdGFydGVkICkge1xuXHRcdC8vIFx0dGhpcy5zY2VuZS5zdGFydCAoKTtcblx0XHQvLyB9XG5cblx0XHR0aGlzLmRlbHRhVGltZSA9IGRlbHRhIC8gMTAwLjA7XG5cblx0XHR0aGlzLmVjcy50aWNrICgpO1xuXHRcdHRoaXMuZWNzLnJ1blN5c3RlbUdyb3VwICggRUNTLkdST1VQX0lucHV0ICk7XG5cdFx0dGhpcy5lY3MucnVuU3lzdGVtR3JvdXAgKCBFQ1MuR1JPVVBfQWN0aW9uICk7XG5cdFx0dGhpcy5lY3MucnVuU3lzdGVtR3JvdXAgKCBFQ1MuR1JPVVBfUmVuZGVyICk7XG5cdH07XG5cblx0aXNOd2pzICgpIHtcblx0XHRyZXR1cm4gdHlwZW9mIHJlcXVpcmUgPT09ICdmdW5jdGlvbicgJiYgdHlwZW9mIHByb2Nlc3MgPT09ICdvYmplY3QnO1xuXHR9O1xuXG5cdGluaXROd2pzICgpIHtcblx0XHQvLyBsZXQgZHcgPSA4MDAgLSB3aW5kb3cuaW5uZXJXaWR0aDtcblx0XHQvLyBsZXQgZGggPSA2MDAgLSB3aW5kb3cuaW5uZXJIZWlnaHQ7XG5cdFx0Ly8gbGV0IGd1aSA9IHJlcXVpcmUgKCAnbncuZ3VpJyApO1xuXHRcdC8vIGxldCB3aW4gPSBndWkuV2luZG93LmdldCAoKTtcblx0XHQvLyB3aW4uZm9jdXMgKCk7XG5cdFx0Ly8gd2luZG93Lm1vdmVCeSAoIC1kdyAvIDIsIC1kaCAvIDIgKTtcblx0XHQvLyB3aW5kb3cucmVzaXplQnkgKCBkdywgZGggKTtcblx0XHQvLyBpZiAoIHByb2Nlc3MucGxhdGZvcm0gPT09ICdkYXJ3aW4nICYmICF3aW4ubWVudSApIHtcblx0XHQvLyBcdHZhciBtZW51YmFyID0gbmV3IGd1aS5NZW51ICggeyB0eXBlOiAnbWVudWJhcicgfSApO1xuXHRcdC8vIFx0dmFyIG9wdGlvbiA9IHsgaGlkZUVkaXQ6IHRydWUsIGhpZGVXaW5kb3c6IHRydWUgfTtcblx0XHQvLyBcdG1lbnViYXIuY3JlYXRlTWFjQnVpbHRpbiAoICdHYW1lJywgb3B0aW9uICk7XG5cdFx0Ly8gXHR3aW4ubWVudSA9IG1lbnViYXI7XG5cdFx0Ly8gfVxuXHRcdC8vIHJldHVybiB7IGd1aSwgd2luIH07XG5cdH07XG5cblx0cmVxdWVzdEZ1bGxTY3JlZW4gKCkge1xuXHRcdHZhciBlbGVtZW50ID0gZG9jdW1lbnQuYm9keTtcblx0XHRpZiAoIGVsZW1lbnQucmVxdWVzdEZ1bGxTY3JlZW4gKSB7XG5cdFx0XHRlbGVtZW50LnJlcXVlc3RGdWxsU2NyZWVuICgpO1xuXHRcdH0gZWxzZSBpZiAoIGVsZW1lbnQubW96UmVxdWVzdEZ1bGxTY3JlZW4gKSB7XG5cdFx0XHRlbGVtZW50Lm1velJlcXVlc3RGdWxsU2NyZWVuICgpO1xuXHRcdH0gZWxzZSBpZiAoIGVsZW1lbnQud2Via2l0UmVxdWVzdEZ1bGxTY3JlZW4gKSB7XG5cdFx0XHRlbGVtZW50LndlYmtpdFJlcXVlc3RGdWxsU2NyZWVuICggRWxlbWVudC5BTExPV19LRVlCT0FSRF9JTlBVVCApO1xuXHRcdH0gZWxzZSBpZiAoIGVsZW1lbnQubXNSZXF1ZXN0RnVsbHNjcmVlbiApIHtcblx0XHRcdGVsZW1lbnQubXNSZXF1ZXN0RnVsbHNjcmVlbiAoKTtcblx0XHR9XG5cdFx0dGhpcy5fZnVsbFNjcmVlbiA9IHRydWU7XG5cdH07XG5cblx0Y2FuY2VsRnVsbFNjcmVlbiAoKSB7XG5cdFx0aWYgKCBkb2N1bWVudC5jYW5jZWxGdWxsU2NyZWVuICkge1xuXHRcdFx0ZG9jdW1lbnQuY2FuY2VsRnVsbFNjcmVlbiAoKTtcblx0XHR9IGVsc2UgaWYgKCBkb2N1bWVudC5tb3pDYW5jZWxGdWxsU2NyZWVuICkge1xuXHRcdFx0ZG9jdW1lbnQubW96Q2FuY2VsRnVsbFNjcmVlbiAoKTtcblx0XHR9IGVsc2UgaWYgKCBkb2N1bWVudC53ZWJraXRDYW5jZWxGdWxsU2NyZWVuICkge1xuXHRcdFx0ZG9jdW1lbnQud2Via2l0Q2FuY2VsRnVsbFNjcmVlbiAoKTtcblx0XHR9IGVsc2UgaWYgKCBkb2N1bWVudC5tc0V4aXRGdWxsc2NyZWVuICkge1xuXHRcdFx0ZG9jdW1lbnQubXNFeGl0RnVsbHNjcmVlbiAoKTtcblx0XHR9XG5cdFx0dGhpcy5fZnVsbFNjcmVlbiA9IGZhbHNlO1xuXHR9O1xuXG5cdHNjYWxlVG9XaW5kb3cgKCkge1xuXHRcdGNvbnN0IGNhbnZhcyA9IHRoaXMudmlldztcblx0XHRsZXQgc2NhbGVYLCBzY2FsZVksIHNjYWxlLCBjZW50ZXI7XG5cdFx0c2NhbGVYID0gd2luZG93LmlubmVyV2lkdGggLyBjYW52YXMub2Zmc2V0V2lkdGg7XG5cdFx0c2NhbGVZID0gd2luZG93LmlubmVySGVpZ2h0IC8gY2FudmFzLm9mZnNldEhlaWdodDtcblx0XHRzY2FsZSA9IE1hdGgubWluICggc2NhbGVYLCBzY2FsZVkgKTtcblx0XHRjYW52YXMuc3R5bGUudHJhbnNmb3JtT3JpZ2luID0gXCIwIDBcIjtcblx0XHRjYW52YXMuc3R5bGUudHJhbnNmb3JtID0gXCJzY2FsZShcIiArIHNjYWxlICsgXCIpXCI7XG5cdFx0aWYgKCBjYW52YXMub2Zmc2V0V2lkdGggPiBjYW52YXMub2Zmc2V0SGVpZ2h0ICkge1xuXHRcdFx0aWYgKCBjYW52YXMub2Zmc2V0V2lkdGggKiBzY2FsZSA8IHdpbmRvdy5pbm5lcldpZHRoICkge1xuXHRcdFx0XHRjZW50ZXIgPSBcImhvcml6b250YWxseVwiXG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRjZW50ZXIgPSBcInZlcnRpY2FsbHlcIlxuXHRcdFx0fVxuXG5cdFx0fSBlbHNlIHtcblx0XHRcdGlmICggY2FudmFzLm9mZnNldEhlaWdodCAqIHNjYWxlIDwgd2luZG93LmlubmVySGVpZ2h0ICkge1xuXHRcdFx0XHRjZW50ZXIgPSBcInZlcnRpY2FsbHlcIlxuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0Y2VudGVyID0gXCJob3Jpem9udGFsbHlcIjtcblx0XHRcdH1cblxuXHRcdH1cblxuXHRcdGxldCBtYXJnaW47XG5cdFx0aWYgKCBjZW50ZXIgPT09IFwiaG9yaXpvbnRhbGx5XCIgKSB7XG5cdFx0XHRtYXJnaW4gPSAoIHdpbmRvdy5pbm5lcldpZHRoIC0gY2FudmFzLm9mZnNldFdpZHRoICogc2NhbGUgKSAvIDI7XG5cdFx0XHRjYW52YXMuc3R5bGUubWFyZ2luVG9wID0gMCArIFwicHhcIjtcblx0XHRcdGNhbnZhcy5zdHlsZS5tYXJnaW5Cb3R0b20gPSAwICsgXCJweFwiO1xuXHRcdFx0Y2FudmFzLnN0eWxlLm1hcmdpbkxlZnQgPSBtYXJnaW4gKyBcInB4XCI7XG5cdFx0XHRjYW52YXMuc3R5bGUubWFyZ2luUmlnaHQgPSBtYXJnaW4gKyBcInB4XCI7XG5cdFx0fVxuXG5cdFx0aWYgKCBjZW50ZXIgPT09IFwidmVydGljYWxseVwiICkge1xuXHRcdFx0bWFyZ2luID0gKCB3aW5kb3cuaW5uZXJIZWlnaHQgLSBjYW52YXMub2Zmc2V0SGVpZ2h0ICogc2NhbGUgKSAvIDI7XG5cdFx0XHRjYW52YXMuc3R5bGUubWFyZ2luVG9wID0gbWFyZ2luICsgXCJweFwiO1xuXHRcdFx0Y2FudmFzLnN0eWxlLm1hcmdpbkJvdHRvbSA9IG1hcmdpbiArIFwicHhcIjtcblx0XHRcdGNhbnZhcy5zdHlsZS5tYXJnaW5MZWZ0ID0gMCArIFwicHhcIjtcblx0XHRcdGNhbnZhcy5zdHlsZS5tYXJnaW5SaWdodCA9IDAgKyBcInB4XCI7XG5cdFx0fVxuXG5cdFx0Y2FudmFzLnN0eWxlLnBhZGRpbmdMZWZ0ID0gMCArIFwicHhcIjtcblx0XHRjYW52YXMuc3R5bGUucGFkZGluZ1JpZ2h0ID0gMCArIFwicHhcIjtcblx0XHRjYW52YXMuc3R5bGUucGFkZGluZ1RvcCA9IDAgKyBcInB4XCI7XG5cdFx0Y2FudmFzLnN0eWxlLnBhZGRpbmdCb3R0b20gPSAwICsgXCJweFwiO1xuXHRcdGNhbnZhcy5zdHlsZS5kaXNwbGF5ID0gXCItd2Via2l0LWlubGluZS1ib3hcIjtcblx0XHRyZXR1cm4gc2NhbGU7XG5cdH07XG5cblx0Ly8gR2V0IGEgcmF0aW8gZm9yIHJlc2l6ZSBpbiBhIGJvdW5kc1xuXHRnZXRSYXRpbyAoIG9iaiwgdywgaCApIHtcblx0XHRsZXQgciA9IE1hdGgubWluICggdyAvIG9iai53aWR0aCwgaCAvIG9iai5oZWlnaHQgKTtcblx0XHRyZXR1cm4gcjtcblx0fTtcblxuXHRoaXRDaGVjayAoIGEsIGIgKSB7IC8vIGNvbGlzaW9uXG5cdFx0dmFyIGFiID0gYS5fYm91bmRzUmVjdDtcblx0XHR2YXIgYmIgPSBiLl9ib3VuZHNSZWN0O1xuXHRcdHJldHVybiBhYi54ICsgYWIud2lkdGggPiBiYi54ICYmIGFiLnggPCBiYi54ICsgYmIud2lkdGggJiYgYWIueSArIGFiLmhlaWdodCA+IGJiLnkgJiYgYWIueSA8IGJiLnkgKyBiYi5oZWlnaHQ7XG5cdH07XG5cblx0b25FcnJvciAoIGUgKSB7XG5cdFx0Y29uc29sZS5lcnJvciAoIGUubWVzc2FnZSApO1xuXHRcdGNvbnNvbGUuZXJyb3IgKCBlLmZpbGVuYW1lLCBlLmxpbmVubyApO1xuXHRcdHRyeSB7XG5cdFx0XHQvLyB0aGlzLnN0b3AoKTtcblx0XHRcdEdyYXBoaWNzLnByaW50RXJyb3IgKCAnRXJyb3InLCBlLm1lc3NhZ2UgKTtcblx0XHRcdEdyYXBoaWNzLnByaW50RXJyb3IgKCAnU3RhY2tUcmFjZScsIGUuZmlsZW5hbWUgKTtcblx0XHRcdC8vIEF1ZGlvTWFuYWdlci5zdG9wQWxsKCk7XG5cdFx0fSBjYXRjaCAoIGUyICkge1xuXHRcdH1cblx0fTtcblxufSAvL0VORCBDTEFTU1xuXG5yZXF1aXJlICggJy4vY29yZS9zdGFnZScgKTtcblxuJGFwcCA9IG5ldyBfYXBwICgpOyAvLyBuZXcgUElYSS5BcHBsaWNhdGlvblxuXG5pZiAoICRhcHAuaXNOd2pzICgpICkge1xuXHR3aW5kb3cuZ2xvYmFsID0gd2luZG93O1xufVxuXG4vLyBnbG9iYWwuJGFwcCA9ICRhcHA7XG5cbi8vQWRkIHRoZSBjYW52YXMgdGhhdCBQaXhpIGF1dG9tYXRpY2FsbHkgY3JlYXRlZCBmb3IgeW91IHRvIHRoZSBIVE1MIGRvY3VtZW50XG4vLyBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkICggJGFwcC52aWV3ICk7XG5cblxuZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lciAoICdjb250ZXh0bWVudScsIGV2ZW50ID0+IHtcblx0ZXZlbnQucGF0aFsgMCBdID09PSAkYXBwLnJlbmRlcmVyLnZpZXcgJiYgZXZlbnQucHJldmVudERlZmF1bHQgKCk7IC8vIEZJWE1FOiBwcmVtZXQgZW5wZWNoZXIgcmlnaHQgY2xpY2sgZGFucyBlZGl0ZXVyICxtYWlzIGF1dG9yaXNlIGxlcyBodG1sXG59ICk7XG5cbi8vIGRpc2FibGUgbndqcyByaWdodCBjbGlja1xuZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lciAoICdrZXlkb3duTCcsICggZXZlbnQgKSA9PiB7XG5cdGlmICggZXZlbnQudGFyZ2V0LnR5cGUgKSB7XG5cdFx0cmV0dXJuXG5cdH1cblx0OyAvLyBzaSBkYW5zIHVuIGRpdiBpbnB1dCwgY2FuY2VsXG5cdGlmICggZXZlbnQua2V5Q29kZSA9PT0gMTE1ICkgeyAvLyBGNFxuXHRcdHJldHVybiAkYXBwLl9mdWxsU2NyZWVuICYmICRhcHAuY2FuY2VsRnVsbFNjcmVlbiAoKSB8fCAkYXBwLnJlcXVlc3RGdWxsU2NyZWVuICgpO1xuXHR9XG5cdDtcblx0aWYgKCBldmVudC5rZXlDb2RlID09PSAxMTYgKSB7IC8vIEY1IHJlZnJlc2hcblx0XHRkb2N1bWVudC5sb2NhdGlvbi5yZWxvYWQgKCB0cnVlICk7XG5cdH1cblx0O1xuXG5cdC8vVE9ETzogUkVNT1ZFIE1FICwgaXMgZm9yIGRlYnVnIHBpeGktcHJvamVjdGlvbnNcblx0Y29uc3QgZnBYID0gJGNhbWVyYS5fZnBYO1xuXHRjb25zdCBmcFkgPSAkY2FtZXJhLl9mcFk7XG5cdGNvbnN0IGZwZiA9ICRjYW1lcmEuX2ZwRjtcblxuXHRpZiAoIGV2ZW50LmtleUNvZGUgPT09IDM3ICkgeyAvLyBhcm93TGVmdFxuXHRcdGlmICggZXZlbnQuY3RybEtleSApIHtcblx0XHRcdGNvbnN0IHBvcyA9ICRjYW1lcmEuc2NlbmUucG9zaXRpb247XG5cdFx0XHRUd2VlbkxpdGUudG8gKCBwb3MsIDEsIHsgeTogcG9zLnggLSAyMCwgZWFzZTogUG93ZXI0LmVhc2VPdXQgfSApO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHQkY2FtZXJhLnBpdm90LnggLT0gMjA7XG5cdFx0fVxuXG5cdFx0Ly9Ud2VlbkxpdGUudG8oJGNhbWVyYSwgMSwgeyBfZnBYOiBmcFgtMTIwLCBlYXNlOiBQb3dlcjQuZWFzZU91dCB9KTtcblx0XHQvLyRjYW1lcmEudXBkYXRlRmFyUG9pbnRGcm9tVGFyZ2V0KGZwWC0xMjApO1xuXHR9XG5cdGlmICggZXZlbnQua2V5Q29kZSA9PT0gMzggKSB7IC8vIGFycm93VXBcblx0XHRpZiAoIGV2ZW50LmN0cmxLZXkgKSB7XG5cdFx0XHRjb25zdCBwb3MgPSAkY2FtZXJhLnNjZW5lLnBvc2l0aW9uO1xuXHRcdFx0VHdlZW5MaXRlLnRvICggcG9zLCAxLCB7IHk6IHBvcy55ICsgMjAsIGVhc2U6IFBvd2VyNC5lYXNlT3V0IH0gKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0JGNhbWVyYS5waXZvdC55IC09IDIwO1xuXHRcdH1cblx0XHQvL1R3ZWVuTGl0ZS50bygkY2FtZXJhLCAxLCB7IF9mcFk6IGZwWS0xMjAsIGVhc2U6IFBvd2VyNC5lYXNlT3V0IH0pO1xuXHRcdC8vJGNhbWVyYS51cGRhdGVGYXJQb2ludEZyb21UYXJnZXQobnVsbCxmcFktMTIwKTtcblx0fVxuXHRpZiAoIGV2ZW50LmtleUNvZGUgPT09IDM5ICkgeyAvLyBhcnJvd1JpZ2h0XG5cdFx0aWYgKCBldmVudC5jdHJsS2V5ICkge1xuXHRcdFx0Y29uc3QgcG9zID0gJGNhbWVyYS5zY2VuZS5wb3NpdGlvbjtcblx0XHRcdFR3ZWVuTGl0ZS50byAoIHBvcywgMSwgeyB5OiBwb3MueCArIDIwLCBlYXNlOiBQb3dlcjQuZWFzZU91dCB9ICk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdCRjYW1lcmEucGl2b3QueCArPSAyMDtcblx0XHR9XG5cdFx0Ly9Ud2VlbkxpdGUudG8oJGNhbWVyYSwgMSwgeyBfZnBYOiBmcFgrMTIwLCBlYXNlOiBQb3dlcjQuZWFzZU91dCB9KTtcblx0XHQvLyRjYW1lcmEudXBkYXRlRmFyUG9pbnRGcm9tVGFyZ2V0KGZwWCsxMjApO1xuXHR9XG5cdGlmICggZXZlbnQua2V5Q29kZSA9PT0gNDAgKSB7IC8vIGFycm93RG93blxuXHRcdGlmICggZXZlbnQuY3RybEtleSApIHtcblx0XHRcdGNvbnN0IHBvcyA9ICRjYW1lcmEuc2NlbmUucG9zaXRpb247XG5cdFx0XHRUd2VlbkxpdGUudG8gKCBwb3MsIDEsIHsgeTogcG9zLnkgLSAyMCwgZWFzZTogUG93ZXI0LmVhc2VPdXQgfSApO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHQkY2FtZXJhLnBpdm90LnkgKz0gMjA7XG5cdFx0fVxuXHRcdC8vVHdlZW5MaXRlLnRvKCRjYW1lcmEsIDEsIHsgX2ZwWTogZnBZKzEyMCwgZWFzZTogUG93ZXI0LmVhc2VPdXQgfSk7XG5cdFx0Ly8kY2FtZXJhLnVwZGF0ZUZhclBvaW50RnJvbVRhcmdldChudWxsLGZwWSsxMjApO1xuXHR9XG5cdGlmICggZXZlbnQua2V5Q29kZSA9PT0gMTA3ICkgeyAvLyBwYWQrXG5cdFx0Y29uc3QgYWNjID0gVHdlZW5MaXRlLmdldFR3ZWVuc09mICggJGNhbWVyYSApLmxlbmd0aDtcblx0XHRUd2VlbkxpdGUudG8gKCAkY2FtZXJhLCAxLCB7IF9mcEY6IGZwZiArIDAuMDIsIGVhc2U6IFBvd2VyNC5lYXNlT3V0IH0gKTtcblx0XHRldmVudC5jdHJsS2V5ICYmIFR3ZWVuTGl0ZS50byAoICRjYW1lcmEsIDEsIHsgX2ZwWTogZnBZIC0gMzAsIGVhc2U6IFBvd2VyNC5lYXNlT3V0IH0gKTtcblx0XHQvLyRjYW1lcmEudXBkYXRlRmFyUG9pbnRGcm9tVGFyZ2V0KG51bGwsbnVsbCxmcGYrMC4xKTtcblx0fVxuXHRpZiAoIGV2ZW50LmtleUNvZGUgPT09IDEwOSApIHsgLy8gcGFkLVxuXHRcdGNvbnN0IGFjYyA9IFR3ZWVuTGl0ZS5nZXRUd2VlbnNPZiAoICRjYW1lcmEgKS5sZW5ndGg7XG5cdFx0VHdlZW5MaXRlLnRvICggJGNhbWVyYSwgMSwgeyBfZnBGOiBmcGYgLSAwLjAxIC0gKCAwLjA0ICogYWNjICksIGVhc2U6IFBvd2VyNC5lYXNlT3V0IH0gKTtcblx0XHQvL1R3ZWVuTGl0ZS50bygkY2FtZXJhLCAwLjUsIHsgX2ZwZjogZnBmLTAuMSwgZWFzZTogUG93ZXI0LmVhc2VPdXQgfSk7XG5cdFx0Ly8kY2FtZXJhLnVwZGF0ZUZhclBvaW50RnJvbVRhcmdldChudWxsLG51bGwsZnBmLTAuMSk7XG5cdH1cblx0aWYgKCBldmVudC5rZXlDb2RlID09PSAxMDAgfHwgZXZlbnQua2V5Q29kZSA9PT0gMTAyICkgeyAvLyBudW1wYWQgNHx8NiAobG9jayB0aGUgWCBfZnBYKVxuXHRcdGV2ZW50LmtleUNvZGUgPT09IDEwMCAmJiBUd2VlbkxpdGUudG8gKCAkY2FtZXJhLCAwLjcsIHsgX2ZwWDogZnBYICsgMjUsIGVhc2U6IFBvd2VyNC5lYXNlT3V0IH0gKTtcblx0XHRldmVudC5rZXlDb2RlID09PSAxMDIgJiYgVHdlZW5MaXRlLnRvICggJGNhbWVyYSwgMC43LCB7IF9mcFg6IGZwWCAtIDI1LCBlYXNlOiBQb3dlcjQuZWFzZU91dCB9ICk7XG5cdFx0Ly8kY2FtZXJhLl9mcFhMb2NrID0gISRjYW1lcmEuX2ZwWExvY2s7XG5cdFx0Ly8kY2FtZXJhLnJlZHJhd0RlYnVnU2NyZWVuKCk7XG5cdH1cblx0aWYgKCBldmVudC5rZXlDb2RlID09PSAxMDQgfHwgZXZlbnQua2V5Q29kZSA9PT0gOTggKSB7IC8vIG51bXBhZCA4fHwyIChsb2NrIHRoZSBZIF9mcFkpXG5cdFx0ZXZlbnQua2V5Q29kZSA9PT0gMTA0ICYmIFR3ZWVuTGl0ZS50byAoICRjYW1lcmEsIDAuNywgeyBfZnBZOiBmcFkgKyAyNSwgZWFzZTogUG93ZXI0LmVhc2VPdXQgfSApO1xuXHRcdGV2ZW50LmtleUNvZGUgPT09IDk4ICYmIFR3ZWVuTGl0ZS50byAoICRjYW1lcmEsIDAuNywgeyBfZnBZOiBmcFkgLSAyNSwgZWFzZTogUG93ZXI0LmVhc2VPdXQgfSApO1xuXHR9XG5cdGlmICggZXZlbnQua2V5Q29kZSA9PT0gMTAxICkgeyAvLyBudW1wYWQgNSBjb3B5XG5cdFx0d2luZG93LnByb21wdCAoIFwiQ29weSB0aGlzIHRvICRjYW1lcmEuY2FtZXJhU2V0dXBcIixcblx0XHRcdGB7X2ZwWDokeyAkY2FtZXJhLl9mcFgudG9GaXhlZCAoIDIgKSB9LF9mcFk6JHsgJGNhbWVyYS5fZnBZLnRvRml4ZWQgKCAyICkgfSxfZnBGOiR7ICRjYW1lcmEuX2ZwRi50b0ZpeGVkICggMiApIH0sX3pvb206JHsgJGNhbWVyYS5fem9vbS50b0ZpeGVkICggMiApIH19YFxuXHRcdCk7XG5cdH1cbn0gKTtcbiIsIi8qXG4qIExlcyBzdGFnZSByZW5kIGxlcyBzY2VuZXNcbiovXG5jbGFzcyBfc3RhZ2UgZXh0ZW5kcyBQSVhJLmRpc3BsYXkuU3RhZ2Uge1xuXHRcblx0Y29uc3RydWN0b3IgKCkge1xuXHRcdHN1cGVyICgpO1xuXHRcdC8vIFRPRE86IFBFVVQgRVRSRSBNT0RJRklFUiBQT1VSIExFUyBGQUJSSUVSIEFVIEJPT1QsIGNsYXNzIGRpcmVjdCBbaHVkcyxzY3JlZW5NZXNhZ2UsbW91c2VdXG5cdFx0Ly8gdGhpcy5DQUdFX0dVSSA9IG5ldyBQSVhJLkNvbnRhaW5lciAoKTsgLy8gc2NyZWVuIG1lbnVlIGd1aSBodWRzXG5cdFx0Ly8gdGhpcy5DQUdFX01FU1NBR0UgPSBuZXcgUElYSS5Db250YWluZXIgKCk7IC8vIHNjcmVlbiBtZXNzYWdlXG5cdFx0Ly8gdGhpcy5DQUdFX01PVVNFID0gbmV3IFBJWEkuQ29udGFpbmVyICgpOyAvLyBzdG9yZSBtYXN0ZXIgbW91c2Ugc3ByaXRlIGFuZCBGWCwgdG91am91cnMgdG9wXG5cdFx0Ly8gdGhpcy5MSUdIVFMgPSB7IGFtYmllbnRMaWdodDoge30sIFBvaW50TGlnaHRfbW91c2U6IHt9IH07IC8vLCBkaXJlY3Rpb25hbExpZ2h0OiBuZXcgUElYSS5Db250YWluZXJEaXJlY3Rpb25hbExpZ2h0KCkgfTsgLy8gdGhlIGdsb2JhbCBjb25maWd1cmFibGUgb24gc2NlbmVDaGFuZ2Vcblx0fTtcblxuXHQvLyBjaGFuZ2Ugc2NlbmUgaW4gY2FtZXJhIHZpZXdQb3J0XG5cdHNldCBzY2VuZSAoIG5leHRTY2VuZSApIHtcblx0XHRpZiAoIHRoaXMuX3NjZW5lICkgeyAvLyBpbml0aWFsaXNlIGNhbWVyYSB3aXRoIG5ldyBzY2VuZVxuXHRcdFx0dGhpcy5zY2VuZS5vblN0b3AgKCk7XG5cdFx0XHQvL3RoaXMuc2NlbmUub25FbmQoKTtcblx0XHRcdC8vdGhpcy5zY2VuZS51bkxvYWQoKTsgLy8gcXVhbmQgb24gY2hhbmdlIGRlIHNjZW5lUGFja1xuXHRcdFx0dGhpcy5fc2NlbmUgPSBudWxsO1xuXHRcdH1cblx0XHRcblx0XHRpZiAoIG5leHRTY2VuZSApIHtcblx0XHRcdGRvY3VtZW50LnRpdGxlID0gZG9jdW1lbnQudGl0bGUgKyBgID0+WyR7IG5leHRTY2VuZS5jb25zdHJ1Y3Rvci5uYW1lIH1dIGA7XG5cdFx0XHR0aGlzLl9zY2VuZSA9IG5leHRTY2VuZTtcblx0XHRcdHRoaXMubmV4dFNjZW5lID0gbnVsbDtcblx0XHR9XG5cdFx0XG5cdH07XG5cblx0Z2V0IHNjZW5lICgpIHtcblx0XHRyZXR1cm4gdGhpcy5fc2NlbmUgfHwgZmFsc2Vcblx0fTtcblxuXHRpbml0aWFsaXplICgpIHtcblx0XHR0aGlzLmluaXRpYWxpemVfTGF5ZXJzICgpO1xuXHRcdHRoaXMuaW5pdGlhbGl6ZV9DYW1lcmEgKCk7XG5cdFx0dGhpcy5pbml0aWFsaXplX0xpZ2h0cyAoKTtcblx0XHQvLyB0aGlzLmdvdG8gKCAnU2NlbmVfQm9vdCcsIHt9ICk7XG5cdH07XG5cblx0aW5pdGlhbGl6ZV9DYW1lcmEgKCkge1xuXHRcdC8vIHRoaXMuYWRkQ2hpbGQgKCAkY2FtZXJhICk7IC8vIGNhbWVyYSBjYW4gaG9sZCBzY2VuZSB3aXRoIHByb2plY3Rpb25zXG5cdH07XG5cblx0aW5pdGlhbGl6ZV9MYXllcnMgKCkge1xuXHRcdC8vIHRoaXMuYWRkQ2hpbGQgKCB0aGlzLkNBR0VfR1VJLCB0aGlzLkNBR0VfTUVTU0FHRSwgdGhpcy5DQUdFX01PVVNFICk7XG5cdFx0Ly8gdGhpcy5DQUdFX01PVVNFLnBhcmVudEdyb3VwID0gJGRpc3BsYXlHcm91cC5ncm91cFsgNiBdO1xuXHRcdC8vIHRoaXMuQ0FHRV9NT1VTRS5wYXJlbnRMYXllciA9ICRkaXNwbGF5R3JvdXAubGF5ZXJzR3JvdXBbMF07IC8vRklYTUU6IEVYUEVSSU1FTlRBTFxuXHRcdC8vIHRoaXMuQ0FHRV9HVUkucGFyZW50R3JvdXAgPSAkZGlzcGxheUdyb3VwLmdyb3VwWyA0IF07XG5cdFx0Ly8gdGhpcy5hZGRDaGlsZCAoIC8vIGxpZ2h0cyBncm91cHNcblx0XHQvLyBcdCRkaXNwbGF5R3JvdXAuX3Nwcml0ZUJsYWNrX2QsXG5cdFx0Ly8gXHQkZGlzcGxheUdyb3VwLl9sYXllcl9kaWZmdXNlR3JvdXAsXG5cdFx0Ly8gXHQkZGlzcGxheUdyb3VwLl9sYXllcl9ub3JtYWxHcm91cCxcblx0XHQvLyBcdCRkaXNwbGF5R3JvdXAuX2xheWVyX2xpZ2h0R3JvdXAsXG5cdFx0Ly8gXHQuLi4kZGlzcGxheUdyb3VwLmxheWVyc0dyb3VwIC8vIGRpc3BsYXlHcm91cHNcblx0XHQvLyApO1xuXHR9O1xuXG5cdGluaXRpYWxpemVfTGlnaHRzICgpIHtcblx0XHQvLyB0aGlzLkxJR0hUUy5hbWJpZW50TGlnaHQgPSBuZXcgUElYSS5saWdodHMuQW1iaWVudExpZ2h0ICgpOy8vJG9ianMubmV3Q29udGFpbmVyX2xpZ2h0KCdBbWJpZW50TGlnaHQnICAgICk7XG5cdFx0Ly8gdGhpcy5MSUdIVFMuUG9pbnRMaWdodF9tb3VzZSA9IG5ldyBQSVhJLmxpZ2h0cy5Qb2ludExpZ2h0ICgpOy8vJG9ianMubmV3Q29udGFpbmVyX2xpZ2h0KCdQb2ludExpZ2h0JyAgICAgICk7XG5cdFx0Ly8gdGhpcy5MSUdIVFMuRGlyZWN0aW9uYWxMaWdodCA9IG5ldyBQSVhJLmxpZ2h0cy5EaXJlY3Rpb25hbExpZ2h0KCk7Ly8kb2Jqcy5uZXdDb250YWluZXJfbGlnaHQoJ0RpcmVjdGlvbmFsTGlnaHQnKTtcblx0XHQvLyB0aGlzLmFkZENoaWxkICggLi4uT2JqZWN0LnZhbHVlcyAoIHRoaXMuTElHSFRTICkgKTtcblx0fTtcblx0XG5cdC8vIHNlZSBodHRwOi8vcGl4aWpzLmRvd25sb2FkL2Rldi9kb2NzL1BJWEkucHJlcGFyZS5odG1sIGZvciBncHUgY2FjaGUgXG5cdGdvdG8gKCB0YXJnZXRTY2VuZU5hbWUsIG9wdGlvbnMgKSB7XG5cdFx0Ly8gY2hlY2sgaWYgbG9hZGVyS2l0IGFzaWduZWQgdG8gY2xhc3MgYXJlIGxvYWRlZCwgaWYgeWVzIGdldCB0aGUgc2NlbmUsIGlmIG5vICwgZ290byBsb2FkZXIgc2NlbmUgYW5kIGxvYWQgYWxsIGtpdCBhbmQgc2NlbmVcblx0XHR0aGlzLm5leHRTY2VuZSA9ICRMb2FkZXIuZ2V0TmV4dFNjZW5lICggdGFyZ2V0U2NlbmVOYW1lICk7IC8vfHwgJExvYWRlci5sb2FkU2NlbmVLaXQoc2NlbmVOYW1lKTsgLy8kTG9hZGVyLm5lZWRMb2FkZXJLaXQoc2NlbmVOYW1lKTtcblx0fTtcblx0XG5cdC8vIGdldCBzdGFnZSBzeXN0ZW0gaW5mb3JtYXRpb25zXG5cdGdldERhdGFWYWx1ZXMgKCkge1xuXHRcdGNvbnN0IGxpc3QgPSAkb2Jqcy5nZXRfbGlzdDsgLy8gZ2V0dGVyIE9iaiBmcm9tIGN1cnJlbnQgc2NlbmVcblx0XHQvLyBsaXN0ZXIgb2JqZXQgcGFyIGNvbnRhaW5lclR5cGVcblx0XHRjb25zdCB0b3RhbF9jb250YWluZXJUeXBlID0ge307XG5cdFx0T2JqZWN0LmtleXMgKCAkc3lzdGVtcy5jbGFzc1R5cGUuY29udGFpbmVycyApLmZvckVhY2ggKCBjdHlwZSA9PiB7XG5cdFx0XHR0b3RhbF9jb250YWluZXJUeXBlWyBjdHlwZSBdID0gbGlzdC5maWx0ZXIgKCAoIG8gKSA9PiB7XG5cdFx0XHRcdHJldHVybiBvLmRhdGFWYWx1ZXMuYi5jb250YWluZXJUeXBlID09PSBjdHlwZVxuXHRcdFx0fSApO1xuXHRcdH0gKTtcblx0XHRjb25zdCB0b3RhbF9kYXRhVHlwZSA9IHt9O1xuXHRcdE9iamVjdC5rZXlzICggJHN5c3RlbXMuY2xhc3NUeXBlLmRhdGFzICkuZm9yRWFjaCAoIGR0eXBlID0+IHtcblx0XHRcdHRvdGFsX2RhdGFUeXBlWyBkdHlwZSBdID0gbGlzdC5maWx0ZXIgKCAoIG8gKSA9PiB7XG5cdFx0XHRcdHJldHVybiBvLmRhdGFWYWx1ZXMuYi5kYXRhVHlwZSA9PT0gZHR5cGVcblx0XHRcdH0gKTtcblx0XHR9ICk7XG5cdFx0Y29uc3QgdG90YWxfc2hlZXRzID0ge307XG5cdFx0bGlzdC5mb3JFYWNoICggZGF0YU9iaiA9PiB7XG5cdFx0XHR0b3RhbF9zaGVldHNbIGRhdGFPYmouX2RhdGFCYXNlTmFtZSBdID0gZGF0YU9iai5kYXRhQmFzZTtcblx0XHR9ICk7XG5cdFx0aWYgKCB0aGlzLnNjZW5lLmJhY2tncm91bmQuZGF0YU9iai5fZGF0YUJhc2VOYW1lICkgeyAvLyBhbHNvIGFkZCBiZ1xuXHRcdFx0dG90YWxfc2hlZXRzWyB0aGlzLnNjZW5lLmJhY2tncm91bmQuZGF0YU9iai5fZGF0YUJhc2VOYW1lIF0gPSB0aGlzLnNjZW5lLmJhY2tncm91bmQuZGF0YU9iai5kYXRhQmFzZTtcblx0XHR9XG5cdFx0O1xuXHRcdGNvbnN0IG1lbW9yeVVzYWdlID0gKCAoKSA9PiB7XG5cdFx0XHRjb25zdCBtID0gcHJvY2Vzcy5tZW1vcnlVc2FnZSAoKTtcblx0XHRcdE9iamVjdC5rZXlzICggbSApLm1hcCAoICggaSApID0+IHtcblx0XHRcdFx0cmV0dXJuIG1bIGkgXSA9ICggbVsgaSBdIC8gMTAyNCAvIDEwMjQgKS50b0ZpeGVkICggMiApXG5cdFx0XHR9ICk7XG5cdFx0XHRyZXR1cm4gbTtcblx0XHR9ICkgKCk7XG5cdFx0cmV0dXJuIHtcblx0XHRcdG1lbW9yeVVzYWdlLFxuXHRcdFx0Y3VycmVudFNjZW5lOiB0aGlzLnNjZW5lLm5hbWUsXG5cdFx0XHRzYXZlUGF0aDogYGRhdGEvJHsgdGhpcy5zY2VuZS5uYW1lIH0uanNvbmAsXG5cdFx0XHR0b3RhbF9jb250YWluZXJUeXBlLFxuXHRcdFx0dG90YWxfZGF0YVR5cGUsXG5cdFx0XHR0b3RhbF9zaGVldHMsXG5cdFx0XHR0b3RhbE9ianM6IGxpc3QubGVuZ3RoLFxuXHRcdH07XG5cdH07XG59XG5cbndpbmRvdy5fc3RhZ2UgPSBfc3RhZ2U7XG4vLyBnbG9iYWwuJHN0YWdlID0gbmV3IF9zdGFnZSAoKTtcbi8vICRhcHAuc3RhZ2UgPSAkc3RhZ2U7XG4vLyBjb25zb2xlLmxvZzEgKCAnJHN0YWdlOiAnLCAkc3RhZ2UgKTtcbiIsIkNhbWVyYUNvbXBvbmVudCA9IHtcblx0cHJvcGVydGllczoge1xuXHRcdGJhY2tncm91bmRDb2xvcjogMHgwMDAwMDAsXG5cdFx0cmVuZGVyaW5nTGF5ZXJzOiBbXSxcblx0XHR6b29tOiAxLFxuXHRcdGRlcHRoOiAwLFxuXHRcdHJlbmRlclRleHR1cmU6IG51bGwsXG5cdFx0cmVuZGVyVGFyZ2V0OiBudWxsLFxuXHRcdHJlbmRlclNwcml0ZTogbnVsbCxcblx0XHRzY3JlZW5XOiAwLFxuXHRcdHNjcmVlbkg6IDAsXG5cdFx0d29ybGRXOiAwLFxuXHRcdHdvcmxkSDogMCxcblx0XHRjYW06IG5ldyBDYW1lcmEgKClcblx0fSxcblx0c2VyaWFsaXplOiB7XG5cdFx0c2tpcDogWyAnY2FtJywgJ3JlbmRlclRleHR1cmUnLCAncmVuZGVyVGFyZ2V0JywgJ3JlbmRlclNwcml0ZScgXVxuXHR9XG59O1xuXG4kZWNzLnJlZ2lzdGVyQ29tcG9uZW50ICggJ0NhbWVyYScsIENhbWVyYUNvbXBvbmVudCApO1xuIiwiRGVidWdNb3ZlQ29tcG9uZW50ID0ge1xuXHRwcm9wZXJ0aWVzOiB7XG5cdFx0c3BlZWRYOiAzLjAsXG5cdFx0c3BlZWRZOiAzLjBcblx0fVxufTtcblxuJGVjcy5yZWdpc3RlckNvbXBvbmVudCAoICdEZWJ1Z01vdmUnLCBEZWJ1Z01vdmVDb21wb25lbnQgKTtcbiIsIkNhbWVyYUZvbGxvd1RhcmdldENvbXBvbmVudCA9IHtcblx0cHJvcGVydGllczoge1xuXHRcdHNtb290aFRpbWVYOiAwLjUsXG5cdFx0c21vb3RoVGltZVk6IDAuNSxcblx0XHRvZmZzZXRYOiAwLFxuXHRcdG9mZnNldFk6IDAsXG5cdFx0dGFyZ2V0OiBudWxsLFx0Ly8gPEVudGl0eT5cblx0XHRzbW9vdGhYU3BlZWQ6IDAsXG5cdFx0c21vb3RoWVNwZWVkOiAwLFxuXHR9LFxuXHRzZXJpYWxpemU6IHtcblx0XHRza2lwOiBbICd0YXJnZXQnIF1cblx0fVxufTtcblxuJGVjcy5yZWdpc3RlckNvbXBvbmVudCAoICdDYW1lcmFGb2xsb3dUYXJnZXQnLCBDYW1lcmFGb2xsb3dUYXJnZXRDb21wb25lbnQgKTtcbiIsIi8vIG1vZHVsZS5leHBvcnRzID0ge1xyXG4vLyBcdEVDUzogcmVxdWlyZSAoICcuL2VjcycgKSxcclxuLy8gXHRTeXN0ZW06IHJlcXVpcmUgKCAnLi9zeXN0ZW0nICksXHJcbi8vIFx0Q29tcG9uZW50OiByZXF1aXJlICggJy4vY29tcG9uZW50JyApXHJcbi8vIH1cclxuXHJcbnJlcXVpcmUgKCAnLi90cmFuc2Zvcm0nICk7XHJcbnJlcXVpcmUgKCAnLi9jYW1lcmEnICk7XHJcbnJlcXVpcmUgKCAnLi9zcHJpdGUnICk7XHJcbnJlcXVpcmUgKCAnLi90aWxlbWFwJyApO1xyXG5yZXF1aXJlICggJy4vZGVidWdfbW92ZScgKTtcclxucmVxdWlyZSAoICcuL2ZvbGxvd190YXJnZXQnICk7XHJcblxyXG4kZWNzLnJlZ2lzdGVyQWxsRGVmaW5lZENvbXBvbmVudHMgPSBmdW5jdGlvbiAoKSB7XHJcblxyXG5cdGNvbnNvbGUubG9nICggJ2xvYWRpbmcgY29tcG9uZW50cyAuLi4nICk7XHJcblx0Zm9yICggY29uc3QgW2tleSwgdmFsdWVdIG9mIENvbXBvbmVudEV4cG9ydHMgKSB7XHJcblx0Ly8gZm9yICggY29uc3QgbmFtZSBvZiBPYmplY3Qua2V5cyAoIENvbXBvbmVudEV4cG9ydHMgKSApIHtcclxuXHRcdGNvbnNvbGUubG9nICggYHJlZ2lzdGVyaW5nICR7IGtleSB9YCApO1xyXG5cdFx0U2NlbmVNYW5hZ2VyLl9lY3MucmVnaXN0ZXJDb21wb25lbnQgKCBrZXksIHZhbHVlICk7XHJcblx0fVxyXG59O1xyXG4iLCJTcHJpdGVDb21wb25lbnQgPSB7XG5cdHByb3BlcnRpZXM6IHtcblx0XHRyZXM6ICcnLFxuXHRcdGZyYW1lOiBudWxsLFxuXHRcdHRpbnQ6IDB4MDAwMDAwLFxuXHRcdGxheWVyOiAnRGVmYXVsdCcsXG5cdFx0ekluZGV4OiAwLFxuXHRcdHpPcmRlcjogMCxcblx0XHRzcHJpdGU6IG51bGxcblx0fSxcblx0c2VyaWFsaXplOiB7XG5cdFx0c2tpcDogWyAnc3ByaXRlJyBdXG5cdH1cbn07XG5cbiRlY3MucmVnaXN0ZXJDb21wb25lbnQgKCAnU3ByaXRlJywgU3ByaXRlQ29tcG9uZW50ICk7XG4iLCJUaWxlbWFwQ29tcG9uZW50ID0ge1xuXHRwcm9wZXJ0aWVzOiB7XG5cdFx0cmVzOiAnJyxcdC8vIHBhdGggdG8gdG14XG5cdFx0dGludDogMHgwMDAwMDAsXG5cdFx0bGF5ZXI6ICdEZWZhdWx0Jyxcblx0XHR6SW5kZXg6IDAsXG5cdFx0ek9yZGVyOiAwLFxuXHRcdGlzUmVhZHk6IGZhbHNlLFxuXHRcdGlzTG9hZGluZzogZmFsc2UsXG5cdFx0dGlsZW1hcDogbnVsbFx0Ly8gUElYSS5leHRyYXMuVGlsZWRNYXBcblx0fSxcblx0c2VyaWFsaXplOiB7XG5cdFx0c2tpcDogWyAndGlsZW1hcCcgXVxuXHR9XG59O1xuXG4kZWNzLnJlZ2lzdGVyQ29tcG9uZW50ICggJ1RpbGVtYXAnLCBUaWxlbWFwQ29tcG9uZW50ICk7XG4iLCIvLyBjbGFzcyBUcmFuc2Zvcm1Db21wb25lbnQgZXh0ZW5kcyBCYXNlQ29tcG9uZW50IHtcclxuLy8gXHRsb2NhbFBvc2l0aW9uID0gZ2xNYXRyaXgudmVjMi5jcmVhdGUgKCk7XHJcbi8vIFx0cG9zaXRpb24gPSBnbE1hdHJpeC52ZWMyLmNyZWF0ZSAoKTtcclxuLy8gXHRyb3RhdGlvbiA9IDAuMDtcclxuLy8gfVxyXG5cclxuVHJhbnNmb3JtQ29tcG9uZW50ID0ge1xyXG5cdHByb3BlcnRpZXM6IHtcclxuXHRcdGxvY2FsUG9zaXRpb246IG51bGwsXHJcblx0XHRwb3NpdGlvbjogbnVsbCxcclxuXHRcdHJvdGF0aW9uOiAwLjAsXHJcblx0XHRwYXJlbnQ6IG51bGxcclxuXHR9XHJcbn07XHJcblxyXG4kZWNzLnJlZ2lzdGVyQ29tcG9uZW50ICggJ1RyYW5zZm9ybScsIFRyYW5zZm9ybUNvbXBvbmVudCApO1xyXG4iLCJjbGFzcyBEZWJ1Z01vdmVTeXN0ZW0gZXh0ZW5kcyBTeXN0ZW0ge1xuXG5cdGNvbnN0cnVjdG9yICggZWNzICkge1xuXHRcdHN1cGVyICggZWNzICk7XG5cdFx0XG5cdFx0dGhpcy5ob3Jpem9udGFsID0gMDtcblx0XHR0aGlzLnZlcnRpY2FsID0gMDtcblx0XHRcblx0XHRkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyICggJ2tleWRvd24nLCAoIGV2ZW50ICkgPT4ge1xuXHRcdFx0aWYgKCBldmVudC5rZXkgPT0gJ3cnICkge1xuXHRcdFx0XHR0aGlzLnZlcnRpY2FsID0gLTE7XG5cdFx0XHR9XG5cdFx0XHRpZiAoIGV2ZW50LmtleSA9PSAncycgKSB7XG5cdFx0XHRcdHRoaXMudmVydGljYWwgPSAxO1xuXHRcdFx0fVxuXHRcdFx0aWYgKCBldmVudC5rZXkgPT0gJ2EnICkge1xuXHRcdFx0XHR0aGlzLmhvcml6b250YWwgPSAtMTtcblx0XHRcdH1cblx0XHRcdGlmICggZXZlbnQua2V5ID09ICdkJyApIHtcblx0XHRcdFx0dGhpcy5ob3Jpem9udGFsID0gMTtcblx0XHRcdH1cblx0XHR9ICk7XG5cblx0XHRkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyICggJ2tleXVwJywgKCBldmVudCApID0+IHtcblx0XHRcdGlmICggZXZlbnQua2V5ID09ICd3JyApIHtcblx0XHRcdFx0dGhpcy52ZXJ0aWNhbCA9IDA7XG5cdFx0XHR9XG5cdFx0XHRpZiAoIGV2ZW50LmtleSA9PSAncycgKSB7XG5cdFx0XHRcdHRoaXMudmVydGljYWwgPSAwO1xuXHRcdFx0fVxuXHRcdFx0aWYgKCBldmVudC5rZXkgPT0gJ2EnICkge1xuXHRcdFx0XHR0aGlzLmhvcml6b250YWwgPSAwO1xuXHRcdFx0fVxuXHRcdFx0aWYgKCBldmVudC5rZXkgPT0gJ2QnICkge1xuXHRcdFx0XHR0aGlzLmhvcml6b250YWwgPSAwO1xuXHRcdFx0fVxuXHRcdH0gKTtcblx0fVxuXG5cdHVwZGF0ZSAoIHRpY2ssIGVudGl0aWVzICkge1xuXG5cdFx0Zm9yICggY29uc3QgZW50aXR5IG9mIGVudGl0aWVzICkge1xuXHRcdFx0aWYgKCB0aGlzLmhvcml6b250YWwgIT0gMCB8fCB0aGlzLnZlcnRpY2FsICE9IDAgKSB7XG5cdFx0XHRcdGxldCBwb3NpdGlvbiA9IGVudGl0eS5UcmFuc2Zvcm0ucG9zaXRpb247XG5cdFx0XHRcdGVudGl0eS5UcmFuc2Zvcm0ucG9zaXRpb24uc2V0ICggcG9zaXRpb24ueCArIGVudGl0eS5EZWJ1Z01vdmUuc3BlZWRYICogdGhpcy5ob3Jpem9udGFsICogJGFwcC5kZWx0YVRpbWUsIHBvc2l0aW9uLnkgKyBlbnRpdHkuRGVidWdNb3ZlLnNwZWVkWSAqIHRoaXMudmVydGljYWwgKiAkYXBwLmRlbHRhVGltZSApXG5cblx0XHRcdFx0Ly8gY29uc29sZS5sb2cxICggZW50aXR5LmlkLCAnRGVidWcgTW92ZTonLCBlbnRpdHkuVHJhbnNmb3JtLnBvc2l0aW9uLngsIGVudGl0eS5UcmFuc2Zvcm0ucG9zaXRpb24ueSApO1xuXHRcdFx0fVxuXHRcdH1cblx0fVxufVxuXG5EZWJ1Z01vdmVTeXN0ZW0ucXVlcnkgPSB7XG5cdGhhczogWyAnVHJhbnNmb3JtJywgJ0RlYnVnTW92ZScgXVxufTtcblxuZ2xvYmFsLkRlYnVnTW92ZVN5c3RlbSA9IERlYnVnTW92ZVN5c3RlbTtcbiIsImNsYXNzIENhbWVyYUZvbGxvd1RhcmdldFN5c3RlbSBleHRlbmRzIFN5c3RlbSB7XG5cblx0Y29uc3RydWN0b3IgKCBlY3MgKSB7XG5cdFx0c3VwZXIgKCBlY3MgKTtcblx0XHR0aGlzLnNwZWVkID0gMC4wO1xuXHR9XG5cblx0dXBkYXRlICggdGljaywgZW50aXRpZXMgKSB7XG5cblx0XHRmb3IgKCBjb25zdCBlbnRpdHkgb2YgZW50aXRpZXMgKSB7XG5cblx0XHRcdGlmICggIWVudGl0eS5DYW1lcmFGb2xsb3dUYXJnZXQudGFyZ2V0ICkge1xuXHRcdFx0XHRjb250aW51ZTtcblx0XHRcdH1cblxuXHRcdFx0bGV0IGNhbWVyYUNvbXBvbmVudCA9IGVudGl0eS5DYW1lcmE7XG5cdFx0XHRsZXQgZm9sbG93Q29tcG9uZW50ID0gZW50aXR5LkNhbWVyYUZvbGxvd1RhcmdldDtcblx0XHRcdGxldCB0YXJnZXRQb3NpdGlvbiA9IGZvbGxvd0NvbXBvbmVudC50YXJnZXQuVHJhbnNmb3JtLnBvc2l0aW9uO1xuXHRcdFx0bGV0IGNhbWVyYUNlbnRlciA9IGNhbWVyYUNvbXBvbmVudC5jYW0uY2VudGVyO1xuXHRcdFx0bGV0IHggPSAwO1xuXHRcdFx0bGV0IHkgPSAwO1xuXG5cdFx0XHR0aGlzLnNwZWVkID0gZm9sbG93Q29tcG9uZW50LnNtb290aFhTcGVlZDtcblx0XHRcdHggPSB0aGlzLmluZXJ0aWFsRGFtcCAoIGNhbWVyYUNlbnRlci54LCB0YXJnZXRQb3NpdGlvbi54ICsgZm9sbG93Q29tcG9uZW50Lm9mZnNldFgsIGZvbGxvd0NvbXBvbmVudC5zbW9vdGhUaW1lWCApO1xuXHRcdFx0Zm9sbG93Q29tcG9uZW50LnNtb290aFhTcGVlZCA9IHRoaXMuc3BlZWQ7XG5cblx0XHRcdHRoaXMuc3BlZWQgPSBmb2xsb3dDb21wb25lbnQuc21vb3RoWVNwZWVkO1xuXHRcdFx0eSA9IHRoaXMuaW5lcnRpYWxEYW1wICggY2FtZXJhQ2VudGVyLnksIHRhcmdldFBvc2l0aW9uLnkgKyBmb2xsb3dDb21wb25lbnQub2Zmc2V0WSwgZm9sbG93Q29tcG9uZW50LnNtb290aFRpbWVZICk7XG5cdFx0XHRmb2xsb3dDb21wb25lbnQuc21vb3RoWVNwZWVkID0gdGhpcy5zcGVlZDtcblx0XHRcdFxuXHRcdFx0Ly8gY29uc29sZS5sb2cyICggYHRhcmdldDogKCR7ZW50aXR5LlRyYW5zZm9ybS5wb3NpdGlvbi54fSwgJHtlbnRpdHkuVHJhbnNmb3JtLnBvc2l0aW9uLnl9KSAoJHtlbnRpdHkuRm9sbG93VGFyZ2V0LnRhcmdldC5UcmFuc2Zvcm0ucG9zaXRpb24ueH0sICR7ZW50aXR5LkZvbGxvd1RhcmdldC50YXJnZXQuVHJhbnNmb3JtLnBvc2l0aW9uLnl9KWAgKTtcblxuXHRcdFx0Y2FtZXJhQ29tcG9uZW50LmNhbS5tb3ZlQ2VudGVyICggeCwgeSApO1xuXHRcdFx0ZW50aXR5LlRyYW5zZm9ybS5wb3NpdGlvbi5zZXQgKCBjYW1lcmFDb21wb25lbnQuY2FtLnBvc2l0aW9uLngsIGNhbWVyYUNvbXBvbmVudC5jYW0ucG9zaXRpb24ueSApO1xuXHRcdH1cblx0fVxuXG5cdHNtb290aERhbXAgKCBwcmV2aW91c1ZhbHVlLCB0YXJnZXRWYWx1ZSwgc21vb3RoVGltZSApIHtcblx0XHRsZXQgVDEgPSAwLjM2ICogc21vb3RoVGltZTtcblx0XHRsZXQgVDIgPSAwLjY0ICogc21vb3RoVGltZTtcblx0XHRsZXQgeCA9IHByZXZpb3VzVmFsdWUgLSB0YXJnZXRWYWx1ZTtcblx0XHRsZXQgbmV3U3BlZWQgPSB0aGlzLnNwZWVkICsgJGFwcC5kZWx0YVRpbWUgKiAoIC0xIC8gKCBUMSAqIFQyICkgKiB4IC0gKCBUMSArIFQyICkgLyAoIFQxICogVDIgKSAqIHRoaXMuc3BlZWQgKTtcblx0XHRsZXQgbmV3VmFsdWUgPSB4ICsgJGFwcC5kZWx0YVRpbWUgKiB0aGlzLnNwZWVkO1xuXHRcdHRoaXMuc3BlZWQgPSBuZXdTcGVlZDtcblx0XHRyZXR1cm4gdGFyZ2V0VmFsdWUgKyBuZXdWYWx1ZTtcblx0fVxuXG5cdGluZXJ0aWFsRGFtcCAoIHByZXZpb3VzVmFsdWUsIHRhcmdldFZhbHVlLCBzbW9vdGhUaW1lICkge1xuXHRcdGxldCB4ID0gcHJldmlvdXNWYWx1ZSAtIHRhcmdldFZhbHVlO1xuXHRcdGxldCBuZXdWYWx1ZSA9IHggKyAkYXBwLmRlbHRhVGltZSAqICggLTEuMCAvIHNtb290aFRpbWUgKiB4ICk7XG5cdFx0cmV0dXJuIHRhcmdldFZhbHVlICsgbmV3VmFsdWU7XG5cdH1cbn1cblxuQ2FtZXJhRm9sbG93VGFyZ2V0U3lzdGVtLnF1ZXJ5ID0ge1xuXHRoYXM6IFsgJ1RyYW5zZm9ybScsICdDYW1lcmEnLCAnQ2FtZXJhRm9sbG93VGFyZ2V0JyBdXG59O1xuXG5nbG9iYWwuQ2FtZXJhRm9sbG93VGFyZ2V0U3lzdGVtID0gQ2FtZXJhRm9sbG93VGFyZ2V0U3lzdGVtO1xuIiwicmVxdWlyZSAoICcuL3JlbmRlcmluZ19zeXN0ZW0nICk7XG5yZXF1aXJlICggJy4vc3ByaXRlX3JlbmRlcmluZ19zeXN0ZW0nICk7XG5yZXF1aXJlICggJy4vdGlsZW1hcF9sb2FkX3N5c3RlbScgKTtcbnJlcXVpcmUgKCAnLi9kZWJ1Z19tb3ZlX3N5c3RlbScgKTtcbnJlcXVpcmUgKCAnLi9mb2xsb3dfdGFyZ2V0X3N5c3RlbScgKTtcbiIsImNsYXNzIFJlbmRlcmluZ1N5c3RlbSBleHRlbmRzIFN5c3RlbSB7XG5cblx0Y29uc3RydWN0b3IgKCBlY3MgKSB7XG5cdFx0c3VwZXIgKCBlY3MgKTtcblx0XHR0aGlzLmNhbWVyYUNvbXBvbmVudHMgPSBbXTtcblx0XHR0aGlzLnJlbmRlclNwcml0ZSA9IG5ldyBQSVhJLlNwcml0ZSAoKTtcblx0XHR0aGlzLnJlbmRlclNwcml0ZS5ibGVuZE1vZGUgPSBQSVhJLkJMRU5EX01PREVTLlNDUkVFTjtcblxuXHRcdC8vIGZvciAoIGNvbnN0IGxheWVyTmFtZSBvZiAkYXBwLnJlbmRlcmluZ0xheWVycy5rZXlzICgpICkge1xuXHRcdC8vIFx0aWYgKCAkYXBwLnJlbmRlcmluZ0xheWVycy5oYXMgKCBsYXllck5hbWUgKSAgKSB7XG5cdFx0Ly8gXHRcdGxldCBsYXllciA9ICRhcHAucmVuZGVyaW5nTGF5ZXJzLmdldCAoIGxheWVyTmFtZSApO1xuXHRcdC8vIFx0XHQkYXBwLnN0YWdlLmFkZENoaWxkICggbGF5ZXIgKTtcblx0XHQvLyBcdH1cblx0XHQvLyB9XG5cblx0XHQvLyBkZWJ1Z1xuXHRcdGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIgKCAna2V5ZG93bicsICggZXZlbnQgKSA9PiB7XG5cdFx0XHRpZiAoIGV2ZW50LmtleSA9PSAncCcgKSB7XG5cdFx0XHRcdGZvciAoIGNvbnN0IGNhbWVyYSBvZiB0aGlzLmNhbWVyYUNvbXBvbmVudHMgKSB7XG5cdFx0XHRcdFx0R3JhcGhpY3MuZHVtcFJlbmRlclRleHR1cmUgKCBjYW1lcmEucmVuZGVyVGV4dHVyZSApO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGNvbnNvbGUubG9nMCAoICdyZW5kZXJUZXh0dXJlIGR1bXBlZCEnICk7XG5cdFx0XHR9XG5cdFx0XHRpZiAoIGV2ZW50LmtleSA9PSAnbycgKSB7XG5cdFx0XHRcdGZvciAoIGNvbnN0IGNhbWVyYSBvZiB0aGlzLmNhbWVyYUNvbXBvbmVudHMgKSB7XG5cdFx0XHRcdFx0R3JhcGhpY3MuZHVtcFJlbmRlclRleHR1cmUgKCBjYW1lcmEucmVuZGVyU3ByaXRlICk7XG5cdFx0XHRcdH1cblx0XHRcdFx0Y29uc29sZS5sb2cwICggJ3JlbmRlclNwcml0ZSBkdW1wZWQhJyApO1xuXHRcdFx0fVxuXHRcdH0gKTtcblx0fVxuXG5cdHVwZGF0ZSAoIHRpY2ssIGVudGl0aWVzICkge1xuXG5cdFx0dGhpcy5jYW1lcmFDb21wb25lbnRzLnNwbGljZSAoIDAsIHRoaXMuY2FtZXJhQ29tcG9uZW50cy5sZW5ndGggKTtcblx0XHRcblx0XHRmb3IgKCBjb25zdCBlbnRpdHkgb2YgZW50aXRpZXMgKSB7XG5cdFx0XHR0aGlzLmNhbWVyYUNvbXBvbmVudHMucHVzaCAoIGVudGl0eS5DYW1lcmEgKTtcblx0XHR9XG5cblx0XHR0aGlzLmNhbWVyYUNvbXBvbmVudHMuc29ydCAoIHRoaXMuc29ydENhbWVyYURlcHRoICk7XG5cdFx0XG5cdFx0R3JhcGhpY3MudGlja1N0YXJ0ICgpO1xuXG5cdFx0Ly8gcmVuZGVyaW5nIGV2ZXJ5IGNhbWVyYSB2aWV3cG9ydCB0byByZW5kZXJ0ZXh0dXJlXG5cdFx0Zm9yICggY29uc3QgY2FtZXJhIG9mIHRoaXMuY2FtZXJhQ29tcG9uZW50cyApIHtcblxuXHRcdFx0aWYgKCBjYW1lcmEucmVuZGVyaW5nTGF5ZXJzLmxlbmd0aCA9PT0gMCApIHtcblx0XHRcdFx0Y29udGludWU7XG5cdFx0XHR9XG5cdFx0XHRcblx0XHRcdGlmICggY2FtZXJhLnJlbmRlclRleHR1cmUgPT0gbnVsbCApIHtcblx0XHRcdFx0Y2FtZXJhLnJlbmRlclRleHR1cmUgPSBQSVhJLlJlbmRlclRleHR1cmUuY3JlYXRlICggR3JhcGhpY3Mud2lkdGgsIEdyYXBoaWNzLmhlaWdodCwgUElYSS5TQ0FMRV9NT0RFUy5ORUFSRVNULCAxICk7XG5cdFx0XHR9XG5cblx0XHRcdGlmICggY2FtZXJhLnJlbmRlclRhcmdldCA9PSBudWxsICkge1xuXHRcdFx0XHRjYW1lcmEucmVuZGVyVGFyZ2V0ID0gbmV3IFBJWEkuUmVuZGVyVGFyZ2V0ICggR3JhcGhpY3MuX3JlbmRlcmVyLmdsLCBHcmFwaGljcy53aWR0aCwgR3JhcGhpY3MuaGVpZ2h0LCBQSVhJLlNDQUxFX01PREVTLk5FQVJFU1QgKTtcblx0XHRcdH1cblx0XHRcdFxuXHRcdFx0aWYgKCBjYW1lcmEucmVuZGVyU3ByaXRlID09IG51bGwgKSB7XG5cdFx0XHRcdGNhbWVyYS5yZW5kZXJTcHJpdGUgPSBuZXcgUElYSS5TcHJpdGUgKCk7XG5cdFx0XHRcdGNhbWVyYS5yZW5kZXJTcHJpdGUudGV4dHVyZSA9IGNhbWVyYS5yZW5kZXJUZXh0dXJlO1xuXHRcdFx0fVxuXHRcdFx0XG5cdFx0XHQvLyBpZiAoIGNhbWVyYS5jYW0uem9vbSAhPT0gY2FtZXJhLnpvb20gKSB7XG5cdFx0XHQvLyBcdGNhbWVyYS5jYW0uem9vbSA9IGNhbWVyYS56b29tO1xuXHRcdFx0Ly8gfVxuXHRcdFx0XG5cdFx0XHQvLyByZW1vdmUgYWxsXG5cdFx0XHQkYXBwLnN0YWdlLnJlbW92ZUNoaWxkcmVuICgpO1xuXG5cdFx0XHQvLyBhZGQgY3VycmVudCByZW5kZXIgY2FtZXJhXG5cdFx0XHQkYXBwLnN0YWdlLmFkZENoaWxkICggY2FtZXJhLmNhbSApO1xuXHRcdFx0XG5cdFx0XHQvLyBhZGQgY2FtZXJhIHJlbmRlcmluZyBsYXllclxuXHRcdFx0Zm9yICggY29uc3QgbGF5ZXJOYW1lIG9mIGNhbWVyYS5yZW5kZXJpbmdMYXllcnMgKSB7XG5cdFx0XHRcdGlmICggJGFwcC5yZW5kZXJpbmdMYXllcnMuaGFzICggbGF5ZXJOYW1lICkgICkge1xuXHRcdFx0XHRcdGxldCBsYXllciA9ICRhcHAucmVuZGVyaW5nTGF5ZXJzLmdldCAoIGxheWVyTmFtZSApO1xuXHRcdFx0XHRcdGlmICggbGF5ZXIudmlzaWJsZSApIHtcblx0XHRcdFx0XHRcdGNhbWVyYS5jYW0uYWRkQ2hpbGQgKCBsYXllciApO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0XG5cdFx0XHRpZiAoIGNhbWVyYS5jYW0uY2hpbGRyZW4ubGVuZ3RoID09PSAwICkge1xuXHRcdFx0XHRjb250aW51ZTtcblx0XHRcdH1cblxuXHRcdFx0Ly8gcmVuZGVyaW5nIHN0YWdlXG5cdFx0XHQvLyBHcmFwaGljcy5yZW5kZXIgKCAkYXBwLnN0YWdlICk7XG5cdFx0XHRHcmFwaGljcy5yZW5kZXIgKCAkYXBwLnN0YWdlLCBjYW1lcmEucmVuZGVyVGV4dHVyZSwgY2FtZXJhLnJlbmRlclRhcmdldCApO1xuXG5cdFx0XHQvLyByZW1vdmUgY2FtZXJhIGFsbCByZW5kZXJpbmcgbGF5ZXJcblx0XHRcdGNhbWVyYS5jYW0ucmVtb3ZlQ2hpbGRyZW4gKCk7XG5cdFx0fVxuXG5cdFx0Ly8gcmVuZGVyIGZpbmFsIHJlc3VsdFxuXHRcdHRoaXMucmVuZGVyU3ByaXRlLnJlbW92ZUNoaWxkcmVuICgpO1xuXHRcdGZvciAoIGNvbnN0IGNhbWVyYSBvZiB0aGlzLmNhbWVyYUNvbXBvbmVudHMgKSB7XG5cdFx0XHR0aGlzLnJlbmRlclNwcml0ZS5hZGRDaGlsZCAoIGNhbWVyYS5yZW5kZXJTcHJpdGUgKTtcblx0XHR9XG5cdFx0R3JhcGhpY3MuX3JlbmRlcmVyLnJlbmRlciAoIHRoaXMucmVuZGVyU3ByaXRlICk7XG5cdFx0Ly8gR3JhcGhpY3MuX3JlbmRlcmVyLmdsLmZsdXNoICgpO1xuXHRcdFxuXHRcdEdyYXBoaWNzLnRpY2tFbmQgKCk7XG5cdH1cblx0XG5cdHNvcnRDYW1lcmFEZXB0aCAoIGEsIGIgKSB7XG5cdFx0cmV0dXJuIGEuZGVwdGggLSBiLmRlcHRoO1xuXHR9XG59XG5cblJlbmRlcmluZ1N5c3RlbS5xdWVyeSA9IHtcblx0aGFzOiBbICdUcmFuc2Zvcm0nLCAnQ2FtZXJhJyBdXG59O1xuXG5nbG9iYWwuUmVuZGVyaW5nU3lzdGVtID0gUmVuZGVyaW5nU3lzdGVtO1xuIiwiY2xhc3MgU3ByaXRlUmVuZGVyaW5nU3lzdGVtIGV4dGVuZHMgU3lzdGVtIHtcblxuXHRjb25zdHJ1Y3RvciAoIGVjcyApIHtcblx0XHRzdXBlciAoIGVjcyApO1xuXHR9XG5cblx0dXBkYXRlICggdGljaywgZW50aXRpZXMgKSB7XG5cdFx0XG5cdFx0Zm9yICggY29uc3QgZW50aXR5IG9mIGVudGl0aWVzICkge1xuXHRcdFx0XG5cdFx0XHRpZiAoICFlbnRpdHkuU3ByaXRlLnNwcml0ZSApIHtcblx0XHRcdFx0bGV0IGZpbGVuYW1lID0gZW50aXR5LlNwcml0ZS5yZXMuc3Vic3RyaW5nICggZW50aXR5LlNwcml0ZS5yZXMubGFzdEluZGV4T2YgKCAnLycgKSArIDEsIGVudGl0eS5TcHJpdGUucmVzLmxlbmd0aCApO1xuXHRcdFx0XHRsZXQgZm9sZGVyID0gZW50aXR5LlNwcml0ZS5yZXMuY29udGFpbnMgKCAnLycgKSA/IGVudGl0eS5TcHJpdGUucmVzLnN1YnN0cmluZyAoIDAsIGVudGl0eS5TcHJpdGUucmVzLmxhc3RJbmRleE9mICggJy8nICkgKyAxICkgOiAnJztcblx0XHRcdFx0ZW50aXR5LlNwcml0ZS5zcHJpdGUgPSBuZXcgU3ByaXRlICgpO1xuXHRcdFx0XHRlbnRpdHkuU3ByaXRlLnNwcml0ZS5iaXRtYXAgPSBJbWFnZU1hbmFnZXIubG9hZEJpdG1hcCAoIGZvbGRlciwgZmlsZW5hbWUsIDAsIGZhbHNlICk7XG5cdFx0XHRcdGVudGl0eS5TcHJpdGUuc3ByaXRlLnNldEZyYW1lICggZW50aXR5LlNwcml0ZS5mcmFtZS54LCBlbnRpdHkuU3ByaXRlLmZyYW1lLnksIGVudGl0eS5TcHJpdGUuZnJhbWUud2lkdGgsIGVudGl0eS5TcHJpdGUuZnJhbWUuaGVpZ2h0ICk7XG5cdFx0XHRcdGlmICggJGFwcC5yZW5kZXJpbmdMYXllcnMuaGFzICggZW50aXR5LlNwcml0ZS5sYXllciApICkge1xuXHRcdFx0XHRcdCRhcHAucmVuZGVyaW5nTGF5ZXJzLmdldCAoIGVudGl0eS5TcHJpdGUubGF5ZXIgKS5hZGRDaGlsZCAoIGVudGl0eS5TcHJpdGUuc3ByaXRlICk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdFxuXHRcdFx0aWYgKCBlbnRpdHkuVHJhbnNmb3JtICYmIGVudGl0eS5TcHJpdGUuc3ByaXRlICkge1xuXHRcdFx0XHRlbnRpdHkuU3ByaXRlLnNwcml0ZS5wb3NpdGlvbi5zZXQgKCBlbnRpdHkuVHJhbnNmb3JtLnBvc2l0aW9uLngsIGVudGl0eS5UcmFuc2Zvcm0ucG9zaXRpb24ueSApO1xuXHRcdFx0XHQvLyBlbnRpdHkuU3ByaXRlLnNwcml0ZS54ID0gZW50aXR5LlRyYW5zZm9ybS5wb3NpdGlvbi54O1xuXHRcdFx0XHQvLyBlbnRpdHkuU3ByaXRlLnNwcml0ZS55ID0gZW50aXR5LlRyYW5zZm9ybS5wb3NpdGlvbi55O1xuXHRcdFx0XHRcblx0XHRcdFx0bGV0IGVuYWJsZVNvcnQgPSBmYWxzZTtcblx0XHRcdFx0aWYgKCBlbnRpdHkuU3ByaXRlLnNwcml0ZS56SW5kZXggIT09IGVudGl0eS5TcHJpdGUuekluZGV4ICkge1xuXHRcdFx0XHRcdGVudGl0eS5TcHJpdGUuc3ByaXRlLnpJbmRleCA9IGVudGl0eS5TcHJpdGUuekluZGV4O1xuXHRcdFx0XHRcdGVuYWJsZVNvcnQgPSB0cnVlO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGlmICggZW50aXR5LlNwcml0ZS5zcHJpdGUuek9yZGVyICE9PSBlbnRpdHkuU3ByaXRlLnpPcmRlciApIHtcblx0XHRcdFx0XHRlbnRpdHkuU3ByaXRlLnNwcml0ZS56T3JkZXIgPSBlbnRpdHkuU3ByaXRlLnpPcmRlcjtcblx0XHRcdFx0XHRlbmFibGVTb3J0ID0gdHJ1ZTtcblx0XHRcdFx0fVxuXHRcdFx0XHRcblx0XHRcdFx0aWYgKCBlbmFibGVTb3J0ICkge1xuXHRcdFx0XHRcdCRhcHAucmVuZGVyaW5nTGF5ZXJzLmdldCAoIGVudGl0eS5TcHJpdGUubGF5ZXIgKS5ncm91cC5lbmFibGVTb3J0ID0gZW5hYmxlU29ydDtcblx0XHRcdFx0fVxuXHRcdFx0XHRcblx0XHRcdFx0Ly8gR3JhcGhpY3MuX3JlbmRlcmVyLnJlbmRlciAoIGVudGl0eS5TcHJpdGUuc3ByaXRlICk7XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG59XG5cblNwcml0ZVJlbmRlcmluZ1N5c3RlbS5xdWVyeSA9IHtcblx0aGFzOiBbICdUcmFuc2Zvcm0nLCAnU3ByaXRlJyBdXG59O1xuXG5nbG9iYWwuU3ByaXRlUmVuZGVyaW5nU3lzdGVtID0gU3ByaXRlUmVuZGVyaW5nU3lzdGVtO1xuIiwiY2xhc3MgVGlsZW1hcExvYWRTeXN0ZW0gZXh0ZW5kcyBTeXN0ZW0ge1xuXG5cdGNvbnN0cnVjdG9yICggZWNzICkge1xuXHRcdHN1cGVyICggZWNzICk7XG5cdH1cblxuXHR1cGRhdGUgKCB0aWNrLCBlbnRpdGllcyApIHtcblxuXHRcdGZvciAoIGNvbnN0IGVudGl0eSBvZiBlbnRpdGllcyApIHtcblxuXHRcdFx0aWYgKCAhZW50aXR5LlRpbGVtYXAudGlsZW1hcCAmJiAhZW50aXR5LlRpbGVtYXAuaXNSZWFkeSAmJiAhZW50aXR5LlRpbGVtYXAuaXNMb2FkaW5nICkge1xuXHRcdFx0XHRsZXQgY29tcG9uZW50ID0gZW50aXR5LlRpbGVtYXA7XG5cdFx0XHRcdGxldCBmaWxlbmFtZSA9IGNvbXBvbmVudC5yZXMuc3Vic3RyaW5nICggY29tcG9uZW50LnJlcy5sYXN0SW5kZXhPZiAoICcvJyApICsgMSwgY29tcG9uZW50LnJlcy5sZW5ndGggKTtcblx0XHRcdFx0bGV0IGZvbGRlciA9IGNvbXBvbmVudC5yZXMuY29udGFpbnMgKCAnLycgKSA/IGNvbXBvbmVudC5yZXMuc3Vic3RyaW5nICggMCwgY29tcG9uZW50LnJlcy5sYXN0SW5kZXhPZiAoICcvJyApICsgMSApIDogJyc7XG5cblx0XHRcdFx0Ly8gVE9ETzogbW92ZSB0byBSZXNNYW5hZ2VyXG5cdFx0XHRcdFBJWEkubG9hZGVyXG5cdFx0XHRcdFx0LmFkZCAoIGNvbXBvbmVudC5yZXMgKVxuXHRcdFx0XHRcdC8vIC5lcnJvciAoICggZXJyLCBsb2FkZXIsIHJlc291cmNlICkgPT4ge1xuXHRcdFx0XHRcdC8vIFx0ZW50aXR5LlRpbGVtYXAuaXNMb2FkaW5nID0gZmFsc2U7XG5cdFx0XHRcdFx0Ly8gfSApXG5cdFx0XHRcdFx0LmxvYWQgKCAoKSA9PiB7XG5cdFx0XHRcdFx0XHQvKipcblx0XHRcdFx0XHRcdCAqICAgUElYSS5leHRyYXMuVGlsZWRNYXAoKSBpcyBhbiBleHRlbmRlZCBQSVhJLkNvbnRhaW5lcigpXG5cdFx0XHRcdFx0XHQgKiAgIHNvIHlvdSBjYW4gcmVuZGVyIGl0IHJpZ2h0IGF3YXlcblx0XHRcdFx0XHRcdCAqL1xuXHRcdFx0XHRcdFx0Y29tcG9uZW50LnRpbGVtYXAgPSBuZXcgUElYSS50aWxlbWFwLlRpbGVkTWFwICggY29tcG9uZW50LnJlcyApO1xuXHRcdFx0XHRcdFx0Y29tcG9uZW50LmlzUmVhZHkgPSB0cnVlO1xuXHRcdFx0XHRcdFx0Y29tcG9uZW50LmlzTG9hZGluZyA9IGZhbHNlO1xuXG5cdFx0XHRcdFx0XHRpZiAoICRhcHAucmVuZGVyaW5nTGF5ZXJzLmhhcyAoIGNvbXBvbmVudC5sYXllciApICkge1xuXHRcdFx0XHRcdFx0XHQkYXBwLnJlbmRlcmluZ0xheWVycy5nZXQgKCBjb21wb25lbnQubGF5ZXIgKS5hZGRDaGlsZCAoIGNvbXBvbmVudC50aWxlbWFwICk7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcblx0XHRcdFx0XHRcdGNvbnNvbGUubG9nMyAoICdUaWxlZE1hcDogJyArIGNvbXBvbmVudC5yZXMsICdsb2FkZWQhJyApO1xuXHRcdFx0XHRcdH0gKTtcblxuXHRcdFx0XHRjb21wb25lbnQuaXNMb2FkaW5nID0gdHJ1ZTtcblx0XHRcdH1cblxuXHRcdFx0aWYgKCBlbnRpdHkuVHJhbnNmb3JtICYmIGVudGl0eS5UaWxlbWFwLnRpbGVtYXAgKSB7XG5cdFx0XHRcdGVudGl0eS5UaWxlbWFwLnRpbGVtYXAucG9zaXRpb24uc2V0ICggZW50aXR5LlRyYW5zZm9ybS5wb3NpdGlvbi54LCBlbnRpdHkuVHJhbnNmb3JtLnBvc2l0aW9uLnkgKTtcblxuXHRcdFx0XHRsZXQgZW5hYmxlU29ydCA9IGZhbHNlO1xuXHRcdFx0XHRpZiAoIGVudGl0eS5UaWxlbWFwLnRpbGVtYXAuekluZGV4ICE9PSBlbnRpdHkuVGlsZW1hcC56SW5kZXggKSB7XG5cdFx0XHRcdFx0ZW50aXR5LlRpbGVtYXAudGlsZW1hcC56SW5kZXggPSBlbnRpdHkuVGlsZW1hcC56SW5kZXg7XG5cdFx0XHRcdFx0ZW5hYmxlU29ydCA9IHRydWU7XG5cdFx0XHRcdH1cblx0XHRcdFx0aWYgKCBlbnRpdHkuVGlsZW1hcC50aWxlbWFwLnpPcmRlciAhPT0gZW50aXR5LlRpbGVtYXAuek9yZGVyICkge1xuXHRcdFx0XHRcdGVudGl0eS5UaWxlbWFwLnRpbGVtYXAuek9yZGVyID0gZW50aXR5LlRpbGVtYXAuek9yZGVyO1xuXHRcdFx0XHRcdGVuYWJsZVNvcnQgPSB0cnVlO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0aWYgKCBlbmFibGVTb3J0ICkge1xuXHRcdFx0XHRcdCRhcHAucmVuZGVyaW5nTGF5ZXJzLmdldCAoIGVudGl0eS5UaWxlbWFwLmxheWVyICkuZ3JvdXAuZW5hYmxlU29ydCA9IGVuYWJsZVNvcnQ7XG5cdFx0XHRcdH1cblx0XHRcdFx0XG5cdFx0XHRcdC8vIEdyYXBoaWNzLl9yZW5kZXJlci5yZW5kZXIgKCBlbnRpdHkuVGlsZW1hcC50aWxlbWFwICk7XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG59XG5cblRpbGVtYXBMb2FkU3lzdGVtLnF1ZXJ5ID0ge1xuXHRoYXM6IFsgJ1RyYW5zZm9ybScsICdUaWxlbWFwJyBdXG59O1xuXG5nbG9iYWwuVGlsZW1hcExvYWRTeXN0ZW0gPSBUaWxlbWFwTG9hZFN5c3RlbTtcbiIsIi8vIHNoaW0gZm9yIHVzaW5nIHByb2Nlc3MgaW4gYnJvd3NlclxudmFyIHByb2Nlc3MgPSBtb2R1bGUuZXhwb3J0cyA9IHt9O1xuXG4vLyBjYWNoZWQgZnJvbSB3aGF0ZXZlciBnbG9iYWwgaXMgcHJlc2VudCBzbyB0aGF0IHRlc3QgcnVubmVycyB0aGF0IHN0dWIgaXRcbi8vIGRvbid0IGJyZWFrIHRoaW5ncy4gIEJ1dCB3ZSBuZWVkIHRvIHdyYXAgaXQgaW4gYSB0cnkgY2F0Y2ggaW4gY2FzZSBpdCBpc1xuLy8gd3JhcHBlZCBpbiBzdHJpY3QgbW9kZSBjb2RlIHdoaWNoIGRvZXNuJ3QgZGVmaW5lIGFueSBnbG9iYWxzLiAgSXQncyBpbnNpZGUgYVxuLy8gZnVuY3Rpb24gYmVjYXVzZSB0cnkvY2F0Y2hlcyBkZW9wdGltaXplIGluIGNlcnRhaW4gZW5naW5lcy5cblxudmFyIGNhY2hlZFNldFRpbWVvdXQ7XG52YXIgY2FjaGVkQ2xlYXJUaW1lb3V0O1xuXG5mdW5jdGlvbiBkZWZhdWx0U2V0VGltb3V0KCkge1xuICAgIHRocm93IG5ldyBFcnJvcignc2V0VGltZW91dCBoYXMgbm90IGJlZW4gZGVmaW5lZCcpO1xufVxuZnVuY3Rpb24gZGVmYXVsdENsZWFyVGltZW91dCAoKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdjbGVhclRpbWVvdXQgaGFzIG5vdCBiZWVuIGRlZmluZWQnKTtcbn1cbihmdW5jdGlvbiAoKSB7XG4gICAgdHJ5IHtcbiAgICAgICAgaWYgKHR5cGVvZiBzZXRUaW1lb3V0ID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICBjYWNoZWRTZXRUaW1lb3V0ID0gc2V0VGltZW91dDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNhY2hlZFNldFRpbWVvdXQgPSBkZWZhdWx0U2V0VGltb3V0O1xuICAgICAgICB9XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBjYWNoZWRTZXRUaW1lb3V0ID0gZGVmYXVsdFNldFRpbW91dDtcbiAgICB9XG4gICAgdHJ5IHtcbiAgICAgICAgaWYgKHR5cGVvZiBjbGVhclRpbWVvdXQgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgIGNhY2hlZENsZWFyVGltZW91dCA9IGNsZWFyVGltZW91dDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNhY2hlZENsZWFyVGltZW91dCA9IGRlZmF1bHRDbGVhclRpbWVvdXQ7XG4gICAgICAgIH1cbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIGNhY2hlZENsZWFyVGltZW91dCA9IGRlZmF1bHRDbGVhclRpbWVvdXQ7XG4gICAgfVxufSAoKSlcbmZ1bmN0aW9uIHJ1blRpbWVvdXQoZnVuKSB7XG4gICAgaWYgKGNhY2hlZFNldFRpbWVvdXQgPT09IHNldFRpbWVvdXQpIHtcbiAgICAgICAgLy9ub3JtYWwgZW52aXJvbWVudHMgaW4gc2FuZSBzaXR1YXRpb25zXG4gICAgICAgIHJldHVybiBzZXRUaW1lb3V0KGZ1biwgMCk7XG4gICAgfVxuICAgIC8vIGlmIHNldFRpbWVvdXQgd2Fzbid0IGF2YWlsYWJsZSBidXQgd2FzIGxhdHRlciBkZWZpbmVkXG4gICAgaWYgKChjYWNoZWRTZXRUaW1lb3V0ID09PSBkZWZhdWx0U2V0VGltb3V0IHx8ICFjYWNoZWRTZXRUaW1lb3V0KSAmJiBzZXRUaW1lb3V0KSB7XG4gICAgICAgIGNhY2hlZFNldFRpbWVvdXQgPSBzZXRUaW1lb3V0O1xuICAgICAgICByZXR1cm4gc2V0VGltZW91dChmdW4sIDApO1xuICAgIH1cbiAgICB0cnkge1xuICAgICAgICAvLyB3aGVuIHdoZW4gc29tZWJvZHkgaGFzIHNjcmV3ZWQgd2l0aCBzZXRUaW1lb3V0IGJ1dCBubyBJLkUuIG1hZGRuZXNzXG4gICAgICAgIHJldHVybiBjYWNoZWRTZXRUaW1lb3V0KGZ1biwgMCk7XG4gICAgfSBjYXRjaChlKXtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIC8vIFdoZW4gd2UgYXJlIGluIEkuRS4gYnV0IHRoZSBzY3JpcHQgaGFzIGJlZW4gZXZhbGVkIHNvIEkuRS4gZG9lc24ndCB0cnVzdCB0aGUgZ2xvYmFsIG9iamVjdCB3aGVuIGNhbGxlZCBub3JtYWxseVxuICAgICAgICAgICAgcmV0dXJuIGNhY2hlZFNldFRpbWVvdXQuY2FsbChudWxsLCBmdW4sIDApO1xuICAgICAgICB9IGNhdGNoKGUpe1xuICAgICAgICAgICAgLy8gc2FtZSBhcyBhYm92ZSBidXQgd2hlbiBpdCdzIGEgdmVyc2lvbiBvZiBJLkUuIHRoYXQgbXVzdCBoYXZlIHRoZSBnbG9iYWwgb2JqZWN0IGZvciAndGhpcycsIGhvcGZ1bGx5IG91ciBjb250ZXh0IGNvcnJlY3Qgb3RoZXJ3aXNlIGl0IHdpbGwgdGhyb3cgYSBnbG9iYWwgZXJyb3JcbiAgICAgICAgICAgIHJldHVybiBjYWNoZWRTZXRUaW1lb3V0LmNhbGwodGhpcywgZnVuLCAwKTtcbiAgICAgICAgfVxuICAgIH1cblxuXG59XG5mdW5jdGlvbiBydW5DbGVhclRpbWVvdXQobWFya2VyKSB7XG4gICAgaWYgKGNhY2hlZENsZWFyVGltZW91dCA9PT0gY2xlYXJUaW1lb3V0KSB7XG4gICAgICAgIC8vbm9ybWFsIGVudmlyb21lbnRzIGluIHNhbmUgc2l0dWF0aW9uc1xuICAgICAgICByZXR1cm4gY2xlYXJUaW1lb3V0KG1hcmtlcik7XG4gICAgfVxuICAgIC8vIGlmIGNsZWFyVGltZW91dCB3YXNuJ3QgYXZhaWxhYmxlIGJ1dCB3YXMgbGF0dGVyIGRlZmluZWRcbiAgICBpZiAoKGNhY2hlZENsZWFyVGltZW91dCA9PT0gZGVmYXVsdENsZWFyVGltZW91dCB8fCAhY2FjaGVkQ2xlYXJUaW1lb3V0KSAmJiBjbGVhclRpbWVvdXQpIHtcbiAgICAgICAgY2FjaGVkQ2xlYXJUaW1lb3V0ID0gY2xlYXJUaW1lb3V0O1xuICAgICAgICByZXR1cm4gY2xlYXJUaW1lb3V0KG1hcmtlcik7XG4gICAgfVxuICAgIHRyeSB7XG4gICAgICAgIC8vIHdoZW4gd2hlbiBzb21lYm9keSBoYXMgc2NyZXdlZCB3aXRoIHNldFRpbWVvdXQgYnV0IG5vIEkuRS4gbWFkZG5lc3NcbiAgICAgICAgcmV0dXJuIGNhY2hlZENsZWFyVGltZW91dChtYXJrZXIpO1xuICAgIH0gY2F0Y2ggKGUpe1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgLy8gV2hlbiB3ZSBhcmUgaW4gSS5FLiBidXQgdGhlIHNjcmlwdCBoYXMgYmVlbiBldmFsZWQgc28gSS5FLiBkb2Vzbid0ICB0cnVzdCB0aGUgZ2xvYmFsIG9iamVjdCB3aGVuIGNhbGxlZCBub3JtYWxseVxuICAgICAgICAgICAgcmV0dXJuIGNhY2hlZENsZWFyVGltZW91dC5jYWxsKG51bGwsIG1hcmtlcik7XG4gICAgICAgIH0gY2F0Y2ggKGUpe1xuICAgICAgICAgICAgLy8gc2FtZSBhcyBhYm92ZSBidXQgd2hlbiBpdCdzIGEgdmVyc2lvbiBvZiBJLkUuIHRoYXQgbXVzdCBoYXZlIHRoZSBnbG9iYWwgb2JqZWN0IGZvciAndGhpcycsIGhvcGZ1bGx5IG91ciBjb250ZXh0IGNvcnJlY3Qgb3RoZXJ3aXNlIGl0IHdpbGwgdGhyb3cgYSBnbG9iYWwgZXJyb3IuXG4gICAgICAgICAgICAvLyBTb21lIHZlcnNpb25zIG9mIEkuRS4gaGF2ZSBkaWZmZXJlbnQgcnVsZXMgZm9yIGNsZWFyVGltZW91dCB2cyBzZXRUaW1lb3V0XG4gICAgICAgICAgICByZXR1cm4gY2FjaGVkQ2xlYXJUaW1lb3V0LmNhbGwodGhpcywgbWFya2VyKTtcbiAgICAgICAgfVxuICAgIH1cblxuXG5cbn1cbnZhciBxdWV1ZSA9IFtdO1xudmFyIGRyYWluaW5nID0gZmFsc2U7XG52YXIgY3VycmVudFF1ZXVlO1xudmFyIHF1ZXVlSW5kZXggPSAtMTtcblxuZnVuY3Rpb24gY2xlYW5VcE5leHRUaWNrKCkge1xuICAgIGlmICghZHJhaW5pbmcgfHwgIWN1cnJlbnRRdWV1ZSkge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIGRyYWluaW5nID0gZmFsc2U7XG4gICAgaWYgKGN1cnJlbnRRdWV1ZS5sZW5ndGgpIHtcbiAgICAgICAgcXVldWUgPSBjdXJyZW50UXVldWUuY29uY2F0KHF1ZXVlKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICBxdWV1ZUluZGV4ID0gLTE7XG4gICAgfVxuICAgIGlmIChxdWV1ZS5sZW5ndGgpIHtcbiAgICAgICAgZHJhaW5RdWV1ZSgpO1xuICAgIH1cbn1cblxuZnVuY3Rpb24gZHJhaW5RdWV1ZSgpIHtcbiAgICBpZiAoZHJhaW5pbmcpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB2YXIgdGltZW91dCA9IHJ1blRpbWVvdXQoY2xlYW5VcE5leHRUaWNrKTtcbiAgICBkcmFpbmluZyA9IHRydWU7XG5cbiAgICB2YXIgbGVuID0gcXVldWUubGVuZ3RoO1xuICAgIHdoaWxlKGxlbikge1xuICAgICAgICBjdXJyZW50UXVldWUgPSBxdWV1ZTtcbiAgICAgICAgcXVldWUgPSBbXTtcbiAgICAgICAgd2hpbGUgKCsrcXVldWVJbmRleCA8IGxlbikge1xuICAgICAgICAgICAgaWYgKGN1cnJlbnRRdWV1ZSkge1xuICAgICAgICAgICAgICAgIGN1cnJlbnRRdWV1ZVtxdWV1ZUluZGV4XS5ydW4oKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBxdWV1ZUluZGV4ID0gLTE7XG4gICAgICAgIGxlbiA9IHF1ZXVlLmxlbmd0aDtcbiAgICB9XG4gICAgY3VycmVudFF1ZXVlID0gbnVsbDtcbiAgICBkcmFpbmluZyA9IGZhbHNlO1xuICAgIHJ1bkNsZWFyVGltZW91dCh0aW1lb3V0KTtcbn1cblxucHJvY2Vzcy5uZXh0VGljayA9IGZ1bmN0aW9uIChmdW4pIHtcbiAgICB2YXIgYXJncyA9IG5ldyBBcnJheShhcmd1bWVudHMubGVuZ3RoIC0gMSk7XG4gICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPiAxKSB7XG4gICAgICAgIGZvciAodmFyIGkgPSAxOyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBhcmdzW2kgLSAxXSA9IGFyZ3VtZW50c1tpXTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBxdWV1ZS5wdXNoKG5ldyBJdGVtKGZ1biwgYXJncykpO1xuICAgIGlmIChxdWV1ZS5sZW5ndGggPT09IDEgJiYgIWRyYWluaW5nKSB7XG4gICAgICAgIHJ1blRpbWVvdXQoZHJhaW5RdWV1ZSk7XG4gICAgfVxufTtcblxuLy8gdjggbGlrZXMgcHJlZGljdGlibGUgb2JqZWN0c1xuZnVuY3Rpb24gSXRlbShmdW4sIGFycmF5KSB7XG4gICAgdGhpcy5mdW4gPSBmdW47XG4gICAgdGhpcy5hcnJheSA9IGFycmF5O1xufVxuSXRlbS5wcm90b3R5cGUucnVuID0gZnVuY3Rpb24gKCkge1xuICAgIHRoaXMuZnVuLmFwcGx5KG51bGwsIHRoaXMuYXJyYXkpO1xufTtcbnByb2Nlc3MudGl0bGUgPSAnYnJvd3Nlcic7XG5wcm9jZXNzLmJyb3dzZXIgPSB0cnVlO1xucHJvY2Vzcy5lbnYgPSB7fTtcbnByb2Nlc3MuYXJndiA9IFtdO1xucHJvY2Vzcy52ZXJzaW9uID0gJyc7IC8vIGVtcHR5IHN0cmluZyB0byBhdm9pZCByZWdleHAgaXNzdWVzXG5wcm9jZXNzLnZlcnNpb25zID0ge307XG5cbmZ1bmN0aW9uIG5vb3AoKSB7fVxuXG5wcm9jZXNzLm9uID0gbm9vcDtcbnByb2Nlc3MuYWRkTGlzdGVuZXIgPSBub29wO1xucHJvY2Vzcy5vbmNlID0gbm9vcDtcbnByb2Nlc3Mub2ZmID0gbm9vcDtcbnByb2Nlc3MucmVtb3ZlTGlzdGVuZXIgPSBub29wO1xucHJvY2Vzcy5yZW1vdmVBbGxMaXN0ZW5lcnMgPSBub29wO1xucHJvY2Vzcy5lbWl0ID0gbm9vcDtcbnByb2Nlc3MucHJlcGVuZExpc3RlbmVyID0gbm9vcDtcbnByb2Nlc3MucHJlcGVuZE9uY2VMaXN0ZW5lciA9IG5vb3A7XG5cbnByb2Nlc3MubGlzdGVuZXJzID0gZnVuY3Rpb24gKG5hbWUpIHsgcmV0dXJuIFtdIH1cblxucHJvY2Vzcy5iaW5kaW5nID0gZnVuY3Rpb24gKG5hbWUpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3Byb2Nlc3MuYmluZGluZyBpcyBub3Qgc3VwcG9ydGVkJyk7XG59O1xuXG5wcm9jZXNzLmN3ZCA9IGZ1bmN0aW9uICgpIHsgcmV0dXJuICcvJyB9O1xucHJvY2Vzcy5jaGRpciA9IGZ1bmN0aW9uIChkaXIpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3Byb2Nlc3MuY2hkaXIgaXMgbm90IHN1cHBvcnRlZCcpO1xufTtcbnByb2Nlc3MudW1hc2sgPSBmdW5jdGlvbigpIHsgcmV0dXJuIDA7IH07XG4iXX0=
