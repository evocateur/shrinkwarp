# shrinkwarp

[![Build Status](https://travis-ci.org/evocateur/shrinkwarp.svg?branch=master)](https://travis-ci.org/evocateur/shrinkwarp)

A script that makes updating `npm-shrinkwrap.json` more deterministic,
which helps avoid the madness of the stock `npm shrinkwrap` experience.

 * `shrinkwarp` removes `from` and `resolved` attributes for all dependencies
 * except for...
     - `git` dependencies, which retain both attributes
     - tarball (`.tgz`, `.tar.gz`, etc) dependencies, which retain `resolved`

**NOTE:** This currently only works with `npm@2`,
due to [this issue](https://github.com/npm/npm/issues/10502) affecting `npm@3`.

This package is a fork of [shonkwrap](https://github.com/skybet/shonkwrap),
which provides a great experience for `npm` 3.x users.

# Install

**WARNING:** Version 2 of this package is intended for `npm` v3.10.7 and above.
If you are still using `npm@2`,
you can continue using version [1.x][] of this package.

```sh
npm install --save-dev shrinkwarp
```

Add a `postshrinkwrap` lifecycle script to your `package.json` scripts hash:

```json
"scripts": {
  "postshrinkwrap": "shrinkwarp"
}
```

# Usage

With the lifecycle script configured,
just use `npm shrinkwrap` normally.
With recent versions of `npm` 3.x,
it will auto-shrinkwrap when passing the `--save`/`-S` flag to `npm install`.

```sh
npm i -S foo-module
npm test
git commit -am "add foo-module"
```

However, installing a dev dependency (with `--save-dev`/`-D`)
will still require a separate call to `npm shrinkwrap --dev`.

```sh
npm i -D foo-dev-module
npm shrinkwrap --dev
npm test
git commit -am "add foo-dev-module"
```

## Options

### `--ignore <module>`

In some cases, you just don't want an optional module shrinkwrapped.
Often, it is due to platform-specific extensions that break builds when run on an incompatible platform.
`npm` does fine with allowing optional dependencies to fail on incompatible platforms,
but it falls down *hard* when those same dependencies are part of the shrinkwrap.

This option will avoid all that pain.
Please use sparingly,
as it is a global block list.

```json
"scripts": {
  "postshrinkwrap": "shrinkwarp --ignore fsevents"
}
```

To ignore multiple modules,
pass multiple flags:

```sh
shrinkwarp --ignore fsevents --ignore otherthing
```

```json
"scripts": {
  "postshrinkwrap": "shrinkwarp --ignore fsevents --ignore otherthing"
}
```

[1.x]: https://github.com/evocateur/shrinkwarp/tree/v1.2.0#install
