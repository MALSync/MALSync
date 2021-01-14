#!/bin/bash

cd $(dirname $0)/../..
rm -fr dist/local
echo Clone localization repo https://github.com/lolamtisch/MALSync-localization.git.
git clone --depth 1 "https://github.com/lolamtisch/MALSync-localization.git" dist/local

ruby package/localization/gen-locales.rb > dist/local/locales.json

cd dist/local && git add locales.json
if [ -z "$(git diff --cached)" ]; then
  echo No changes to deploy.
  exit 0
fi

echo Deploy changes.

git config --local user.email "action@github.com"
git config --local user.name "GitHub Action"
git commit -a -m "Update locales.json for MALSync/MALSync"

#git push "https://${GITHUB_OAUTH_TOKEN}@github.com/lolamtisch/MALSync-localization.git" master

exit 0

set -euf -o pipefail

echo Analyze repo and deploy locales.json.

# Return to origin repo's deploy dir.


echo Add SSH key to authentication agent.
chmod 400 deploy_key
eval `ssh-agent -s`
ssh-add deploy_key

url=`git config remote.origin.url`
user=$(basename $(dirname "$url"))
project=$(basename "$url" .git)
repo="git@github.com:$user/$project-localization"
sha=`git rev-parse --verify HEAD`

echo Clone localization repo $repo.
git clone --depth 1 "$repo" out

echo Generate locales.json.
ruby chrome-extension-localization/deploy/gen-locales.rb > out/locales.json

cd out && git add locales.json
if [ -z "$(git diff --cached)" ]; then
  echo No changes to deploy.
  exit 0
fi

git config user.name "$COMMIT_AUTHOR_NAME"
git config user.email "$COMMIT_AUTHOR_EMAIL"
git commit -a -m "Update locales.json for $user/$project@${sha}."

echo Deploy changes.
git push "$repo" master
