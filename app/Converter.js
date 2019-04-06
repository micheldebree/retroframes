/* jshint esversion: 6 */
// Convert a JIMP picture to a PixelImage
const Converter = require("./node_modules/retropixels/target/conversion/Converter.js"),
  ImageData = require("./node_modules/retropixels/target/model/ImageData.js"),
  GraphicModes = require("./node_modules/retropixels/target/profiles/GraphicModes.js"),
  OrderedDither = require("./node_modules/retropixels/target/conversion/OrderedDither.js"),
    converter = new Converter.Converter();

//   converter.poker.quantizer.measurer = converter.poker.quantizer.distanceRainbow;

const fs = require("fs-extra"),
  VideoTool = require("./VideoTool.js"),
  ProgressBar = require("progress"),
  Jimp = require("jimp");

// the progress bar
let bar;

let ditherer = new OrderedDither.OrderedDither(
  OrderedDither.OrderedDither.presets["bayer4x4"],
  16
);

function convertImage(jimpImage) {
  // jimpImage.normalize();
  ditherer.dither(jimpImage.bitmap);
  const pixelImage = converter.convert(jimpImage.bitmap, GraphicModes.GraphicModes.c64Multicolor);

  for (let y = 0; y < jimpImage.bitmap.height; y += 1) {
    for (let x = 0; x < jimpImage.bitmap.width; x += 1) {
      ImageData.ImageData.poke(jimpImage.bitmap, x, y, pixelImage.peek(x, y));
    }
  }

  // resize according to pixel width and height
  jimpImage.resize(
    pixelImage.mode.width * pixelImage.mode.pixelWidth,
    pixelImage.mode.height * pixelImage.mode.pixelHeight
  );
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
    bar = new ProgressBar(
      "Pixelating... [:bar] :percent frame :current/:total :etas",
      {
        total: files.length
      }
    );
    // prepend tmp dir
    files = files.map(function(file) {
      return tmpDir + "/" + file;
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
  const destWidth = pixelImage.mode.width,
    destHeight = pixelImage.mode.height,
    cropWidth = pixelImage.mode.width * pixelImage.mode.pixelWidth,
    cropHeight = pixelImage.mode.height * pixelImage.mode.pixelHeight;
  VideoTool.cropFillFilter(filename, cropWidth, cropHeight, function(
    cropfilter
  ) {
    callback(cropfilter + "," + "scale=" + destWidth + ":" + destHeight);
  });
}

// extract frames and convert them to a graphicMode
// returns the temporary folder that contains the converted frames
function convertVideo(filename, graphicMode, fps, endTime, callback) {
  getFilter(filename, graphicMode.factory(), function(filter) {
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
