.PHONY: all dist clean

all: package

# image:
# 	docker build --tag amazonlinux:nodejs .

# package: image
# 	docker run --rm --volume ${PWD}/lambda:/build amazonlinux:nodejs npm install --production

# dist: 
# 	cd lambda && zip -FS -q -r ../dist/function.zip *

dist:
	[ -d dist ] || mkdir dist
	#zip -FS -q -r ./dist/function.zip -x ./node_modules/aws-sdk *.js node_modules
	zip -FS -q -r ./dist/function.zip  *.js node_modules -x ./node_modules/aws-sdk/\*

clean:
	rm -r node_modules
