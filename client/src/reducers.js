export default function Reducer(state = {}, action) {
    if (action.type == "CHAT_MESSAGES") {
        state = {
            ...state,
            messages: action.messages,
        };
    }

    if (action.type == "NEW_MESSAGE") {
        state = {
            ...state,
            messages: state.messages.concat(action.message),
        };
    }

    if (action.type === "DELETE_MESSAGE") {
        state = {
            ...state,
            messages: state.messages.filter(
                (message) => message.id != action.messageId
            ),
        };
        console.log("state.messages: ", state.messages);
    }

    if (action.type == "GET_CONTACTS") {
        state = {
            ...state,
            contacts: action.contacts,
        };
    }

    if (action.type === "ACCEPT_FRIEND_REQUEST") {
        state = {
            ...state,
            contacts: state.contacts.map((user) => {
                if (user.id === action.senderid) {
                    return {
                        ...user,
                        accepted: true,
                    };
                } else {
                    return user;
                }
            }),
        };
    }

    if (action.type === "END_FRIENDSHIP") {
        state = {
            ...state,
            contacts: state.contacts.filter(
                (user) => user.id !== action.recipientid
            ),
        };
    }

    if (action.type === "MAKE_HOT") {
        state = {
            ...state,
            users: state.users.map((user) => {
                if (user.id === action.characterId) {
                    return {
                        ...user,
                        hot: true,
                    };
                } else {
                    return user;
                }
            }),
        };
    }
    if (action.type === "GET_LOGGED_IN_USER") {
        state = {
            ...state,
            user: action.userID,
        };
    }

    return state;
}
