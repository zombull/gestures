'use strict';

//npm install del gulp gulp-cleanhtml gulp-concat gulp-filter gulp-inject gulp-jshint gulp-minify-css gulp-ng-annotate gulp-sourcemaps gulp-rename gulp-replace gulp-uglify gulp-zip lodash --save-dev

var _ = require('lodash'),
	gulp = require('gulp'),
    sourcemaps = require('gulp-sourcemaps'),
	cleanhtml = require('gulp-cleanhtml'),
	minifycss = require('gulp-minify-css'),
    ngAnnotate = require('gulp-ng-annotate'),
    filter = require('gulp-filter'),
	rename = require('gulp-rename'),
	replace = require('gulp-replace'),
	inject = require('gulp-inject'),
	concat = require('gulp-concat'),
	jshint = require('gulp-jshint'),
	uglify = require('gulp-uglify'),
	zip = require('gulp-zip'),
	del = require('del'),
    messages = require('./app/_locales/en/messages'),
	manifest = require('./app/manifest'),
	bookmarks = require('./app/bookmarks'),
    newtab = require('./app/newtab'),
	options = require('./app/options'),
	background = require('./app/background');

// Clean build directory
gulp.task('clean', function() {
	return del('build');
});

gulp.task('manifest', function() {
	return gulp.src('app/manifest.json')
		.pipe(replace(/"js": \[.*\]/, '"js": [ "js/content.min.js" ]'))
		.pipe(gulp.dest('build'));
});

gulp.task('content', function() {
	var content = _.map(manifest.content_scripts[0].js, function(source) {
		return source.replace('js', 'app/js');
	});

	return gulp.src(content)
		.pipe(concat('content.js'))
		.pipe(gulp.dest('build/js'))
		.pipe(rename('content.min.js'))
		.pipe(uglify())
		.pipe(gulp.dest('build/js'));
});


gulp.task('background', function () {
    var js = gulp.src(background.js)
        .pipe(concat('background.js'))
        .pipe(gulp.dest('build/js'))
        .pipe(rename('background.min.js'))
        .pipe(uglify())
        .pipe(gulp.dest('build/js'));

    return gulp.src('app/background.html')
        .pipe(gulp.dest('build'))
        .pipe(inject(js, {relative: true}))
        .pipe(cleanhtml())
        .pipe(gulp.dest('build'));
});

gulp.task('bookmarks', function () {
    var cssFilter = filter(['*', '!**/*.min.css'], {restore: true });
    var jsFilter = filter(['*', '!**/*.min.js'], {restore: true });

    var css = gulp.src(bookmarks.css)
        .pipe(cssFilter)
        .pipe(concat('bookmarks.css'))
        .pipe(gulp.dest('build/style'))
        .pipe(rename('bookmarks.min.css'))
        .pipe(minifycss())
        .pipe(cssFilter.restore)
        .pipe(gulp.dest('build/style'));

    var js = gulp.src(bookmarks.js)
        .pipe(jsFilter)
        .pipe(concat('bookmarks.js'))
        .pipe(gulp.dest('build/js'))
        .pipe(rename('bookmarks.min.js'))
        .pipe(uglify())
        .pipe(jsFilter.restore)
        .pipe(gulp.dest('build/js'));

    return gulp.src('app/bookmarks.html')
        .pipe(gulp.dest('build'))
        .pipe(inject(css, {relative: true}))
        .pipe(inject(js, {relative: true}))
        .pipe(cleanhtml())
        .pipe(gulp.dest('build'));
});

gulp.task('newtab', function () {
    var cssFilter = filter(['*', '!**/*.min.css'], {restore: true });
    var jsFilter = filter(['*', '!**/*.min.js'], {restore: true });

    var css = gulp.src(newtab.css)
        .pipe(cssFilter)
        .pipe(concat('newtab.css'))
        .pipe(gulp.dest('build/style'))
        .pipe(rename('newtab.min.css'))
        .pipe(minifycss())
        .pipe(cssFilter.restore)
        .pipe(gulp.dest('build/style'));

    var js = gulp.src(newtab.js)
        .pipe(jsFilter)
        .pipe(concat('newtab.js'))
        .pipe(gulp.dest('build/js'))
        .pipe(rename('newtab.min.js'))
        .pipe(uglify())
        .pipe(jsFilter.restore)
        .pipe(gulp.dest('build/js'));

    return gulp.src('app/newtab.html')
        .pipe(gulp.dest('build'))
        .pipe(inject(css, {relative: true}))
        .pipe(inject(js, {relative: true}))
        .pipe(cleanhtml())
        .pipe(gulp.dest('build'));
});

gulp.task('options', function () {
    // For the distributed build, use the supplied minified versions of libraries coming from
    // Bower.  This saves us from having to minify them ourselves and also preserves whatever
    // license is embedded in the source.
    var css = _.map(options.css, function(source) {
        return source.replace(/app\/options\/bower_components\/(.*)\.css/, 'app/options/bower_components/$1.min.css');
    });
    var js = _.map(options.js, function(source) {
        return source.replace(/app\/options\/bower_components\/(.*)\.js/, 'app/options/bower_components/$1.min.js');
    });

    var cssFilter = filter(['*', '!**/*.min.css'], {restore: true });
    var jsFilter = filter(['*', '!**/*.min.js'], {restore: true });

    var css = gulp.src(css)
        .pipe(cssFilter)
        .pipe(concat('options.css'))
        .pipe(gulp.dest('build/style'))
        .pipe(rename('options.min.css'))
        .pipe(minifycss())
        .pipe(cssFilter.restore)
        .pipe(gulp.dest('build/style'));

    var js = gulp.src(js)
        .pipe(jsFilter)
        .pipe(concat('options.js'))
        .pipe(ngAnnotate())
        .pipe(gulp.dest('build/js'))
        .pipe(rename('options.min.js'))
        .pipe(uglify())
        .pipe(jsFilter.restore)
        .pipe(gulp.dest('build/js'));

    return gulp.src('app/options.html')
        .pipe(replace('ng-app', 'ng-strict-di ng-app'))
        .pipe(gulp.dest('build'))                           // Necessary to set the path so injection works correctly.
        .pipe(inject(css, {relative: true}))
        .pipe(inject(js, {relative: true}))
        .pipe(cleanhtml())
        .pipe(gulp.dest('build'));
});

gulp.task('dialogs', function() {
    return gulp.src('app/options/dialogs/*.*')
        .pipe(cleanhtml())
        .pipe(gulp.dest('build/options/dialogs'));
})

// Copy static folders to build directory
gulp.task('img', function() {
	return gulp.src('app/img/**').pipe(gulp.dest('build/img'));
});

gulp.task('_locales', function() {
	return gulp.src('app/_locales/**/*.*').pipe(gulp.dest('build/_locales'));
});

gulp.task('fonts', function() {
    return gulp.src(['app/options/v5_bloques/*.*', 'app/options/material-icons/*.*', '!app/options/**/*.css']).pipe(gulp.dest('build/style'));
})

// Run scripts through JSHint
gulp.task('jshint', function() {
	var jsHintOptions = {
		browser: true,
		eqnull: true,
		globals: { chrome: false },
		globalstrict: true,
		"-W041": false
	};
	return gulp.src('app/js/**/*.js')
		.pipe(jshint(jsHintOptions))
		.pipe(jshint.reporter('default'))
		.pipe(jshint.reporter('fail'));
});

//build ditributable and sourcemaps after other tasks completed
gulp.task('zip', ['manifest', 'content', 'background', 'bookmarks', 'newtab', 'options', 'dialogs', 'img', '_locales', 'fonts'], function() {

    // Filter out non-minified CSS/JS.
    var zipFilter = filter(function (file) {
        return !/\.(css|js(?!on))/.test(file.path) || /\.min\.(css|js(?!on))/.test(file.path);
    });

	//build distributable extension
	return gulp.src('build/**')
        .pipe(zipFilter)
		.pipe(zip(messages.name.message + ' ' + manifest.version + '.zip'))
		.pipe(gulp.dest('build'));
});

// run all tasks after build directory has been cleaned
gulp.task('default', ['clean', 'jshint'], function() {
    gulp.start('zip');
});


gulp.task('background-debug', function() {
    return gulp.src('app/background.html')
    	.pipe(inject(gulp.src(background.js, {read: false}), {relative: true}))
        .pipe(gulp.dest('app'));
});

gulp.task('bookmarks-debug', function() {
    return gulp.src('app/bookmarks.html')
        .pipe(inject(gulp.src(bookmarks.css.concat(bookmarks.js), {read: false}), {relative: true}))
        .pipe(gulp.dest('app'));
});

gulp.task('newtab-debug', function() {
    return gulp.src('app/newtab.html')
    	.pipe(inject(gulp.src(newtab.css.concat(newtab.js), {read: false}), {relative: true}))
        .pipe(gulp.dest('app'));
});

gulp.task('options-debug', function() {
    return gulp.src('app/options.html')
    	.pipe(inject(gulp.src(options.css.concat(options.js), {read: false}), {relative: true}))
        .pipe(gulp.dest('app'));
});

gulp.task('debug', ['background-debug', 'bookmarks-debug', 'newtab-debug', 'options-debug'], function() {

});