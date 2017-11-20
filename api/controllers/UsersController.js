/**
 * UsersController
 *
 * @description :: Server-side logic for managing users
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

// Imports
let bcrypt = require('bcrypt');
let shortid = require('shortid');
let generator = require('generate-password');
let qs = require('querystring');
let _ = require('lodash');
const special_users = [
    "admin"
];

module.exports = {

    /**
     * Creates a user, if they do not already exist.
     * @param request
     * @param response
     */
    createUser: (request, response) => {
        console.log("Received POST for CREATE USER");
        console.log("PROTOCOL: " + request.protocol + '://' + request.get('host') + request.originalUrl + "\n");

        let user = request.body;
        user.id = shortid.generate();

        sails.models.users.create(user).then(success => {
            console.log("Logging success: ", success);
            response.json(success);
        }).catch(ex => {
            response.statusCode = 400;
            response.status = 400;
            console.log("create user: error: ", ex);
            response.json(ex);
        })
    },

    /**
     * Functions as the login method. Returns info for a single user
     * @param request
     * @param response
     */
    loginUser: (request, response) => {
        console.log("\nReceived GET for SINGLE USER");
        console.log("PROTOCOL: " + request.protocol + '://' + request.get('host') + request.originalUrl + "");

        console.log("get user: search user: ", {
            email: request.query.email,
            password: request.query.password
        });

        // Step 1:  Get the user with matching email address,
        //          check if password matches with bcrypt
        checkLogin(request.query.email, request.query.password, response).then(user => {
            if (!!user) {
                response.status(200).json(user);
            } else {
                response.status(400).json("There was a problem logging in");
            }
        });
    },

    /**
     * Functions as the login method for admins. Returns info for a single user
     * Will only log in successfully if permission levels are high enough
     * @param request
     * @param response
     */
    loginAuthorizedUser: (request, response) => {
        console.log("\nReceived GET for SINGLE AUTHORIZED USER");
        console.log("PROTOCOL: " + request.protocol + '://' + request.get('host') + request.originalUrl + "");

        console.log("get user: search user: ", {
            email: request.query.email,
            password: request.query.password
        });

        // Step 1:  Get the user with matching email address,
        //          check if password matches with bcrypt
        checkLogin(request.query.email, request.query.password, response).then(user => {
            if (!!user) {
                if (special_users.indexOf(user.permissions) > -1) {
                    response.status(200).json(user);
                } else {
                    response.status(400).json("Insufficient Permissions");
                }
            } else {
                response.status(400).json("There was a problem logging in");
            }
        });
    },

    /**
     * Updates an existing user, after username and password are provided.
     * @param request
     * @param response
     */
    updateUser: (request, response) => {
        console.log("\nReceived POST for UPDATE USER");
        console.log("PROTOCOL: " + request.protocol + '://' + request.get('host') + request.originalUrl + "");

        let original = {
            id: request.body.user.id
        };

        let changes = request.body.changes;
        console.log(JSON.stringify(request.body));

        sails.models.users.update(original, changes).then(result => {
            console.log("Success.", result);
            response.statusCode = 200;
            response.json(result[0]);
        }).catch(ex => {
            console.log(ex);
            response.statusCode = 400;
            response.json(ex)
        })
    },

    /**
     * Deletes an existing user
     * @param request
     * @param response
     */
    deleteUser: (request, response) => {
        console.log("\nReceived POST for DELETE USER");
        console.log("PROTOCOL: " + request.protocol + '://' + request.get('host') + request.originalUrl + "");

        let user = {
            email: request.body.user.email
        };

        sails.models.users.destroy(user).then(result => {
            // console.log("Success.");
            response.statusCode = 200;
            response.json({})
        }).catch(ex => {
            console.log(ex);
            response.statusCode = 400;
            response.json(ex)
        })
    },

    /**
     * Get all users in an array. Used for analytics purposes.
     * @param request
     * @param response
     */
    getUsers: (request, response) => {
        console.log("Received GET for ALL USERS");
        console.log("PROTOCOL: " + request.protocol + '://' + request.get('host') + request.originalUrl + "\n");
        // let users = get();
        sails.models.users.find(request.query).then(users => {
            response.statusCode = 200;
            response.json(users);
        }).catch(ex => {
            console.log(ex);
            response.status(400).json(ex);
        });
    },


    /**
     * Change email address
     * @param request
     * @param response
     */
    changeEmail: (request, response) => {
        console.log("Received POST for CHANGE EMAIL");
        console.log("PROTOCOL: " + request.protocol + '://' + request.get('host') + request.originalUrl + "\n");
        let user = {
            email: request.body.user.new_email
        };

        let _user = {
            email: request.body.user.email
        };

        if (emailService.validateEmail(user.email)) {
            //Check if password that was sent is correct
            sails.models.users.findOne(_user).then(result => {
                checkPassword(request.body.user.password, result.password).then(password_match => {
                    if (password_match) {
                        //Check if email address is in use
                        sails.models.users.findOne(user).then(_result => {
                            if (!!_result) {
                                response.status(400).json("Email address already in use");
                            } else {
                                //Change email
                                sails.models.users.update(_user, user).then(u => {
                                    if (!!u) {
                                        response.status(200).json("Email Changed Successfully");
                                    } else {
                                        response.status(400).json("User not found");
                                    }
                                });
                            }
                        });
                    } else {
                        response.status(403).json("Password is incorrect");
                    }
                }).catch(e => {
                    response.status(400).json(e);
                });
            }).catch(ex => {
                console.log(ex);
                response.status(400).json(ex);
            });
        } else {
            response.status(400).json("Email address is invalid");
        }

    },

    /**
     * Change password
     * @param request
     * @param response
     */
    changePassword: (request, response) => {
        console.log("Received POST for CHANGE PASSWORD");
        console.log("PROTOCOL: " + request.protocol + '://' + request.get('host') + request.originalUrl + "\n");
        let _user = {
            email: request.body.user.email
        };

        console.log(request.body);

        let password = request.body.user.password;
        console.log(password);
        let new_password = request.body.user.new_password;

        let user = {
            password: new_password
        };

        //Check if password that was sent is correct
        sails.models.users.findOne(_user).then(result => {
            checkPassword(password, result.password).then(password_match => {
                if (password_match) {
                    //Check if password length is long enough
                    if (!!new_password && new_password.length > 6) {
                        sails.models.users.update(_user, user).then(u => {
                            if (!!u) {
                                response.status(200).json("Password Changed Successfully");
                            } else {
                                response.status(400).json("User not found");
                            }
                        });
                    } else {
                        response.status(400).json("Password is not long enough");
                    }
                } else {
                    response.status(403).json("Password is incorrect");
                }
            }).catch(e => {
                response.status(400).json(e);
            })
        }).catch(ex => {
            console.log(ex);
            response.status(400).json(ex);
        });

    },

    /**
     * Reset password link
     * @param request
     * @param response
     */
    resetPasswordLink: (request, response) => {
        console.log("Received GET for RESET PASSWORD LINK");
        console.log("PROTOCOL: " + request.protocol + '://' + request.get('host') + request.originalUrl + "\n");
        // let users = get();
        let _user = {email: request.query.email};

        sails.models.users.findOne(_user).then(user => {
            if (!!user) {
                let appendedString = user.email.concat(user.first_name, user.contact_number);
                bcrypt.hash(appendedString, 10, function (err, hash) {
                    if (err) {
                        response.status(400).json(err);
                    }
                    console.log(hash);

                    let link = "https://api.erinvale.co.za/v1/users/reset_password?token=" + hash + "&email=" + _user.email;
                    // let link = "http://localhost:1337/v1/users/reset_password?token=" + hash + "&email=" + _user.email;
                    // console.log( qs.escape(link));

                    let _options = {
                        name: user.first_name,
                        password_reset_link: link
                    };

                    emailService.renderEmailAsync("passwordResetLink.html", _options).then((html, text) => {
                        emailService.createMail(html, text, _user.email, "Password Reset Requested - Erinvale").then(() => {
                            response.status(200).json("Password reset link has been sent, please check your emails.");
                        });
                    });
                });

            } else {
                response.status(400).json("Account does not exist");
            }
        }).catch(ex => {
            console.log(ex);
            response.status(400).json(ex);
        });
    },

    /**
     * Reset password
     * @param request
     * @param response
     */
    resetPassword: (request, response) => {
        console.log("Received GET for RESET PASSWORD");
        console.log("PROTOCOL: " + request.protocol + '://' + request.get('host') + request.originalUrl + "\n");
        // let users = get();
        let _user = {email: request.query.email};
        let token = request.query.token;


        sails.models.users.findOne(_user).then(user => {
            if (!!user) {
                let appendedString = user.email.concat(user.first_name, user.contact_number);
                bcrypt.compare(appendedString, token, (err, match) => {
                    if (err) {
                        response.status(403).json("Token is incorrect");
                    } else {

                        let password = generator.generate({length: 10, numbers: true});

                        sails.models.users.update(_user, {password: password}).then(result => {

                            let _options = {
                                name: user.first_name,
                                temporary_password: password
                            };

                            emailService.renderEmailAsync("passwordReset.html", _options).then((html, text) => {
                                emailService.createMail(html, text, _user.email, "Password Reset - Erinvale").then(() => {
                                    response.status(200).json("Password reset, please check your emails.");
                                });
                            });

                        });
                    }
                })

            } else {
                response.status(400).json("Account does not exist");
            }
        }).catch(ex => {
            console.log(ex);
            response.status(400).json(ex);
        });
    },

};

function find_error(ex) {
    if (ex.toString()
            .toLowerCase()
            .includes("already exists")) {
        return "That email address has already been registered!"
    } else {
        // console.log(ex.toString().toLowerCase());
    }
}

function checkPassword(password, hash) {
    return new Promise((resolve, reject) => {
        console.log(password, hash);
        bcrypt.compare(password, hash, (err, match) => {
            if (err) {
                console.log(err);
                reject("Error checking password!");
            } else {
                resolve(match);
            }
        })
    })
}

function checkLogin(email, password, response) {
    return new Promise((resolve, reject) => {
        let found_user;
        sails.models.users.find({email: email}).then(results => {
            if (results.length === 1) {
                found_user = results[0];
                return checkPassword(password, found_user.password);
            } else {
                // fail non-gracefully
                return Promise.reject("No matching username!")
            }
        }).then(password_match => {
            if (!password_match) {
                response.status(403).json("Incorrect password");
            } else {
                delete found_user.password;
                resolve(found_user);
            }
        }).catch(ex => {
            console.log(ex);
            response.statusCode = 400;
            response.json(ex);
        })

    })
}
