#!/bin/bash
export SBT_OPTS="-Dsbt.global.base=$HOME/.sbt"
source ~/.sdkman/bin/sdkman-init.sh 2>/dev/null || true
cd "$(dirname "$0")"
sbt "$@"
