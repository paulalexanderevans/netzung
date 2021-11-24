import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
    getLoggedInUser,
    getFriends,
    acceptFriendRequest,
    endFriendship,
} from "./actions";

export default function Friends() {
    const dispatch = useDispatch();

    const requests = useSelector(
        (state) =>
            state.contacts &&
            state.contacts.filter((user) => user.accepted == false)
    );
    const friends = useSelector(
        (state) =>
            state.contacts && state.contacts.filter((user) => user.accepted)
    );

    const contacts = useSelector((state) => state.contacts);

    useEffect(() => {
        dispatch(getLoggedInUser());
        dispatch(getFriends());
    }, []);

    const handleClick1 = (senderid) => {
        const data = {
            recipientid: senderid,
            buttonText: "Accept friend request",
        };
        dispatch(acceptFriendRequest(data));
    };

    const handleClick2 = (senderid) => {
        const data = {
            recipientid: senderid,
            buttonText: "End friendship",
        };
        dispatch(endFriendship(data));
    };

    return (
        <div className="friendsPage">
            {requests && (
                <div>
                    <h4 className="error">Requests ({requests.length})</h4>
                    <div className="friendsContainer">
                        {requests.map((user) => (
                            <div className="friends" key={user.id}>
                                <Link to={`/user/${user.id}`} className="name">
                                    {user.first} {user.last}
                                </Link>
                                <br />
                                <Link to={`/user/${user.id}`}>
                                    <img
                                        className={`smallprofilePic`}
                                        src={
                                            user.profilepicurl || "default.jpg"
                                        }
                                        alt={user.first}
                                    />
                                </Link>
                                <br />
                                <button
                                    className="friendRequestButton"
                                    onClick={() => handleClick1(user.id)}
                                >
                                    Accept friend request
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}
            {friends && (
                <div>
                    <h4 className="error">Friends ({friends.length})</h4>
                    <div className="friendsContainer">
                        {friends.map((user) => (
                            <div className="friends" key={user.id}>
                                <Link to={`/user/${user.id}`} className="name">
                                    {user.first} {user.last}
                                </Link>
                                <br />
                                <Link to={`/user/${user.id}`}>
                                    <img
                                        className={`smallprofilePic`}
                                        src={
                                            user.profilepicurl || "default.jpg"
                                        }
                                        alt={user.first}
                                        // onClick={(e) => props.toggleUploader(e)}
                                    />
                                </Link>
                                <br />
                                <button
                                    className="friendRequestButton"
                                    onClick={() => handleClick2(user.id)}
                                >
                                    End friendship
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
