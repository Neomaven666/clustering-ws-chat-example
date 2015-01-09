/**
 * Created by Dali on 16/12/14.
 */

"use strict";

var redis = require("redis"),
    md5 = require("MD5"),
    Promise = require("bluebird"),
    ws = require("../../index"),
    store = require("./store");

Promise.promisifyAll(redis);

var pub = redis.createClient(6379, "localhost");


/**
 *
 * @param user
 * @returns {*}
 */
var initConnection = function (user, socket) {
    var me = user;
    me.id = user.mail.replace("@", "-").replace(".", "-");
    me.avatar = "https://gravatar.com/avatar/" + md5(user.mail) + "?s=50";
    me.conTime = new Date();
    me.socketId = socket.id;


    var messages = [];
    store.store.lrangeAsync("message-list-bus", 0, -1).then(function (msgs) {
        messages = msgs.reverse();
    }).then(function () {
        store.setUsertInRedis(socket.id, JSON.stringify(me)).then(function () {
            pub.publishAsync("new-user-queue", JSON.stringify(me)).then(function () {
                store.getKeysFromRedisWithWildCard("*-user-queue").then(function (usersKey) {
                    usersKey.forEach(function (key) {
                        store.getValueByKey(key).then(function (obj) {
                            var user = JSON.parse(obj);
                            ws.io.to(socket.id).emit("new-user", user);
                        });
                    });
                }).then(function () {
                    messages.forEach(function (message) {
                        ws.io.to(socket.id).emit("new-msg", JSON.parse(message));
                    });
                });
            });
        });
    });
    return me;
};

/**
 *
 * @param msg
 */
var sendMsg = function (msg, socket, me) {
    var date = new Date();
    msg.h = date.getHours();
    msg.m = date.getMinutes();
    msg.socketId = socket.id;

    pub.publishAsync("new-msg-queue", JSON.stringify(msg)).then(function () {
        var saveMsg = msg;
        saveMsg.user = me;
        store.store.lpushAsync("message-list-bus", JSON.stringify(saveMsg)).then(function () {
            store.store.llenAsync("message-list-bus").then(function (length) {
                if (length > 2) {
                    store.store.rpop("message-list-bus");
                }
            });
        });
    });
};

/**
 *
 * @param socket
 */
var deleteConnection = function (socket) {
    pub.publishAsync("disconnect-chat-queue", socket.id);
};


exports = module.exports = {
    deleteConnection: deleteConnection,
    sendMsg: sendMsg,
    initConnection: initConnection
};