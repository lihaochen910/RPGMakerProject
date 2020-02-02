// var pathToDir = path.dirname(pathToFile);
var pathToDir = pathToFile;
if ( pathToFile.indexOf ( '/' ) >= 0 ) {
	pathToDir = path.dirname(pathToFile);
}

function defaultReadFile(name, cb) {
	// fs.readFile(name, { encoding: 'utf8' }, cb);
	readFile(name, cb);
}
