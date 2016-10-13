// A wrapper around ffmpeg installed on system.
var exec = require('child_process').execFile;

function run(options, callback) {
    exec('ffmpeg', options, function(error, stdout, stderr) {
        if (error) throw error;
        callback();
    });
}

// Get ffmpeg filter to crop video to fill destWidth and destHeight 
function getCropFilter(videofilename, destWidth, destHeight, callback) {
    // fill up the image
    getSize(videofilename, function(srcWidth, srcHeight) {
        var destratio = destWidth / destHeight;
        var srcratio = srcWidth / srcHeight;
        cropwidth = srcratio > destratio ? srcHeight * destratio : srcWidth;
        cropheight = srcratio > destratio ? srcHeight : srcWidth / destratio;
        sourceLeft = (srcWidth - cropwidth) / 2;
        sourceTop = (srcHeight - cropheight) / 2;
        console.log('Input video size: ' + srcWidth + 'x' + srcHeight);
        callback('crop=' + cropwidth + ':' + cropheight + ':' + sourceLeft + ':' + sourceTop);
    });
}

// Get the width and height of a video file.
// provide callback(width, height) to get the result.
function getSize(videofilename, callback) {
    exec('ffprobe', ['-v', 'error', '-show_entries', 'stream=width,height',
        '-of', 'default=noprint_wrappers=1', videofilename
    ], function(error, stdout, stderr) {
        if (error) throw error;
        var parsedOutput = stdout.match(/width=([0-9]+)\s*height=([0-9]+)/);

        if (parsedOutput.length !== 3) {
            throw new Error("Could not parse output: " + stdout);
        }
        callback(parsedOutput[1], parsedOutput[2]);
    });
}

function getFilter(filename, cropWidth, cropHeight, destWidth, destHeight, callback) {
    getSize(filename, function(srcWidth, srcHeight) {
        getCropFilter(filename, cropWidth, cropHeight, function(cropfilter) {
            callback(cropfilter + ',' + 'scale=' + destWidth + ':' + destHeight);
        });
    });
}

function extractFrames(filename, directory, framesPerSecond, pixelImage, callback) {
    var destWidth = pixelImage.width,
        destHeight = pixelImage.height,
        cropWidth = pixelImage.width * pixelImage.pWidth,
        cropHeight = pixelImage.height * pixelImage.pHeight;

    getFilter(filename, cropWidth, cropHeight, destWidth, destHeight, function(filter) {
        args = ['-i', filename, '-r', framesPerSecond];
        console.log('Extracting frames from ' + filename + ' to ' + directory + '...');
        args.push('-t');
        args.push('00:00:20');
        console.log('Using filter: ' + filter);
        args.push('-vf');
        args.push(filter);
        args.push(directory + '/%05d.png');
        run(args, callback);
    });
}

function combineFrames(filename, directory, framesPerSecond, callback) {
    console.log('Combining frames into ' + filename + '...');
    run(['-r', framesPerSecond + '/1',
        '-i', directory + '/%05d.png',
        '-c:v', 'libx264',
        '-vf', 'fps=' + framesPerSecond,
        '-pix_fmt', 'yuv420p',
        filename
    ], callback);
}

function muxAudio(filename, videoFilename, audioFilename, callback) {
    console.log('Adding audio from ' + audioFilename + ' to ' + videoFilename + ' to create ' + filename + '...');
    run(['-i', videoFilename,
        '-i', audioFilename,
        '-c', 'copy',
        '-map', '0:0',
        '-map', '1:1',
        '-shortest',
        filename
    ], callback);
}

function makeGif(filename, framesDirectory, fps, callback) {
  console.log('Making animated GIF ' + filename + ' from frames in ' + framesDirectory + ' with ' + fps + 'fps');
  exec('convert', ['-loop', '0', '-delay', 100/fps, framesDirectory + '/*', filename], function() {
    callback();
  });
}

module.exports = {
    extractFrames: extractFrames,
    combineFrames: combineFrames,
    muxAudio: muxAudio,
    makeGif: makeGif
};
