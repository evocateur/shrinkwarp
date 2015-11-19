#!/usr/bin/env bash

# git checkout npm-shrinkwrap.json && shonkwrap && git diff npm-shrinkwrap.json

# clean install
# re-rerun, no changes
# then install new git dep
# then upgrade new git dep

rm -rf node_modules && \
    git checkout package.json npm-shrinkwrap.json && \
    npm i . && \
    shonkwrap && \
    git diff --no-ext-diff --quiet npm-shrinkwrap.json && \
    npm i -S substack/js-traverse#0.6.5 && \
    shonkwrap && \
    git diff --no-ext-diff npm-shrinkwrap.json && \
    npm i -S substack/js-traverse#0.6.6 && \
    shonkwrap && \
    git diff --no-ext-diff npm-shrinkwrap.json
    # git diff --no-ext-diff --exit-code npm-shrinkwrap.json
