// Convert a JIMP picture to a PixelImage 
var PixelCalculator = require('./retropixels/PixelCalculator.js'),
  Remapper = require('./retropixels/Remapper.js'),
  OrderedDitherers = require('./retropixels/OrderedDitherers.js');

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

module.exports = {
  convertImage: convertImage
};
