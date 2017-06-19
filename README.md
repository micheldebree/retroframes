# Retroframes

Process video with the help of [retropixels](https://github.com/micheldebree/retropixels).

**The status of this project is purely proof-of-concept; use at your own risk!**

There are two ways to run this tool:

- Using Docker (easy)
- Using the source code (moderately easy)

## Run using [Docker](https://www.docker.com)

The only prerequisite is Docker itself. Make sure it is installed and working.

- Name your input video ```in.mp4```
- In the same folder as ```in.mp4```, run:

        docker run --rm -v "$PWD":/data micheldebree/retroframes

N.B.

- The first time, the Docker image is downloaded from the internet. Be patient, this only happens once.
- The input video can be any format that ```ffmpeg``` understands. Just name it ```in.mp4``` anyway.
- The docker container does not display a progressbar. Be patient. Check the contents of the created ```tmp-*``` folder to see progress.

## Run the old fashioned way

## Prerequisites

- [Git](https://git-scm.com)
- [NodeJS](https://nodejs.org)
- [```ffmpeg```](https://www.ffmpeg.org) command line utility callable from your ```PATH```

## Get source and dependencies

    git clone https://github.com/micheldebree/retroframes.git
    cd retroframes
    git submodule update --init --recursive
    npm install

## Usage

- Copy the video to process to ```retroframes/in.mp4```

      node index.js

- Wait.
- Open ```final.mp4```.
