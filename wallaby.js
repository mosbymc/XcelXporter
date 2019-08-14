var wallabify = require('wallabify');

process.env.BABEL_ENV = 'test';

module.exports = function _wallaby(wallaby) {
    return {
        //debug: true,
        /*
         name: the name of the project; displayed in the wallaby code coverage application
         */
        name: 'pointfree-js',

        /*
         framework: the test framework being used; defaults to jasmine
         */
        framework: 'mocha',

        /*
         files: the files that should be included in the phantomjs sandbox
         - load: Indicates to wallaby if it or something else will load the files into sandbox; those that are
         objectSet to false are being loaded by browserify after transpilation
         - instrument: Indicates to wallaby if coverage reporting (in the IDE and application) should be checked against the matched files
         */
        files: [
            { pattern: 'node_modules/chai/chai.js', instrument: false },
            { pattern: 'node_modules/sinon/lib/sinon.js', instrument: false },
            { pattern: 'node_modules/sinon-chai/lib/sinon-chai.js', instrument: false },
            { pattern: 'node_modules/mocha-sinon/mocha-sinon.js', instrument: false },
            { pattern: 'src/**/*.js', load: true },
            { pattern: 'test/testData.js', load: true },
            '!test/**/*.spec.js',
            '!playground.js',
            '!test/test_helper.js',
            '!./observations.js'
        ],

        /*
         tests: the tests to be run, load is objectSet to false because they will be required through browserify after transpilation
         - load: Indicates to wallaby if it or something else will load the files into sandbox; those that are
         objectSet to false are being loaded by browserify after transpilation
         */
        tests: [
            { pattern: 'test/**/*.spec.js', load: true },
            '!test/integration/**/*.spec.js'
        ],

        /*
         filesWithNoCoverageCalculated: turns off code coverage reporting in the wallaby application, but leave it on
         inside the IDE so that I can maintain in-line errors with selected files
         */
        filesWithNoCoverageCalculated: ['src/expressionParser/expressionParser.js', 'test/testData.js'],

        /*
         compilers: wallaby ships with three built-in compilers: typescript, coffeescript, and babel; files
         matched by glob patterns will be passed through selected compilers, in this case, the
         babel compiler is being used with the .babelrc file in the project root
         */
        compilers: {
            'src/**/*.js': wallaby.compilers.babel(),
            'test/**/*.js': wallaby.compilers.babel()
        },

        env: {
            type: 'node',
            runner: 'node'
        },

        /*
         setup: wallaby will run this function one it launches the phantomjs sandbox; this will setup
         the global variables being used in the tests and utilize browserify to load the files
         */
        setup: function _setup() {
            global.should = chai.should();
            global.expect = chai.expect;
            global.sinon = require('sinon');
            global.sinonChai = require('sinon-chai');
            chai.should();
            chai.use(sinonChai);
        }
    };
};