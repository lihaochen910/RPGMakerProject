// class TransformComponent extends BaseComponent {
// 	localPosition = glMatrix.vec2.create ();
// 	position = glMatrix.vec2.create ();
// 	rotation = 0.0;
// }

TransformComponent = {
	properties: {
		localPosition: null,
		position: null,
		rotation: 0.0,
		parent: null
	}
};

$ecs.registerComponent ( 'Transform', TransformComponent );
