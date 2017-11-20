/**
 * Posts.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

  tableName: "posts",
  connection: "erinvale_mongo",

  attributes: {
    id: {
      type: "string",
      required: true,
      unique: true
    },
    created_by: {
      type: "string",
      required: true,
    },
    repeating: {
      type: "boolean",
      defaultsTo: false
    },
    title: {
      type: "string"
    },
    subtitle: {
      type: "string"
    },
    image_url: {
      type: "string"
    },
    text: {
      type: "string"
    },
    markdown: {
      type: "string"
    },
    html: {
      type: "string"
    },
    edited: {
      type: "string"
    },
    comments: {
      type: "Array",
      defaultsTo: [{}]
    },
    liked_by: {
      type: "Array",
      defaultsTo: []
    },
  }
};

