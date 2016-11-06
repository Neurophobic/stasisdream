var mongojs = require('mongojs');
var maps = require('./map.js');

var db = null;
// var db = mongojs('localhost:27017/myGame', ['account','progress']);

var express = require('express');
var app = express();
var serv = require('http').Server(app);


//SETUP EXPRESS
app.get('/', function(req, res){
	res.sendFile(__dirname + '/client/index.html');
});
app.use('/client',express.static(__dirname+'/client'));

serv.listen(process.env.PORT || 2000);
console.log("SERVER ONLINE");

//SOCKETS

var SOCKET_LIST = {};

var mapArray = maps.mapArray;

var mapGen = function(mapArr){
	var theTile ={"code":"", "rand":""};
	var theMap =[];
	for(var r=0; r< mapArr.length;r++){
		theMap.push([]);
		for(var c=0; c<mapArr[r].length; c++){
			if(mapArr[r][c] === 0){
				var floorMod = Math.floor(Math.random() * (9 - 0 + 1)) + 0;
				theTile.code = 0;
				theTile.rand = floorMod;
			} else if(mapArr[r][c] === 1){
				theTile.code = 1;
			} else if(mapArr[r][c] === 2){
				theTile.code = 2;
			}  else if(mapArr[r][c] === 9){
				theTile.code = 9;
			}  else if(mapArr[r][c] === 3){
				theTile.code = 3;
			}
			theMap[r].push(theTile);
			theTile ={"code":"", "rand":""};
		}
	}
	return theMap;
};

var floorArray = maps.floor;
var floorGen = function(floorArr){
	var theTile= {"is":false,"title":"", "rand":""};
	var floors = [];

	for(var r=0; r< floorArr.lenth; r++){
		floors.push([]);
		for(var c=0; c < floorArr[r].length; c++){
			if(floors[r][c] == 0){
				theTile.title = "empty";
				theTile.is = false;
			} else if(floors[r][c] == 1){
				var floorMod = Math.floor(Math.random() * (9 - 0 + 1)) + 0;
				theTile.rand = floorMod;
				theTile.title = "floorTile";
				theTile.is = true;
			}
			floors[r].push(theTile);
			var theTile= {"is":false,"title":"", "rand":""};
		}
	}
}

var theMap = mapGen(mapArray);
console.log(theMap);

var mapCollision = function(x,y){
	var mapX = 0;
	var mapY = 0;
	var modX = 0;
	var modY = 0;
	var playerBoxH = 196;
	var playerBoxW = 64;



	for(var r=0; r < theMap.length; r++){
		//row
		for(var c=0; c < theMap[r].length; c++){
		//column
			if(theMap[r][c].code == 1 ||theMap[r][c].code == 2 ){
				var tileStartX = mapX + modX;
				var tileStartY = mapY + modY;
				var tileEndX = tileStartX + 64;
				var tileEndY = tileStartY + 64;

				

				if (tileStartX < x + (playerBoxW ) &&
   					tileStartX + 64 > x &&
   					tileStartY < y + (playerBoxH ) &&
   					64 + tileStartY> y+(playerBoxH*0.8) ) {

					
					return true;
    // collision detected!
				}
			}

			modX+=64;
		}
		modX = 0;
		modY+= 64;
	};
	return false;
}

// var PLAYER_LIST = {};

var Entity = function(param){
	var self = {
		x:240,
		y:135,
		spdX:0,
		spdY:0,
		id:"",
		map:'forest'
	};

	if(param){
		if(param.x){
			self.x = param.x;
		}
		if(param.y){
			self.y = param.y;
		}
		if(param.map){
			self.map = param.map;
		}
		if(param.id){
			console.log("got id");
			self.id = param.id;
			console.log(self.id);
		}
	}

	self.update = function(){
		self.updatePosition();
	};

	self.updatePosition = function(){

		if(mapCollision(self.x+self.spdX, self.y + self.spdY)){
			console.log("collision");
			self.x = self.x;
			self.y = self.y;
			
		} else {
			self.x += self.spdX;
		self.y += self.spdY;	
		}
		
	};

	self.getDistance = function(pt){
		return Math.sqrt(Math.pow(self.x-pt.x,2) + Math.pow(self.y-pt.y,2));
	};

	return self;
};
var Player = function(param){

	var self = Entity(param);
	// self.id = id;
	self.number = ""+ Math.floor(10 *Math.random());
	self.pressingRight=false;
	self.pressingLeft=false;
	self.pressingUp=false;
	self.pressingDown=false;
	self.pressingAttack = false;
	self.mouseAngle = 0;
	self.maxSpd = 20;
	self.hp = 10;
	self.hpMax = 10;
	self.score = 0;
	self.isMoving = false;
	self.playerMap = theMap;
	
	var super_update = self.update;
	self.update = function(){
		self.updateSpd();
		super_update();

		if(self.pressingAttack){
			self.shootBullet(self.mouseAngle);
		}

	};

	self.shootBullet = function(angle){
		var b = Bullet({
			parent:self.id,
			angle:angle,
			x:self.x,
			y:self.y,
			map:self.map,
			});
		
	};

	self.updateSpd = function(){
		if(self.pressingRight){
			self.spdX = self.maxSpd;
		} else if(self.pressingLeft){
			self.spdX = -self.maxSpd;
		} else {
			self.spdX = 0;
		}

		if(self.pressingUp){
			self.spdY = -self.maxSpd;
		}else if(self.pressingDown){
			self.spdY = self.maxSpd;
		} else {
			self.spdY = 0;
		}
	};

	self.getInitPack = function(){
		return{
			id:self.id,
			x:self.x,
			y:self.y,
			number:self.number,
			hp:self.hp,
			maxHp: self.maxHp,
			score: self.score,
			map:self.map,
			playerMap:self.playerMap

		};
	};

	self.getUpdatePack = function(){
		return{
			id:self.id,
			x:self.x,
			y:self.y,
			hp:self.hp,
			score:self.score,
			isMoving:self.isMoving,
			mouseAngle:self.mouseAngle
		};
	};

	Player.list[self.id] = self;
	initPack.player.push(self.getInitPack());
	return self;
};

Player.list = {};
Player.onConnect = function(socket){
	console.log("[p] on connect::" +socket.id );
	var map = 'forest';
	// if(Math.random() < 0.5){
	// 	map = 'field';
	// }
	var player = Player({
		id:socket.id,
		map:map,
	});

	socket.on('keyPress', function(data){
		if(data.inputId==="right"){
			player.pressingRight = data.state;
			player.isMoving = data.state;
		} else if(data.inputId==="left"){
			player.pressingLeft = data.state;
			player.isMoving = data.state;
		} else if(data.inputId==="down"){
			player.pressingDown = data.state;
			player.isMoving = data.state;
		} else if(data.inputId==="up"){
			player.pressingUp = data.state;
			player.isMoving = data.state;
		} else if(data.inputId === "attack"){
			player.pressingAttack = data.state;
			// console.log("got attack");
		} else if(data.inputId === "mouseAngle"){
			player.mouseAngle = data.state;
		}

	});

	
	

	socket.emit('init', {
		selfId:socket.id,
		player:Player.getAllInitPack(),
		bullet:Bullet.getAllInitPack(),
	});
};

Player.getAllInitPack = function(){
	var players = [];
	for(var i in Player.list){
		//get all the players inits
		players.push(Player.list[i].getInitPack());
	}
	return players;
};

Player.onDisconnect = function(socket){
	delete Player.list[socket.id];
	removePack.player.push(socket.id);
};

Player.update = function(){
	var pack = [];
	for(var i in Player.list){
		var player = Player.list[i];
		player.update();
		pack.push(player.getUpdatePack());
	}
	return pack;
};

var Bullet = function(param){
	var self = Entity(param);
	self.id = Math.random();
	self.spdX = Math.cos(param.angle/180*Math.PI) * 10;
	self.spdY = Math.sin(param.angle/180*Math.PI) * 10;
	self.parent = param.parent;
	self.timer = 0;
	self.toRemove = false;

	var super_update = self.update;
	self.update = function(){
		if(self.timer++ > 100){
			self.toRemove = true;
		}
		super_update();

		for(var i in Player.list){
			var p = Player.list[i];
			if( self.getDistance(p) < 32 && self.parent !== p.id && self.map === p.map){
				p.hp -= 1;
				var shooter = Player.list[self.parent];
				if(shooter){
					shooter.score +=1;

				}
				if(p.hp <= 0){
					p.hp = p.hpMax;
					//DEAD
					p.score = 0;
				}
				self.toRemove = true;
			}
		}
	};

	self.getInitPack = function(){
		return {
			id:self.id,
			x:self.x,
			y:self.y,
			map:self.map,
		};
	};

	self.getUpdatePack = function(){
		return{
			id:self.id,
			x:self.x,
			y:self.y,
		};
	};

	Bullet.list[self.id] = self;
	initPack.bullet.push(self.getInitPack());
	return self;
};
Bullet.list = {};

Bullet.update = function(){
	var pack = [];
	for(var i in Bullet.list){
		var bullet = Bullet.list[i];
		bullet.update();
		if(bullet.toRemove){
			delete Bullet.list[i];
			removePack.bullet.push(bullet.id);
		}else{
			pack.push(bullet.getUpdatePack());
		}
		
	}
	return pack;
};

Bullet.getAllInitPack = function(){
	var bullets = [];
	for(var i in Bullet.list){
		//get all the bullet inits
		bullets.push(Bullet.list[i].getInitPack());
	}
	return bullets;
};

var DEBUG = true;

var USERS = {
	//username:pass
	"bob":"asd",
	"bob2":"asd2"
};

var isValidPassword = function(data,callback){

	//nodb
	return callback(true);

	db.account.find({username:data.username,password:data.password}, function(err,res){
		if(res[0]){
			//if there is a match
			callback(true);
		} else {
			callback(false);
		}
	});
};

var isUsernameTaken = function(data,callback){
	//nodb
	return callback(false);
	db.account.find({username:data.username}, function(err,res){
		if(res[0]){
			//if there is amatch
			callback(true);
		}else{
			callback(false);
		}
	});
};

var addUser = function(data,callback){
	//nodb
	return callback();
	db.account.insert({username:data.username, password:data.password}, function(err){
		callback();
	});
};

var io = require('socket.io')(serv,{});
io.sockets.on('connection', function(socket){
	socket.id = Math.random();
	SOCKET_LIST[socket.id] = socket;

	
	console.log('New socket connection!');
	console.log(socket.id);

	socket.on('signIn', function(data){
		isValidPassword(data, function(callback){
			if(callback){
				Player.onConnect(socket);
				socket.emit('signInResponse',{success:true});
			} else {
				socket.emit('signInResponse',{success:false});
			}
		});
	});

	socket.on('signUp', function(data){
		isUsernameTaken(data, function(callback){
			if(callback){
				socket.emit('signUpResponse',{success:false});
			} else {
				addUser(data, function(){
					socket.emit('signUpResponse',{success:true});
				});
			}
		});

	});

	

	socket.on('disconnect', function(){
		delete SOCKET_LIST[socket.id];
		Player.onDisconnect(socket);
	});

	socket.on('sendMsgToServer', function(data){
		var playerName = "" + socket.id;
		for(var i in SOCKET_LIST){
			SOCKET_LIST[i].emit('addToChat',playerName +":"+ data);
		}
	});

	socket.on('evalServer', function(data){
		if(!DEBUG){
			return;
		}
		var res = eval(data);

		socket.emit('evalAnswer',res);
		
	});

	
});


var initPack = {player:[], bullet:[]};
var removePack = {player:[], bullet:[]};

setInterval(function(){
	var pack = {
		player:Player.update(),
		bullet:Bullet.update(),
	};
	
	for(var i in SOCKET_LIST){
		var socket = SOCKET_LIST[i];
		socket.emit('init', initPack);
		socket.emit("update", pack);
		socket.emit("remove", removePack);
	}

	initPack.player = [];
	initPack.bullet = [];
	removePack.player = [];
	removePack.bullet = [];
},1000/25);