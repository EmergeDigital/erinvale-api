/**
 * FunctionsController
 *
 * @description :: Server-side logic for managing functions
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

const rek = require('rekuire');
const shortid = require('shortid');
const secrets = rek("secrets/secrets.js");
const s3 =  secrets.s3;
const v4 = require('aws-signature-v4');
var FroalaEditor = rek('lib/froalaEditor.js');

module.exports = {
  /**
   * Creates a signature for s3 uploads
   * @param request
   * @param response
   */
  sign: (request, response) => {
      console.log("Received GET for S3 SIGNATURE");
      console.log("PROTOCOL: " + request.protocol + '://' + request.get('host') + request.originalUrl + "\n");

      // let shortid1 = shortid.generate();
      // let shortid2 = shortid.generate();
      console.log(request.query.folder);

      const configs = {
        // The name of your bucket.
        bucket: s3.bucket,

        // S3 region. If you are using the default us-east-1, it this can be ignored.
        region: 'eu-west-3',

        // The folder where to upload the images.
        keyStart: request.query.folder + "/",

        // File access.
        acl: 'public-read',

        // AWS keys.
        accessKey: s3.key,
        secretKey: s3.secret
      }

      let s3Hash = FroalaEditor.S3.getHash(configs);
      response.status(200).json(s3Hash);
  },


  /**
   * Creates all signatures for s3 uploads
   * @param request
   * @param response
   */
  signAll: (request, response) => {
    console.log("Received GET for ALL S3 SIGNATURES");
    console.log("PROTOCOL: " + request.protocol + '://' + request.get('host') + request.originalUrl + "\n");

    // let shortid1 = shortid.generate();
    // let shortid2 = shortid.generate();

    let configs = {
      // The name of your bucket.
      bucket: s3.bucket,

      // S3 region. If you are using the default us-east-1, it this can be ignored.
      region: 'eu-west-3',

      // The folder where to upload the images.
      keyStart: "images/",

      // File access.
      acl: 'public-read',

      // AWS keys.
      accessKey: s3.key,
      secretKey: s3.secret
    }
    let images = FroalaEditor.S3.getHash(configs);


    let configs2 = {
      // The name of your bucket.
      bucket: s3.bucket,

      // S3 region. If you are using the default us-east-1, it this can be ignored.
      region: 'eu-west-3',

      // The folder where to upload the images.
      keyStart: "videos/",

      // File access.
      acl: 'public-read',

      // AWS keys.
      accessKey: s3.key,
      secretKey: s3.secret
    }
    let videos = FroalaEditor.S3.getHash(configs2);


    let configs3 = {
      // The name of your bucket.
      bucket: s3.bucket,

      // S3 region. If you are using the default us-east-1, it this can be ignored.
      region: 'eu-west-3',

      // The folder where to upload the images.
      keyStart: "docs/",

      // File access.
      acl: 'public-read',

      // AWS keys.
      accessKey: s3.key,
      secretKey: s3.secret
    }
    let docs = FroalaEditor.S3.getHash(configs3);


    let urls = { images, videos, docs };
    console.log(urls);
    response.status(200).json(urls);
  },

	uploadFile: (request, response) => {
		// console.log(request.file);
    let options = {
      adapter: require('skipper-better-s3'),
			key: s3.key,
			secret: s3.secret,
			bucket: s3.bucket,
			s3config: {
			   signature_version: 's3v4'
			},
			onProgress: progress => console.log('Upload progress:', progress)
		};

		request.file('file').upload(options, (err, uploadedFiles) => {
		  // ... Continue as usual
			if (err) {
		    return response.serverError(err);
		  }
			let url = processUrl(uploadedFiles[0].extra.Location);
			response.statusCode = 200;
		  return response.json(url);
		})
  },

	deleteFile: (request, response) => {
		// console.log(request.file);
    let options =
      {
        key: s3.key,
        secret: s3.secret,
        bucket: s3.bucket,
      }
      // This will give you an adapter instance configured with the
      // credentials and bucket defined above
      , adapter = require('skipper-better-s3')(options)

      //EG : https://s3.eu-west-3.amazonaws.com/erinvale-fr/sp.png
      let full_url = request.query.url;
      let url = full_url.replace('https://s3.eu-west-3.amazonaws.com/'+ s3.bucket + '/', '');
      //SHOULD BE: sp.png

      adapter.rm(url, (err, res) => {
        if(err) {
          response.status(400).json(err);
        } else {
          response.status(200).json("completed");
        }
        // res is whatever S3 SDK returns (honestly no idea what's inside, have a look)
      })
	},
};
