import gulp from 'gulp';
import del from 'del';
import path from 'path';
import source from 'vinyl-source-stream';
import globby from 'globby';
import browserify from 'browserify';
import sass from 'gulp-sass';
import autoprefixer from 'gulp-autoprefixer';
import merge from 'merge-stream';
import zip from 'gulp-zip';
import eslint from 'gulp-eslint';
import scsslint from 'gulp-scss-lint';

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

gulp.task('browserify', async () => {
	const s = merge((await globby(['src/js/*.js'])).map(file =>
		browserify(file)
			.transform('babelify')
			.bundle()
			.on('error', function handler(err) {
				console.error(err.message); // eslint-disable-line no-console
				this.emit('end'); // eslint-disable-line no-invalid-this
			})
			.pipe(source(path.relative('src', file)))
	))
		.pipe(gulp.dest('dist'));

	return new Promise(r => s.on('end', r));
});

gulp.task('sass', () =>
	gulp.src(['*.scss'], { cwd: 'src/**' })
		.pipe(sass().on('error', sass.logError))
		.pipe(autoprefixer({ browsers: 'Chrome >= 45' }))
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

gulp.task('travis', ['eslint', 'scsslint']);

gulp.task('eslint', () =>
	gulp.src(['*.js'], { cwd: 'src/**' })
		.pipe(eslint())
		.pipe(eslint.formatEach())
		.pipe(eslint.failAfterError())
);

gulp.task('scsslint', () =>
	gulp.src(['*.scss'], { cwd: 'src/**' })
		.pipe(scsslint({ maxBuffer: 1024**2 }))
		.pipe(scsslint.failReporter())
);
