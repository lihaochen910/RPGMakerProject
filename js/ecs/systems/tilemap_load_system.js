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
