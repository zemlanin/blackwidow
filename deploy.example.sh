#!/usr/bin/env bash

# # deploy to surge.sh
# ./node_modules/.bin/surge dist

# # deploy to own hosting
# TDIR=`mktemp -d`
# cp -r dist $TDIR
# gzip $TDIR/dist -rk
# scp -r $TDIR/dist REMOTE_HOST:/var/projects/blackwidow
# rm -rf $TDIR
