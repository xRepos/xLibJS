
xjs = function() {
	var xjs = {

		version: "0.1"
	};

	xjs.util = {};

	xjs.util.getHTTime = function(htTimeOffset) {
	    var d = new Date();
	    var utc = d.getTime() + (d.getTimezoneOffset() * 60000);
	    return new Date(utc + (3600000*htTimeOffset));
	}

	xjs.util.parseTimeStringToSeconds = function(str) {
	    var timeArray = str.split(":");
	    var hh = parseInt(timeArray[0]);
	    var mm = parseInt(timeArray[1]);
	    return hh * 60 * 60 + mm * 60;
	}

	xjs.util.getSecondsOfDay = function(date) {
	    return date.getHours() * 3600 + date.getMinutes() * 60 + date.getSeconds();
	}

	return xjs;
}();