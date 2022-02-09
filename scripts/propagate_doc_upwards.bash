#!/bin/bash
set -euo pipefail

# To locally test the script, you can set the following environment variables
# NO_PUSH=true  skip the push to the remote repository
NO_PUSH=${NO_PUSH:-false}

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

merge "7.11" "2021.1"
merge "2021.1" "2021.2"
merge "2021.2" "2022.1"
merge "2022.1" "2022.2"
