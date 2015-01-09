"use strict";

var httpProxy   = require("http-proxy");
var satellite   = require("satellite");

// Add 2 different servers to the proxy list
satellite.addAddress({host: "localhost", port: 8001});
satellite.addAddress({host: "localhost", port: 8002});
satellite.addAddress({host: "localhost", port: 8003});

var proxyServer = httpProxy.createServer(

    // tell the proxy server to use sticky-session support. 
    satellite.stickySessionStrategy,

    function (req,res, proxy){
        satellite.store.targetAddress.get( function(targetAddress) {
            proxy.proxyRequest(req, res, targetAddress);
        });
    }
).listen(8000);