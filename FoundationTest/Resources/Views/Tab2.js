var Test = {
	text: Ti.UI.currentTab.title,
	label: null,
	
	init: function() {
		alert(Test.text + ' init');
		Test.label = Ti.UI.createLabel({text: Test.text, color: '#999'});
		Ti.UI.currentWindow.add(Test.label);
	}
}

Test.init();