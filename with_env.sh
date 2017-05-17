#!/bin/bash

set -x

eval $(node with_env.js --bucket $BUCKET --file $FILE)

exec $@
