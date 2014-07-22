//Módulos
var http = require('http')
  , express = require('express')
  , path = require('path')
  , bodyParser = require('body-parser')
  , cookieParser = require('cookie-parser')
  , session = require('express-session')
  , methodOverride = require('method-override')
  , app = express();
    routes = require('./routes');
    uuid = require('node-uuid');

//Variáveis
var databaseUrl = "webchat"
  , collections = ["rooms","users"];
	db = require("mongojs").connect(databaseUrl, collections);
	siteTitle = "Webchat - SidiaDev";
	sessionStore = new session.MemoryStore;
  
//Config App
app.set('port', process.env.PORT || 80);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.engine('jade', require('jade').__express);
app.use(methodOverride('_method'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());         // pull information from html in POST
app.use(methodOverride());          // simulate DELETE and PUT
app.use(express.static(path.join(__dirname, 'public')));
app.use(cookieParser('sidiawebdev-test'));
app.use(session({ store: sessionStore, secret: 'sidiawebdev-test', saveUninitialized: true, resave: true, genid: function(req) { return uuid.v1(); }}));


//Config Debug
var env = process.env.NODE_ENV || 'development';
if ('development' == env) {
    var morgan = require('morgan'); // log every request to the console
    var errorHandler = require('errorhandler');
    app.use(morgan('dev'));
    app.use(errorHandler());
}

//Config Conexão
server = http.createServer(app).listen(app.get('port'));

io = require('socket.io').listen(server);
ioclient = require('socket.io-client')('http://localhost/');

io.sockets.on('connection', function (socket) {
	socket.on('send', function (data) {
		if(data != null) {
	       var history = new Object();
	       history.name = data.username;
	       history.message = data.message;
	        if(history != null) {
	        	db.rooms.insert({ history: history },
		        function(error, history){
	                if (error) {
	                	console.log("erro insert: ");
	                    console.log(error);
	                } else {
	               
	           			console.log(history);
	                   
	                }
		        });
	            io.sockets.emit('message', data);
	        } else {
	            var sysMsg = {type: "error", message: "Usuários não encontrado"};
	            socket.emit('systemMessage', sysMsg);
	        }
	    }
	});
	socket.on('disconnect', function() {

	});
});

//Rotas
var router = express.Router();
router.use(function(req, res, next) {
	console.log(req.method, req.url);
	next();	
});
app.use(function(req, res, next) {
    req.ioclient = ioclient;
    return next();
});

router.get("/", routes.index);
router.get("/home", routes.index);
router.all("/rooms", routes.rooms);
router.get("/room/:slug", routes.room);
router.get("/private/:id", routes.private);
app.use('/', router);

//Servidor
console.log("Listening on port " + app.get('port'));