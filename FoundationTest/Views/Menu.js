({
	app: Ti.UI.currentWindow.app,
	win: Ti.UI.currentWindow,

	init: function() {
		
		var menu = this.app.foundation.UI.createMenu([
			{
				title: 'Alert',
				image: this.app.foundation.UI.GENERIC_ICON,
				callback: function() {
					alert('Triggered from Menu: Alert button');
				}
			},
			{
				title: 'Disabled',
				image: this.app.foundation.UI.GENERIC_ICON,
				enabled: false
			}
		]);
		
		if(this.app.foundation.Platform.isAndroid()) {
			this.win.add(Ti.UI.createLabel({text: 'Press the Menu button on your device.'}));			
		}
		else if(this.app.foundation.Platform.isIOS()) {
			
			var self = this;
			
			this.win.add(Ti.UI.createLabel({text: 'Press the top right button'}));
			var button = Ti.UI.createButton({systemButton: Ti.UI.iPhone.SystemButton.ACTION});
			button.addEventListener('click', function() {
				menu.show();
			});
			
			self.win.rightNavButton = button;
		}

	}
}).init();