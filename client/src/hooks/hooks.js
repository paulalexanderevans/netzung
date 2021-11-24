import ReactDOM from "react-dom";
import { useState } from "react";
import Welcome from "./welcome.js";
import App from "./app.js";

function Hello() {
    const [first, setFirst] = useState("Paul");
    // first is the name of the state property
    // setFirst is the function we'll use to update first
    const [last, setLast] = useState("Evans");
    const handleChange = (e) => {
        console.log("e.target.value: ", e.target.value);
        setFirst(e.target.value);
    };

    return (
        <div>
            <h1>Hello {first}</h1>
            <input name="first" type="text" onChange={handleChange} />
        </div>
    );
}
ReactDOM.render(elem, document.querySelector("main"));
