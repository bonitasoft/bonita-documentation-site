#!/usr/bin/env bash
########################################################################################################################
# This script is intended to be used for documentation content repository PR preview published on public site
# Extra arguments are available to test it for local usage (dev environment, local file browsing, ....)
########################################################################################################################
set -euo pipefail

function usage() {
  launch_command=$(basename "${0}")
  echo "Usage: ${launch_command} <options>"
  echo "Build the documentation site preview."
  echo ""
  echo "For 'boolean' options, you can only pass the options when you want to set it to 'true'."
  echo "i.e '--force-production-navbar' is equivalent to '--force-production-navbar true'."
  echo ""
  echo "Options priority order for choosing the content of the preview when several options are provided:"
  echo "  - use-all-repositories"
  echo "  - single-branch-per-repo"
  echo "  - use-multi-repositories"
  echo "  - use-test-sources"
  echo "If no specific options: single branch per component"
  echo ""
  echo "Globals"
  echo "      --help                                  Display this help"
  # most of the arguments in this section are used by the nodejs script
  echo "Antora configuration"
  echo "      --branch <branch-name>                  Name of the branch when keeping a single branch per component"
  echo "      --component <component-name>            Name of the component when keeping a single branch per component"
  echo "      --component-with-branches <form>        Components and branches when using 'Multiple Repositories'."
  echo "                                              Pass one argument per component. For instance, --component-with-branches bcd:3.4 --component-with-branches bonita:7.11,2021.1"
  echo "      --default-ui-bundle <parameter>         If set, use the Antora Default UI. If set to 'snapshot', fetch the bundle instead of retrieving it from the cache. Defaults to 'false'"
  echo "      --fail-on-warning <boolean>             If set to 'true', set the Antora 'failure_level' value to fail the build if warnings occur. Defaults to 'false'"
  echo "      --fetch-sources <boolean>               'true': fetch documentation content sources prior building the documentation. Defaults to 'false' (on CI, fetch is always done)"
  echo "      --force-display-search-bar              if the option is set, display the search bar in the preview navbar as in the production one."
  echo "      --force-production-navbar               if the option is set, use the regular navbar instead of the preview one."
  echo "      --hide-edit-page-links <boolean>        'true': hide all edit page links (useful when generating documentation archive). Defaults to 'false'"
  echo "      --hide-navbar-components-list <boolean> 'true': hide components list in navbar. Defaults to 'false'"
  echo "      --ignore-errors <boolean>                If set to 'true', set the Antora 'failure_level' value to not fail the build if errors occur (this option is ignored if 'fail-on-warning' is set to 'true'). Otherwise, use the original value defined in the Antora playbook."
  echo "      --local-sources <boolean>               'true': use locally checkout sources in a working directory along the one of this project (useful to test local changes without push) , otherwise, use antora cache. Defaults to 'false'"
  echo "      --local-ui-bundle <boolean>             'true': use locally build ui bundle whose sources are in a working directory along the one of this project, otherwise, use antora cache. Defaults to 'false'"
  echo "      --log-level <level>                     Set the Antora log level. Defaults to the original value defined in the Antora playbook."
  echo "      --pr <PR_NUMBER>                        Number of the Pull Request related to the preview (when apply). Used to display context information within the preview."
  echo "      --single-branch-per-repo <boolean>      'true': only keep the latest declared branch for each component, 'false': use all branches. Defaults to 'false'"
  echo "      --site-url <url>                        Custom Url of the site preview. If set to 'DISABLED', remove the site.url from the Antora playbook. Defaults to the original url defined in the Antora playbook."
  echo "      --site-title <string>                   Title of the site preview. Use generated title if not set."
  echo "      --start-page <string>                   Start page to be used for the site preview. Syntax is: 'version@component:module:file-coordinate-of-page.adoc', for instance '3.4@bcd::release_notes.adoc' or 'cloud::index.adoc'."
  echo "                                              If not set, use '<component-name>::index.adoc' if the option is set, otherwise use default (latest version of the bonita index page)."
  echo "      --type <string>                         If set to 'local', use html extension in urls to allow local file browsing."
  echo "                                              If set to 'netlify', use the configuration for the whole Netlify environment (for use with the dev server)."
  echo "      --use-all-repositories <boolean>        If set to 'true', use all sources repositories and branches defined in the production Antora playbook. Defaults to 'false'"
  echo "      --use-multi-repositories <boolean>      If set to 'true', use several repositories and branches passed with the --component-with-branches options. Defaults to 'false'"
  echo "      --use-test-sources <boolean>            If set to 'true', use documentation stored in the bonita-documentation-site repository (for testing). Defaults to 'false'"
  echo "Environment configuration"
  echo "      --only-generate-playbook                If set, only generate the preview Antora playbook and skip the documentation generation"
}


########################################################################################################################
# Parse arguments
########################################################################################################################

scriptOptions="$@"
echo "Preparing the preview build"
echo "Script Options: ${scriptOptions}"

# Help
if [[ "$scriptOptions" == *"--help"* ]]; then
  usage
  exit 0
fi


########################################################################################################################
# PROCESSING
########################################################################################################################

# See the node script for the list of arguments
node scripts/generate-content-for-preview-antora-playbook.js ${scriptOptions}

if [[ "$scriptOptions" == *"--only-generate-playbook"* ]]; then
  echo "Skip documentation generation"
  exit 0
fi
echo "Building the preview using Node $(node --version)..."
rm -rf build/
npx antora --stacktrace antora-playbook-content-for-preview.yml
echo "Preview built"
