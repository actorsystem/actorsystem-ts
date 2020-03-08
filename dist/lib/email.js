"use strict";
// import emails directory
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
require('dotenv').config();
const requireAll = require("require-all");
const AWS = require("aws-sdk");
AWS.config.update({ region: "us-east-1" });
const path_1 = require("path");
const emails = Object.entries(requireAll(path_1.join(process.cwd(), 'emails')))
    .map(([key, value]) => {
    let e = value;
    return [key, e.index.default];
})
    .reduce((acc, item) => {
    acc[item[0]] = item[1];
    return acc;
}, {});
console.log(emails);
function sendEmail(templateName, emailAddress, personName) {
    return __awaiter(this, void 0, void 0, function* () {
        let template = emails[templateName];
        console.log("TEMPLATE", template);
        // Create sendEmail params
        var params = {
            Destination: {
                ToAddresses: [
                    emailAddress
                ]
            },
            Message: {
                Body: {
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
            Source: 'blaze@anypayinc.com',
            ReplyToAddresses: [
                'steven@anypayinc.com',
            ],
        };
        // Create the promise and SES service object
        var sendPromise = new AWS.SES({ apiVersion: '2010-12-01' }).sendEmail(params).promise();
        // Handle promise's fulfilled/rejected states
        return sendPromise;
    });
}
exports.sendEmail = sendEmail;
//# sourceMappingURL=email.js.map