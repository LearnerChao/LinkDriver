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
			var configFileName = "properties.config." + configJSON.login.username + "." + Date.now() + ".json";
			var activityLogName = "step_log." + configJSON.login.username + "." + Date.now() + ".log";;
			var files = {};
			files.configFile = process.env.PWD + '/private/.#configs/' + configFileName;
			files.activityLog = process.env.PWD + '/private/.#activity/' + activityLogName;

			jsonfile.writeFile(files.configFile, configJSON, function (err){
				console.error(err);
			});
			return files;
		},
		'runRuby': function(files) {

			this.unblock();
			var future = new Future();
			var dir = process.env.PWD + '/step_entry_point.rb';
			var command = "ruby " + dir + " " + files.configFile + " " + files.activityLog;
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


