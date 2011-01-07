({
	win: Ti.UI.currentWindow,
	app: Ti.UI.currentWindow.app,
	flickrApiUrl: 'http://api.flickr.com/services/feeds/photos_public.gne',
		
	init: function() {

		var loading = Ti.UI.createActivityIndicator({
			message: 'Loading data from Flickr…',
			style: Titanium.UI.iPhone.ActivityIndicatorStyle.PLAIN,
			color: '#fff',
			font: {fontSize: 15, fontWeight: 'bold'}
		});
		loading.show();
		this.win.setToolbar([loading], {animated: true});

		var req = this.app.foundation.Request.json(this.flickrApiUrl, 'GET', {
			jsonpCallbackParam: 'jsoncallback'
		});
			
		var self = this;	
		req.onload = function() {
			self.win.setToolbar(null, {animated: true});

			if(typeof this.responseJSON.items == 'undefined') {
				alert('Invalid response received from Flickr.');
				return false;
			}
			
			var images = [];
			
			for(var i in this.responseJSON.items) {
				images.push(this.responseJSON.items[i].media.m);
			}
			
			var scrollView = Ti.UI.createCoverFlowView({
				images: images
			});

			self.win.add(scrollView);
		}
		
		req.onerror = function() {
			self.win.setToolbar(null, {animated: true});
			Ti.API.error('error ' + this.status + ': ' + this.responseText);
			alert('An error occurred. See the logs for more information.');
		}
		
		req.setTimeout(10000);
		req.send({
			tags: 'cat',
			format: 'json',
			limit: 14
		});
	}
}).init();