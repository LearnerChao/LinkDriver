import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';

import './main.html';

Template.configForm.helpers({
	'isChecked': function() {
		var value = $(this).value;
		var relations = Session.get("Relationship");
		return  (relations && (relations.indexOf(value) >= 0)) ? "checked" : "";
	}
});

Template.configForm.events({
	'submit form': function(event, template) {
		event.preventDefault();
		Meteor.call('loadConfigJSON', function(error, result) {
			var configJSON = getUserInput(event, result);
			clearUserInput(template);
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
				$(event.target).att			
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

function clearUserInput(template) {
	template.find("form").reset();
	delete Session.keys["Relationship"];
};