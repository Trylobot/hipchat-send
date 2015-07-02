#!/usr/bin/env node
var https = require("https");

var config = require(__dirname + "/config.json");
var auth_token = config.auth_token;

if(!process.argv[2] || !process.argv[3]) {
    console.log("usage: hipchat-send \"<room name>\" \"<message>\"");
    process.exit(400);
}
var args = {
    room_name: process.argv[2],
    message: process.argv[3]
};
if(args.room_name.length > 100) {
    console.error("error: room name must be less than 100 characters long");
    process.exit(400);
}
if(args.message.length > 1000) {
    console.error("error: message must be less than 1000 characters long");
    process.exit(400);
}


// main
///////////////////////////////////////////
send_message(args.room_name, args.message);


// functions
///////////////////////////////////////////
function send_message(room_name, message) {
    var body = {
        color: "gray",
        message: message,
        notify: false,
        message_format: "html"
    };
    var body_enc = JSON.stringify(body);
    var post = {
        host: "api.hipchat.com",
        path: "/v2/room/"+encodeURIComponent(room_name)+"/notification",
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Content-Length": body_enc.length,
            "Authorization": "Bearer "+auth_token
        }
    };
    var req = https.request(post, function(res) {
        res.setEncoding("utf8");
        console.log(res.statusCode+" "+res.statusMessage);
        var chunks = [];
        res.on("data", function(chunk) {
            chunks.push(chunk);
        });
        var debug = true;
        res.on("finish", function() {
            var json_resp = JSON.parse(chunks.join(""));
            if(json_resp && json_resp.error && json_resp.error.message) {
                debug = false;
                console.log(json_resp.error.message)
            }
        });
        if(debug && res.statusCode >= 400) {
            console.log("https");
            console.log(post);
            console.log(body);
        }
    });
    req.on("error", function(error) {
        console.error(error);
    })
    req.write(body_enc);
    req.end();
}
