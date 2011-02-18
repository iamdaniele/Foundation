/**
 * Provides interaction with tabs and windows.
 * @class
 */
Foundation.UI = /** @lends Foundation.UI# */ {
	
	windowConfig: {},
	windowTemplate: {},
	Event: /** @lends Foundation.UI.Event# */ {
		/**
		 * Event name for when an Android menu is available and ready to be displayed to the user.
		 * @constant
		 */
		MENU_AVAILABLE: 'Foundation.UI.menuavailable'
	},
	menu: null,
	menuButtons: [],
	/** 
	 * Path to a generic icon that can be used as a placeholder for buttons and tabs. 
	 * @constant
	 */
	GENERIC_ICON: Foundation.prefix + 'Images/FoundationGenericIcon.png',

	/**
	 * @name Foundation.UI.menuavailable
	 * Event triggered when an Android menu is available and ready to be displayed to the user.
	 * 
	 * As the menu creation is asynchronous, this event will be fired after Foundation.UI.createMenu configures
	 * the menu and a reference to the activity's menu is saved, so that you can then get it and perform futher
	 * operations. This event is fired on iOS too; this should help you to keep the same code pattern across the
	 * two platforms.
	 * @event
	 */
	
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
	 * @param {string} [params.file] The file name without path (must be under Resources/Views, Resources/iphone/Android and/or
     *								 Resources/iphone/Views) that contains the code for this window. You can also specify an URL
	 *								 to remotely download a Titanium script (currently only supports HTTP and HTTPS).
	 * @param {string} [params.requestMethod='GET'] The request method (if you are downloading a remote script)
	 * @param {object} [params.requestParams] A dictionary of parameters for the remote script request
	 * @param {number} [params.requestTimeout=10000] Timeout in milliseconds for the remote script request
	 * @returns {Ti.UI.Window} A Window instance
	 */
	createWindow: function(name, params) {
		
		params = params || {};
		params.requestMethod = ('' + params.requestMethod).toUpperCase() || 'GET';
		params.requestParams = params.requestParams || {};
		params.requestTimeout = params.requestTimeout || 10000;
		
		var filename = '';
		
		if(!params.viewless) {
			var q = [];
			if(params.file && params.file.match(/^http(s?)\:\/\//)) {
				if(params.requestMethod.toUpperCase() == 'GET') {
					
					for(var i in params.requestParams) {
						q.push(i + '=' + params.requestParams[i]);
					}
				}

				var f = Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory, new Date().getTime() + '.js');
				var r = Ti.Network.createHTTPClient();
				r.open(params.requestMethod, params.file + (params.requestMethod == 'GET' && q.length > 0 ? '?' + q.join('&') : ''), false);
				r.setTimeout(params.requestTimeout);
				r.send((params.requestMethod == 'POST' ? params.requestParams : null));				

				f.write(r.responseText);
				filename = f.nativePath;
			}
			else {
				filename = (params.file || Foundation.UI.toCamelCase(name) + '.js');

				var f = Ti.Filesystem.getFile(Ti.Filesystem.resourcesDirectory + '/' + Foundation.platformDir + '/Views/' + filename);
				if(f.exists()) {
					filename = f.nativePath;
				}
				else {
					filename = Foundation.prefix + 'Views/' + filename;
				}				
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
	 * @returns {string} 	Output string
	 */
	toCamelCase: function(s){
		return s.replace(/(\ [a-z])/ig, function($1){return $1.toUpperCase().replace(' ','');});
	},
	
	/**
	 * Returns the specified window, if exists.
	 * @param {string} name	The window name.
	 * @param {boolean} [withConfig=false] to return a dictionary with the window's current parameters.
	 * @returns {mixed} a Ti.UI.Window object or, if withConfig set to true, a dictionary with the
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
	 * @returns {object} The window template. An empty object literal will be returned if no template is set.
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
	 * @returns {object} The window opened
	 */
	openWindow: function(name, context, windowOptions, options) {
		
		windowOptions = windowOptions || null;
		options = options || {animated:true};

		Foundation.Windows[name] = Foundation.UI.createWindow(name, windowOptions || null);

		// context should be Ti.UI.currentTab or a Navigation Group instance
		context.open(Foundation.Windows[name], options);
		return Foundation.Windows[name];
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
	 * @returns {Ti.UI.Tab} The tab
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
	 * @returns {Ti.UI.TabGroup} The current TabGroup or null of the specified tabgroup is not present.
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
	},
	
	/**
	 * Returns the menu for the current activity (for Android), or the last created menu (for iOS)
	 * @returns	{mixed}	A Menu object for Android; a Ti.UI.optionDialog for iOS; null in case no menu was prepared
	 */
	getMenu: function() { return Foundation.UI.menu },

	/**
	 * Creates a menu. For Android, this method will create a native menu; for iOS, this method wraps Ti.UI.optionDialog.
	 * The underlying rationale behind this method is to wrap common code so you can hook the same functionalities to
	 * different UI controls. You may for instance use the Menu button on an Android device and a tool button on iOS
	 * while using the same code base.
	 * @param {array} items	An array of object. Each item represent the configuration for a button.
	 * @param {string} items.title The button's title
	 * @param {string} items.image Path to the button's icon
	 * @param {string} [items.order] The button's order. The lower the number, the higher the order is (i.e. set 1 to bring
	 *								 the button in the first position).
	 * @param {boolean} [items.enabled] To enable or disable the button
	 * @param {string|array} [items.platforms] The platform(s) that should display the item. Useful to hide a funcionality
	 *										   from a platform while keeping the same menu structure.
	 * @returns {mixed} null on Android, Ti.UI.optionDialog for iOS
	 */
	createMenu: function(items) {

		if(Foundation.Platform.isAndroid()) {
			var activity = Ti.Android.currentActivity;

			activity.onCreateOptionsMenu = function(e) {

				Foundation.UI.menu = e.menu;

				for(var i in items) {
					
					if(items[i].platforms) {
						if(Foundation.isArray(items[i].platforms) && items[i].platforms.indexOf(Foundation.Platform.ANDROID) == -1) {
							continue;
						}
						else if(items[i].platforms != Foundation.Platform.ANDROID) {
							continue;
						}
					}

					var button = e.menu.add(items[i]);

					if(items[i].image) {
						button.setIcon(items[i].image);					
					}

					if(items[i].callback) {
						button.addEventListener('click', items[i].callback);						
					}
					
					if(typeof items[i].enabled != 'undefined' && items[i].enabled === false) {
						button.enabled = false;
					}

					Foundation.UI.menuButtons.push(button);
				}

				Ti.App.fireEvent(Foundation.UI.Event.MENU_AVAILABLE);
				
				return null;
			}				
		}
		else if(Foundation.Platform.isIOS()) {
			var titles = [];
			Foundation.UI.callbacks = [];

			for(var i in items) {

				// filter disabled items
				if(typeof items[i].enabled != 'undefined' && items[i].enabled === false) {
					continue;
				}
				if(items[i].platforms) {
					if(Foundation.isArray(items[i].platforms) && items[i].platforms.indexOf(Foundation.Platform.IOS) == -1) {
						continue;
					}
					else if(!Foundation.isArray(items[i].platforms) && items[i].platforms != Foundation.Platform.IOS) {
						continue;
					}
				}

				titles.push(items[i].title);
				Foundation.UI.callbacks.push(items[i].callback);
			}

			titles.push('Cancel');
			
			Foundation.UI.menu = Ti.UI.createOptionDialog({
				options: titles,
				cancel: titles.length - 1
			});
			
			Ti.API.info('cancel: ' + (titles.length - 1));
			
			Foundation.UI.menu.addEventListener('click', function(e) {

				if(e.index != e.cancel && Foundation.UI.callbacks[e.index]) {
					Foundation.UI.callbacks[e.index]();
				}
			});

			Ti.App.fireEvent(Foundation.UI.Event.MENU_AVAILABLE);
			
			return Foundation.UI.menu;
		}
	}
};