var gulp = require('gulp');

var sass = require('gulp-sass');
var jshint = require('gulp-jshint');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
var server = require('gulp-express');

gulp.task('styles', function(){
	return gulp.src('client/sass/**/*.scss')
		.pipe(sass().on('error', sass.logError))
		.pipe(gulp.dest('client/css/'));
});

gulp.task('lint', function(){
	return gulp.src('app.js')
		.pipe(jshint())
		.pipe(jshint.reporter('default'));
});

gulp.task('server', function(){
	server.run(['app.js']);
});

gulp.task('watch', function(){
	gulp.watch('app.js', ['lint']);
	gulp.watch('client/sass/**/*.scss',['styles']);

});

gulp.task('default', ['lint','styles','server', 'watch']);



// gulp.task('default')