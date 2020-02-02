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
				res: 'maps/map001.tmx',
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
						component.tilemap = new PIXI.extras.TiledMap ( component.res );
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3Vzci9sb2NhbC9saWIvbm9kZV9tb2R1bGVzL3dhdGNoaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJqcy9hcHAuanMiLCJqcy9jb3JlL3N0YWdlLmpzIiwianMvZWNzL2NvbXBvbmVudHMvY2FtZXJhLmpzIiwianMvZWNzL2NvbXBvbmVudHMvZGVidWdfbW92ZS5qcyIsImpzL2Vjcy9jb21wb25lbnRzL2ZvbGxvd190YXJnZXQuanMiLCJqcy9lY3MvY29tcG9uZW50cy9pbmRleC5qcyIsImpzL2Vjcy9jb21wb25lbnRzL3Nwcml0ZS5qcyIsImpzL2Vjcy9jb21wb25lbnRzL3RpbGVtYXAuanMiLCJqcy9lY3MvY29tcG9uZW50cy90cmFuc2Zvcm0uanMiLCJqcy9lY3Mvc3lzdGVtcy9kZWJ1Z19tb3ZlX3N5c3RlbS5qcyIsImpzL2Vjcy9zeXN0ZW1zL2ZvbGxvd190YXJnZXRfc3lzdGVtLmpzIiwianMvZWNzL3N5c3RlbXMvaW5kZXguanMiLCJqcy9lY3Mvc3lzdGVtcy9yZW5kZXJpbmdfc3lzdGVtLmpzIiwianMvZWNzL3N5c3RlbXMvc3ByaXRlX3JlbmRlcmluZ19zeXN0ZW0uanMiLCJqcy9lY3Mvc3lzdGVtcy90aWxlbWFwX2xvYWRfc3lzdGVtLmpzIiwiLi4vLi4vLi4vLi4vLi4vdXNyL2xvY2FsL2xpYi9ub2RlX21vZHVsZXMvd2F0Y2hpZnkvbm9kZV9tb2R1bGVzL3Byb2Nlc3MvYnJvd3Nlci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7O0FDbGJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDeEhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDUkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUNoQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7O0FDekRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQzNEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQ0xBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7OztBQ3JIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7QUNuREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDcEVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbigpe2Z1bmN0aW9uIHIoZSxuLHQpe2Z1bmN0aW9uIG8oaSxmKXtpZighbltpXSl7aWYoIWVbaV0pe3ZhciBjPVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmU7aWYoIWYmJmMpcmV0dXJuIGMoaSwhMCk7aWYodSlyZXR1cm4gdShpLCEwKTt2YXIgYT1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK2krXCInXCIpO3Rocm93IGEuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixhfXZhciBwPW5baV09e2V4cG9ydHM6e319O2VbaV1bMF0uY2FsbChwLmV4cG9ydHMsZnVuY3Rpb24ocil7dmFyIG49ZVtpXVsxXVtyXTtyZXR1cm4gbyhufHxyKX0scCxwLmV4cG9ydHMscixlLG4sdCl9cmV0dXJuIG5baV0uZXhwb3J0c31mb3IodmFyIHU9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZSxpPTA7aTx0Lmxlbmd0aDtpKyspbyh0W2ldKTtyZXR1cm4gb31yZXR1cm4gcn0pKCkiLCJQSVhJLnNldHRpbmdzLlBSRUNJU0lPTl9GUkFHTUVOVCA9IFBJWEkuUFJFQ0lTSU9OLkhJR0g7XG5cbmNsYXNzIF9hcHAge1xuXG5cdGdldCByZW5kZXJlciAoKSB7XG5cdFx0cmV0dXJuIEdyYXBoaWNzLl9yZW5kZXJlcjtcblx0fVxuXG5cdGdldCB2aWV3ICgpIHtcblx0XHRyZXR1cm4gR3JhcGhpY3MuX3JlbmRlcmVyLnZpZXc7XG5cdH1cblxuXHRnZXQgc2NyZWVuICgpIHtcblx0XHRyZXR1cm4gR3JhcGhpY3MuX3JlbmRlcmVyLnNjcmVlbjtcblx0fVxuXG5cdGdldCByZW5kZXJpbmdMYXllcnMgKCkge1xuXHRcdHJldHVybiB0aGlzLl9yZW5kZXJpbmdMYXllcnM7XG5cdH1cblxuXHRjb25zdHJ1Y3RvciAoKSB7XG5cdFx0Ly8gc3VwZXIgKCB7XG5cdFx0Ly8gXHR3aWR0aDogODAwLFxuXHRcdC8vIFx0aGVpZ2h0OiA2MDAsXG5cdFx0Ly8gXHRhbnRpYWxpYXM6IHRydWUsXG5cdFx0Ly8gXHR0cmFuc3BhcmVudDogZmFsc2UsXG5cdFx0Ly8gXHRyZXNvbHV0aW9uOiAyLFxuXHRcdC8vIFx0c2hhcmVkVGlja2VyOiB0cnVlLFxuXHRcdC8vIFx0YmFja2dyb3VuZENvbG9yOiAweDMwMzAzMFxuXHRcdC8vIFx0Ly8gcG93ZXJQcmVmZXJlbmNlOiBTTEkmQ3Jvc3NGaXJlIEdQVSwgVE9ETzogc3R1ZHkgbWVcblx0XHQvLyB9ICk7XG5cblx0XHRHcmFwaGljcy5pbml0aWFsaXplICggODE2LCA2MjQsICd3ZWJnbCcgKTtcblx0XHRHcmFwaGljcy5zaG93RnBzICgpO1xuXHRcdC8vIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQgKCB0aGlzLnJlbmRlcmVyLnZpZXcgKTtcblxuXHRcdHRoaXMubndqcyA9IHRoaXMuaXNOd2pzICgpICYmIHRoaXMuaW5pdE53anMgKCk7XG5cdFx0Ly90aGlzLm53anMud2luLnNob3dEZXZUb29scygpIC8vYXV0by1zdGFydCBkZXZUb29sIGNocm9taXVtXG5cblx0XHQvLyBSZW5kZXJpbmcgTGF5ZXJzXG5cdFx0Ly8gVE9ETzog5LuO6YWN572u5paH5Lu25Lit5Yqg6L29TGF5ZXJcblx0XHR0aGlzLl9yZW5kZXJpbmdMYXllcnMgPSBuZXcgTWFwICgpO1xuXHRcdHRoaXMuX3JlbmRlcmluZ0xheWVycy5zZXQgKCAnRGVmYXVsdCcsIG5ldyBQSVhJLmRpc3BsYXkuTGF5ZXIgKCkgKTtcblx0XHR0aGlzLl9yZW5kZXJpbmdMYXllcnMuc2V0ICggJ01hcCcsIG5ldyBQSVhJLmRpc3BsYXkuTGF5ZXIgKCkgKTtcblx0XHR0aGlzLl9yZW5kZXJpbmdMYXllcnMuc2V0ICggJ0dVSScsIG5ldyBQSVhJLmRpc3BsYXkuTGF5ZXIgKCkgKTtcblx0XHRcblx0XHQvLyBkb2N1bWVudC5ib2R5Lm9ucmVzaXplID0gKCkgPT4ge1xuXHRcdC8vIFx0dGhpcy5zY2FsZVRvV2luZG93ICgpXG5cdFx0Ly8gfTtcblxuXHRcdHdpbmRvdy5hZGRFdmVudExpc3RlbmVyICggJ2Vycm9yJywgdGhpcy5vbkVycm9yLmJpbmQgKCB0aGlzICkgKTtcblx0fTtcblxuXHQvLyBCb290IEFwcFxuXHRydW4gKCkge1xuXHRcdHRyeSB7XG5cblx0XHRcdHRoaXMuc3RhZ2UgPSBuZXcgX3N0YWdlICgpO1xuXHRcdFx0dGhpcy5zdGFnZS5pbml0aWFsaXplICgpO1xuXG5cdFx0XHR0aGlzLmluaXRpYWxpemVfRUNTICgpO1xuXHRcdFx0dGhpcy50ZXN0ICgpO1xuXG5cdFx0XHR0aGlzLnRpY2tlciA9IFBJWEkudGlja2VyLnNoYXJlZC5hZGQgKCB0aGlzLnVwZGF0ZSwgdGhpcyApO1xuXG5cdFx0fSBjYXRjaCAoIGUgKSB7XG5cdFx0XHR0aHJvdyBjb25zb2xlLmVycm9yICggZS5zdGFjayApO1xuXHRcdH1cblx0fTtcblxuXHRpbml0aWFsaXplX0VDUyAoKSB7XG5cblx0XHR0aGlzLmVjcyA9IG5ldyBFQ1MgKCk7XG5cdFx0d2luZG93LiRlY3MgPSB0aGlzLmVjcztcblxuXHRcdHJlcXVpcmUgKCAnLi9lY3Mvc3lzdGVtcy9pbmRleCcgKTtcblx0XHRyZXF1aXJlICggJy4vZWNzL2NvbXBvbmVudHMvaW5kZXgnICk7XG5cblx0XHR0aGlzLmVjcy5hZGRTeXN0ZW0gKCBFQ1MuR1JPVVBfQWN0aW9uLCBuZXcgU3ByaXRlUmVuZGVyaW5nU3lzdGVtICggdGhpcy5lY3MgKSApO1xuXHRcdHRoaXMuZWNzLmFkZFN5c3RlbSAoIEVDUy5HUk9VUF9BY3Rpb24sIG5ldyBUaWxlbWFwTG9hZFN5c3RlbSAoIHRoaXMuZWNzICkgKTtcblx0XHR0aGlzLmVjcy5hZGRTeXN0ZW0gKCBFQ1MuR1JPVVBfQWN0aW9uLCBuZXcgQ2FtZXJhRm9sbG93VGFyZ2V0U3lzdGVtICggdGhpcy5lY3MgKSApO1xuXHRcdHRoaXMuZWNzLmFkZFN5c3RlbSAoIEVDUy5HUk9VUF9BY3Rpb24sIG5ldyBEZWJ1Z01vdmVTeXN0ZW0gKCB0aGlzLmVjcyApICk7XG5cdFx0dGhpcy5lY3MuYWRkU3lzdGVtICggRUNTLkdST1VQX1JlbmRlciwgbmV3IFJlbmRlcmluZ1N5c3RlbSAoIHRoaXMuZWNzICkgKTtcblxuXHRcdC8vIFRlc3Rcblx0XHRsZXQgY2FtZXJhID0gJGVjcy5jcmVhdGVFbnRpdHkgKCB7XG5cdFx0XHRpZDogJ01haW4gQ2FtZXJhJyxcblx0XHRcdFRyYW5zZm9ybToge1xuXHRcdFx0XHRwb3NpdGlvbjogbmV3IFBJWEkuUG9pbnQgKCksXG5cdFx0XHRcdGxvY2FsUG9zaXRpb246IG5ldyBQSVhJLlBvaW50ICgpLFxuXHRcdFx0fSxcblx0XHRcdENhbWVyYToge1xuXHRcdFx0XHRyZW5kZXJpbmdMYXllcnM6IFsgJ01hcCcsICdEZWZhdWx0JyBdLFxuXHRcdFx0XHR6b29tOiAxLFxuXHRcdFx0XHRkZXB0aDogMFxuXHRcdFx0fSxcblx0XHRcdC8vIERlYnVnTW92ZToge1xuXHRcdFx0Ly8gXHRzcGVlZFg6IC0xMjAuMCxcblx0XHRcdC8vIFx0c3BlZWRZOiAtMTIwLjAsXG5cdFx0XHQvLyB9XG5cdFx0fSApO1xuXG5cdFx0Ly8gbGV0IGNhbWVyYV8yID0gJGVjcy5jcmVhdGVFbnRpdHkgKCB7XG5cdFx0Ly8gXHRpZDogJ1VJIENhbWVyYScsXG5cdFx0Ly8gXHRUcmFuc2Zvcm06IHtcblx0XHQvLyBcdFx0cG9zaXRpb246IG5ldyBQSVhJLlBvaW50ICgpLFxuXHRcdC8vIFx0XHRsb2NhbFBvc2l0aW9uOiBuZXcgUElYSS5Qb2ludCAoKSxcblx0XHQvLyBcdH0sXG5cdFx0Ly8gXHRDYW1lcmE6IHtcblx0XHQvLyBcdFx0cmVuZGVyaW5nTGF5ZXJzOiBbICdHVUknIF0sXG5cdFx0Ly8gXHRcdGRlcHRoOiAxXG5cdFx0Ly8gXHR9XG5cdFx0Ly8gfSApO1xuXG5cdFx0bGV0IHNwcml0ZU9iaiA9ICRlY3MuY3JlYXRlRW50aXR5ICgge1xuXHRcdFx0aWQ6ICdTcHJpdGUgT2JqZWN0Jyxcblx0XHRcdFRyYW5zZm9ybToge1xuXHRcdFx0XHRwb3NpdGlvbjogbmV3IFBJWEkuUG9pbnQgKCksXG5cdFx0XHRcdGxvY2FsUG9zaXRpb246IG5ldyBQSVhJLlBvaW50ICgpLFxuXHRcdFx0fSxcblx0XHRcdFNwcml0ZToge1xuXHRcdFx0XHRyZXM6ICdpbWcvZmFjZXMvQWN0b3IxJyxcblx0XHRcdFx0ZnJhbWU6IG5ldyBQSVhJLlJlY3RhbmdsZSAoIDAsIDAsIDE0NCwgMTQ0ICksXG5cdFx0XHRcdGxheWVyOiAnRGVmYXVsdCcsXG5cdFx0XHRcdHpJbmRleDogMSxcblx0XHRcdFx0ek9yZGVyOiAwLFxuXHRcdFx0fSxcblx0XHRcdC8vIERlYnVnTW92ZToge1xuXHRcdFx0Ly8gXHRzcGVlZFg6IDEwMC4wLFxuXHRcdFx0Ly8gXHRzcGVlZFk6IDEwMC4wLFxuXHRcdFx0Ly8gfVxuXHRcdH0gKTtcblxuXHRcdGxldCBzcHJpdGVPYmpfMiA9ICRlY3MuY3JlYXRlRW50aXR5ICgge1xuXHRcdFx0aWQ6ICdTcHJpdGUgT2JqZWN0IDInLFxuXHRcdFx0VHJhbnNmb3JtOiB7XG5cdFx0XHRcdHBvc2l0aW9uOiBuZXcgUElYSS5Qb2ludCAoIDU1MCwgNTUwICksXG5cdFx0XHRcdGxvY2FsUG9zaXRpb246IG5ldyBQSVhJLlBvaW50ICgpLFxuXHRcdFx0fSxcblx0XHRcdFNwcml0ZToge1xuXHRcdFx0XHRyZXM6ICdpbWcvZmFjZXMvQWN0b3IxJyxcblx0XHRcdFx0ZnJhbWU6IG5ldyBQSVhJLlJlY3RhbmdsZSAoIDAsIDE0NCwgMTQ0LCAxNDQgKSxcblx0XHRcdFx0bGF5ZXI6ICdEZWZhdWx0Jyxcblx0XHRcdFx0ekluZGV4OiAxLFxuXHRcdFx0XHR6T3JkZXI6IC0xLFxuXHRcdFx0fSxcblx0XHRcdERlYnVnTW92ZToge1xuXHRcdFx0XHRzcGVlZFg6IDIwMC4wLFxuXHRcdFx0XHRzcGVlZFk6IDIwMC4wLFxuXHRcdFx0fVxuXHRcdH0gKTtcblxuXHRcdGxldCB0aWxlbWFwID0gJGVjcy5jcmVhdGVFbnRpdHkgKCB7XG5cdFx0XHRpZDogJ01hcCcsXG5cdFx0XHRUcmFuc2Zvcm06IHtcblx0XHRcdFx0cG9zaXRpb246IG5ldyBQSVhJLlBvaW50ICgpLFxuXHRcdFx0XHRsb2NhbFBvc2l0aW9uOiBuZXcgUElYSS5Qb2ludCAoKSxcblx0XHRcdH0sXG5cdFx0XHRUaWxlbWFwOiB7XG5cdFx0XHRcdHJlczogJ21hcHMvbWFwMDAxLnRteCcsXG5cdFx0XHRcdGxheWVyOiAnRGVmYXVsdCcsXG5cdFx0XHRcdHpJbmRleDogMCxcblx0XHRcdFx0ek9yZGVyOiAwLFxuXHRcdFx0fVxuXHRcdH0gKTtcblxuXHRcdGNhbWVyYS5hZGRDb21wb25lbnQgKCdDYW1lcmFGb2xsb3dUYXJnZXQnLCB7XG5cdFx0XHRzbW9vdGhUaW1lWDogMC4xNSxcblx0XHRcdHNtb290aFRpbWVZOiAwLjE1LFxuXHRcdFx0Ly8gb2Zmc2V0WDogR3JhcGhpY3Mud2lkdGggLyAyLFxuXHRcdFx0Ly8gb2Zmc2V0WTogR3JhcGhpY3MuaGVpZ2h0IC8gMixcblx0XHRcdHRhcmdldDogc3ByaXRlT2JqXzIsXG5cdFx0fSApO1xuXHR9XG5cblx0dGVzdCAoKSB7XG5cdFx0XG5cdH1cblxuXHR1cGRhdGUgKCBkZWx0YSApIHtcblx0XHQvLyB0cnkge1xuXHRcdC8vXHRcblx0XHQvLyB9IGNhdGNoICggZSApIHtcblx0XHQvLyBcdC8vICRhcHAubndqcy53aW4uc2hvd0RldlRvb2xzICgpO1xuXHRcdC8vIFx0dGhyb3cgY29uc29sZS5lcnJvciAoIGUubWVzc2FnZSArIFwiXFxuXCIgKyBlLnN0YWNrICk7XG5cdFx0Ly8gfVxuXG5cdFx0Ly8gaWYgKCB0aGlzLm5leHRTY2VuZSApIHtcblx0XHQvLyBcdHRoaXMuc2NlbmUgPSB0aGlzLm5leHRTY2VuZTtcblx0XHQvLyB9IGVsc2UgaWYgKCB0aGlzLnNjZW5lLl9zdGFydGVkICkge1xuXHRcdC8vIFx0dGhpcy5zY2VuZS51cGRhdGUgKCBkZWx0YSApO1xuXHRcdC8vIFx0JG1vdXNlLnVwZGF0ZSAoKTsgLy8gRklYTUU6IG1ldHRyZSBkYW5zIHNjZW5lIHVkcGF0ZSA/IHBlcm1ldHJhIGV0cmUgY29udHJvbGVyIHBhciBsZXMgZXZlbnQgZGUgc2NlbmUgP1xuXHRcdC8vIH0gZWxzZSBpZiAoIHRoaXMuc2NlbmUgJiYgIXRoaXMuc2NlbmUuX3N0YXJ0ZWQgKSB7XG5cdFx0Ly8gXHR0aGlzLnNjZW5lLnN0YXJ0ICgpO1xuXHRcdC8vIH1cblxuXHRcdHRoaXMuZGVsdGFUaW1lID0gZGVsdGEgLyAxMDAuMDtcblxuXHRcdHRoaXMuZWNzLnRpY2sgKCk7XG5cdFx0dGhpcy5lY3MucnVuU3lzdGVtR3JvdXAgKCBFQ1MuR1JPVVBfSW5wdXQgKTtcblx0XHR0aGlzLmVjcy5ydW5TeXN0ZW1Hcm91cCAoIEVDUy5HUk9VUF9BY3Rpb24gKTtcblx0XHR0aGlzLmVjcy5ydW5TeXN0ZW1Hcm91cCAoIEVDUy5HUk9VUF9SZW5kZXIgKTtcblx0fTtcblxuXHRpc053anMgKCkge1xuXHRcdHJldHVybiB0eXBlb2YgcmVxdWlyZSA9PT0gJ2Z1bmN0aW9uJyAmJiB0eXBlb2YgcHJvY2VzcyA9PT0gJ29iamVjdCc7XG5cdH07XG5cblx0aW5pdE53anMgKCkge1xuXHRcdC8vIGxldCBkdyA9IDgwMCAtIHdpbmRvdy5pbm5lcldpZHRoO1xuXHRcdC8vIGxldCBkaCA9IDYwMCAtIHdpbmRvdy5pbm5lckhlaWdodDtcblx0XHQvLyBsZXQgZ3VpID0gcmVxdWlyZSAoICdudy5ndWknICk7XG5cdFx0Ly8gbGV0IHdpbiA9IGd1aS5XaW5kb3cuZ2V0ICgpO1xuXHRcdC8vIHdpbi5mb2N1cyAoKTtcblx0XHQvLyB3aW5kb3cubW92ZUJ5ICggLWR3IC8gMiwgLWRoIC8gMiApO1xuXHRcdC8vIHdpbmRvdy5yZXNpemVCeSAoIGR3LCBkaCApO1xuXHRcdC8vIGlmICggcHJvY2Vzcy5wbGF0Zm9ybSA9PT0gJ2RhcndpbicgJiYgIXdpbi5tZW51ICkge1xuXHRcdC8vIFx0dmFyIG1lbnViYXIgPSBuZXcgZ3VpLk1lbnUgKCB7IHR5cGU6ICdtZW51YmFyJyB9ICk7XG5cdFx0Ly8gXHR2YXIgb3B0aW9uID0geyBoaWRlRWRpdDogdHJ1ZSwgaGlkZVdpbmRvdzogdHJ1ZSB9O1xuXHRcdC8vIFx0bWVudWJhci5jcmVhdGVNYWNCdWlsdGluICggJ0dhbWUnLCBvcHRpb24gKTtcblx0XHQvLyBcdHdpbi5tZW51ID0gbWVudWJhcjtcblx0XHQvLyB9XG5cdFx0Ly8gcmV0dXJuIHsgZ3VpLCB3aW4gfTtcblx0fTtcblxuXHRyZXF1ZXN0RnVsbFNjcmVlbiAoKSB7XG5cdFx0dmFyIGVsZW1lbnQgPSBkb2N1bWVudC5ib2R5O1xuXHRcdGlmICggZWxlbWVudC5yZXF1ZXN0RnVsbFNjcmVlbiApIHtcblx0XHRcdGVsZW1lbnQucmVxdWVzdEZ1bGxTY3JlZW4gKCk7XG5cdFx0fSBlbHNlIGlmICggZWxlbWVudC5tb3pSZXF1ZXN0RnVsbFNjcmVlbiApIHtcblx0XHRcdGVsZW1lbnQubW96UmVxdWVzdEZ1bGxTY3JlZW4gKCk7XG5cdFx0fSBlbHNlIGlmICggZWxlbWVudC53ZWJraXRSZXF1ZXN0RnVsbFNjcmVlbiApIHtcblx0XHRcdGVsZW1lbnQud2Via2l0UmVxdWVzdEZ1bGxTY3JlZW4gKCBFbGVtZW50LkFMTE9XX0tFWUJPQVJEX0lOUFVUICk7XG5cdFx0fSBlbHNlIGlmICggZWxlbWVudC5tc1JlcXVlc3RGdWxsc2NyZWVuICkge1xuXHRcdFx0ZWxlbWVudC5tc1JlcXVlc3RGdWxsc2NyZWVuICgpO1xuXHRcdH1cblx0XHR0aGlzLl9mdWxsU2NyZWVuID0gdHJ1ZTtcblx0fTtcblxuXHRjYW5jZWxGdWxsU2NyZWVuICgpIHtcblx0XHRpZiAoIGRvY3VtZW50LmNhbmNlbEZ1bGxTY3JlZW4gKSB7XG5cdFx0XHRkb2N1bWVudC5jYW5jZWxGdWxsU2NyZWVuICgpO1xuXHRcdH0gZWxzZSBpZiAoIGRvY3VtZW50Lm1vekNhbmNlbEZ1bGxTY3JlZW4gKSB7XG5cdFx0XHRkb2N1bWVudC5tb3pDYW5jZWxGdWxsU2NyZWVuICgpO1xuXHRcdH0gZWxzZSBpZiAoIGRvY3VtZW50LndlYmtpdENhbmNlbEZ1bGxTY3JlZW4gKSB7XG5cdFx0XHRkb2N1bWVudC53ZWJraXRDYW5jZWxGdWxsU2NyZWVuICgpO1xuXHRcdH0gZWxzZSBpZiAoIGRvY3VtZW50Lm1zRXhpdEZ1bGxzY3JlZW4gKSB7XG5cdFx0XHRkb2N1bWVudC5tc0V4aXRGdWxsc2NyZWVuICgpO1xuXHRcdH1cblx0XHR0aGlzLl9mdWxsU2NyZWVuID0gZmFsc2U7XG5cdH07XG5cblx0c2NhbGVUb1dpbmRvdyAoKSB7XG5cdFx0Y29uc3QgY2FudmFzID0gdGhpcy52aWV3O1xuXHRcdGxldCBzY2FsZVgsIHNjYWxlWSwgc2NhbGUsIGNlbnRlcjtcblx0XHRzY2FsZVggPSB3aW5kb3cuaW5uZXJXaWR0aCAvIGNhbnZhcy5vZmZzZXRXaWR0aDtcblx0XHRzY2FsZVkgPSB3aW5kb3cuaW5uZXJIZWlnaHQgLyBjYW52YXMub2Zmc2V0SGVpZ2h0O1xuXHRcdHNjYWxlID0gTWF0aC5taW4gKCBzY2FsZVgsIHNjYWxlWSApO1xuXHRcdGNhbnZhcy5zdHlsZS50cmFuc2Zvcm1PcmlnaW4gPSBcIjAgMFwiO1xuXHRcdGNhbnZhcy5zdHlsZS50cmFuc2Zvcm0gPSBcInNjYWxlKFwiICsgc2NhbGUgKyBcIilcIjtcblx0XHRpZiAoIGNhbnZhcy5vZmZzZXRXaWR0aCA+IGNhbnZhcy5vZmZzZXRIZWlnaHQgKSB7XG5cdFx0XHRpZiAoIGNhbnZhcy5vZmZzZXRXaWR0aCAqIHNjYWxlIDwgd2luZG93LmlubmVyV2lkdGggKSB7XG5cdFx0XHRcdGNlbnRlciA9IFwiaG9yaXpvbnRhbGx5XCJcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdGNlbnRlciA9IFwidmVydGljYWxseVwiXG5cdFx0XHR9XG5cblx0XHR9IGVsc2Uge1xuXHRcdFx0aWYgKCBjYW52YXMub2Zmc2V0SGVpZ2h0ICogc2NhbGUgPCB3aW5kb3cuaW5uZXJIZWlnaHQgKSB7XG5cdFx0XHRcdGNlbnRlciA9IFwidmVydGljYWxseVwiXG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRjZW50ZXIgPSBcImhvcml6b250YWxseVwiO1xuXHRcdFx0fVxuXG5cdFx0fVxuXG5cdFx0bGV0IG1hcmdpbjtcblx0XHRpZiAoIGNlbnRlciA9PT0gXCJob3Jpem9udGFsbHlcIiApIHtcblx0XHRcdG1hcmdpbiA9ICggd2luZG93LmlubmVyV2lkdGggLSBjYW52YXMub2Zmc2V0V2lkdGggKiBzY2FsZSApIC8gMjtcblx0XHRcdGNhbnZhcy5zdHlsZS5tYXJnaW5Ub3AgPSAwICsgXCJweFwiO1xuXHRcdFx0Y2FudmFzLnN0eWxlLm1hcmdpbkJvdHRvbSA9IDAgKyBcInB4XCI7XG5cdFx0XHRjYW52YXMuc3R5bGUubWFyZ2luTGVmdCA9IG1hcmdpbiArIFwicHhcIjtcblx0XHRcdGNhbnZhcy5zdHlsZS5tYXJnaW5SaWdodCA9IG1hcmdpbiArIFwicHhcIjtcblx0XHR9XG5cblx0XHRpZiAoIGNlbnRlciA9PT0gXCJ2ZXJ0aWNhbGx5XCIgKSB7XG5cdFx0XHRtYXJnaW4gPSAoIHdpbmRvdy5pbm5lckhlaWdodCAtIGNhbnZhcy5vZmZzZXRIZWlnaHQgKiBzY2FsZSApIC8gMjtcblx0XHRcdGNhbnZhcy5zdHlsZS5tYXJnaW5Ub3AgPSBtYXJnaW4gKyBcInB4XCI7XG5cdFx0XHRjYW52YXMuc3R5bGUubWFyZ2luQm90dG9tID0gbWFyZ2luICsgXCJweFwiO1xuXHRcdFx0Y2FudmFzLnN0eWxlLm1hcmdpbkxlZnQgPSAwICsgXCJweFwiO1xuXHRcdFx0Y2FudmFzLnN0eWxlLm1hcmdpblJpZ2h0ID0gMCArIFwicHhcIjtcblx0XHR9XG5cblx0XHRjYW52YXMuc3R5bGUucGFkZGluZ0xlZnQgPSAwICsgXCJweFwiO1xuXHRcdGNhbnZhcy5zdHlsZS5wYWRkaW5nUmlnaHQgPSAwICsgXCJweFwiO1xuXHRcdGNhbnZhcy5zdHlsZS5wYWRkaW5nVG9wID0gMCArIFwicHhcIjtcblx0XHRjYW52YXMuc3R5bGUucGFkZGluZ0JvdHRvbSA9IDAgKyBcInB4XCI7XG5cdFx0Y2FudmFzLnN0eWxlLmRpc3BsYXkgPSBcIi13ZWJraXQtaW5saW5lLWJveFwiO1xuXHRcdHJldHVybiBzY2FsZTtcblx0fTtcblxuXHQvLyBHZXQgYSByYXRpbyBmb3IgcmVzaXplIGluIGEgYm91bmRzXG5cdGdldFJhdGlvICggb2JqLCB3LCBoICkge1xuXHRcdGxldCByID0gTWF0aC5taW4gKCB3IC8gb2JqLndpZHRoLCBoIC8gb2JqLmhlaWdodCApO1xuXHRcdHJldHVybiByO1xuXHR9O1xuXG5cdGhpdENoZWNrICggYSwgYiApIHsgLy8gY29saXNpb25cblx0XHR2YXIgYWIgPSBhLl9ib3VuZHNSZWN0O1xuXHRcdHZhciBiYiA9IGIuX2JvdW5kc1JlY3Q7XG5cdFx0cmV0dXJuIGFiLnggKyBhYi53aWR0aCA+IGJiLnggJiYgYWIueCA8IGJiLnggKyBiYi53aWR0aCAmJiBhYi55ICsgYWIuaGVpZ2h0ID4gYmIueSAmJiBhYi55IDwgYmIueSArIGJiLmhlaWdodDtcblx0fTtcblxuXHRvbkVycm9yICggZSApIHtcblx0XHRjb25zb2xlLmVycm9yICggZS5tZXNzYWdlICk7XG5cdFx0Y29uc29sZS5lcnJvciAoIGUuZmlsZW5hbWUsIGUubGluZW5vICk7XG5cdFx0dHJ5IHtcblx0XHRcdC8vIHRoaXMuc3RvcCgpO1xuXHRcdFx0R3JhcGhpY3MucHJpbnRFcnJvciAoICdFcnJvcicsIGUubWVzc2FnZSApO1xuXHRcdFx0R3JhcGhpY3MucHJpbnRFcnJvciAoICdTdGFja1RyYWNlJywgZS5maWxlbmFtZSApO1xuXHRcdFx0Ly8gQXVkaW9NYW5hZ2VyLnN0b3BBbGwoKTtcblx0XHR9IGNhdGNoICggZTIgKSB7XG5cdFx0fVxuXHR9O1xuXG59IC8vRU5EIENMQVNTXG5cbnJlcXVpcmUgKCAnLi9jb3JlL3N0YWdlJyApO1xuXG4kYXBwID0gbmV3IF9hcHAgKCk7IC8vIG5ldyBQSVhJLkFwcGxpY2F0aW9uXG5cbmlmICggJGFwcC5pc053anMgKCkgKSB7XG5cdHdpbmRvdy5nbG9iYWwgPSB3aW5kb3c7XG59XG5cbi8vIGdsb2JhbC4kYXBwID0gJGFwcDtcblxuLy9BZGQgdGhlIGNhbnZhcyB0aGF0IFBpeGkgYXV0b21hdGljYWxseSBjcmVhdGVkIGZvciB5b3UgdG8gdGhlIEhUTUwgZG9jdW1lbnRcbi8vIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQgKCAkYXBwLnZpZXcgKTtcblxuXG5kb2N1bWVudC5hZGRFdmVudExpc3RlbmVyICggJ2NvbnRleHRtZW51JywgZXZlbnQgPT4ge1xuXHRldmVudC5wYXRoWyAwIF0gPT09ICRhcHAucmVuZGVyZXIudmlldyAmJiBldmVudC5wcmV2ZW50RGVmYXVsdCAoKTsgLy8gRklYTUU6IHByZW1ldCBlbnBlY2hlciByaWdodCBjbGljayBkYW5zIGVkaXRldXIgLG1haXMgYXV0b3Jpc2UgbGVzIGh0bWxcbn0gKTtcblxuLy8gZGlzYWJsZSBud2pzIHJpZ2h0IGNsaWNrXG5kb2N1bWVudC5hZGRFdmVudExpc3RlbmVyICggJ2tleWRvd25MJywgKCBldmVudCApID0+IHtcblx0aWYgKCBldmVudC50YXJnZXQudHlwZSApIHtcblx0XHRyZXR1cm5cblx0fVxuXHQ7IC8vIHNpIGRhbnMgdW4gZGl2IGlucHV0LCBjYW5jZWxcblx0aWYgKCBldmVudC5rZXlDb2RlID09PSAxMTUgKSB7IC8vIEY0XG5cdFx0cmV0dXJuICRhcHAuX2Z1bGxTY3JlZW4gJiYgJGFwcC5jYW5jZWxGdWxsU2NyZWVuICgpIHx8ICRhcHAucmVxdWVzdEZ1bGxTY3JlZW4gKCk7XG5cdH1cblx0O1xuXHRpZiAoIGV2ZW50LmtleUNvZGUgPT09IDExNiApIHsgLy8gRjUgcmVmcmVzaFxuXHRcdGRvY3VtZW50LmxvY2F0aW9uLnJlbG9hZCAoIHRydWUgKTtcblx0fVxuXHQ7XG5cblx0Ly9UT0RPOiBSRU1PVkUgTUUgLCBpcyBmb3IgZGVidWcgcGl4aS1wcm9qZWN0aW9uc1xuXHRjb25zdCBmcFggPSAkY2FtZXJhLl9mcFg7XG5cdGNvbnN0IGZwWSA9ICRjYW1lcmEuX2ZwWTtcblx0Y29uc3QgZnBmID0gJGNhbWVyYS5fZnBGO1xuXG5cdGlmICggZXZlbnQua2V5Q29kZSA9PT0gMzcgKSB7IC8vIGFyb3dMZWZ0XG5cdFx0aWYgKCBldmVudC5jdHJsS2V5ICkge1xuXHRcdFx0Y29uc3QgcG9zID0gJGNhbWVyYS5zY2VuZS5wb3NpdGlvbjtcblx0XHRcdFR3ZWVuTGl0ZS50byAoIHBvcywgMSwgeyB5OiBwb3MueCAtIDIwLCBlYXNlOiBQb3dlcjQuZWFzZU91dCB9ICk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdCRjYW1lcmEucGl2b3QueCAtPSAyMDtcblx0XHR9XG5cblx0XHQvL1R3ZWVuTGl0ZS50bygkY2FtZXJhLCAxLCB7IF9mcFg6IGZwWC0xMjAsIGVhc2U6IFBvd2VyNC5lYXNlT3V0IH0pO1xuXHRcdC8vJGNhbWVyYS51cGRhdGVGYXJQb2ludEZyb21UYXJnZXQoZnBYLTEyMCk7XG5cdH1cblx0aWYgKCBldmVudC5rZXlDb2RlID09PSAzOCApIHsgLy8gYXJyb3dVcFxuXHRcdGlmICggZXZlbnQuY3RybEtleSApIHtcblx0XHRcdGNvbnN0IHBvcyA9ICRjYW1lcmEuc2NlbmUucG9zaXRpb247XG5cdFx0XHRUd2VlbkxpdGUudG8gKCBwb3MsIDEsIHsgeTogcG9zLnkgKyAyMCwgZWFzZTogUG93ZXI0LmVhc2VPdXQgfSApO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHQkY2FtZXJhLnBpdm90LnkgLT0gMjA7XG5cdFx0fVxuXHRcdC8vVHdlZW5MaXRlLnRvKCRjYW1lcmEsIDEsIHsgX2ZwWTogZnBZLTEyMCwgZWFzZTogUG93ZXI0LmVhc2VPdXQgfSk7XG5cdFx0Ly8kY2FtZXJhLnVwZGF0ZUZhclBvaW50RnJvbVRhcmdldChudWxsLGZwWS0xMjApO1xuXHR9XG5cdGlmICggZXZlbnQua2V5Q29kZSA9PT0gMzkgKSB7IC8vIGFycm93UmlnaHRcblx0XHRpZiAoIGV2ZW50LmN0cmxLZXkgKSB7XG5cdFx0XHRjb25zdCBwb3MgPSAkY2FtZXJhLnNjZW5lLnBvc2l0aW9uO1xuXHRcdFx0VHdlZW5MaXRlLnRvICggcG9zLCAxLCB7IHk6IHBvcy54ICsgMjAsIGVhc2U6IFBvd2VyNC5lYXNlT3V0IH0gKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0JGNhbWVyYS5waXZvdC54ICs9IDIwO1xuXHRcdH1cblx0XHQvL1R3ZWVuTGl0ZS50bygkY2FtZXJhLCAxLCB7IF9mcFg6IGZwWCsxMjAsIGVhc2U6IFBvd2VyNC5lYXNlT3V0IH0pO1xuXHRcdC8vJGNhbWVyYS51cGRhdGVGYXJQb2ludEZyb21UYXJnZXQoZnBYKzEyMCk7XG5cdH1cblx0aWYgKCBldmVudC5rZXlDb2RlID09PSA0MCApIHsgLy8gYXJyb3dEb3duXG5cdFx0aWYgKCBldmVudC5jdHJsS2V5ICkge1xuXHRcdFx0Y29uc3QgcG9zID0gJGNhbWVyYS5zY2VuZS5wb3NpdGlvbjtcblx0XHRcdFR3ZWVuTGl0ZS50byAoIHBvcywgMSwgeyB5OiBwb3MueSAtIDIwLCBlYXNlOiBQb3dlcjQuZWFzZU91dCB9ICk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdCRjYW1lcmEucGl2b3QueSArPSAyMDtcblx0XHR9XG5cdFx0Ly9Ud2VlbkxpdGUudG8oJGNhbWVyYSwgMSwgeyBfZnBZOiBmcFkrMTIwLCBlYXNlOiBQb3dlcjQuZWFzZU91dCB9KTtcblx0XHQvLyRjYW1lcmEudXBkYXRlRmFyUG9pbnRGcm9tVGFyZ2V0KG51bGwsZnBZKzEyMCk7XG5cdH1cblx0aWYgKCBldmVudC5rZXlDb2RlID09PSAxMDcgKSB7IC8vIHBhZCtcblx0XHRjb25zdCBhY2MgPSBUd2VlbkxpdGUuZ2V0VHdlZW5zT2YgKCAkY2FtZXJhICkubGVuZ3RoO1xuXHRcdFR3ZWVuTGl0ZS50byAoICRjYW1lcmEsIDEsIHsgX2ZwRjogZnBmICsgMC4wMiwgZWFzZTogUG93ZXI0LmVhc2VPdXQgfSApO1xuXHRcdGV2ZW50LmN0cmxLZXkgJiYgVHdlZW5MaXRlLnRvICggJGNhbWVyYSwgMSwgeyBfZnBZOiBmcFkgLSAzMCwgZWFzZTogUG93ZXI0LmVhc2VPdXQgfSApO1xuXHRcdC8vJGNhbWVyYS51cGRhdGVGYXJQb2ludEZyb21UYXJnZXQobnVsbCxudWxsLGZwZiswLjEpO1xuXHR9XG5cdGlmICggZXZlbnQua2V5Q29kZSA9PT0gMTA5ICkgeyAvLyBwYWQtXG5cdFx0Y29uc3QgYWNjID0gVHdlZW5MaXRlLmdldFR3ZWVuc09mICggJGNhbWVyYSApLmxlbmd0aDtcblx0XHRUd2VlbkxpdGUudG8gKCAkY2FtZXJhLCAxLCB7IF9mcEY6IGZwZiAtIDAuMDEgLSAoIDAuMDQgKiBhY2MgKSwgZWFzZTogUG93ZXI0LmVhc2VPdXQgfSApO1xuXHRcdC8vVHdlZW5MaXRlLnRvKCRjYW1lcmEsIDAuNSwgeyBfZnBmOiBmcGYtMC4xLCBlYXNlOiBQb3dlcjQuZWFzZU91dCB9KTtcblx0XHQvLyRjYW1lcmEudXBkYXRlRmFyUG9pbnRGcm9tVGFyZ2V0KG51bGwsbnVsbCxmcGYtMC4xKTtcblx0fVxuXHRpZiAoIGV2ZW50LmtleUNvZGUgPT09IDEwMCB8fCBldmVudC5rZXlDb2RlID09PSAxMDIgKSB7IC8vIG51bXBhZCA0fHw2IChsb2NrIHRoZSBYIF9mcFgpXG5cdFx0ZXZlbnQua2V5Q29kZSA9PT0gMTAwICYmIFR3ZWVuTGl0ZS50byAoICRjYW1lcmEsIDAuNywgeyBfZnBYOiBmcFggKyAyNSwgZWFzZTogUG93ZXI0LmVhc2VPdXQgfSApO1xuXHRcdGV2ZW50LmtleUNvZGUgPT09IDEwMiAmJiBUd2VlbkxpdGUudG8gKCAkY2FtZXJhLCAwLjcsIHsgX2ZwWDogZnBYIC0gMjUsIGVhc2U6IFBvd2VyNC5lYXNlT3V0IH0gKTtcblx0XHQvLyRjYW1lcmEuX2ZwWExvY2sgPSAhJGNhbWVyYS5fZnBYTG9jaztcblx0XHQvLyRjYW1lcmEucmVkcmF3RGVidWdTY3JlZW4oKTtcblx0fVxuXHRpZiAoIGV2ZW50LmtleUNvZGUgPT09IDEwNCB8fCBldmVudC5rZXlDb2RlID09PSA5OCApIHsgLy8gbnVtcGFkIDh8fDIgKGxvY2sgdGhlIFkgX2ZwWSlcblx0XHRldmVudC5rZXlDb2RlID09PSAxMDQgJiYgVHdlZW5MaXRlLnRvICggJGNhbWVyYSwgMC43LCB7IF9mcFk6IGZwWSArIDI1LCBlYXNlOiBQb3dlcjQuZWFzZU91dCB9ICk7XG5cdFx0ZXZlbnQua2V5Q29kZSA9PT0gOTggJiYgVHdlZW5MaXRlLnRvICggJGNhbWVyYSwgMC43LCB7IF9mcFk6IGZwWSAtIDI1LCBlYXNlOiBQb3dlcjQuZWFzZU91dCB9ICk7XG5cdH1cblx0aWYgKCBldmVudC5rZXlDb2RlID09PSAxMDEgKSB7IC8vIG51bXBhZCA1IGNvcHlcblx0XHR3aW5kb3cucHJvbXB0ICggXCJDb3B5IHRoaXMgdG8gJGNhbWVyYS5jYW1lcmFTZXR1cFwiLFxuXHRcdFx0YHtfZnBYOiR7ICRjYW1lcmEuX2ZwWC50b0ZpeGVkICggMiApIH0sX2ZwWTokeyAkY2FtZXJhLl9mcFkudG9GaXhlZCAoIDIgKSB9LF9mcEY6JHsgJGNhbWVyYS5fZnBGLnRvRml4ZWQgKCAyICkgfSxfem9vbTokeyAkY2FtZXJhLl96b29tLnRvRml4ZWQgKCAyICkgfX1gXG5cdFx0KTtcblx0fVxufSApO1xuIiwiLypcbiogTGVzIHN0YWdlIHJlbmQgbGVzIHNjZW5lc1xuKi9cbmNsYXNzIF9zdGFnZSBleHRlbmRzIFBJWEkuZGlzcGxheS5TdGFnZSB7XG5cdFxuXHRjb25zdHJ1Y3RvciAoKSB7XG5cdFx0c3VwZXIgKCk7XG5cdFx0Ly8gVE9ETzogUEVVVCBFVFJFIE1PRElGSUVSIFBPVVIgTEVTIEZBQlJJRVIgQVUgQk9PVCwgY2xhc3MgZGlyZWN0IFtodWRzLHNjcmVlbk1lc2FnZSxtb3VzZV1cblx0XHQvLyB0aGlzLkNBR0VfR1VJID0gbmV3IFBJWEkuQ29udGFpbmVyICgpOyAvLyBzY3JlZW4gbWVudWUgZ3VpIGh1ZHNcblx0XHQvLyB0aGlzLkNBR0VfTUVTU0FHRSA9IG5ldyBQSVhJLkNvbnRhaW5lciAoKTsgLy8gc2NyZWVuIG1lc3NhZ2Vcblx0XHQvLyB0aGlzLkNBR0VfTU9VU0UgPSBuZXcgUElYSS5Db250YWluZXIgKCk7IC8vIHN0b3JlIG1hc3RlciBtb3VzZSBzcHJpdGUgYW5kIEZYLCB0b3Vqb3VycyB0b3Bcblx0XHQvLyB0aGlzLkxJR0hUUyA9IHsgYW1iaWVudExpZ2h0OiB7fSwgUG9pbnRMaWdodF9tb3VzZToge30gfTsgLy8sIGRpcmVjdGlvbmFsTGlnaHQ6IG5ldyBQSVhJLkNvbnRhaW5lckRpcmVjdGlvbmFsTGlnaHQoKSB9OyAvLyB0aGUgZ2xvYmFsIGNvbmZpZ3VyYWJsZSBvbiBzY2VuZUNoYW5nZVxuXHR9O1xuXG5cdC8vIGNoYW5nZSBzY2VuZSBpbiBjYW1lcmEgdmlld1BvcnRcblx0c2V0IHNjZW5lICggbmV4dFNjZW5lICkge1xuXHRcdGlmICggdGhpcy5fc2NlbmUgKSB7IC8vIGluaXRpYWxpc2UgY2FtZXJhIHdpdGggbmV3IHNjZW5lXG5cdFx0XHR0aGlzLnNjZW5lLm9uU3RvcCAoKTtcblx0XHRcdC8vdGhpcy5zY2VuZS5vbkVuZCgpO1xuXHRcdFx0Ly90aGlzLnNjZW5lLnVuTG9hZCgpOyAvLyBxdWFuZCBvbiBjaGFuZ2UgZGUgc2NlbmVQYWNrXG5cdFx0XHR0aGlzLl9zY2VuZSA9IG51bGw7XG5cdFx0fVxuXHRcdFxuXHRcdGlmICggbmV4dFNjZW5lICkge1xuXHRcdFx0ZG9jdW1lbnQudGl0bGUgPSBkb2N1bWVudC50aXRsZSArIGAgPT5bJHsgbmV4dFNjZW5lLmNvbnN0cnVjdG9yLm5hbWUgfV0gYDtcblx0XHRcdHRoaXMuX3NjZW5lID0gbmV4dFNjZW5lO1xuXHRcdFx0dGhpcy5uZXh0U2NlbmUgPSBudWxsO1xuXHRcdH1cblx0XHRcblx0fTtcblxuXHRnZXQgc2NlbmUgKCkge1xuXHRcdHJldHVybiB0aGlzLl9zY2VuZSB8fCBmYWxzZVxuXHR9O1xuXG5cdGluaXRpYWxpemUgKCkge1xuXHRcdHRoaXMuaW5pdGlhbGl6ZV9MYXllcnMgKCk7XG5cdFx0dGhpcy5pbml0aWFsaXplX0NhbWVyYSAoKTtcblx0XHR0aGlzLmluaXRpYWxpemVfTGlnaHRzICgpO1xuXHRcdC8vIHRoaXMuZ290byAoICdTY2VuZV9Cb290Jywge30gKTtcblx0fTtcblxuXHRpbml0aWFsaXplX0NhbWVyYSAoKSB7XG5cdFx0Ly8gdGhpcy5hZGRDaGlsZCAoICRjYW1lcmEgKTsgLy8gY2FtZXJhIGNhbiBob2xkIHNjZW5lIHdpdGggcHJvamVjdGlvbnNcblx0fTtcblxuXHRpbml0aWFsaXplX0xheWVycyAoKSB7XG5cdFx0Ly8gdGhpcy5hZGRDaGlsZCAoIHRoaXMuQ0FHRV9HVUksIHRoaXMuQ0FHRV9NRVNTQUdFLCB0aGlzLkNBR0VfTU9VU0UgKTtcblx0XHQvLyB0aGlzLkNBR0VfTU9VU0UucGFyZW50R3JvdXAgPSAkZGlzcGxheUdyb3VwLmdyb3VwWyA2IF07XG5cdFx0Ly8gdGhpcy5DQUdFX01PVVNFLnBhcmVudExheWVyID0gJGRpc3BsYXlHcm91cC5sYXllcnNHcm91cFswXTsgLy9GSVhNRTogRVhQRVJJTUVOVEFMXG5cdFx0Ly8gdGhpcy5DQUdFX0dVSS5wYXJlbnRHcm91cCA9ICRkaXNwbGF5R3JvdXAuZ3JvdXBbIDQgXTtcblx0XHQvLyB0aGlzLmFkZENoaWxkICggLy8gbGlnaHRzIGdyb3Vwc1xuXHRcdC8vIFx0JGRpc3BsYXlHcm91cC5fc3ByaXRlQmxhY2tfZCxcblx0XHQvLyBcdCRkaXNwbGF5R3JvdXAuX2xheWVyX2RpZmZ1c2VHcm91cCxcblx0XHQvLyBcdCRkaXNwbGF5R3JvdXAuX2xheWVyX25vcm1hbEdyb3VwLFxuXHRcdC8vIFx0JGRpc3BsYXlHcm91cC5fbGF5ZXJfbGlnaHRHcm91cCxcblx0XHQvLyBcdC4uLiRkaXNwbGF5R3JvdXAubGF5ZXJzR3JvdXAgLy8gZGlzcGxheUdyb3Vwc1xuXHRcdC8vICk7XG5cdH07XG5cblx0aW5pdGlhbGl6ZV9MaWdodHMgKCkge1xuXHRcdC8vIHRoaXMuTElHSFRTLmFtYmllbnRMaWdodCA9IG5ldyBQSVhJLmxpZ2h0cy5BbWJpZW50TGlnaHQgKCk7Ly8kb2Jqcy5uZXdDb250YWluZXJfbGlnaHQoJ0FtYmllbnRMaWdodCcgICAgKTtcblx0XHQvLyB0aGlzLkxJR0hUUy5Qb2ludExpZ2h0X21vdXNlID0gbmV3IFBJWEkubGlnaHRzLlBvaW50TGlnaHQgKCk7Ly8kb2Jqcy5uZXdDb250YWluZXJfbGlnaHQoJ1BvaW50TGlnaHQnICAgICAgKTtcblx0XHQvLyB0aGlzLkxJR0hUUy5EaXJlY3Rpb25hbExpZ2h0ID0gbmV3IFBJWEkubGlnaHRzLkRpcmVjdGlvbmFsTGlnaHQoKTsvLyRvYmpzLm5ld0NvbnRhaW5lcl9saWdodCgnRGlyZWN0aW9uYWxMaWdodCcpO1xuXHRcdC8vIHRoaXMuYWRkQ2hpbGQgKCAuLi5PYmplY3QudmFsdWVzICggdGhpcy5MSUdIVFMgKSApO1xuXHR9O1xuXHRcblx0Ly8gc2VlIGh0dHA6Ly9waXhpanMuZG93bmxvYWQvZGV2L2RvY3MvUElYSS5wcmVwYXJlLmh0bWwgZm9yIGdwdSBjYWNoZSBcblx0Z290byAoIHRhcmdldFNjZW5lTmFtZSwgb3B0aW9ucyApIHtcblx0XHQvLyBjaGVjayBpZiBsb2FkZXJLaXQgYXNpZ25lZCB0byBjbGFzcyBhcmUgbG9hZGVkLCBpZiB5ZXMgZ2V0IHRoZSBzY2VuZSwgaWYgbm8gLCBnb3RvIGxvYWRlciBzY2VuZSBhbmQgbG9hZCBhbGwga2l0IGFuZCBzY2VuZVxuXHRcdHRoaXMubmV4dFNjZW5lID0gJExvYWRlci5nZXROZXh0U2NlbmUgKCB0YXJnZXRTY2VuZU5hbWUgKTsgLy98fCAkTG9hZGVyLmxvYWRTY2VuZUtpdChzY2VuZU5hbWUpOyAvLyRMb2FkZXIubmVlZExvYWRlcktpdChzY2VuZU5hbWUpO1xuXHR9O1xuXHRcblx0Ly8gZ2V0IHN0YWdlIHN5c3RlbSBpbmZvcm1hdGlvbnNcblx0Z2V0RGF0YVZhbHVlcyAoKSB7XG5cdFx0Y29uc3QgbGlzdCA9ICRvYmpzLmdldF9saXN0OyAvLyBnZXR0ZXIgT2JqIGZyb20gY3VycmVudCBzY2VuZVxuXHRcdC8vIGxpc3RlciBvYmpldCBwYXIgY29udGFpbmVyVHlwZVxuXHRcdGNvbnN0IHRvdGFsX2NvbnRhaW5lclR5cGUgPSB7fTtcblx0XHRPYmplY3Qua2V5cyAoICRzeXN0ZW1zLmNsYXNzVHlwZS5jb250YWluZXJzICkuZm9yRWFjaCAoIGN0eXBlID0+IHtcblx0XHRcdHRvdGFsX2NvbnRhaW5lclR5cGVbIGN0eXBlIF0gPSBsaXN0LmZpbHRlciAoICggbyApID0+IHtcblx0XHRcdFx0cmV0dXJuIG8uZGF0YVZhbHVlcy5iLmNvbnRhaW5lclR5cGUgPT09IGN0eXBlXG5cdFx0XHR9ICk7XG5cdFx0fSApO1xuXHRcdGNvbnN0IHRvdGFsX2RhdGFUeXBlID0ge307XG5cdFx0T2JqZWN0LmtleXMgKCAkc3lzdGVtcy5jbGFzc1R5cGUuZGF0YXMgKS5mb3JFYWNoICggZHR5cGUgPT4ge1xuXHRcdFx0dG90YWxfZGF0YVR5cGVbIGR0eXBlIF0gPSBsaXN0LmZpbHRlciAoICggbyApID0+IHtcblx0XHRcdFx0cmV0dXJuIG8uZGF0YVZhbHVlcy5iLmRhdGFUeXBlID09PSBkdHlwZVxuXHRcdFx0fSApO1xuXHRcdH0gKTtcblx0XHRjb25zdCB0b3RhbF9zaGVldHMgPSB7fTtcblx0XHRsaXN0LmZvckVhY2ggKCBkYXRhT2JqID0+IHtcblx0XHRcdHRvdGFsX3NoZWV0c1sgZGF0YU9iai5fZGF0YUJhc2VOYW1lIF0gPSBkYXRhT2JqLmRhdGFCYXNlO1xuXHRcdH0gKTtcblx0XHRpZiAoIHRoaXMuc2NlbmUuYmFja2dyb3VuZC5kYXRhT2JqLl9kYXRhQmFzZU5hbWUgKSB7IC8vIGFsc28gYWRkIGJnXG5cdFx0XHR0b3RhbF9zaGVldHNbIHRoaXMuc2NlbmUuYmFja2dyb3VuZC5kYXRhT2JqLl9kYXRhQmFzZU5hbWUgXSA9IHRoaXMuc2NlbmUuYmFja2dyb3VuZC5kYXRhT2JqLmRhdGFCYXNlO1xuXHRcdH1cblx0XHQ7XG5cdFx0Y29uc3QgbWVtb3J5VXNhZ2UgPSAoICgpID0+IHtcblx0XHRcdGNvbnN0IG0gPSBwcm9jZXNzLm1lbW9yeVVzYWdlICgpO1xuXHRcdFx0T2JqZWN0LmtleXMgKCBtICkubWFwICggKCBpICkgPT4ge1xuXHRcdFx0XHRyZXR1cm4gbVsgaSBdID0gKCBtWyBpIF0gLyAxMDI0IC8gMTAyNCApLnRvRml4ZWQgKCAyIClcblx0XHRcdH0gKTtcblx0XHRcdHJldHVybiBtO1xuXHRcdH0gKSAoKTtcblx0XHRyZXR1cm4ge1xuXHRcdFx0bWVtb3J5VXNhZ2UsXG5cdFx0XHRjdXJyZW50U2NlbmU6IHRoaXMuc2NlbmUubmFtZSxcblx0XHRcdHNhdmVQYXRoOiBgZGF0YS8keyB0aGlzLnNjZW5lLm5hbWUgfS5qc29uYCxcblx0XHRcdHRvdGFsX2NvbnRhaW5lclR5cGUsXG5cdFx0XHR0b3RhbF9kYXRhVHlwZSxcblx0XHRcdHRvdGFsX3NoZWV0cyxcblx0XHRcdHRvdGFsT2JqczogbGlzdC5sZW5ndGgsXG5cdFx0fTtcblx0fTtcbn1cblxud2luZG93Ll9zdGFnZSA9IF9zdGFnZTtcbi8vIGdsb2JhbC4kc3RhZ2UgPSBuZXcgX3N0YWdlICgpO1xuLy8gJGFwcC5zdGFnZSA9ICRzdGFnZTtcbi8vIGNvbnNvbGUubG9nMSAoICckc3RhZ2U6ICcsICRzdGFnZSApO1xuIiwiQ2FtZXJhQ29tcG9uZW50ID0ge1xuXHRwcm9wZXJ0aWVzOiB7XG5cdFx0YmFja2dyb3VuZENvbG9yOiAweDAwMDAwMCxcblx0XHRyZW5kZXJpbmdMYXllcnM6IFtdLFxuXHRcdHpvb206IDEsXG5cdFx0ZGVwdGg6IDAsXG5cdFx0cmVuZGVyVGV4dHVyZTogbnVsbCxcblx0XHRyZW5kZXJUYXJnZXQ6IG51bGwsXG5cdFx0cmVuZGVyU3ByaXRlOiBudWxsLFxuXHRcdHNjcmVlblc6IDAsXG5cdFx0c2NyZWVuSDogMCxcblx0XHR3b3JsZFc6IDAsXG5cdFx0d29ybGRIOiAwLFxuXHRcdGNhbTogbmV3IENhbWVyYSAoKVxuXHR9LFxuXHRzZXJpYWxpemU6IHtcblx0XHRza2lwOiBbICdjYW0nLCAncmVuZGVyVGV4dHVyZScsICdyZW5kZXJUYXJnZXQnLCAncmVuZGVyU3ByaXRlJyBdXG5cdH1cbn07XG5cbiRlY3MucmVnaXN0ZXJDb21wb25lbnQgKCAnQ2FtZXJhJywgQ2FtZXJhQ29tcG9uZW50ICk7XG4iLCJEZWJ1Z01vdmVDb21wb25lbnQgPSB7XG5cdHByb3BlcnRpZXM6IHtcblx0XHRzcGVlZFg6IDMuMCxcblx0XHRzcGVlZFk6IDMuMFxuXHR9XG59O1xuXG4kZWNzLnJlZ2lzdGVyQ29tcG9uZW50ICggJ0RlYnVnTW92ZScsIERlYnVnTW92ZUNvbXBvbmVudCApO1xuIiwiQ2FtZXJhRm9sbG93VGFyZ2V0Q29tcG9uZW50ID0ge1xuXHRwcm9wZXJ0aWVzOiB7XG5cdFx0c21vb3RoVGltZVg6IDAuNSxcblx0XHRzbW9vdGhUaW1lWTogMC41LFxuXHRcdG9mZnNldFg6IDAsXG5cdFx0b2Zmc2V0WTogMCxcblx0XHR0YXJnZXQ6IG51bGwsXHQvLyA8RW50aXR5PlxuXHRcdHNtb290aFhTcGVlZDogMCxcblx0XHRzbW9vdGhZU3BlZWQ6IDAsXG5cdH0sXG5cdHNlcmlhbGl6ZToge1xuXHRcdHNraXA6IFsgJ3RhcmdldCcgXVxuXHR9XG59O1xuXG4kZWNzLnJlZ2lzdGVyQ29tcG9uZW50ICggJ0NhbWVyYUZvbGxvd1RhcmdldCcsIENhbWVyYUZvbGxvd1RhcmdldENvbXBvbmVudCApO1xuIiwiLy8gbW9kdWxlLmV4cG9ydHMgPSB7XHJcbi8vIFx0RUNTOiByZXF1aXJlICggJy4vZWNzJyApLFxyXG4vLyBcdFN5c3RlbTogcmVxdWlyZSAoICcuL3N5c3RlbScgKSxcclxuLy8gXHRDb21wb25lbnQ6IHJlcXVpcmUgKCAnLi9jb21wb25lbnQnIClcclxuLy8gfVxyXG5cclxucmVxdWlyZSAoICcuL3RyYW5zZm9ybScgKTtcclxucmVxdWlyZSAoICcuL2NhbWVyYScgKTtcclxucmVxdWlyZSAoICcuL3Nwcml0ZScgKTtcclxucmVxdWlyZSAoICcuL3RpbGVtYXAnICk7XHJcbnJlcXVpcmUgKCAnLi9kZWJ1Z19tb3ZlJyApO1xyXG5yZXF1aXJlICggJy4vZm9sbG93X3RhcmdldCcgKTtcclxuXHJcbiRlY3MucmVnaXN0ZXJBbGxEZWZpbmVkQ29tcG9uZW50cyA9IGZ1bmN0aW9uICgpIHtcclxuXHJcblx0Y29uc29sZS5sb2cgKCAnbG9hZGluZyBjb21wb25lbnRzIC4uLicgKTtcclxuXHRmb3IgKCBjb25zdCBba2V5LCB2YWx1ZV0gb2YgQ29tcG9uZW50RXhwb3J0cyApIHtcclxuXHQvLyBmb3IgKCBjb25zdCBuYW1lIG9mIE9iamVjdC5rZXlzICggQ29tcG9uZW50RXhwb3J0cyApICkge1xyXG5cdFx0Y29uc29sZS5sb2cgKCBgcmVnaXN0ZXJpbmcgJHsga2V5IH1gICk7XHJcblx0XHRTY2VuZU1hbmFnZXIuX2Vjcy5yZWdpc3RlckNvbXBvbmVudCAoIGtleSwgdmFsdWUgKTtcclxuXHR9XHJcbn07XHJcbiIsIlNwcml0ZUNvbXBvbmVudCA9IHtcblx0cHJvcGVydGllczoge1xuXHRcdHJlczogJycsXG5cdFx0ZnJhbWU6IG51bGwsXG5cdFx0dGludDogMHgwMDAwMDAsXG5cdFx0bGF5ZXI6ICdEZWZhdWx0Jyxcblx0XHR6SW5kZXg6IDAsXG5cdFx0ek9yZGVyOiAwLFxuXHRcdHNwcml0ZTogbnVsbFxuXHR9LFxuXHRzZXJpYWxpemU6IHtcblx0XHRza2lwOiBbICdzcHJpdGUnIF1cblx0fVxufTtcblxuJGVjcy5yZWdpc3RlckNvbXBvbmVudCAoICdTcHJpdGUnLCBTcHJpdGVDb21wb25lbnQgKTtcbiIsIlRpbGVtYXBDb21wb25lbnQgPSB7XG5cdHByb3BlcnRpZXM6IHtcblx0XHRyZXM6ICcnLFx0Ly8gcGF0aCB0byB0bXhcblx0XHR0aW50OiAweDAwMDAwMCxcblx0XHRsYXllcjogJ0RlZmF1bHQnLFxuXHRcdHpJbmRleDogMCxcblx0XHR6T3JkZXI6IDAsXG5cdFx0aXNSZWFkeTogZmFsc2UsXG5cdFx0aXNMb2FkaW5nOiBmYWxzZSxcblx0XHR0aWxlbWFwOiBudWxsXHQvLyBQSVhJLmV4dHJhcy5UaWxlZE1hcFxuXHR9LFxuXHRzZXJpYWxpemU6IHtcblx0XHRza2lwOiBbICd0aWxlbWFwJyBdXG5cdH1cbn07XG5cbiRlY3MucmVnaXN0ZXJDb21wb25lbnQgKCAnVGlsZW1hcCcsIFRpbGVtYXBDb21wb25lbnQgKTtcbiIsIi8vIGNsYXNzIFRyYW5zZm9ybUNvbXBvbmVudCBleHRlbmRzIEJhc2VDb21wb25lbnQge1xyXG4vLyBcdGxvY2FsUG9zaXRpb24gPSBnbE1hdHJpeC52ZWMyLmNyZWF0ZSAoKTtcclxuLy8gXHRwb3NpdGlvbiA9IGdsTWF0cml4LnZlYzIuY3JlYXRlICgpO1xyXG4vLyBcdHJvdGF0aW9uID0gMC4wO1xyXG4vLyB9XHJcblxyXG5UcmFuc2Zvcm1Db21wb25lbnQgPSB7XHJcblx0cHJvcGVydGllczoge1xyXG5cdFx0bG9jYWxQb3NpdGlvbjogbnVsbCxcclxuXHRcdHBvc2l0aW9uOiBudWxsLFxyXG5cdFx0cm90YXRpb246IDAuMCxcclxuXHRcdHBhcmVudDogbnVsbFxyXG5cdH1cclxufTtcclxuXHJcbiRlY3MucmVnaXN0ZXJDb21wb25lbnQgKCAnVHJhbnNmb3JtJywgVHJhbnNmb3JtQ29tcG9uZW50ICk7XHJcbiIsImNsYXNzIERlYnVnTW92ZVN5c3RlbSBleHRlbmRzIFN5c3RlbSB7XG5cblx0Y29uc3RydWN0b3IgKCBlY3MgKSB7XG5cdFx0c3VwZXIgKCBlY3MgKTtcblx0XHRcblx0XHR0aGlzLmhvcml6b250YWwgPSAwO1xuXHRcdHRoaXMudmVydGljYWwgPSAwO1xuXHRcdFxuXHRcdGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIgKCAna2V5ZG93bicsICggZXZlbnQgKSA9PiB7XG5cdFx0XHRpZiAoIGV2ZW50LmtleSA9PSAndycgKSB7XG5cdFx0XHRcdHRoaXMudmVydGljYWwgPSAtMTtcblx0XHRcdH1cblx0XHRcdGlmICggZXZlbnQua2V5ID09ICdzJyApIHtcblx0XHRcdFx0dGhpcy52ZXJ0aWNhbCA9IDE7XG5cdFx0XHR9XG5cdFx0XHRpZiAoIGV2ZW50LmtleSA9PSAnYScgKSB7XG5cdFx0XHRcdHRoaXMuaG9yaXpvbnRhbCA9IC0xO1xuXHRcdFx0fVxuXHRcdFx0aWYgKCBldmVudC5rZXkgPT0gJ2QnICkge1xuXHRcdFx0XHR0aGlzLmhvcml6b250YWwgPSAxO1xuXHRcdFx0fVxuXHRcdH0gKTtcblxuXHRcdGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIgKCAna2V5dXAnLCAoIGV2ZW50ICkgPT4ge1xuXHRcdFx0aWYgKCBldmVudC5rZXkgPT0gJ3cnICkge1xuXHRcdFx0XHR0aGlzLnZlcnRpY2FsID0gMDtcblx0XHRcdH1cblx0XHRcdGlmICggZXZlbnQua2V5ID09ICdzJyApIHtcblx0XHRcdFx0dGhpcy52ZXJ0aWNhbCA9IDA7XG5cdFx0XHR9XG5cdFx0XHRpZiAoIGV2ZW50LmtleSA9PSAnYScgKSB7XG5cdFx0XHRcdHRoaXMuaG9yaXpvbnRhbCA9IDA7XG5cdFx0XHR9XG5cdFx0XHRpZiAoIGV2ZW50LmtleSA9PSAnZCcgKSB7XG5cdFx0XHRcdHRoaXMuaG9yaXpvbnRhbCA9IDA7XG5cdFx0XHR9XG5cdFx0fSApO1xuXHR9XG5cblx0dXBkYXRlICggdGljaywgZW50aXRpZXMgKSB7XG5cblx0XHRmb3IgKCBjb25zdCBlbnRpdHkgb2YgZW50aXRpZXMgKSB7XG5cdFx0XHRpZiAoIHRoaXMuaG9yaXpvbnRhbCAhPSAwIHx8IHRoaXMudmVydGljYWwgIT0gMCApIHtcblx0XHRcdFx0bGV0IHBvc2l0aW9uID0gZW50aXR5LlRyYW5zZm9ybS5wb3NpdGlvbjtcblx0XHRcdFx0ZW50aXR5LlRyYW5zZm9ybS5wb3NpdGlvbi5zZXQgKCBwb3NpdGlvbi54ICsgZW50aXR5LkRlYnVnTW92ZS5zcGVlZFggKiB0aGlzLmhvcml6b250YWwgKiAkYXBwLmRlbHRhVGltZSwgcG9zaXRpb24ueSArIGVudGl0eS5EZWJ1Z01vdmUuc3BlZWRZICogdGhpcy52ZXJ0aWNhbCAqICRhcHAuZGVsdGFUaW1lIClcblxuXHRcdFx0XHQvLyBjb25zb2xlLmxvZzEgKCBlbnRpdHkuaWQsICdEZWJ1ZyBNb3ZlOicsIGVudGl0eS5UcmFuc2Zvcm0ucG9zaXRpb24ueCwgZW50aXR5LlRyYW5zZm9ybS5wb3NpdGlvbi55ICk7XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG59XG5cbkRlYnVnTW92ZVN5c3RlbS5xdWVyeSA9IHtcblx0aGFzOiBbICdUcmFuc2Zvcm0nLCAnRGVidWdNb3ZlJyBdXG59O1xuXG5nbG9iYWwuRGVidWdNb3ZlU3lzdGVtID0gRGVidWdNb3ZlU3lzdGVtO1xuIiwiY2xhc3MgQ2FtZXJhRm9sbG93VGFyZ2V0U3lzdGVtIGV4dGVuZHMgU3lzdGVtIHtcblxuXHRjb25zdHJ1Y3RvciAoIGVjcyApIHtcblx0XHRzdXBlciAoIGVjcyApO1xuXHRcdHRoaXMuc3BlZWQgPSAwLjA7XG5cdH1cblxuXHR1cGRhdGUgKCB0aWNrLCBlbnRpdGllcyApIHtcblxuXHRcdGZvciAoIGNvbnN0IGVudGl0eSBvZiBlbnRpdGllcyApIHtcblxuXHRcdFx0aWYgKCAhZW50aXR5LkNhbWVyYUZvbGxvd1RhcmdldC50YXJnZXQgKSB7XG5cdFx0XHRcdGNvbnRpbnVlO1xuXHRcdFx0fVxuXG5cdFx0XHRsZXQgY2FtZXJhQ29tcG9uZW50ID0gZW50aXR5LkNhbWVyYTtcblx0XHRcdGxldCBmb2xsb3dDb21wb25lbnQgPSBlbnRpdHkuQ2FtZXJhRm9sbG93VGFyZ2V0O1xuXHRcdFx0bGV0IHRhcmdldFBvc2l0aW9uID0gZm9sbG93Q29tcG9uZW50LnRhcmdldC5UcmFuc2Zvcm0ucG9zaXRpb247XG5cdFx0XHRsZXQgY2FtZXJhQ2VudGVyID0gY2FtZXJhQ29tcG9uZW50LmNhbS5jZW50ZXI7XG5cdFx0XHRsZXQgeCA9IDA7XG5cdFx0XHRsZXQgeSA9IDA7XG5cblx0XHRcdHRoaXMuc3BlZWQgPSBmb2xsb3dDb21wb25lbnQuc21vb3RoWFNwZWVkO1xuXHRcdFx0eCA9IHRoaXMuaW5lcnRpYWxEYW1wICggY2FtZXJhQ2VudGVyLngsIHRhcmdldFBvc2l0aW9uLnggKyBmb2xsb3dDb21wb25lbnQub2Zmc2V0WCwgZm9sbG93Q29tcG9uZW50LnNtb290aFRpbWVYICk7XG5cdFx0XHRmb2xsb3dDb21wb25lbnQuc21vb3RoWFNwZWVkID0gdGhpcy5zcGVlZDtcblxuXHRcdFx0dGhpcy5zcGVlZCA9IGZvbGxvd0NvbXBvbmVudC5zbW9vdGhZU3BlZWQ7XG5cdFx0XHR5ID0gdGhpcy5pbmVydGlhbERhbXAgKCBjYW1lcmFDZW50ZXIueSwgdGFyZ2V0UG9zaXRpb24ueSArIGZvbGxvd0NvbXBvbmVudC5vZmZzZXRZLCBmb2xsb3dDb21wb25lbnQuc21vb3RoVGltZVkgKTtcblx0XHRcdGZvbGxvd0NvbXBvbmVudC5zbW9vdGhZU3BlZWQgPSB0aGlzLnNwZWVkO1xuXHRcdFx0XG5cdFx0XHQvLyBjb25zb2xlLmxvZzIgKCBgdGFyZ2V0OiAoJHtlbnRpdHkuVHJhbnNmb3JtLnBvc2l0aW9uLnh9LCAke2VudGl0eS5UcmFuc2Zvcm0ucG9zaXRpb24ueX0pICgke2VudGl0eS5Gb2xsb3dUYXJnZXQudGFyZ2V0LlRyYW5zZm9ybS5wb3NpdGlvbi54fSwgJHtlbnRpdHkuRm9sbG93VGFyZ2V0LnRhcmdldC5UcmFuc2Zvcm0ucG9zaXRpb24ueX0pYCApO1xuXG5cdFx0XHRjYW1lcmFDb21wb25lbnQuY2FtLm1vdmVDZW50ZXIgKCB4LCB5ICk7XG5cdFx0XHRlbnRpdHkuVHJhbnNmb3JtLnBvc2l0aW9uLnNldCAoIGNhbWVyYUNvbXBvbmVudC5jYW0ucG9zaXRpb24ueCwgY2FtZXJhQ29tcG9uZW50LmNhbS5wb3NpdGlvbi55ICk7XG5cdFx0fVxuXHR9XG5cblx0c21vb3RoRGFtcCAoIHByZXZpb3VzVmFsdWUsIHRhcmdldFZhbHVlLCBzbW9vdGhUaW1lICkge1xuXHRcdGxldCBUMSA9IDAuMzYgKiBzbW9vdGhUaW1lO1xuXHRcdGxldCBUMiA9IDAuNjQgKiBzbW9vdGhUaW1lO1xuXHRcdGxldCB4ID0gcHJldmlvdXNWYWx1ZSAtIHRhcmdldFZhbHVlO1xuXHRcdGxldCBuZXdTcGVlZCA9IHRoaXMuc3BlZWQgKyAkYXBwLmRlbHRhVGltZSAqICggLTEgLyAoIFQxICogVDIgKSAqIHggLSAoIFQxICsgVDIgKSAvICggVDEgKiBUMiApICogdGhpcy5zcGVlZCApO1xuXHRcdGxldCBuZXdWYWx1ZSA9IHggKyAkYXBwLmRlbHRhVGltZSAqIHRoaXMuc3BlZWQ7XG5cdFx0dGhpcy5zcGVlZCA9IG5ld1NwZWVkO1xuXHRcdHJldHVybiB0YXJnZXRWYWx1ZSArIG5ld1ZhbHVlO1xuXHR9XG5cblx0aW5lcnRpYWxEYW1wICggcHJldmlvdXNWYWx1ZSwgdGFyZ2V0VmFsdWUsIHNtb290aFRpbWUgKSB7XG5cdFx0bGV0IHggPSBwcmV2aW91c1ZhbHVlIC0gdGFyZ2V0VmFsdWU7XG5cdFx0bGV0IG5ld1ZhbHVlID0geCArICRhcHAuZGVsdGFUaW1lICogKCAtMS4wIC8gc21vb3RoVGltZSAqIHggKTtcblx0XHRyZXR1cm4gdGFyZ2V0VmFsdWUgKyBuZXdWYWx1ZTtcblx0fVxufVxuXG5DYW1lcmFGb2xsb3dUYXJnZXRTeXN0ZW0ucXVlcnkgPSB7XG5cdGhhczogWyAnVHJhbnNmb3JtJywgJ0NhbWVyYScsICdDYW1lcmFGb2xsb3dUYXJnZXQnIF1cbn07XG5cbmdsb2JhbC5DYW1lcmFGb2xsb3dUYXJnZXRTeXN0ZW0gPSBDYW1lcmFGb2xsb3dUYXJnZXRTeXN0ZW07XG4iLCJyZXF1aXJlICggJy4vcmVuZGVyaW5nX3N5c3RlbScgKTtcbnJlcXVpcmUgKCAnLi9zcHJpdGVfcmVuZGVyaW5nX3N5c3RlbScgKTtcbnJlcXVpcmUgKCAnLi90aWxlbWFwX2xvYWRfc3lzdGVtJyApO1xucmVxdWlyZSAoICcuL2RlYnVnX21vdmVfc3lzdGVtJyApO1xucmVxdWlyZSAoICcuL2ZvbGxvd190YXJnZXRfc3lzdGVtJyApO1xuIiwiY2xhc3MgUmVuZGVyaW5nU3lzdGVtIGV4dGVuZHMgU3lzdGVtIHtcblxuXHRjb25zdHJ1Y3RvciAoIGVjcyApIHtcblx0XHRzdXBlciAoIGVjcyApO1xuXHRcdHRoaXMuY2FtZXJhQ29tcG9uZW50cyA9IFtdO1xuXHRcdHRoaXMucmVuZGVyU3ByaXRlID0gbmV3IFBJWEkuU3ByaXRlICgpO1xuXHRcdHRoaXMucmVuZGVyU3ByaXRlLmJsZW5kTW9kZSA9IFBJWEkuQkxFTkRfTU9ERVMuU0NSRUVOO1xuXG5cdFx0Ly8gZm9yICggY29uc3QgbGF5ZXJOYW1lIG9mICRhcHAucmVuZGVyaW5nTGF5ZXJzLmtleXMgKCkgKSB7XG5cdFx0Ly8gXHRpZiAoICRhcHAucmVuZGVyaW5nTGF5ZXJzLmhhcyAoIGxheWVyTmFtZSApICApIHtcblx0XHQvLyBcdFx0bGV0IGxheWVyID0gJGFwcC5yZW5kZXJpbmdMYXllcnMuZ2V0ICggbGF5ZXJOYW1lICk7XG5cdFx0Ly8gXHRcdCRhcHAuc3RhZ2UuYWRkQ2hpbGQgKCBsYXllciApO1xuXHRcdC8vIFx0fVxuXHRcdC8vIH1cblxuXHRcdC8vIGRlYnVnXG5cdFx0ZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lciAoICdrZXlkb3duJywgKCBldmVudCApID0+IHtcblx0XHRcdGlmICggZXZlbnQua2V5ID09ICdwJyApIHtcblx0XHRcdFx0Zm9yICggY29uc3QgY2FtZXJhIG9mIHRoaXMuY2FtZXJhQ29tcG9uZW50cyApIHtcblx0XHRcdFx0XHRHcmFwaGljcy5kdW1wUmVuZGVyVGV4dHVyZSAoIGNhbWVyYS5yZW5kZXJUZXh0dXJlICk7XG5cdFx0XHRcdH1cblx0XHRcdFx0Y29uc29sZS5sb2cwICggJ3JlbmRlclRleHR1cmUgZHVtcGVkIScgKTtcblx0XHRcdH1cblx0XHRcdGlmICggZXZlbnQua2V5ID09ICdvJyApIHtcblx0XHRcdFx0Zm9yICggY29uc3QgY2FtZXJhIG9mIHRoaXMuY2FtZXJhQ29tcG9uZW50cyApIHtcblx0XHRcdFx0XHRHcmFwaGljcy5kdW1wUmVuZGVyVGV4dHVyZSAoIGNhbWVyYS5yZW5kZXJTcHJpdGUgKTtcblx0XHRcdFx0fVxuXHRcdFx0XHRjb25zb2xlLmxvZzAgKCAncmVuZGVyU3ByaXRlIGR1bXBlZCEnICk7XG5cdFx0XHR9XG5cdFx0fSApO1xuXHR9XG5cblx0dXBkYXRlICggdGljaywgZW50aXRpZXMgKSB7XG5cblx0XHR0aGlzLmNhbWVyYUNvbXBvbmVudHMuc3BsaWNlICggMCwgdGhpcy5jYW1lcmFDb21wb25lbnRzLmxlbmd0aCApO1xuXHRcdFxuXHRcdGZvciAoIGNvbnN0IGVudGl0eSBvZiBlbnRpdGllcyApIHtcblx0XHRcdHRoaXMuY2FtZXJhQ29tcG9uZW50cy5wdXNoICggZW50aXR5LkNhbWVyYSApO1xuXHRcdH1cblxuXHRcdHRoaXMuY2FtZXJhQ29tcG9uZW50cy5zb3J0ICggdGhpcy5zb3J0Q2FtZXJhRGVwdGggKTtcblx0XHRcblx0XHRHcmFwaGljcy50aWNrU3RhcnQgKCk7XG5cblx0XHQvLyByZW5kZXJpbmcgZXZlcnkgY2FtZXJhIHZpZXdwb3J0IHRvIHJlbmRlcnRleHR1cmVcblx0XHRmb3IgKCBjb25zdCBjYW1lcmEgb2YgdGhpcy5jYW1lcmFDb21wb25lbnRzICkge1xuXG5cdFx0XHRpZiAoIGNhbWVyYS5yZW5kZXJpbmdMYXllcnMubGVuZ3RoID09PSAwICkge1xuXHRcdFx0XHRjb250aW51ZTtcblx0XHRcdH1cblx0XHRcdFxuXHRcdFx0aWYgKCBjYW1lcmEucmVuZGVyVGV4dHVyZSA9PSBudWxsICkge1xuXHRcdFx0XHRjYW1lcmEucmVuZGVyVGV4dHVyZSA9IFBJWEkuUmVuZGVyVGV4dHVyZS5jcmVhdGUgKCBHcmFwaGljcy53aWR0aCwgR3JhcGhpY3MuaGVpZ2h0LCBQSVhJLlNDQUxFX01PREVTLk5FQVJFU1QsIDEgKTtcblx0XHRcdH1cblxuXHRcdFx0aWYgKCBjYW1lcmEucmVuZGVyVGFyZ2V0ID09IG51bGwgKSB7XG5cdFx0XHRcdGNhbWVyYS5yZW5kZXJUYXJnZXQgPSBuZXcgUElYSS5SZW5kZXJUYXJnZXQgKCBHcmFwaGljcy5fcmVuZGVyZXIuZ2wsIEdyYXBoaWNzLndpZHRoLCBHcmFwaGljcy5oZWlnaHQsIFBJWEkuU0NBTEVfTU9ERVMuTkVBUkVTVCApO1xuXHRcdFx0fVxuXHRcdFx0XG5cdFx0XHRpZiAoIGNhbWVyYS5yZW5kZXJTcHJpdGUgPT0gbnVsbCApIHtcblx0XHRcdFx0Y2FtZXJhLnJlbmRlclNwcml0ZSA9IG5ldyBQSVhJLlNwcml0ZSAoKTtcblx0XHRcdFx0Y2FtZXJhLnJlbmRlclNwcml0ZS50ZXh0dXJlID0gY2FtZXJhLnJlbmRlclRleHR1cmU7XG5cdFx0XHR9XG5cdFx0XHRcblx0XHRcdC8vIGlmICggY2FtZXJhLmNhbS56b29tICE9PSBjYW1lcmEuem9vbSApIHtcblx0XHRcdC8vIFx0Y2FtZXJhLmNhbS56b29tID0gY2FtZXJhLnpvb207XG5cdFx0XHQvLyB9XG5cdFx0XHRcblx0XHRcdC8vIHJlbW92ZSBhbGxcblx0XHRcdCRhcHAuc3RhZ2UucmVtb3ZlQ2hpbGRyZW4gKCk7XG5cblx0XHRcdC8vIGFkZCBjdXJyZW50IHJlbmRlciBjYW1lcmFcblx0XHRcdCRhcHAuc3RhZ2UuYWRkQ2hpbGQgKCBjYW1lcmEuY2FtICk7XG5cdFx0XHRcblx0XHRcdC8vIGFkZCBjYW1lcmEgcmVuZGVyaW5nIGxheWVyXG5cdFx0XHRmb3IgKCBjb25zdCBsYXllck5hbWUgb2YgY2FtZXJhLnJlbmRlcmluZ0xheWVycyApIHtcblx0XHRcdFx0aWYgKCAkYXBwLnJlbmRlcmluZ0xheWVycy5oYXMgKCBsYXllck5hbWUgKSAgKSB7XG5cdFx0XHRcdFx0bGV0IGxheWVyID0gJGFwcC5yZW5kZXJpbmdMYXllcnMuZ2V0ICggbGF5ZXJOYW1lICk7XG5cdFx0XHRcdFx0aWYgKCBsYXllci52aXNpYmxlICkge1xuXHRcdFx0XHRcdFx0Y2FtZXJhLmNhbS5hZGRDaGlsZCAoIGxheWVyICk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0XHRcblx0XHRcdGlmICggY2FtZXJhLmNhbS5jaGlsZHJlbi5sZW5ndGggPT09IDAgKSB7XG5cdFx0XHRcdGNvbnRpbnVlO1xuXHRcdFx0fVxuXG5cdFx0XHQvLyByZW5kZXJpbmcgc3RhZ2Vcblx0XHRcdC8vIEdyYXBoaWNzLnJlbmRlciAoICRhcHAuc3RhZ2UgKTtcblx0XHRcdEdyYXBoaWNzLnJlbmRlciAoICRhcHAuc3RhZ2UsIGNhbWVyYS5yZW5kZXJUZXh0dXJlLCBjYW1lcmEucmVuZGVyVGFyZ2V0ICk7XG5cblx0XHRcdC8vIHJlbW92ZSBjYW1lcmEgYWxsIHJlbmRlcmluZyBsYXllclxuXHRcdFx0Y2FtZXJhLmNhbS5yZW1vdmVDaGlsZHJlbiAoKTtcblx0XHR9XG5cblx0XHQvLyByZW5kZXIgZmluYWwgcmVzdWx0XG5cdFx0dGhpcy5yZW5kZXJTcHJpdGUucmVtb3ZlQ2hpbGRyZW4gKCk7XG5cdFx0Zm9yICggY29uc3QgY2FtZXJhIG9mIHRoaXMuY2FtZXJhQ29tcG9uZW50cyApIHtcblx0XHRcdHRoaXMucmVuZGVyU3ByaXRlLmFkZENoaWxkICggY2FtZXJhLnJlbmRlclNwcml0ZSApO1xuXHRcdH1cblx0XHRHcmFwaGljcy5fcmVuZGVyZXIucmVuZGVyICggdGhpcy5yZW5kZXJTcHJpdGUgKTtcblx0XHQvLyBHcmFwaGljcy5fcmVuZGVyZXIuZ2wuZmx1c2ggKCk7XG5cdFx0XG5cdFx0R3JhcGhpY3MudGlja0VuZCAoKTtcblx0fVxuXHRcblx0c29ydENhbWVyYURlcHRoICggYSwgYiApIHtcblx0XHRyZXR1cm4gYS5kZXB0aCAtIGIuZGVwdGg7XG5cdH1cbn1cblxuUmVuZGVyaW5nU3lzdGVtLnF1ZXJ5ID0ge1xuXHRoYXM6IFsgJ1RyYW5zZm9ybScsICdDYW1lcmEnIF1cbn07XG5cbmdsb2JhbC5SZW5kZXJpbmdTeXN0ZW0gPSBSZW5kZXJpbmdTeXN0ZW07XG4iLCJjbGFzcyBTcHJpdGVSZW5kZXJpbmdTeXN0ZW0gZXh0ZW5kcyBTeXN0ZW0ge1xuXG5cdGNvbnN0cnVjdG9yICggZWNzICkge1xuXHRcdHN1cGVyICggZWNzICk7XG5cdH1cblxuXHR1cGRhdGUgKCB0aWNrLCBlbnRpdGllcyApIHtcblx0XHRcblx0XHRmb3IgKCBjb25zdCBlbnRpdHkgb2YgZW50aXRpZXMgKSB7XG5cdFx0XHRcblx0XHRcdGlmICggIWVudGl0eS5TcHJpdGUuc3ByaXRlICkge1xuXHRcdFx0XHRsZXQgZmlsZW5hbWUgPSBlbnRpdHkuU3ByaXRlLnJlcy5zdWJzdHJpbmcgKCBlbnRpdHkuU3ByaXRlLnJlcy5sYXN0SW5kZXhPZiAoICcvJyApICsgMSwgZW50aXR5LlNwcml0ZS5yZXMubGVuZ3RoICk7XG5cdFx0XHRcdGxldCBmb2xkZXIgPSBlbnRpdHkuU3ByaXRlLnJlcy5jb250YWlucyAoICcvJyApID8gZW50aXR5LlNwcml0ZS5yZXMuc3Vic3RyaW5nICggMCwgZW50aXR5LlNwcml0ZS5yZXMubGFzdEluZGV4T2YgKCAnLycgKSArIDEgKSA6ICcnO1xuXHRcdFx0XHRlbnRpdHkuU3ByaXRlLnNwcml0ZSA9IG5ldyBTcHJpdGUgKCk7XG5cdFx0XHRcdGVudGl0eS5TcHJpdGUuc3ByaXRlLmJpdG1hcCA9IEltYWdlTWFuYWdlci5sb2FkQml0bWFwICggZm9sZGVyLCBmaWxlbmFtZSwgMCwgZmFsc2UgKTtcblx0XHRcdFx0ZW50aXR5LlNwcml0ZS5zcHJpdGUuc2V0RnJhbWUgKCBlbnRpdHkuU3ByaXRlLmZyYW1lLngsIGVudGl0eS5TcHJpdGUuZnJhbWUueSwgZW50aXR5LlNwcml0ZS5mcmFtZS53aWR0aCwgZW50aXR5LlNwcml0ZS5mcmFtZS5oZWlnaHQgKTtcblx0XHRcdFx0aWYgKCAkYXBwLnJlbmRlcmluZ0xheWVycy5oYXMgKCBlbnRpdHkuU3ByaXRlLmxheWVyICkgKSB7XG5cdFx0XHRcdFx0JGFwcC5yZW5kZXJpbmdMYXllcnMuZ2V0ICggZW50aXR5LlNwcml0ZS5sYXllciApLmFkZENoaWxkICggZW50aXR5LlNwcml0ZS5zcHJpdGUgKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0XG5cdFx0XHRpZiAoIGVudGl0eS5UcmFuc2Zvcm0gJiYgZW50aXR5LlNwcml0ZS5zcHJpdGUgKSB7XG5cdFx0XHRcdGVudGl0eS5TcHJpdGUuc3ByaXRlLnBvc2l0aW9uLnNldCAoIGVudGl0eS5UcmFuc2Zvcm0ucG9zaXRpb24ueCwgZW50aXR5LlRyYW5zZm9ybS5wb3NpdGlvbi55ICk7XG5cdFx0XHRcdC8vIGVudGl0eS5TcHJpdGUuc3ByaXRlLnggPSBlbnRpdHkuVHJhbnNmb3JtLnBvc2l0aW9uLng7XG5cdFx0XHRcdC8vIGVudGl0eS5TcHJpdGUuc3ByaXRlLnkgPSBlbnRpdHkuVHJhbnNmb3JtLnBvc2l0aW9uLnk7XG5cdFx0XHRcdFxuXHRcdFx0XHRsZXQgZW5hYmxlU29ydCA9IGZhbHNlO1xuXHRcdFx0XHRpZiAoIGVudGl0eS5TcHJpdGUuc3ByaXRlLnpJbmRleCAhPT0gZW50aXR5LlNwcml0ZS56SW5kZXggKSB7XG5cdFx0XHRcdFx0ZW50aXR5LlNwcml0ZS5zcHJpdGUuekluZGV4ID0gZW50aXR5LlNwcml0ZS56SW5kZXg7XG5cdFx0XHRcdFx0ZW5hYmxlU29ydCA9IHRydWU7XG5cdFx0XHRcdH1cblx0XHRcdFx0aWYgKCBlbnRpdHkuU3ByaXRlLnNwcml0ZS56T3JkZXIgIT09IGVudGl0eS5TcHJpdGUuek9yZGVyICkge1xuXHRcdFx0XHRcdGVudGl0eS5TcHJpdGUuc3ByaXRlLnpPcmRlciA9IGVudGl0eS5TcHJpdGUuek9yZGVyO1xuXHRcdFx0XHRcdGVuYWJsZVNvcnQgPSB0cnVlO1xuXHRcdFx0XHR9XG5cdFx0XHRcdFxuXHRcdFx0XHRpZiAoIGVuYWJsZVNvcnQgKSB7XG5cdFx0XHRcdFx0JGFwcC5yZW5kZXJpbmdMYXllcnMuZ2V0ICggZW50aXR5LlNwcml0ZS5sYXllciApLmdyb3VwLmVuYWJsZVNvcnQgPSBlbmFibGVTb3J0O1xuXHRcdFx0XHR9XG5cdFx0XHRcdFxuXHRcdFx0XHQvLyBHcmFwaGljcy5fcmVuZGVyZXIucmVuZGVyICggZW50aXR5LlNwcml0ZS5zcHJpdGUgKTtcblx0XHRcdH1cblx0XHR9XG5cdH1cbn1cblxuU3ByaXRlUmVuZGVyaW5nU3lzdGVtLnF1ZXJ5ID0ge1xuXHRoYXM6IFsgJ1RyYW5zZm9ybScsICdTcHJpdGUnIF1cbn07XG5cbmdsb2JhbC5TcHJpdGVSZW5kZXJpbmdTeXN0ZW0gPSBTcHJpdGVSZW5kZXJpbmdTeXN0ZW07XG4iLCJjbGFzcyBUaWxlbWFwTG9hZFN5c3RlbSBleHRlbmRzIFN5c3RlbSB7XG5cblx0Y29uc3RydWN0b3IgKCBlY3MgKSB7XG5cdFx0c3VwZXIgKCBlY3MgKTtcblx0fVxuXG5cdHVwZGF0ZSAoIHRpY2ssIGVudGl0aWVzICkge1xuXG5cdFx0Zm9yICggY29uc3QgZW50aXR5IG9mIGVudGl0aWVzICkge1xuXG5cdFx0XHRpZiAoICFlbnRpdHkuVGlsZW1hcC50aWxlbWFwICYmICFlbnRpdHkuVGlsZW1hcC5pc1JlYWR5ICYmICFlbnRpdHkuVGlsZW1hcC5pc0xvYWRpbmcgKSB7XG5cdFx0XHRcdGxldCBjb21wb25lbnQgPSBlbnRpdHkuVGlsZW1hcDtcblx0XHRcdFx0bGV0IGZpbGVuYW1lID0gY29tcG9uZW50LnJlcy5zdWJzdHJpbmcgKCBjb21wb25lbnQucmVzLmxhc3RJbmRleE9mICggJy8nICkgKyAxLCBjb21wb25lbnQucmVzLmxlbmd0aCApO1xuXHRcdFx0XHRsZXQgZm9sZGVyID0gY29tcG9uZW50LnJlcy5jb250YWlucyAoICcvJyApID8gY29tcG9uZW50LnJlcy5zdWJzdHJpbmcgKCAwLCBjb21wb25lbnQucmVzLmxhc3RJbmRleE9mICggJy8nICkgKyAxICkgOiAnJztcblxuXHRcdFx0XHQvLyBUT0RPOiBtb3ZlIHRvIFJlc01hbmFnZXJcblx0XHRcdFx0UElYSS5sb2FkZXJcblx0XHRcdFx0XHQuYWRkICggY29tcG9uZW50LnJlcyApXG5cdFx0XHRcdFx0Ly8gLmVycm9yICggKCBlcnIsIGxvYWRlciwgcmVzb3VyY2UgKSA9PiB7XG5cdFx0XHRcdFx0Ly8gXHRlbnRpdHkuVGlsZW1hcC5pc0xvYWRpbmcgPSBmYWxzZTtcblx0XHRcdFx0XHQvLyB9IClcblx0XHRcdFx0XHQubG9hZCAoICgpID0+IHtcblx0XHRcdFx0XHRcdC8qKlxuXHRcdFx0XHRcdFx0ICogICBQSVhJLmV4dHJhcy5UaWxlZE1hcCgpIGlzIGFuIGV4dGVuZGVkIFBJWEkuQ29udGFpbmVyKClcblx0XHRcdFx0XHRcdCAqICAgc28geW91IGNhbiByZW5kZXIgaXQgcmlnaHQgYXdheVxuXHRcdFx0XHRcdFx0ICovXG5cdFx0XHRcdFx0XHRjb21wb25lbnQudGlsZW1hcCA9IG5ldyBQSVhJLmV4dHJhcy5UaWxlZE1hcCAoIGNvbXBvbmVudC5yZXMgKTtcblx0XHRcdFx0XHRcdGNvbXBvbmVudC5pc1JlYWR5ID0gdHJ1ZTtcblx0XHRcdFx0XHRcdGNvbXBvbmVudC5pc0xvYWRpbmcgPSBmYWxzZTtcblxuXHRcdFx0XHRcdFx0aWYgKCAkYXBwLnJlbmRlcmluZ0xheWVycy5oYXMgKCBjb21wb25lbnQubGF5ZXIgKSApIHtcblx0XHRcdFx0XHRcdFx0JGFwcC5yZW5kZXJpbmdMYXllcnMuZ2V0ICggY29tcG9uZW50LmxheWVyICkuYWRkQ2hpbGQgKCBjb21wb25lbnQudGlsZW1hcCApO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XG5cdFx0XHRcdFx0XHRjb25zb2xlLmxvZzMgKCAnVGlsZWRNYXA6ICcgKyBjb21wb25lbnQucmVzLCAnbG9hZGVkIScgKTtcblx0XHRcdFx0XHR9ICk7XG5cblx0XHRcdFx0Y29tcG9uZW50LmlzTG9hZGluZyA9IHRydWU7XG5cdFx0XHR9XG5cblx0XHRcdGlmICggZW50aXR5LlRyYW5zZm9ybSAmJiBlbnRpdHkuVGlsZW1hcC50aWxlbWFwICkge1xuXHRcdFx0XHRlbnRpdHkuVGlsZW1hcC50aWxlbWFwLnBvc2l0aW9uLnNldCAoIGVudGl0eS5UcmFuc2Zvcm0ucG9zaXRpb24ueCwgZW50aXR5LlRyYW5zZm9ybS5wb3NpdGlvbi55ICk7XG5cblx0XHRcdFx0bGV0IGVuYWJsZVNvcnQgPSBmYWxzZTtcblx0XHRcdFx0aWYgKCBlbnRpdHkuVGlsZW1hcC50aWxlbWFwLnpJbmRleCAhPT0gZW50aXR5LlRpbGVtYXAuekluZGV4ICkge1xuXHRcdFx0XHRcdGVudGl0eS5UaWxlbWFwLnRpbGVtYXAuekluZGV4ID0gZW50aXR5LlRpbGVtYXAuekluZGV4O1xuXHRcdFx0XHRcdGVuYWJsZVNvcnQgPSB0cnVlO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGlmICggZW50aXR5LlRpbGVtYXAudGlsZW1hcC56T3JkZXIgIT09IGVudGl0eS5UaWxlbWFwLnpPcmRlciApIHtcblx0XHRcdFx0XHRlbnRpdHkuVGlsZW1hcC50aWxlbWFwLnpPcmRlciA9IGVudGl0eS5UaWxlbWFwLnpPcmRlcjtcblx0XHRcdFx0XHRlbmFibGVTb3J0ID0gdHJ1ZTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdGlmICggZW5hYmxlU29ydCApIHtcblx0XHRcdFx0XHQkYXBwLnJlbmRlcmluZ0xheWVycy5nZXQgKCBlbnRpdHkuVGlsZW1hcC5sYXllciApLmdyb3VwLmVuYWJsZVNvcnQgPSBlbmFibGVTb3J0O1xuXHRcdFx0XHR9XG5cdFx0XHRcdFxuXHRcdFx0XHQvLyBHcmFwaGljcy5fcmVuZGVyZXIucmVuZGVyICggZW50aXR5LlRpbGVtYXAudGlsZW1hcCApO1xuXHRcdFx0fVxuXHRcdH1cblx0fVxufVxuXG5UaWxlbWFwTG9hZFN5c3RlbS5xdWVyeSA9IHtcblx0aGFzOiBbICdUcmFuc2Zvcm0nLCAnVGlsZW1hcCcgXVxufTtcblxuZ2xvYmFsLlRpbGVtYXBMb2FkU3lzdGVtID0gVGlsZW1hcExvYWRTeXN0ZW07XG4iLCIvLyBzaGltIGZvciB1c2luZyBwcm9jZXNzIGluIGJyb3dzZXJcbnZhciBwcm9jZXNzID0gbW9kdWxlLmV4cG9ydHMgPSB7fTtcblxuLy8gY2FjaGVkIGZyb20gd2hhdGV2ZXIgZ2xvYmFsIGlzIHByZXNlbnQgc28gdGhhdCB0ZXN0IHJ1bm5lcnMgdGhhdCBzdHViIGl0XG4vLyBkb24ndCBicmVhayB0aGluZ3MuICBCdXQgd2UgbmVlZCB0byB3cmFwIGl0IGluIGEgdHJ5IGNhdGNoIGluIGNhc2UgaXQgaXNcbi8vIHdyYXBwZWQgaW4gc3RyaWN0IG1vZGUgY29kZSB3aGljaCBkb2Vzbid0IGRlZmluZSBhbnkgZ2xvYmFscy4gIEl0J3MgaW5zaWRlIGFcbi8vIGZ1bmN0aW9uIGJlY2F1c2UgdHJ5L2NhdGNoZXMgZGVvcHRpbWl6ZSBpbiBjZXJ0YWluIGVuZ2luZXMuXG5cbnZhciBjYWNoZWRTZXRUaW1lb3V0O1xudmFyIGNhY2hlZENsZWFyVGltZW91dDtcblxuZnVuY3Rpb24gZGVmYXVsdFNldFRpbW91dCgpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3NldFRpbWVvdXQgaGFzIG5vdCBiZWVuIGRlZmluZWQnKTtcbn1cbmZ1bmN0aW9uIGRlZmF1bHRDbGVhclRpbWVvdXQgKCkge1xuICAgIHRocm93IG5ldyBFcnJvcignY2xlYXJUaW1lb3V0IGhhcyBub3QgYmVlbiBkZWZpbmVkJyk7XG59XG4oZnVuY3Rpb24gKCkge1xuICAgIHRyeSB7XG4gICAgICAgIGlmICh0eXBlb2Ygc2V0VGltZW91dCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgY2FjaGVkU2V0VGltZW91dCA9IHNldFRpbWVvdXQ7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjYWNoZWRTZXRUaW1lb3V0ID0gZGVmYXVsdFNldFRpbW91dDtcbiAgICAgICAgfVxuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgY2FjaGVkU2V0VGltZW91dCA9IGRlZmF1bHRTZXRUaW1vdXQ7XG4gICAgfVxuICAgIHRyeSB7XG4gICAgICAgIGlmICh0eXBlb2YgY2xlYXJUaW1lb3V0ID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICBjYWNoZWRDbGVhclRpbWVvdXQgPSBjbGVhclRpbWVvdXQ7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjYWNoZWRDbGVhclRpbWVvdXQgPSBkZWZhdWx0Q2xlYXJUaW1lb3V0O1xuICAgICAgICB9XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBjYWNoZWRDbGVhclRpbWVvdXQgPSBkZWZhdWx0Q2xlYXJUaW1lb3V0O1xuICAgIH1cbn0gKCkpXG5mdW5jdGlvbiBydW5UaW1lb3V0KGZ1bikge1xuICAgIGlmIChjYWNoZWRTZXRUaW1lb3V0ID09PSBzZXRUaW1lb3V0KSB7XG4gICAgICAgIC8vbm9ybWFsIGVudmlyb21lbnRzIGluIHNhbmUgc2l0dWF0aW9uc1xuICAgICAgICByZXR1cm4gc2V0VGltZW91dChmdW4sIDApO1xuICAgIH1cbiAgICAvLyBpZiBzZXRUaW1lb3V0IHdhc24ndCBhdmFpbGFibGUgYnV0IHdhcyBsYXR0ZXIgZGVmaW5lZFxuICAgIGlmICgoY2FjaGVkU2V0VGltZW91dCA9PT0gZGVmYXVsdFNldFRpbW91dCB8fCAhY2FjaGVkU2V0VGltZW91dCkgJiYgc2V0VGltZW91dCkge1xuICAgICAgICBjYWNoZWRTZXRUaW1lb3V0ID0gc2V0VGltZW91dDtcbiAgICAgICAgcmV0dXJuIHNldFRpbWVvdXQoZnVuLCAwKTtcbiAgICB9XG4gICAgdHJ5IHtcbiAgICAgICAgLy8gd2hlbiB3aGVuIHNvbWVib2R5IGhhcyBzY3Jld2VkIHdpdGggc2V0VGltZW91dCBidXQgbm8gSS5FLiBtYWRkbmVzc1xuICAgICAgICByZXR1cm4gY2FjaGVkU2V0VGltZW91dChmdW4sIDApO1xuICAgIH0gY2F0Y2goZSl7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICAvLyBXaGVuIHdlIGFyZSBpbiBJLkUuIGJ1dCB0aGUgc2NyaXB0IGhhcyBiZWVuIGV2YWxlZCBzbyBJLkUuIGRvZXNuJ3QgdHJ1c3QgdGhlIGdsb2JhbCBvYmplY3Qgd2hlbiBjYWxsZWQgbm9ybWFsbHlcbiAgICAgICAgICAgIHJldHVybiBjYWNoZWRTZXRUaW1lb3V0LmNhbGwobnVsbCwgZnVuLCAwKTtcbiAgICAgICAgfSBjYXRjaChlKXtcbiAgICAgICAgICAgIC8vIHNhbWUgYXMgYWJvdmUgYnV0IHdoZW4gaXQncyBhIHZlcnNpb24gb2YgSS5FLiB0aGF0IG11c3QgaGF2ZSB0aGUgZ2xvYmFsIG9iamVjdCBmb3IgJ3RoaXMnLCBob3BmdWxseSBvdXIgY29udGV4dCBjb3JyZWN0IG90aGVyd2lzZSBpdCB3aWxsIHRocm93IGEgZ2xvYmFsIGVycm9yXG4gICAgICAgICAgICByZXR1cm4gY2FjaGVkU2V0VGltZW91dC5jYWxsKHRoaXMsIGZ1biwgMCk7XG4gICAgICAgIH1cbiAgICB9XG5cblxufVxuZnVuY3Rpb24gcnVuQ2xlYXJUaW1lb3V0KG1hcmtlcikge1xuICAgIGlmIChjYWNoZWRDbGVhclRpbWVvdXQgPT09IGNsZWFyVGltZW91dCkge1xuICAgICAgICAvL25vcm1hbCBlbnZpcm9tZW50cyBpbiBzYW5lIHNpdHVhdGlvbnNcbiAgICAgICAgcmV0dXJuIGNsZWFyVGltZW91dChtYXJrZXIpO1xuICAgIH1cbiAgICAvLyBpZiBjbGVhclRpbWVvdXQgd2Fzbid0IGF2YWlsYWJsZSBidXQgd2FzIGxhdHRlciBkZWZpbmVkXG4gICAgaWYgKChjYWNoZWRDbGVhclRpbWVvdXQgPT09IGRlZmF1bHRDbGVhclRpbWVvdXQgfHwgIWNhY2hlZENsZWFyVGltZW91dCkgJiYgY2xlYXJUaW1lb3V0KSB7XG4gICAgICAgIGNhY2hlZENsZWFyVGltZW91dCA9IGNsZWFyVGltZW91dDtcbiAgICAgICAgcmV0dXJuIGNsZWFyVGltZW91dChtYXJrZXIpO1xuICAgIH1cbiAgICB0cnkge1xuICAgICAgICAvLyB3aGVuIHdoZW4gc29tZWJvZHkgaGFzIHNjcmV3ZWQgd2l0aCBzZXRUaW1lb3V0IGJ1dCBubyBJLkUuIG1hZGRuZXNzXG4gICAgICAgIHJldHVybiBjYWNoZWRDbGVhclRpbWVvdXQobWFya2VyKTtcbiAgICB9IGNhdGNoIChlKXtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIC8vIFdoZW4gd2UgYXJlIGluIEkuRS4gYnV0IHRoZSBzY3JpcHQgaGFzIGJlZW4gZXZhbGVkIHNvIEkuRS4gZG9lc24ndCAgdHJ1c3QgdGhlIGdsb2JhbCBvYmplY3Qgd2hlbiBjYWxsZWQgbm9ybWFsbHlcbiAgICAgICAgICAgIHJldHVybiBjYWNoZWRDbGVhclRpbWVvdXQuY2FsbChudWxsLCBtYXJrZXIpO1xuICAgICAgICB9IGNhdGNoIChlKXtcbiAgICAgICAgICAgIC8vIHNhbWUgYXMgYWJvdmUgYnV0IHdoZW4gaXQncyBhIHZlcnNpb24gb2YgSS5FLiB0aGF0IG11c3QgaGF2ZSB0aGUgZ2xvYmFsIG9iamVjdCBmb3IgJ3RoaXMnLCBob3BmdWxseSBvdXIgY29udGV4dCBjb3JyZWN0IG90aGVyd2lzZSBpdCB3aWxsIHRocm93IGEgZ2xvYmFsIGVycm9yLlxuICAgICAgICAgICAgLy8gU29tZSB2ZXJzaW9ucyBvZiBJLkUuIGhhdmUgZGlmZmVyZW50IHJ1bGVzIGZvciBjbGVhclRpbWVvdXQgdnMgc2V0VGltZW91dFxuICAgICAgICAgICAgcmV0dXJuIGNhY2hlZENsZWFyVGltZW91dC5jYWxsKHRoaXMsIG1hcmtlcik7XG4gICAgICAgIH1cbiAgICB9XG5cblxuXG59XG52YXIgcXVldWUgPSBbXTtcbnZhciBkcmFpbmluZyA9IGZhbHNlO1xudmFyIGN1cnJlbnRRdWV1ZTtcbnZhciBxdWV1ZUluZGV4ID0gLTE7XG5cbmZ1bmN0aW9uIGNsZWFuVXBOZXh0VGljaygpIHtcbiAgICBpZiAoIWRyYWluaW5nIHx8ICFjdXJyZW50UXVldWUpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBkcmFpbmluZyA9IGZhbHNlO1xuICAgIGlmIChjdXJyZW50UXVldWUubGVuZ3RoKSB7XG4gICAgICAgIHF1ZXVlID0gY3VycmVudFF1ZXVlLmNvbmNhdChxdWV1ZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgcXVldWVJbmRleCA9IC0xO1xuICAgIH1cbiAgICBpZiAocXVldWUubGVuZ3RoKSB7XG4gICAgICAgIGRyYWluUXVldWUoKTtcbiAgICB9XG59XG5cbmZ1bmN0aW9uIGRyYWluUXVldWUoKSB7XG4gICAgaWYgKGRyYWluaW5nKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdmFyIHRpbWVvdXQgPSBydW5UaW1lb3V0KGNsZWFuVXBOZXh0VGljayk7XG4gICAgZHJhaW5pbmcgPSB0cnVlO1xuXG4gICAgdmFyIGxlbiA9IHF1ZXVlLmxlbmd0aDtcbiAgICB3aGlsZShsZW4pIHtcbiAgICAgICAgY3VycmVudFF1ZXVlID0gcXVldWU7XG4gICAgICAgIHF1ZXVlID0gW107XG4gICAgICAgIHdoaWxlICgrK3F1ZXVlSW5kZXggPCBsZW4pIHtcbiAgICAgICAgICAgIGlmIChjdXJyZW50UXVldWUpIHtcbiAgICAgICAgICAgICAgICBjdXJyZW50UXVldWVbcXVldWVJbmRleF0ucnVuKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcXVldWVJbmRleCA9IC0xO1xuICAgICAgICBsZW4gPSBxdWV1ZS5sZW5ndGg7XG4gICAgfVxuICAgIGN1cnJlbnRRdWV1ZSA9IG51bGw7XG4gICAgZHJhaW5pbmcgPSBmYWxzZTtcbiAgICBydW5DbGVhclRpbWVvdXQodGltZW91dCk7XG59XG5cbnByb2Nlc3MubmV4dFRpY2sgPSBmdW5jdGlvbiAoZnVuKSB7XG4gICAgdmFyIGFyZ3MgPSBuZXcgQXJyYXkoYXJndW1lbnRzLmxlbmd0aCAtIDEpO1xuICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID4gMSkge1xuICAgICAgICBmb3IgKHZhciBpID0gMTsgaSA8IGFyZ3VtZW50cy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgYXJnc1tpIC0gMV0gPSBhcmd1bWVudHNbaV07XG4gICAgICAgIH1cbiAgICB9XG4gICAgcXVldWUucHVzaChuZXcgSXRlbShmdW4sIGFyZ3MpKTtcbiAgICBpZiAocXVldWUubGVuZ3RoID09PSAxICYmICFkcmFpbmluZykge1xuICAgICAgICBydW5UaW1lb3V0KGRyYWluUXVldWUpO1xuICAgIH1cbn07XG5cbi8vIHY4IGxpa2VzIHByZWRpY3RpYmxlIG9iamVjdHNcbmZ1bmN0aW9uIEl0ZW0oZnVuLCBhcnJheSkge1xuICAgIHRoaXMuZnVuID0gZnVuO1xuICAgIHRoaXMuYXJyYXkgPSBhcnJheTtcbn1cbkl0ZW0ucHJvdG90eXBlLnJ1biA9IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLmZ1bi5hcHBseShudWxsLCB0aGlzLmFycmF5KTtcbn07XG5wcm9jZXNzLnRpdGxlID0gJ2Jyb3dzZXInO1xucHJvY2Vzcy5icm93c2VyID0gdHJ1ZTtcbnByb2Nlc3MuZW52ID0ge307XG5wcm9jZXNzLmFyZ3YgPSBbXTtcbnByb2Nlc3MudmVyc2lvbiA9ICcnOyAvLyBlbXB0eSBzdHJpbmcgdG8gYXZvaWQgcmVnZXhwIGlzc3Vlc1xucHJvY2Vzcy52ZXJzaW9ucyA9IHt9O1xuXG5mdW5jdGlvbiBub29wKCkge31cblxucHJvY2Vzcy5vbiA9IG5vb3A7XG5wcm9jZXNzLmFkZExpc3RlbmVyID0gbm9vcDtcbnByb2Nlc3Mub25jZSA9IG5vb3A7XG5wcm9jZXNzLm9mZiA9IG5vb3A7XG5wcm9jZXNzLnJlbW92ZUxpc3RlbmVyID0gbm9vcDtcbnByb2Nlc3MucmVtb3ZlQWxsTGlzdGVuZXJzID0gbm9vcDtcbnByb2Nlc3MuZW1pdCA9IG5vb3A7XG5wcm9jZXNzLnByZXBlbmRMaXN0ZW5lciA9IG5vb3A7XG5wcm9jZXNzLnByZXBlbmRPbmNlTGlzdGVuZXIgPSBub29wO1xuXG5wcm9jZXNzLmxpc3RlbmVycyA9IGZ1bmN0aW9uIChuYW1lKSB7IHJldHVybiBbXSB9XG5cbnByb2Nlc3MuYmluZGluZyA9IGZ1bmN0aW9uIChuYW1lKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdwcm9jZXNzLmJpbmRpbmcgaXMgbm90IHN1cHBvcnRlZCcpO1xufTtcblxucHJvY2Vzcy5jd2QgPSBmdW5jdGlvbiAoKSB7IHJldHVybiAnLycgfTtcbnByb2Nlc3MuY2hkaXIgPSBmdW5jdGlvbiAoZGlyKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdwcm9jZXNzLmNoZGlyIGlzIG5vdCBzdXBwb3J0ZWQnKTtcbn07XG5wcm9jZXNzLnVtYXNrID0gZnVuY3Rpb24oKSB7IHJldHVybiAwOyB9O1xuIl19
