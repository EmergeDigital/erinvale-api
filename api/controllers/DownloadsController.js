/**
 * DownloadsController
 *
 * @description :: Server-side logic for managing downloads
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
const rek = require('rekuire');
const shortid = require('shortid');
const secrets = rek("secrets/secrets.js");
const s3 =  secrets.s3;
const v4 = require('aws-signature-v4');

module.exports = {
	/**
     * Creates a download
     * @param request
     * @param response
     */
    createDownload: (request, response) => {
        console.log("Received POST for CREATE Download");
        console.log("PROTOCOL: " + request.protocol + '://' + request.get('host') + request.originalUrl + "\n");

        let download = request.body;
        download.id = shortid.generate();

        console.log(download);

        sails.models.downloads.create(download).then(success => {
            console.log("Logging success: ", success);
            response.status(200).json(success);
        }).catch(ex => {
            console.log("create download: error: ", ex);
            response.status(400).json(ex);
        })
    },


	/**
     * Gets a single download
     * @param request
     * @param response
     */

    getDownload: (request, response) => {
        console.log("\nReceived GET for SINGLE Download");
        console.log("PROTOCOL: " + request.protocol + '://' + request.get('host') + request.originalUrl + "");

        console.log("get download: ", request.query);

        if(!!request.query.id) {
            sails.models.downloads.findOne({id: request.query.id}).then(result => {
                if (!!result) {
                    return response.status(200).json(result);
                } else {
                    return response.status(400).json("Unable to find download");
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
     * Updates an existing download
     * @param request
     * @param response
     */
    updateDownload: (request, response) => {
        console.log("\nReceived POST for UPDATE Download");
        console.log("PROTOCOL: " + request.protocol + '://' + request.get('host') + request.originalUrl + "");

        let original = {
            id: request.body.download.id
        };

        let changes = request.body.changes;

        sails.models.downloads.update(original, changes).then(result => {
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
     * Deletes an existing download
     * @param request
     * @param response
     */
    deleteDownload: (request, response) => {
        console.log("\nReceived POST for DELETE Download");
        console.log("PROTOCOL: " + request.protocol + '://' + request.get('host') + request.originalUrl + "");

        let download = {
            id: request.body.download.id
        };

        sails.models.downloads.findOne(download).then(_download =>{
            return deleteFile(_download.url);
        }).then(() =>{
            return sails.models.downloads.destroy(download);
        }).then(result => {
            response.status(200).json({})
        }).catch(ex => {
            console.log(ex);
            response.status(400).json(ex)
        })
    },

    /**
     * Get all downloads in an array
     * @param request
     * @param response
     */
    getDownloads: (request, response) => {
        console.log("Received GET for ALL Downloads");
        console.log("PROTOCOL: " + request.protocol + '://' + request.get('host') + request.originalUrl + "\n");

        sails.models.downloads.find(request.query).then(downloads => {
            response.status(200).json(downloads);
        }).catch(ex => {
            console.log(ex);
            response.status(400).json(ex);
        });
    },

    /**
     * Updates an existing download with user attendance
     * @param request
     * @param response
     */
    updateDownloadCount: (request, response) => {
        console.log("\nReceived POST for UPDATE Download Count");
        console.log("PROTOCOL: " + request.protocol + '://' + request.get('host') + request.originalUrl + "");

        let original = {
            id: request.body.download.id
        };

        let userid = request.body.user.id;

        sails.models.downloads.findOne(original).then(download => {
            let new_array = download.downloaded_by || [];
            var index = new_array.indexOf(userid);
            if (index == -1) { // If userid not found
                new_array.push(userid); // push userid to array
                download.downloaded_by = new_array;

                return sails.models.downloads.update(original, download)
            } else {
                return Promise.resolve([download]); //Return, it is correct as-is
            }
        }).then(result => {
            if(result.length > 0) {
                response.status(200).json(result[0]);
            } else {
                result.status(400).json("Unable to update");
            }
        }).catch(ex => {
            console.log(ex);
            response.status(400).json(ex);
        });

    },
};

function deleteFile(url) {
    return new Promise ((resolve, reject) => {
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
        let _url = url.replace('https://erinvale-fr.s3.eu-west-3.amazonaws.com/', '');
        //SHOULD BE: sp.png

        adapter.rm(_url, (err, res) => {
            if(err) {
              reject();
            } else {
              resolve();
            }
            // res is whatever S3 SDK returns (honestly no idea what's inside, have a look)
        })

    });
}
