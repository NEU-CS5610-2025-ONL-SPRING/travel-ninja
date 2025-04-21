import React, { useState } from "react";

export default function CreateItinerary() {
    const API_URL = process.env.REACT_APP_API_URL;
    const [itineraryName, setItineraryName] = useState();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [results, setResults] = useState([]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setItineraryName(value);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setResults(null);

        try {
            const res = await fetch(`${API_URL}/itinerary`, {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: itineraryName }),
            });
            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.error || `Request failed (${res.status})`);
            }
            setResults(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };
    return (
        <div>
            <form onSubmit={handleSubmit}>
                <div>
                    <label>
                        Name
                        <input
                            type="text"
                            name="name"
                            value={itineraryName}
                            onChange={handleChange}
                            required
                        />
                    </label>
                </div>
                <button type="submit">Submit</button>
            </form>
            {loading && <p>Loading...</p>}
            {error && <p style={{ color: "red" }}>{error}</p>}
        </div>
    );
}