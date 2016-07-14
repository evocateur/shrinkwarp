var debug = require('debug')('shrinkwarp:visit');
var npa = require('npm-package-arg');

module.exports = cleanDeps;

function cleanDeps(tree, preserved, ignored) {
    return tree.forEach(visitor);

    function visitor(node) {
        if (this.parent &&
            this.parent.key === 'dependencies') {
            debug('cleaning node "%s"', this.key);

            if (ignored[this.key]) {
                debug('ignoring module');
                this.remove(true);
                if (this.parent.keys.length === 1) {
                    debug('removing empty dependencies block');
                    this.parent.remove();
                }
                return;
            }

            // debug(node);
            debug('node.from = "%s"', node.from);
            if (typeof node.from === 'undefined') {
                throw new Error('do not shrinkwrap with a linked dependency (' + this.key + ')');
            }

            // https://github.com/npm/npm-package-arg#result-object
            var parsed = npa(node.from);
            debug('parsed.type = "%s"', parsed.type);

            if (parsed.type === 'git' || parsed.type === 'hosted') {
                // persist correct 'from' value
                var fromPath = this.path.concat('from');
                if (node.from === node.resolved && preserved.has(fromPath)) {
                    // npm 2 replaces existing 'from' with 'resolved' value
                    // this is idiotic, and needs to be restored from preserved
                    node.from = preserved.get(fromPath);
                    debug('preserved node.from "%s"', node.from);
                }
            } else if (parsed.type === 'remote') {
                // tarball does not need 'from' if it is identical to 'resolved'
                if (parsed.rawSpec === node.resolved) {
                    debug('deleting redundant node.from');
                    delete node.from;
                }
            } else {
                // remove 'from' and 'resolved' with any other type of dependency
                delete node.from;
                delete node.resolved;
            }
        }
    }
}
