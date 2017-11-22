/**
 * PostsController
 *
 * @description :: Server-side logic for managing posts
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

let shortid = require('shortid');
let moment = require('moment');
var jsdom = require("jsdom");
const { JSDOM } = jsdom;

module.exports = {
	/**
     * Creates a post
     * @param request
     * @param response
     */
    createPost: (request, response) => {
        console.log("Received POST for CREATE Post");
        console.log("PROTOCOL: " + request.protocol + '://' + request.get('host') + request.originalUrl + "\n");

        let post = request.body;
        post.id = shortid.generate();
        const dom = new JSDOM(post.html);
        let img = '../assets/img/placeholder-image.jpg';
        let imgs = dom.window.document.getElementsByTagName('img');
        for (let i = 0; i < imgs.length; i++) {
            let src = imgs[i].getAttribute('src');
            if (src) {
                img = src;
                break;
            }
        }

        post.image_url = img;

        console.log(post);

        sails.models.posts.create(post).then(success => {
            console.log("Logging success: ", success);
            response.status(200).json(success);
        }).catch(ex => {
            console.log("create post: error: ", ex);
            response.status(400).json(ex);
        })
    },

    
	/**
     * Gets a single post
     * @param request
     * @param response
     */

    getPost: (request, response) => {
        console.log("\nReceived GET for SINGLE Post");
        console.log("PROTOCOL: " + request.protocol + '://' + request.get('host') + request.originalUrl + "");

        console.log("get post: ", request.query);

        if(!!request.query.id) {
            sails.models.posts.findOne({id: request.query.id}).then(result => {
                if (!!result) {
                    response.status(200).json(result);
                } else {
                    response.status(400).json("Unable to find post");
                }
            }).catch(ex => {
                console.log(ex);
                response.status(400).json(ex);
            });
        } else {
            response.status(400).json("Please send a query id");
        }
    },

    /**
     * Updates an existing post
     * @param request
     * @param response
     */
    updatePost: (request, response) => {
        console.log("\nReceived POST for UPDATE Post");
        console.log("PROTOCOL: " + request.protocol + '://' + request.get('host') + request.originalUrl + "");

        let original = {
            id: request.body.post.id
        };

        let changes = request.body.changes;
        changes.edited = "Edited " + moment().format('MMMM Do YYYY, h:mm a');
        const dom = new JSDOM(changes.html);
        let img = '../assets/img/placeholder-image.jpg';
        let imgs = dom.window.document.getElementsByTagName('img');
        for (let i = 0; i < imgs.length; i++) {
            let src = imgs[i].getAttribute('src');
            if (src) {
                img = src;
                break;
            }
        }
        changes.image_url = img;
        console.log(JSON.stringify(changes));


        sails.models.posts.update(original, changes).then(result => {
            console.log("Success.", result);
            response.statusCode = 200;
            response.json(result[0]);
        }).catch(ex => {
            console.log(ex);
            response.statusCode = 400;
            response.json(ex);
        })
    },

    /**
     * Deletes an existing post
     * @param request
     * @param response
     */
    deletePost: (request, response) => {
        console.log("\nReceived POST for DELETE Post");
        console.log("PROTOCOL: " + request.protocol + '://' + request.get('host') + request.originalUrl + "");

        let post = {
            id: request.body.post.id
        };

        sails.models.posts.destroy(post).then(result => {
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
     * Get all posts in an array
     * @param request
     * @param response
     */
    getPosts: (request, response) => {
        console.log("Received GET for ALL Posts");
        console.log("PROTOCOL: " + request.protocol + '://' + request.get('host') + request.originalUrl + "\n");
        
        sails.models.posts.find(request.query).then(posts => {
            response.statusCode = 200;
            response.json(posts);
        }).catch(ex => {
            console.log(ex);
            response.status(400).json(ex);
        });
    },

};

