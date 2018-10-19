var CrateDigger = function() {
}

CrateDigger.prototype = {
	injectListeners: function() {
		// Inject a download button into the page
		$this = this;
		console.log($this);
		console.log(
		$('#info-contents').before('<div id="cratedigger-download"> <a href="javascript:void(0)">Download .m4a</a> </div>')
		);

		$('#cratedigger-download').click(function(e) {
			const url = window.location.href;
			$this.saveYTAudio(url);

		});
	},

	saveYTAudio: function(url) {
		const encodedUrl = encodeURI(url);
		const settings = {
			"async": true,
			"crossDomain": true,
			"url": "https://getvideo.p.mashape.com/?url=" + encodedUrl,
			"dataType": "json",
			"method": "GET",
			"headers": {
				"x-mashape-key": "WwapvQkdH6mshE70vioPji5DLnmAp13TOdAjsn3tUF8YSopO2F",
				"accept": "text/plain",
				"cache-control": "no-cache"
			}
		}

		$.ajax(settings).done( (response) => {
			const audioStream = response.streams.filter((el) => { return el.format === 'audio only'; });
			console.log(audioStream[0].url);
			window.open(audioStream[0].url, "Download");
		});
	}
}

// User visits Youtube Video
// Selects part to download
// Cratedigger downloads from mashape api
// Cratedigger does trimming within browser
// samples downloaded
//
//
// For now: download video
// Return a snippet somewhere inside
//

$(document).arrive('#info-contents', function() {


	var crateDigger = new CrateDigger();
	crateDigger.injectListeners.call(crateDigger);
	console.log('hello');
});
