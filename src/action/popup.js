(function() {
	function update() {
		Messages.send(Const.msg.INFO)
			.then(function(info) {
				document.body.style.backgroundImage = 'url(' + info.image + ')';
				document.getElementById('title').textContent = info.title;
				document.getElementById('subtitle').textContent = info.subtitle;
				document.body.classList.toggle('playing', info.isPlaying);
			});
	}

	document.getElementById('prev').addEventListener('click', function() {
		Messages.send(Const.msg.PREV)
			.then(update);
	});

	document.getElementById('play-pause').addEventListener('click', function() {
		Messages.send(Const.msg.PLAY_PAUSE)
			.then(update);
	});

	document.getElementById('next').addEventListener('click', function() {
		Messages.send(Const.msg.NEXT)
			.then(update);
	});

	update();
})();
