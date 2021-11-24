console.log("testing app.js");
import App from "./app.js";
import { render, waitFor, fireEvent } from "@testing-library/react";
import axios from "./axios";
// const myMockFn = jest.fn((n) => n >= 18);

// test("filter calls function properly", () => {
//     const a = [22, 15, 37];
//     a.filter(myMockFn);
//     console.log("myMockFn.mock: ", myMockFn.mock);
//     expect(myMockFn.mock.calls.length).toBe(3);
// });

jest.mock("./axios");

axios.get.mockResolvedValue({
    data: {
        first: "pete",
        last: "Anderson",
        profilePicUrl: "https://www.fillmurray.com/200/300",
        id: 1,
    },
});

test("app stuff", async () => {
    const { container } = render(<App />);
    console.log("container.innerHTML: ", container.innerHTML);

    expect(container.innerHTML).toContain("profilePic");

    await waitFor(()=>container )
});
