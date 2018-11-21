console.log('popup script loaded');

var xhttp = new XMLHttpRequest();
xhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
        console.log(this);
    }
};
xhttp.open("GET", "https://r1---sn-5uaeznys.googlevideo.com/videoplayback?gir=yes&key=cms1&c=WEB&sparams=clen,dur,ei,expire,gir,id,ip,ipbits,ipbypass,itag,keepalive,lmt,mime,mip,mm,mn,ms,mv,pl,requiressl,source&expire=1542705666&fvip=1&itag=140&mime=audio%2Fmp4&ipbits=0&signature=5FA54D5846F5ADEF7EFFA774CBED1DB6134DA21D.0C4A72BD9224FF098957B8E3A97EE00A38BBC81D&clen=3179358&requiressl=yes&source=youtube&keepalive=yes&ei=on3zW-mMB5ujyQXz857gDg&ip=2a02%3A7aa0%3A1619%3A%3Ad08b%3A1b0f&lmt=1502053037952844&dur=200.109&pl=24&id=o-ACpVMRPfTZvgB-PxsfY0n85OiN36LkV6q42m2wDGGKs-&ratebypass=yes&redirect_counter=1&rm=sn-5gole7e&fexp=23763603&req_id=b87eb73d163da3ee&cms_redirect=yes&ipbypass=yes&mip=68.234.129.30&mm=31&mn=sn-5uaeznys&ms=au&mt=1542684209&mv=m", true);
xhttp.send();
