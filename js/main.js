/// <reference path="rmmv-pixi.d.ts"/>

//=============================================================================
// main.js
//=============================================================================
// $ browserify js/main.js -o js/libs/bundle.js --debug
// $ watchify js/app.js -o js/libs/bundle.js --delay 0 -v -d
// $ browser-sync start –server

// if ( typeof global == "undefined" ) {
// 	const global = window;
// 	console.log0 ( "assgin global to window." )
// }

window.onload = function () {
	$app.run ();
};
