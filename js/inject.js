var CrateDigger = function() {
}

CrateDigger.prototype = {
	attachListeners: function() {
		// Inject a download button into the page
		let $this = this;
		$('#info-contents').before('<div id="cratedigger-download"> <a href="javascript:void(0)">Download .m4a</a> </div>')

		$('#cratedigger-download').click(function(e) {
			const url = window.location.href;
			$this.saveYTAudio(url);

		});
	},

    // Attach start/end handles to YT player
	attachHandles: function() {
        var $this = this;
        var handleContainer = document.createElement('div');
        handleContainer.className = 'cd-handle-container';
        $('.ytp-progress-bar-container').append(handleContainer);
        var leftHandle = document.createElement('div');
        var rightHandle = document.createElement('div');
        var startTimeSpan = document.createElement('span');
        var endTimeSpan = document.createElement('span');
        startTimeSpan.innerText = '0:00';
        endTimeSpan.innerText = '0:00';
        leftHandle.append(startTimeSpan);
        rightHandle.append(endTimeSpan);
        leftHandle.setAttribute('class', 'cd-handle cd-handle-left');
        rightHandle.setAttribute('class', 'cd-handle cd-handle-right');
        $(handleContainer).append(leftHandle);
        $(handleContainer).append(rightHandle);
        var leftHandleX = 0;
        var rightHandleX = 30;
        leftHandle.addEventListener('mousedown', function(e) {
            document.onmouseup = function(e) {
                document.onmousemove = null;
                document.onmouseup = null;
                $this.playVideo(leftHandleX);
            };
            document.onmousemove = function(e) {
                if (e.offsetX < rightHandleX) {
                    leftHandleX = e.offsetX;
                    leftHandle.style.left = leftHandleX + "px";
                }
            };
        }, false);
        rightHandle.addEventListener('mousedown', function(e) {
            document.onmouseup = function(e) {
                document.onmousemove = null;
                document.onmouseup = null;
            };
            document.onmousemove = function(e) {
                if (e.offsetX > leftHandleX) {
                    rightHandleX = e.offsetX;
                    rightHandle.style.left = rightHandleX + "px";
                }
            };
        }, false);
        rightHandle.ondragstart = function() {
            return false;
        }
        leftHandle.ondragstart = function() {
            return false;
        }
	},

    playVideo: function(leftHandleX) {
        var newTime = convertXToSeconds(leftHandleX);
        ytplayer.currentTime = newTime;
        ytplayer.play();
        console.log(ytplayer.play());
    },

    convertXToSeconds: function(x) {
        var ytplayer = document.getElementsByTagName('video')[0];
        var duration = ytplayer.duration;
        var width = document.getElementsByClassName('ytp-progress-bar')[0].offsetWidth;
        var ratio = x / width;
        return ratio * duration;
    },

    convertXToTime: function(x) {
        var ytplayer = document.getElementsByTagName('video')[0];
        var duration = ytplayer.duration;
        var width = document.getElementsByClassName('ytp-progress-bar')[0].offsetWidth;
        var ratio = x / width;
        var time = ratio * duration;
    }

}

var crateDigger = new CrateDigger();

$(document).arrive('.ytp-progress-bar-container', function() {
    crateDigger.attachHandles();

});

$(document).arrive('#info-contents', function() {
	crateDigger.attachListeners.call(crateDigger);
});
