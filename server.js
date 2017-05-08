var http = require('http'),
    fs = require('fs'),
    hash = require('./pass').hash;

var session = require('express-session');


var express = require('express');
var mongoose = require('mongoose');

var userModel = require('./model/user.js');
var postModel = require('./model/post.js');
var commentModel = require('./model/comment.js');
var imagesModel = require('./model/image.js');
var likeModel = require('./model/like.js');
var viewPostModel = require('./model/viewPost.js');

var bodyParser= require('body-parser');

var app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
//app.use(express.bodyParser({limit: '50mb'}));

app.use(session({
  secret: '1q2w3e4r5t6y7u8i9o0p',
  resave: false,
  saveUninitialized: true
}));

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

//app.use(express.static('./views'));

app.use('/', express.static(__dirname + '/Views'));

function authenticate(email, pass, fn) {                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 
  	if (!module.parent) console.log('authenticating %s:%s', email, pass);       

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
	req.session.destroy(function(err) {
		res.redirect('/');
	});
});

app.get('/post/new', function (req, res) {
	if(!req.session.user) return res.redirect('/');

	res.render('post-edit', {session: req.session.user});
});

app.get('/post/image/:post', function (req, res) {
	postModel.getById(req.params.post, function(post){
		if(post.image && post.imageExtension){
			var img = new Buffer(post.image, 'base64');
	    	res.writeHead(200, {
		     'Content-Type': post.imageExtension,
		     'Content-Length': img.length
		   	});
			return res.end(img); 
		}   	

		var img = fs.readFileSync('views/img/fundopreto.jpg');
		 res.writeHead(200, {'Content-Type': 'image/jpeg' });
		 res.end(img, 'binary');
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
							res.render('interna-post', {data: post, relateds: relateds, postsByUser: postsByUser, comments: comments, session: req.session.user});
						});										

					});	

				});	

			});	
		});
		
	});

});

app.get('/post/tags/:tag', function (req, res) {
	postModel.getByTags(req.params.tag, function(posts){
		res.render('blog-listagem-tags', {data: posts, tag: req.params.tag, session: req.session.user});
	});			
});

app.get('/user/myprofile', function (req, res) {
	if(!req.session.user){
		return res.redirect('/');
	}

	userModel.getById(req.session.user._id, function(user){
		postModel.getByUser(user._id, function(posts){
			res.render('author', {user: user, posts: posts, session: req.session.user});
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
	userModel.getById(req.params.user, function(user){
		if(user.avatar && user.avatarExtension){
			var img = new Buffer(user.avatar, 'base64');
	    	res.writeHead(200, {
		     'Content-Type': user.avatarExtension,
		     'Content-Length': img.length
		   	});
			return res.end(img); 
		}   	

		 var img = fs.readFileSync('views/img/fundopreto.jpg');
		 res.writeHead(200, {'Content-Type': 'image/jpeg' });
		 res.end(img, 'binary');
		
		
	});			
});

app.get('/user/:user', function (req, res) {
	userModel.getById(req.params.user, function(user){
		postModel.getByUser(user._id, function(posts){
			res.render('author', {user: user, posts: posts, session: req.session.user});
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
	userModel.save(req.body, function(user){

		req.session.regenerate(function(){                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                
			req.session.user = {_id: user._id, name: user.name};                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        
			res.json({_id: user._id});                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         
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
			// Regenerate session when signing in                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             
			// to prevent fixation                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            
			req.session.regenerate(function(){                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                
				// Store the user's primary key                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 
				// in the session store to be retrieved,                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        
				// or in this case the entire user object                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                
				req.session.user = {_id: user._id, name: user.name};                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        
				res.json({ user: req.session.user });                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          
			});                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               
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


