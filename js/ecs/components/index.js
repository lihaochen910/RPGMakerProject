// module.exports = {
// 	ECS: require ( './ecs' ),
// 	System: require ( './system' ),
// 	Component: require ( './component' )
// }

require ( './transform' );
require ( './camera' );
require ( './sprite' );
require ( './tilemap' );
require ( './debug_move' );
require ( './follow_target' );

$ecs.registerAllDefinedComponents = function () {

	console.log ( 'loading components ...' );
	for ( const [key, value] of ComponentExports ) {
	// for ( const name of Object.keys ( ComponentExports ) ) {
		console.log ( `registering ${ key }` );
		SceneManager._ecs.registerComponent ( key, value );
	}
};
