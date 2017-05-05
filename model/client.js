var mongoose = require('mongoose');

var ClientSchema   = new mongoose.Schema({
  name: String,
  email: String
});

var ClientModel = mongoose.model('Cliente', ClientSchema);

var client = {
	_create: function(json, callback){
		var model = new ClientModel();

		model.name = json.name;
		model.email = json.email;

		model.save(function(err) {
			if (err)
				return console.log(err);

			callback(model);
		});

		/*var db = client.database.db;

		db.collection(client.database.tableName).save(json, (err, result) => {
			if (err) return console.log(err);

			callback(result);
		});*/
	},
	_update: function(json, callback){
		client.getById(json._id, function(result){

			result.name = json.name;
			result.email = json.email;

			result.save(function(err) {
				if (err)
					return console.log(err);

				callback(result);
			});	
		});
		
		/*var db = client.database.db;

		db.collection(client.database.tableName).updateOne(
			{ "_id" : json._id },
			{ 
				$set: { "name": json.name, "email": json.email } 
			}, function(err, results) {
				callback(results);
			}
		);*/
	},
	save: function(json, callback){
		if(json._id == "" || json._id == undefined){
			client._create(json, function(result){
				callback(result);
			});
		}else{
			client._update(json, function(result){
				callback(result);
			});
		}
	},
	remove: function(id, callback){

		ClientModel.findByIdAndRemove(id, function(err) {
			if (err)
				return console.log(err);

			callback(true);
		});
		
		/*var db = client.database.db;
		var objectId = client.database.objectId;

		db.collection(client.database.tableName).deleteOne(
			{_id: new objectId(id)},
			function(err, results) {
				callback(results);
			}
		);*/
	},
	get: function(callback){
		ClientModel.find(function(err, results) {
		    if (err)
		      return console.log(err);

		    callback(results);
		});

		/*var db = client.database.db;

		db.collection(client.database.tableName).find().toArray(function(err, results) {
		  	if (err) return console.log(err)
	    	
		  	callback(results);
		});*/
	},
	getById: function(id, callback){
		ClientModel.findById(id, function(err, result) {
		    if (err)
		      return console.log(err);

		    callback(result);
		});
		/*var db = client.database.db;
		var objectId = client.database.objectId;

		db.collection(client.database.tableName).findOne({ _id : objectId(id) }, function(err, result) {
			if (err) {
				console.log(err)
				return null;
			}

			callback(result);
		})*/
	}
}
module.exports = client;