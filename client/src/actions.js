import axios from "./axios.js";

export async function getLoggedInUser() {
    const { data } = await axios.get("/loggedInUser");
    return {
        type: "GET_LOGGED_IN_USER",
        userID: data,
    };
}

export async function getFriends() {
    try {
        const { data } = await axios.get("/contacts");
        return {
            type: "GET_CONTACTS",
            contacts: data,
        };
    } catch (err) {
        console.log("error in axios get(/loggedInUser): ", err);
    }
}

export async function acceptFriendRequest(reqData) {
    console.log("data: ", reqData);
    try {
        const { data } = await axios.post("/friendRequest", reqData);
        console.log("data: ", data);
        return {
            type: "ACCEPT_FRIEND_REQUEST",
            senderid: data[0].senderid,
            recipientid: data[0].recipientid,
            accepted: data[0].accepted,
        };
    } catch (err) {
        console.log("error in axios post(/accept friend request): ", err);
    }
}

export async function endFriendship(reqData) {
    try {
        console.log("reqData: ", reqData);
        const { data } = await axios.post("/friendRequest", reqData);
        console.log("data: ", data);
        return {
            type: "END_FRIENDSHIP",
            recipientid: reqData.recipientid,
        };
    } catch (err) {
        console.log("error in axios post(/end friendship): ", err);
    }
}

export async function newMessage(data) {
    return {
        type: "NEW_MESSAGE",
        message: data,
    };
}

export async function deleteMessage(messageId) {
    return {
        type: "DELETE_MESSAGE",
        messageId: messageId,
    };
}

export async function getChatMessages() {
    const { data } = await axios.get("/chatMessages");
    return {
        type: "CHAT_MESSAGES",
        messages: data,
    };
}

export async function makeHot(id) {
    const { data } = await axios.post(`/hot/${id}`);
    console.log("data: ", data);
    if (data.success) {
        return {
            type: "MAKE_HOT",
            characterId: id,
        };
    }
}

export async function makeNot(id) {
    const { data } = await axios.post(`/not/${id}`);
    console.log("data: ", data);
    if (data.success) {
        return {
            type: "MAKE_NOT",
            characterId: id,
        };
    }
}
