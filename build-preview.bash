#!/usr/bin/env bash
########################################################################################################################
# This script is intended to be used for documentation content repository PR preview published on public site
# Extra arguments are available to test it for local usage (dev environment, local file browsing, ....)
########################################################################################################################
set -euo pipefail

# if arguments contain '--ci false', don't run 'npm ci'
args="$@"
if [[ "$args" != *"--ci false"* ]]; then
  echo "Assume script is running on CI environment"
  echo "Using node $(node --version) and npm $(npm --version)"
  npm ci
else
  echo "Assume script is NOT running on CI environment"
fi

# See the node script for the list of arguments
node scripts/generate-doc-content-pr-preview-antora-playbook.js "$@"

echo "Building preview..."
rm -rf build/

extraAntoraArgs=
# if arguments contain '--type local', use html extension in urls
if [[ "$args" == *"--type local"* ]]; then
  extraAntoraArgs="--html-url-extension-style default"
fi
echo "extra Antora Args: ${extraAntoraArgs}"
./node_modules/.bin/antora --stacktrace --fetch ${extraAntoraArgs} antora-playbook-doc-content-pr-preview.yml

echo "Preview built"
