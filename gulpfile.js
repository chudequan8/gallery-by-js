var gulp = require('gulp');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var imagemin = require('gulp-imagemin');
var sourcemaps = require('gulp-sourcemaps');
var del = require('del');


var sass = require('gulp-sass');
var minifyCSS = require('gulp-csso');
var postcss = require('gulp-postcss');
var autoprefixer = require('autoprefixer');

var paths = {
  scripts: ['src/js/**/*.js'],
  images: 'src/img/**/*',
  styles: ['src/css/*.css', 'src/css/*.scss', '!src/css/_config.scss'],
  datas: ['src/data/*.json'],
  fonts: ['src/fonts/**']
};
 
gulp.task('clean:js', function() {
  return del(['dist/js']);
});
 
gulp.task('scripts',['clean:js'], function() {
  // Minify and copy all JavaScript (except vendor scripts) 
  // with sourcemaps all the way down 
  return gulp.src(paths.scripts)
    .pipe(sourcemaps.init())
      .pipe(uglify())
      .pipe(concat('gallery.min.js'))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('dist/js'));
});






gulp.task('clean:css', function() {
  return del(['dist/css']);
});

gulp.task('styles',['clean:css'], function() {
  var plugins = [
    autoprefixer({browsers: ['last 2 version', 'ie >= 8', 'firefox 15']})
  ];
  return gulp.src(paths.styles)
    .pipe(sourcemaps.init())
    .pipe(sass())
    .pipe(postcss(plugins))
    .pipe(minifyCSS())
    .pipe(concat('main.css'))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('dist/css'));
});

// Copy all static images 
gulp.task('images', function() {
  return gulp.src(paths.images)
    // Pass in options to the task 
    .pipe(imagemin({optimizationLevel: 5}))
    .pipe(gulp.dest('dist/img'));
});

gulp.task('datas', function() {
	return gulp.src(paths.datas)
	  .pipe(gulp.dest('dist/data'))
})

gulp.task('fonts', function() {
	return gulp.src(paths.fonts)
	  .pipe(gulp.dest('dist/fonts'))
})
 
// Rerun the task when a file changes 
gulp.task('watch', function() {
  gulp.watch(paths.scripts, ['scripts']);
  gulp.watch(paths.styles, ['styles']);
});
 
// The default task (called when you run `gulp` from cli) 
gulp.task('dev', ['watch', 'scripts', 'styles', 'datas', 'fonts', 'images']);

gulp.task('build', ['scripts', 'styles', 'datas', 'fonts', 'images']);
