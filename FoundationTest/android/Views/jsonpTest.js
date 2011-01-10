({
	win: Ti.UI.currentWindow,
	app: Ti.UI.currentWindow.app,
	flickrApiUrl: 'http://api.flickr.com/services/feeds/photos_public.gne',
	
	init: function() {

		var loading = Ti.UI.createActivityIndicator({message: 'Loading data from Flickr…'});
		loading.show();
		var req = this.app.foundation.Request.json(this.flickrApiUrl, 'GET', {
			jsonpCallbackParam: 'jsoncallback'
		});

		var self = this;	
		req.onload = function() {
			loading.hide();

			if(typeof this.responseJSON.items == 'undefined') {
				alert('Invalid response received from Flickr.');
				return false;
			}


			var scrollView = Ti.UI.createScrollView({top: 40, height: 180, contentHeight: 180});				
			var left = 0;

			for(var i in this.responseJSON.items) {
				var img = Ti.UI.createImageView({
					image: this.responseJSON.items[i].media.m,
					top: 10,
					left: left,
				});

				scrollView.add(img);				
				left += 270;
			}

			self.win.add(scrollView);
		}
		
		req.onerror = function() {
			loading.hide();
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