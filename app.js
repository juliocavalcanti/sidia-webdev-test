//Módulos
var http = require('http')
  , express = require('express')
  , path = require('path')
  , bodyParser = require('body-parser')
  , cookieParser = require('cookie-parser')
  , session = require('express-session')
  , methodOverride = require('method-override')
  , httpProxy = require("http-proxy")
  , app = express();
    routes = require('./routes');
    uuid = require('node-uuid');

//Variáveis
var databaseUrl = "webchat"
  , collections = ["rooms","users"];
	db = require("mongojs").connect(databaseUrl, collections);
	siteTitle = "Webchat - SidiaDev";
	sessionStore = new session.MemoryStore;
	host = 'http://localhost:80';

  
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
ioclient = require('socket.io-client')(host);
//var io = require('socket.io').listen(app.listen(port));

io.sockets.on('connection', function (socket) {
	socket.on('send', function (data) {
		// console.log("data: ");
		// console.log(data);
		console.log("socket: ");
		console.log(socket);
		//console.log("session: ");
		//console.log(sessionStore);
		if(data != null) {
	       var user = data.userId;
	        if(user != null) {
	            io.sockets.emit('message', data);
	        } else {
	            var sysMsg = {type: "error", message: "Usuários não encontrado"};
	            socket.emit('systemMessage', sysMsg);
	        }
	    }
	});
	socket.on('disconnect', function() {
	    //sessionMgm.remove(socket.id);
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
    console.log('req: ');
    console.log(req);
    return next();
});

router.get("/", routes.index);
router.get("/home", routes.index);
router.get("/room/:slug", routes.room);
router.all("/rooms", routes.rooms);
router.get("/private/:id", routes.private);
app.use('/', router);

//Servidor
console.log("Listening on port " + app.get('port'));