(function() {
	function updateInfo(info = {}) {
		document.body.style.backgroundImage = info.image;
		document.getElementById('title').textContent = info.title;
		document.getElementById('subtitle').textContent = info.subtitle;
	}

	function updatePlayState(state = false) {
		document.body.classList.toggle('isPlaying', state);
	}

	function fetchInfo() {
		Messages.send(Const.msg.INFO)
			.then(updateInfo);
	}

	function fetchPlayState() {
		Messages.send(Const.msg.PLAY_STATE)
			.then(updatePlayState);
	}

	document.getElementById('prev')
		.addEventListener('click', () => Messages.send(Const.msg.PREV));

	document.getElementById('play-pause')
		.addEventListener('click', () => Messages.send(Const.msg.PLAY_PAUSE));

	document.getElementById('next')
		.addEventListener('click', () => Messages.send(Const.msg.NEXT));

	Messages.addListener(Const.msg.INFO, updateInfo);

	// Not using the state from this message as it may be a background tab (e.g. if we pressed stop)
	Messages.addListener(Const.msg.PLAY_STATE, fetchPlayState);

	fetchInfo();
	fetchPlayState();
})();
