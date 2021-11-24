//src/resetPassword.js
import React from "react";
import axios from "./axios";
import { Link } from "react-router-dom";

export default class ResetPassword extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            renderView: 1,
        };
    }

    handleChange(e) {
        console.log("handleChange is firing");
        console.log("handleChange e.target.value: ", e.target.value);
        console.log("handleChange e.target.name: ", e.target.name);
        this.setState(
            {
                [e.target.name]: e.target.value,
            },
            () => {
                console.log("this.state: ", this.state);
            }
        );
    }

    handleClickRV1(e) {
        e.preventDefault();
        console.log("handleClickRV1 fired");
        const ts = this.state;
        console.log("ts: ", ts);
        // fd.reset();
        axios
            .post("/resetpassword/start", ts)
            .then((res) => {
                console.log("response from server: ", res);
                this.setState(res.data, () => {
                    console.log("this.state: ", this.state);
                });
                if (this.state.error) {
                    console.log("this.error = true");
                }
            })
            .catch((err) => {
                console.log(
                    "error in resetpassword/start axios.post request: ",
                    err
                );
            });
    }

    handleClickRV2(e) {
        e.preventDefault();
        console.log("handleClickRV2 fired");
        const ts = this.state;
        console.log("ts: ", ts);
        axios
            .post("/resetpassword/verify", ts)
            .then((res) => {
                console.log("response from server: ", res);
                this.setState(res.data, () => {
                    console.log("this.state: ", this.state);
                });
                if (this.state.error) {
                    console.log("this.error = true");
                }
            })
            .catch((err) => {
                console.log(
                    "error in resetpassword/verify axios.post request: ",
                    err
                );
            });
    }

    determineWhichViewToRender() {
        console.log("renderView: ", this.state.renderView);
        if (this.state.renderView === 1) {
            return (
                <div className="registrationContainer">
                    {!this.state.error && (
                        <h4>
                            Enter your email address and press send to receive a
                            verication code and reset your password
                        </h4>
                    )}
                    {this.state.error && (
                        <h4 className="error">{this.state.errorMessage}</h4>
                    )}
                    <input
                        name="email"
                        onChange={(e) => this.handleChange(e)}
                        type="text"
                        placeholder="email"
                        key="1"
                    ></input>
                    <br />
                    <button onClick={(e) => this.handleClickRV1(e)}>
                        Send
                    </button>
                    <br />
                    <Link to="/">
                        Don't yet have a Netzung account? Click here to register
                    </Link>
                </div>
            );
        } else if (this.state.renderView === 2) {
            return (
                <div className="registrationContainer">
                    {!this.state.error && (
                        <div>
                            <h3>Reset code sent</h3>
                            <h3 className="error">
                                Note: reset code only valid for 10 mins
                            </h3>

                            <h4>
                                Please check your email, type the code you
                                received into the input field along with a new
                                password then click the button to set a new
                                password.
                            </h4>
                        </div>
                    )}
                    {this.state.error && (
                        <h4 className="error">{this.state.errorMessage}</h4>
                    )}
                    <div className="registrationContainer">
                        <input
                            name="code"
                            onChange={(e) => this.handleChange(e)}
                            type="text"
                            placeholder="code"
                            length="6"
                            required
                            key="2"
                        ></input>
                        <input
                            name="password"
                            onChange={(e) => this.handleChange(e)}
                            type="text"
                            placeholder="New password"
                        ></input>
                        <button onClick={(e) => this.handleClickRV2(e)}>
                            Set new password
                        </button>
                    </div>
                </div>
            );
        } else if (this.state.renderView === 3) {
            return (
                <div className="registrationContainer">
                    <h3>Password successfully updated</h3>
                    <Link to="/login">click here to log in</Link>
                </div>
            );
        }
    }

    render() {
        return (
            <div className="container">
                <h2>Reset your Netzung password</h2>
                {this.determineWhichViewToRender()}
            </div>
        );
    }
}
