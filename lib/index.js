var debug = require('debug')('shrinkwarp');
debug('starting in %s', process.cwd());

var npa = require('npm-package-arg');
var spawnSync = require('spawn-sync');
var traverse = require('traverse');

var find = require('find-up');
var load = require('load-json-file');
var write = require('write-json-file');

var preserved;

var shrinkwrapFile = find.sync('npm-shrinkwrap.json');
if (shrinkwrapFile === null) {
    debug('no existing npm-shrinkwrap.json found, skipping preserved traversal');
    preserved = traverse({});
} else {
    preserved = traverse(load.sync(shrinkwrapFile));
}

var argv = ['shrinkwrap', '--loglevel=error'].concat(process.argv.slice(2));

debug('executing `npm %s`', argv.join(' '));
var result = spawnSync('npm', argv, {stdio: 'inherit'});

if (result.status) {
    debug('execution returned non-zero status %d', result.status);
    process.exit(result.status);
}

if (shrinkwrapFile === null) {
    debug('finding npm-shrinkwrap.json after initial run');
    shrinkwrapFile = find.sync('npm-shrinkwrap.json');
}

debug('cleaning dependency tree');
var data = traverse(load.sync(shrinkwrapFile)).forEach(cleanDeps);

debug('rewriting clean shrinkwrap');
write.sync(shrinkwrapFile, data, {
    sortKeys: depsOnly,
    indent: 2
});

debug('finished');

function cleanDeps(node) {
    if (this.parent &&
        this.parent.key === 'dependencies') {
        debug('cleaning node "%s"', this.key);
        debug(node);
        // https://github.com/npm/npm-package-arg#result-object
        var parsed = npa(node.from);
        if (parsed.type === 'git' || parsed.type === 'hosted') {
            // persist correct 'from' value
            var fromPath = this.path.concat('from');
            if (node.from === node.resolved && preserved.has(fromPath)) {
                // npm 2 replaces existing 'from' with 'resolved' value
                // this is idiotic, and needs to be restored from preserved
                node.from = preserved.get(fromPath);
            }
        } else if (parsed.type === 'remote') {
            // tarball does not need 'from' if it is identical to 'resolved'
            if (node.from === node.resolved) {
                delete node.from;
            }
        } else {
            // remove 'from' and 'resolved' with any other type of dependency
            delete node.from;
            delete node.resolved;
        }
    }
}

function depsOnly(a, b) {
    if (a === 'name' ||
        a === 'version') {
        return -1;
    }
    if (a === 'dependencies' ||
        b === 'dependencies') {
        // dependencies should always sort last
        return (a === 'dependencies') ? 1 : -1;
    }
    return a.localeCompare(b);
}