import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import "../style/Itineraries.css";

export default function ItinerariesList() {
    const API_URL = process.env.REACT_APP_API_URL;
    const [itineraries, setItineraries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const getItineraries = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${API_URL}/itinerary`, {
                method: "GET",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
            });

            if (!response.ok) {
                throw new Error("Failed to fetch itineraries");
            }

            const data = await response.json();
            setItineraries(data);
        } catch (err) {
            setError(err.message);
            console.error("Error fetching itineraries:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        getItineraries();
        // Include getItineraries in the dependency array
    }, [API_URL]); // eslint-disable-line react-hooks/exhaustive-deps

    const getItinerary = async (itinerary) => {
        navigate(`/app/itineraries/${itinerary.id}`, {
            state: { itinerary },
        });
    };

    if (loading) {
        return <div className="loading-message">Loading your itineraries...</div>;
    }

    if (error) {
        return <div className="error-message">{error}</div>;
    }

    return (
        <>
            {itineraries && itineraries.length > 0 ? (
                <div className="itineraries-list">
                    {itineraries.map((itinerary, index) => (
                        <div className="itinerary-card" key={itinerary.id || index}>
                            <h3>{itinerary.name}</h3>
                            <div className="itinerary-card-footer">
                                <button
                                    className="expand-button"
                                    onClick={() => getItinerary(itinerary)}
                                >
                                    View Details
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="empty-message">
                    You don't have any itineraries yet. Create one to get started!
                </div>
            )}
        </>
    );
}