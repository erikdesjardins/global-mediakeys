(function(exports) {
	exports.msg = {
		REGISTER: 'tab-register',
		UNREGISTER: 'tab-unregister',
		PLAY_STATE: 'tab-playstate',

		INFO: 'tab-info',

		PLAY_PAUSE: 'tab-play-pause',
		NEXT: 'tab-next',
		PREV: 'tab-prev',

		ECHO: 'echo'
	};

	exports.status = {
		// unique object (for reference equality)
		NO_RESPONSE: {}
	};

	exports.cmd = {
		PLAY_PAUSE: 'media-play-pause',
		NEXT: 'media-next',
		PREV: 'media-prev',
		STOP: 'media-stop'
	};

	exports.storage = {
		TABS: 'registered-tabs'
	};
})(window.Const = {});
