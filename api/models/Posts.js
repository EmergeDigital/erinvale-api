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
      type: "string"
    },
    created_by_id: {
      type: "string",
      required: true,
    },
    title: {
      type: "string",
      required: true,
    },
    subtitle: {
      type: "string",
      required: true,
    },
    image_url: {
      type: "string"
    },
    text: {
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
    user_group_golf: {
      type: "boolean"
    },
    user_group_hoa: {
      type: "boolean"
    },
  }
};

