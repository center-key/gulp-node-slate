#!/bin/bash
###################
# gulp-node-slate #
###################

# To make this file runnable:
#     $ chmod +x *.sh.command

banner="gulp-node-slate"
projectHome=$(cd $(dirname $0); pwd)
webPage=api-docs/output/index.html

setupTools() {
   cd $projectHome
   echo
   echo $banner
   echo $(echo $banner | sed s/./=/g)
   pwd
   test -d .git || { echo "Project must be in a git repository."; exit; }
   git restore dist/* &>/dev/null
   git pull --ff-only
   echo
   echo "Node.js:"
   which node || { echo "Need to install Node.js: https://nodejs.org"; exit; }
   node --version
   npm install --no-fund
   npm update --no-fund
   npm outdated
   echo
   }

releaseInstructions() {
   cd $projectHome
   repository=$(grep repository package.json | awk -F'"' '{print $4}' | sed s/github://)
   package=https://raw.githubusercontent.com/$repository/main/package.json
   version=v$(grep '"version"' package.json | awk -F'"' '{print $4}')
   pushed=v$(curl --silent $package | grep '"version":' | awk -F'"' '{print $4}')
   minorVersion=$(echo ${pushed:1} | awk -F"." '{ print $1 "." $2 }')
   released=$(git tag | tail -1)
   published=v$(npm view $repository version)
   test $? -ne 0 && echo "NOTE: Ignore error if package is not yet published."
   echo "Local changes:"
   git status --short
   echo
   echo "Recent releases:"
   git tag | tail -5
   echo
   echo "Release progress:"
   echo "   $version (local) --> $pushed (pushed) --> $released (released) --> $published (published)"
   echo
   test "$version" ">" "$released" && mode="NOT released" || mode="RELEASED"
   echo "Current version is: $mode"
   echo
   nextActionBump() {
      echo "When ready to do the next release:"
      echo
      echo "   === Increment version ==="
      echo "   Edit pacakge.json to bump $version to next version number"
      echo "   $projectHome/package.json"
      }
   nextActionCommitTagPub() {
      echo "Verify all tests pass and then finalize the release:"
      echo
      echo "   === Commit and push ==="
      echo "   Check in all changed files with the message:"
      echo "   Release $version"
      echo
      echo "   === Tag and publish ==="
      echo "   cd $projectHome"
      echo "   git tag --annotate --message 'Release' $version"
      echo "   git remote --verbose"
      echo "   git push origin --tags"
      echo "   npm publish"
      }
   test "$version" ">" "$released" && nextActionCommitTagPub || nextActionBump
   echo
   }

runSpecs() {
   cd $projectHome
   echo "Specifications:"
   npm test
   echo
   }

openBrowser() {
   cd $projectHome
   echo "To more quickly just run tests:"
   echo "   cd $projectHome"
   echo "   npm test"
   echo "   open $webPage"
   echo
   sleep 2
   open $webPage
   }

setupTools
releaseInstructions
runSpecs
openBrowser
