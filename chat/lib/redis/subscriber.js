/**
 * Created by Dali on 16/12/14.
 */

"use strict";

var redis = require("redis"),
    Promise = require("bluebird"),
    ws = require("../../index"),
    store = require("./store");

Promise.promisifyAll(redis);


var sub = redis.createClient(6379, "localhost");
sub.subscribe("new-msg-queue");
sub.subscribe("new-user-queue");
sub.subscribe("disconnect-chat-queue");



/**
 *
 * @param msg
 */
var sendMsgQueue = function (msg) {
    var message = JSON.parse(msg);
    store.getValueByKey(message.socketId + "-user-queue").then(function (userSendingMsg) {
        store.getKeysFromRedisWithWildCard("*-user-queue").then(function (usersKey) {
            usersKey.forEach(function (key) {
                store.getValueByKey(key).then(function (obj) {
                    var eachUser = JSON.parse(obj);
                    if (ws.io.sockets.connected[eachUser.socketId] !== undefined) {
                        message.user = JSON.parse(userSendingMsg);
                        ws.io.to(eachUser.socketId).emit("new-msg", message);
                    }
                });
            });
        });
    });
};


/**
 *
 * @param msg
 */
var deleteConnectionQueue = function (msg) {
    var key = msg + "-user-queue";
    store.getValueByKey(key).then(function (userToDelete) {
        store.deleteUserFromRedisByKey(key).then(function () {
            store.getKeysFromRedisWithWildCard("*-user-queue").then(function (usersKey) {
                usersKey.forEach(function (key) {
                    store.getValueByKey(key).then(function (obj) {
                        var eachUser = JSON.parse(obj);
                        if (ws.io.sockets.connected[eachUser.socketId] !== undefined) {
                            ws.io.to(eachUser.socketId).emit("disconnect-user", JSON.parse(userToDelete));
                        }
                    });
                });
            });
        });
    });
};

/**
 *
 * @param msg
 */
var newUserQueue = function (msg) {
    store.getKeysFromRedisWithWildCard("*-user-queue").then(function (usersKey) {
        usersKey.forEach(function (key) {
            store.getValueByKey(key).then(function (obj) {
                var eachUser = JSON.parse(obj);
                if (ws.io.sockets.connected[eachUser.socketId] !== undefined) {
                    var user = JSON.parse(msg);
                    if (user.socketId !== eachUser.socketId) {
                        ws.io.to(eachUser.socketId).emit("new-user", user);
                    }
                    ws.io.to(eachUser.socketId).emit("connected-users", eachUser);
                }
            });
        });
    });
};


exports = module.exports = {
    newUserQueue: newUserQueue,
    deleteConnectionQueue: deleteConnectionQueue,
    sendMsgQueue: sendMsgQueue,
    sub: sub
};