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

/*
 * Constants
 */
const version = '0.1';
const serverUrl = 'http://104.248.47.138:3000';

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

    /*
     * 1. Download video.
     */
    ytdl(url, ytdlOptions)
        .pipe(fs.createWriteStream(outputDir + id))
        .on('finish', () => { 
            /*
             * 2. Convert audio stream from m4a to mp3.
             */
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

app.listen(3000);
console.log('listening on 3000');
