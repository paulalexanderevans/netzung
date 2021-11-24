import React from "react";
import axios from "./axios";

export default class BioEditor extends React.Component {
    constructor() {
        super();
        this.state = {
            editMode: false,
        };
    }

    toggleBioEditor(e) {
        e.preventDefault();
        this.setState({ editMode: true });
    }
    handleChange(e) {
        this.setState(
            {
                [e.target.name]: e.target.value,
            },
            () => {
                console.log("this.state: ", this.state);
            }
        );
    }

    saveBio(e) {
        e.preventDefault();
        this.setState({
            editMode: false,
            displayMessage: "Updating Bio...",
            message: true,
        });
        axios
            .post("/bio", this.state)
            .then((response) => {
                this.setState({
                    displayMessage: "Bio updated",
                });
                this.setState({ message: true, error: true });
                this.props.setBio(response.data.bio);
            })
            .catch((err) => {
                this.setState({
                    message: false,
                    success: false,
                    error: true,
                    errorMessage: "Error updating Bio, please try again",
                });
            });
    }

    render() {
        if (this.state.editMode) {
            return (
                <div className="bio">
                    <div className="editMode">
                        <h4 className="error">Edit Bio</h4>
                        <textarea
                            name="bioText"
                            onChange={(e) => this.handleChange(e)}
                            defaultValue={this.props.bio}
                        ></textarea>
                        <br />
                        <button onClick={(e) => this.saveBio(e)}>
                            Save Bio
                        </button>
                    </div>
                </div>
            );
        }

        if (!this.props.bio) {
            return (
                <div className="bio">
                    {this.state.message && (
                        <h4 className="error">{this.state.displayMessage}</h4>
                    )}
                    <p>{this.props.bio}</p>
                    <button onClick={(e) => this.toggleBioEditor(e)}>
                        Add Bio
                    </button>
                </div>
            );
        }

        if (this.props.bio) {
            return (
                <div className="bio">
                    {this.state.message && (
                        <h4 className="error">{this.state.displayMessage}</h4>
                    )}
                    <p>{this.props.bio}</p>
                    <button onClick={(e) => this.toggleBioEditor(e)}>
                        Edit Bio
                    </button>
                </div>
            );
        }
    }
}
