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
};

/**
 * Provides interaction with tabs and windows.
 * @class
 */
Foundation.UI = /** @lends Foundation.UI# */ {
	
	windowConfig: {},
	windowTemplate: {},
	
	/**
	 * Creates a new window as you would expect Titanium to do, but appends Foundation and the app namespace
	 * to it. Also, this method will choose the right view to use for the window, provided that you have custom views.
	 * If you want to use a custom view (sometimes referred as platform-specific views), create the path Resources/iphone/Views
	 * and/or Resources/android/Views. Those paths will be checked first. If no custom view is found there, Foundation will use
	 * the default path (Resources/Views).
	 *
	 * @param {string} name	The window name. It will be used for internal reference, as well to
	 *						fetch the file that contains the view's code. To comply to Foundation's naming
	 * 						conventions, any space will be trimmed. So, if your window title is “Apples and 
	 *						oranges”, this method will fetch the file ApplesAndOranges.js (with a space-to-camelCase conversion).
	 * @param {object} params The configuration options, same as Titanium's parameters.
	 * @param {boolean} [params.viewless] true to create a window without loading its relative file
	 * @param {string} [params.file] the file name without path (must be under Resources/Views, Resources/iphone/Android and/or
     *								 Resources/iphone/Views) that contains the code for this window
	 * @return {Ti.UI.Window} A Window instance
	 */
	createWindow: function(name, params) {
		
		params = params || {};
		
		var filename = '';
		
		if(!params.viewless) {
			filename = (params.file || Foundation.UI.toCamelCase(name) + '.js');

			var f = Ti.Filesystem.getFile(Ti.Filesystem.resourcesDirectory + '/' + Foundation.platformDir + '/Views/' + filename);
			if(f.exists()) {
				filename = f.nativePath;
			}
			else {
				filename = Foundation.prefix + 'Views/' + filename;
			}
		}
		
		var config = Foundation.UI.windowConfig[name] = {
			title: name,
			backgroundColor: '#fff',
			url: filename
		};

		if(params) {
			config = Foundation.augment(config, Foundation.UI.windowTemplate, params);
		}
		
		if(config.viewless) {
			delete config.url;
			delete Foundation.UI.windowConfig[name].url;
		}
		
		Foundation.Windows[name] = Ti.UI.createWindow(config);	

		// append instance strictly *after* creating the window,
		// otherwise will crash
		Foundation.Windows[name].app = app;
		Foundation.Windows[name].id = name;
		Foundation.Windows[name].f = Foundation.Windows[name].foundation = Foundation;

		return Foundation.Windows[name];
	},
	
	/**
	 * Returns a CamelCase string
	 * @private
	 * @param {string} s	Input string
	 * @return {string} 	Output string
	 */
	toCamelCase: function(s){
		return s.replace(/(\ [a-z])/ig, function($1){return $1.toUpperCase().replace(' ','');});
	},
	
	/**
	 * Returns the specified window, if exists.
	 * @param {string} name	The window name.
	 * @param {boolean} [withConfig=false] to return a dictionary with the window's current parameters.
	 * @return {mixed} a Ti.UI.Window object or, if withConfig set to true, a dictionary with the
	 * 					properties win (the window instance) and config (the window configuration).
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
	 * Returns the current window template, if set.
	 * @return {object} The window template. An empty object literal will be returned if no template is set.
	 */
	getWindowTemplate: function() { return Foundation.UI.windowTemplate; },

	/**
	 * Applies and stores a window template.
	 * @param {object} template The template to apply.
	 */
	setWindowTemplate: function(template) {
		
		for(var name in Foundation.Windows) {
			for(var i in template) {
				Foundation.Windows[name][i] = template[i];
			}
		}				
		
		Foundation.UI.windowTemplate = template;
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
	 * Foundation application, so it will be automatically created if needed.<br/><br/>
	 *
	 * Foundation will use the window name to get the right view and apply the tab icon so, if you name a window
	 * “Apples and oranges”, Foundation will look for ApplesAndOranges.js and ApplesAndOranges.png.
	 * @param {string} name	The name to assign to the window. It will be used for internal reference and to
	 *						fetch the file that contains the views's code.
	 * @param {object} [tabOptions] A dictionary of properties as Ti.UI.createTab would expect
	 * @param {string} [tabOptions.icon] Path to the tab's icon, in case its name does not match the window's name
	 * @param {object} [winOptions] A dictionary of properties as Foundation.UI.createWindow would expect
	 * @return {Ti.UI.Tab} The tab
	 */
	createTab: function(name, tabOptions, winOptions) {
		
		tabOptions = tabOptions || {};
		winOptions = winOptions || null;
		
		// create a tabgroup if none has been created before
		if(Foundation.currentTabGroup === null) {
			Foundation.UI.createTabGroup();
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
		
		if(tabOptions.icon) {
			options.icon = tabOptions.icon;
		}
		else {
			var icon = Ti.Filesystem.getFile(Ti.Filesystem.resourcesDirectory + '/Images/' + Foundation.UI.toCamelCase(name) + '.png');

			if(icon.exists()) {
				options.icon = icon.nativePath;
			}
			else {
				options.icon = Foundation.prefix + 'Images/FoundationGenericIcon.png';
			}			
		}

		tabOptions = Foundation.augment(options, tabOptions);
		tabOptions.window = tabOptions.window || Foundation.Windows[name];
		
		Foundation.Tabs[name] = Ti.UI.createTab(tabOptions);
		Foundation.Tabs[name].id = name;
		Foundation.Tabs[name].mainWindowId = name;
		Foundation.UI.tabGroup().addTab(Foundation.Tabs[name]);
		
		return Foundation.Tabs[name];
	},

	/**
	 * Return the specifies tab group.
	 * @param {string} [tabGroupId] The tab group identifier. Leave empty to return the current active tabgroup.
	 * @return {Ti.UI.TabGroup} The current TabGroup or null of the specified tabgroup is not present.
	 */
	tabGroup: function(tabGroupId) {
		tabGroupId = tabGroupId || Foundation.currentTabGroup;
		return Foundation.TabGroups[tabGroupId]; 
	},
	
	/**
	 * Closes the current active tabgroup and opens the specified tabgroup.
	 * @param {string} [tabGroupId] The tab group identifier. Leave empty to close and reopen the current active tabgroup;
	 */
	openTabGroup: function(tabGroupId) {
		
		tabGroupId = tabGroupId || Foundation.currentTabGroup;
		
		Foundation.TabGroups[Foundation.currentTabGroup].close();
		Foundation.TabGroups[tabGroupId].open();
		
		Foundation.currentTabGroup = tabGroupId;
	},
	
	/**
	 * Creates a tab group.
	 * @param {string} [tabGroupId] The tab group identifier.
	 * @param {object} [params] The params to give to the tab group, as Ti.UI.createTabGroup would expect.
	 * @returns {Ti.UI.tabGroup} A Ti.UI.tabGroup instance
	 */
	createTabGroup: function(tabGroupId, params) {

		params = params || {};
		
		if(tabGroupId instanceof Object) {
			params = tabGroupId;
			tabGroupId = Foundation.tabGroupCounter;
			Foundation.tabGroupCounter++;
		}
		else if(!tabGroupId) {
			tabGroupId = Foundation.tabGroupCounter;
			Foundation.tabGroupCounter++;
		}
		
		Foundation.TabGroups[tabGroupId] = Ti.UI.createTabGroup(params);
		
		if(Foundation.currentTabGroup === null) {
			Foundation.currentTabGroup = tabGroupId;
		}
		
		return Foundation.TabGroups[tabGroupId];
	}
};

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