var debug = require('debug')('shrinkwarp:visit');
var npa = require('npm-package-arg');

module.exports = cleanDeps;

function cleanDeps(tree, ignored) {
    return tree.forEach(visitor);

    function visitor(node) {
        if (this.parent &&
            this.parent.key === 'dependencies') {
            debug(this.key);

            if (ignored[this.key]) {
                debug('ignoring module');
                this.remove(true);
                if (this.parent.keys.length === 1) {
                    debug('removing empty dependencies block');
                    this.parent.remove();
                }
                return;
            }

            debug(node);
            if (!node.from) {
                debug('already clean');
                return;
            }

            // https://github.com/npm/npm-package-arg#result-object
            var parsed = npa(node.from);
            debug(parsed);

            if (parsed.type === 'git' || parsed.type === 'hosted') {
                // just leave them alone, they're too weird
                debug('ignored type "%s" from "%s"', parsed.type, node.from);
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
