#!/bin/bash
set -euo pipefail

# To locally test the script, you can set the following environment variables
# NO_PUSH=true  skip the push to the remote repository
NO_PUSH=${NO_PUSH:-false}
# Select the name the repository to
#   bonita: bonita-doc
#   bcd:    bonita-continuous-delivery-doc
REPO_NAME=${REPO_NAME:-bonita-doc}

log() {
  echo "> $1"
}

merge() {
    FROM=$1
    INTO=$2
    log "Merging branch '${FROM}' into '${INTO}'"

    git checkout "${INTO}" && git pull
    # We don't commit the merge as we want to use a custom message
    # We are merging from origin and we don't want to reference origin in the commit message
    git merge --no-commit origin/"${FROM}"

    # only commit if there is something to commit (otherwise the commit command exits with an error code)
    if [ -n "$(git status --short)" ]; then
        git commit -m "Merge branch '${FROM}' into '${INTO}'"
        log "Merge done and committed"
        if [ ! "${NO_PUSH}" == "true" ]; then
            git push origin "${INTO}"
            log "Merge pushed"
        else
            log "Skipping push per configuration"
        fi
    else
        log "Nothing to merge"
    fi
}

############################################ main code #####################################"""

log "Propagating documentation upwards"
log "Configuration: NO_PUSH=${NO_PUSH}"
log "Configuration: REPO_NAME=${REPO_NAME}"

# allow to keep our changes when merge=ours specified in .gitattributes
git config merge.ours.driver true

if [ "${REPO_NAME}" == "bonita-doc" ]; then
  merge "2023.2" "2024.1"
  merge "2024.1" "2024.2"
  merge "2024.2" "2024.3"
  merge "2024.3" "2025.1"
  merge "2025.1" "2025.2"
elif [ "${REPO_NAME}" == "bonita-continuous-delivery-doc" ]; then
  merge "3.6" "4.0"
elif [ "${REPO_NAME}" == "bonita-test-toolkit-doc" ]; then
  merge "1.0" "2.0"
  merge "2.0" "3.0"
  merge "3.0" "3.1"
else
  echo "ERROR: Unsupported repository ${REPO_NAME}"
  exit -1
fi
