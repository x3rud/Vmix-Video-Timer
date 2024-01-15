const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
const axios = require('axios');
const { XMLParser, XMLBuilder, XMLValidator} = require("fast-xml-parser");
var lodash = require('lodash');


app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', (socket) => {
    console.log('a user connected');
    socket.on('disconnect', () => {
      console.log('user disconnected');
    }); 
});

server.listen(3000, () => {
  console.log('listening on *:3000');
});


function makeRequest() {

    // Make a request for a user with a given ID
    axios.get('http://'+process.argv[2]+'/API')
      .then(function (response) {

        const options = {
            ignoreAttributes : false
        };

        const parser = new XMLParser(options);
        let jObj = parser.parse(response.data);

        //console.log(jObj.vmix.inputs);

        var picked = lodash.filter(jObj.vmix.inputs.input, { '@_number': jObj.vmix.active.toString() } );
        
        //console.log(picked);

        var time = Math.trunc((parseInt(picked[0]['@_duration']) - parseInt(picked[0]['@_position']))/1000);

        //console.log(time);

        io.emit('timer', { time: time, name: picked[0]['@_title'], number: picked[0]['@_number'], state: picked[0]['@_state'], timeT: parseInt(picked[0]['@_duration'])/1000  });
      })
}

setInterval(makeRequest, 1000)