// Convert a JIMP picture to a PixelImage
var PixelCalculator = require('./retropixels/PixelCalculator.js'),
    Remapper = require('./retropixels/Remapper.js'),
    OrderedDitherers = require('./retropixels/OrderedDitherers.js'),
    fs = require('fs-extra'),
    VideoTool = require('./VideoTool.js'),
    ProgressBar = require('progress'),
    Jimp = require('jimp');

function convertImage(jimpImage, graphicMode) {
    var x,
        y,
        pixel,
        pixelImage = graphicMode.create();

    pixelImage.dither = OrderedDitherers.bayer4x4;
    // pixelImage.mappingWeight = [1, 0, 0];

    // jimpImage.normalize();
    // create optimal colormaps (skip for worse quality)
    // if skipped, ColorMaps are filled up on first come, first server basis
    Remapper.optimizeColorMaps(jimpImage.bitmap, pixelImage);

    pixelImage.drawImageData(jimpImage.bitmap);

    for (y = 0; y < jimpImage.bitmap.height; y += 1) {
        for (x = 0; x < jimpImage.bitmap.width; x += 1) {
            PixelCalculator.poke(jimpImage.bitmap, x, y, pixelImage.peek(x, y));
        }
    }

    // resize according to pixel width and height
    jimpImage.resize(pixelImage.width * pixelImage.pWidth, pixelImage.height * pixelImage.pHeight);
}

function findAllFiles(directory, callback) {
    fs.readdir(directory, function(error, files) {
        if (error) throw error;
        console.log(files.length + " frames found in " + directory);
        callback(files);
    });
}

function convert(filenames, index, graphicMode, callback) {
    if (index < filenames.length) {
        bar.tick();
        Jimp.read(filenames[index], function(err, image) {
            if (err) throw err;
            convertImage(image, graphicMode);
            image.write(filenames[index]);
            convert(filenames, index + 1, graphicMode, callback);
        });
    } else {
        callback();
    }
}

function convertFiles(tmpDir, graphicMode, callback) {
    findAllFiles(tmpDir, function(files) {
        bar = new ProgressBar('Pixelating... [:bar] :percent frame :current/:total :etas', {
            total: files.length
        });
        // prepend tmp dir
        files = files.map(function(file) {
            return tmpDir + '/' + file;
        });

        if (files.length > 0) {
            console.log("Converting " + files.length + " files");
            convert(files, 0, graphicMode, function() {
                console.log("Done converting.");
                callback();
            });
        } else {
            throw new Error("No frames found to process.");
        }
    });
}

function getFilter(filename, pixelImage, callback) {
    var destWidth = pixelImage.width,
        destHeight = pixelImage.height,
        cropWidth = pixelImage.width * pixelImage.pWidth,
        cropHeight = pixelImage.height * pixelImage.pHeight;
    VideoTool.cropFillFilter(filename, cropWidth, cropHeight, function(cropfilter) {
        callback(cropfilter + ',' + 'scale=' + destWidth + ':' + destHeight);
    });
}

// extract frames and convert them to a graphicMode
// returns the temporary folder that contains the converted frames
function convertVideo(filename, graphicMode, fps, endTime, callback) {
    getFilter(filename, graphicMode.create(), function(filter) {
        VideoTool.extractFrames(filename, fps, filter, endTime, function(tmpDir) {
            convertFiles(tmpDir, graphicMode, function() {
                callback(tmpDir);
            });
        });
    });
}

module.exports = {
    convertVideo: convertVideo
};
