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
		  		return callback(false, follow);
		  	}

		  	var model = new FollowUserModel();

			model.userFollow = json.userFollow;
			model.user = json.user;

			model.save(function(err) {
				if (err)
					return console.log(err);

				return callback(true, model);
			});
		});
	},
	remove: function(json, callback){
		followUser.getByUserFollow(json.user, json.userFollow, function(follow){
			
			FollowUserModel.remove({ _id: follow._id }, function(err) {
		    	if (err)
			      return console.log(err);

				return callback(follow);
				
			});
		});
		
	},
	getByUser: function(userId, callback){
		FollowUserModel.find({user: userId}).populate('userFollow').exec(function(err, follows) {

	    	if (err)
		      return console.log(err);

		  	return callback(follows);
		});
	},
	getByUserFollow: function(userId, userIdFollow, callback){
		FollowUserModel.findOne({user: userId, userFollow: userIdFollow}).populate('userFollow').exec(function(err, follow) {
	    	if (err)
		      return console.log(err);

		  	return callback(follow);
		});
	}
}
module.exports = followUser;