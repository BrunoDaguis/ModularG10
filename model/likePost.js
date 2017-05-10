var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var LikePostSchema   = Schema({
  post: {type: Schema.ObjectId, ref: "post", required: true},
  user: {type: Schema.ObjectId, ref: "user", required: true},
  dateCreate:  {type: Date, required: true, default: Date.now},
});

var LikePostModel = mongoose.model('likePost', LikePostSchema, 'likePost');

var likePost = {
	create: function(json, callback){
		LikePostModel.findOne({user: json.user, post: json.post}).exec(function(err, like) {
	    	if (err)
		      return console.log(err);

		  	if(like){
		  		return callback(true, model);
		  	}

		  	var model = new LikePostModel();

			model.post = json.post;
			model.user = json.user;

			model.save(function(err) {
				if (err)
					return console.log(err);

				return callback(false, model);
			});
		});
		
	}
}
module.exports = likePost;