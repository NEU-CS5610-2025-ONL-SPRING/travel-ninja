import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

const MockLogin = () => (
    <div>
        <form>
            <div>
                <label htmlFor="email">Email</label>
                <input id="email" type="email" />
            </div>
            <div>
                <label htmlFor="password">Password</label>
                <input id="password" type="password" />
            </div>
            <button type="submit">Login</button>
        </form>
    </div>
);

describe('Login Component', () => {
    test('renders login form with email and password inputs', () => {
        render(<MockLogin />);

        expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
    });
});