/**
 * Dictionary-based storage for runtime data.
 * @class
 */
Foundation.Storage = /** @lends Foundation.Storage# */{

	/**
	 * @name Foundation.Storage#change
	 * @event
	 * @param {string} type The type of event. It can be 'set' (value added for the first time or changed) or 'remove'
	 *						(value no longer present into Storage).
	 * @param {string} keySelector The registered key listered that triggered the event (e.g. /^SomeExampleKey[0-9]+/).
	 *						       Note that both RegExp and string key listeners will be passed as strings here.
	 * @param {string} key The key of the element for which the event was triggered (e.g 'SomeExampleKey1234')
	 */
	
	_data: {},
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
		if(key instanceof RegExp) {
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
	 * Sets a value.
	 * @param {string} key The key
	 * @param {mixed} value The value
	 */
	set: function(key, value) {
		Foundation.Storage._data[key] = value;
		
		Foundation.Storage.checkWatchKey(key, value, 'set');
		
		return Foundation.Storage._data[key];
	},
		
	/**
	 *	@param {mixed} key The key to remove. If string, the key will be removed, if present. You can
	 *					   provide a regex that will delete all the matching keys.
	 */
	remove: function(key) {
		if(key instanceof RegExp) {
			for(var i in Foundation.Storage._data) {
				if(key.test(i)) {
					delete Foundation.Storage._data[i];
					
					Foundation.Storage.checkWatchKey(i, null, 'remove');
				}
			}
		}
		else if(Foundation.Storage._data[key]) {
			value = Foundation.Storage._data[key];
			delete Foundation.Storage._data[key];
			
			Foundation.Storage.checkWatchKey(key, null, 'remove');
			
		}	
	},
	
	/**
	 * Wipes the storage.
	 * @param {boolean} [alsoResetKeyListeners=false] Removes all the key listeners.
	 */
	reset: function(alsoResetKeyListeners) {
		Foundation.Storage._data = {};

		if(alsoResetKeyListeners) {
			Foundation.Storage._watch = {};
		}
	},
	
	/**
	 * Attaches a key listener.
     * Every time that a value corresponding to the specified key is changed (that is, set or removed), a Foundation.Storage.change
	 * event is fired (through Ti.App.fireEvent), so you can attach events and perform actions on change.
	 * @param {string|RegExp} key The key to watch
	 *
	 */
	watch: function(key) {
		Foundation.Storage._watch[key.toString()] = key;
	},

	/**
	 * Removes a key listener.
	 * @param {string|RegExp} key The key to remove
	 */
	unwatch: function(key) {
		delete Foundation.Storage._watch[key.toString()];
	},
	
	checkWatchKey: function(srcKey, value, type) {
		for(var key in Foundation.Storage._watch) {
			
			if(Foundation.Storage._watch[key] instanceof RegExp && Foundation.Storage._watch[key].test(srcKey)) {
				Ti.App.fireEvent('Foundation.Storage.change', {type:type, keySelector: key.toString(), key:srcKey, value: value});					
			}			
			else if(Foundation.Storage._watch[key] == srcKey) {
				Ti.App.fireEvent('Foundation.Storage.change', {type:type, keySelector: key.toString(), key:srcKey, value: value});					
			}
		}
	}
};