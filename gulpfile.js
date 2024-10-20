const { src, dest } = require('gulp');
const concat = require('gulp-concat');



function defaultTask() {
    return src('./src/*.js')
        .pipe(concat('completer.js'))
        .pipe(dest('./dist'));

    return src('./src/AutocompleteConfiguration.js')
        .pipe(src('./src/Foo.js'))
        .pipe(dest('./dist/'));
}

exports.default = defaultTask