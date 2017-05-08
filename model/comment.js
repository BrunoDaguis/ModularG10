var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var CommentSchema   = Schema({
  text: {type: String, required: true},
  dateCreate:  {type: Date, default: Date.now},
  user: {type: Schema.ObjectId, required: true, ref: "user"},
  post: {type: Schema.ObjectId, required: true, ref: "post"},
});

var CommentModel = mongoose.model('comment', CommentSchema, 'comment');

var comment = {
	_create: function(json, callback){
		var model = new CommentModel();

		model.text = json.text;
		model.user = json.user;
		model.post = json.post;

		model.save(function(err) {
			if (err)
				return console.log(err);		

			callback(model);
		});
	},
	_update: function(json, callback){
		comment.getById(json._id, function(result){

			result.text = json.text;
			
			result.save(function(err) {
				if (err)
					return console.log(err);

				callback(result);
			});	
		});
	},
	save: function(json, callback){
		if(json._id == "" || json._id == undefined){
			comment._create(json, function(result){
				callback(result);
			});
		}else{
			comment._update(json, function(result){
				callback(result);
			});
		}
	},
	remove: function(id, callback){

		CommentModel.findByIdAndRemove(id, function(err) {
			if (err)
				return console.log(err);

			callback(true);
		});
	},
	get: function(callback){
		CommentModel.find({}).populate('user').exec(function(err, results) {
		    if (err)
		      return console.log(err);

		    callback(results);

		});
	},
	getById: function(id, callback){
		CommentModel.findById(id).populate('user').exec(function(err, result) {
		    if (err)
		      return console.log(err);

		    callback(result);

		});
	},
	getByPost: function(postId, callback){
		CommentModel.find({post: postId}).populate('user').exec(function(err, results) {
		    if (err)
		      return console.log(err);

		    callback(results);

		});
	},
}
module.exports = comment;