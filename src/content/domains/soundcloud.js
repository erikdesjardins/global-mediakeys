(function() {
	var playButton = document.querySelector('.playControls .playControl');
	var nextButton = document.querySelector('.playControls .skipControl__next');
	var prevButton = document.querySelector('.playControls .skipControl__previous');

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
		Util.dom.click(playButton);
	});

	Messages.addListener(Const.msg.NEXT, function() {
		Util.dom.click(nextButton);
	});

	Messages.addListener(Const.msg.PREV, function() {
		Util.dom.click(prevButton);
	});

	Util.dom.observeClasses(playButton, function(classList) {
		Messages.send(Const.msg.PLAY_STATE, getPlayState(classList));
	});

	window.addEventListener('unload', function() {
		Messages.send(Const.msg.UNREGISTER);
	});
})();
