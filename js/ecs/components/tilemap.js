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
