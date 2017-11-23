/**
 * EventsController
 *
 * @description :: Server-side logic for managing events
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
var shortid = require('shortid');
var moment = require('moment');
var jsdom = require("jsdom");
var striptags = require('striptags');
const { JSDOM } = jsdom;

module.exports = {
	/**
     * Creates a event
     * @param request
     * @param response
     */
    createEvent: (request, response) => {
        console.log("Received POST for CREATE Event");
        console.log("PROTOCOL: " + request.protocol + '://' + request.get('host') + request.originalUrl + "\n");

        let event = request.body;
        event.id = shortid.generate();
        const dom = new JSDOM(event.html);
        let img = '../assets/img/placeholder-image.jpg';
        let imgs = dom.window.document.getElementsByTagName('img');
        for (let i = 0; i < imgs.length; i++) {
            let src = imgs[i].getAttribute('src');
            if (src) {
                img = src;
                break;
            }
        }

        event.image_url = img;
        event.text = striptags(event.html);

        console.log(event);

        sails.models.events.create(event).then(success => {
            console.log("Logging success: ", success);
            response.status(200).json(success);
        }).catch(ex => {
            console.log("create event: error: ", ex);
            response.status(400).json(ex);
        })
    },

    
	/**
     * Gets a single event
     * @param request
     * @param response
     */

    getEvent: (request, response) => {
        console.log("\nReceived GET for SINGLE Event");
        console.log("PROTOCOL: " + request.protocol + '://' + request.get('host') + request.originalUrl + "");

        console.log("get event: ", request.query);

        if(!!request.query.id) {
            sails.models.events.findOne({id: request.query.id}).then(result => {
                if (!!result) {
                    response.status(200).json(result);
                } else {
                    response.status(400).json("Unable to find event");
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
     * Updates an existing event
     * @param request
     * @param response
     */
    updateEvent: (request, response) => {
        console.log("\nReceived POST for UPDATE Event");
        console.log("PROTOCOL: " + request.protocol + '://' + request.get('host') + request.originalUrl + "");

        let original = {
            id: request.body.event.id
        };

        let changes = request.body.changes;
        changes.edited = "Edited " + moment().format('MMMM Do YYYY, h:mm a');
        if(changes.html) {
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
            changes.text = striptags(changes.html);

        }
        console.log(JSON.stringify(changes));


        sails.models.events.update(original, changes).then(result => {
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
     * Deletes an existing event
     * @param request
     * @param response
     */
    deleteEvent: (request, response) => {
        console.log("\nReceived POST for DELETE Event");
        console.log("PROTOCOL: " + request.protocol + '://' + request.get('host') + request.originalUrl + "");

        let event = {
            id: request.body.event.id
        };

        sails.models.events.destroy(event).then(result => {
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
     * Get all events in an array
     * @param request
     * @param response
     */
    getEvents: (request, response) => {
        console.log("Received GET for ALL Events");
        console.log("PROTOCOL: " + request.protocol + '://' + request.get('host') + request.originalUrl + "\n");
        
        sails.models.events.find(request.query).then(events => {
            response.statusCode = 200;
            response.json(events);
        }).catch(ex => {
            console.log(ex);
            response.status(400).json(ex);
        });
    },
};

