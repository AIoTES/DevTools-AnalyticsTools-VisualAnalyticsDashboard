var gulp = require('gulp');
var del = require('del');
var runSequence = require('run-sequence');
var gulpif = require('gulp-if');
var assign = require('lodash.assign');
var concat = require('gulp-concat');
var sass = require('gulp-sass');
var cleanCss = require('gulp-clean-css');
var autoprefixer = require('gulp-autoprefixer');
var minify = require('gulp-minify');
var templateCache = require('gulp-angular-templatecache');
var ngAnnotate = require('gulp-ng-annotate');
var useref = require('gulp-useref');
var liveServer = require("live-server");

var argv = process.argv;
var isRelease = argv.indexOf('--release') > -1;

var srcPaths = {
  sass: ["src/app/**/*.scss", "!src/app/core/scss/partials/**/*.scss"],
  js: ["src/app/**/*.module.js", "src/app/**/*.config.js", "src/app/**/*.js"],
  templates: "src/app/**/*.html",
  assets: ["src/assets/**/*"],
  useref: "src/index.html"
};

var destPaths = {
  build: "dist/build",
  assets: "dist/assets",
  root: "dist/"
};

var sassBuild = function (options) {
  var defaultOptions = {
    src: srcPaths.sass,
    dest: destPaths.build,
    concatOptions: {
      filename: 'app.scss'
    },
    sassOptions: {
      errLogToConsole: true
    },
    autoprefixerOptions: {
      browsers: [
        'last 2 versions',
        'iOS >= 7',
        'Android >= 4',
        'Explorer >= 10',
        'ExplorerMobile >= 11'
      ],
      cascade: false
    },
    cleanCssOptions: {
      keepSpecialComments: 0
    },
    onError: function (err) {
      console.error(err.message);
      this.emit('end'); // Don't kill watch tasks - https://github.com/gulpjs/gulp/issues/259
    }
  };

  options = assign(defaultOptions, options);

  return gulp
    .src(options.src)
    .pipe(concat(options.concatOptions.filename))
    .pipe(sass(options.sassOptions))
    .on('error', options.onError)
    .pipe(autoprefixer(options.autoprefixerOptions))
    .pipe(gulpif(isRelease, cleanCss(options.cleanCssOptions)))
    .pipe(gulp.dest(options.dest));
};

var jsBuild = function (options) {
  var defaultOptions = {
    src: srcPaths.js,
    dest: destPaths.build,
    concatOptions: {
      filename: 'app.js'
    },
    minifyOptions: {
      ext: {
        min: '.js'
      },
      noSource: true
    },
    onError: function (err) {
      console.error(err.message);
      this.emit('end'); // Don't kill watch tasks - https://github.com/gulpjs/gulp/issues/259
    }
  };

  options = assign(defaultOptions, options);

  return gulp
    .src(options.src)
    .pipe(concat(options.concatOptions.filename))
    .pipe(ngAnnotate({ single_quotes: true }))
    .pipe(gulpif(isRelease, minify(options.minifyOptions)))
    .pipe(gulp.dest(options.dest));
};

var templatesBuild = function (options) {
  var defaultOptions = {
    src: srcPaths.templates,
    dest: destPaths.build,
    templateCacheOptions: {
      standalone: true,
      root: 'app'
    },
    minifyOptions: {
      ext: {
        min: '.js'
      },
      noSource: true
    },
    onError: function (err) {
      console.error(err.message);
      this.emit('end'); // Don't kill watch tasks - https://github.com/gulpjs/gulp/issues/259
    }
  };

  options = assign(defaultOptions, options);

  return gulp
    .src(srcPaths.templates)
    .pipe(templateCache(options.templateCacheOptions))
    .pipe(gulpif(isRelease, minify(options.minifyOptions)))
    .pipe(gulp.dest(options.dest));
};

var doCopy = function (options) {
  return gulp
    .src(options.src)
    .pipe(gulp.dest(options.dest));
};

gulp.task('sass', function (done) {
  return sassBuild();
});

gulp.task('templates', function (done) {
  return templatesBuild();
});

gulp.task('js', function (done) {
  return jsBuild();
});

gulp.task('assets', function (done) {
  return doCopy({
    src: srcPaths.assets,
    dest: destPaths.assets
  });
});

gulp.task('useref', function () {
  return gulp.src(srcPaths.useref)
    .pipe(useref())
    .pipe(gulpif(isRelease && '*.js', minify({
      ext: {
        min: '.js'
      },
      noSource: true
    })))
    .pipe(gulp.dest(destPaths.root));
});

gulp.task('watch', function (done) {
  gulp.watch(srcPaths.sass[0],gulp.series( 'sass'));
  gulp.watch(srcPaths.templates, gulp.series( 'templates') );
  gulp.watch(srcPaths.js, gulp.series( 'js'));
  gulp.watch(srcPaths.assets, gulp.series( 'assets'));
  gulp.watch(srcPaths.useref, gulp.series( 'useref'));
  done();
});

gulp.task('clean', function () {
  return del(destPaths.root);
});

gulp.task('build', gulp.series('clean','sass', 'js', 'templates', 'assets' , 'useref', function (done) {
  // gulp.start('useref');
  done();
}));

gulp.task('serve',  gulp.series('build', 'watch', function (done) {
  var params = {
    port: 3100, // Set the server port. Defaults to 8080.
    open: true, // When false, it won't load your browser by default.
    mount: [['/', 'dist']], // Mount a directory to a route.
    logLevel: 0, // 0 = errors only, 1 = some, 2 = lots
  };
  liveServer.start(params);
  done();
}));
