import { Hello } from './hello';
import axios from 'axios';
import { render, waitFor } from '@testing-library/react';

jest.mock('axios');

test('Shows greetee retrieved with HTTP request', async () => {
    axios.get.mockResolvedValue({
        data: {
            greetee: 'Kitty'
        }
    });

    const {container} = render(<Hello />);

    expect(
        container.innerHTML
    ).toContain(
        'Loading...'
    );

    await waitFor(
        () => expect(container.querySelector('div')).toBeTruthy()
    );

    expect(
        container.querySelector('div').innerHTML
    ).toBe(
        'Hello, Kitty!'
    );
});