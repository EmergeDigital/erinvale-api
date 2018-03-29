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
			let url = uploadedFiles[0].extra.Location;
		  return response.status(200).json(url);
		})
  },

	deleteFile: (request, response) => {
		// console.log(request.file);
    if(request.body.download.url) {
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
        const url = request.body.download.url;
        let _url = url.replace('https://erinvale-fr.s3.eu-west-3.amazonaws.com/', '');
        //SHOULD BE: sp.png

        adapter.rm(_url, (err, res) => {
          if(err) {
            response.status(400).json(err);
          } else {
            response.status(200).json("completed");
          }
          // res is whatever S3 SDK returns (honestly no idea what's inside, have a look)
      })

    } else {
      response.status(400).json("please define a file url");
    }
	},

  /**
   * Sends out a contact request
   * @param request
   * @param response
   */
  contact: (request, response) => {
      console.log("Received POST for CONTACT REQUEST");
      console.log("PROTOCOL: " + request.protocol + '://' + request.get('host') + request.originalUrl + "\n");


      let contact = request.body;

      let to = secrets.mailgun.support_address;

      let subject = "Contact Request from " + contact.name + " - Erinvale Portal";
      let _options = {
          name: contact.name,
          message: contact.message,
          email: contact.email.toLowerCase().trim()
      };

      //SEND EMAIL BELOW WITH PASSWORD
      emailService.renderEmailAsync("contactRequest.html", _options).then((html, text) => {
        return emailService.createMail(html, text, to, subject)
      }).then(() => {
        response.status(200).json("Sent");
        console.log("Done with this contact request (" + contact.email + ")");
      }).catch(ex => {
        response.status(400).json(ex);
      })
  },

  /**
   * Sends out a registration request
   * @param request
   * @param response
   */
  register: (request, response) => {
      console.log("Received POST for REGISTER REQUEST");
      console.log("PROTOCOL: " + request.protocol + '://' + request.get('host') + request.originalUrl + "\n");


      let contact = request.body;

      let to = secrets.mailgun.support_address;

      let subject = "Registration Request from " + contact.name + " - Erinvale Portal";
      let _options = {
          name: contact.name,
          email: contact.email.toLowerCase().trim(),
          user_type: contact.user_group === "Both" ? "Resident & Golf Member" : contact.user_group,
          erf: contact.erf ? contact.erf : "N/A",
          mn: contact.mn ? contact.mn : "N/A",
          address: contact.address ? contact.address : "None Provided",
      };

      //SEND EMAIL BELOW WITH PASSWORD
      emailService.renderEmailAsync("registerRequest.html", _options).then((html, text) => {
        return emailService.createMail(html, text, to, subject)
      }).then(() => {
        response.status(200).json("Sent");
        console.log("Done with this contact request (" + contact.email + ")");
      }).catch(ex => {
        response.status(400).json(ex);
      })
  },

};

