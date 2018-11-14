'use strict';

const express = require('express');
const app = express();
const shell = require('shell');
const ytdl = require('ytdl-core');
const fs = require('fs');
const ffmpeg = require('ffmpeg');
const { spawn } = require( 'child_process' );

//app.get('/:url/:start/:end', (req, res, next) => {
	// Get youtube mp3 somehow
	// Split it up somehow
	// Save it in a predefined folder
	//const url = req.params.url;
const url = 'https://www.youtube.com/watch?v=V27bVCyYoOg&t=13s';
const options = { format: 'mp3' };
console.log(global);
ytdl(url, options)
	.pipe(fs.createWriteStream('video'))
	.on('finish', () => { 
		var ls = spawn( 'ffmpeg', ['-i', 'video', '-vn', '-ab', '128k', '-ar', '44100', '-y', 'video.mp3'] );

		ls.stdout.on( 'data', data => {
				console.log( `stdout: ${data}` );
		} );

		ls.stderr.on( 'data', data => {
				console.log( `stderr: ${data}` );
				var splice = spawn( 'ffmpeg', [ '-i', 'video.mp3', '-acodec', 'copy', '-ss', '0:00:00', '-t', '2:00:00', 'out.mp3' ] );

		} );

		ls.on( 'close', code => {
				console.log( `child process exited with code ${code}` );
		} );
	});
//});

