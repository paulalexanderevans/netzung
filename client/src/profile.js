import BioEditor from "./bio_editor.js";

export default function Profile(props) {
    console.log("props in profile: ", props);
    return (
        <div className="chatPage">
            <div className="profileContainer">
                <h2>
                    {props.first} {props.last}
                </h2>
                <img
                    className={`${props.size}profilePic`}
                    src={props.profilePicUrl || "default.jpg"}
                    alt={props.first}
                    onClick={(e) => props.toggleUploader(e)}
                />
            </div>
            <BioEditor bio={props.bio} setBio={props.setBio} />
        </div>
    );
}
