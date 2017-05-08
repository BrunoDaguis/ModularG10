var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var PostSchema   = Schema({
  title: {type: String, required: true},
  description: {type: String, required: true},
  url: {type: String, required: true},
  image: {type: String },
  imageExtension: {type: String },
  content: {type: String, required: true },
  user: {type: Schema.ObjectId, required: true, ref: "user"},
  comments: [{type: Schema.ObjectId, ref: "comment"}],
  tags: [{type: String, required: false }],
  dateCreate:  {type: Date, default: Date.now},
  likes: {type: Number, default: 0},
  views: {type: Number, default: 0}
});

var PostModel = mongoose.model('post', PostSchema, 'post');

var post = {
	_create: function(json, callback){
		var model = new PostModel();

		model.title = json.title;
		model.description = json.description;
		model.content = json.content;
		model.image = json.image;
		model.imageExtension = json.imageExtension;
		model.tags = json.tags;
		model.url = parseToUrl(json.title);
		model.user = json.user;

		model.save(function(err) {
			if (err)
				return console.log(err);

			callback(model);
		});
	},
	_update: function(json, callback){
		post.getById(json._id, function(result){

			result.title = json.title;
			result.description = json.description;
			result.content = json.content;
			result.tags = json.tags;
			result.image = json.image;
			result.imageExtension = json.imageExtension;
			result.url = parseToUrl(json.title);
			
			result.save(function(err) {
				if (err)
					return console.log(err);

				callback(result);
			});	
		});
	},
	addComment: function(postId, commentId, callback){
		post.getById(postId, function(result){
			result.comments.push(commentId);
			result.save(function(err) {
				if (err)
					return console.log(err);

				callback(result);
			});	
		});
	},
	removeComment: function(postId, commentId, callback){
		PostModel.findOneAndUpdate(postId, {$pull: {comments: commentId}}, function(err, result){
	        if (err)
				return console.log(err);

			callback(result);
	    });
	},
	addLike: function(postId, callback){
		post.getById(postId, function(result){
			
			result.likes = result.likes + 1;
			
			result.save(function(err) {
				if (err)
					return console.log(err);

				callback(result);
			});	
		});
	},
	removeLike: function(postId, callback){
		post.getById(postId, function(result){

			result.likes = result.likes - 1;
			
			result.save(function(err) {
				if (err)
					return console.log(err);

				callback(result);
			});	
		});
	},
	save: function(json, callback){
		if(json._id == "" || json._id == undefined){
			post._create(json, function(result){
				callback(result);
			});
		}else{
			post._update(json, function(result){
				callback(result);
			});
		}
	},
	remove: function(id, callback){
		PostModel.findByIdAndRemove(id, function(err) {
			if (err)
				return console.log(err);

			callback(true);
		});
	},
	get: function(callback){
		PostModel.find({}).populate('user').exec(function(err, results) {
		    if (err)
		      return console.log(err);

		    callback(results);

		});
	},
	getById: function(id, callback){
		PostModel.findById(id).populate('user').populate('images').populate('comments').exec(function(err, result) {
		    if (err)
		      return console.log(err);

		    callback(result);
		});
	},
	getByUrl: function(url, callback){
		PostModel.findOne({url: url}).populate('user').populate('images').populate('comments').populate('comments.user').exec(function(err, result) {
	    if (err)
		      return console.log(err);

		    callback(result);
		});
	},
	getByTags: function(tags, callback){
		PostModel.find({tags: tags}).populate('user').populate('images').populate('comments').exec(function(err, result) {
		    if (err)
		      return console.log(err);

		    callback(result);
		});
	},
	getByUser: function(user, callback){
		PostModel.find({user: user}).populate('user').populate('comments').exec(function(err, result) {
		    if (err)
		      return console.log(err);

		    callback(result);
		});
	},
	addView: function(postId, callback){
		post.getById(postId, function(result){
			
			result.views = result.views + 1;
			
			result.save(function(err) {
				if (err)
					return console.log(err);

				callback(result);
			});	
		});
	}
}
module.exports = post;

function parseToUrl(str) {
  str = str.replace(/^\s+|\s+$/g, ''); // trim
  str = str.toLowerCase();

  // remove accents, swap ñ for n, etc
  var from = "ãàáäâẽèéëêìíïîõòóöôùúüûñç·/_,:;";
  var to   = "aaaaaeeeeeiiiiooooouuuunc------";
  for (var i=0, l=from.length ; i<l ; i++) {
    str = str.replace(new RegExp(from.charAt(i), 'g'), to.charAt(i));
  }

  str = str.replace(/[^a-z0-9 -]/g, '') // remove invalid chars
    .replace(/\s+/g, '-') // collapse whitespace and replace by -
    .replace(/-+/g, '-'); // collapse dashes

  return str;
};