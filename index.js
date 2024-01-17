const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
const axios = require('axios');
const { XMLParser, XMLBuilder, XMLValidator} = require("fast-xml-parser");
var lodash = require('lodash');
var config = require("./environment.json");

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
    axios.get('http://'+config.vmix+'/API')
      .then(function (response) {

        const options = {
            ignoreAttributes : false
        };

        const parser = new XMLParser(options);
        let jObj = parser.parse(response.data);

        //console.log(jObj.vmix.inputs);

        var picked = lodash.filter(jObj.vmix.inputs.input, { '@_number': jObj.vmix.active.toString() } );
        
        //console.log(picked);

       if(picked[0].overlay && picked[0]["@_type"] != "Video") {
          if(picked[0].overlay.length > 1) {
            picked[0].overlay.forEach(element => {
              var overlay = lodash.filter(jObj.vmix.inputs.input, { '@_key': element["@_key"] } ); 
              if(overlay[0]["@_type"] == "Video" && overlay[0]["@_state"] == "Running"){
                picked = overlay;
              }
            });
          }else{
              var overlay = lodash.filter(jObj.vmix.inputs.input, { '@_key': picked[0].overlay["@_key"] } );
              picked = overlay;
            }
          var time = Math.trunc((parseInt(picked[0]['@_duration']) - parseInt(picked[0]['@_position']))/1000);
       }else{
          var time = Math.trunc((parseInt(picked[0]['@_duration']) - parseInt(picked[0]['@_position']))/1000);
       }

        //console.log(time);

        io.emit('timer', { time: time, name: picked[0]['@_title'], number: picked[0]['@_number'], state: picked[0]['@_state'], timeT: parseInt(picked[0]['@_duration'])/1000  });
      })
}

setInterval(makeRequest, 1000)
