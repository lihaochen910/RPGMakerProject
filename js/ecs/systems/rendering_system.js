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
