import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import FlightSearch from './FlightSearch';

global.fetch = jest.fn();

const mockToday = '2025-04-21';
jest.spyOn(global.Date, 'now').mockImplementation(() => new Date(mockToday).valueOf());

describe('FlightSearch Component', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        process.env.REACT_APP_API_URL = 'http://localhost:8000/';
    });

    test('renders flight search form with all fields', () => {
        render(<FlightSearch />);

        expect(screen.getByLabelText(/departure date/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/return date/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/origin/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/destination/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/passengers/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /search flights/i })).toBeInTheDocument();
    });

    test('form fields are required', () => {
        render(<FlightSearch />);
        const originInput = screen.getByLabelText(/origin/i);
        const destinationInput = screen.getByLabelText(/destination/i);

        expect(originInput).toHaveAttribute('required');
        expect(destinationInput).toHaveAttribute('required');
    });

    test('button is disabled when required fields are empty', () => {
        render(<FlightSearch />);
        const submitButton = screen.getByRole('button', { name: /search flights/i });
        expect(submitButton).toBeDisabled();
    });
});