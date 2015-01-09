/**
 * Created by Dali on 16/12/14.
 */

"use strict";

var subscriber = require("./subscriber");


/**
 * Redis read queue when it receive a message
 */
var redisEvent = function() {
    subscriber.sub.on("message", function (pattern, msg) {

        if (pattern === "new-msg-queue") {
            subscriber.sendMsgQueue(msg);
        } else if (pattern === "disconnect-chat-queue") {
            subscriber.deleteConnectionQueue(msg);
        } else if (pattern === "new-user-queue") {
            subscriber.newUserQueue(msg);
        }
    });
};

exports = module.exports = {
    redisEvent: redisEvent
};