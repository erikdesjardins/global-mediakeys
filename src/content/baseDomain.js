(function(exports) {
	exports.prototype.setupButtons = function(func) {
		if (this._buttons) {
			console.error('setupButtons() has already been called.');
		} else {
			this._buttons = func;
		}
		return this;
	};

	exports.prototype.setupPlayState = function(func) {
		if (this._playState) {
			console.error('setupPlayState() has already been called.');
		} else {
			this._playState = func;
		}
		return this;
	};

	exports.prototype.setupInfo = function(func) {
		if (this._info) {
			console.error('setupInfo() has already been called.');
		} else {
			this._info = func;
		}
		return this;
	};

	exports.prototype.go = async function(setup) {
		if (this.setupComplete) {
			return;
		}

		if (setup) {
			setup.then(() => this.go());
		}

		var buttons = this._buttons();

		if (!buttons.play) {
			console.warn('No play button found.');
			return;
		} else {
			this.setupComplete = true;
		}

		await Messages.send(Const.msg.REGISTER);

		this._playState(Util.debounce(state => Messages.send(Const.msg.PLAY_STATE, state), 50), buttons);

		this._info(Util.debounce(info => Messages.send(Const.msg.INFO, info), 50));

		Messages.addListener(Const.msg.PLAY_PAUSE, () => Util.click(buttons.play));

		Messages.addListener(Const.msg.NEXT, () => Util.click(buttons.next));

		Messages.addListener(Const.msg.PREV, () => Util.click(buttons.prev));

		window.addEventListener('unload', () => Messages.send(Const.msg.UNREGISTER));
	};
})(window.Domain = function() {});
