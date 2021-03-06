var http = require('http'),
    fs = require('fs'),
    hash = require('./pass').hash;

var express = require('express');
var mongoose = require('mongoose');
var cookieSession = require('cookie-session')

var userModel = require('./model/user.js');
var postModel = require('./model/post.js');
var commentModel = require('./model/comment.js');
var imagesModel = require('./model/image.js');
var likePostModel = require('./model/likePost.js');

var viewPostModel = require('./model/viewPost.js');
var viewUserModel = require('./model/viewUser.js');

var followUserModel = require('./model/followUser.js');

var bodyParser= require('body-parser');

var app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(cookieSession({
  name: 'session',
  keys: ['1q2w3e4r5t6y7u8i9o0p'],
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));

app.use('/', express.static(__dirname + '/views'));
app.set('view engine', 'ejs');

var options = {
		db: { native_parser: true },
		server: { poolSize: 5 },
		replset: { rs_name: 'myReplicaSetName' },
		user: 'sa',
		pass: 'admin123'
	};

mongoose.connect('mongodb://ds015889.mlab.com:15889/testedaguis', options);

app.set('port', (process.env.PORT || 5000));

app.listen(app.get('port'), () => {
	console.log('listening on 5000')
});

function authenticate(email, pass, fn) {                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 
  	userModel.login({email:email, password: pass}, function(user){
		fn(user);
	});
}

function restrict(req, res, next) {                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     
  if (req.session.user) {                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               
    next();                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             
  } else {                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              
    res.redirect('/login');                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             
  }                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     
} 

app.get('/', function (req, res) {
	postModel.get(function(results){
		res.render('index', {data: results, session: req.session.user});
	});	
});

app.get('/logout', function (req, res) {
	req.session = null

	return res.redirect('/');
});

app.get('/search', function (req, res) {
	var url = require('url');
	var url_parts = url.parse(req.url, true);
	var query = url_parts.query;
	
	var search = query.q;

	postModel.getBySearchTerm(search, function(posts){
		res.render('index', {data: posts, search: search, session: req.session.user});
	});
	
});

app.get('/post/new', function (req, res) {
	if(!req.session.user) return res.redirect('/');

	res.render('post-edit', {session: req.session.user});
});

app.get('/post/image/:post', function (req, res) {
	postModel.getById(req.params.post, function(post){
		if(post){
			if(post.image && post.imageExtension){
				var img = new Buffer(post.image, 'base64');
		    	res.writeHead(200, {
			     'Content-Type': post.imageExtension,
			     'Content-Length': img.length
			   	});
				return res.end(img); 
			}   
		}			

		var img = fs.readFileSync('views/img/fundopreto.jpg');
		res.writeHead(200, {'Content-Type': 'image/jpeg' });
		return res.end(img, 'binary');
	});			
});

app.get('/post/:url', function (req, res) {
	postModel.getByUrl(req.params.url, function(post){
		if(!post) return res.redirect('/');

		commentModel.getByPost(post._id, function(comments){

			postModel.getByTags(post.tags, function(relateds){

				postModel.getByUser(post.user._id, function(postsByUser){

					viewPostModel.create({ post: post._id, user: req.session.user == null ? null : req.session.user._id }, function(view){

						postModel.addView(post._id, function(){
							post.views += 1;
							return res.render('interna-post', {data: post, relateds: relateds, postsByUser: postsByUser, comments: comments, session: req.session.user});
						});										

					});	

				});	

			});	
		});
		
	});

});

app.get('/post/tags/:tag', function (req, res) {
	postModel.getByTag(req.params.tag, function(posts){
		res.render('blog-listagem-tags', {data: posts, tag: req.params.tag, session: req.session.user});
	});			
});

app.get('/user/myprofile', function (req, res) {
	if(!req.session.user){
		return res.redirect('/');
	}

	userModel.getById(req.session.user._id, function(user){

		likePostModel.getByUser(user._id, function(likes){

			viewUserModel.create({ userVisited: user._id, user: req.session.user == null ? null : req.session.user._id }, function(view){

				userModel.addView(user._id, view._id, function(){

					postModel.getByUser(user._id, function(posts){

						followUserModel.getByUser(user._id, function(followers){
							return res.render('my-profile.ejs', {user: user, posts: posts, likes: likes, followers: followers, session: req.session.user});
						});	

						
					});	

				});													

			});	

		});
	
	});	

});

app.get('/user/edit/myprofile', function (req, res) {
	if(!req.session.user){
		return res.redirect('/');
	}

	userModel.getById(req.session.user._id, function(user){
		res.render('author-edit', {user: user, session: req.session.user});
	});		
});

app.get('/user', function (req, res) {
	userModel.get(function(users){
		res.render('people', {users: users, session: req.session.user});
	});			
});

app.get('/user/image/:user', function (req, res) {
	if(!req.params.user){
		return res.status(401).send();
	}
	userModel.getById(req.params.user, function(user){
		if(user){
			if(user.avatar && user.avatarExtension){
				var img = new Buffer(user.avatar, 'base64');
		    	res.writeHead(200, {
			     'Content-Type': user.avatarExtension,
			     'Content-Length': img.length
			   	});
				return res.end(img); 
			}  
		}	 	

		var img = fs.readFileSync('views/img/fundopreto.jpg');
		res.writeHead(200, {'Content-Type': 'image/jpeg' });
		return res.end(img, 'binary');	
	});			
});

app.get('/user/:user', function (req, res) {
	userModel.getById(req.params.user, function(user){

		likePostModel.getByUser(user._id, function(likes){

			viewUserModel.create({ userVisited: user._id, user: req.session.user == null ? null : req.session.user._id }, function(view){

				userModel.addView(user._id, view._id, function(){

					postModel.getByUser(user._id, function(posts){

						followUserModel.getByUserFollow(req.session.user == null ? null : req.session.user._id , user._id, function(follow){

							followUserModel.getByUser(user._id, function(followers){

							
								return res.render('author', {user: user, follow: follow !== null , posts: posts, likes: likes, followers: followers, session: req.session.user});
							});	

							
						});

						
					});	

				});													

			});	

		});
	
	});			

});

/* SERVIÇOS */

app.get('/api/user', function (req, res) {
	if(!req.session.user){
		return res.status(401).send();
	}

	userModel.change(function(results){
		res.json(results);
	});
});

app.post('/api/user/changePassword', function (req, res) {
	if(!req.session.user){
		return res.status(401).send();
	}

	req.body._id = req.session.user._id;

	userModel.changePassword(req.body, function(user){
		res.json({ success: true });
	});		
});

app.get('/api/user/:id', function (req, res) {
	userModel.getById(req.params.id, function(result){
		res.json(result);
	});
});

app.post('/api/user', (req, res) => {
	userModel.getByEmail(req.body.email, function(user){
		if(!user){
			userModel.save(req.body, function(user){
				req.session.user = null;	
				req.session.user = {_id: user._id, name: user.name};                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        
				return res.json({_id: user._id});                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         

			});
		}else{
			return res.status(401).send();
		}
	})	
});

app.post('/api/user/follow', (req, res) => {
	if(!req.session.user){
		return res.status(401).send();
	}

	var json = {
		userFollow: req.body.userFollow,
		user: req.session.user._id
	}

	followUserModel.create(json, function(created, follow){
		if(!created)
			return res.json(null); 

		userModel.addFollow(req.body.userFollow, follow._id, function(result){

			userModel.getById(req.body.userFollow, function(user){
				return res.json(user);
			});
			
		});		
	});
		
});

app.post('/api/user/unfollow', (req, res) => {
	if(!req.session.user){
		return res.status(401).send();
	}

	var json = {
		userFollow: req.body.userFollow,
		user: req.session.user._id
	}

	followUserModel.remove(json, function(follow){
		userModel.removeFollow(follow.userFollow._id, follow._id, function(result){
			userModel.getById(req.body.userFollow, function(user){
				return res.json(user);
			});
		});		
	});
		
});

app.put('/api/user', (req, res) => {
	if(!req.session.user){
		return res.status(401).send();
	}
	req.body._id = req.session.user._id;

   	userModel.save(req.body, function(result){
		res.json({ success: true });
	});
});

app.delete('/api/user/:id', (req, res) => {
	userModel.remove(req.params.id, function(result){
		res.json({ success: true });
	});
});

app.post('/api/user/login', (req, res) => {
	authenticate(req.body.email, req.body.password, function(user){                                                                                                                                                                                                                                                                                                                                                                                                                                                                               
		if (user) {                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         
			req.session.user = {_id: user._id, name: user.name};                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        
			return res.json({ user: req.session.user });                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              
		} else {                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               
			return res.status(400).send();                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      
		}                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   
	});    	
});


/* post */

app.get('/api/post', function (req, res) {
	postModel.get(function(results){
		res.json(results);
	});
});

app.get('/api/post/:id', function (req, res) {
	postModel.getById(req.params.id, function(post){
		postModel.getByTags('venezuela', function(relateds){
			res.json({post: post, related: relateds});
		});			
	});
});

app.get('/api/post/tags/:tag', function (req, res) {
	postModel.getByTags(req.params.tag, function(results){
		res.json(results);
	});
});

app.post('/api/post', (req, res) => {
	if(!req.session.user){
		return res.status(401).send();
	}

	req.body.user = req.session.user._id;	

	postModel.save(req.body, function(result){
		res.json(result);
	});
});

app.post('/api/post/like', function (req, res) {
	if(!req.session.user){
		return res.status(401).send();
	}

	likePostModel.create({post: req.body.post, user: req.session.user._id}, function(err, like){
		if(err) return res.json(null);

		postModel.addLike({post: like.post, like: like._id}, function(post){
			return res.json(post);
		});			
	});
});

app.put('/api/post', (req, res) => {
   postModel.save(req.body, function(result){
		res.json({ success: true });
	});
});

app.delete('/api/post/:id', (req, res) => {
	postModel.remove(req.params.id, function(result){
		res.json({ success: true });
	});
});

/* comments (post) */

app.get('/api/comment', function (req, res) {
	commentModel.get(function(results){
		res.json(results);
	});
});

app.get('/api/comment/:id', function (req, res) {
	commentModel.getById(req.params.id, function(result){
		res.json(result);
	});
});

app.post('/api/comment', (req, res) => {
	if(!req.session.user){
		return res.status(401).send();
	}
	req.body.user = req.session.user._id;

	commentModel.save(req.body, function(comment){
		postModel.addComment(req.body.post, comment._id, function(result){
			res.json({ text: comment.text, dateCreate: comment.dateCreate, user: { _id: req.session.user._id, name: req.session.user.name }});
		});
	});
});

app.put('/api/comment', (req, res) => {
   commentModel.save(req.body, function(result){
		res.json({ success: true });
	});
});

app.delete('/api/comment/:id', (req, res) => {
	//Busco comment pelo ID
	commentModel.getById(req.params.id, function(comment){
		//Removo comment da tabela de post
		postModel.removecomment(comment.post, comment._id, function(){
			//Removo comment na tabela de comment
			commentModel.remove(comment._id, function(){
				res.json({ success: true });
			});

		});

	});
});

/* IMAGES */
app.post('/api/post/image', (req, res) => {
	imagesModel.save(req.body, function(image){
		postModel.addImage(req.body.post, image._id, function(){
			res.json({_id: image._id});
		});
	});
});

app.delete('/api/post/image/:id', (req, res) => {
	imagesModel.remove(req.params.id, function(image){
		imagesModel.remove(req.params.id, function(result){
			postModel.addImage(image.post, image._id, function(){
				res.json({ success: true });
			});
		});
	});
});


