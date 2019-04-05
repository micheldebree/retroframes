# Retroframes

Make video look like it's made on a Commodore 64.

**The status of this project is purely proof-of-concept; use at your own risk!**

## Prerequisites

[Docker](https://www.docker.com). Make sure it is installed and working.

## Run

```sh
docker run --rm -it -v "$PWD":/data micheldebree/retroframes <video file>
```

N.B.

- The first time, the Docker image is downloaded from the internet.
  Be patient, this only happens once.
- The input video can be any format that `ffmpeg` understands.
