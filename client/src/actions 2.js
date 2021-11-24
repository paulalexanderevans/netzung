import axios from "axios";

export async function receiveUsers() {
    const { data } = await axios.get("/users");
    return {
        type: "RECEIVE_USERS",
        users: data.users,
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
