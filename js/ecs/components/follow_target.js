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
