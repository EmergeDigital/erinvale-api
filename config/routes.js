/**
 * Route Mappings
 * (sails.config.routes)
 *
 * Your routes map URLs to views and controllers.
 *
 * If Sails receives a URL that doesn't match any of the routes below,
 * it will check for matching files (images, scripts, stylesheets, etc.)
 * in your assets directory.  e.g. `http://localhost:1337/images/foo.jpg`
 * might match an image file: `/assets/images/foo.jpg`
 *
 * Finally, if those don't match either, the default 404 handler is triggered.
 * See `api/responses/notFound.js` to adjust your app's 404 logic.
 *
 * Note: Sails doesn't ACTUALLY serve stuff from `assets`-- the default Gruntfile in Sails copies
 * flat files from `assets` to `.tmp/public`.  This allows you to do things like compile LESS or
 * CoffeeScript for the front-end.
 *
 * For more information on configuring custom routes, check out:
 * http://sailsjs.org/#!/documentation/concepts/Routes/RouteTargetSyntax.html
 */

module.exports.routes = {

  /***************************************************************************
  *                                                                          *
  * Make the view located at `views/homepage.ejs` (or `views/homepage.jade`, *
  * etc. depending on your default view engine) your home page.              *
  *                                                                          *
  * (Alternatively, remove this and add an `index.html` file in your         *
  * `assets` directory)                                                      *
  *                                                                          *
  ***************************************************************************/

  '/': {
    view: 'homepage'
  },

  //USERS
  'post /v1/users/create' : 'UsersController.createUser',
  'get /v1/users/get' : 'UsersController.getUser',
  'get /v1/users/login' : 'UsersController.loginUser',
  'post /v1/users/update' : 'UsersController.updateUser',
  'post /v1/users/delete' : 'UsersController.deleteUser',
  'get /v1/users/get_all' : 'UsersController.getUsers',
  'post /v1/users/change_email' : 'UsersController.changeEmail',
  'post /v1/users/change_password' : 'UsersController.changePassword',
  'get /v1/users/reset_password_link' : 'UsersController.resetPasswordLink',
  'get /v1/users/reset_password' : 'UsersController.resetPassword',
  'get /v1/users/dashboard' : 'UsersController.getDashboardContent',

  //POSTS
  'post /v1/posts/create' : 'PostsController.createPost',
  'get /v1/posts/get' : 'PostsController.getPost',
  'post /v1/posts/update' : 'PostsController.updatePost',
  'post /v1/posts/delete' : 'PostsController.deletePost',
  'get /v1/posts/get_all' : 'PostsController.getPosts',
  'get /v1/posts/get_news' : 'PostsController.getNews',

  //EVENTS
  'post /v1/events/create' : 'EventsController.createEvent',
  'get /v1/events/get' : 'EventsController.getEvent',
  'post /v1/events/update' : 'EventsController.updateEvent',
  'post /v1/events/delete' : 'EventsController.deleteEvent',
  'get /v1/events/get_all' : 'EventsController.getEvents',
  'post /v1/events/attend' : 'EventsController.updateAttendance',

  //DOWNLOADS
  'post /v1/downloads/create' : 'DownloadsController.createDownload',
  'get /v1/downloads/get' : 'DownloadsController.getDownload',
  'post /v1/downloads/update' : 'DownloadsController.updateDownload',
  'post /v1/downloads/delete' : 'DownloadsController.deleteDownload',
  'get /v1/downloads/get_all' : 'DownloadsController.getDownloads',
  'post /v1/downloads/count' : 'DownloadsController.updateDownloadCount',

  //FUNCTIONS
  'get /v1/functions/sign' : 'FunctionsController.sign',
  'get /v1/functions/signAll' : 'FunctionsController.signAll',
  'post /v1/functions/uploadFile' : 'FunctionsController.uploadFile',
  'post /v1/functions/deleteFile' : 'FunctionsController.deleteFile'

  /***************************************************************************
  *                                                                          *
  * Custom routes here...                                                    *
  *                                                                          *
  * If a request to a URL doesn't match any of the custom routes above, it   *
  * is matched against Sails route blueprints. See `config/blueprints.js`    *
  * for configuration options and examples.                                  *
  *                                                                          *
  ***************************************************************************/

};
