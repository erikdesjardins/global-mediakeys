(function(exports) {
	function populate(templateId, map) {
		var template = document.getElementById(templateId);

		if (!template || !template.content) {
			throw new Error(`#${templateId} is not a valid template.`);
		}

		var wrapper = document.createElement('p');

		wrapper.appendChild(document.importNode(template.content, true));
		wrapper.innerHTML = wrapper.innerHTML.replace(/\{\{(\w+)\}\}/g, function(m, key) {
			if (!(key in map)) {
				throw new Error(`Cannot populate template: ${templateId}, missing property: ${key}.`);
			}
			return map[key];
		});

		return wrapper.firstElementChild;
	}

	exports.populate = populate;
})(window.Templates = {});
