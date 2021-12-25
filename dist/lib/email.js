"use strict";
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
exports.sendEmail = exports.send = void 0;
require('dotenv').config();
const requireAll = require("require-all");
const AWS = require("aws-sdk");
AWS.config.update({ region: "us-east-1" });
const path_1 = require("path");
const fs_1 = require("fs");
const emailsDirectory = (0, path_1.join)(process.cwd(), 'emails');
const emails = (0, fs_1.existsSync)(emailsDirectory) ? Object.entries(requireAll(emailsDirectory)).map(([key, value]) => {
    let e = value;
    return [key, e.index.default];
})
    .reduce((acc, item) => {
    acc[item[0]] = item[1];
    return acc;
}, {}) : {};
function send(params) {
    return __awaiter(this, void 0, void 0, function* () {
        let email = emails[params.templateName];
        // Create sendEmail params
        var sesParams = {
            Destination: {
                ToAddresses: params.to,
                CcAddresses: params.cc,
                BccAddresses: params.bcc
            },
            Message: {
                Body: {
                    Html: {
                        Charset: "UTF-8",
                        Data: email.template(params.vars)
                    },
                    Text: {
                        Charset: "UTF-8",
                        Data: email.template(params.vars)
                    }
                },
                Subject: {
                    Charset: 'UTF-8',
                    Data: params.subject || email.title
                }
            },
            Source: params.from,
            ReplyToAddresses: params.replyTo
        };
        // Create the promise and SES service object
        var sendPromise = new AWS.SES({ apiVersion: '2010-12-01' }).sendEmail(sesParams).promise();
        // Handle promise's fulfilled/rejected states
        return sendPromise;
    });
}
exports.send = send;
function sendEmail(templateName, emailAddress, fromEmail, vars = {}) {
    return __awaiter(this, void 0, void 0, function* () {
        let email = emails[templateName];
        if (!vars.emailAddress) {
            vars.emailAddress = emailAddress;
        }
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
                        Data: email.template(vars)
                    },
                    Text: {
                        Charset: "UTF-8",
                        Data: email.template(vars)
                    }
                },
                Subject: {
                    Charset: 'UTF-8',
                    Data: email.title
                }
            },
            Source: fromEmail,
            ReplyToAddresses: [
                'steven@anypayinc.com',
                /* more items */
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