import { Meteor } from 'meteor/meteor';

Meteor.startup(function() {
	var Future = Npm.require("fibers/future");
	var exec = Npm.require('child_process').exec;

	Meteor.methods({
		'loadConfigJSON': function() {
			var configJSON = {};
			configJSON = JSON.parse(Assets.getText("properties.config.json.template"));
			return configJSON;
		},
		'generateConfigJSON': function(configJSON) {
			console.log(JSON.stringify("Generating Config JSON for user: " + configJSON.login.username));
			var jsonfile = require('jsonfile');
			var fileName = "properties.config." + configJSON.login.username + "." + Date.now() + ".json";
			var file = process.env.PWD + '/private/' + fileName;

			jsonfile.writeFile(file, configJSON, function (err){
				console.error(err);
			});

			return file;
		},
		'runRuby': function(configFile) {
			this.unblock();
			var future = new Future();
			var dir = process.env.PWD + '/step_entry_point.rb';
			var log = process.env.PWD + '/private/step_log.log';
			var command = "ruby " + dir + " " + configFile + " " + log;
			console.log(command);
			exec(command, function(error, stdout, stderr){
				if(error) {
					console.log(error);
				}
				future.return(stdout.toString());
			});
			return future.wait();
	  		// cmd = Meteor.wrapAsync(exec);
	  		
	  		// res = cmd(command);
	  		// return res;
		}
	});
});


