var fs = require('fs');
var express = require('express');
var bodyParser = require('body-parser');
var app = express();

app.use(bodyParser.json());
app.all('*',function(req,res,next){
  res.header("access-control-allow-origin", "*");
  res.header("access-control-allow-methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("access-control-allow-headers", "content-type, accept");
  res.header("access-control-max-age", 10);
  next();
});
// app.get('/', function (req, res) {
//   res.send('Hello World!');
// });

app.route('/classes/messages')

.get(function(req, res) {
  res.json(JSON.parse(fs.readFileSync('messages.json')));
})
.post(function(req, res) {
  var message = req.body;
  message.objectId = Math.floor(Math.random() * 1000 );
  var rooms = JSON.parse(fs.readFileSync('messages.json'));
  rooms.results.push(message);
  fs.writeFileSync('messages.json',JSON.stringify(rooms));
  res.send('Message Posted');
})
.options(function(req, res) {
  res.send('Hello Options');
});

var server = app.listen(3000, function () {

  var host = server.address().address;
  var port = server.address().port;

  console.log('Express Server listening at http://%s:%s', host, port);
});
// var headers = defaultCorsHeaders;

// var defaultCorsHeaders = {
//   "access-control-allow-origin": "*",
//   "access-control-allow-methods": "GET, POST, PUT, DELETE, OPTIONS",
//   "access-control-allow-headers": "content-type, accept",
//   "access-control-max-age": 10 // Seconds.
// };

// if (request.method === 'GET'){
//     var url = optionsParse();
//     rooms = JSON.parse(fs.readFileSync('messages.json'));
//     statusCode = rooms[url] ? 200: 404;
//     var data = JSON.stringify({results: rooms[url] || []});
//     result = data;
//     responseClean();
//   }
//   else if (request.method === 'POST'){
//     statusCode = 201;
//     var message = '';
//     request.on('data', function(data){
//       message += data;
//     });
//     result = 'Post Success';
//     request.on('end', function(){
//       message = JSON.parse(message);
//       message.objectId = Math.floor(Math.random() * 1000 );
//       // rooms[request.url] = rooms[request.url] || [];
//       // rooms[request.url].push(message);s
//       rooms = JSON.parse(fs.readFileSync('messages.json'));
//       rooms[request.url] = rooms[request.url] || [];
//       rooms[request.url].push(message);
//       fs.writeFileSync('messages.json', JSON.stringify(rooms));
//       responseClean();
//     });
//   } else if (request.method === 'OPTIONS') {
//     statusCode = 200;
//     responseClean();
//   } else {
//     responseClean();
//   }



// });
