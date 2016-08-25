var debug = require('debug')('shrinkwarp:cli');
var path = require('path');

var spawnSync = require('child_process').spawnSync;
var traverse = require('traverse');

var load = require('load-json-file');
var write = require('write-json-file');
var pkgDir = require('pkg-dir');
var exists = require('path-exists');

var parseArgs = require('./args');
var cleanDeps = require('./visit');
var depsOnly = require('./sort');

module.exports = main;

function getShrinkwrapFile() {
    var rootDir = pkgDir.sync();
    if (rootDir === null) {
        console.error('no package.json found'); // eslint-disable-line no-console
        process.exit(1);
    }

    var filePath = path.join(rootDir, 'npm-shrinkwrap.json');
    return exists.sync(filePath) ? filePath : null;
}

function main(argv) {
    debug('starting in %s', process.cwd());

    var parsed = parseArgs(argv);
    var ignored = parsed.ignoreModules;

    var shrinkwrapFile = getShrinkwrapFile();
    if (shrinkwrapFile === null || parsed.force) {
        debug('no existing npm-shrinkwrap.json found, generating...');
        var args = [
            'shrinkwrap',
            '--ignore-scripts',
            '--loglevel=error'
        ].concat(parsed.argv.remain);

        debug('executing `npm %s`', args.join(' '));
        var result = spawnSync('npm', args, {stdio: 'inherit'});

        if (result.status) {
            debug('execution returned non-zero status %d', result.status);
            process.exit(result.status);
        }

        debug('finding npm-shrinkwrap.json after initial run');
        shrinkwrapFile = getShrinkwrapFile();
    }

    debug('cleaning dependency tree');
    var tree = traverse(load.sync(shrinkwrapFile));
    var data = cleanDeps(tree, ignored);

    debug('rewriting clean shrinkwrap');
    write.sync(shrinkwrapFile, data, {
        sortKeys: depsOnly,
        indent: 2
    });

    debug('finished');
}
