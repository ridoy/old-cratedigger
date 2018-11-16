console.log('Content script loaded.');

var CrateDigger = function() {
}

CrateDigger.prototype = {
    init: function() {
        this.ytVideo = document.getElementsByTagName('video')[0];
        this.injectDownloadLink();
        this.injectHandles();
    },

    /*
     * Inject link for downloading .mp3 into the page.
     */
	injectDownloadLink: function() {
		let $this = this;

        // Build download link
        this.downloadLink = document.createElement('a');
        this.downloadLink.href = 'javascript:void(0)';
        this.downloadLink.id = "cd-dl-link";
        this.downloadLink.innerHTML = 'Download .mp3 from <span id="cd-dl-start">0:00</span> to <span id="cd-dl-end">0:00</span>';
	    this.downloadLink.onclick = function(e) {
			const url = window.location.href;
			$this.saveYTAudio(url);
		};

        // Inject download link above video title
        let videoRenderBox = document.getElementsByTagName('ytd-video-primary-info-renderer')[0];
        videoRenderBox.before(this.downloadLink);
	},

    /*
     * Inject start/end handles into the youtube video player.
     */
	injectHandles: function() {
        this.handleContainer = document.createElement('div');
        this.handleContainer.className = 'cd-handle-container';
        let ytProgressBar = document.getElementsByClassName('ytp-progress-bar-container')[0];
        ytProgressBar.append(this.handleContainer);
        this.leftHandle = this.buildHandle('cd-handle-left', 0, 'cd-dl-start');
        this.rightHandle = this.buildHandle('cd-handle-right', 30, 'cd-dl-end');
        this.handleContainer.append(this.leftHandle.el);
        this.handleContainer.append(this.rightHandle.el);
        this.attachHandleListeners();
    },

    /*
     * Constructor for a handle object.
     * @param handleClass class of the handle element.
     * @param startX default x position of handle element.
     * @param timestampClass class of timestamp in download link.
     * @return handle The built handle object.
     */
    buildHandle: function(handleClass, startX, timestampClass) {
        let $this = this;
        let handle = {
            el: document.createElement('div'),
            x: startX,
            timeDisplay: document.createElement('span'),
            timestampClass: timestampClass,
            updatePosition: function(x) {
                this.x = x;
                this.el.style.left = x + "px";
                let timestamp = $this.xPosToTimestamp(x);
                this.timeDisplay.innerText = timestamp;
                document.getElementById(this.timestampClass).innerText = timestamp;
            }
        };
        handle.el.className = 'cd-handle ' + className;
        handle.timeDisplay.className = 'cd-start-time';
        handle.timeDisplay.innerText = this.xPosToTimestamp(startX);
        handle.el.append(handle.timeDisplay);
        return handle;
    },

    /*
     * Attach listeners for movement of start/end handles.
     */
    attachHandleListeners: function() {
        let $this = this;
        this.leftHandle.el.addEventListener('mousedown', function(e) {
            // Update handle's x position as mouse is dragged
            document.onmousemove = function(e) {
                if (e.offsetX < $this.rightHandle.x) {
                    $this.leftHandle.updatePosition(e.offsetX);
                }
            };
            document.onmouseup = function(e) {
                document.onmousemove = null;
                document.onmouseup = null;
                $this.playVideo($this.xPosToSeconds(leftHandleX));
            };
        }, false);
        this.rightHandle.el.addEventListener('mousedown', function(e) {
            // Update handle's x position as mouse is dragged
            document.onmousemove = function(e) {
                if (e.offsetX > $this.leftHandle.x) {
                    $this.rightHandle.updatePosition(e.offsetX);
                }
            };
            document.onmouseup = function(e) {
                document.onmousemove = null;
                document.onmouseup = null;
            };
        }, false);
        this.rightHandle.el.ondragstart = this.leftHandle.el.ondragstart = function() {
            return false;
        };
	},

    /*
     * Seek video to time and play (if not playing already).
     * @param newTime Time to seek in seconds.
     */
    playVideo: function(newTime) {
        this.ytVideo.currentTime = newTime;
        if (!this.ytVideo.paused) {
            this.ytVideo.play();
        }
    },

    /*
     * Convert a position on the YT progress bar to seconds.
     * @param x An x position relative to the YT progress bar.
     * @return time in seconds.
     */
    xPosToSeconds: function(x) {
        let duration = this.ytVideo.duration;
        let width = document.getElementsByClassName('ytp-progress-bar')[0].offsetWidth;
        let ratio = x / width;
        return ratio * duration;
    },

    /*
     * Convert a position on the YT progress bar to a MM:SS timestamp.
     * @param x An x position relative to the YT progress bar.
     * @return time as MM:SS.
     */
    xPosToTimestamp: function(x) {
        let seconds = xPosToSeconds(x);
        return Math.floor(seconds / 60) + ':' + ((seconds % 60 < 10) ? '0' : '') + Math.floor(seconds % 60);
    }
}

/*
 * Video info contents arrive sometime after the page loads, so wait for arrival before initializing CrateDigger.
 */
$(document).arrive('ytd-video-primary-info-renderer', function() {
    const crateDigger = new CrateDigger();
    crateDigger.init();
});

