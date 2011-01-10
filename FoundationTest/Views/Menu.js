({
	app: Ti.UI.currentWindow.app,
	f: Ti.UI.currentWindow.app.foundation,
	win: Ti.UI.currentWindow,

	init: function() {
		
		Ti.App.addEventListener(this.f.UI.Event.MENU_AVAILABLE, function() {
			Ti.API.info('menu available (event triggered)');
		});
		
		var menu = this.f.UI.createMenu([
			{
				title: 'Alert',
				image: this.f.UI.GENERIC_ICON,
				callback: function() {
					alert('Triggered from Menu: Alert button');
				}
			},
			{
				title: 'Disabled',
				image: this.f.UI.GENERIC_ICON,
				enabled: false
			},
			{
				title: 'Android only',
				platforms: this.f.Platform.ANDROID
			},
			{
				title: 'iOS only',
				platforms: this.f.Platform.IOS
			},
			{
				title: 'Android & iOS (default)',
				platforms: [this.f.Platform.ANDROID, this.f.Platform.IOS]
			}
		]);
		
		if(this.f.Platform.isAndroid()) {
			this.win.add(Ti.UI.createLabel({text: 'Press the Menu button on your device.', textAlign: Ti.UI.TEXT_ALIGNMENT_CENTER}));			
		}
		else if(this.f.Platform.isIOS()) {
			
			var self = this;
			
			this.win.add(Ti.UI.createLabel({text: 'Press the top right button', textAlign: Ti.UI.TEXT_ALIGNMENT_CENTER}));
			var button = Ti.UI.createButton({systemButton: Ti.UI.iPhone.SystemButton.ACTION});
			button.addEventListener('click', function() {
				menu.show();
			});
			
			self.win.rightNavButton = button;
		}
	}
}).init();