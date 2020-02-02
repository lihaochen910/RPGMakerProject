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
