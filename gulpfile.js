const gulp   = require('gulp'),
      concat = require('gulp-concat');
      watch = require('gulp-watch');

gulp.task('stream', function () {
    // Endless stream mode
    return watch('css/**/*.css', { ignoreInitial: false })
        .pipe(gulp.dest('build'));
});

gulp.task('callback', function () {
    // Callback mode, useful if any plugin in the pipeline depends on the `end`/`flush` event
    return watch('css/**/*.css', function () {
        gulp.src('css/**/*.css')
            .pipe(gulp.dest('build'));
    });
});


gulp.task('default', function() {
    return gulp.src([
            'js/inject.js'
        ]).pipe(watch('js/inject.js'))
          .pipe(concat('inject.js'))
          .pipe(gulp.dest('build/'))

});
