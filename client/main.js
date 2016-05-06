import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';

import './main.html';

Template.configForm.helpers({
	'isChecked': function() {
		var value = $(this).value;
		var relations = Session.get("Relationship");
		console.log(relations);
		return  (relations && (relations.indexOf(value) >= 0)) ? "checked" : "";
	}
});

Template.configForm.events({
	'submit form': function(event) {
		event.preventDefault();
		Meteor.call('loadConfigJSON', function(error, result) {
			var configJSON = getUserInput(event, result);
			clearUserInput(event);
			Meteor.call('generateConfigJSON', configJSON, function(error, result){
				if(error) {
					console.err(error);
				} else {
					Meteor.call('runRuby', result, function (err, response) {
  						console.log(response);
  					});
				}
			});
		});
	},
	'click .relationship': function(event) {
		if(Session.get("Relationship")) {
			var relations = Session.get("Relationship").slice();
			if($(event.target).is(":checked")) {
				relations.push(event.target.value);				
			} else {
				relations.splice(relations.indexOf(event.target.value),1);
			}
			Session.set("Relationship", relations);	
		} else {
			Session.set("Relationship", [event.target.value]);
		}	
	}
});

Template.login.events({
	'click .login-btn': function() {
		console.log("Hello");
		Meteor.loginWithLinkedin();
	} 
})

function stripArray(array) {
	return array.join(",");
};

function getUserInput(event, result) {
	var returnJSON = result;
	returnJSON.login.username = event.target.username.value;
	returnJSON.login.password = event.target.password.value;
	returnJSON.search.keywords = event.target.keywords.value;
	returnJSON.search.filters.type = event.target.type.value;
	returnJSON.search.filters.relationship_to_check = stripArray(Session.get("Relationship"));
	returnJSON.search.filters.location = event.target.location.value;

	return returnJSON;
};

function clearUserInput(event) {
	event.target.username.value = "";
	event.target.password.value = "";
	event.target.keywords.value = "";
	event.target.type.value = "People";

	var checkBoxes = event.target.relationshipToCheck;
	for(var index in checkBoxes) {
		if(checkBoxes.hasOwnProperty(index)) {
			$(this).prop("checked", false);
		}
	} 
	console.log(event.target.relationshipToCheck);
	delete Session.keys["Relationship"];

};