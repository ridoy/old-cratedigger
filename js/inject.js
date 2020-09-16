console.log('Content script loaded.');

/*
 * CrateDigger Object
 *
 * Modify the YouTube UI to look something like this so that we can clip (dig)
 * parts of songs on YouTube (be it drum breaks, samples, etc.) and use them 
 * in beats:
 *  _______________________________
 * |                               |
 * |                               |
 * |      { YouTube video }        |
 * |                               |
 * |      start          end       |
 * |        |             |        |
 * |============o------------------|
 * | > ||                     * [ ]|
 *
 * "Download .mp3 from {start} to {end}"
 *
 */
function CrateDigger() {

}

CrateDigger.prototype = {

    /*
     * Initialize everything by grabbing key elements from the YouTube page
     * and injecting HTML elements for the user to interact with CrateDigger.
     */
    init: function() {
        this.serverUrl = 'https://cratedigger-server.herokuapp.com';
        this.version = '0.1';
        this.ytVideo = document.getElementsByTagName('video')[0];
        this.ytProgressBar = 
            document.getElementsByClassName('ytp-progress-bar-container')[0];
        this.videoInfoBox = 
            document.getElementsByTagName('ytd-video-primary-info-renderer')[0];

        this.injectDownloadLink();
        this.injectHandles();
        this.checkForUpdate();
    },

    checkForUpdate: function() {
        const $this = this;
        const xhttp = new XMLHttpRequest();
        const url = this.serverUrl + '/version';
        xhttp.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
                const latestVersion = xhttp.responseText;
                if ($this.version !== latestVersion) {
                    console.log('There is an updated CrateDigger available!');
                }
            }
        };
        xhttp.open('GET', url, true);
        xhttp.send();

    },

    /*
     * Inject a link into the page for downloading an mp3 of the selected part
     * of the video.
     */
    injectDownloadLink: function() {
        let $this = this;

        // Build download link
        this.downloadLink = document.createElement('a');
        this.downloadLink.href = 'javascript:void(0)';
        this.downloadLink.id = 'cd-dl-link';
        this.downloadLink.innerHTML = 'Download .mp3 from '
            + '<span id="cd-dl-start">0:00</span>'
            + ' to <span id="cd-dl-end">0:00</span>';
        this.downloadLink.onclick = function() {
            const queryParams = window.location.search.split('&');
            const videoId = queryParams[0].split('=')[1];
            const start = $this.xPosToSeconds($this.leftHandle.x)
            const end = $this.xPosToSeconds($this.rightHandle.x)
            $this.saveYTAudio(videoId, start, end);
        };

        // Inject download link above video title
        this.videoInfoBox.before(this.downloadLink);
    },

    /*
     * Inject start/end handles into the YouTube video player for the user to 
     * define the region of the video they wish to download.
     */
    injectHandles: function() {
        this.handleContainer = document.createElement('div');
        this.handleContainer.className = 'cd-handle-container';
        this.leftHandle = this.buildHandle('cd-handle-left', 0, 'cd-dl-start');
        this.rightHandle = this.buildHandle('cd-handle-right', 30, 'cd-dl-end');

        this.ytProgressBar.append(this.handleContainer);
        this.handleContainer.append(this.leftHandle.el);
        this.handleContainer.append(this.rightHandle.el);

        this.attachHandleListeners();
    },

    /*
     * Attach listeners for movement of start/end handles.
     */
    attachHandleListeners: function() {
        let $this = this;

        // Update left handle position upon drag.
        this.leftHandle.el.addEventListener('mousedown', function() {
            document.onmousemove = function(e) {
                const ytpBarX = $this.ytProgressBar.getBoundingClientRect().x;
                const handleX = e.clientX - ytpBarX;
                const isBehindRightHandle = (handleX < $this.rightHandle.x);
                const isWithinProgressBar = (handleX >= 0);
                if (isBehindRightHandle && isWithinProgressBar) {
                    $this.leftHandle.updatePosition(handleX);
                }
            };
            document.onmouseup = function() {
                document.onmousemove = null;
                document.onmouseup = null;
                let newTime = $this.xPosToSeconds($this.leftHandle.x);
                $this.playVideo(newTime);
            };
        }, false);

        // Update right handle position upon drag.
        this.rightHandle.el.addEventListener('mousedown', function() {
            document.onmousemove = function(e) {
                const ytpBarX = $this.ytProgressBar.getBoundingClientRect().x;
                const handleX = e.clientX - ytpBarX;
                const isAheadOfLeftHandle = (handleX > $this.leftHandle.x);
                const isWithinProgressBar = (handleX <= $this.ytProgressBar.clientWidth);
                if (isAheadOfLeftHandle && isWithinProgressBar) {
                    $this.rightHandle.updatePosition(handleX);
                }
                
            };
            document.onmouseup = function() {
                document.onmousemove = null;
                document.onmouseup = null;
            };
        }, false);

        // Negate default dragging behavior.
        this.rightHandle.el.ondragstart = function() {
            return false;
        };
        this.leftHandle.el.ondragstart = function() {
            return false;
        };
    },

    /*
     * Constructor for a handle object. Usually we need 2 handles for the user
     * to define the start and end of the video region they want to download.
     *
     * @param handleClass Class of the handle HTML element.
     * @param startX Default x position of handle, relative to the progress bar.
     * @param timestampClass Class of start/end timestamp in the download link.
     * @return handle The built handle object.
     */
    buildHandle: function(handleClass, startX, timestampClass) {
        let $this = this;
        let handle = {
            el: document.createElement('div'),
            x: startX,
            timeDisplay: document.createElement('span'),
            updatePosition: function(x) {
                this.x = x;
                this.el.style.left = x + "px";
                let timestamp = $this.xPosToTimestamp(x);
                this.timeDisplay.innerText = timestamp;
                document.getElementById(timestampClass).innerText = timestamp;
            }
        };

        document.getElementById(timestampClass).innerText = this.xPosToTimestamp(startX);
        handle.el.className = 'cd-handle ' + handleClass;
        handle.timeDisplay.className = 'cd-start-time';
        handle.timeDisplay.innerText = this.xPosToTimestamp(startX);
        handle.el.append(handle.timeDisplay);

        return handle;
    },

    /*
     * Download the specified region of a YouTube video's audio.
     *
     * In the future we want to do this all in the browser, but this involves
     * developing a CORS workaround. For now we're using a proxy.
     *
     * @param url The url of the YouTube video.
     * @param start The region's start time in seconds.
     * @param start The region's end time in seconds.
     */
    saveYTAudio: function(videoId, start, end) {
        const url = this.serverUrl + '/dig/' + videoId 
                                    + '/' + start 
                                    + '/' + end;
        // Initiate download
        const xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
                console.log(xhttp.responseText);
                window.location = xhttp.responseText;
            }
        };
        xhttp.open("GET", url, true);
        xhttp.send();
        this.downloadLink.innerHTML = 'Processing video, please wait...';
    },

    /*
     * Seek video to a specified time and if not paused play video.
     *
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
     *
     * @param x An x position relative to the YT progress bar.
     * @return time in seconds.
     */
    xPosToSeconds: function(x) {
        let duration = this.ytVideo.duration;
        let width = this.ytProgressBar.offsetWidth;
        let ratio = x / width;
        return ratio * duration;
    },

    /*
     * Convert a position on the YT progress bar to a MM:SS timestamp.
     *
     * @param x An x position relative to the YT progress bar.
     * @return time as MM:SS.
     */
    xPosToTimestamp: function(x) {
        let seconds = this.xPosToSeconds(x);
        let mm = Math.floor(seconds / 60);
        let ss = ((seconds % 60 < 10) ? '0' : '') + Math.floor(seconds % 60);
        return mm + ':' + ss;
    }
}

/*
 * Video info contents arrive sometime after the page loads, so wait for 
 * arrival before initializing CrateDigger.
 */
$(document).arrive('ytd-video-primary-info-renderer', 
    { once: true },
    function initCrateDigger() {
        const crateDigger = new CrateDigger();
        crateDigger.init();
    });

