
UNDERSCORE=./node_modules/.bin/underscore
if [ ! -x $UNDERSCORE ];
then
	echo "Installing underscore"
	npm install underscore-cli
fi

ISTANBUL=./node_modules/.bin/istanbul
MOCHA=node_modules/.bin/mocha
_MOCHA=node_modules/.bin/_mocha



