/**
 * @fileoverview This file stores global functions that are required by other libraries.
 */

// if ( typeof ( jQuery ) === 'undefined' ) {
// 	throw 'jQuery is required.';
// }

/** Defines the base script directory that all .js files are assumed to be organized under. */
var BASE_DIR = 'js/';
var ROOT_DIR = './';

/**
 * Loads the specified file, outputting it to the <head> HTMLElement.
 *
 * This method mimics the use of using in C# or import in Java, allowing
 * JavaScript files to "load" other JavaScript files that they depend on
 * using a familiar syntax.
 *
 * This method assumes all scripts are under a directory at the root and will
 * append the .js file extension automatically.
 *
 * @param {string} file A file path to load using C#/Java "dot" syntax.
 *
 * Example Usage:
 * imports('core.utils.extensions');
 * This will output: <script type="text/javascript" src="/js/core/utils/extensions.js"></script>
 */
let _require = function ( file ) {

	var fileName = file.substr ( file.lastIndexOf ( '.' ) + 1, file.length );

	// Convert PascalCase name to underscore_separated_name
	var regex = new RegExp ( /([A-Z])/g );
	if ( regex.test ( fileName ) ) {
		var separated = fileName.replace ( regex, ",$1" ).replace ( ',', '' );
		fileName = separated.replace ( /[,]/g, '_' );
	}

	// Remove the original JavaScript file name to replace with underscore version
	file = file.substr ( 0, file.lastIndexOf ( '.' ) );

	// Convert the dot syntax to directory syntax to actually load the file
	if ( file.indexOf ( '.' ) > 0 ) {
		file = file.replace ( /[.]/g, '/' );
	}

	var src = BASE_DIR + file + '/' + fileName.toLowerCase () + '.js';
	var script = document.createElement ( 'script' );
	script.type = 'text/javascript';
	script.src = src;
	script.async = false;
	script.setAttribute ( "async", "false" );
	script.onerror = PluginManager.onError.bind ( this );
	script._url = src;
	var head = document.head;
	head.insertBefore ( script, head.firstChild );
	// document.body.appendChild ( script );

	console.log ( 'require: ' + src );

	// $ ( 'head' ).find ( 'script:last' ).append ( script );
};


let _require_2 = function ( file ) {

	var fileName = file.substr ( file.lastIndexOf ( '.' ) + 1, file.length );

	// Convert PascalCase name to underscore_separated_name
	var regex = new RegExp ( /([A-Z])/g );
	if ( regex.test ( fileName ) ) {
		var separated = fileName.replace ( regex, ",$1" ).replace ( ',', '' );
		fileName = separated.replace ( /[,]/g, '_' );
	}

	// Remove the original JavaScript file name to replace with underscore version
	file = file.substr ( 0, file.lastIndexOf ( '.' ) );

	// Convert the dot syntax to directory syntax to actually load the file
	if ( file.indexOf ( '.' ) > 0 ) {
		file = file.replace ( /[.]/g, '/' );
	}

	var src = BASE_DIR + file + '/' + fileName.toLowerCase () + '.js';

	var request = new XMLHttpRequest ();
	request.open ( 'GET', src, false );  // `false` makes the request synchronous
	request.send ( null );

	var script = document.createElement ( 'script' );
	script.type = 'text/javascript';

	if ( ( request.status == 200 ) && ( request.readyState == 4 ) ) {
		script.text = request.responseText;
	} else {
		console.error ( src + " request.status = " + request.status );
		return;
	}

	script.onerror = PluginManager.onError.bind ( this );
	var head = document.head;
	// head.insertBefore ( script, head.firstChild );
	document.body.appendChild ( script );

	console.log ( 'require: ' + src );
};


let _readFile = function ( url, callback ) {

	// var src = ROOT_DIR + url;
	
	// console.log ( '_readFile:', url, src );
	console.log ( '_readFile:', url );

	var xhr = new XMLHttpRequest ();
	// xhr.responseType = "text";
	xhr.open ( 'GET', url, true );  // `false` makes the request synchronous
	xhr.addEventListener ( "load", () => {
		callback ( null, xhr.responseText );
	} );
	xhr.addEventListener ( "error", ( e ) => {
		console.error ( 'Error on _readFile:', url );
		// callback ( e, null );
	} );
	xhr.send ( null );
};


// TODO: preload
if ( typeof require === 'undefined' ) {
	var require = require || _require;
}

if ( typeof readFile === 'undefined' ) {
	var readFile = readFile || _readFile;
}
