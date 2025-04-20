import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";

const API_URL = process.env.REACT_APP_API_URL;

export default function ItineraryDetails() {
    const { id } = useParams();        // the :id from /app/itineraries/:id
    const [iti, setIti] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        setLoading(true);
        fetch(`${API_URL}/itinerary/${id}`, {
            credentials: "include",
        })
            .then(async (res) => {
                if (!res.ok) {
                    const body = await res.json().catch(() => ({}));
                    throw new Error(body.error || `Status ${res.status}`);
                }
                return res.json();
            })
            .then((data) => {
                setIti(data);
            })
            .catch((err) => {
                setError(err.message);
            })
            .finally(() => {
                setLoading(false);
            });
    }, [id]);

    if (loading) return <p>Loading itinerary…</p>;
    if (error) return <p style={{ color: "red" }}>Error: {error}</p>;
    if (!iti) return <p>No itinerary found.</p>;

    return (
        <div>
            <h1>{iti.name}</h1>
            <h2>Flights</h2>
            {iti.flights.length > 0 ? (
                <ul>
                    {iti.flights.map((f) => (
                        <li key={f.id} style={{ marginBottom: "1em" }}>
                            <strong>{f.flightName}</strong> — {f.airlineName}
                            <br />
                            From {f.source} to {f.destination}
                            <br />
                            Depart: {new Date(f.departureDate).toLocaleString()}
                            <br />
                            Return: {new Date(f.returnDate).toLocaleString()}
                            <br />
                            Price: {f.price}
                        </li>
                    ))}
                </ul>
            ) : (
                <p>No flights saved in this itinerary.</p>
            )}
        </div>
    );
}
