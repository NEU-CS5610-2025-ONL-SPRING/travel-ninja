import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import "../style/Itineraries.css";

export default function ItinerariesList() {
    const API_URL = process.env.REACT_APP_API_URL;
    const [itineraries, setItineraries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // track which one we’re editing, and the new name
    const [editingId, setEditingId] = useState(null);
    const [editingName, setEditingName] = useState("");

    const navigate = useNavigate();

    // fetch list
    const getItineraries = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/itinerary`, {
                credentials: "include",
            });
            if (!res.ok) throw new Error("Failed to fetch itineraries");
            setItineraries(await res.json());
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        getItineraries();
    }, [API_URL]);

    // delete handler
    const deleteItinerary = async (id) => {
        if (!window.confirm("Delete this itinerary?")) return;
        try {
            const res = await fetch(`${API_URL}/itinerary/${id}`, {
                method: "DELETE",
                credentials: "include",
            });
            if (!res.ok) throw new Error("Delete failed");
            // remove from state
            setItineraries(prev => prev.filter(i => i.id !== id));
        } catch (err) {
            setError(err.message);
        }
    };

    // save new name handler
    const saveItineraryName = async (id) => {
        try {
            const res = await fetch(`${API_URL}/itinerary/${id}`, {
                method: "PATCH",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: editingName }),
            });
            if (!res.ok) throw new Error("Update failed");
            const updated = await res.json();
            // update in state
            setItineraries(prev =>
                prev.map(i => (i.id === id ? { ...i, name: updated.name } : i))
            );
            setEditingId(null);
        } catch (err) {
            setError(err.message);
        }
    };

    const viewDetails = (itinerary) => {
        navigate(`/app/itineraries/${itinerary.id}`, {
            state: { itinerary },
        });
    };

    if (loading) return <div className="loading-message">Loading your itineraries...</div>;
    if (error) return <div className="error-message">{error}</div>;

    if (!itineraries.length) {
        return <div className="empty-message">You don't have any itineraries yet. Create one to get started!</div>;
    }

    return (
        <div className="itineraries-list">
            {itineraries.map((it) => (
                <div className="itinerary-card" key={it.id}>
                    {editingId === it.id ? (
                        <>
                            <input
                                type="text"
                                value={editingName}
                                onChange={e => setEditingName(e.target.value)}
                            />
                            <button onClick={() => saveItineraryName(it.id)}>Save</button>
                            <button onClick={() => setEditingId(null)}>Cancel</button>
                        </>
                    ) : (
                        <>
                            <h3>{it.name}</h3>
                            <div className="itinerary-card-footer">
                                <button
                                    className="edit-button"
                                    onClick={() => {
                                        setEditingId(it.id);
                                        setEditingName(it.name);
                                    }}
                                >
                                    Edit Name
                                </button>
                                <button
                                    className="delete-button"
                                    onClick={() => deleteItinerary(it.id)}
                                >
                                    Delete
                                </button>
                                <button
                                    className="expand-button"
                                    onClick={() => viewDetails(it)}
                                >
                                    View Details
                                </button>
                            </div>
                        </>
                    )}
                </div>
            ))}
        </div>
    );
}
