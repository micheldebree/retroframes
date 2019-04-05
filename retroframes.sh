#!/bin/bash
if [ "$#" -ne 1 ]; then
    echo "USAGE: $0 <video file>"
    exit 1
fi
docker run --rm -it -v "$PWD":/data micheldebree/retroframes "$1"
