#!/usr/bin/env bash
########################################################################################################################
# This script is intended to be used for documentation content repository PR preview published on public site
# Extra arguments are available to test it for local usage (dev environment, local file browsing, ....)
########################################################################################################################
set -euo pipefail

# Parse arguments
runOnCI=true
extraAntoraArgs=

args="$@"
# if arguments contain '--ci false', don't run 'npm ci'
if [[ "$args" != *"--ci false"* ]]; then
  echo "Assume script is running on CI environment"
  extraAntoraArgs="--fetch"
else
  echo "Assume script is NOT running on CI environment"
  runOnCI=false
fi

# if arguments contain '--type local', use html extension in urls
if [[ "$args" == *"--type local"* ]]; then
  extraAntoraArgs="${extraAntoraArgs} --html-url-extension-style default"
fi
echo "extra Antora Args: ${extraAntoraArgs}"

if [[ $runOnCI == "true" ]]; then
  echo "Using node $(node --version) and npm $(npm --version)"
  npm ci
fi
# See the node script for the list of arguments
node scripts/generate-content-for-preview-antora-playbook.js "$@"

echo "Building preview..."
rm -rf build/
./node_modules/.bin/antora --stacktrace ${extraAntoraArgs} antora-playbook-content-for-preview.yml
echo "Preview built"
