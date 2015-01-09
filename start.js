/**
 * Created by Dali on 17/12/14.
 */


"use strict";
var redis = require("redis");

require("bluebird").promisifyAll(redis);

var purge = redis.createClient(6379, "localhost");

purge.flushallAsync().then(function() {
    var sys = require("sys");
    var exec = require("child_process").exec;
    var child;


    child = exec("node chat/index.js 8001", function (error, stdout, stderr) {
        sys.print("stdout: " + stdout);
        sys.print("stderr: " + stderr);
        if (error !== null) {
            console.log("exec error: " + error);
        }
    });


    child = exec("node chat/index.js 8002", function (error, stdout, stderr) {
        sys.print("stdout: " + stdout);
        sys.print("stderr: " + stderr);
        if (error !== null) {
            console.log("exec error: " + error);
        }
    });

    child = exec("node chat/index.js 8003", function (error, stdout, stderr) {
        sys.print("stdout: " + stdout);
        sys.print("stderr: " + stderr);
        if (error !== null) {
            console.log("exec error: " + error);
        }
    });


    //child = exec("node load-balancer/load-balancer.js", function (error, stdout, stderr) {
    //    sys.print("stdout: " + stdout);
    //    sys.print("stderr: " + stderr);
    //    if (error !== null) {
    //        console.log("exec error: " + error);
    //    }
    //});
});




