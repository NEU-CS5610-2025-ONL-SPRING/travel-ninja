import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';

export default function ItinerariesList() {

    const API_URL = process.env.REACT_APP_API_URL;
    const [itineraries, setItineraries] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        let ignore = false;
        getItineraries();
        return () => {
            ignore = true;
        };
    }, [API_URL]);

    const getItineraries = async () => {
        const response = await fetch(`${API_URL}/itinerary`, {
            method: "GET",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
        });

        setItineraries(await response.json());
    }

    const getItinerary = async (itinerary) => {
        navigate(`/app/itineraries/${itinerary.id}`, {
            state: { itinerary },
        });
    }
    return (<>
        <h2>Itineraries List</h2>
        {itineraries && itineraries.length > 0 && (
            <div>
                {itineraries.map((itinerary, index) => {
                    return (
                        <div className="flight-card" key={index} style={{ border: "1px solid #ccc", padding: "16px", marginBottom: "16px" }}>
                            <h3>{itinerary.name}</h3>
                            <button onClick={() => getItinerary(itinerary)}>Expand</button>
                        </div>
                    );
                })}
            </div>
        )}
    </>);
}

