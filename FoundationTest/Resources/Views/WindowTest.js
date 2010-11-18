({
	win: Ti.UI.currentWindow,
	app: Ti.UI.currentWindow.app,
	
	init: function() {
		var self = this;
		
		var label1 = Ti.UI.createLabel({text: 'New window created.', top: 20});
		
		var foundationContextAvailable = 'Foundation context available: ' + (typeof this.app.foundation != 'undefined' ? 'yes' : 'no');
		
		var label2 = Ti.UI.createLabel({text: foundationContextAvailable, top: 50});
		var closeButton = Ti.UI.createButton({title: 'Close', bottom: 10, height: 30});
		closeButton.addEventListener('click', function() {
			self.win.close();
		})
		this.win.add(label1);
		this.win.add(label2);
		
		if(!this.win.hideCloseButton) {
			this.win.add(closeButton);			
		}
	}
}).init();