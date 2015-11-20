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

```sh
npm install --save-dev shrinkwarp
```

Add a shrinkwrap task to your `package.json` scripts hash:

```json
"scripts": {
  "shrinkwrap": "shrinkwarp"
}
```

If you need to shrinkwrap `devDependencies` as well,
simply add `--dev` to the execution above.

# Usage

When you'd normally type `npm shrinkwrap`, type `npm run shrinkwrap` instead.

```sh
npm i -S foo-module && npm run shrinkwrap
npm test && git commit -am "add foo-module"
```
