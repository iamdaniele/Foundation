What is Foundation
==================

It's a MVC microframework for [Appcelerator Titanium Mobile](http://appcelerator.com) that adds some niceness and helps you to keep your code tidy. Right now there are just a couple of methods, but it should give enough separation between controllers and views.

Foundation works only with Titanium Mobile 1.5.

What's inside
=============

*	 Ability to work with Android and iOS. Use the same syntax to do the same thing (See Foundation.UI.createMenu for instance).
*    The ability to have platform-specific views or to override a default view given a platform. Just place your view file under Resources/iphone/Views, or Resources/android/Views, and it will be picked.
*	 Window templates: specify a dictionary of properties for a window and it will be automatically applied on-the-fly to all your windows. It comes in handy when you want implements color schemes or themes.
*    Views: open and create windows easily. Create a tab group and assign windows to it. Store windows in a central place so that will be accessible from the controllers. No need to specify icon and file paths. Spaces allowed.
*    Storage: runtime storage, both persistent (through Ti.App.Properties) and volatile, useful to store and share data and object among execution contexts. Can be used in conjunction with Ti.App.addEventListener to pass data other than JSON. It features a live key listener watching event, so that you can perform actions when a value changes or goes away.
*    Request: JSON/JSONP support that automatically does the JSON parsing for you, passing GET parameters as dictionary and built-in HTTP basic authentication.
*	 A KitchenSink-like test suite (hopefully should provide some docs too).
*	 API documentation, both online and throughout the code.
*	 Possibly some bugs.

What's coming
=============

*	 Enhance what a platform-specific view can do for you.
*    The ability to package a Universal App (that is, a single build that fits both iPhone and iPad).
*    Database API.
*	 Much more.

License
=======

MIT license.
