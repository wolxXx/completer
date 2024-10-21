#!/bin/sh

HERE=$(dirname $(readlink -f $0));
cd $HERE;

#DOCKER_BUILDKIT=1 docker build --pull --no-cache -t autocompletecontainer .

docker run -it -v ./:/tmp/completer autocompletecontainer