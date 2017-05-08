var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var ViewPostSchema   = Schema({
  post: {type: Schema.ObjectId, ref: "post"},
  user: {type: Schema.ObjectId, ref: "user"},
  dateCreate:  {type: Date, required: true, default: Date.now},
});

var ViewModel = mongoose.model('viewPost', ViewPostSchema, 'viewPost');

var view = {
	create: function(json, callback){
		var model = new ViewModel();

		model.post = json.post;
		model.user = json.user;

		model.save(function(err) {
			if (err)
				return console.log(err);

			callback(model);
		});
	}
}
module.exports = view;