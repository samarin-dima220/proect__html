let preprocessor = 'scss'; 
const { src, dest, parallel, series, watch } = require('gulp');
const gulp = require('gulp');
const del = require('del');
const sass = require('gulp-sass');
const scss = require('gulp-sass');
const less = require('gulp-less');
const autoprefixer = require('gulp-autoprefixer');
const concat = require('gulp-concat');
const csso = require('gulp-csso');
const fileinclude = require('gulp-file-include');
const imagemin = require('gulp-imagemin');
const notify = require('gulp-notify');
const plumber = require('gulp-plumber');
const rename = require('gulp-rename');
const sourcemaps = require('gulp-sourcemaps');
const svgSprite = require('gulp-svg-sprite');
const uglify = require('gulp-uglify');
const fs = require('fs');
const ttf2woff = require('gulp-ttf2woff');
const ttf2woff2 = require('gulp-ttf2woff2');
const pngquant = require('imagemin-pngquant');
const cache = require('gulp-cache'); 
const browserSync = require('browser-sync').create();

function server() {
	browserSync.init({ 
		server: { baseDir: 'dist/' }, 
		notify: false, 
		online: true 
	})
}



function html() {
  return src('src/assets/templates/html/*.html')
  .pipe(plumber({
    errorHandler: notify.onError(function (err) {
      return {
        title: 'Html',
        sound: false,
        message: err.message
      }
    })
  }))
  .pipe(fileinclude({prefix: '@@'}))
  .pipe(dest('./dist/'))
  .pipe(browserSync.stream());
}
function styles() {
  return src('src/assets/templates/' + preprocessor + '/styles.' + preprocessor + '') 
  .pipe(plumber({
    errorHandler: notify.onError(function (err) {
      return {
        title: 'Styles',
        sound: false,
        message: err.message
      }
    })
  }))
  .pipe(sourcemaps.init())
  .pipe(eval(preprocessor)()) 
	.pipe(autoprefixer({ overrideBrowserslist: ['last 10 versions'], grid: true })) 
  .pipe(csso())
  .pipe(rename({suffix: ".min"}))
  .pipe(sourcemaps.write('.'))
  .pipe(dest('dist/assets/templates/css'))
  .pipe(browserSync.stream());
}
function scripts_libs() {
  return src([
    'node_modules/jquery/dist/jquery.js',
    'node_modules/slick-carousel/slick/slick.js',
    'node_modules/magnific-popup/dist/jquery.magnific-popup.js',
  ])
  .pipe(plumber({
    errorHandler: notify.onError(function (err) {
      return {
        title: 'Scripts',
        sound: false,
        message: err.message
      }
    })
  }))
  .pipe(concat('libs.js'))
  .pipe(uglify())
  .pipe(rename({suffix: ".min"}))
  .pipe(dest('dist/assets/templates/js'))
  .pipe(browserSync.stream());
}
function scripts() {
  return src('src/assets/templates/js/**/*.js')
  .pipe(dest('dist/assets/templates/js/'))
}
function css() {
  return src([
    'node_modules/slick-carousel/slick/slick.css',
    'node_modules/magnific-popup/dist/magnific-popup.css',
    'node_modules/normalize.css/normalize.css',
    // 'node_modules/reset.css/reset.css',
  ])
  .pipe(concat('_libs.scss'))
  .pipe(dest('src/assets/templates/scss/'))
  .pipe(browserSync.stream());
}
function images() {
  return src('src/assets/templates/images/**/*.{jpg,jpeg,,png,gif,ico}')
  .pipe(cache(imagemin({ 
    interlaced: true,
    progressive: true,
    svgoPlugins: [{removeViewBox: false}],
    use: [pngquant()]
  })))
.pipe(dest('dist/assets/templates/images'))
.pipe(browserSync.stream());
}

function svgSprites() {
  return src('src/assets/templates/images//**.svg')
		.pipe(svgSprite({
			mode: {
				stack: {
					sprite: "../sprite.svg"
				}
			}
		}))
    .pipe(dest('dist/assets/templates/images'))
    .pipe(browserSync.stream());
}
function fonts() {
  src('src/assets/templates/fonts/**.ttf')
		.pipe(ttf2woff())
		.pipe(dest('dist/assets/templates/fonts/'))
	return src('src/assets/templates/fonts/**.ttf')
		.pipe(ttf2woff2())
		.pipe(dest('dist/assets/templates/fonts/'))
}
function clean() {
  return del(['dist/'])
}
function startWatch() {
  watch('src/assets/templates/html/**/*.html',html);
  watch('src/assets/templates/**/' + preprocessor + '/**/*', styles);
  watch('src/assets/templates/js/**/*.js/' + preprocessor + '/**/*', scripts);
  watch('src/assets/templates/images/**/*.{jpg,jpeg,,png,gif,ico}', images);
  watch('src/assets/templates/fonts/**.ttf', fonts);
  watch('src/assets/templates/images//**.svg', svgSprite);
}
exports.server = server;
exports.html = html;
exports.styles = styles;
exports.scripts = scripts;
exports.scripts_libs = scripts_libs;
exports.css = css;
exports.images = images;
exports.svgSprites = svgSprites;
exports.fonts = fonts;
exports.default = series(clean,html,styles,scripts,scripts_libs,images,svgSprites,css,fonts,parallel(startWatch,server));

