var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var ViewPostSchema   = Schema({
  userVisited: {type: Schema.ObjectId, ref: "user"},
  user: {type: Schema.ObjectId, ref: "user"},
  dateCreate:  {type: Date, required: true, default: Date.now},
});

var ViewUserModel = mongoose.model('viewUser', ViewPostSchema, 'viewUser');

var viewUser = {
	create: function(json, callback){
		var model = new ViewUserModel();

		model.userVisited = json.userVisited;
		model.user = json.user;

		model.save(function(err) {
			if (err)
				return console.log(err);

			callback(model);
		});
	}
}
module.exports = viewUser;