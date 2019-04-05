var VideoTool = require('./VideoTool.js'),
    GraphicModes = require('./retropixels/GraphicModes.js'),
    fs = require('fs-extra'),
    Converter = require('./Converter.js'),
    fps = 5,
    graphicMode = GraphicModes.c64Multicolor,
    endtime = '00:00:10';

Converter.convertVideo('in.mp4', graphicMode, fps, endtime, function(tmpDir) {
    VideoTool.makeGif('final.gif', tmpDir, fps, function() {
        fs.remove(tmpDir, function() {
            console.log("Done.");
        });
    });
});
