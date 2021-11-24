import { getChatMessages, newMessage, deleteMessage } from "./actions";
import { io } from "socket.io-client";

export let socket;

export const init = (store) => {
    if (!socket) {
        socket = io.connect();

        socket.on("chatMessages", (msgs) =>
            store.dispatch(getChatMessages(msgs))
        );

        socket.on("newMessage", async (text) => {
            store.dispatch(newMessage(text));
        });

        socket.on("deleteMessage", async (messageId) => {
            store.dispatch(deleteMessage(messageId));
        });
    }
};
