#!/usr/bin/env bash

# git checkout npm-shrinkwrap.json && shonkwrap && git diff npm-shrinkwrap.json

git checkout . && \
    npm i -S substack/js-traverse#0.6.5 && \
    shonkwrap && \
    git diff npm-shrinkwrap.json
