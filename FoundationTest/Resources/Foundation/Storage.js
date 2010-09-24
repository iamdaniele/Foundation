/**
 * Dictionary-based storage for runtime data.
 */
Foundation.Storage = /** @lends Foundation.Storage# */{
	data: {},
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
			for(var i in Foundation.Storage.data) {
				if(key.test(i)) {
					if(includeKey) {
						o.push({key: i, value: Foundation.Storage.data[i]});
					}
					else {
						o.push(Foundation.Storage.data[i]);						
					}
				}
			}
			
			return o;
		}
		else {
			if(Foundation.Storage.data[key]) {
				if(includeKey) return {key: key, value: Foundation.Storage.data[key]};
				else return Foundation.Storage.data[key];
				
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
		Foundation.Storage.data[key] = value;
		return Foundation.Storage.data[key];
	},
	
	/**
	 *	@param {mixed} key The key to remove. If string, the key will be removed, if present. You can
	 *					   provide a regex that will delete all the matching keys.
	 */
	remove: function(key) {
		if(key instanceof RegExp) {
			for(var i in Foundation.Storage.data) {
				if(key.test(i)) {
					delete Foundation.Storage.data[i];
				}
			}
		}
		else if(Foundation.Storage.data[key]) {
			value = Foundation.Storage.data[key];
			delete Foundation.Storage.data[key];
		}	
	},
	
	reset: function() {
		Foundation.Storage.data = {};
	}
};