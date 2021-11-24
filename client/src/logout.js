import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getChatMessages } from "./actions";
import { socket } from "./socket.js";
import { animateScroll } from "react-scroll";

export default function Chat(props) {
    const [inputVal, setInputVal] = useState();
    const [clear, setClear] = useState();
    const dispatch = useDispatch();
    const myRef = useRef();
    const handleChange = (e) => {
        setInputVal(e.target.value);
    };

    const deleteMessage = (e) => {
        console.log("someone clicked delete");
        console.log("message : ", e.target.id);
        socket.emit("delete", {
            messageId: e.target.id,
        });
    };

    const sendMessage = () => {
        console.log("someone clicked send message");
        console.log("inputVal: ", inputVal);
        socket.emit("chatMessage", {
            message: inputVal,
        });
        setInputVal("");
    };

    const messages = useSelector((state) => state.messages);

    useEffect(() => {
        dispatch(getChatMessages());
        myRef.current.scrollTop = myRef.current.scrollHeight;
    }, []);

    useEffect(() => {
        myRef.current.scrollTop = myRef.current.scrollHeight;
    }, [messages]);

    const userId = props.userId;

    return (
        <div className="chatPage" ref={myRef}>
            {messages && (
                <div>
                    {messages.map((message) => (
                        <div key={message.id} className="messageContainer">
                            <div className="chatInfo">
                                <Link
                                    to={`/user/${message.senderid}`}
                                    className="findPeopleLink"
                                >
                                    <img
                                        className={`chatProfilePic`}
                                        src={
                                            message.profilepicurl ||
                                            "default.jpg"
                                        }
                                        alt={message.first}
                                    />
                                </Link>
                                <Link
                                    to={`/user/${message.senderid}`}
                                    className="chatName"
                                >
                                    {message.first} {message.last}
                                </Link>{" "}
                                @ {message.timestamp}
                            </div>
                            <div className="message">
                                {message.message}
                                {props.userId === message.senderid && (
                                    <h4
                                        id={message.id}
                                        className="error"
                                        onClick={deleteMessage}
                                    >
                                        X
                                    </h4>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
            <textarea
                name="chatInput"
                className="chatInput"
                onChange={handleChange}
                value={inputVal}
            ></textarea>
            <br />
            <button onClick={sendMessage}>Send</button>
        </div>
    );
}
