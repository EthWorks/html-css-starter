const { src, dest, watch, parallel, series } = require('gulp');
const sass = require('gulp-sass')(require('sass'));
const sassLint = require('gulp-sass-lint');
const concat = require('gulp-concat');
const browserSync = require('browser-sync').create();
const uglify = require('gulp-uglify-es').default;
const autoprefixer = require('gulp-autoprefixer');
const imagemin = require('gulp-imagemin');
const del = require('del')

function browsersync() {
  browserSync.init({
    server: { baseDir: 'src/' },
    online: true,
  })
}

function clean() {
  return del('dist')
}

function images() {
  return src('src/img/**/*')
    .pipe(imagemin())
    .pipe(dest('dist/img'))
}

function scripts() {
  return src([
    'src/js/main.js',
  ])
    .pipe(concat('main.min.js'))
    .pipe(uglify())
    .pipe(dest('src/js'))
    .pipe(browserSync.stream())
}

function styles() {
  return src('src/sass/**/*.sass')
    .pipe(sassLint({
      files: { ignore: 'src/sass/helpers/_reset.sass' },
      rules: {
        'mixins-before-declarations': 0,
      }
    }))
    .pipe(sassLint.format())
    .pipe(sassLint.failOnError())
    .pipe(sass({ outputStyle: 'compressed' }))
    .pipe(concat('style.min.css'))
    .pipe(autoprefixer({
      overrideBrowserslist: ['last 10 version'],
      grid: true,
    }))
    .pipe(dest('src/css'))
    .pipe(browserSync.stream())
}

function build() {
  return src([
    'src/css/style.min.css',
    'src/fonts/**/*',
    'src/js/main.min.js',
    'src/**/*.html ',
  ], { base: 'src' })
    .pipe(dest('dist'))
}

function watching() {
  watch(['src/sass/**/*.sass'], styles).on('change', browserSync.reload)
  watch(['src/js/**/*.js', '!src/js/main.min.js'], scripts)
  watch(['src/**/*.html']).on('change', browserSync.reload)
}

exports.styles = styles;
exports.watching = watching;
exports.browsersync = browsersync;
exports.scripts = scripts;
exports.images = images;
exports.clean = clean;

exports.build = series(clean, images, build);
exports.default = parallel(clean, images, scripts, styles, browsersync, watching)
