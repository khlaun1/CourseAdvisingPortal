const http = require('node:http')
//the above line is probably to create an http server.
//acc to web, this is used to import a module called http.
//from what I gather from the web, it's usually written like require('http')
//but as this is an evolving language, this tends to happen.




/* the create server method below creates a new instance of http server.
it has 2 arguments, a request and a response,
the reponse is a callback function
the callback function is invoked every time the server receives a new request.
*/

/*
cont {headers, method, url} = request this is object destructuring.

the request object has the exact same properties headers, method and url in order

we have to destructure in the exact same way with the same name.

why? 

so the nodejs knows which properties it has to extract from the the request object. If the variable names are even a slight bit 
different then the property will not be extracted from the request object

*/



http.createServer((request, response) =>{
    const {headers, method, url} = request;
    let body =[]
    request
    .on('error', err=>{
        console.error(err);
    })
    /* this request.on is setting up an event listener on the request object
    request is an object representing an incoming http request.
    request object is an instance of event emitter and we can listen to these events using on.
    objects are streams which are instances of event emitters
    EventEmitter is a class in nodejs.-

    the on method has 2 arguments, the first argument specifies the name of the event to listen for.
    which in this case is an error. If error then the second argument err is the object which will contain the information
    about what went wrong i.e. the error message and due to which line, we are getting the error.

    */
    .on('data', chunk=>{
        body.push(chunk);
    })
    /* In this particular case, the request object again is the event emitter and the event this time is data.
    the data is stored in the object called chunk. this chunk is then pushed onto the body array.
    */

    .on('end', ()=>{
        body = Buffer.concat(body).toString();
    })
})