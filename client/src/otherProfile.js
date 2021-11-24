import { Component } from "react";
import axios from "./axios";
import FriendRequestButton from "./friendRequestButton.js";

export default class OtherProfile extends Component {
    constructor(props) {
        super(props);
        this.state = {};
    }

    componentDidMount() {
        axios
            .get("/loggedInUser")
            .then((response) => {
                if (this.props.match.params.id == response.data) {
                    this.props.history.push("/");
                }
            })

            .catch((err) => {
                console.log("error in axios get(/loggedInUser): ", err);
            });
        axios
            .get(`/userInfo/${this.props.match.params.id}`)
            .then((res) => {
                this.setState(res.data, () => {
                    // console.log("this.state in otherProfile: ", this.state);
                });
            })
            .catch((err) => {
                console.log("error in axios get(/userInfo): ", err);
                this.setState({
                    error: true,
                    errorMessage: "User not found.",
                });
            });
    }

    render() {
        return (
            <div className="mainContainer">
                <div className="profileContainer">
                    <h2>
                        {this.state.first} {this.state.last}
                    </h2>
                    {this.state.error && (
                        <h4 className="error">{this.state.errorMessage}</h4>
                    )}
                    <img
                        className="mediumprofilePic"
                        src={this.state.profilepicurl || "/default.jpg"}
                        alt={this.state.first}
                    />
                </div>
                <FriendRequestButton id={this.props.match.params.id} />
                {this.state.bio && (
                    <div className="bio">
                        <p>{this.state.bio}</p>
                    </div>
                )}
            </div>
        );
    }
}
