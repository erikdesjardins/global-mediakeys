(function(exports) {
	exports.prototype.buttons = function(func) {
		this._buttons = func;
		return this;
	};

	exports.prototype.playState = function(func) {
		this._getPlayState = func;
		return this;
	};

	exports.prototype.go = function(setup) {
		if (setup) {
			if (this._cleanup) {
				console.warn('.go() has already been called with a setup function, aborting setup.');
			} else {
				this._cleanup = setup(this.go.bind(this));
			}
		}

		this.buttons = this._buttons();

		if (!this.buttons.play) {
			console.warn('No play button found.');
			return;
		}

		if (this._cleanup) {
			this._cleanup();
		}

		this.getPlayState = this._getPlayState.bind(this, this.buttons.play);

		Messages.send(Const.msg.REGISTER, {
			canSkip: !!(this.buttons.next || this.buttons.prev),
			playState: this.getPlayState()
		});

		Messages.addListener([Const.msg.PLAY, Const.msg.PAUSE], function() {
			Util.dom.click(this.buttons.play);
		}.bind(this));

		Messages.addListener(Const.msg.NEXT, function() {
			Util.dom.click(this.buttons.next);
		}.bind(this));

		Messages.addListener(Const.msg.PREV, function() {
			Util.dom.click(this.buttons.prev);
		}.bind(this));

		Util.dom.observe(
			this.buttons.play,
			{ attributes: true, attributeFilter: ['class'] },
			function() {
				Messages.send(Const.msg.PLAY_STATE, this.getPlayState())
			}.bind(this)
		);

		window.addEventListener('unload', function() {
			Messages.send(Const.msg.UNREGISTER);
		});
	};
})(/* jshint -W020 */ Domain = function() {});
