const express = require("express");
const app = express();
const server = require("http").Server(app);
const io = require("socket.io")(server, {
    allowRequest: (req, callback) =>
        callback(null, req.headers.referer.startsWith("http://localhost:3000")),
});
const csurf = require("csurf");
const db = require("./db");
const cryptoRandomString = require("crypto-random-string");
const { uploader } = require("./uploader.js");
const s3 = require("./s3");

const sendEmailFunc = require("./ses.js");
let secrets;
if (process.env.sessionSecret) {
    secrets = process.env.sessionSecret;
} else secrets = require("./secrets").sessionSecret;
const cookieSession = require("cookie-session");
const cookieSessionMiddleware = cookieSession({
    maxAge: 1000 * 60 * 60 * 24 * 14,
    keys: ["key1", "key2"],
    secret: secrets,
});

app.use(cookieSessionMiddleware);
io.use(function (socket, next) {
    cookieSessionMiddleware(socket.request, socket.request.res, next);
});

app.use(csurf());

app.use(function (req, res, next) {
    res.cookie("mytoken", req.csrfToken());
    next();
});

const compression = require("compression");
const path = require("path");
const { hash, compare } = require("./bCrypt.js");
app.use(compression());
app.use(express.json());
app.use(express.static(path.join(__dirname, "..", "client", "public")));

app.get("/welcome", (req, res) => {
    console.log("req.session.userId: ", req.session.userId);
    if (req.session.userId) {
        res.redirect("/");
    } else {
        res.sendFile(path.join(__dirname, "..", "client", "index.html"));
    }
});

app.get("/app", (req, res) => {
    console.log("req.session.userId: ", req.session.userId);
    if (!req.session.userId) {
        res.redirect("/welcome");
    } else {
        res.redirect("/");
        // res.sendFile(path.join(__dirname, "..", "client", "index.html"));
    }
});

app.get("/logOut", (req, res) => {
    console.log("/logout fired");
    if (req.session.userId) {
        req.session.userId = null;
        console.log("req.session.userId: ", req.session.userId);
        res.redirect("/welcome");
    }
});

app.get("/user", async (req, res) => {
    console.log("app.get /user fired");
    console.log("req.session.userId: ", req.session.userId);
    try {
        let result = await db.getUser(req.session.userId);
        res.json(result.rows[0]);
    } catch (err) {
        console.log("error in getUser: ", err);
        res.json({
            error: true,
            errorMessage: "User not found.",
        });
    }
});

app.post("/registration", async (req, res) => {
    console.log("POST /registration fired");
    const { first, last, email, password } = req.body;
    try {
        const hashedPW = await hash(password);
        const results = await db.register(first, last, email, hashedPW);
        console.log("Netzung database, users table update successful");
        console.log("results.rows[0].id: ", results.rows[0].id);
        req.session.userId = results.rows[0].id;
        res.json({ success: true, error: false });
    } catch (err) {
        console.log("err in db.register:");
        if (
            err.message ===
            'duplicate key value violates unique constraint "users_email_key"'
        ) {
            //send back specific error message
            console.log("duplicate email address error");
            res.json({
                success: false,
                error: true,
                errorMessage:
                    "There is already an account associated with this email address, please log in or try again with a different email.",
            });
        }
    }
});

app.post("/login", (req, res) => {
    console.log("POST /login fired");
    db.getHashedPW(req.body.email)
        .then((results) => {
            const hashFromDatabase = results.rows[0].password;
            compare(req.body.password, hashFromDatabase).then((match) => {
                if (match) {
                    console.log("it's a match");
                    console.log("userId: ", results.rows[0].id);
                    req.session.userId = results.rows[0].id;
                    res.json({
                        success: true,
                        error: false,
                    });
                } else {
                    console.log("Incorrect password");
                    res.json({
                        success: false,
                        error: true,
                        errorMessage:
                            "Incorrect password, please try again or click the link below to reset your password.",
                    });
                }
            });
        })
        .catch((err) => {
            console.log("err in getHashedPW: ", err);
            res.json({
                success: false,
                error: true,
                errorMessage:
                    "There is no account associated with this email address, please try again or click below to register.",
            });
        });
});

app.post("/resetpassword/start", async (req, res) => {
    console.log("app.post/resetpassword/start fired");
    try {
        const results = await db.getEmail(req.body.email);
        if (req.body.email === results.rows[0].email) {
            try {
                console.log("User has account");
                const secretCode = cryptoRandomString({
                    length: 6,
                });
                console.log("secretCode: ", secretCode);
                console.log("req.body.email: ", req.body.email);
                const results = await db.storeReset_codes(
                    req.body.email,
                    secretCode
                );
                console.log(
                    "Netzung database, reset_codes table update successful"
                );
                const emailResults = await sendEmailFunc.sendEmail(
                    results.rows[0].email,
                    results.rows[0].code,
                    "Reset your Netzung Password"
                );
                console.log("results from sendEmail: ", emailResults);
                if (emailResults.error) {
                    res.json(emailResults);
                } else {
                    res.json({
                        success: true,
                        error: false,
                        renderView: 2,
                    });
                }
            } catch (err) {
                console.log("err in db.sendEmail:");
            }
        } else {
            console.log("email not in database");
            res.json({
                success: false,
                error: true,
                errorMessage:
                    "There is no account associated with this email address, please try again or click below to register.",
            });
        }
    } catch (err) {
        console.log("err in db.getEmail:");
        res.json({
            success: false,
            error: true,
            errorMessage:
                "There is no account associated with this email address, please try again or click below to register.",
        });
    }
});

app.post("/resetpassword/verify", async (req, res) => {
    console.log("app.post/resetpassword/verify fired");
    try {
        const codes = await db.getValidCodes();
        console.log("Netzung database, reset_codes table request successful");
        var j = 0;
        for (var i = 0; i < codes.rows.length; i++) {
            if (codes.rows[i].code === req.body.code) {
                console.log("it's a match!");
                console.log(codes.rows[i]);
                try {
                    console.log("try resetPassword");
                    const hashedPW = await hash(req.body.password);
                    const results = await db.resetPassword(
                        codes.rows[i].email,
                        hashedPW
                    );
                    console.log("resetPassword results.rows: ", results.rows);
                    req.session.userId = results.rows[0].id;
                    res.json({
                        success: true,
                        error: false,
                        renderView: 3,
                    });
                } catch (err) {
                    console.log("err in db.resetPassword: ", err);
                }
            } else {
                console.log("no match!");
                j++;
                console.log("j: ", j);
                if (j === codes.rows.length) {
                    res.json({
                        success: false,
                        error: true,
                        errorMessage: "Code invalid or expired",
                    });
                }
            }
        }
    } catch (err) {
        console.log("err in db.getValidCodes: ", err);
        res.json({
            success: false,
            error: true,
            errorMessage: "Code invalid or expired",
        });
    }
});

app.post("/bio", async (req, res) => {
    console.log("app.post /bio fired");
    console.log("bioText: ", req.body.bioText);
    console.log("req.session.userId: ", req.session.userId);
    db.updateBio(req.body.bioText, req.session.userId)
        .then((results) => {
            res.json(results.rows[0]);
        })
        .catch((err) => console.log("err in profile update: ", err));
});

app.post("/profilePic", uploader.single("file"), s3.upload, (req, res) => {
    console.log("app.post /profilePic fired");
    let fullURL =
        "https://radfarimagebucket.s3.amazonaws.com/" + req.file.filename;
    db.updateProfilePic(fullURL, req.session.userId)
        .then((results) => {
            res.json(results.rows[0]);
        })
        .catch((err) => console.log("err in profile update: ", err));
});

app.get("/loggedInUser", function (req, res) {
    console.log("get /loggedInUser fired");
    res.json(req.session.userId);
});

app.get("/userInfo/:userId", async (req, res) => {
    console.log("app.get /userInfo fired");
    console.log("req: ", req.params);
    try {
        let result = await db.getUser(req.params.userId);
        res.json(result.rows[0]);
    } catch (err) {
        console.log("error in getUser: ", err);
        res.json({
            error: true,
            errorMessage: "User not found.",
        });
    }
});

app.get("/recentlyJoined", async (req, res) => {
    console.log("app.get /recentlyJoined fired");
    try {
        let result = await db.getRecentlyJoined();
        res.json(result.rows);
    } catch (err) {
        console.log("error in getRecentlyJoined: ", err);
        res.json({
            error: true,
            errorMessage: "User not found.",
        });
    }
});

app.get("/findPeople/:inputval", async (req, res) => {
    console.log("app.get /findPeople fired");
    console.log("req: ", req.params.inputval);
    // if (req.params.inputval)
    try {
        let result = await db.findPeople(req.params.inputval);
        console.log("result.rows: ", result.rows);
        res.json(result.rows);
    } catch (err) {
        console.log("error in findPeople: ", err);
        res.json({
            error: true,
            errorMessage: "User not found.",
        });
    }
});

app.get("/relationship/:profileId", async (req, res) => {
    console.log("app.get /relationship fired");
    console.log("req in relationship: ", req.params.profileId);
    console.log("req.session.userId: ", req.session.userId);
    try {
        let result = await db.checkRelationship(
            req.params.profileId,
            req.session.userId
        );
        res.json(result.rows);
    } catch (err) {
        console.log("error in checkRelationship: ", err);
        res.json({
            error: true,
            errorMessage: "User not found.",
        });
    }
});

app.post("/friendRequest", async (req, res) => {
    console.log("app.post /friendRequest");
    console.log("req.body: ", req.body);
    console.log("req.session.userId: ", req.session.userId);
    //make friend request
    if (req.body.buttonText === "Make friend request") {
        console.log("Make friend request");
        try {
            const results = await db.MakeFriendRequest(
                req.session.userId,
                req.body.recipientid
            );
            console.log("results from db.MakeFriendRequest: ", results.rows);
            res.json(results.rows);
        } catch (err) {
            console.log("db.MakeFriendRequest: ", err);
        }
    }
    //cancel friend request
    if (req.body.buttonText === ("Cancel friend request" || "End friendship")) {
        console.log("Cancel friend request");
        try {
            const results = await db.deleteFriendRequest(
                req.session.userId,
                req.body.recipientid
            );
            console.log("results from db.deleteFriendRequest: ", results.rows);
            res.json(results.rows);
        } catch (err) {
            console.log("db.MakeFriendRequest: ", err);
        }
    }
    //end friendship
    if (req.body.buttonText === "End friendship") {
        console.log("Cancel friend request");
        try {
            const results = await db.deleteFriendRequest(
                req.session.userId,
                req.body.recipientid
            );
            console.log("results from db.deleteFriendRequest: ", results.rows);
            res.json(results.rows);
        } catch (err) {
            console.log("db.MakeFriendRequest: ", err);
        }
    }

    //accept friend request
    if (req.body.buttonText === "Accept friend request") {
        console.log("Accept friend request");
        try {
            const results = await db.acceptFriendRequest(
                req.session.userId,
                req.body.recipientid
            );
            console.log("results from db.acceptFriendRequest: ", results.rows);
            res.json(results.rows);
        } catch (err) {
            console.log("db.MakeFriendRequest: ", err);
        }
    }
});

app.get("/contacts", async (req, res) => {
    try {
        let result = await db.getFriends(req.session.userId);
        res.json(result.rows);
    } catch (err) {
        console.log("error in get friends: ", err);
        res.json({
            error: true,
            errorMessage: "User not found.",
        });
    }
});

app.get("/chatMessages", async (req, res) => {
    try {
        let result = await db.getChatMessages();
        const reverse = result.rows.reverse();
        res.json(reverse);
    } catch (err) {
        console.log("error in get chatMessages: ", err);
        res.json({
            error: true,
            errorMessage: "Messages not found, please try again.",
        });
    }
});

app.post("/chatMessage", async (req, res) => {});

app.get("*", function (req, res) {
    if (!req.session.userId) {
        res.redirect("/welcome");
    } else {
        res.sendFile(path.join(__dirname, "..", "client", "index.html"));
    }
});

server.listen(process.env.PORT || 3001, function () {
    console.log("Netzung server listening...");
});

io.on("connection", (socket) => {
    console.log(`Socket id: ${socket.id} has connected`);
    const userId = socket.request.session.userId;
    if (!userId) {
        return socket.disconect(true);
    }
    socket.on("chatMessage", async (text) => {
        console.log("ping");
        try {
            let results = await db.postChatMessage(userId, text.message);
            let senderInfo = await db.getUser(userId);
            let payload = {
                id: results.rows[0].id,
                first: senderInfo.rows[0].first,
                last: senderInfo.rows[0].last,
                profilepicurl: senderInfo.rows[0].profilepicurl,
                senderid: userId,
                timestamp: results.rows[0].timestamp,
                message: results.rows[0].message,
            };
            io.emit("newMessage", payload);
        } catch (err) {
            console.log("err in messages table: ", err);
        }
    });
    socket.on("delete", async (messageId) => {
        console.log("socket delete fired");
        console.log("messageId: ", messageId.messageId);
        try {
            let results = await db.deleteChatMessage(messageId.messageId);
            console.log("results: ", results.rows);
            io.emit("deleteMessage", messageId.messageId);
        } catch (err) {
            console.log("err in messages table: ", err);
        }
    });
    socket.on("disconnect", () => {
        console.log(`Socket with id: ${socket.id} just disconected`);
    });
});
