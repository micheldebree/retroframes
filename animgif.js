var VideoTool = require('./VideoTool.js'),
    fs = require('fs-extra'),
    fps = 5,
    inFile = 'in.mp4',
    outFile = 'final.gif';

VideoTool.cropFillFilter(inFile, 256, 200, function(filter) {
    VideoTool.extractFrames(inFile, fps, filter, '00:00:05', function(tmpDir) {
        VideoTool.makeGif(outFile, tmpDir, fps, function() {
            fs.remove(tmpDir, function() {
                console.log("Done.");
            });
        });
    });
});
