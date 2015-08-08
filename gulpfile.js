/* global require */
(function() {'use strict';
	var gulp = require('gulp');
	var del = require('del');
	var source = require('vinyl-source-stream');
	var buffer = require('vinyl-buffer');
	var globby = require('globby');
	var browserify = require('browserify');
	var babel = require('gulp-babel');
	var sass = require('gulp-sass');
	var autoprefixer = require('gulp-autoprefixer');
	var insert = require('gulp-insert');
	var merge = require('merge-stream');
	var plumber = require('gulp-plumber');
	var zip = require('gulp-zip');

	gulp.task('default', ['clean'], function() {
		gulp.start('watch');
	});

	gulp.task('watch', ['build'], function() {
		gulp.watch('src/**', ['build']);
	});

	gulp.task('clean', function(cb) {
		del('dist/*', cb);
	});

	gulp.task('build', ['babel', 'sass', 'copy'], function(cb) {
		globby(['dist/js/*.js'], function(err, entries) {
			if (err) {
				cb(err);
				return;
			}

			merge(
				entries.map(function(file) {
					return browserify({ entries: [file] })
						.bundle()
						.on('error', function(err) {
							console.error(err.message);
							this.emit('end');
						})
						.pipe(source(file))
						.pipe(buffer());
				})
			)
				.pipe(insert.prepend('"use strict";\n'))
				.pipe(gulp.dest('.'))
				.on('end', del.bind(null, 'dist/js/modules', cb));
		});
	});
	gulp.task('babel', function() {
		return gulp.src(['*.js'], { cwd: 'src/**' })
			.pipe(plumber())
			.pipe(babel({ stage: 1, optional: ['asyncToGenerator', 'runtime'], blacklist: ['strict', 'es6.blockScoping', 'es6.constants', 'es6.forOf', 'flow', 'react', 'reactCompat', 'jscript'] }))
			.pipe(plumber.stop())
			.pipe(gulp.dest('dist'));
	});
	gulp.task('sass', function() {
		return gulp.src(['*.scss'], { cwd: 'src/**' })
			.pipe(sass().on('error', sass.logError))
			.pipe(autoprefixer({ browsers: 'Chrome >= 36' }))
			.pipe(gulp.dest('dist'));
	});
	gulp.task('copy', function() {
		return gulp.src(['*.png', '*.json', '*.html', '*.woff2'], { cwd: 'src/**' })
			.pipe(gulp.dest('dist'));
	});

	gulp.task('zip', ['build'], function() {
		return gulp.src('dist/**')
			.pipe(zip('GMK.zip'))
			.pipe(gulp.dest('dist'));
	});
})();
