const gulp = require('gulp');
const browserSync = require('browser-sync').create();

function serve(done) {
    browserSync.init({
        proxy: 'http://localhost:2368',
        port: 3000,
        open: true,
    });
    done();
}

function watch() {
    gulp.watch('**/*.hbs').on('change', browserSync.reload);
    gulp.watch('assets/css/**/*.css').on('change', browserSync.reload);
    gulp.watch('assets/js/**/*.js').on('change', browserSync.reload);
}

exports.dev = gulp.series(serve, watch);
