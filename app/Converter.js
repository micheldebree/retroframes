/* jshint esversion: 6 */
// Convert a JIMP picture to a PixelImage
const retropixels = require("retropixels");

const palette = retropixels.Palettes.all["colodore"];
const colorspace = retropixels.Quantizer.colorspaces["xyz"];
const quantizer = new retropixels.Quantizer(palette, colorspace);
const poker = new retropixels.Poker(quantizer);
const converter = new retropixels.Converter(poker);

const prepost = retropixels.JimpPreprocessor;
//converter.poker.quantizer.measurer = converter.poker.quantizer.distanceRainbow;

const fs = require("fs-extra"),
    VideoTool = require("./VideoTool.js"),
    ProgressBar = require("progress"),
    Jimp = require("jimp");

// the progress bar
let bar;

const ditherer = new retropixels.OrderedDither(
    retropixels.OrderedDither.presets["bayer4x4"],
    32
);

function coordsToIndex(imageData, x, y) {
    return Math.floor(y) * (imageData.width << 2) + (x << 2);
}

function poke(imageData, x, y, pixel) {
    const i = coordsToIndex(imageData, x, y);
    imageData[i] = pixel[0];
    imageData[i + 1] = pixel[1];
    imageData[i + 2] = pixel[2];
    imageData[i + 3] = pixel[3];
}

function convertImage(jimpImage, graphicMode) {
    // jimpImage.normalize();
    ditherer.dither(jimpImage.bitmap);

    const pixelImage = graphicMode.builder(palette);

    converter.convert(jimpImage.bitmap, pixelImage);

    // poke the result back to the Jimp image
    // for (let y = 0; y < jimpImage.bitmap.height; y += 1) {
    //     for (let x = 0; x < jimpImage.bitmap.width; x += 1) {
    //         poke(
    //             jimpImage.bitmap,
    //             x,
    //             y,
    //             pixelImage.peek(x, y)
    //         );
    //     }
    // }

    // // resize according to pixel width and height
    // jimpImage.resize(
    //     pixelImage.mode.width * pixelImage.mode.pixelWidth,
    //     pixelImage.mode.height * pixelImage.mode.pixelHeight
    // );
    return pixelImage;
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
            const pixelImage = convertImage(image, graphicMode);
            prepost.write(pixelImage, filenames[index]);
            // image.write(filenames[index]);
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

function getFilter(filename, graphicMode, callback) {
    const pixelImage = graphicMode.builder(palette);
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
    getFilter(filename, graphicMode, function(filter) {
        VideoTool.extractFrames(filename, fps, filter, endTime, function(
            tmpDir
        ) {
            convertFiles(tmpDir, graphicMode, function() {
                callback(tmpDir);
            });
        });
    });
}

module.exports = {
    convertVideo: convertVideo,
    convertFiles: convertFiles
};
