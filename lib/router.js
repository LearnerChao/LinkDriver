Router.route("/", {
	template: "login"
});

Router.route("/getstarted", function(){
	this.render("configForm");
})