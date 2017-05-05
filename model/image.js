var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var ImageSchema   = Schema({
  image: {type: String, required: true},
  blog: {type: Schema.ObjectId, ref: "blog"},
  post: {type: Schema.ObjectId, ref: "post"},
  user: {type: Schema.ObjectId, ref: "user"},
  dateCreate:  {type: Date, required: true, default: Date.now},
});

var ImageModel = mongoose.model('image', ImageSchema, 'image');

var image = {
	_create: function(json, callback){
		var model = new ImageModel();

		model.image = json.image;

		model.blog = json.blog;
		model.post = json.post;
		model.user = json.user;

		model.save(function(err) {
			if (err)
				return console.log(err);

			callback(model);
		});
	},
	save: function(json, callback){
		if(json._id == "" || json._id == undefined){
			image._create(json, function(result){
				callback(result);
			});
		}
	},
	remove: function(id, callback){
		ImageModel.findByIdAndRemove(id, function(err) {
			if (err)
				return console.log(err);

			callback(true);
		});
	},
	getById: function(id, callback){
		ImageModel.findById(id).exec(function(err, result) {
		    if (err)
		      return console.log(err);

		    callback(result);
		});
	}
}
module.exports = image;