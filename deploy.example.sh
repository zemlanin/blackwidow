#!/usr/bin/env bash

if [[ -d dist ]]; then rm -rf dist; fi

if [[ ! -f .env ]]; then
  echo "\`.env\` file is required to deploy. use \`.env.example\` as an example"
  exit 1
fi

DOTENV=.env npm install

npm test

# # uncomment next line to deploy to surge.sh
# npm run surge dist

# # uncomment next line to deploy to your own hosting
# TDIR=`mktemp -d`
# REMOTE_HOST=''
# cp -r dist $TDIR
# gzip $TDIR/dist -rkn
# rsync --progress --delete -Icru $TDIR/dist $REMOTE_HOST:/var/projects/blackwidow
# rm -rf $TDIR
