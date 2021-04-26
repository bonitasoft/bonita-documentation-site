#!/usr/bin/env bash
########################################################################################################################
# Set convenient defaults for local development usage of the `build-preview.bash` script
########################################################################################################################
set -euo pipefail

devArgs="--type local --ci false"
echo "Running 'build-preview' with dev arguments (${devArgs})"
./build-preview.bash "${devArgs}" "$@"
