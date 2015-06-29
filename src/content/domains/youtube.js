(function() {
	var playButton = document.querySelector('.ytp-button-play, .ytp-button-pause');
	var nextButton = document.querySelector('.ytp-button-next');
	var prevButton = document.querySelector('.ytp-button-prev');

	if (!playButton) {
		console.warn('No play button found.');
		return;
	}

	function getPlayState(classList) {
		return classList.contains('ytp-button-pause');
	}

	Messages.send(Const.msg.REGISTER, {
		canSkip: true,
		playState: getPlayState(playButton.classList)
	});

	Messages.addListener([Const.msg.PLAY, Const.msg.PAUSE], function() {
		Util.click(playButton);
	});

	Messages.addListener(Const.msg.NEXT, function() {
		Util.click(nextButton);
	});

	Messages.addListener(Const.msg.PREV, function() {
		Util.click(prevButton);
	});

	Util.observeClasses(playButton, function(classList) {
		Messages.send(Const.msg.PLAY_STATE, getPlayState(classList));
	});

	window.addEventListener('unload', function() {
		Messages.send(Const.msg.UNREGISTER);
	});
})();
