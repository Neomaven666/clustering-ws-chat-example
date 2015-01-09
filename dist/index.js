"use strict";


var cluster = require("cluster");
var numCPUs = require("os").cpus().length;

var role = "clustering chat websocket";
var respawn = true;

if (cluster.isMaster) {
    // Fork workers.
    for (var i = 0; i < numCPUs; i++) {
        cluster.fork();
    }

    cluster.on("online", function(worker) {
        console.info("Worker %d %s (PID %d) online", worker.id, role, worker.process.pid);
    });

    cluster.on("listening", function(worker, address) {
        console.info("Worker %d %s (PID %d) listening on %s:%d", worker.id, role, worker.process.pid, address.address, address.port);
    });
    
    cluster.on("disconnect", function(worker) {
        console.warn("Worker %d %s (PID %d) disconnected", worker.id, role, worker.process.pid);
    });

    cluster.on("exit", function (worker, code, signal) {

        console.info("worker " + worker.process.pid + " died");

        if (worker.suicide === true || code === 0) {
            console.warn("Worker %d %s (PID %d) suicide%s", worker.id, role, worker.process.pid, respawn?". Respawning cancelled.":"");
            respawn = false;
        } else {
            console.warn("Worker %d %s (PID %d) died (%s)%s", worker.id, role, worker.process.pid, signal||code, respawn?". Respawning...":"");
        }

        if (respawn) {
            cluster.fork(worker.id);
        }

    });
} else {
    var args = process.argv.splice(2);
    var port = args[0] > 0 ? args[0] : 8001;

    var SocketIO = require("socket.io");

    var express = require("express");
    var app = express();

    app.use("/", express.static(__dirname + "/public"));

    var server = app.listen(port, function () {
        var host = server.address().address;
        var port = server.address().port;
        //console.log("Example app listening at http://%s:%s", host, port);
    });

    var io = SocketIO.listen(server);

    exports = module.exports = {
        io: io
    };

    var wsEvent = require("./lib/socketio/socket-event"),
        redisEvent = require("./lib/redis/redis-event");

    wsEvent.wsEvent();
    redisEvent.redisEvent();

}
