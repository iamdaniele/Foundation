/**
 * Microframework to make a Titanium developer life's easier.
 * @class
 */
var Foundation = /** @lends Foundation# */ {
	Windows: {},
	Tabs: {},
	TabGroup: null,
	Platform:{
		IOS: 'iPhone OS',
		ANDROID: 'Android',
		isIOS: function() {return Ti.Platform.name == 'iPhone OS' },
		isAndroid: function() {return Ti.Platform.name == 'Android'}
	}
};

/**
 * Extends objects (literals). Useful where you need to add properties to an object or to override
 * properties or methods. This method is not recursive (i.e. only copies plain objects or references)
 * and does not overwrite its arguments.
 *
 * @param {Object} [object] The first object
 * @param {Object[]} [...] Optional objects
 * @return {Object} The augmented object.
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
}

/**
 * Provides interaction with tabs and windows.
 */
Foundation.UI = /** @lends Foundation.UI# */ {
	
	windowConfig: {},
	
	/**
	 * Creates a new window as you would expect Titanium to do, but appends Foundation and the app namespace
	 * to it.
	 * @param {string} name	The window name. It will be used for internal reference, as well to
	 *						fetch the file that contains the view's code. To comply to Foundation's naming
	 * 						conventions, any space will be trimmed. So, if your window title is “Apples and 
	 *						Oranges”, this method will fetch the file ApplesAndOranges.js.
	 *						Specify viewless: true to create a window without loading its relative file.
	 * @param {string} params The configuration options, same as Titanium's parameters.
	 * @return {Ti.UI.Window} A Window instance
	 */
	createWindow: function(name, params) {
		
		params = params || {};

		var config = Foundation.UI.windowConfig[name] = {
			title: name,
			backgroundColor: '#fff',
			url: 'Views/' + name.replace(/ /g, '') + '.js'
		};

		if(params) {
			config = Foundation.augment(config, params);
		}
		
		if(config.viewless) {
			delete config.url;
			delete Foundation.UI.windowConfig[name].url;
		}
		
		Foundation.Windows[name] = Ti.UI.createWindow(config);	

		// append instance strictly *after* creating the window,
		// otherwise will crash
		Foundation.Windows[name].app = app;
		Foundation.Windows[name].f = Foundation.Windows[name].foundation = Foundation;

		return Foundation.Windows[name];
	},
	
	/**
	 * Returns the specified window, if exists.
	 * @param {string} name	The window name.
	 * @param {boolean} [withConfig=false] to return a dictionary with the window's current parameters.
	 * @return {mixed} a Ti.UI.Window object or, if withConfig set to <pre>true</pre>, a dictionary with the
	 * 					properties <pre>win</pre> (the window instance) and <pre>config</pre> (the window configuration).
	 */
	getWindow: function(name, withConfig) {
		if(Foundation.Windows[name]) {
			return withConfig ? {win: Foundation.Windows[name], config: Foundation.UI.windowConfig[name]} : Foundation.Windows[name];
		}
		else {
			return null;
		}
	},

	/**
	 * Opens a new window and creates it if needed. Internally calls Foundation.UI.createWindow, so it works
	 * in a similar way. You should always prefer this method over createwindow, unless you don't need to open
	 * the window right away.
	 *
	 * @param {string} name	The name to assign to the window. It will be used for internal reference and to
	 *						fetch the file that contains the views's code.
	 * @param {mixed} context A Ti.UI.TabbedBar or Ti.UI.iPhone.NavigationGroup object in which the window
	 *						  should be open
	 * @param {object} [windowOptions] A dictionary of properties as Ti.UI.createWindow would expect
	 * @param {object} [options] A dictionary of properties as Ti.UI.TabbedBar or Ti.UI.iPhone.NavigationGroup
	 * 							 would expect.
	 */
	openWindow: function(name, context, windowOptions, options) {
		
		windowOptions = windowOptions || null;
		options = options || {animated:true};

		Foundation.Windows[name] = Foundation.UI.createWindow(name, windowOptions || null);

		// context should be Ti.UI.currentTab or a Navigation Group instance
		context.open(Foundation.Windows[name], options);
	},
	
	/**
	 * Creates a new tab and appends it to the tab group. For the moment only one tab group is allowed in a
	 * Foundation application, so it will be automatically created if needed.
	 *
	 * @param {string} name	The name to assign to the window. It will be used for internal reference and to
	 *						fetch the file that contains the views's code.
	 * @param {object} [windowOptions] A dictionary of properties as Ti.UI.createTab would expect
	 * @param {object} [options] A dictionary of properties as Ti.UI.createWindow would expect
	 * @return {Ti.UI.Tab} The tab
	 */
	createTab: function(name, tabOptions, winOptions) {
		
		tabOptions = tabOptions || {};
		winOptions = winOptions || null;
		
		// create a tabgroup if none has been created before
		if(Foundation.TabGroup == null) {
			Foundation.TabGroup = Ti.UI.createTabGroup();			
		}

		// creates a window if doesn't exists. The window will have the same name
		// as the tab.
		if (typeof name == 'string' && !Foundation.Windows[name]) {
			var win = Foundation.UI.createWindow(name, winOptions);
		}
		
		var options = {
			title: name,
			backgroundColor: '#444'
		};

		var icon = Ti.Filesystem.getFile(Ti.Filesystem.resourcesDirectory + '/Images/' + name.replace(/ /g, '') + '.png');

		if(icon.exists()) {
			options.icon = icon.nativePath;
		}
		else {
			options.icon = 'Images/FoundationGenericTab.png';
		}

		tabOptions = Foundation.augment(options, tabOptions);
		tabOptions.window = tabOptions.window || Foundation.Windows[name];
		
		Foundation.Tabs[name] = Ti.UI.createTab(tabOptions);
		Foundation.TabGroup.addTab(Foundation.Tabs[name]);
		
		return Foundation.Tabs[name];
	},

	/**
	 * Return the current tab group.
	 * @return {Ti.UI.TabGroup} The current TabGroup
	 */
	tabGroup: function() { return Foundation.TabGroup; }
};

Ti.include('Foundation/Storage.js');

/**
 * Your app's namespace. Extend this object to have its properties and methods cross-referenced across all
 * the execution contexts.
 */
var app = {foundation: Foundation};
