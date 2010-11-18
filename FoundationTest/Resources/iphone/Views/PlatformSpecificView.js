({
	app: Ti.UI.currentWindow.app,
	win: Ti.UI.currentWindow,

	init: function() {
		
		this.win.add(Ti.UI.createLabel({text: 'This is a custom iOS view!'}));
		
	}
}).init();