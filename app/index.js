/* jshint esversion: 6 */
// https://www.npmjs.com/package/jimp
// http://stackoverflow.com/questions/21194934/node-how-to-create-a-directory-if-doesnt-exist
// TODO: input arguments
var Converter = require("./Converter.js"),
    fs = require("fs-extra"),
    VideoTool = require("./VideoTool.js"),
    cli = require("commander"),
    path = require("path"),
    retropixels = require("retropixels");

// frames per second of result video
const fps = 15;

let endTime, inFile, outFile, tmpFile;

// delete a file, and do nothing if it doesn't exist
function silentDelete(filename, callback) {
    fs.unlink(filename, function(error) {
        if (error) {
            if (error.code !== "ENOENT") {
                throw error;
            }
            // else stay silent
        }
        console.log("Deleted " + filename);
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

cli.version("0.1.4")
    .usage("<infile>")
    .parse(process.argv);

inFile = cli.args[0];

if (inFile === undefined) {
    console.error("Input file missing.");
    cli.help();
}
outFile = path.basename(inFile, path.extname(inFile)) + "-retro.mp4";
tmpFile = path.basename(inFile, path.extname(inFile)) + "-tmp.mp4";

const graphicMode = retropixels.GraphicModes.all.c64Multicolor;

silentDelete(tmpFile, function() {
    silentDelete(outFile, function() {
        Converter.convertVideo(inFile, graphicMode, fps, endTime, function(
            tmpDir
        ) {
            makeMovie(tmpDir, function() {
                cleanup(tmpDir, function() {
                    console.log("Done.");
                });
            });
        });
    });
});
