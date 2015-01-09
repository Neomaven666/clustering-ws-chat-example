/**
 * Created by Dali on 17/12/14.
 */

"use strict";
var gulp = require("gulp"),
    server = require("gulp-develop-server"),
    livereload = require("gulp-livereload"),
    uglify = require("gulp-uglify"),
    minifyCss = require("gulp-minify-css"),
    del = require("del"),
    zip = require("gulp-zip"),
    minifyHtml = require("gulp-minify-html"),
    usemin = require("gulp-usemin"),
    rev = require("gulp-rev"),
    jscpd = require("gulp-jscpd");

// run server
gulp.task("server:start", function () {
    server.listen({path: "./start.js"});
});

// restart server if app.js changed
gulp.task("server:restart", function () {
    var server = livereload();
    gulp.watch(["./start.js", "./chat/index.js", "./load-balancer/load-balancer.js"], server.restart);
});

// clean app
gulp.task("clean", function () {
    return del("./dist", function (err, deletedFiles) {
        console.log("Files deleted:", deletedFiles);
    });
});

gulp.task("usemin", ["clean"], function () {
    return gulp.src(__dirname + "/chat/public/index.html")
        .pipe(usemin({
            css: [minifyCss(), "concat"],
            html: [minifyHtml({empty: true})],
            js: [uglify(), rev()]
        }))
        .pipe(gulp.dest("dist/public"));
});

gulp.task("copie-lib-file", function() {
    return gulp.src(__dirname + "/chat/lib/**/*")
        .pipe(jscpd({
            "min-lines": 10,
            verbose    : true
        }))
        .pipe(gulp.dest("dist/lib"));

});


gulp.task("copie-index-file", function() {
    return gulp.src(__dirname + "/chat/*.js")
        .pipe(jscpd({
            "min-lines": 10,
            verbose    : true
        }))
        .pipe(gulp.dest("dist"));
});

// watch files changes
gulp.task("watch", function () {
    var server = livereload();
    gulp.watch("chat/lib/redis/*.js", ["compress-lib-redis"]);
    gulp.watch("chat/lib/socketio/*.js", ["compress-lib-socketio"]);
    gulp.watch("load-balancer/**/*.js", ["usemin"]);
    gulp.watch("chat/public/**/*.html", ["usemin"]);
    gulp.watch("chat/public/**/*.js", ["usemin"]);
    gulp.watch("chat/*.js", ["compress-index"]);

    gulp.watch(["chat/*.js", "chat/lib/**/*.js", "load-balancer/**/*.js", "chat/public/**/*.html", "chat/public/**/*.js"]).on("change", function (event) {
        console.log("@-->caught change in file", event);
        server.changed(event.path);
    });
});


gulp.task("dist", ["clean", "usemin", "copie-index-file", "copie-lib-file", "watch"], function () {});
//gulp.task("dist", ["clean", "usemin", "compress-lib-redis", "compress-lib-socketio", "compress-index", "watch"], function () {});

gulp.task("default", ["dist"], function () {
    // create zip
    return gulp.src("dist/**/*")
        .pipe(zip("dist.zip"))
        .pipe(gulp.dest("dist"));
});