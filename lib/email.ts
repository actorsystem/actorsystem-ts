
// import emails directory

require('dotenv').config()
import * as requireAll from  'require-all';
import * as AWS from 'aws-sdk';
AWS.config.update({ region: "us-east-1" });
import { join } from 'path';

const emails = Object.entries(requireAll(join(process.cwd(), 'emails')))
  .map(([key, value]) => {
    let e: any = value;
    return [key, e.index.default];
  })
  .reduce((acc, item: any) => {

    acc[item[0]] = item[1];

    return acc;
  }, {});

console.log(emails);

export async function sendEmail(templateName, emailAddress, personName) {
  let template = emails[templateName];

  console.log("TEMPLATE", template);

  // Create sendEmail params
  var params = {
    Destination: { /* required */
      ToAddresses: [
        emailAddress
      ]
    },
    Message: { /* required */
      Body: { /* required */
        Html: {
         Charset: "UTF-8",
         Data: template.body.toString()
        },
        Text: {
         Charset: "UTF-8",
         Data: template.body.toString()
        }
       },
       Subject: {
        Charset: 'UTF-8',
        Data: template.title
       }
      },
    Source: 'blaze@anypayinc.com', /* required */
    ReplyToAddresses: [
       'steven@anypayinc.com',
      /* more items */
    ],
  };

  // Create the promise and SES service object
  var sendPromise = new AWS.SES({apiVersion: '2010-12-01'}).sendEmail(params).promise();

  // Handle promise's fulfilled/rejected states
  return sendPromise

}



