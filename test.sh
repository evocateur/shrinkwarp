#!/usr/bin/env bash

CDPATH="" # nuked to avoid wonkiness
ROOTDIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" > /dev/null && pwd)"
EXIT_STATUS=0

# git checkout npm-shrinkwrap.json && shonkwrap && git diff npm-shrinkwrap.json

# clean install
# re-rerun, no changes
# then install new git dep
# then upgrade new git dep

clean_run() {
    rm -rf node_modules && \
        git checkout package.json npm-shrinkwrap.json && \
        npm i . && \
        ${ROOTDIR}/shonkwrap && \
        git diff --no-ext-diff --exit-code npm-shrinkwrap.json

    EXIT_STATUS=$?
}

manual_diffs() {
    cd "fixtures/git"
    rm -rf node_modules && \
        git checkout package.json npm-shrinkwrap.json && \
        npm i . && \
        ${ROOTDIR}/shonkwrap && \
        git diff --no-ext-diff --quiet npm-shrinkwrap.json && \
        npm i -S substack/js-traverse#0.6.5 && \
        ${ROOTDIR}/shonkwrap && \
        git diff --no-ext-diff npm-shrinkwrap.json && \
        npm i -S substack/js-traverse#0.6.6 && \
        ${ROOTDIR}/shonkwrap && \
        git diff --no-ext-diff npm-shrinkwrap.json && \
        npm rm -S traverse &&
        git checkout npm-shrinkwrap.json
        # git diff --no-ext-diff --exit-code npm-shrinkwrap.json
}

if [ "$1" = "manual" ]; then
    manual_diffs
else
    pushd "${ROOTDIR}/fixtures/git" && clean_run && \
    pushd "${ROOTDIR}/fixtures/simple" && clean_run && \
    pushd "${ROOTDIR}/fixtures/tarball" && clean_run
fi
