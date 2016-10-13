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

function convertFiles(tmpDir, files, graphicMode, callback) {
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
}

// extract frames and convert them to a graphicMode
function convertVideo(filename, graphicMode, fps, callback) {
    fs.mkdtemp('./tmp-', function(error, tmpDir) {
        if (error) throw error;
        console.log("Created temporary directory " + tmpDir);
        retroPicture = graphicMode.create();
        VideoTool.extractFrames(filename, tmpDir, fps, retroPicture, function() {
            findAllFiles(tmpDir, function(files) {
                convertFiles(tmpDir, files, graphicMode, function() {
                callback(tmpDir);
                });
            });
        });
    });
}

module.exports = {
  convertVideo: convertVideo
};
