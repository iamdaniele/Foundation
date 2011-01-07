/**
 * Dictionary-based storage for runtime data.
 * @class
 */
Foundation.Storage = /** @lends Foundation.Storage# */{
	_data: {},
	_watch: {},
	Event: /** @lends Foundation.Storage.Event# */ {
		/**
		 * Event name to use when watching value changes.
		 * @constant
		 */
		CHANGE: 'Foundation.Storage.change'
	},

	/**
	 * Event triggered when a value changes. Fired only on demand, that is, only if one or more key listeners
	 * are registered.
	 * @name Foundation.Storage.change
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
			for(var i in Foundation.Storage._data) {
				if(key.test(i)) {
					if(includeKey) {
						o.push({key: i, value: Foundation.Storage._data[i]});
					}
					else {
						o.push(Foundation.Storage._data[i]);						
					}
				}
			}
			
			return o;
		}
		else {
			if(Foundation.Storage._data[key]) {
				if(includeKey) return {key: key, value: Foundation.Storage._data[key]};
				else return Foundation.Storage._data[key];
				
			}
			else return null;
		}
	},
	
	/**
	 * Checks if the specified value is a regular expression (by checking its constructor).
	 * @private
	 * @param {mixed} key	The value to check
	 * @returns {boolean} true If the value is a regular expression.
	 */
	isRegExp: function(key) { return key.constructor.toString().match(/^function RegExp\(\)/); },
	
	/**
	 * Sets a value.
	 * @param {string} key The key
	 * @param {mixed} value The value
	 */
	set: function(key, value) {
		Foundation.Storage._data[key] = value;
		
		Foundation.Storage.checkWatchKey(key, value);
		
		return Foundation.Storage._data[key];
	},
		
	/**
	 *	@param {mixed} key The key to remove. If string, the key will be removed, if present. You can
	 *					   provide a regex that will delete all the matching keys.
	 */
	remove: function(key) {
		if(Foundation.Storage.isRegExp(key)) {
			for(var i in Foundation.Storage._data) {
				if(key.test(i)) {
					Foundation.Storage.checkWatchKey(key, null);					
					delete Foundation.Storage._data[i];
				}
			}
		}
		else if(Foundation.Storage._data[key]) {
			Foundation.Storage.checkWatchKey(key, null);
			delete Foundation.Storage._data[key];
		}	
	},
	
	/**
	 * Resets the storage.
	 */
	reset: function() {
		Foundation.Storage._data = {};
	},
	
	/**
	 * Start watching one or more keys for any change. Use this method when you want your application to be
	 * notifies when a value is added, changed or removed (via Ti.App.addEventListener).
	 * @param {mixed} key	The key to watch. It can be a regex or a string.
	 */
	watch: function(key) {
		Foundation.Storage._watch[key.toString()] = (Foundation.Storage.isRegExp(key) ? 'regex' : 'string');
	},
	
	/**
	 * Stop watching one or more keys.
	 * @param {mixed} key	The key to watch. It can be a regex or a string.
	 */
	unwatch: function(key) {
		delete Foundation.Storage._watch[key.toString()];
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
		if(Foundation.Storage._watch[key.toString()]) {
			if(Foundation.Storage._watch[key.toString()] == 'regex') {
				regex = new RegExp(key.toString());
				if(regex.test(key)) {
					Ti.App.fireEvent(Foundation.Storage.Event.CHANGE, {type:'set', keySelector: key.toString(), key:key.toString(), value: value});					
				}
			}			
			else if(Foundation.Storage._watch[key.toString()] == 'string') {
				Ti.App.fireEvent(Foundation.Storage.Event.CHANGE, {type:'set', keySelector: key.toString(), key:key.toString(), value: value});					
			}
		}
	}
};