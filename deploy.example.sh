#!/usr/bin/env bash

# # deploy to surge.sh
# ./node_modules/.bin/surge dist

# # deploy to own hosting
# TDIR=`mktemp -d`
# REMOTE_HOST=''
# cp -r dist $TDIR
# gzip $TDIR/dist -rkn
# rsync --progress --delete -Icru $TDIR/dist $REMOTE_HOST:/var/projects/blackwidow
# rm -rf $TDIR
