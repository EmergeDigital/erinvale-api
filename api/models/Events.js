/**
 * Events.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

  tableName: "events",
  connection: "erinvale_mongo",

  attributes: {
    id: {
      type: "string",
      required: true,
      unique: true
    },
    date_start: {
      type: "datetime"
    },
    date_end: {
      type: "datetime"
    },
    created_by: {
      type: "string",
      required: true,
    },
    repeating: {
      type: "boolean",
      defaultsTo: false
    },
    interval: {
      type: "string"
    },
    title: {
      type: "string"
    },
    subtitle: {
      type: "string"
    },
    text: {
      type: "string"
    },
    html: {
      type: "string"
    },
    attending: {
      type: "Array"
    },
    location_lat: {
      type: "string"
    },
    location_lon: {
      type: "string"
    },
    location_name: {
      type: "string"
    },
    // published: {
    //   type: "boolean",
    //   defaultsTo: false
    // },
    user_group_golf: {
      type: "boolean"
    },
    user_group_hoa: {
      type: "boolean"
    },
  }
};

