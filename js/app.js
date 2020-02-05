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
