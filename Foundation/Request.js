/**
 * Performs XHR requests using Ti.Network.HTTPClient.
 * @class
 */
Foundation.Request = /** @lends Foundation.Request# */ {
	Event: {LOAD:'Foundation.Request.Event.LOAD', ERROR: 'Foundation.Request.Event.ERROR'},
	CALLBACK_NAME: 'Foundation.Request.callback',
		
	// converts an object into a querystring
	serialize: function(params, string, parent) {
		string = string || '';
		parent = parent || '';

		// is array
		for(var i in params) {
			if(Foundation.isArray(params[i])) {
				string = Foundation.Request.serialize(params[i], string, parent != '' ? '['+i+'][]': i + '[]') + '&';
			}
			else if(Foundation.isObject(params[i])) {
				string = Foundation.Request.serialize(params[i], string, parent != '' ? '['+i+']': i) + '&';
			}
			else {
				var p = "";
				if(isNaN(i)) {
					p = parent != '' ? parent + '['+i+']' : i;
				}
				else {
					p = parent;
				}
				
				p += '=';
				string += p + params[i] + '&';				
			}

		}

		string = string.replace(/\&$/,'');
		return encodeURIComponent(string);
	},
	
	// This method is executed as callback for a JSONP request
	callback: function(response) { return JSON.parse(response); },
	
	/**
	 * Prepares a JSON/JSONP request using the specified method.
	 * This method internally proxies Titanium.HTTPClient, so further scrambling can be made, which means that:
	 * <ul>
	 * <li>This method performs a request and parses the result to get a valid JSON object, keeping the original
	 * response.</li>
	 * <li>This method can perform a JSONP request with a specified callback name, or use the default one.</li>
	 * </ul>
	 * This method will return a proxy to an instance of Titanium.HTTPClient, which means that you will still be able
	 * to use the same (documented) entry points you should expect to find on that object.
	 * 
	 * @param	{String}	url		The request URL
	 * @param	{String}	[type="GET"]		The type of request. So far, GET and POST are been tested successfully. Titanium
	 *									should support PUT and DELETE, although these methods haven't been tested.
	 * @param	{Object}	[options]		A dictionary of options specific to Foundation.Request
	 * @param	{String}	[options.user]	Username for HTTP basic authentication
	 * @param	{String}	[options.pass]	Password for HTTP basic authentication
	 * @param	{Boolean}	[options.authentication=false] Enables or disabled basic authentication for the current request.
	 *									If true, you must provide username and password.
	 * @param	{Boolean|String} [options.jsonCallback] True to use Foundation's internal callback (Foundation.Request.callback). You can provide a function name
	 *									if you need a different callback. The function must accept the response body as parameter.
	 * @return {Object}					A proxy to Ti's HTTPClient. You should expect to use the same entry points as it.
	 */
	json: function(url, type, options) {
		
		options = options || {};
		
		var user = options.user || "";
		var pass = options.pass || "";
		
		var jsonp = "";
		
		if(options.jsonpCallback) {
			if(options.jsonpCallback === true) {
				jsonp = 'callback=' + Foundation.Request.CALLBACK_NAME;
			}
			else if(typeof options.jsonpCallback == 'string') {
				jsonp = 'callback=' + options.jsonpCallback;
			}
		}
				
		type = type || 'GET';
		
		var req = Ti.Network.createHTTPClient();
		
		req.open(type, url + (jsonp != '' ? '?' : '') + jsonp);

		if(options.authentication) {
			req.setRequestHeader('Authorization', 'Basic ' + Ti.Utils.base64encode(user+':'+pass));			
		}

		// Proxy for HTTPClient.
		return new function FoundationTiHTTPClientProxy() {
			this.timeout = 0;
			// wraps the original setTimeout so that I can store the user's timeout
			this.setTimeout = function(msec) {this.timeout = msec; req.setTimeout(msec);}
			
			// initialize onload and onerror to empty functions so it won't fail layer if the user doesn't specify any
			this.onload = function() {};
			this.onerror = function() {};
			
			// wraps the original send method, so I can pass an object to it and Titanium won't complain
			this.send = function(data) {

				// if a GET request and we have a dictionary of parameters, convert them into a query string
				if(data && type.toUpperCase() == 'GET' && typeof data != 'string') {
					params = [];
					for(var i in data) {
						params.push(i + '=' + data[i]);
					}
					
					data = (jsonp != '' ? '&' : '') + params.join('&');
				}
				
				// if GET, I need to reconfigure the request because I need to append the query string,
				// so let's reopen the connection
				if(type.toUpperCase() == 'GET') {
					data = data || "";
					req.open(type, url + (jsonp != '' || data != '' ? '?' : '') + jsonp + data);					
					if(this.timeout > 0) {
						req.setTimeout(this.timeout);
					}

					if(options.authentication) {
						req.setRequestHeader('Authorization', 'Basic ' + Ti.Utils.base64encode(user+':'+pass));			
					}
				}

				// don't put any data into the request body if GET, otherwise Titanium will automatically
				// transform it into a POST request
				if(type.toUpperCase() == 'GET') {
					req.send();									
				}
				else {
					req.send(data || null);
				}

			}

			var self = this;
			// delegate events
			req.onerror = function() { self.onerror.apply(this, arguments); };
			req.onload = function() {

				// responseJSON will be available in the function body and hopefully should
				// contain the response body in JSON format ready to be used
				try {
					this.responseJSON = JSON.parse(this.responseText);
				} catch(e) {
					Ti.API.error('[Foundation.Request.json] Exception while parsing JSON response: ' + e);
					this.responseJSON = null;
				}

				self.onload.call(this, arguments);
			};
			
			return this;
		};
	}
};