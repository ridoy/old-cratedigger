'use strict';

/*
 * Imports
 */
const express = require('express');
const app = express();
const ytdl = require('ytdl-core');
const fs = require('fs');
const ffmpeg = require('ffmpeg');
const uuid = require('uuid');
const http = require('http');
const https = require('https');

/*
 * Constants
 */
const version = '0.1';
const serverUrl = 'https://cratedigger-server.herokuapp.com';
app.use(express.static(__dirname, { dotfiles: 'allow' } ));

/*
const privateKey = fs.readFileSync('/etc/letsencrypt/live/cratedigger.me/privkey.pem', 'utf8');
const certificate = fs.readFileSync('/etc/letsencrypt/live/cratedigger.me/cert.pem', 'utf8');
const ca = fs.readFileSync('/etc/letsencrypt/live/cratedigger.me/chain.pem', 'utf8');
const options = {
	key: privateKey,
	cert: certificate,
	ca: ca
};
*/

const debugMode = true;

function debug(message) {
    if (debugMode) console.log(message);
}

console.log('Running');


/*
 * GET /dig/:url/:start/:end
 *
 * Extract audio from the YouTube video at :url from the region defined by :start to :end.
 * Return url for downloading the output audio.
 */
app.get('/dig/:url/:start/:end', (req, res, next) => {
    const url = 'https://www.youtube.com/watch?v=' + req.params.url;
    const start = Math.floor(req.params.start);
    const duration = Math.ceil(req.params.end) - start;
    const id = uuid.v1();
    const outputDir = 'out/'
    const ytdlOptions = { format: 'mp3' };
    res.header("Access-Control-Allow-Origin", "*"); // update to match the domain you will make the request from
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");


    debug('Downloading video');
    /*
     * 1. Download video.
     */
    ytdl(url, ytdlOptions)
        .pipe(fs.createWriteStream(outputDir + id))
        .on('finish', () => { 
            /*
             * 2. Convert audio stream from m4a to mp3.
             */
            debug('Converting m4a to mp3');
            new ffmpeg(outputDir + id)
                .then((video) => {
                    return video.setDisableVideo()
                             .save(outputDir + id + '.mp3');
                })
                .then((filename) => {
                    return new ffmpeg(filename);
                })

                /*
                 * 3. Extract desired clip from mp3.
                 */
                .then((video) => {
                    debug('Extracting clip');
                    return video.setVideoStartTime(start)
                             .setVideoDuration(duration)
                             .save(outputDir + id + '-clip.mp3');
                })

                /*
                 * 4. Open download link for user.
                 */
                .then((filename) => {
                    return res.send(serverUrl + '/' + filename);
                })
                .catch((err) => {
                    debug(err);
                    return res.status(500).send(err);
                });
        });
});

/*
 * GET /out/:file
 *
 * Download output file after clipping/conversion process. 
 */
app.get('/out/:file', (req, res, next) => {
    return res.sendFile(__dirname + '/out/' + req.params.file);
});

/*
 * GET /version
 *
 * Return the current release of CrateDigger.
 */
app.get('/version', (req, res, next) => {
    return res.send(version);
});

// Create an HTTP service.
var httpServer = http.createServer(app);
// Create an HTTPS service identical to the HTTP service.
//var httpsServer = https.createServer(options, app);
console.log(`Listening on ${process.env.PORT}`);
httpServer.listen(process.env.PORT);
//httpsServer.listen(443);
console.log('listening on ports 80 and 443');
