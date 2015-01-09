/**
 * Created by Dali on 16/12/14.
 */

"use strict";

var redis = require("redis"),
    Promise = require("bluebird");

Promise.promisifyAll(redis);

var store = redis.createClient(6379, "localhost");

/**
 * save user in redis when he's connected
 * @param socketId
 * @param object
 * @returns {Promise}
 */
var setUsertInRedis = function (socketId, object) {
    return new Promise(function (resolve, reject) {
        resolve(store.msetAsync(socketId + "-user-queue", object));
    });
};

/**
 * get key from redis by wildcard
 * @param key
 * @returns {Promise}
 */
var getKeysFromRedisWithWildCard = function (key) {
    return new Promise(function (resolve, reject) {
        resolve(store.keysAsync(key));
    });
};

/**
 * get value from redis by key
 * @param key
 * @returns {Promise}
 */
var getValueByKey = function (key) {
    return new Promise(function (resolve, reject) {
        resolve(store.getAsync(key));
    });
};

/**
 * delete user from redis by key
 * @param key
 * @returns {Promise}
 */
var deleteUserFromRedisByKey = function (key) {
    return new Promise(function (resolve, reject) {
        resolve(store.delAsync(key));
    });
};

exports = module.exports = {
    deleteUserFromRedisByKey: deleteUserFromRedisByKey,
    getValueByKey: getValueByKey,
    getKeysFromRedisWithWildCard: getKeysFromRedisWithWildCard,
    setUsertInRedis: setUsertInRedis,
    store: store
};