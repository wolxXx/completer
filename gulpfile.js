const { src, dest, series } = require('gulp');
const concat = require('gulp-concat');
const deleteLines = require('gulp-delete-lines');

function concatToDist() {
    return src('./src/*.js')
        .pipe(concat('completer.js'))
        .pipe(dest('./dist'))
        ;
}
function cleanCuttersFromDist() {
    return src('./dist/completer.js')
        .pipe(deleteLines({
            'filters': [
                /cut me/i
            ]
        }))
        .pipe(dest('./dist'))
        ;
}

exports.default = series(concatToDist, cleanCuttersFromDist);