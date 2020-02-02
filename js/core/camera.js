/*:
// PLUGIN □────────────────────────────────□CAMERA CORE ENGINE□───────────────────────────────┐
* @author □ Jonathan Lepage (dimisterjon),(jonforum) 
* @plugindesc camera 2.5D engine with pixi-projection, all camera events store here
* V.0.1a
* License:© M.I.T
└───────────────────────────────────────────────────────────────────────────────────────────────────┘
*/
// TODO: TODO: CHECK POUR CAMERA 2.5D
/*updateSkew()
{
    this._cx = Math.cos(this._rotation + this.skew._y);
    this._sx = Math.sin(this._rotation + this.skew._y);
    this._cy = -Math.sin(this._rotation - this.skew._x); // cos, added PI/2
    this._sy = Math.cos(this._rotation - this.skew._x); // sin, added PI/2
    this._localID ++;
}*/

//┌------------------------------------------------------------------------------┐
// GLOBAL $camera CLASS: _camera
//└------------------------------------------------------------------------------┘
/**@description camera view-port and culling */
class Camera extends PIXI.Container {
// class Camera extends PIXI.projection.Container2d {

	constructor () {
		/**@description camera viewport contain all the scene */
		super ();
		this.screenWidth = Graphics.width; // 1920
		this.screenHeight = Graphics.height; // 1080;
		this._zoom = 1;
		/**@description far point to affine projections, est pinner a (0.5,0) mais permet detre piner a un objet */
		this.far = new PIXI.Sprite ( PIXI.Texture.WHITE );
		this.far.renderable = false;
		/**@description default for far point factor */
		this._fpf = 0; // far factor
		this._fpX = 0; // x focus 2d projection (debug with arrow)
		this._fpY = 0; // y focus 2d projection (debug with arrow)
		this._fpXLock = true;
		this._fpYLock = true;
		this.lfp = new PIXI.Point ( this.screenWidth / 2, this.screenHeight / 2 ); // far point locked on top screen, laisse come ca pas defaut, utilise _fpX,_fpY
		/**@description screen position, les coordonnées XY centrer du view-port (ecrant) */
		this.sp = new PIXI.Point ( this.screenWidth / 2, this.screenHeight / 2 );
		/**@description target point, les coordonnées XY du target */
		this.tp = new PIXI.Point ();

		this.scene = null; // scene asigneded when camera initialised

		document.onwheel = this.onMouseWheel.bind ( this );
	};

	/**
	 * world coordinates of the right edge of the screen
	 * @type {number}
	 */
	get right () {
		return -this.x / this.scale.x + this.worldScreenWidth;
	}

	set right ( value ) {
		this.x = -value * this.scale.x + this.screenWidth;
		// TODO: reset event.
	}

	/**
	 * world coordinates of the left edge of the screen
	 * @type { number }
	 */
	get left () {
		return -this.x / this.scale.x;
	}

	set left ( value ) {
		this.x = -value * this.scale.x;
		// TODO: reset event.
	}

	/**
	 * world coordinates of the top edge of the screen
	 * @type {number}
	 */
	get top () {
		return -this.y / this.scale.y;
	}

	set top ( value ) {
		this.y = -value * this.scale.y;
		// TODO: reset event.
	}

	/**
	 * world coordinates of the bottom edge of the screen
	 * @type {number}
	 */
	get bottom () {
		return -this.y / this.scale.y + this.worldScreenHeight;
	}

	set bottom ( value ) {
		this.y = -value * this.scale.y + this.screenHeight;
		// TODO: reset event.
	}

	/**
	 * determines whether the viewport is dirty (i.e., needs to be renderered to the screen because of a change)
	 * @type {boolean}
	 */
	get dirty () {
		return this._dirty;
	}

	set dirty ( value ) {
		this._dirty = value;
	}

	set lockCamX ( value ) {
		isNaN ( value ) ? this._fpXLock = value && this._fpX || false : this._fpXLock = value
	}; // $camera.far.toLocal($camera.scene)
	set lockCamY ( value ) {
		isNaN ( value ) ? this._fpYLock = value && this._fpY || false : this._fpYLock = value
	};

	get camToMapX () {
		return this.pivot._x + ( this._sceneW / 2 )
	}; // $camera.toLocal($player.spine,$camera,{x:0,y:0})
	get camToMapY () {
		return this.pivot._y + this._sceneH
	};

	get camToMapX3D () {
		return this.camToMapX - ( this._sceneW / 2 * this._fpf )
	}; // $camera.toLocal($player.spine,$camera,{x:0,y:0})
	get camToMapY3D () {
		return this.camToMapY - ( this._sceneH * this._fpf )
	};

	get distFYSY () {
		return ( this.sp.y - this.far.y )
	}

	get plocal () {
		const point = this.parent.toLocal ( $player.spine, $camera.scene );
		//point.x/=this._zoom//-=this.x//-(this.pivot._x);
		//point.y/=this._zoom//-=this.y//-(this.pivot._y);
		point.x -= ( this.x - this.pivot._x );
		point.y -= ( this.y - this.pivot._y );
		return point;
	};

	get worldScreenWidth () {
		return this.screenWidth / this.scale.x;
	}

	/**
	 * screen height in world coordinates
	 * @type {number}
	 */
	get worldScreenHeight () {
		return this.screenHeight / this.scale.y;
	}

	/**
	 * world width in pixels
	 * @type {number}
	 */
	get worldWidth () {
		if ( this._worldWidth ) {
			return this._worldWidth;
		} else {
			return this.width / this.scale.x;
		}
	}

	set worldWidth ( value ) {
		this._worldWidth = value;
		// TODO: reset event.
	}

	get center () {
		return new PIXI.Point ( this.worldScreenWidth / 2 - this.x / this.scale.x, this.worldScreenHeight / 2 - this.y / this.scale.y );
	}

	set center ( value ) {
		this.moveCenter ( value );
	}

	get zoom () {
		return this._zoom;
	}

	set zoom ( value ) {
		this._zoom = value.clamp ( Camera.MIN_ZOOM, Camera.MAX_ZOOM );
		this.setZoom ( this._zoom, true );
	}

	initialize ( projected ) {

		this._sceneW = scene.background ? scene.background.d.width : this._screenW;
		this._sceneH = scene.background ? scene.background.d.height : this._screenH;
		scene.pivot.set ( this._sceneW / 2, this._sceneH );
		this.position.set ( this._screenW / 2, this._screenH / 2 );

		const far = this.far;
		far.factor = this._fpf; // facteur pour la projection global de la map sur les axe x et y
		far.position.set ( this._screenW / 2, -this._sceneH );
		far.position.__x = far.position._x;
		far.position.__y = far.position._y;
		// $stage.addChild ( far );

		// Listen for animate update
		if ( !this._tickerProjection ) {
			$app.ticker.add ( ( delta ) => {
				this.updateProjection ();
				this.debug ();//TODO: REMOVE ME
			} );
		}

	};

	updateProjection () {
		const far = this.far;
		let pos = this.toLocal ( far.position, undefined, undefined, undefined, PIXI.projection.TRANSFORM_STEP.BEFORE_PROJ );
		pos.y = -pos.y;
		pos.x = -pos.x;
		this.proj.setAxisY ( pos, -far.factor );
		// const objList = $objs.list_master;
		// for ( let i = 0, l = objList.length; i < l; i++ ) {
		// 	const cage = objList[ i ];
		// 	if ( cage.constructor.name === "ContainerSpine" ) {
		// 		cage.d.proj.affine = PIXI.projection.AFFINE.AXIS_X;
		// 	} else {
		// 		if ( !cage.isCase ) { // TODO: add affine method in container car special pour les case
		// 			cage.d.proj.affine = PIXI.projection.AFFINE.AXIS_X;
		// 			cage.n.proj.affine = PIXI.projection.AFFINE.AXIS_X;
		// 		}
		// 	}
		// }
	}

	/** use only for precompute between ticks for get easing camera coord */
	preComputeProjWith ( factor ) {
		//const fp = {x:x,y:y}
		let pos = this.toLocal ( this.far.position, undefined, undefined, undefined, PIXI.projection.TRANSFORM_STEP.BEFORE_PROJ );
		pos.y = -pos.y;
		pos.x = -pos.x;
		this.proj.setAxisY ( pos, -factor );
	}

	updateFarPointFromTarget ( fpX, fpY, fpf ) {
		this.far.x = this.sp.x - ( this.pivot._x * this._zoom ) + ( fpX || this._fpX );
		this.far.y = -( ( this.pivot._y + this._sceneH ) * this._zoom ) + this.sp.y + ( fpY || this._fpY ) + ( ( this._sceneH * this._zoom ) * ( fpf || this.far.factor ) );
	}

	/**
	 * zoom viewport to specific value
	 * @param {number} scale value (e.g., 1 would be 100%, 0.25 would be 25%)
	 * @param {boolean} [center] maintain the same center of the screen after zoom
	 * @return {Camera} this
	 */
	setZoom ( scale, center ) {
		let save;
		if ( center ) {
			save = this.center;
		}
		this.scale.set ( scale );

		if ( center ) {
			this.moveCenter ( save );
		}
		return this;
	}

	resize ( screenWidth = window.innerWidth, screenHeight = window.innerHeight, worldWidth, worldHeight ) {
		this.screenWidth = screenWidth;
		this.screenHeight = screenHeight;
		if ( typeof worldWidth !== 'undefined' ) {
			this._worldWidth = worldWidth;
		}
		if ( typeof worldHeight !== 'undefined' ) {
			this._worldHeight = worldHeight;
		}
		// TODO: reset event.
	}

	moveCenter () {
		let x, y;
		if ( !isNaN ( arguments[ 0 ] ) ) {
			x = arguments[ 0 ];
			y = arguments[ 1 ];
		} else {
			x = arguments[ 0 ].x;
			y = arguments[ 0 ].y;
		}
		this.position.set ( ( this.worldScreenWidth / 2 - x ) * this.scale.x, ( this.worldScreenHeight / 2 - y ) * this.scale.y );
		this.dirty = true;
		return this;
	}

	getVisibleBounds () {
		return new PIXI.Rectangle ( this.left, this.top, this.worldScreenWidth, this.worldScreenHeight )
	}

	/**
	 * change coordinates from screen to world
	 * @param {(number|PIXI.Point)} x or point
	 * @param {number} [y]
	 * @return {PIXI.Point}
	 */
	toWorld ( x, y ) {
		if ( arguments.length === 2 ) {
			return this.toLocal ( new PIXI.Point ( x, y ) );
		} else {
			return this.toLocal ( x );
		}
	}

	/**
	 * change coordinates from world to screen
	 * @param {(number|PIXI.Point)} x or point
	 * @param {number} [y]
	 * @return {PIXI.Point}
	 */
	toScreen ( x, y ) {
		if ( arguments.length === 2 ) {
			return this.toGlobal ( new PIXI.Point ( x, y ) );
		} else {
			return this.toGlobal ( x );
		}
	}

	/*onMouseMove(x,y){
		const ra = $player._zoneLimit; // player data allowed for zone limit
		const raX = x>this.screenX && ra || x<0 && -ra || NaN;
		const raY = y>this.screenY && ra || y<0 && -ra || NaN;
	
		// player actived the limit
		if(raX || raY){
			this.targetFocus = 0; 
			$camera.moveFromTarget(raX,raY,4)
	
		}else{ // refocus camera to target
			const rX = (x/$camera.zoom.x)+$camera.position.x ;
			const inX = $player.position().x- $player._width/2;
			const outX = $player.position().x + $player._width/2;
			const inY = $player.position().y- $player._height;
			const outY = $player.position().y
			if(rX>inX && rX<outX){
				this.targetFocus+=1;
				if( this.targetFocus>48){
					$camera.moveFromTarget(0,0,5)
				}
			}else{
				this.targetFocus = 0;
			}
		};
	};*/

	onMouseWheel ( e ) {
		//TODO: isoler le zoom dans un pixi points pour precalculer le resulta final
		const value = e.deltaY > 0 && -Camera.ZOOM_SPEED || Camera.ZOOM_SPEED;
		//if(this._zoom+value>2.5 || this._zoom+value<1 ){return};
		this.zoom += value * $app.deltaTime;
		console.log1 ( this._zoom, value );
		//this.moveToTarget(3);
		//si ya une messageBox event active ?, ajuster le bones camera des bubbles 
		/*if($messages.data){
			$messages.fitMessageToCamera(this.tX,this.tY,this.zoom);
		};*/

	}

	/*onMouseCheckBorderCamera(e){
		e.screenY
		const x = $app.renderer.plugins.interaction.mouse.global.x;
		let xx = 0;
		xx = ((this.screenX/2)-x)/50000;
		$stage.scene.skew.x = xx;
		$Objs.list_master.forEach(obj => {
			obj.skew.x = xx*-1;
		});
		
	};*/

	/**@description debug camera for test pixi-projections, also need move ticker and update to $app update */
	debug () {
		if ( !this._debug ) {
			this._debug = true;
			let debugLine = new PIXI.Graphics ();
			let debugFarPoint = new PIXI.Graphics ();// far point factor line
			const redraw = ( debugLine, debugFarPoint ) => {
				return ( lockX = $camera._fpXLock, lockY = $camera._fpYLock ) => {
					debugLine.lineStyle ( 4, 0xffffff, 1 );
					debugLine.lineStyle ( 6, lockY ? 0xff0000 : 0xffffff, 0.6 ).moveTo ( this._screenW / 2, 0 ).lineTo ( this._screenW / 2, this._screenH ).endFill (); // Vertical line Y
					debugLine.lineStyle ( 6, lockX ? 0xff0000 : 0xffffff, 0.6 ).moveTo ( 0, this._screenH / 2 ).lineTo ( this._screenW, this._screenH / 2 ).endFill ();
					debugLine.beginFill ( 0x000000, 0.6 ).lineStyle ( 2 ).drawRect ( 0, 0, 220, 420 ).endFill (); // debug data square
					debugFarPoint.lineStyle ( 2, 0x000000 ).moveTo ( this._screenW / 2, this._screenH / 2 ).lineTo ( this.far.x, this.far.y ).endFill (); // Vertical line
				};
			}

			this.redrawDebugScreen = redraw ( debugLine, debugFarPoint ); // create closure for redraw
			this.redrawDebugScreen ();

			$stage.addChildAt ( debugLine, 6 );
			$stage.addChildAt ( debugFarPoint, 7 );
			this.far.anchor.set ( 0.5 );
			this.far.alpha = 0.5;
			this.far.tint = 0xff0000;
			this.far.width = 64, this.far.height = 64;
			// add once screen debug

			const [ x, y, px, py, zoom, sceneW, sceneH, camToMapX, camToMapY, camToMapX3D, camToMapY3D, fpX, fpY, fpf, plocal ] = Array.from ( { length: 15 }, () => ( new PIXI.Text ( '', {
				fill: "white",
				fontSize: 20
			} ) ) );
			const v = [ x, y, px, py, zoom, sceneW, sceneH, camToMapX, camToMapY, camToMapX3D, camToMapY3D, fpX, fpY, fpf, plocal ];
			let _margeY = 34, _lastY = 0;
			v.forEach ( vv => {
				vv.y = _lastY;
				_lastY += _margeY;
			} );
			$stage.addChild ( ...v );
			let [ sX, sY, _sx, _sy, ss, ac ] = [ 0, 0, 0, 0, 15, 1 ]; // scroll power and scroll speed
			$app.ticker.add ( ( delta ) => {
				if ( this.moveProgress ) {
					return
				}

				// avoid update when camera set to new pivot point
				x.text = 'x:' + ~~this.x;
				y.text = 'y:' + ~~this.y;
				px.text = 'px:' + ~~this.pivot.x;
				py.text = 'py:' + ~~this.pivot.y;
				zoom.text = 'zoom:' + this._zoom.toFixed ( 3 );
				sceneW.text = 'sceneW:' + this._sceneW;
				sceneH.text = 'sceneH:' + this._sceneH;
				camToMapX.text = 'camToMapX:' + ~~this.camToMapX;
				camToMapY.text = 'camToMapY:' + ~~this.camToMapY;
				camToMapX3D.text = 'camToMapX3D:' + ~~this.camToMapX3D;
				camToMapY3D.text = 'camToMapY3D:' + ~~this.camToMapY3D;
				fpX.text = `fpX:${ ~~this.far.x } : (${ ~~( this.far.x - this.far.position.__x ) })`;
				fpY.text = `fpY:${ ~~this.far.y } : (${ ~~( this.distFYSY ) })`;
				fpf.text = 'fpf:' + this._fpf.toFixed ( 3 ) + '';
				plocal.text = `plocal: [x:${ ~~this.plocal.x } : y:${ ~~this.plocal.y }]`;

				//TODO: ADD ME TO $app core
				//const m =  $mouse;
				//const sW = this._screenW-4, sH = this._screenH-4;
				//let acc = void 0;
				//acc = (m.x<4)?sX-=ac:(m.x>sW)?sX+=ac:acc;
				//acc = (m.y<4)?sY-=ac:(m.y>sH)?sY+=ac:acc;
				//acc? ac+=0.4 : ac = 2;
				//this.pivot.x+=(sX-this.pivot._x)/ss;
				//this.pivot.y+=(sY-this.pivot._y)/ss;
				//if(!this._fpXLock) {
				//    this.far.lockX? this._fpX = (this.far.lockX-this.pivot.x) && delete this.far.lockX : void 0; // update lock from last lock
				//    this.far.x = (this._screenW/2)+this._fpX;
				//}else{
				//    !this.far.lockX? this.far.lockX = this.pivot.x : void 0;
				//    this.far.x = this.sp.x-(this.pivot._x*this._zoom)+this._fpX;
				//}
				//if(this._fpYLock) {
				//    this.far.y = -((this.pivot._y+this._sceneH)*this._zoom)+this.sp.y+this._fpY+((this._sceneH*this._zoom)*this._fpf);
				//} else {
				//    
				//};
				//this.far.factor = this._fpf;

				// line for far point and target lock
				debugFarPoint.clear ().lineStyle ( 3, 0x000000 ).moveTo ( this._screenW / 2, this._screenH / 2 ).lineTo ( this.far.x, this.far.y );

			} );
		}


	}
}

Camera.MIN_ZOOM = 0.05;
Camera.MAX_ZOOM = 10.0;
Camera.ZOOM_SPEED = 5.0;

// document.onwheel = $camera.onMouseWheel.bind ( $camera ); //TODO:
// document.onmousemove = $camera.onMouseCheckBorderCamera.bind($camera); //TODO:
