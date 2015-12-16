/**
** This is the configuration for the gulp tasks.
*/

var istanbul = require('browserify-istanbul');
var isparta = require('isparta');

var extend = require('object-assign');

var path = {
    sources: './Sources/',
    sources_tests: './Sources-Tests/',

    index: './Sources/application.html',
    application: './Sources/application.js',
    application_scripts: './Sources/application/**/*.js',
    application_locales: './Sources/locales/*.json',
    application_data: './Sources/application/*.json',
    assets: ['./Sources/assets/**/*'],

    data: './Sources/data/',
};

var dest = {
    folder: './Application/',

    index: 'application.html',
    application: 'application.js',
    presentation: 'application.css',

    documentation: './Documentation/',
    reports: './Target/Reports/',
    releases: './Target/Releases/',
};

// CHECK: JSCS

var jscsCheckConfiguration = {
    sources: [path.sources + '**/*.js', path.sources_tests + '**/*.js', '!' + path.assets],
    configPath: "jscheck.json",
    reporter: "inline",
};

// HINT: JSHINT

var jshintHintConfiguration = {
    sources: [path.sources + '**/*.js', path.sources_tests + '**/*.js', '!' + path.assets],
    options: {
        node: true,
		jasmine: true,
        esnext: true,
        maxlen: 1000,
        strict: false,
    },
    reporter: 'jshint-stylish',
};

// BUILDCSS: LESS

var lessBuildConfiguration = {
    sources: [path.sources + 'application.less'],
    autoprefix: {
        browsers: ['last 2 versions'],
    },
};

// BUILDCSS: MINIFY

var minifyBuildConfiguration = {
    options: {
        advanced: true,
        keepSpecialComments: 0,
    },
}

// BUILDAPPLICATION: BROWSERIFY

var browserifyBuildConfiguration = {
    options: {
        debug: true,
        extensions: ['.js', '.json', '.es6'],
    },
};

// BUILDAPPLICATION: BABELIFY

var babelifyBuildConfiguration = {
    options: {
        extensions: ['.js', '.json', '.es6'],
        presets: ["es2015"],
        sourceMaps: true,
        compact: false,
        plugins: ["transform-runtime"],
    },
};

// BUILDAPPLICATION: UGLIFY

var uglifyBuildConfiguration = {
    options: {
        preserveComments: 'some',
    }
};

// WATCH: BROWSERIFY

var watch_browserify = {
    options: {
        debug: true,
        extensions: ['.js', '.json', '.es6'],
    },
};

// RUN: BROWSERSYNC

var run_browsersync = {
    options: {
        server: {
          baseDir: dest.folder,
          index: dest.index,
        },
        port: 12345,
        browser: "google chrome",
    },
};

// TEST: KARMA

var karmaTestPathForTests = path.sources_tests + '*.spec.js';
var karmaTestPathForTestsData = path.sources_tests + '*.json';

// extend the default build configuration for babelify to let browserify
// perform a babelify transform only on files belonging to the test code
var karmaTestBabelifyConfiguration = extend(babelifyBuildConfiguration, {
    // ignore all but test code
    // this is regex magic to include only files matching '*.spec.js' or '*.test.js'
    'ignore': /^((?!(spec\.js|test\.js)).)*$/
});

karmaTestIstanbulOptions = {
    // ignore all but application code
    ignore: ['**/*.spec.js', '**/*.test.js'],
    // instrument and transpile code using isparta
    // (someday this may be replaced by a transpile feature with istanbul)
    instrumenter: isparta,
    instrumenterConfig: {
        includeUntested: true,
    },
    instrumenterOptions: {
        isparta: { babel : babelifyBuildConfiguration }
    },
    defaultIgnore: true,
    babel: {},
}

// configure browserify to transform all test code using babelify
// and use istanbul and isparta to instrument all application code
// (this includes a transformation of the code using babel)
var karmaTestBrowserifyConfiguration = {
    debug: true,
    transform: [
        // use istanbul to transform application code for coverage report
       istanbul(karmaTestIstanbulOptions),
        // transpile test code
        ['babelify', karmaTestBabelifyConfiguration.options],
    ],
};

var karmaTestPreprocessors = {};
karmaTestPreprocessors[path.application] = ['browserify', 'sourcemap', 'coverage'];
karmaTestPreprocessors[path.application_scripts] = ['browserify', 'sourcemap', 'coverage'];
karmaTestPreprocessors[karmaTestPathForTests] = ['browserify', 'sourcemap'];

var karmaTestConfiguration = {
    options: {
        logLevel: 'INFO',
        basePath: process.cwd(),
        frameworks: ['browserify', 'jasmine'],
        browsers: ['Chrome'],
        reporters: ['coverage', 'spec', 'failed'],
        colors: true,
        files: [
            {
                pattern: path.sources + 'assets/scripts/*.js',
                included: true,
                served: true
            },
            {
                pattern: path.application,
                included: false,
                served: false
            },
            {
                pattern: path.application_scripts,
                included: false,
                served: false
            },
            {
                pattern: path.application_data,
                included: false,
                served: true
            },
            {
                pattern: karmaTestPathForTests,
                // already watched by watchify
                watched: false,
                included: true,
                served: true
            },
            {
                pattern: karmaTestPathForTestsData,
                included: false,
                served: true
            }
        ],
        exclude: [
        ],
        preprocessors: karmaTestPreprocessors,
        browserify: karmaTestBrowserifyConfiguration,
        coverageReporter: {
            dir: dest.reports + 'Coverage',
			watermarks: {
				statements: [ 80, 90 ],
				lines: [ 80, 90 ],
				functions: [ 80, 90],
				branches: [ 80, 90 ]
			},
            reporters: [
                {
                    type: 'text',
                },
                {
                    type: 'lcovonly',
                },
                // {
                //     type: 'html',
                // },
            ],
        },
    },
};

// 

module.exports = {
    path: path,
    dest: dest,
    // task: check
    check: {
        jscs: jscsCheckConfiguration,
    },
    // task: hint
    hint: {
        jshint: jshintHintConfiguration,
    },
    // task: build:css
    buildCSS: {
        sources: ['node_modules/normalize.css/normalize.css'],
        less: lessBuildConfiguration,
        minify: minifyBuildConfiguration,
    },
    // task: build:application
    buildApplication: {
        browserify: browserifyBuildConfiguration,
        babelify: babelifyBuildConfiguration,
        uglify: uglifyBuildConfiguration,
    },
    // task: watch
    watch: {
        browserify: watch_browserify,
    },
    // task: run
    run: {
        browsersync: run_browsersync,
    },
    // task: test
    test: {
        karma: karmaTestConfiguration,
    },
};
