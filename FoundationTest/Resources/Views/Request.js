({
	text: Ti.UI.currentTab.title,
	app: Ti.UI.currentWindow.app,
	win: Ti.UI.currentWindow,
	label: null,
	tabIndex: 1,
	flickrApiUrl: 'http://api.flickr.com/services/feeds/photos_public.gne',
	
	jsonpTest: function() {
		var win = this.app.foundation.UI.createWindow('Cats pictures (Flickr API)', {viewless: true, modal: true});
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
			
			if(self.app.foundation.Platform.isAndroid()) {
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
			}
			else {
				var images = [];
				
				for(var i in this.responseJSON.items) {
					images.push(this.responseJSON.items[i].media.m);
				}
				
				var scrollView = Ti.UI.createCoverFlowView({
					images: images
				});
			}


			var closeButton = Ti.UI.createButton({title: 'Close', bottom: 10, height: 30});
			closeButton.addEventListener('click', function() {
				win.close();
			});


			win.add(scrollView);
			win.add(closeButton);
			win.open();

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