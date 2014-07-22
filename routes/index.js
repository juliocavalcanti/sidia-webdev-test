var title = 'Sidia WebChat';
var ioclient;
var socket;

exports.index = function(req, res){
	res.render('index', { title: '', siteTitle : siteTitle });
};

exports.room = function(req, res){
	db.rooms.findOne({"slug" : req.params.slug}, function(error, room){
		if (error || !room) {
			console.log("Sala não encontrada.");
		}else{
			var user = new Object();
			var sessionId = req.session.sessionId;
			user.id = req.session.userId;
			user.name = req.session.username;
			res.render('room', { title: room.name, siteTitle : siteTitle, room: req.room, user: user, sessionId: sessionId });
		}
	});
};

exports.private = function(req, res){
	db.users.findOne({"_id" : db.ObjectId(req.params.id)}, function(error, user){
		if (error || !user) {
			console.log("Usuário não encontrado.");
		}else{
			res.render('private', { title: user.name, siteTitle : siteTitle, user: user });
		}
	});
};

exports.rooms = function(req, res){
	ioclient = req.ioclient;
	socket = ioclient.connect('http://localhost/');
	console.log("socket.io: ");
	console.log(socket.io);
	console.log("socket.io.engine.id: ");
	console.log(socket.io.engine.id);
	var method = req.originalMethod;
	if (method == "GET") { 
		var user = req.body;
		if (!user.name) {
	    	res.render('index', { title: '', siteTitle : siteTitle, msg_feedback: "Para entrar numa sala é preciso digitar um nome de usuário." });
	    }else{
			db.rooms.find(function(error, rooms){
				if (error || !rooms) {
					res.render('rooms', { title: 'Salas', siteTitle : siteTitle, rooms: null, msg_feedback: "Nenhuma sala encontrada." });
				}else{
					res.render('rooms', { title: 'Salas', siteTitle : siteTitle, rooms: rooms });
				}
			});
		}
	}
	else {
		var user = req.body;
	    if (!user.name) {
	    	res.render('index', { title: '', siteTitle : siteTitle, msg_feedback: "Um nome de usuário não foi digitado." });
	    }else{
	   //  	db.users.findOne({"name" : user.name}, function(error, user){
				// if (error || !user) {
					db.users.insert(user,
			        function(error, user){
		            	//console.log(user._id);
		                if (error) {
		                	console.log("erro insert: ");
		                    console.log(error);
		                } else {
		                	console.log("redirect insert... ");
		                	if(!req.session.sessionId){
		                		req.session.sessionId = socket.io.engine.id;
		                		req.session.userId = req.session.sessionId;
		                	}else{
		                		req.session.userId = req.session.sessionId;
		                	}
		                	req.session.username = user.name;
		                	console.log("req.session: ");
		                	console.log(req.session);
		           		
		                    db.rooms.find(function(error, rooms){
								if (error || !rooms) {
									res.render('rooms', { title: 'Salas', siteTitle : siteTitle, rooms: null, msg_feedback: "Nenhuma sala encontrada."});
								}else{
									res.render('rooms', { title: 'Salas', siteTitle : siteTitle, rooms: rooms });
								}
							});
		                }
			        });
				// }else{
				// 	if(!req.session.sessionId){
    //             		req.session.sessionId = uuid.v1();
    //             		req.session.userId = req.session.sessionId;
    //             	}else{
    //             		req.session.userId = req.session.sessionId;
    //             	}
    //             	req.session.username = user.name;
    //             	db.rooms.find(function(error, rooms){
				// 		if (error || !rooms) {
				// 			res.render('rooms', { title: 'Salas', siteTitle : siteTitle, rooms: null, msg_feedback: "Nenhuma sala encontrada."});
				// 		}else{
				// 			res.render('rooms', { title: 'Salas', siteTitle : siteTitle, rooms: rooms });
				// 		}
				// 	});
				// }
			// });
	    }
	}
};