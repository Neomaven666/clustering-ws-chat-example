/**
 * Created by Dali on 16/12/14.
 */

"use strict";
var ws = require("../../index"),
    publisher = require("../redis/publisher");

var me = false;

var wsEvent = function() {

    ws.io.on("connection", function (socket) {

        /**
         * user connect to chat
         */
        socket.on("connection-chat", function (user) {
            console.log("WS:", socket.id);
            me = publisher.initConnection(user, socket);
        });

        /**
         * user send message
         */
        socket.on("new-msg", function (msg) {
            publisher.sendMsg(msg, socket, me);
        });

        /**
         * user disconnect from chat
         */
        socket.on("disconnect", function () {
            publisher.deleteConnection(socket);
        });

    });
};


exports = module.exports = {
    wsEvent: wsEvent
};