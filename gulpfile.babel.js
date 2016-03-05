import gulp from 'gulp';
import zip from 'gulp-zip';

gulp.task('zip', () =>
	gulp.src('dist/**')
		.pipe(zip('GMK.zip'))
		.pipe(gulp.dest('dist'))
);
