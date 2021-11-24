import { Component } from "react";
import axios from "./axios";

export default class Uploader extends Component {
    constructor(props) {
        super(props);
        this.state = {
            file: null,
            message: false,
        };
        this.submit = this.submit.bind(this);
    }

    fileSelectHandler(e) {
        this.file = e.target.files[0];
    }
    submit(e) {
        e.preventDefault();
        const fd = new FormData();
        fd.append("file", this.file);
        fd.append("userId", this.props.userId);
        this.setState({ displayMessage: "Updating profile Picture..." });
        this.setState({ message: true });
        axios
            .post("/profilePic", fd)
            .then((response) => {
                console.log(
                    "response in uploade.js: ",
                    response.data.profilepicurl
                );
                this.setState({
                    displayMessage: "Profile picture updated",
                });
                this.setState({ message: true, error: true });
                console.log("this.props in uploader: ", this.props);
                this.props.setProfilePicUrl(response.data.profilepicurl);
                // this.setProfilePicURL(response.data.profilepicurl);
            })
            .catch((err) => {
                console.log("error in axios post profilePic: ", err);
                this.setState({
                    message: false,
                    success: false,
                    error: true,
                    errorMessage:
                        "Error updating profile picture, please try again",
                });
            });
    }
    render() {
        return (
            <div className="uploader">
                {/* <input ***change handler*** type="file" />  */}

                <h5>Update your Netzung profile picture</h5>
                {this.state.error && (
                    <h4 className="error">{this.state.errorMessage}</h4>
                )}
                {!this.state.message && (
                    <h4>
                        <form>
                            <input
                                onChange={(e) => this.fileSelectHandler(e)}
                                type="file"
                                name="file"
                                accept="image/*"
                            />
                            <button onClick={(e) => this.submit(e)}>
                                Submit
                            </button>
                        </form>
                    </h4>
                )}

                {this.state.message && (
                    <h4 className="error">{this.state.displayMessage}</h4>
                )}
            </div>
        );
    }
}
