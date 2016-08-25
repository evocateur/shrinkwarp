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

SHRINKWARP_BIN="${ROOTDIR}/bin/shrinkwarp"
NPM_SHRINKWRAP="npm shrinkwrap"

# clean install
# re-rerun, no changes
# then install new git dep
# then upgrade new git dep

clean_run() {
    # clean_run COMMAND IN_DIR
    pushd "$2" && \
        git clean -fdx . && \
        git checkout . && \
        npm i . && \
        "$1" && \
        git diff --no-ext-diff --exit-code npm-shrinkwrap.json expected.json

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
        $SHRINKWARP_BIN && \
        git diff --no-ext-diff --quiet npm-shrinkwrap.json && \
        npm i -S substack/js-traverse#0.6.5 && \
        $SHRINKWARP_BIN && \
        git diff --no-ext-diff npm-shrinkwrap.json && \
        npm i -S substack/js-traverse#0.6.6 && \
        $SHRINKWARP_BIN && \
        git diff --no-ext-diff npm-shrinkwrap.json && \
        npm rm -S traverse &&
        git checkout npm-shrinkwrap.json
        # git diff --no-ext-diff --exit-code npm-shrinkwrap.json
}

if [ "$1" = "manual" ]; then
    manual_diffs "${NPM_FIXTURE}/git"
else
    clean_run $SHRINKWARP_BIN "${TEST_FIXTURES}/simple" && \
    clean_run $NPM_SHRINKWRAP "${TEST_FIXTURES}/simple" && \
    clean_run $NPM_SHRINKWRAP "${TEST_FIXTURES}/tarball" && \
    echo "IGNORING GIT FOR NOW"
    # clean_run $NPM_SHRINKWRAP "${NPM_FIXTURE}/git"
fi
