//=============================================================================
// hack JsExtensions snippet polyfill to class
//=============================================================================
// see: C:\Users\InformatiqueLepage\AppData\Local\Programs\Microsoft VS Code\resources\app\extensions\node_modules\typescript\lib\lib.es5.d.ts
// C:\Users\InformatiqueLepage\Documents\Dev\anft_1.6.1\js\index.d.ts
/**
 * Returns a number whose value is limited to the given range.
 *
 * @method Number.prototype.clamp
 * @param {Number} min The lower boundary
 * @param {Number} max The upper boundary
 * @return {Number} A number in the range (min, max)
 */
Number.prototype.clamp = function ( min, max ) {
	return Math.min ( Math.max ( this, min ), max );
};

/**
 * Returns a modulo value which is always positive.
 *
 * @method Number.prototype.mod
 * @param {Number} n The divisor
 * @return {Number} A modulo value
 */
Number.prototype.mod = function ( n ) {
	return ( ( this % n ) + n ) % n;
};

/**
 * Replaces %1, %2 and so on in the string to the arguments.
 *
 * @method String.prototype.format
 * @param {Any} ...args The objects to format
 * @return {String} A formatted string
 */
String.prototype.format = function () {
	var args = arguments;
	return this.replace ( /%([0-9]+)/g, function ( s, n ) {
		return args[ Number ( n ) - 1 ];
	} );
};

/**
 * Makes a number string with leading zeros.
 *
 * @method String.prototype.padZero
 * @param {Number} length The length of the output string
 * @return {String} A string with leading zeros
 */
String.prototype.padZero = function ( length ) {
	var s = this;
	while ( s.length < length ) {
		s = '0' + s;
	}
	return s;
};

/**
 * Makes a number string with leading zeros.
 *
 * @method Number.prototype.padZero
 * @param {Number} length The length of the output string
 * @return {String} A string with leading zeros
 */
Number.prototype.padZero = function ( length ) {
	return String ( this ).padZero ( length );
};

Object.defineProperties ( Array.prototype, {
	/**
	 * Checks whether the two arrays are same.
	 *
	 * @method Array.prototype.equals
	 * @param {Array} array The array to compare to
	 * @return {Boolean} True if the two arrays are same
	 */
	equals: {
		enumerable: false,
		value: function ( array ) {
			if ( !array || this.length !== array.length ) {
				return false;
			}
			for ( var i = 0; i < this.length; i++ ) {
				if ( this[ i ] instanceof Array && array[ i ] instanceof Array ) {
					if ( !this[ i ].equals ( array[ i ] ) ) {
						return false;
					}
				} else if ( this[ i ] !== array[ i ] ) {
					return false;
				}
			}
			return true;
		}
	},
	/**
	 * Makes a shallow copy of the array.
	 *
	 * @method Array.prototype.clone
	 * @return {Array} A shallow copy of the array
	 */
	clone: {
		enumerable: false,
		value: function () {
			return this.slice ( 0 );
		}
	},
	/**
	 * Checks whether the array contains a given element.
	 *
	 * @method Array.prototype.contains
	 * @param {Any} element The element to search for
	 * @return {Boolean} True if the array contains a given element
	 */
	contains: {
		enumerable: false,
		value: function ( element ) {
			if ( Array.isArray ( element ) ) {
				for ( let i = 0, l = element.length; i < l; i++ ) {
					if ( this.indexOf ( element[ i ] ) >= 0 ) {
						return true
					}
				}
				;
			} else {
				return this.indexOf ( element ) >= 0;
			}
			;
		}
	},
} );

/**
 * Checks whether the string contains a given string.
 *
 * @method String.prototype.contains
 * @param {String} string The string to search for
 * @return {Boolean} True if the string contains a given string
 */
String.prototype.contains = function ( string ) {
	return this.indexOf ( string ) >= 0;
};

/**
 * Generates a random integer in the range or float with precision
 *
 * @static
 * @method Math.randomInt
 * @param {Number} min negative value will allow random negative positive result
 * @param {Number} max
 * @param {Number} precision
 * @return {Number} A random integer
 */
Math.randomFrom = function ( min = 0, max = 1, precision = 0 ) // min and max included
{
	const ranNeg = min < 0 ? ( min *= -1 ) && this.random () >= 0.5 && 1 || -1 : 1;
	return precision ? parseFloat ( Math.min ( min + ( Math.random () * ( max - min ) ), max ).toFixed ( precision ) ) * ranNeg : ~~( Math.random () * ( max - min + 1 ) + min ) * ranNeg;
}

/** calcul la base de luck par multiple 10 */
Math.ranLuckFrom = function ( luck, pass ) // min and max included
{
	const rate = luck / 10; // ex: lck:20 => 2;
	for ( let i = 0, l = luck / 10; i < l; i++ ) {
		const test = this.randomFrom ( 0, 100 );
		if ( test < pass ) {
			return true
		}
		;
	}
	;
	return false;
}

/**
 * remove specific element in array by indexOf
 *
 * @static
 * @method Array.prototype.remove
 * @param {Number} arguments
 * @return {Array}
 */

Object.defineProperty ( Array.prototype, 'remove', {
	value: function () {
		let what, a = arguments, L = a.length, ax;
		while ( L && this.length ) {
			what = a[ --L ];
			while ( ( ax = this.indexOf ( what ) ) !== -1 ) {
				this.splice ( ax, 1 );
			}
		}
		;
		return this;
	},
} );

/**
 * find first avaible slot index in Array
 *
 * @static
 * @method Array.prototype.findEmptyIndex
 * @return {Number}
 */
Array.prototype.findEmptyIndex = function () {
	for ( let i = 0, l = this.length + 1; i < l; i++ ) {
		if ( !this[ i ] ) {
			return i
		}
		;
	}
	;
};

// ajouter un system integrity via hashing
String.prototype.hashCode = function () {
	var hash = 0, i, chr;
	if ( this.length === 0 ) return hash;
	for ( i = 0; i < this.length; i++ ) {
		chr = this.charCodeAt ( i );
		hash = ( ( hash << 5 ) - hash ) + chr;
		hash |= 0; // Convert to 32bit integer
	}
	return hash;
};
