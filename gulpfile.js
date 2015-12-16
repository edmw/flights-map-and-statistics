/*
** This is the definition of the gulp tasks. See 'gulpfile.md'.
*/

var gulp = require('gulp');
var changed = require('gulp-changed');
var rename = require('gulp-rename');
var order = require('gulp-order');
var ignore = require('gulp-ignore');
var concat = require('gulp-concat');
var replace = require('gulp-replace');
var rev = require('gulp-rev');
var count = require('gulp-count');
var util = require('gulp-util');
var cat = require('gulp-cat');
var notify = require('gulp-notify');

var browserify = require('browserify');
var watchify = require('watchify');
var babelify = require('babelify');

var karma = require('karma');

var extend = require('object-assign');

var fs = require('fs');
var filepath = require('path');

var merge = require('merge-stream');
var transform = require('vinyl-transform');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var through = require("through2");

var browsersync = require('browser-sync');

var spawn = require('child_process').spawn;


var production = false;


var path = require('./gulpconfig.js').path;
var dest = require('./gulpconfig.js').dest;


var Logger = (function () {
  var startTime;

  return {
    startToBundle: function(filename) {
      startTime = process.hrtime();
      util.log('Bundling', "'" + util.colors.green(filename) + "'...");
    },
    endToBundle: function() {
      var pretty = require('pretty-hrtime');
      var bundleTime = process.hrtime(startTime);
      util.log('Bundled in', util.colors.magenta(pretty(bundleTime)));
    },
  };
});

var logger = Logger();


function handleErrors() {
  var args = Array.prototype.slice.call(arguments);

  notify.onError({
    title: "Build Error",
    message: "<%= error %>"
  }).apply(this, args);

  this.emit('end');
};


function counter(taskname) {
  return count('<%= files %> processed', {
    title: "........ '" + util.colors.cyan(taskname) + "'"
  });
};


// DEFAULT: print help

gulp.task('help', function() {
    return gulp.src('./gulpfile.md')
        .pipe(cat());
});

gulp.task('default', ['help']);

//

gulp.task('set-production', function(callback) {
  production = true; callback(null);
});


// CHECK

gulp.task('check:js', function() {
  var jscs = require('gulp-jscs');

  var config = require('./gulpconfig.js').check;

  return gulp.src(config.jscs.sources)
    .pipe(jscs({configPath: config.jscs.configPath}))
    .pipe(jscs.reporter(config.jscs.reporter));
});

gulp.task('check', ['check:js']);

// HINT

gulp.task('hint:js', function() {
  var jshint = require('gulp-jshint');

  var config = require('./gulpconfig.js').hint;

  return gulp.src(config.jshint.sources)
    .pipe(jshint(config.jshint.options))
    .pipe(jshint.reporter(config.jshint.reporter));
});

gulp.task('hint', ['hint:js']);


// CLEAN

gulp.task('clean:documentation', function(callback) {
  var del = require('del');

  del.sync([dest.documentation + "**/*"]);
  callback();
});

gulp.task('clean:reports', function(callback) {
  var del = require('del');

  del.sync([dest.reports + "**/*"]);
  callback();
});

gulp.task('clean', function(callback) {
  var del = require('del');

  del.sync([dest.folder + "**/*"]);
  callback();
});


// VERSION

gulp.task('version', function(callback) {
  var version = require('./package.json').version;

  var p;

  p = filepath.parse(dest.application);
  dest.application = p.name + "-" + version + p.ext;

  p = filepath.parse(dest.presentation);
  dest.presentation = p.name + "-" + version + p.ext;

  callback();
});

// COPY RESOURCES

gulp.task('copy',
  ['copy:index', 'copy:assets', 'copy:application-locales', 'copy:application-data']
);

gulp.task('copy:index', ['version'], function() {
  return gulp.src(path.index)
    .pipe(replace(/\{\{\{CSS\}\}\}/g, dest.presentation))
    .pipe(replace(/\{\{\{JS\}\}\}/g, dest.application))
    .pipe(rename(dest.index))
    .pipe(gulp.dest(dest.folder)).pipe(counter('copy:index'));
});

gulp.task('copy:assets', function() {
  return gulp.src(path.assets, { base: path.sources })
    .pipe(changed(dest.folder))
    .pipe(gulp.dest(dest.folder)).pipe(counter('copy:assets'));
});

gulp.task('copy:application-locales', function() {
  return gulp.src(path.application_locales, { base: path.sources })
    .pipe(changed(dest.folder))
    .pipe(gulp.dest(dest.folder)).pipe(counter('copy:application_locales'));
});

gulp.task('copy:application-data', function() {
  return gulp.src(path.application_data, { base: path.sources })
    .pipe(changed(dest.folder))
    .pipe(gulp.dest(dest.folder)).pipe(counter('copy:application_data'));
});



// BUILD

gulp.task('build',
  ['hint', 'copy', 'build:css', 'build:application']
);

// BUILD CSS

gulp.task('build:css', ['version'], function() {
  var less = require('gulp-less');
  var LessPluginAutoPrefix = require('less-plugin-autoprefix');
  var minify = require('gulp-minify-css');
  var base64 = require('gulp-base64');

  var config = require('./gulpconfig.js').buildCSS;

  var autoprefix = new LessPluginAutoPrefix(config.less.autoprefix);

  var lessStream = gulp.src(config.less.sources)
    .pipe(less({ plugins: [autoprefix] })
      .on('error', handleErrors)
    );

  var stream = gulp.src(config.sources);

  if (production) {
    lessStream = lessStream
      .pipe(minify(config.minify.options)
        .on('error', handleErrors)
      )
      .pipe(base64());
    stream = stream
      .pipe(minify(config.minify.options)
        .on('error', handleErrors)
      );
  }

  return merge(stream, lessStream)
    .pipe(order(['normalize.css']))
    .pipe(concat(dest.presentation))
    .pipe(gulp.dest(dest.folder));
});


// BUILD JAVASCRIPT

function application_builder(bundler) {
  var uglify = require('gulp-uglify');
  var sourcemaps = require('gulp-sourcemaps');

  var pkg = require('./package.json');

  var config = require('./gulpconfig.js').buildApplication;

  return function () {
    logger.startToBundle(dest.application);

    var transform_replace_meta = function() {
      var first = true;
      var stream = through.obj(function (buf, enc, next) {
          if (first) {
            this.push(
              new Buffer(
                buf.toString()
                  .replace('__NAME__', pkg.name)
                  .replace('__DESCRIPTION__', pkg.description)
                  .replace('__VERSION__', pkg.version)
                  .replace('__HOMEPAGE__', pkg.homepage)
                  .replace('__LICENSE__', pkg.license)
                )
              );
            first = false;
          }
          else {
            this.push(buf);
          }
          next();
      });
      stream.label = "transform_replace_meta";
      return stream;
    };

    var stream = bundler
     .transform(babelify.configure(config.babelify.options))
     .transform(transform_replace_meta)
      .bundle()
      .on('error', handleErrors);

    stream = stream
      .pipe(source(path.application))
      .pipe(buffer())

    stream = stream
      .pipe(rename(dest.application));

    if (production) {
      stream = stream
        .pipe(sourcemaps.init({ loadMaps: true }))
        .pipe(uglify(config.uglify.options))
        .pipe(sourcemaps.write('./'));
    }

    stream = stream
      .pipe(gulp.dest(dest.folder));

    stream = stream.on('end', function() {
      logger.endToBundle();
    });

    return stream;
  };
}

gulp.task('build:application', ['version'], function() {
  var config = require('./gulpconfig.js').buildApplication;

  var options = config.browserify.options;

  var bundler = browserify(path.application, config.browserify.options);

  var builder = application_builder(bundler);

  return builder();
});


// WATCH

gulp.task('watch', ['build:css'], function() {
  gulp.watch(path.sources + '**/*.less', ['build:css']);

  var config = require('./gulpconfig.js').watch;

  var options = config.browserify.options;
  options['cache'] = {};
  options['packageCache'] = {};

  var bundler = browserify(path.application, options);
  var watcher = watchify(bundler);

  var builder = application_builder(bundler);

  watcher.on('update', builder);

  return builder();
});


// RUN

gulp.task('install:trips', function() {
  var filename = 'trips-aroundtheworld.json';
  if (process.env.DATA_FILENAME !== undefined) {
    filename = process.env.DATA_FILENAME;
  }
  return gulp.src([path.sources + filename])
    .pipe(rename('trips.json'))
    .pipe(gulp.dest(dest.folder)).pipe(counter('install:trips'));
});

gulp.task('run', ['build', 'install:trips'], function () {
  var config = require('./gulpconfig.js').run;

  browsersync.init([dest.folder + '**/**.**'], config.browsersync.options);
});


// RELEASE

gulp.task('release:pack', function(callback) {
  var zip = require('gulp-zip');

  var moment = require('moment');

  var name = require('./package.json').name;
  var version = require('./package.json').version;

  var archiveName
    = [ name, '-', version, "-", moment().format('YYYYMMDDhhmmss'), '.zip' ].join('');

  var supportArchiveStream = gulp.src(dest.folder + '**/*.js.map')
    .pipe(zip('support.zip'));

  var archiveStream = gulp.src(dest.folder + '**/*')
    .pipe(ignore('**/*.js.map'));

  return merge(archiveStream, supportArchiveStream)
    .pipe(zip(archiveName))
    .pipe(gulp.dest(dest.releases));
});

gulp.task('release:build', function(callback) {
  var run = require('run-sequence');
  run(['clean'], ['set-production'], ['build'], callback);
});

gulp.task('release', function(callback) {
  var run = require('run-sequence');
  run(['release:build'], ['release:pack'], callback);
});


// TEST

/* EXPERIMENTAL:
Runs the tests for the application in continuous integration mode.
*/
gulp.task('test:continuous', function() {
  var config = require('./gulpconfig.js').test;

  var options = config.karma.options;

  var server = new karma.Server(options, function() {});
  server.start()
});

gulp.task('test', function() {
  var config = require('./gulpconfig.js').test;

  var options = extend(config.karma.options, {'singleRun': true});

  var server = new karma.Server(options, function() {});
  server.start()
});


// DOC

gulp.task('doc', ['clean:documentation'], function(callback) {
  var command = spawn('./node_modules/.bin/jsdoc', ['-p', '-c', 'jsdoc.json'], {stdio: 'inherit'});
  command.on('close', function(code) {
    callback(code);
  });
});
