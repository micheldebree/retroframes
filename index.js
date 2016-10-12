// https://www.npmjs.com/package/jimp
// http://stackoverflow.com/questions/21194934/node-how-to-create-a-directory-if-doesnt-exist
// TODO: input arguments

var fs = require('fs-extra');
var Jimp = require('jimp');
var PixelImage = require('./retropixels/PixelImage.js');
var GraphicModes = require('./retropixels/GraphicModes.js');
var Palette = require('./retropixels/Palette.js');
var ColorMap = require('./retropixels/ColorMap.js');
var PixelCalculator = require('./retropixels/PixelCalculator.js');
var Remapper = require('./retropixels/Remapper.js');
var OrderedDitherers = require('./retropixels/OrderedDitherers');
var ErrorDiffusionDitherers = require('./retropixels/ErrorDiffusionDitherers');
var ProgressBar = require('progress');
var VideoTool = require('./VideoTool.js'),
    Converter = require('./Converter.js');
var bar;

// frames per second of result video
var fps = 25,
    graphicMode = GraphicModes.c64Multicolor;



// delete a file, and do nothing if it doesn't exist
function silentDelete(filename, callback) {
    fs.unlink(filename, function(error) {
        if (error) {
            if (error.code !== 'ENOENT') {
                throw error;
            }
            // else stay silent
        }
        console.log('Deleted ' + filename);
        callback();
    });
}

function convert(filenames, index, callback) {
    if (index < filenames.length) {
        bar.tick();
        Jimp.read(filenames[index], function(err, image) {
            if (err) throw err;
            Converter.convertImage(image, graphicMode);
            image.write(filenames[index]);
            convert(filenames, index + 1, callback);
        });
    } else {
        callback();
    }
}

function convertFiles(tmpDir, files, callback) {
    bar = new ProgressBar('Pixelating... [:bar] :percent frame :current/:total :etas', {
        total: files.length
    });
    // prepend tmp dir
    files = files.map(function(file) {
        return tmpDir + '/' + file;
    });

    if (files.length > 0) {
        console.log("Converting " + files.length + " files");
        convert(files, 0, function() {
            console.log("Done converting.");
            callback();
        });
    } else {
        throw new Error("No frames found to process.");
    }
}

function findAllFiles(directory, callback) {
    fs.readdir(directory, function(error, files) {
        if (error) throw error;
        console.log(files.length + " frames found in " + directory);
        callback(files);
    });
}

function cleanup(tmpDir, callback) {
    silentDelete('out.mp4', function() {
        console.log("Removing " + tmpDir);
        fs.remove(tmpDir, callback);
    });
}

function makeMovie(tmpDir, callback) {
    VideoTool.combineFrames('out.mp4', tmpDir, fps, function() {
        VideoTool.muxAudio('final.mp4', 'out.mp4', 'in.mp4', function() {
            callback();
        });
    });
}

function convertVideo(filename, callback) {
    fs.mkdtemp('./tmp-', function(error, tmpDir) {
        if (error) throw error;
        console.log("Created temporary directory " + tmpDir);
        retroPicture = graphicMode.create();
        VideoTool.extractFrames(filename, tmpDir, fps, retroPicture, function() {
            findAllFiles(tmpDir, function(files) {
                convertFiles(tmpDir, files, function() {
                callback(tmpDir);
                });
            });
        });
    });
}

silentDelete('tmp.mp4', function() {
    silentDelete('out.mp4', function() {
        silentDelete('final.mp4', function() {
            convertVideo('in.mp4', function(tmpDir) {
                makeMovie(tmpDir, function() {
                    cleanup(tmpDir, function() {
                        console.log('Done.');
                    });
                });
            });
        });
    });
});
return;
