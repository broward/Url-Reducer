#!/bin/bash
set -e
# Any subsequent(*) commands which fail will cause the shell script to exit immediately

#Load the environment variables:
. bin/env.sh 


#Set up the default options:
REINSTALL="true"
SHOWCOVERAGE="true"


#Update the options from the command line:
while test $# -gt 0
do
    case "$1" in
        --noinstall) REINSTALL="false"
            ;;
        --nocoverage) SHOWCOVERAGE="false"
            ;;
        --help) echo "option 2"
            ;;
        --*) echo "bad option $1"
            ;;
        *) echo "argument $1"
            ;;
    esac
    shift
done


if [ "$REINSTALL" = "true" ] ;
then

	echo "Deleting all node modules:"
	rm -rf node_modules/
	
	echo "Reinstalling node modules:"
	npm install

fi


echo "Running test script:"
$ISTANBUL cover $_MOCHA test/complete -- -b -R spec 

if [ "$SHOWCOVERAGE" = "true" ] ;
then

	echo "Displaying coverage results in browser:"
	see coverage/lcov-report/index.html
	
fi
