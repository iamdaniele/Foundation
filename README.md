What is Foundation
==================

It's a MVC microframework for [Appcelerator Titanium](http://appcelerator.com) that adds some niceness and helps you to keep your code organized. Right now there are just a couple of methods, but it should give enough separation between controllers and views.

What's inside
=============

*	 Ability to work with Android and iOS (since Titanium Mobile 1.5.0).
*    Views: open and create windows easily. Create a tab group and assign windows to it. Store windows in a central place so that will be accessible from the controllers. No need to specify icon and file paths.
*    Storage: runtime storage, both persistent (through Ti.App.Properties) and volatile, useful to store and share data and object among execution contexts. Can be used in conjunction with Ti.App.addEventListener to pass data other than JSON. It features a live key listener watching event, so that you can perform actions when a value changes or goes away.
*    Request: JSON/JSONP support that automatically does the JSON parsing for you, passing GET parameters as dictionary and built-in HTTP basic authentication.
*	 A KitchenSink-like test suite.

What's coming
=============

*    The ability to have platform-specific views (e.g., in an Android's Tab view, position the leftNavButton and rightNavButton somewhere else).
*    The ability to package an Universal App (that is, a single build that fits both iPhone and iPad).
*    Database API.
*    Complete test suite.

License
=======

MIT license.
