/**
 * Provides local, memory-based runtime storage.
 * 
 * This class allows you to store key/value pairs of data. You can attach whatever type of data you need (such as object literals, JSON data,
 * object references and so on), and assign it to a key. It is very trivial for the moment, i.e. it is a basic getter/setter object, but
 * it should grow to provide a generic interface that can be used to made different types of storage (Titanium DB storage, localStorage etc.).
 * Currently the data is stored into your device's memory, so it makes this module suitable for runtime storage/caching.
 *
 * @class
 */
Foundation.Storage = /** @lends Foundation.Storage# */{
	data: {},
	/**
	 * Get an item from the storage.
	 * @param {string} key The key
	 * @return {mixed} The value or null if the value is not present
	 */
	get: function(key) {
		return Foundation.Storage.data[key] || null;
	},
	
	/**
	 * Stores the specified value as a key. It the key doesn't exist it will be created, otherwise the existing value will be
	 * overwritten.
	 * @param {string} key The key
	 * @param {mixed} value The value to store
	 * @return {mixed} The stored value
	 */
	set: function(key, value) {
		Foundation.Storage.data[key] = value;
		return Foundation.Storage.data[key];
	},
	
	/**
	 * Deletes a value from the dictionary.
	 * @param {string} key The key
	 * @return {mixed} The value deleted or null if no data was found.
	 */
	remove: function(key) {
		value = null;
		if(Foundation.Storage.data[key]) {
			value = Foundation.Storage.data[key];
			delete Foundation.Storage.data[key];
		}
		return value;
	},
	
	/**
	 * Wipes the entire dictionary.
	 */
	reset: function() {
		Foundation.Storage.data = {};
	}
};