/**
 * UsersController
 *
 * @description :: Server-side logic for managing users
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

// Imports
let bcrypt = require('bcrypt');
let shortid = require('shortid');
let moment = require('moment');
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
            welcomeUser(success, user.password);
            response.json(success);
        }).catch(ex => {
            console.log("create user: error: ", find_error(ex));
            response.status(400).json(find_error(ex));
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

    //Gets a single user

    getUser: (request, response) => {
        console.log("\nReceived GET for SINGLE USER");
        console.log("PROTOCOL: " + request.protocol + '://' + request.get('host') + request.originalUrl + "");

        console.log("get user: ", request.query);

        if(!!request.query) {
            sails.models.users.findOne(request.query).then(result => {
                if (!!result) {
                    response.status(200).json(result);
                } else {
                    response.status(400).json("Unable to find user");
                }
            }).catch(ex => {
                console.log(ex);
                response.status(400).json(ex);
            });
        } else {
            response.status(400).json("Please send a query string");
        }
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
            email: request.body.user.email
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
            response.json(find_error(ex));
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
        // console.log(request.query);
        sails.models.users.find(request.query).then(users => {
            // console.log(users);
            response.statusCode = 200;
            response.json(users);
        }).catch(ex => {
            console.log(ex);
            response.status(400).json(ex);
        });
    },

    /**
    * Get all user dashboarrd data
    * @param request
    * @param response
    */
    getDashboardContent: (request, response) => {
        console.log("Received GET for USER DASHBOARD");
        console.log("PROTOCOL: " + request.protocol + '://' + request.get('host') + request.originalUrl + "\n");

        //This assumes just a regular user, admin user will return more data
        let events, posts, user;
        let params = {};

        sails.models.users.findOne(request.query).then(_user => {
            user = _user;
            params = processUserGroup(user);
            console.log(params);
            return sails.models.posts.find(params);
        }).then(_posts => {
            posts = _posts;
            //---Latest posts---
            posts.sort(function(a, b) {
                a = new Date(a.createdAt);
                b = new Date(b.createdAt);
                return a>b ? -1 : a<b ? 1 : 0;
            });
            posts = posts.slice(0, 5);
            return sails.models.events.find(params);
        }).then(_events => {
            events = _events;
            // console.log(posts);
            //New events (1 week old)
            let last7DayStart = moment().startOf('day').subtract(1,'week');
            let today =  moment();
            let new_events = _.filter(events, each => {
                   return moment(each.createdAt)
                     .isBetween(last7DayStart, today);
            });

            //Events the user is attending (filter out dates past later);
            let my_events = _.filter(events, each => {
                let _attending = each.attending || [];
                return _attending.includes(user.id);
            });

            //---Upcoming Events---

            //Filter within the next month based on start date (start of today -> 1 month)
            let nextMonthStart = moment().startOf('day').add(1,'month');
            let todayStart = moment().startOf('day');
            let upcoming_events = _.filter(events, each => {
                return moment(each.date_start)
                    .isBetween(todayStart, nextMonthStart);
            });

            //Sort by date_start (high -> low) and then reverse array (low -> high)
            upcoming_events.sort(function(a, b) {
                a = new Date(a.date_start);
                b = new Date(b.date_start);
                return a>b ? -1 : a<b ? 1 : 0;
            });
            events = upcoming_events.reverse().slice(0, 5);

            if(params = {}){ //Get user data for admin user
                return sails.models.users.find().then((users)=>{ //Get user data for admin user
                    //---Latest users---
                    users.sort(function(a, b) {
                        a = new Date(a.createdAt);
                        b = new Date(b.createdAt);
                        return a>b ? -1 : a<b ? 1 : 0;
                    });

                    console.log(users);

                    let user_counts = {
                        admin: 0,
                        golf: 0,
                        hoa: 0
                    };

                    for (let u of users) {
                        switch (processAccountType(u)){
                            case "Admin":
                                user_counts.admin++;
                                break;

                            case "HOA":
                                user_counts.hoa++;
                                break;

                            case "Golf":
                                user_counts.golf++;
                                break;
                        }
                    }

                    //New users (1 week old)
                    let last7DayStart = moment().startOf('day').subtract(6,'days');
                    let todayStart = moment().endOf('day');
                    users = _.filter(users, each => {
                        return moment(each.createdAt)
                            .isBetween(last7DayStart, todayStart);
                    });

                    console.log(users);

                    //Separate into weekdays
                    let new_users = {};
                    for(let x = 0; x < 7; x++){
                        let wd = moment().subtract(x, 'days').format('dddd');
                        new_users[wd] = 0;
                    }
                    for(let u of users){
                        let weekDay = moment(u.createdAt).format('dddd');
                        new_users[weekDay]++;
                    }

                    let data = {
                        posts,
                        events,
                        new_users,
                        user_counts,
                        new_events,
                        my_events
                    };
                    response.status(200).json(data);
                });
            } else { //Is a user, data is complete
                let data = {
                    posts,
                    events,
                    new_events,
                    my_events
                };
                response.status(200).json(data);
            }

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
                    if (!!new_password && new_password.length > 3) {
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

                    // let link = "http://localhost:1337/v1/users/reset_password?token=" + hash + "&email=" + _user.email;
                    let link = "https://erinvale.emergenow.co.za/v1/users/reset_password?token=" + hash + "&email=" + _user.email;
                    // console.log( qs.escape(link));

                    let _options = {
                        name: user.first_name,
                        password_reset_link: link
                    };
                    response.status(200).json("Password reset link has been sent, please check your emails.");

                    emailService.renderEmailAsync("passwordResetLink.html", _options).then((html, text) => {
                        emailService.createMail(html, text, _user.email, "Password Reset Requested - Erinvale").then(() => {
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
                            response.status(200).json("Password reset, please check your emails.");

                            emailService.renderEmailAsync("passwordReset.html", _options).then((html, text) => {
                                emailService.createMail(html, text, _user.email, "Password Reset - Erinvale").then(() => {
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
        return ex;
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

function welcomeUser(user, password) {
    return new Promise((resolve, reject) => {
        console.log("PASSWORD: " + password);
        console.log("User account created, sending email");
        let to = user.email;
        let user_type = processAccountType(user);

        let subject = "Welcome to Erinvale - " + user_type + " Members";
        let _options = {
            name: user.first_name,
            temporary_password: password,
            email: user.email
        };

        //SEND EMAIL BELOW WITH PASSWORD
        emailService.renderEmailAsync("user" + user_type + "Welcome.html", _options).then((html, text) => {
            emailService.createMail(html, text, to, subject).then(() => {
                resolve(true);
                console.log("Done with this user (" + user.email + ")");
            });
        });
    })
}

function processAccountType(user) {
  if(user.permissions === "admin") {
    return "Admin";
  } else {
    if(user.user_group_hoa) {
      return "HOA";
    }
    return "Golf";
  }
}

function processUserGroup(user) {
    let params = {};
    if(user.permissions === "admin") {
        return params;
    } else {
        if(user.user_group_hoa) {
          if (user.user_group_golf) {
            params.user_group_golf = true;
          }
          params.user_group_hoa = true;
        } else if (user.user_group_golf) {
           params.user_group_golf = true;
        } else {
            params.user_group_hoa = false;
            params.user_group_golf = false;
        }
        return params;
    }
}
