({
	app: Ti.UI.currentWindow.app,
	win: Ti.UI.currentWindow,

	init: function() {
		
		this.win.add(Ti.UI.createLabel({text: 'This is a custom Android view!'}));
		
		var button = Ti.UI.createButton({title: 'Close', bottom: 10});

		var self = this;
		button.addEventListener('click', function() {
			self.win.close();
		})
		
	}
}).init();