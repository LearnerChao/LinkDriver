import { Meteor } from 'meteor/meteor';

Meteor.startup(function() {
	ServiceConfiguration.configurations.update(
	    { service: "facebook" },
	    { $set: {
	        "clientId": "77a2zbsek9o015",
	        "secret": "XdkYKNLlL0l3tm0A"
      		}
	    },
	    { upsert: true }
	);
});

Meteor.methods({
	'loadConfigJSON': function() {
		var configJSON = {};
		configJSON = JSON.parse(Assets.getText("properties.config.json.template"));
		return configJSON;
	},
	'generateConfigJSON': function(configJSON) {
		console.log(JSON.stringify("Generating Config JSON for user: " + configJSON));
		var jsonfile = require('jsonfile');
		var file = process.env.PWD + '/private/properties.config.json';

		jsonfile.writeFile(file, configJSON, function (err){
			console.error(err);
		});
	},
	'runRuby': function() {
		exec = Npm.require('child_process').exec;
  		cmd = Meteor.wrapAsync(exec);
  		var dir = process.env.PWD + '/step_entry_point.rb'
  		res = cmd("ruby " + dir);
  		return res;
	}
});
