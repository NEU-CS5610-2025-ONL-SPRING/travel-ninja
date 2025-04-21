import React from "react";
import CreateItinerary from "./CreateItinerary";
import ItinerariesList from "./ItinerariesList";
import "../style/Itineraries.css";

export default function Itineraries() {
    return (
        <div className="itineraries-container">
            <div className="itineraries-section">
                <h2 className="itineraries-header">Create Itinerary</h2>
                <CreateItinerary />
            </div>

            <div className="itineraries-section">
                <h2 className="itineraries-header">Your Itineraries</h2>
                <ItinerariesList />
            </div>
        </div>
    );
}