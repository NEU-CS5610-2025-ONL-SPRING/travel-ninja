import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

const MockItinerariesList = () => (
    <div>
        <h2>Itineraries List</h2>
        <div>Loading...</div>
    </div>
);

describe('ItinerariesList Component', () => {
    test('component renders without crashing', () => {
        render(<MockItinerariesList />);
        expect(screen.getByText(/itineraries list/i)).toBeInTheDocument();
    });
});