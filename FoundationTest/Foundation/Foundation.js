/**
 * Microframework to make a Titanium developer life's easier.
 * @class
 * @namespace
 */
var Foundation = /** @lends Foundation# */ {
	Windows: {},
	Tabs: {},
	currentTabGroup: null,
	tabGroupCounter: 0,
	TabGroups: {},
	Platform:{
		IOS: 'iPhone OS',
		ANDROID: 'android',
		IOS_DIR: 'iphone',
		ANDROID_DIR: 'android',
		isIOS: function() {return Ti.Platform.name == Foundation.Platform.IOS; },
		isAndroid: function() {return Ti.Platform.name == Foundation.Platform.ANDROID; },
		isSimulator: function() { return (Titanium.Platform.model == 'google_sdk' || Titanium.Platform.model == 'Simulator'); }
	}
};

Foundation.platformDir = Foundation.Platform.isIOS() ? Foundation.Platform.IOS_DIR : Foundation.Platform.ANDROID_DIR;
Foundation.prefix = Foundation.Platform.isIOS() ? '' : '/';

/**
 * Extends objects (literals). Useful where you need to add properties to an object or to override
 * properties or methods. This method is not recursive (i.e. only copies plain objects or references)
 * and does not overwrite its arguments.
 *
 * @param {Object} [object] The first object
 * @param {Object[]} [...] Optional objects
 * @returns {Object} The augmented object.
 */
Foundation.augment = function() {
	var base = {};
	for(var i = 0; i < arguments.length; i++) {
	
		src = arguments[i];

		if(typeof src == 'object' && src !== null) {

			for(var key in src) {
				base[key] = src[key];
			}
	
		}		
	}
	
	return base;
};

Ti.include(Foundation.prefix + 'Foundation/UI.js');
Ti.include(Foundation.prefix + 'Foundation/Request.js');
Ti.include(Foundation.prefix + 'Foundation/Storage.js');	
Ti.include(Foundation.prefix + 'Foundation/PersistentStorage.js');	

/**
 * @namespace Your app's namespace. Extend this object to have its properties and methods referenced across all
 * the execution contexts. The namespace is prefilled with the foundation namespace, so you can avail
 * it from within your view.
 * This namespace will be available as a window property, which means it will be accessible from Ti.UI.currentWindow.app.
 * 
 */
var app = {
	/**
	 * Reference to Foundation
	 */
	foundation: Foundation
};