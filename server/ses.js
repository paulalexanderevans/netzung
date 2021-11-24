const aws = require("aws-sdk");

let secrets;
if (process.env.NODE_ENV == "production") {
    secrets = process.env; // in prod the secrets are environment variables
} else {
    secrets = require("./secrets"); // in dev they are in secrets.json which is listed in .gitignore
}

const ses = new aws.SES({
    accessKeyId: secrets.AWS_KEY,
    secretAccessKey: secrets.AWS_SECRET,
    region: "eu-central-1",
});

exports.sendEmail = function (recipient, message, subject) {
    console.log("sendEmail recipient: ", recipient);
    console.log("sendEmail message: ", message);
    console.log("sendEmail subject: ", subject);
    return ses
        .sendEmail({
            Source: "Netzung<paulalexanderevans@live.com>",
            Destination: {
                ToAddresses: [recipient],
            },
            Message: {
                Body: {
                    Text: {
                        Data: message,
                    },
                },
                Subject: {
                    Data: subject,
                },
            },
        })
        .promise()
        .then(() => {
            console.log("it worked!");
            return {
                success: true,
            };
        })

        .catch((err) => {
            console.log("error in sendEmail: ", err.code);
            if (err.code === "MessageRejected") {
                console.log("message rejected");
                return {
                    success: false,
                    error: true,
                    errorMessage: "Message Rejected",
                };
            }
        });
};
