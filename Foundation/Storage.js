Foundation.Storage = {
	data: {},
	get: function(key) {
		return Foundation.Storage.data[key] || null;
	},
	
	set: function(key, value) {
		Foundation.Storage.data[key] = value;
		return Foundation.Storage.data[key];
	},
	
	remove: function(key) {
		value = null;
		if(Foundation.Storage.data[key]) {
			value = Foundation.Storage.data[key];
			delete Foundation.Storage.data[key];
		}
		return value;
	},
	
	reset: function() {
		Foundation.Storage.data = {};
	}
};