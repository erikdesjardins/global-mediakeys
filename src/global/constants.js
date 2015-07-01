(function(exports) {
	exports.msg = {
		REGISTER: 'tab-register',
		UNREGISTER: 'tab-unregister',

		PLAY_STATE: 'tab-playstate',

		PLAY: 'tab-play',
		PAUSE: 'tab-pause',
		NEXT: 'tab-next',
		PREV: 'tab-prev'
	};

	exports.cmd = {
		PLAY_PAUSE: 'media-play-pause',
		NEXT: 'media-next',
		PREV: 'media-prev',
		STOP: 'media-stop'
	};

	exports.storage = {
		TABS: 'registered-tabs'
	}
})(/* jshint -W020 */ Const = {});
