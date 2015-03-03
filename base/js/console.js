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
	setLogLevelFilter(0);
});

$('#console-level-info').click(function() {
	setLogLevelFilter(0);

});

$('#console-level-warning').click(function() {
	setLogLevelFilter(1);

});

$('#console-level-error').click(function() {
	setLogLevelFilter(2);
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

function buildMessage(message) {
	var typeString = MESSAGE_TYPE[message.level];
	var date = new Date(message.timestamp);
	var messageHtmlItem = '<div class="console-message message-'+ typeString + '">				<div class="console-message-meta">					<a class="timestamp" href="#">' + date.toLocaleString() + '</a>					<span class="tag tag-' + typeString + '">' + typeString + '</span>				</div>				<p class="console-message-string">' + message.message + '</p>			</div>'
	return messageHtmlItem;
}


var setLogLevelFilter = function (level) {
	consoleLevelFilter = level;
	regenerateConsoleMessages();
	showConsole();
}

var regenerateConsoleMessages = function () {
	consoleMessages.empty();
	$.each(logMessages, function(index, message) {
		if (message.level >= consoleLevelFilter) {
			addMessageToView(message);
		}
	});
}

var updateMessageCounts = function () {
	$('#console-level-error').text(logCounts[2] + ' errors')
	$('#console-level-warning').text(logCounts[1] + ' warnings')
	$('#console-level-info').text(logCounts[0] + ' infos')
}

var addMessageToView = function (message) {
	var jsDiv = document.getElementById('console-messages');
	var scroll = $('#console-messages').scrollTop() + $('#console-messages').innerHeight() >= jsDiv.scrollHeight;
	$(buildMessage(message)).appendTo('#console-messages');
	if (scroll) {
		$("#console-messages").animate({scrollTop:$("#console-messages")[0].scrollHeight}, 300);
	}
}


var scrollToLogMessage = function (timestamp) {
	setLogLevelFilter(0);
	$.each(logMessages, function(index, message) {
		if (message.timestamp === timestamp) {
			showConsole();
			$("#console-messages").scrollTop($("#console-messages")[0].scrollHeight * index);
			return false;
		}
	});
}
