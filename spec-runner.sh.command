#!/bin/bash
###################
# gulp-node-slate #
###################

# To make this file runnable:
#   $ chmod +x *.sh.command

banner="gulp-node-slate"
projectHome=$(cd $(dirname $0); pwd)
package=https://raw.githubusercontent.com/center-key/gulp-node-slate/master/package.json
webPage=api-docs/output/index.html

setupTools() {
   cd $projectHome
   echo
   echo $banner
   echo $(echo $banner | sed -e "s/./=/g")
   pwd
   echo
   echo "Node.js:"
   which node || { echo "Need to install Node.js: https://nodejs.org"; exit; }
   node --version
   npm install
   npm update
   npm outdated
   echo
   }

runSpecs() {
   cd $projectHome
   echo "Specifications:"
   npm test
   echo
   }

showVersions() {
   cd $projectHome
   echo "Local changes:"
   git status --short
   versionLocal=v$(grep '"version"' package.json | awk -F'"' '{print $4}')
   versionRemote=v$(curl --silent $package | grep '"version":' | awk -F'"' '{print $4}')
   versionReleased=$(git tag | tail -1)
   echo
   echo "Versions:"
   echo "   $versionLocal (local)"
   echo "   $versionRemote (checked in)"
   echo "   $versionReleased (released)"
   echo
   echo "To publish release:"
   echo "   cd $projectHome"
   echo "   git tag --annotate --force --message 'Release' $versionRemote"
   echo "   git remote --verbose"
   echo "   git push origin --tags --force"
   echo "   npm publish"
   echo
   }

openBrowser() {
   cd $projectHome
   echo "To more quickly just run tests:"
   echo "   cd $projectHome"
   echo "   npm test"
   echo "   open $webPage  #use Chrome or Firefox"  #macOS Safari encounters: SecurityError (DOM Exception 18)
   echo
   sleep 2
   open $webPage
   }

setupTools
runSpecs
showVersions
openBrowser
