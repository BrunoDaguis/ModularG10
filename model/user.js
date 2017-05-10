var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var UserSchema   = new mongoose.Schema({
  name: {type: String, required: true},
  email: {type: String, required: true, index:{unique:true}},
  password: {type: String, required: true},
  description: {type: String },
  avatar: {type: String },
  avatarExtension: {type: String },
  dateBirth:  {type: Date},
  position: {type: String },
  company: {type: String },
  webSite: {type: String },
  facebook: {type: String },
  twitter:{type: String },
  google: {type: String },
  pinterest: {type: String },
  instagram: {type: String },
  linkedin: {type: String },
  views: [{type: Schema.ObjectId, required: true, ref: "viewUser"}],
  dateCreate:  {type: Date, default: Date.now}
});

var UserModel = mongoose.model('user', UserSchema, 'user');

var user = {
	_create: function(json, callback){
		var model = new UserModel();

		model.name = json.name;
		model.email = json.email;
		model.password = json.password;
		model.dateBirth = json.dateBirth;
		model.description = json.description;

		model.position = json.position;
		model.company = json.company;
		model.webSite = json.webSite;
		model.facebook = json.facebook;
		model.twitter = json.twitter;
		model.google = json.google;
		model.pinterest = json.pinterest;
		model.instagram = json.instagram;
		model.linkedin = json.linkedin;

		model.save(function(err) {
			if (err)
				return console.log(err);

			callback(model);
		});
	},
	_update: function(json, callback){
		user.getById(json._id, function(result){

			result.name = json.name;
			result.description = json.description;
			result.avatar = json.avatar;
			result.avatarExtension = json.avatarExtension;
			
			result.position = json.position;
			result.company = json.company;
			result.webSite = json.webSite;
			result.facebook = json.facebook;
			result.twitter = json.twitter;
			result.google = json.google;
			result.pinterest = json.pinterest;
			result.instagram = json.instagram;
			result.linkedin = json.linkedin;

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
	},
	changePassword: function(json, callback){
		user.getById(json._id, function(result){
			result.password = json.newPassword;
			
			result.save(function(err) {
				if (err)
					return console.log(err);

				callback(result);
			});	
		});
	},
	addView: function(userId, viewId, callback){
		user.getById(userId, function(result){

			result.views.push(viewId);
			
			result.save(function(err) {
				if (err)
					return console.log(err);

				callback(result);
			});	
		});
	},
	getByEmail: function(email, callback){
		UserModel.findOne({ 'email': email }, function(err, result) {
		    if (err)
		      return console.log(err);

		    callback(result);
		});
	}
}
module.exports = user;