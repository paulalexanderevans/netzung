import { useState, useEffect } from "react";
import axios from "./axios";

export default function FriendRequestButton(props) {
    const [buttonText, setButtonText] = useState("");
    useEffect(() => {
        console.log("this.props in friendRequestButton: ", props);
        axios
            .get(`/relationship/${props.id}`)
            .then((response) => {
                if (response.data.length === 0) {
                    setButtonText("Make friend request");
                } else {
                    console.log("response.data[0]: ", response.data[0]);
                    if (!response.data[0].accepted) {
                        console.log("pending request");
                        if (props.id === response.data[0].recipientid) {
                            setButtonText("Cancel friend request");
                        } else if (props.id !== response.data[0].recipientid) {
                            setButtonText("Accept friend request");
                        }
                    }
                    if (response.data[0].accepted) {
                        setButtonText("End friendship");
                    }
                }
            })

            .catch((err) => {
                console.log("error in axios get(/relationship): ", err);
            });
    }, []);

    const handleClick = (e) => {
        e.preventDefault();
        const data = { buttonText: buttonText, recipientid: props.id };
        axios
            .post("/friendRequest", data)
            .then((res) => {
                console.log("res: ", res);
                if (res.data.length === 0) {
                    setButtonText("Make friend request");
                } else if (!res.data[0].accepted) {
                    setButtonText("Cancel friend request");
                } else if (res.data[0].accepted) {
                    setButtonText("End friendship");
                }
            })
            .catch((err) => {
                console.log(
                    "error in friendrequestbutton axios.post request: ",
                    err
                );
            });
    };
    return (
        <div>
            <>
                <button
                    className="friendRequestButton"
                    onClick={(e) => handleClick(e)}
                >
                    {buttonText}
                </button>
            </>
        </div>
    );
}
