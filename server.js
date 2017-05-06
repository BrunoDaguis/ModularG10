var http = require('http'),
    fs = require('fs'),
    hash = require('./pass').hash;

/*var cookieParser = require('cookie-parser')
var session = require('express-session')
*/

var express = require('express');
var mongoose = require('mongoose');
var userModel = require('./model/user.js');
var postModel = require('./model/post.js');
var commentModel = require('./model/comment.js');
var imagesModel = require('./model/image.js');
var likeModel = require('./model/like.js');
var bodyParser= require('body-parser');

var app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

/*app.use(cookieParser());                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    
app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: true }
}));  */ 

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

app.use(express.static('./views'));

/*app.use(function(req, res, next){  
	
  var err = req.session.error                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           
    , msg = req.session.success;                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        
  delete req.session.error;                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             
  delete req.session.success;                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           
  res.locals.message = '';                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              
  if (err) res.locals.message = '<p class="msg error">' + err + '</p>';                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 
  if (msg) res.locals.message = '<p class="msg success">' + msg + '</p>';                                                                                                                                                                                                                                                                                                                                                                                                                                                                               
  next();                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               
}); */

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
    req.session.error = 'Access denied!';                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               
    res.redirect('/login');                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             
  }                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     
} 

app.get('/', function (req, res) {
	postModel.get(function(results){
		res.render('index', {data: results});
	});	
});

app.get('/post/:url', function (req, res) {
	postModel.getByUrl(req.params.url, function(post){
		postModel.getByTags(post.tags, function(relateds){
			postModel.getByUser(post.user._id, function(postsByUser){
				res.render('interna-post', {data: post, relateds: relateds, postsByUser: postsByUser});
			});			
		});			
	});
});

app.get('/post/tags/:tag', function (req, res) {
	postModel.getByTags(req.params.tag, function(posts){
		res.render('blog-listagem-tags', {data: posts, tag: req.params.tag});
	});			
});

app.get('/user/:user', function (req, res) {
	userModel.getById(req.params.user, function(user){
		postModel.getByUser(user._id, function(posts){
			res.render('author', {user: user, posts: posts});
		});	
	});			
});



/* SERVIÇOS */

app.get('/api/user', function (req, res) {
	userModel.get(function(results){
		res.json(results);
	});
});

app.get('/api/user/:id', function (req, res) {
	userModel.getById(req.params.id, function(result){
		res.json(result);
	});
});

app.get('/api/user/session', function (req, res) {
	res.json(req.session.user);
});

app.post('/api/user', (req, res) => {
	userModel.save(req.body, function(result){
		res.json({_id: result._id});
	});
});

app.put('/api/user', (req, res) => {
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
				res.json({ success: true });                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          
			});                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               
		} else {                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               
			res.json({ success: false });                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           
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
	postModel.save(req.body, function(result){
		res.json({_id: result._id});
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
	commentModel.save(req.body, function(comment){
		postModel.addComment(req.body.post, comment._id, function(result){
			res.json({_id: comment._id});
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

/* LIKES */
app.post('/api/post/like', (req, res) => {
	likeModel.save(req.body, function(like){
		postModel.addLike(req.body.post, function(){
			res.json({_id: like._id});
		});
	});
});

app.delete('/api/post/like/:id', (req, res) => {
	likeModel.remove(req.params.id, function(result){
		postModel.removeLike(req.body.post, function(){
			res.json({ success: true });
		});
	});
});
