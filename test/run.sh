#!/usr/bin/env bash

CDPATH="" # nuked to avoid wonkiness
ROOTDIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." > /dev/null && pwd)"
TEST_FIXTURES="${ROOTDIR}/test/fixtures"
EXIT_STATUS="0"

echo "node @ $(node --version)"

NPM_VERSION=$(npm --version)
echo "npm @ ${NPM_VERSION}"

NPM_FIXTURE="${TEST_FIXTURES}/${NPM_VERSION%%.*}.x"
echo "npm version-specific fixtures dir: ${NPM_FIXTURE}"
echo

# clean install
# re-rerun, no changes
# then install new git dep
# then upgrade new git dep

clean_run() {
    pushd "$1" && \
        git clean -fdx && \
        git checkout . && \
        npm i . && \
        ${ROOTDIR}/bin/shrinkwarp && \
        git diff --no-ext-diff --exit-code npm-shrinkwrap.json

    EXIT_STATUS="$?"
    if [ "$EXIT_STATUS" -ne "0" ]; then
        exit $EXIT_STATUS
    fi
}

manual_diffs() {
    pushd "$1" && \
        git clean -fdx && \
        git checkout . && \
        npm i . && \
        ${ROOTDIR}/bin/shrinkwarp && \
        git diff --no-ext-diff --quiet npm-shrinkwrap.json && \
        npm i -S substack/js-traverse#0.6.5 && \
        ${ROOTDIR}/bin/shrinkwarp && \
        git diff --no-ext-diff npm-shrinkwrap.json && \
        npm i -S substack/js-traverse#0.6.6 && \
        ${ROOTDIR}/bin/shrinkwarp && \
        git diff --no-ext-diff npm-shrinkwrap.json && \
        npm rm -S traverse &&
        git checkout npm-shrinkwrap.json
        # git diff --no-ext-diff --exit-code npm-shrinkwrap.json
}

if [ "$1" = "manual" ]; then
    manual_diffs "${NPM_FIXTURE}/git"
else
    clean_run "${TEST_FIXTURES}/simple" && \
    clean_run "${TEST_FIXTURES}/tarball" && \
    echo "IGNORING GIT FOR NOW"
    # clean_run "${NPM_FIXTURE}/git"
fi
