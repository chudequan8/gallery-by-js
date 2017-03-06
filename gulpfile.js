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
var connect = require('gulp-connect');

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
 
gulp.task('clean:css', function() {
  return del(['dist/css']);
});

gulp.task('clean:img', function() {
  return del(['dist/img']);
});

gulp.task('clean:datas', function() {
  return del(['dist/data']);
});

gulp.task('clean:fonts', function() {
  return del(['dist/fonts']);
});

gulp.task('styles:dev',['clean:css'], function() {
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
    .pipe(gulp.dest('dist/css'))
    .pipe(connect.reload());
});

gulp.task('styles:dist',['clean:css'], function() {
  var plugins = [
    autoprefixer({browsers: ['last 2 version', 'ie >= 8', 'firefox 15']})
  ];
  return gulp.src(paths.styles)
    .pipe(sass())
    .pipe(postcss(plugins))
    .pipe(minifyCSS())
    .pipe(concat('main.css'))
    .pipe(gulp.dest('dist/css'));
});


gulp.task('scripts:dev',['clean:js'], function() {
  // Minify and copy all JavaScript (except vendor scripts) 
  // with sourcemaps all the way down 
  return gulp.src(paths.scripts)
    .pipe(sourcemaps.init())
    .pipe(uglify())
    .pipe(concat('gallery.min.js'))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('dist/js'))
    .pipe(connect.reload());
});

gulp.task('scripts:dist',['clean:js'], function() {
  return gulp.src(paths.scripts)
    .pipe(uglify())
    .pipe(concat('gallery.min.js'))
    .pipe(gulp.dest('dist/js'));
});


gulp.task('connect:dev', function() {
  connect.server({
    livereload: true
  });
});

gulp.task('connect:dist', function() {
  connect.server();
});

gulp.task('close', function(){
  connect.serverClose();
});


// Rerun the task when a file changes 
gulp.task('watch', function() {
  gulp.watch(paths.scripts, ['scripts:dev']);
  gulp.watch(paths.styles, ['styles:dev']);
});


// The default task (called when you run `gulp` from cli) 
gulp.task('build:dev', ['connect:dev', 'watch', 'scripts:dev', 'styles:dev', 'datas', 'fonts', 'images']);

gulp.task('build:dist', ['scripts:dist', 'styles:dist', 'datas', 'fonts', 'images', 'connect:dist'], function(){
  console.log('Server started http://localhost:8080');
});


// Copy all static images 
gulp.task('images',['clean:img'], function() {
  return gulp.src(paths.images)
    // Pass in options to the task 
    .pipe(imagemin({optimizationLevel: 5}))
    .pipe(gulp.dest('dist/img'));
});

gulp.task('datas',['clean:datas'], function() {
  return gulp.src(paths.datas)
    .pipe(gulp.dest('dist/data'));
});

gulp.task('fonts',['clean:fonts'], function() {
  return gulp.src(paths.fonts)
    .pipe(gulp.dest('dist/fonts'));
});