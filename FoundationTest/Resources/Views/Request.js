({
	text: Ti.UI.currentTab.title,
	app: Ti.UI.currentWindow.app,
	win: Ti.UI.currentWindow,
	
	jsonpTest: function() {
		
		this.app.foundation.UI.openWindow('Cats pictures (Flickr API)', Ti.UI.currentTab, {file: 'jsonpTest.js'});
		
	},
	
	init: function() {
		
		var data = [
			{title: 'JSONP request', fn: 'jsonpTest', hasChild: true}
		];
		
		var table = Ti.UI.createTableView({
			data: data
		});

		var self = this;
		table.addEventListener('click', function(e) {
			if(typeof self[e.rowData.fn] == 'function') {
				self[e.rowData.fn].apply(self);
			}
		});
		
		this.win.add(table);
		
	}
}).init();