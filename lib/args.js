var debug = require('debug')('shrinkwarp:args');
var nopt = require('nopt');

module.exports = parseArgs;

function parseArgs(argv) {
    debug('received argv', argv);

    var parsed = nopt({
        'ignore': [String, Array]
    }, null, argv);

    // back-compat for unguarded --dev
    if (parsed.argv.remain.length === 0 && parsed.dev) {
        parsed.argv.remain.push('--dev');
        debug('propagated unguarded --dev')
    }

    // create lookup map if modules ignored
    parsed.ignoreModules = {};
    if (parsed.ignore && parsed.ignore.length) {
        parsed.ignore.forEach(function (module) {
            parsed.ignoreModules[module] = true;
        });
        debug('found ignored modules', parsed.ignore);
    }

    debug('parsed', parsed);
    return parsed;
}
