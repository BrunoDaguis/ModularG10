var mongoose = require('mongoose');

var UserSchema   = new mongoose.Schema({
  name: {type: String, required: true},
  email: {type: String, required: true, index:{unique:true}},
  password: {type: String, required: true},
  description: {type: String },
  avatar: {type: String },
  dateCreate:  {type: Date, default: Date.now}
});

var UserModel = mongoose.model('user', UserSchema, 'user');

var user = {
	_create: function(json, callback){
		var model = new UserModel();

		model.name = json.name;
		model.email = json.email;
		model.password = json.password;
		model.description = json.description;

		model.save(function(err) {
			if (err)
				return console.log(err);

			callback(model);
		});
	},
	_update: function(json, callback){
		user.getById(json._id, function(result){

			result.name = json.name;
			result.password = json.password;
			result.description = json.description;
			
			result.save(function(err) {
				if (err)
					return console.log(err);

				callback(result);
			});	
		});
	},
	save: function(json, callback){
		if(json._id == "" || json._id == undefined){
			user._create(json, function(result){
				callback(result);
			});
		}else{
			user._update(json, function(result){
				callback(result);
			});
		}
	},
	remove: function(id, callback){
		UserModel.findByIdAndRemove(id, function(err) {
			if (err)
				return console.log(err);

			callback(true);
		});
	},
	get: function(callback){
		UserModel.find(function(err, results) {
		    if (err)
		      return console.log(err);

		    callback(results);
		});
	},
	getById: function(id, callback){
		UserModel.findById(id, function(err, result) {
		    if (err)
		      return console.log(err);

		    callback(result);
		});
	},
	login: function(json, callback){
		var usersProjection = { 
		    __v: false,
		    password: false,
		    avatar: true
		};

		UserModel.findOne({ 'email': json.email, 'password': json.password }, function(err, result) {
		    if (err)
		      return console.log(err);

		    callback(result);
		});
	}
}
module.exports = user;