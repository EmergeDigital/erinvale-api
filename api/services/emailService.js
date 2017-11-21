

/*======================================================================*/

var path = require('path');
let rek = require('rekuire');
var mailcomposer = require('mailcomposer');
// var mailgun = require('mailgun-js');
var EmailTemplates = require('swig-email-templates');
var templates = new EmailTemplates({
  root: path.join(__dirname, "../../templates")
});

var secrets = rek("secrets.js");

var mailgun = require('mailgun-js')({ apiKey: secrets.mailgun.apiKey, domain: secrets.mailgun.baseURL });


/*======================================================================*/



// api/services/emailService.js
module.exports = {

  //Render the html
  renderEmailAsync: function (template, options){
    return new Promise ((resolve, reject) => {
      let _options = typeof options  !== 'undefined' ? options : {};
      // console.log(_options);
      templates.render(template, _options, function(err, html, text) {
        if(err) {
          reject(err);
        }
        // console.log(html);
        resolve(html, text);
      });
    });
  },

  //Create and send email with rendered html
  createMail: function (html, text, email, subject, attachment) {
    return new Promise ((resolve, reject) => {
      let mailOptions = {
          from: secrets.mailgun.support_address, // sender address
          replyTo: secrets.mailgun.support_address, //Reply to address
          to: email, // list of receivers
          subject: subject, // Subject line
          html: html, // html body
          text: text, //Text equivalent
          attachment: attachment
      };

      sendMail(mailOptions).then(() => {
        resolve();
      });
    });
  },

  //Validates an email address
  validateEmail: function(email) {
    return validateEmail(email);
  },



};

//Send an email after it has been rendered
function sendMail (mailOptions) {
  return new Promise ((resolve, reject) => {
    if(mailOptions.to) {
      let emails = mailOptions.to.split(', ');
      // let flag = false;
      let flags = [];
      for(let email of emails) {
        let flag = validateEmail(email);
        flags.push(flag);
      }
      if(!flags.includes(false)){
          var data = {
            from: mailOptions.from,
            to: mailOptions.to,
            replyTo: mailOptions.replyTo,
            subject: mailOptions.subject,
            html: mailOptions.html,
            text: mailOptions.text,
            attachment: mailOptions.attachment
          };

          mailgun.messages().send(data, function (error, body) {
            if(error){
              console.log(error);
              reject(error);
            } else {
              console.log("Message sent to Mailgun: " + body.message);
              resolve();
            }
          });
      } else {
        var err = "Invalid email address: " + mailOptions.to;
        console.log("Message blocked. " + err);
        reject(err);
      }
    } else {
      var err = "No email address";
      console.log("Message blocked. " + err);
      reject(err);
    }
  });
}

function validateEmail(email) {
  var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(email);
}
