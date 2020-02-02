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
