var express = require("express");
var path = require("path");
var logger = require("morgan");
var bodyParser = require("body-parser");
var neo4j = require("neo4j-driver");
const flash = require("connect-flash");
const sessionExpress = require("express-session");
const passport = require("passport");

const LoginedUserInfos = require("./routes/users").exportLoginedInfos;
var userInfos = {
    id: [],
    email: [],
    password: [],
};

var app = express();

// View engine
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

// Middleware
app.use(logger("dev"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));

// Bodyparser
app.use(express.urlencoded({ extended: false }));

// Express session
app.use(
    sessionExpress({
        secret: "keyboard cat",
        resave: true,
        saveUninitialized: true,
    })
);

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Connect flash
app.use(flash());

// Global vars
app.use((req, res, next) => {
    res.locals.success_msg = req.flash("success_msg");
    res.locals.error_msg = req.flash("error_msg");
    res.locals.error = req.flash("error");
    next();
});

app.use("/users", require("./routes/users").exportRouter);
app.use("/", require("./routes/index"));

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

// Get author profile route
app.get("/authors/:id", (req, res) => {
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
                if (LoginedUserInfos.email == "") {
                    res.render("err_not_loged_in", {});
                } else {
                    res.render("profile", {
                        email: LoginedUserInfos.email,
                        user_id: LoginedUserInfos.user_id,
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

// Get homepage route
app.get("/", function (req, res) {
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

                if (LoginedUserInfos.email == "") {
                    res.render("err_not_loged_in", {});
                } else {
                    res.render("index_user", {
                        email: LoginedUserInfos.email,
                        user_id: LoginedUserInfos.user_id,
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

// Add all route
app.post("/add", function (req, res) {
    var authorName = req.body.author_name;
    var authorSurname = req.body.author_surname;
    var articleTitle = req.body.article_title;
    var articleYear = req.body.article_year;
    var journalType = req.body.journal_type;
    var journalName = req.body.journal_name;

    var addSql =
        "MERGE(a:Author {name: $nameParam, surname: $surnameParam}) \
        MERGE(c:Article {title: $titleParam, year: $yearParam}) \
        MERGE(j:Journal {type: $typeParam, name: $jNameParam}) \
        MERGE(a)-[r:WROTE]->(c) \
        MERGE(c)-[p:PUBLISHED_IN]->(j) WITH a \
        MATCH (Article {title: $titleParam})<-[:WROTE]-(author) \
        WHERE NOT a.name in author.name \
        MERGE(a)-[s0:COAUTHOR]->(author) \
        MERGE(author)-[s1:COAUTHOR]->(a) \
        RETURN author";
    var onlyAuthorSql =
        "MERGE(a:Author {name: $nameParam, surname: $surnameParam})";

    // Check inputs and arrange querys
    function getSql(articleTitle, addSql, onlyAuthorSql) {
        if (articleTitle) {
            return addSql;
        } else {
            return onlyAuthorSql;
        }
    }
    session
        .run(getSql(articleTitle, addSql, onlyAuthorSql), {
            nameParam: authorName,
            surnameParam: authorSurname,
            titleParam: articleTitle,
            yearParam: articleYear,
            typeParam: journalType,
            jNameParam: journalName,
        })
        .then(function (result) {
            res.redirect("/admin");
        })
        .catch(function (err) {
            console.log(err);
        });
});

// Visulization route
app.get("/visulization", (req, res) => {
    res.render("visulization");
});

// Visulization profile route
app.get("/visulization/author/:id", (req, res) => {
    res.render("visulization_profile", {
        id: parseInt(req.params.id),
    });
});

app.listen(3000);
console.log("Server started on port 3000");

module.exports = app;
