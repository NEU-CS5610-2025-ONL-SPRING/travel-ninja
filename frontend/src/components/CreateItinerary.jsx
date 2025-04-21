import React, { useState, useEffect } from "react";
import "../style/Itineraries.css";

export default function CreateItinerary() {
    const API_URL = process.env.REACT_APP_API_URL;
    const [itineraryName, setItineraryName] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    // Reset success message after 3 seconds
    useEffect(() => {
        if (success) {
            const timer = setTimeout(() => {
                setSuccess(false);
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [success]);

    const handleChange = (e) => {
        setItineraryName(e.target.value);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!itineraryName.trim()) {
            setError("Please enter an itinerary name");
            return;
        }

        setLoading(true);
        setError(null);
        setSuccess(false);

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

            // Success! Clear form and show success message
            setItineraryName("");
            setSuccess(true);

            // Trigger a refresh of parent component
            if (typeof window !== 'undefined') {
                const refreshEvent = new CustomEvent('itineraryCreated');
                window.dispatchEvent(refreshEvent);
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <form className="create-itinerary-form" onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="itinerary-name">Itinerary Name</label>
                    <input
                        id="itinerary-name"
                        type="text"
                        name="name"
                        value={itineraryName}
                        onChange={handleChange}
                        placeholder="Enter a name for your itinerary"
                        required
                    />
                </div>

                <button
                    className="submit-button"
                    type="submit"
                    disabled={loading || !itineraryName.trim()}
                >
                    {loading ? "Creating..." : "Create Itinerary"}
                </button>
            </form>

            {loading && <div className="loading-message">Creating your itinerary...</div>}
            {error && <div className="error-message">{error}</div>}
            {success && <div className="success-message">Itinerary created successfully!</div>}
        </div>
    );
}