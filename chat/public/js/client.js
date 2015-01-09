"use strict";

(function ($) {
    var socket = io.connect("https://localhost");

    /* ********************************* */
    var usertpl = $("#users").html();
    $("#users > li").remove();

    $("#loginform").submit(function (event) {
        event.preventDefault();

        socket.emit("connection-chat", {
            username: $("#username").val(),
            mail: $("#mail").val()
        });
    });

    /* ********************************* */


    /* ********************************* */
    var msgtpl = $("#messages").html();
    $("#messages > li").remove();

    $("#form").submit(function (event) {
        event.preventDefault();
        if ($("#message").val().length > 0) {
            socket.emit("new-msg", {
                message: $("#message").val()
            });
            $("#message").val("");
            $("#message").focus();
        }
    });


    /* ********************************* */


    /**
     * Client get events
     */
    socket.on("new-msg", function (msg) {
        $("#messages").append(Mustache.render(msgtpl, {msg: msg}));
        $("#chat").animate({scrollTop: $("#chat").prop("scrollHight")}, 50);
    });

    socket.on("disconnect-user", function (user) {
        if (user !== null) {
            var elem = document.getElementById(user.id);
            elem.parentNode.removeChild(elem);
            //$("#" + user.id).remove();
        }
    });

    socket.on("new-user", function (user) {
        $("#users").append(Mustache.render(usertpl, {user: user}));
    });

    socket.on("connected-users", function (users) {
        $("#login").fadeOut();
        $("#chat").show();
        $("#message").focus();

        if (users) {
            $("#users-list").show();
        } else {
            $("#users-list").fadeOut();
        }
    });


})(jQuery);