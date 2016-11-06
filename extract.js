var VideoTool = require('./VideoTool.js'),
    fs = require('fs-extra'),
    fps = 5,
    endtime = '00:00:10',
    cli = require('commander');

cli.version('0.0.1')
    .usage('[options] <infile> [outfile]')
    .option('-f --fps <frames-per-second>', 'Frames per second, default 5', parseInt)
    .option('-e --endtime <end time>', 'Process until this timestamp (hh:mm:ss) default 00:00:10', /^[0-9]{2}:[0-9]{2}:[0-9]{2}$/i)
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

var inFile = cli.args[0],
    outFile = cli.args[1];

if (inFile === undefined) {
    console.error('Input file is mandatory.');
    cli.help();
}

if (outFile === undefined) {
    outFile = inFile + '.gif';
}

VideoTool.cropFillFilter(inFile, 320, 200, function(filter) {
    VideoTool.extractFrames(inFile, fps, filter, endtime, function(tmpDir) {
        console.log("Frames extracted to " + tmpDir);
    });
});
