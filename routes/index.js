const express = require("express");
const router = express.Router();
const bodyParser = require("body-parser");
const mysql = require("mysql");
const fs = require("fs");
const bcrypt = require("bcryptjs");
var path = require("path");
var logger = require("morgan");
var neo4j = require("neo4j-driver");

// neo4j
const uri = "neo4j+s://ea9ce623.databases.neo4j.io";
const user = "neo4j";
const password = "B6VEBr5fqpKlP287qmB7r3YlBwP9fO-pU5oQAA79HYk";

var driver = neo4j.driver(uri, neo4j.auth.basic(user, password));
var session = driver.session();
var readSession = driver.session(neo4j.session.READ);

// For remove all duplicates
function getUniqueListBy(arr, key) {
    return [...new Map(arr.map((item) => [item[key], item])).values()];
}

const LoginedUserInfos = require("./users").exportLoginedInfos;

var userInfos = {
    id: [],
    email: [],
    password: [],
};

const app = express();

// MySQL connection
const pool = mysql.createPool({
    connectionLimit: 10,
    host: "localhost",
    port: 3307,
    user: "root",
    password: "",
    database: "blobfile",
});

var adminInfos = {
    id: "",
    uname: "",
};

// Get homepage route
router.get("/admin", function (req, res) {
    var allSql =
        "OPTIONAL MATCH(a:Author) \
    OPTIONAL MATCH(r:Article) \
    OPTIONAL MATCH(j:Journal) RETURN a,r,j";
    var collaboratorSql =
        "MATCH(r:Article) WHERE r.title= $titleParam \
    OPTIONAL MATCH(r)<-[:WROTE]-(author) RETURN author";

    var articleCollaboratorsAll = [];

    // All session
    session
        .run(allSql)
        .then(function (result) {
            var authorArr = [];
            var articleArr = [];
            var journalArr = [];
            result.records.forEach(function (record) {
                authorArr.push({
                    id: record._fields[0].identity.low,
                    name: record._fields[0].properties.name,
                    surname: record._fields[0].properties.surname,
                });
                articleArr.push({
                    id: record._fields[1].identity.low,
                    title: record._fields[1].properties.title,
                    year: record._fields[1].properties.year,
                });
                journalArr.push({
                    id: record._fields[2].identity.low,
                    type: record._fields[2].properties.type,
                    name: record._fields[2].properties.name,
                });
            });

            // Remove all duplicates
            authorArr = getUniqueListBy(authorArr, "name");
            articleArr = getUniqueListBy(articleArr, "title");
            journalArr = getUniqueListBy(journalArr, "name");

            var readSessions = [];
            for (let i = 0; i < articleArr.length; i++) {
                readSessions.push(driver.session(neo4j.session.READ));
            }

            for (let i = 0; i < articleArr.length; i++) {
                // Article collaborators session
                readSessions[i]
                    .run(collaboratorSql, {
                        titleParam: articleArr[i].title,
                    })
                    .then(function (result2) {
                        var articleCollaborators = [];
                        result2.records.forEach(function (record) {
                            articleCollaborators.push({
                                id: record._fields[0].identity.low,
                                name: record._fields[0].properties.name,
                                surname: record._fields[0].properties.surname,
                            });
                        });

                        // Remove all duplicates
                        articleCollaborators = getUniqueListBy(
                            articleCollaborators,
                            "name"
                        );

                        articleCollaboratorsAll.push(articleCollaborators);
                        console.log(articleCollaborators);
                    })
                    .catch(function (err) {
                        console.log(err);
                    });
            }
            setTimeout(() => {
                console.log(articleCollaboratorsAll);

                if (adminInfos.uname == "") {
                    res.render("err_not_loged_in_admin", {});
                } else {
                    res.render("index", {
                        uname: adminInfos.uname,
                        user_id: adminInfos.id,
                        users: userInfos,
                        journals: journalArr,
                        articles: articleArr,
                        authors: authorArr,
                        articleCollaborators: articleCollaboratorsAll,
                    });
                }
            }, 2000);
        })
        .catch(function (err) {
            console.log(err);
        });
});

// Get author profile route
router.get("/admin/authors/:id", (req, res) => {
    var authorInfoSql =
        "MATCH(a:Author) WHERE ID(a)= $idParam \
    OPTIONAL MATCH(a)-[:WROTE]->(article) \
    OPTIONAL MATCH(a)-[:COAUTHOR]->(author) RETURN a, article, author";
    var collaboratorSql =
        "MATCH(r:Article) WHERE r.title= $titleParam \
    OPTIONAL MATCH(r)<-[:WROTE]-(author) \
    WHERE NOT $nameParam in author.name RETURN author";

    var articleCollaboratorsAll = [];

    // Author infos session
    session
        .run(authorInfoSql, { idParam: parseInt(req.params.id) })
        .then(function (result) {
            var authorInfo = [];
            var authorArticles = [];
            var authorCollaborators = [];
            result.records.forEach(function (record) {
                authorInfo.push({
                    id: record._fields[0].identity.low,
                    name: record._fields[0].properties.name,
                    surname: record._fields[0].properties.surname,
                });
                if (record._fields[1]) {
                    authorArticles.push({
                        id: record._fields[1].identity.low,
                        title: record._fields[1].properties.title,
                        year: record._fields[1].properties.year,
                    });
                } else {
                    authorArticles.push({
                        title: "no articles found",
                        year: "",
                    });
                }
                if (record._fields[2]) {
                    authorCollaborators.push({
                        id: record._fields[2].identity.low,
                        name: record._fields[2].properties.name,
                        surname: record._fields[2].properties.surname,
                    });
                } else {
                    authorCollaborators.push({
                        name: "no collaborators found",
                        surname: "",
                    });
                }
            });

            // Remove all duplicates
            authorInfo = getUniqueListBy(authorInfo, "name");
            authorArticles = getUniqueListBy(authorArticles, "title");
            authorCollaborators = getUniqueListBy(authorCollaborators, "name");

            var readSessions = [];
            for (let i = 0; i < authorArticles.length; i++) {
                readSessions.push(driver.session(neo4j.session.READ));
            }

            for (let i = 0; i < authorArticles.length; i++) {
                // Article collaborators session
                readSessions[i]
                    .run(collaboratorSql, {
                        titleParam: authorArticles[i].title,
                        nameParam: authorInfo[0].name,
                    })
                    .then(function (result) {
                        var articleCollaborators = [];
                        result.records.forEach(function (record) {
                            articleCollaborators.push({
                                id: record._fields[0].identity.low,
                                name: record._fields[0].properties.name,
                                surname: record._fields[0].properties.surname,
                            });
                        });

                        // console.log(result.records);
                        // console.log(temp);
                        // console.log(articleCollaborators);

                        // Remove all duplicates
                        articleCollaborators = getUniqueListBy(
                            articleCollaborators,
                            "name"
                        );

                        articleCollaboratorsAll.push(articleCollaborators);
                        console.log(articleCollaborators);
                    })
                    .catch(function (err) {
                        console.log(err);
                    });
            }
            setTimeout(() => {
                console.log(articleCollaboratorsAll);
                if (adminInfos.uname == "") {
                    res.render("err_not_loged_in_admin", {});
                } else {
                    res.render("profile_admin", {
                        uname: adminInfos.uname,
                        user_id: adminInfos.id,
                        users: userInfos,
                        authorArticles: authorArticles,
                        authorCollaborators: authorCollaborators,
                        authorInfo: authorInfo,
                        articleCollaborators: articleCollaboratorsAll,
                    });
                }
            }, 2000);
        })
        .catch(function (err) {
            console.log(err);
        });
});

// Admin Login page
router.get("/admin/login", (req, res) => {
    res.render("login_admin");
});

// Admin Login handle
router.post("/admin/login", (req, res, next) => {
    var uname = req.body.uname;
    var password = req.body.password;

    pool.getConnection((err, connection) => {
        if (err) {
            console.log(err);
        }
        console.log(`Connected as id ${connection.threadId}`);

        connection.query(
            "SELECT * from admins where uname = ? and password = ?",
            [uname, password],
            function (err, results, fields) {
                if (results.length > 0) {
                    adminInfos.id = results[0].id;
                    adminInfos.uname = uname;
                    setTimeout(() => {
                        req.flash(
                            "succes_msg",
                            "You are logged in succesfully!"
                        );
                        res.redirect("/admin");
                    }, 3000);
                } else {
                    req.flash(
                        "error_msg",
                        "Username or password is incorrect!"
                    );
                    res.redirect("/admin/login");
                }
            }
        );
    });
});

// Admin Logout handle
router.get("/admin/logout", (req, res) => {
    req.logout();
    req.flash("success_msg", "You are logged out");
    res.redirect("/admin/login");
});

module.exports = router;
