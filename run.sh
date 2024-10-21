#!/bin/sh

HERE=$(dirname $(readlink -f $0));
cd $HERE;

#uncomment if first run or fresh build is required...
#DOCKER_BUILDKIT=1 docker build --pull --no-cache -t autocompletecontainer .

docker run -it -v ./:/tmp/completer autocompletecontainer