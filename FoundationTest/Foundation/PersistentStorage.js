/**
 * Dictionary-based persistent storage.

 * @description As this class relies on Titanium.App.Properties, for each value Foundation will store an extra value
 * to keep reference of the value's type. This allows you to get and set values without worrying of data types and
 * performances.
 * @class
 */
Foundation.PersistentStorage = /** @lends Foundation.PersistentStorage# */{
	_watch: {},
	Event: /** @lends Foundation.PersistentStorage.Event# */ {
		/**
		 * Event name to use when watching value changes.
		 * @constant
		 */
		CHANGE: 'Foundation.PersistentStorage.change'
	},
	
	/**
	 * @name Foundation.PersistentStorage.change
	 * Event triggered when a value changes. Fired only on demand, that is, only if one or more key listeners
	 * are registered.
	 * @event
	 * @param {Object} e Event object
	 * @param {string} e.type Type of the event (currently only set is supported)
	 * @param {string} e.keySelector The selector query that matched the key. For example, if the key 'cat'
	 *								 has changed and the regular expression /(b|c)at/ matched, this parameter will contain
	 * 								 the string /(b|c)at/. You can use this string to re-create the matching regex.
	 * @param {string} e.key		 The key for which the event has occurred. In the example above, this will be 'cat'.
	 * @param {mixed}  e.value		 The new value.
	 */

	/**
	 * Gets one or more values safely.
	 * @param {mixed} key The key to remove. If string, the key will be removed, if present. You can
	 *					   provide a regex that will delete all the matching keys.
	 * @param {boolean} [includeKey=false] True to return an object with two properties: key (the key for this value)
	 *                  and value (the value).
	 * @returns {mixed} If you provided a string key:
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
	
	/**
	 * Retrieves the value for the specified key in the correct format.
	 * @private
	 * @param {string} key	The dictionary's key
	 * @returns {mixed}	The return value or null if no value is found.
	 */
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
	
	/**
	 * Determines the correct type of the specified value.
	 * @private
	 * @param {mixed} value The value to check
	 * @returns {string} A string containing the value type (Bool, String, object, List, Double, Int).
	 * 				    The name format allows other method to use reflection (Ti.App.Properties.getXXXX)
	 */
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
				if(Foundation.isArray(value)) {
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
	 * Permanently removes a value from the storage.
	 * @param {mixed} key The key to remove. If string, the key will be removed, if present. You can
	 *					   provide a regex that will delete all the matching keys.
	 */
	remove: function(key) {
		if(Foundation.Storage.isRegExp(key)) {
			
			var properties = Ti.App.Properties.listProperties();
			
			for(var i in properties) {
				if(key.test(properties[i]) && properties[i].match(/_type$/) == null) {
					Foundation.Storage.checkWatchKey(key, null);
					Ti.App.Properties.removeProperty(properties[i]);
					Ti.App.Properties.removeProperty(properties[i] + '_type');
				}
			}
		}
		else if(Ti.App.Properties.hasProperty(key)) {
			Foundation.Storage.checkWatchKey(key, null);
			Ti.App.Properties.removeProperty(key);
		}	
	},
	
	/**
	 * Resets the storage.
	 */
	reset: function() {
		var properties = Ti.App.Properties.listProperties();
		for(var i in properties) {
			Ti.App.Properties.removeProperty(properties[i]);
		}
	},

	/**
	 * Start watching one or more keys for any change. Use this method when you want your application to be
	 * notifies when a value is added, changed or removed (via Ti.App.addEventListener).
	 * @param {mixed} key	The key to watch. It can be a regex or a string.
	 */
	watch: function(key) {
		Foundation.PersistentStorage._watch[key.toString()] = (Foundation.Storage.isRegExp(key) ? 'regex' : 'string');
	},
	
	/**
	 * Stop watching one or more keys.
	 * @param {mixed} key	The key to watch. It can be a regex or a string.
	 */
	unwatch: function(key) {
		delete Foundation.PersistentStorage._watch[key.toString()];
	},
	
	/**
	 * Checks if any key listener is registered against the specified key.
	 *
	 * First of all, this method checks if the key dictionary contains a matching key (either a regex or a string).
	 * A regex is syntesized by using its string value (as we can't store regex references properly). If any matching
	 * key is found, this method will trigger an event.
	 * @private
	 * @param {mixed} key The value key (either a regex or a string)
	 * @param {mixed} value The value for the specified key. It will be passed along with the event data.
	 */
	checkWatchKey: function(key, value) {
		if(Foundation.PersistentStorage._watch[key.toString()]) {
			if(Foundation.PersistentStorage._watch[key.toString()] == 'regex') {
				regex = new RegExp(key.toString());
				if(regex.test(key)) {
					Ti.App.fireEvent(Foundation.PersistentStorage.Event.CHANGE, {type:'set', keySelector: key.toString(), key:key.toString(), value: value});
				}
			}			
			else if(Foundation.PersistentStorage._watch[key.toString()] == 'string') {
				Ti.App.fireEvent(Foundation.PersistentStorage.Event.CHANGE, {type:'set', keySelector: key.toString(), key:key.toString(), value: value});					
			}
		}
	}
};