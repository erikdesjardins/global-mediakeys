window.addEventListener('load', function() {
	var playButton = document.querySelector('sj-icon-button[data-id="play-pause"]');
	var nextButton = document.querySelector('sj-icon-button[data-id="forward"]');
	var prevButton = document.querySelector('sj-icon-button[data-id="rewind"]');

	if (!playButton) {
		console.warn('No play button found.');
		return;
	}

	function getPlayState(classList) {
		return classList.contains('playing');
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
});
