/**
 * Downloads.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

  tableName: "downloads",
  connection: "erinvale_mongo",

  attributes: {
    id: {
      type: "string",
      required: true,
      unique: true
    },
    title: {
      type: "string"
    },
    subtitle: {
      type: "string"
    },
    description: {
      type: "string"
    },
    url: {
      type: "string",
      required: true
    },
    user_group_golf: {
      type: "boolean"
    },
    user_group_hoa: {
      type: "boolean"
    },
    archived: {
      type: "boolean",
      defaultsTo: false
    },
    downloaded_by: {
      type: "Array"
    },
    file_name: {
      type: "string",
      required: true
    }
  }
};

