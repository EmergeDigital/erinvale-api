/**
 * Production environment settings
 *
 * This file can include shared settings for a production environment,
 * such as API keys or remote database passwords.  If you're using
 * a version control solution for your Sails app, this file will
 * be committed to your repository unless you add it to your .gitignore
 * file.  If your repository will be publicly viewable, don't add
 * any private information to this file!
 *
 */

module.exports = {

  // ssl: {
  //   key: require('fs').readFileSync('/etc/letsencrypt/live/erinvale.emergenow.co.za/privkey.pem'),
  //   cert: require('fs').readFileSync('/etc/letsencrypt/live/erinvale.emergenow.co.za/fullchain.pem'),
  //   // ca: require('fs').readFileSync('/etc/letsencrypt/live/api.scanplan.co.za/chain.pem')
  // },

  /***************************************************************************
   * Set the port in the production environment to 80                        *
   ***************************************************************************/

  port: 8443,

  host: 'localhost'
};
