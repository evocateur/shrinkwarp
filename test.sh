#!/usr/bin/env bash

CDPATH="" # nuked to avoid wonkiness
ROOTDIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" > /dev/null && pwd)"
EXIT_STATUS="0"

npm --version

NPM_VERSION=$(npm --version)
NPM_VERSION="${NPM_VERSION%%.*}"

NPM_FIXTURE="${ROOTDIR}/fixtures/${NPM_VERSION}.x"
echo "using npm version-specific fixtures dir: ${NPM_FIXTURE}"

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

    EXIT_STATUS="$?"
    if [ "$EXIT_STATUS" -ne "0" ]; then
        exit $EXIT_STATUS
    fi
}

manual_diffs() {
    cd "${NPM_FIXTURE}/git"
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
    pushd "${NPM_FIXTURE}/git" && clean_run && \
    pushd "${ROOTDIR}/fixtures/simple" && clean_run && \
    pushd "${ROOTDIR}/fixtures/tarball" && clean_run
fi
