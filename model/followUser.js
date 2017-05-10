var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var FollowUserSchema   = Schema({
  userFollow: {type: Schema.ObjectId, ref: "user", required: true},
  user: {type: Schema.ObjectId, ref: "user", required: true},
  dateCreate:  {type: Date, required: true, default: Date.now},
});

var FollowUserModel = mongoose.model('followUser', FollowUserSchema, 'followUser');

var followUser = {
	create: function(json, callback){
		FollowUserModel.findOne({userFollow: json.userFollow, user: json.user}).exec(function(err, follow) {
	    	if (err)
		      return console.log(err);

		  	if(follow){
		  		return callback(true, follow);
		  	}

		  	var model = new LikePostModel();

			model.userFollow = json.userFollow;
			model.user = json.user;

			model.save(function(err) {
				if (err)
					return console.log(err);

				return callback(false, model);
			});
		});
	},
	getByUser: function(userId, callback){
		LikePostModel.find({user: userId}).populate('userFollow').exec(function(err, follows) {

	    	if (err)
		      return console.log(err);

		  	return callback(follows);
		});
	}
}
module.exports = followUser;