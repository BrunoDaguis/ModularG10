var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var NotificationSchema   = Schema({
  title: {type: String, required: true},
  description: {type: String, required: true},
  type: {type: Schema.ObjectId, required: true, ref: "typeNotification"},
  userTo: {type: Schema.ObjectId, required: true, ref: "user"},
  user: {type: Schema.ObjectId, required: true, ref: "user"},
  dateRead:  {type: Date},
  dateCreate:  {type: Date, default: Date.now}
});

var NotificationModel = mongoose.model('notification', NotificationSchema, 'notification');

var notification = {
	_create: function(json, callback){
		var model = new NotificationModel();

		model.title = json.title;
		model.description = json.description;
		model.type = json.type;
		model.userTo = json.userTo;
		model.user = json.user;

		model.save(function(err) {
			if (err)
				return console.log(err);

			callback(model);
		});
	},
	save: function(json, callback){
		if(json._id == "" || json._id == undefined){
			notification._create(json, function(result){
				callback(result);
			});
		}
	},
	remove: function(id, callback){
		NotificationModel.findByIdAndRemove(id, function(err) {
			if (err)
				return console.log(err);

			callback(true);
		});
	},
	getById: function(id, callback){
		NotificationModel.findById(id).populate('user').populate('userTo').exec(function(err, result) {
		    if (err)
		      return console.log(err);

		    callback(result);
		});
	},
	getByUrl: function(url, callback){
		NotificationModel.findOne({url: url}).populate('user').populate('userTo').exec(function(err, result) {
	    	if (err)
		      return console.log(err);

		    callback(result);
		});
	},
	getByUserTo: function(user, callback){
		NotificationModel.find({user: user}).populate('user').populate('userTo').exec(function(err, result) {
		    if (err)
		      return console.log(err);

		    callback(result);
		});
	}
}
module.exports = notification;