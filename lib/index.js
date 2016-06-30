var debug = require('debug')('shrinkwarp:cli');

var spawnSync = require('spawn-sync');
var traverse = require('traverse');

var find = require('find-up');
var load = require('load-json-file');
var write = require('write-json-file');

var parseArgs = require('./args');
var cleanDeps = require('./visit');
var depsOnly = require('./sort');

module.exports = main;

function main(argv) {
    debug('starting in %s', process.cwd());

    var parsed = parseArgs(argv);
    var ignored = parsed.ignoreModules;

    var preserved;
    var shrinkwrapFile = find.sync('npm-shrinkwrap.json');
    if (shrinkwrapFile === null) {
        debug('no existing npm-shrinkwrap.json found, skipping preserved traversal');
        preserved = traverse({});
    } else {
        preserved = traverse(load.sync(shrinkwrapFile));
    }

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

    if (shrinkwrapFile === null) {
        debug('finding npm-shrinkwrap.json after initial run');
        shrinkwrapFile = find.sync('npm-shrinkwrap.json');
    }

    debug('cleaning dependency tree');
    var tree = traverse(load.sync(shrinkwrapFile));
    var data = cleanDeps(tree, preserved, ignored);

    debug('rewriting clean shrinkwrap');
    write.sync(shrinkwrapFile, data, {
        sortKeys: depsOnly,
        indent: 2
    });

    debug('finished');
}
