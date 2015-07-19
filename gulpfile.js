/* global require */
(function() {'use strict';
	var gulp = require('gulp');
	var del = require('del');
	var babel = require('gulp-babel');
	var sass = require('gulp-sass');
	var autoprefixer = require('gulp-autoprefixer');
	var merge = require('merge-stream');
	var plumber = require('gulp-plumber');
	var zip = require('gulp-zip');

	var files = {
		cwd: 'src/**',
		copy: ['*.png', '*.json', '*.html', 'vendor/*.js'],
		babel: ['*.js', '!vendor/*.js'],
		sass: ['*.scss']
	};

	gulp.task('default', ['clean'], function() {
		gulp.start('watch');
	});

	gulp.task('build', function() {
		var babelStream = gulp.src(files.babel, { cwd: files.cwd })
			.pipe(plumber())
			.pipe(babel({ stage: 1, blacklist: ['flow', 'react', 'reactCompat', 'jscript'] }))
			.pipe(plumber.stop());

		var sassStream = gulp.src(files.sass, { cwd: files.cwd })
			.pipe(sass().on('error', sass.logError))
			.pipe(autoprefixer({ browsers: 'Chrome >= 36' }));

		var copyStream = gulp.src(files.copy, { cwd: files.cwd });

		return merge(babelStream, sassStream, copyStream)
			.pipe(gulp.dest('dist'));
	});

	gulp.task('watch', ['build'], function() {
		gulp.watch('src/**', ['build']);
	});

	gulp.task('clean', function(cb) {
		del('dist/*', cb);
	});

	gulp.task('zip', ['build'], function() {
		return gulp.src('dist/**')
			.pipe(zip('GMK.zip'))
			.pipe(gulp.dest('dist'));
	});
})();
