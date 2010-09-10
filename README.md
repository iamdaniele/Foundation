What is Foundation
==================

It's a MVC microframework for [Appcelerator Titanium](http://appcelerator.com) that adds some niceness and code organization. Right now there are just a couple of methods, but it should give enough separation between controllers and views.

What's inside
=============

*    Views: open and create windows easily. Create a tab group and assign windows to it. Store windows in a central place so that will be accessible from the controllers.
*    Storage: runtime storage, useful to store and share data and object among execution contexts. Can be used in conjunction with Ti.App.addEventListener to pass data other than JSON.

What's coming
=============

*    Request: JSONP support that automatically does the JSON parsing for you, passing GET parameters as dictionary.
*    Documentation build (for now, just inline doclets you can build yourself using [jsdoc-toolkit](http://code.google.com/p/jsdoc-toolkit/)).

License
=======

MIT license.