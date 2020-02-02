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
