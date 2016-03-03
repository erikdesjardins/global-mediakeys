import gulp from 'gulp';
import del from 'del';
import path from 'path';
import source from 'vinyl-source-stream';
import globby from 'globby';
import browserify from 'browserify';
import watchify from 'watchify';
import sass from 'gulp-sass';
import autoprefixer from 'gulp-autoprefixer';
import merge from 'merge-stream';
import zip from 'gulp-zip';

gulp.task('default', ['clean'], () => {
	gulp.start('watch');
});

gulp.task('watch', ['build'], () => {
	gulp.watch('src/**', ['build']);
});

gulp.task('clean', () =>
	del('dist/*')
);

gulp.task('build', ['browserify', 'sass', 'copy']);

const browserifyStreams = globby.sync(['src/js/*.js']).map(file => [
	path.relative('src', file),
	browserify(file, { plugin: [watchify], cache: {}, packageCache: {} })
		.transform('babelify')
]);

gulp.task('browserify', () =>
	merge(
		browserifyStreams.map(([dest, stream]) =>
			stream
				.bundle()
				.on('error', function handler(err) {
					console.error(err.message); // eslint-disable-line no-console
					this.emit('end'); // eslint-disable-line no-invalid-this
				})
				.pipe(source(dest))
		)
	)
		.pipe(gulp.dest('dist'))
);

gulp.task('sass', () =>
	gulp.src(['*.scss'], { cwd: 'src/**' })
		.pipe(sass().on('error', sass.logError))
		.pipe(autoprefixer({ browsers: 'Chrome >= 49' }))
		.pipe(gulp.dest('dist'))
);

gulp.task('copy', () =>
	gulp.src(['*.png', '*.json', '*.html', '*.woff2'], { cwd: 'src/**' })
		.pipe(gulp.dest('dist'))
);

gulp.task('zip', ['build'], () =>
	gulp.src('dist/**')
		.pipe(zip('GMK.zip'))
		.pipe(gulp.dest('dist'))
);
