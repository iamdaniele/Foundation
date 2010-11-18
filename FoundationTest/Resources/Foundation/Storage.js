/**
 * Dictionary-based storage for runtime data.
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
					delete Foundation.Storage._data[i];
					
					Foundation.Storage.checkWatchKey(key, null);					
				}
			}
		}
		else if(Foundation.Storage._data[key]) {
			value = Foundation.Storage._data[key];
			delete Foundation.Storage._data[key];
			
			Foundation.Storage.checkWatchKey();
			
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