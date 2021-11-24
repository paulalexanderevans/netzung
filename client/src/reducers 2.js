export default function (state = {}, action) {
    if (action.type == "RECEIVE_USERS") {
        state = {
            ...state,
            users: action.users,
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
    if (action.type === "MAKE_NOT") {
        state = {
            ...state,
            users: state.users.map((user) => {
                if (user.id === action.characterId) {
                    return {
                        ...user,
                        hot: false,
                    };
                } else {
                    return user;
                }
            }),
        };
    }

    return state;
}
