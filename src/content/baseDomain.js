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
		if (this._getInfo) {
			console.error('setupInfo() has already been called.');
		} else {
			this._getInfo = func;
		}
		return this;
	};

	exports.prototype.go = function(setup) {
		if (setup) {
			if (this._cleanup) {
				console.error('go() has already been called with a setup function.');
			} else {
				this._cleanup = setup(this.go.bind(this));
			}
		}

		var buttons = this._buttons();

		if (!buttons.play) {
			console.warn('No play button found.');
			return;
		}

		if (this._cleanup) {
			this._cleanup();
		}

		Messages.send(Const.msg.REGISTER);

		this._playState(
			Messages.send.bind(Messages, Const.msg.PLAY_STATE),
			buttons
		);

		Messages.addListener(Const.msg.PLAY_PAUSE, function() {
			Util.dom.click(buttons.play);
			return Promise.resolve();
		});

		Messages.addListener(Const.msg.NEXT, function() {
			Util.dom.click(buttons.next);
			return Promise.resolve();
		});

		Messages.addListener(Const.msg.PREV, function() {
			Util.dom.click(buttons.prev);
			return Promise.resolve();
		});

		Messages.addListener(Const.msg.INFO, function() {
			return Promise.resolve(this._getInfo());
		}.bind(this));

		window.addEventListener('unload', function() {
			Messages.send(Const.msg.UNREGISTER);
		});
	};
})(window.Domain = function() {});
