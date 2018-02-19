/**
 * Users.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

let bcrypt = require('bcrypt');

function hashPassword(values, next) {
    bcrypt.hash(values.password, 10, function(err, hash) {
        if (err) {
            return next(err);
        }
        values.password = hash;
        next();
    });
}

module.exports = {

  tableName: "users",
  connection: "erinvale_mongo",

  attributes: {

    id: {
      type: "string",
      required: true,
      unique: true
    },
    first_name: {
      type: "string",
      required: true,
    },
    last_name: {
      type: "string",
      required: true,
    },
    email: {
      type: "string",
      required: true,
      unique: true
    },
    password: {
      type: "string",
      required: true,
    },
    contact_number: {
      type: "string"
    },
    addressL1: {
      type: "string"
    },
    addressL2: {
      type: "string"
    },
    city: {
      type: "string"
    },
    province: {
      type: "string"
    },
    postal_code: {
      type: "string"
    },
    country: {
      type: "string"
    },
    image_url: {
      type: "string"
    },
    permissions: {
      type: "string",
      defaultsTo: "user"
    },
    user_group_golf: {
      type: "boolean"
    },
    user_group_hoa: {
      type: "boolean"
    },
    account_setup: {
      type: "boolean",
      defaultsTo: false
    },
    // Override toJSON instance method to remove password value
    toJSON: function() {
       let obj = this.toObject();
       delete obj.password;
       return obj;
    },
  },
  // Lifecycle Callbacks
  beforeCreate: function(values, next) {
      hashPassword(values, next);
  },
  beforeUpdate: function(values, next) {
      if (values.password) {
        hashPassword(values, next);
      }
      else {
        next();
      }
  }
};

