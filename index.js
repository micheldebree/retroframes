// https://www.npmjs.com/package/jimp
// http://stackoverflow.com/questions/21194934/node-how-to-create-a-directory-if-doesnt-exist
// TODO: input arguments

var fs = require('fs-extra'),
    Jimp = require('jimp'),
    PixelImage = require('./retropixels/PixelImage.js'),
    GraphicModes = require('./retropixels/GraphicModes.js'),
    Palette = require('./retropixels/Palette.js'),
    ColorMap = require('./retropixels/ColorMap.js'),
    PixelCalculator = require('./retropixels/PixelCalculator.js'),
    Remapper = require('./retropixels/Remapper.js'),
    OrderedDitherers = require('./retropixels/OrderedDitherers'),
    ErrorDiffusionDitherers = require('./retropixels/ErrorDiffusionDitherers'),
    ProgressBar = require('progress'),
    VideoTool = require('./VideoTool.js'),
    Converter = require('./Converter.js'),
    bar;

// frames per second of result video
var fps = 15,
    inFile = 'in.mp4',
    outFile = 'final.mp4',
    tmpFile = 'tmp.mp4',
    endTime = undefined,
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

function cleanup(tmpDir, callback) {
    silentDelete(tmpFile, function() {
        console.log("Removing " + tmpDir);
        fs.remove(tmpDir, callback);
    });
}

// combine frames from a folder into a movie
function makeMovie(tmpDir, callback) {
    VideoTool.combineFrames(tmpFile, tmpDir, fps, function() {
        VideoTool.muxAudio(outFile, tmpFile, inFile, function() {
            callback();
        });
    });
}

silentDelete(tmpFile, function() {
    silentDelete(outFile, function() {
        Converter.convertVideo(inFile, graphicMode, fps, endTime, function(tmpDir) {
            makeMovie(tmpDir, function() {
                cleanup(tmpDir, function() {
                    console.log('Done.');
                });
            });
        });
    });
});
