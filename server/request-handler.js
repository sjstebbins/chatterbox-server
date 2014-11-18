/*************************************************************

You should implement your request handler function in this file.

requestHandler is already getting passed to http.createServer()
in basic-server.js, but it won't work as is.

You'll have to figure out a way to export this function from
this file and include it in basic-server.js so that it actually works.

*Hint* Check out the node module documentation at http://nodejs.org/api/modules.html.

**************************************************************/
var rooms = { '/classes/messages': [], '/classes/room1': []};
exports.requestHandler = function(request, response) {
  // Request and Response come from node's http module.
  //
  // They include information about both the incoming request, such as
  // headers and URL, and about the outgoing response, such as its status
  // and content.
  //
  // Documentation for both request and response can be found in the HTTP section at
  // http://nodejs.org/documentation/api/

  // Do some basic logging.
  //
  // Adding more logging to your server can be an easy way to get passive
  // debugging help, but you should always be careful about leaving stray
  // console.logs in your code.
  console.log("Serving request type " + request.method + " for url " + request.url);

  var responseClean = function(){
      headers['Content-Type'] = "application/json";
      response.writeHead(statusCode, headers);
      response.end(result);
  };
  var optionsParse = function(){
    return request.url.replace(/\?(.*)/,'');
  };


  // See the note below about CORS headers.
  var headers = defaultCorsHeaders;
  var statusCode = 404;
  var result = 'Page not found';
  if (request.method === 'GET'){
    var url = optionsParse();
    statusCode = rooms[url] ? 200: 404;
    var data = JSON.stringify({results: rooms[url] || []});
    result = data;
    responseClean();
  }
  else if (request.method === 'POST'){
    statusCode = 201;
    var message = '';
    request.on('data', function(data){
      message += data;
    });
    result = 'Post Success';
    request.on('end', function(){
      message = JSON.parse(message);
      message.objectId = Math.floor(Math.random() * 1000 );
      rooms[request.url] = rooms[request.url] || [];
      rooms[request.url].push(message);
      responseClean();
    });
  } else if (request.method === 'OPTIONS') {
    statusCode = 200;
    responseClean();
  } else {
    responseClean();
  }




  // Make sure to always call response.end() - Node may not send
  // anything back to the client until you do. The string you pass to
  // response.end() will be the body of the response - i.e. what shows
  // up in the browser.
  //
  // Calling .end "flushes" the response's internal buffer, forcing
  // node to actually send all the data over to the client

};

// These headers will allow Cross-Origin Resource Sharing (CORS).
// This code allows this server to talk to websites that
// are on different domains, for instance, your chat client.
//
// Your chat client is running from a url like file://your/chat/client/index.html,
// which is considered a different domain.
//
// Another way to get around this restriction is to serve you chat
// client from this domain by setting up static file serving.
var defaultCorsHeaders = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "GET, POST, PUT, DELETE, OPTIONS",
  "access-control-allow-headers": "content-type, accept",
  "access-control-max-age": 10 // Seconds.
};

