class CameraFollowTargetSystem extends System {

	constructor ( ecs ) {
		super ( ecs );
		this.speed = 0.0;
	}

	update ( tick, entities ) {

		for ( const entity of entities ) {

			if ( !entity.CameraFollowTarget.target ) {
				continue;
			}

			let cameraComponent = entity.Camera;
			let followComponent = entity.CameraFollowTarget;
			let targetPosition = followComponent.target.Transform.position;
			let cameraCenter = cameraComponent.cam.center;
			let x = 0;
			let y = 0;

			this.speed = followComponent.smoothXSpeed;
			x = this.inertialDamp ( cameraCenter.x, targetPosition.x + followComponent.offsetX, followComponent.smoothTimeX );
			followComponent.smoothXSpeed = this.speed;

			this.speed = followComponent.smoothYSpeed;
			y = this.inertialDamp ( cameraCenter.y, targetPosition.y + followComponent.offsetY, followComponent.smoothTimeY );
			followComponent.smoothYSpeed = this.speed;
			
			// console.log2 ( `target: (${entity.Transform.position.x}, ${entity.Transform.position.y}) (${entity.FollowTarget.target.Transform.position.x}, ${entity.FollowTarget.target.Transform.position.y})` );

			cameraComponent.cam.moveCenter ( x, y );
			entity.Transform.position.set ( cameraComponent.cam.position.x, cameraComponent.cam.position.y );
		}
	}

	smoothDamp ( previousValue, targetValue, smoothTime ) {
		let T1 = 0.36 * smoothTime;
		let T2 = 0.64 * smoothTime;
		let x = previousValue - targetValue;
		let newSpeed = this.speed + $app.deltaTime * ( -1 / ( T1 * T2 ) * x - ( T1 + T2 ) / ( T1 * T2 ) * this.speed );
		let newValue = x + $app.deltaTime * this.speed;
		this.speed = newSpeed;
		return targetValue + newValue;
	}

	inertialDamp ( previousValue, targetValue, smoothTime ) {
		let x = previousValue - targetValue;
		let newValue = x + $app.deltaTime * ( -1.0 / smoothTime * x );
		return targetValue + newValue;
	}
}

CameraFollowTargetSystem.query = {
	has: [ 'Transform', 'Camera', 'CameraFollowTarget' ]
};

global.CameraFollowTargetSystem = CameraFollowTargetSystem;
