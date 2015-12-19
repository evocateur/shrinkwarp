module.exports = depsOnly;

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
