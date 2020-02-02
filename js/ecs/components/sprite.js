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
