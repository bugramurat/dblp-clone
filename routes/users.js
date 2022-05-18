const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const passport = require("passport");
const mysql = require("mysql");
const bodyParser = require("body-parser");

// MySQL connection
const pool = mysql.createPool({
    connectionLimit: 10,
    host: "localhost",
    port: 3307,
    user: "root",
    password: "",
    database: "blobfile",
});

// Login page
router.get("/login", (req, res) => {
    res.render("login");
});

var loginedUserInfos = {
    user_id: "",
    email: "",
};

// Login handle
router.post("/login", (req, res, next) => {
    var email = req.body.email;
    var password = req.body.password;

    pool.getConnection((err, connection) => {
        if (err) {
            console.log(err);
        }
        console.log(`Connected as id ${connection.threadId}`);

        // Select logined user (login handle)
        connection.query(
            "SELECT password, id from users where email = ?",
            [email],
            function (err, result, fields) {
                connection.release(); // Return the connection to pool
                if (result[0] == 0) {
                    req.flash("error_msg", "Email does not exist!");
                    res.redirect("/users/login");
                } else {
                    bcrypt.compare(
                        password,
                        result[0].password,
                        (err, isMatch) => {
                            if (err) throw err;

                            if (isMatch) {
                                loginedUserInfos.user_id = result[0].id;
                                loginedUserInfos.email = email;
                                setTimeout(() => {
                                    req.flash(
                                        "success_msg",
                                        "You are logged in succesfully!"
                                    );
                                    req.session["isLoaded"] = false;
                                    res.redirect("/");
                                }, 3000);
                            } else {
                                req.flash(
                                    "error_msg",
                                    "Email or password is incorrect!"
                                );
                                res.redirect("/users/login");
                            }
                        }
                    );
                }
            }
        );
    });
});

// Logout handle
router.get("/logout", (req, res) => {
    req.logout();
    req.flash("success_msg", "You are logged out");
    res.redirect("/users/login");
});

module.exports = router;

module.exports = {
    exportRouter: router,
    exportLoginedInfos: loginedUserInfos,
};
