var VideoTool = require('./VideoTool.js'),
    fps = 5,
    endtime = '00:00:10',
    cli = require('commander');

cli.version('0.0.1')
    .usage('[options] <in folder> [outfile]')
    .option('-f --fps <frames-per-second>', 'Frames per second, default 5', parseInt)
    .parse(process.argv);

if (cli.fps !== undefined) {
    fps = cli.fps;
}
if (isNaN(fps) || fps < 5 || fps > 25) {
    console.error('Frames per second should be a whole number between 5 and 25.');
    cli.help();
}

if (cli.endtime !== undefined) {
    endtime = cli.endtime;
}

console.log('fps =' + fps);

var inFolder = cli.args[0],
    outFile = cli.args[1];

if (inFolder === undefined) {
    console.error('Input folder is mandatory.');
    cli.help();
}

if (outFile === undefined) {
    outFile = inFolder + '.gif';
}

VideoTool.makeGif(outFile, inFolder, fps, function() {
    console.log("Done.");
});
