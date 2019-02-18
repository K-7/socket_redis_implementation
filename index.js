const app = require('express')();
// const http = require('http').Server(app);
const port = 8080;
var server = app.listen(port, function(){console.log('listening on port: ', port)});
const io = require('socket.io').listen(server);
const redis = require('redis');

const client = redis.createClient();

io.origins('*:*');

app.use(function(req, res, next){
	res.header("Access-Control-Allow-Origin","*");
	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
	next();
});

app.get('/', (req, res)=>res.send('Hello World!'));

client.on('error', function(err){
	console.log("Error:"+err);
});

io.on('connection', function(socket){
	console.log('a user connected');
	socket.on('disconnect', function(a){
	console.log(a);
	});

	socket.on('get', function(id){
	client.get(id, function(err, value){
	socket.emit('get',{err:err, value:value});
	});

	socket.on('set', function(id, data){
	data = JSON.stringify(data);
	client.set(id, data, function(err, res){
		io.emit('set', {err:err, res:res});
		})
	});

});
});

app.get('/value/:id',(req, res)=>{
	client.get(req.params.id, function(err, value){
	res.send({err:err, value:value});
	});
})
// app.listen(port,()=>{console.log(`Example app listening on port ${port}!`)});
