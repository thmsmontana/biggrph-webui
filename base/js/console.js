var MESSAGE_TYPE = {
	0: 'info',
	1: 'warning',
	2: 'error'
};




var consoleLevelFilter = 0;
var displayConsole = false;


/*
 *	TOGGLE CONSOLE
 */
$('#toggle-console').click(function () {
	toggleConsole();
});

/*
 *	CONSOLE FILTERS
 */

$('#console-showall').click(function() {
	setConsoleFilterLevel(0);
});

$('#console-level-info').click(function() {
	setConsoleFilterLevel(0);

});

$('#console-level-warning').click(function() {
	setConsoleFilterLevel(1);

});

$('#console-level-error').click(function() {
	setConsoleFilterLevel(2);
});





/*
 * STYLE BUISNESS
 */


var toggleConsole = function () {
	displayConsole ? hideConsole() : showConsole();
}

function showConsole() {
	displayConsole = true;
	$('#console').removeClass('collapsed')
	$('#toggle-console i').removeClass('fa-caret-square-o-up');
	$('#toggle-console i').addClass('fa-caret-square-o-down');
}

function hideConsole() {
	displayConsole = false;
	$('#console').addClass('collapsed');
	$('#toggle-console i').removeClass('fa-caret-square-o-down');
	$('#toggle-console i').addClass('fa-caret-square-o-up');
}

function buildLogMessageHtmlElement(message) {
	var typeString = MESSAGE_TYPE[message.level];
	var date = new Date(message.timestamp);
	var messageHtmlItem = '<div class="console-message message-'+ typeString + '">				<div class="console-message-meta">					<a class="timestamp" href="#">' + date.toLocaleString() + '</a>					<span class="tag tag-' + typeString + '">' + typeString + '</span>				</div>				<p class="console-message-string">' + message.message + '</p>			</div>'
	return messageHtmlItem;
}


var setConsoleFilterLevel = function (level) {
	consoleLevelFilter = level;
	populateConsole();
	showConsole();
}

var populateConsole = function () {
	consoleMessages.empty();
	$.each(logMessages, function(index, message) {
		if (message.level >= consoleLevelFilter) {
			appendLogMessageToView(message);
		}
	});
}

var refreshConsoleStatsView = function () {
	$('#console-level-error').text(logCounts[2] + ' errors')
	$('#console-level-warning').text(logCounts[1] + ' warnings')
	$('#console-level-info').text(logCounts[0] + ' infos')
}

var appendLogMessageToView = function (message) {
	var jsDiv = document.getElementById('console-messages');
	var scroll = $('#console-messages').scrollTop() + $('#console-messages').innerHeight() >= jsDiv.scrollHeight;
	$(buildLogMessageHtmlElement(message)).appendTo('#console-messages');
	if (scroll) {
		$("#console-messages").animate({scrollTop:$("#console-messages")[0].scrollHeight}, 300);
	}
}


var scrollConsoleToTimestamp = function (timestamp) {
	setConsoleFilterLevel(0);
	$.each(logMessages, function(index, message) {
		if (message.timestamp === timestamp) {
			showConsole();
			$("#console-messages").scrollTop($("#console-messages")[0].scrollHeight * index);
			return false;
		}
	});
}





var startDate, clockTimeout;

var resetClock = function () {
    startDate = Date.now();
    clearTimeout(clockTimeout);
    updateTime();
}

var updateTime = function () {
    if (!startDate) return;

    var runtime = new Date(Date.now() - startDate);
    var h=runtime.getUTCHours();
    var m=runtime.getUTCMinutes();
    var s=runtime.getUTCSeconds();

    var cleanTime = function (i) {
        if (i<10) {i = "0" + i};  // add zero in front of numbers < 10
        return i;
    }
    h = cleanTime(h);
    m = cleanTime(m);
    s = cleanTime(s);

    document.getElementById('runtime').innerHTML = 'Runtime ' + h+':'+m+':'+s;
    clockTimeout = setTimeout(updateTime,500);
}
