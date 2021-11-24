export default function ProfilePic(props) {
    return (
        <div>
            <img
                className={`${props.size}profilePic`}
                src={props.profilePicUrl || "default.jpg"}
                alt={props.first}
                onClick={(e) => props.toggleUploader(e)}
            />
        </div>
    );
}
