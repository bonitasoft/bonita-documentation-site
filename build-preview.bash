#!/usr/bin/env bash
########################################################################################################################
# This script is intended to be used for documentation content repository PR preview published on public site
# Extra arguments are available to test it for local usage (dev environment, local file browsing, ....)
########################################################################################################################
set -euo pipefail

function usage() {
  launch_command=$(basename "${0}")
  echo "Usage: ${launch_command}"
  echo "  Globals"
  echo "        --help                                  Display this help"
  # most of the arguments in this section are used by the nodejs script
  echo "  Antora configuration"
  echo "        --branch <branch-name>                  When not keeping a single branch by component, the name of the branch to keep"
  echo "        --component <component-name>            When not keeping a single branch by component, the name of the component to keep"
  echo "        --fetch-sources <boolean>               'true': fetch documentation content sources prior building the documentation. Defaults to 'false' (on CI, fetch is always done)"
  echo "        --local-sources <boolean>               'true': use locally checkout sources in a working directory along the one of this project (useful to test local changes without push) , otherwise, use antora cache. Defaults to 'false'"
  echo "        --pr <PR_NUMBER>                        Number of the Pull Request related to the preview (when apply). Used to display context information within the preview."
  echo "        --single-branch-per-repo <boolean>      'true': only keep the latest declared branch for each component, 'false': use all branches. Defaults to 'false'"
  echo "        --site-url <url>                        Custom Url of the site preview. Defaults to the original url defined in the Antora playbook."
  echo "        --type <string>                         If 'local' use html extension in urls to allow local file browsing"

  echo "  Environment configuration"
  echo "        --ci <boolean>                          'false': assume the script is running on local dev machine and don't run some setup commands. Defaults to 'true'"
}


########################################################################################################################
# Parse arguments
########################################################################################################################
runOnCI=true
extraAntoraArgs=

args="$@"

# Help
if [[ "$args" == *"--help"* ]]; then
  usage
  exit 0
fi


# if arguments contain '--ci false', don't run 'npm ci'
if [[ "$args" != *"--ci false"* ]]; then
  echo "Assume script is running on CI environment"
  # force fetch, whatever the cli arguments are
  extraAntoraArgs="--fetch"
else
  echo "Assume script is NOT running on CI environment"
  runOnCI=false
fi

echo "Extra Antora Arguments: ${extraAntoraArgs}"


########################################################################################################################
# PROCESSING
########################################################################################################################
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
