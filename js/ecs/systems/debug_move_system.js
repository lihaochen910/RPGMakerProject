class DebugMoveSystem extends System {

	constructor ( ecs ) {
		super ( ecs );
		
		this.horizontal = 0;
		this.vertical = 0;
		
		document.addEventListener ( 'keydown', ( event ) => {
			if ( event.key == 'w' ) {
				this.vertical = -1;
			}
			if ( event.key == 's' ) {
				this.vertical = 1;
			}
			if ( event.key == 'a' ) {
				this.horizontal = -1;
			}
			if ( event.key == 'd' ) {
				this.horizontal = 1;
			}
		} );

		document.addEventListener ( 'keyup', ( event ) => {
			if ( event.key == 'w' ) {
				this.vertical = 0;
			}
			if ( event.key == 's' ) {
				this.vertical = 0;
			}
			if ( event.key == 'a' ) {
				this.horizontal = 0;
			}
			if ( event.key == 'd' ) {
				this.horizontal = 0;
			}
		} );
	}

	update ( tick, entities ) {

		for ( const entity of entities ) {
			if ( this.horizontal != 0 || this.vertical != 0 ) {
				let position = entity.Transform.position;
				entity.Transform.position.set ( position.x + entity.DebugMove.speedX * this.horizontal * $app.deltaTime, position.y + entity.DebugMove.speedY * this.vertical * $app.deltaTime )

				// console.log1 ( entity.id, 'Debug Move:', entity.Transform.position.x, entity.Transform.position.y );
			}
		}
	}
}

DebugMoveSystem.query = {
	has: [ 'Transform', 'DebugMove' ]
};

global.DebugMoveSystem = DebugMoveSystem;
