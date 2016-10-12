Process video with the help of [retropixels](https://github.com/micheldebree/retropixels).

The status of this project is purely proof-of-concept; use at your own risk!

## Prerequisites:
- [NodeJS](https://nodejs.org)
- [```ffmpeg```](https://www.ffmpeg.org) command line utility callable from your ```PATH```

## Get started
Assuming you have cloned or unpacked this project in folder ```retroframes```

### Install dependencies
    
    cd retroframes
    git submodule update --init --recursive
    npm install

### Usage

- Copy the video to process to ```retroframes/in.mp4```
    
      node index.js
    
- Wait. 
- Open ```final.mp4```.
    
