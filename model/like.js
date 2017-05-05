var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var LikeSchema   = Schema({
  blog: {type: Schema.ObjectId, ref: "blog"},
  post: {type: Schema.ObjectId, ref: "post"},
  userLike: {type: Schema.ObjectId, ref: "user"},
  dateCreate:  {type: Date, required: true, default: Date.now},
});

var LikeModel = mongoose.model('like', LikeSchema, 'like');

var like = {
	_create: function(json, callback){
		var model = new LikeModel();

		model.blog = json.blog;
		model.post = json.post;
		model.userLike = json.userLike;

		model.save(function(err) {
			if (err)
				return console.log(err);

			callback(model);
		});
	},
	save: function(json, callback){
		if(json._id == "" || json._id == undefined){
			like._create(json, function(result){
				callback(result);
			});
		}
	},
	remove: function(id, callback){
		LikeModel.findByIdAndRemove(id, function(err) {
			if (err)
				return console.log(err);

			callback(true);
		});
	}
}
module.exports = like;