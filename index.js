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

function cleanup(tmpDir, callback) {
    silentDelete('out.mp4', function() {
        console.log("Removing " + tmpDir);
        fs.remove(tmpDir, callback);
    });
}

// combine frames from a folder into a movie
function makeMovie(tmpDir, callback) {
    VideoTool.combineFrames('out.mp4', tmpDir, fps, function() {
        VideoTool.muxAudio('final.mp4', 'out.mp4', 'in.mp4', function() {
            callback();
        });
    });
}

silentDelete('tmp.mp4', function() {
    silentDelete('out.mp4', function() {
        silentDelete('final.mp4', function() {
            Converter.convertVideo('in.mp4', graphicMode, fps, function(tmpDir) {
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
