/**
 * Dictionary-based persistent storage.
 */
Foundation.PersistentStorage = /** @lends Foundation.PersistentStorage# */{
	_watch: {},
	/**
	 * Gets one or more values safely.
	 * @param {mixed} key The key to remove. If string, the key will be removed, if present. You can
	 *					   provide a regex that will delete all the matching keys.
	 * @param {boolean} [includeKey=false] True to return an object with two properties: key (the key for this value)
	 *                  and value (the value).
	 * @return {mixed} If you provided a string key:
	 * 				<ul>
	 *					<li>If the key is present, the value will be returned.</li>
	 *					<li>If the key is present and includeKey is true, an object will be returned (see the description
	 *                  for includeKey).</li>
	 *					<li>If the key is not present, null will be returned.</li>
	 *				</ul>
	 *				If you provided a regex:
	 * 				<ul>
	 *					<li>If the regex matches one or more keys, an array of values will be returned.</li>
	 *					<li>If the regex matches one or more keys and includeKey is true, an array of objects
	 *                  will be returned (see the description for includeKey).</li>
	 *					<li>If the regex doesn't match any key, an empty array will be returned.</li>
	 *				</ul>
	 */
	get: function(key, includeKey) {
		if(Foundation.Storage.isRegExp(key)) {
			var o = [];
			
			var properties = Ti.App.Properties.listProperties();
			
			for(var i in properties) {
				if(key.test(properties[i]) && properties[i].match(/_type$/) == null) {
					if(includeKey) {						
						o.push({key: properties[i], value: Foundation.PersistentStorage._get(key)});
					}
					else {
						o.push(Foundation.PersistentStorage._get(key));
					}
				}
			}
			
			return o;
		}
		else {
			if(Ti.App.Properties.hasProperty(key) && Ti.App.Properties.hasProperty(key + '_type')) {
				if(includeKey) return {key: key, value: Foundation.PersistentStorage._get(key)};
				else {
					var value = Foundation.PersistentStorage._get(key);
					return value;
				}
			}
			else return null;
		}
	},
	
	_get: function(key) {
		var value = null;
		var type = Ti.App.Properties.getString(key + '_type');
		
		switch(type) {
			case 'Bool':
				value = Ti.App.Properties.getBool(key);
			break;
			case 'String':
				value = Ti.App.Properties.getString(key);
			break;
			case 'List':
				value = Ti.App.Properties.getList(key);
			break;
			case 'Int':
				value = Ti.App.Properties.getInt(key);
			break;
			case 'Double':
				// you might wonder why this instead of getDouble(): well, it's more accurate
				// (always returns the correct type and value 100%, whilst getDouble() approximates the
				// value which therefore might not be correct in all the architectures)
				value = parseFloat(Ti.App.Properties.getString(key));
			break;
			case 'object':
				value = Ti.App.Properties.getString(key);
				value = JSON.parse(value);
			break;
		}
		
		return value;
		
	},
	
	/**
	 * Sets a value.
	 * @param {string} key The key
	 * @param {mixed} value The value
	 */
	set: function(key, value) {
		var type = Foundation.PersistentStorage.typeOf(value);
		
		switch(type) {
			case 'Bool':
				Ti.App.Properties.setBool(key, value);
			break;
			case 'String':
				Ti.App.Properties.setString(key, value);
			break;
			case 'List':
				Ti.App.Properties.setList(key, value);
			break;
			case 'Int':
				Ti.App.Properties.setInt(key, value);
			break;
			case 'Double':
				Ti.App.Properties.setDouble(key, value);
			break;
			case 'object':
				value = JSON.stringify(value);
				Ti.App.Properties.setString(key, value);
			break;
		}
		
		Ti.App.Properties.setString(key + '_type', type);
		
		Foundation.Storage.checkWatchKey(key, value);
		
		return value;
	},
	
	typeOf: function(value) {
		var type = null;
		
		switch(typeof value) {
			case 'boolean':
				type = 'Bool';
			break;
			case 'string':
				type = 'String';
			break;
			case 'object':
				if(value.constructor && value.constructor.toString().match(/^function Array\(\)/) != null) {
					type = 'List';
				}
				else {
					type = 'object';
				}
			break;
			case 'number':
				type = parseInt(value) != value ? 'Double' : 'Int';
			break;
		}
		
		return type;
	},
		
	/**
	 *	@param {mixed} key The key to remove. If string, the key will be removed, if present. You can
	 *					   provide a regex that will delete all the matching keys.
	 */
	remove: function(key) {
		if(Foundation.Storage.isRegExp(key)) {
			
			var properties = Ti.App.Properties.listProperties();
			
			for(var i in properties) {
				if(key.test(properties[i]) && properties[i].match(/_type$/) == null) {
					Ti.App.Properties.removeProperty(properties[i]);
					Ti.App.Properties.removeProperty(properties[i] + '_type');
					
					Foundation.Storage.checkWatchKey(key, null);					
				}
			}
		}
		else if(Ti.App.Properties.hasProperty(key)) {
			Ti.App.Properties.removeProperty(key);
			
			Foundation.Storage.checkWatchKey();
			
		}	
	},
	
	reset: function() {
		var properties = Ti.App.Properties.listProperties();
		for(var i in properties) {
			Ti.App.removeProperty(properties[i]);
		}
	},
	
	watch: function(key) {
		Ti.API.info('[Foundation.Storage] registering key ' + key.toString());
		Foundation.PersistentStorage._watch[key.toString()] = (Foundation.Storage.isRegExp(key) ? 'regex' : 'string');
	},
	
	unwatch: function(key) {
		delete Foundation.PersistentStorage._watch[key.toString()];
	},
	
	checkWatchKey: function(key, value) {
		if(Foundation.PersistentStorage._watch[key.toString()]) {
			if(Foundation.PersistentStorage._watch[key.toString()] == 'regex') {
				regex = new RegExp(key.toString());
				if(regex.test(key)) {
					Ti.API.info('[Foundation.Storage] triggering watch event for key ' + key.toString());
					Ti.App.fireEvent('Foundation.Storage.change', {type:'set', keySelector: key.toString(), key:key.toString(), value: value});					
				}
			}			
			else if(Foundation.PersistentStorage._watch[key.toString()] == 'string') {
				Ti.API.info('[Foundation.Storage] triggering watch event for key ' + key.toString());
				Ti.App.fireEvent('Foundation.Storage.change', {type:'set', keySelector: key.toString(), key:key.toString(), value: value});					
			}
		}
	}
};