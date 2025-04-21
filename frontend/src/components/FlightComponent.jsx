import React, { useState } from "react";

export default function FlightComponent({ reqBody, index }) {
    const API_URL = process.env.REACT_APP_API_URL;

    const outbound = reqBody.outbound;
    const obSegment = outbound.segmentsDetails[0] || {};
    const obflightNumber = obSegment.flightNumber;
    const obairlineName = obSegment.airlineName;
    const obsource = outbound.originCode;
    const obdestination = outbound.arrivalCode;
    const obdepartureRaw = outbound.departureTime;
    const obarrivalRaw = outbound.arrivalTime;
    const obprice = outbound.price.total;
    const obcurrency = outbound.price.currency;

    const inbound = reqBody.inbound;
    const ibSegment = inbound.segmentsDetails[0] || {};
    const ibflightNumber = ibSegment.flightNumber;
    const ibairlineName = ibSegment.airlineName;
    const ibsource = inbound.originCode;
    const ibdestination = inbound.arrivalCode;
    const ibdepartureRaw = inbound.departureTime;
    const ibarrivalRaw = inbound.arrivalTime;
    const ibprice = inbound.price.total;
    const ibcurrency = inbound.price.currency;

    const [itineraries, setItineraries] = useState([]);
    const [showChooser, setShowChooser] = useState(false);
    const [loadingItis, setLoadingItis] = useState(false);
    const [errorItis, setErrorItis] = useState(null);

    const [adding, setAdding] = useState(false);
    const [addError, setAddError] = useState(null);

    const handleSaveClick = async () => {
        setErrorItis(null);
        setLoadingItis(true);
        try {
            const res = await fetch(`${API_URL}/itinerary`, {
                method: "GET",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
            });
            if (!res.ok) throw new Error(`Status ${res.status}`);
            const data = await res.json();
            setItineraries(data);
            setShowChooser(true);
        } catch (err) {
            setErrorItis(err.message);
        } finally {
            setLoadingItis(false);
        }
    };

    const handleChoose = async (itineraryId) => {
        setAddError(null);
        setAdding(true);
        try {
            const res = await fetch(
                `${API_URL}/flights/addFlight/${itineraryId}`,
                {
                    method: "POST",
                    credentials: "include",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ outbound, inbound }),
                }
            );
            if (!res.ok) throw new Error(`Failed (${res.status})`);
            alert("Flight added!");
            setShowChooser(false);
        } catch (err) {
            setAddError(err.message);
        } finally {
            setAdding(false);
        }
    };

    return (
        <div
            className="flight-card"
            key={index}
            style={{
                display: "flex",
                gap: "16px",
                border: "1px solid #ccc",
                padding: "16px",
                marginBottom: "16px",
            }}
        >
            <div className="flight-card__section" style={{ flex: 1 }}>
                <h3>Outbound Flight</h3>
                <p><strong>Flight #:</strong> {obflightNumber}</p>
                <p><strong>Airline:</strong> {obairlineName}</p>
                <p><strong>From:</strong> {obsource}</p>
                <p><strong>To:</strong> {obdestination}</p>
                <p>
                    <strong>Depart:</strong>{" "}
                    {new Date(obdepartureRaw).toLocaleString()}
                </p>
                <p>
                    <strong>Arrive:</strong>{" "}
                    {new Date(obarrivalRaw).toLocaleString()}
                </p>
                <p><strong>Price:</strong> {obprice} {obcurrency}</p>
            </div>

            <div className="flight-card__section" style={{ flex: 1 }}>
                <h3>Inbound Flight</h3>
                <p><strong>Flight #:</strong> {ibflightNumber}</p>
                <p><strong>Airline:</strong> {ibairlineName}</p>
                <p><strong>From:</strong> {ibsource}</p>
                <p><strong>To:</strong> {ibdestination}</p>
                <p>
                    <strong>Depart:</strong>{" "}
                    {new Date(ibdepartureRaw).toLocaleString()}
                </p>
                <p>
                    <strong>Arrive:</strong>{" "}
                    {new Date(ibarrivalRaw).toLocaleString()}
                </p>
                <p><strong>Price:</strong> {ibprice} {ibcurrency}</p>
            </div>

            <div style={{ alignSelf: "start" }}>
                <button
                    className="add-flight"
                    onClick={handleSaveClick}
                    disabled={loadingItis || adding}
                >
                    {loadingItis ? "Loading…" : adding ? "Adding…" : "Save Flight"}
                </button>

                {errorItis && (
                    <p style={{ color: "red", marginTop: 4 }}>{errorItis}</p>
                )}

                {showChooser && (
                    <div
                        style={{
                            marginTop: 8,
                            padding: 8,
                            border: "1px dashed #888",
                            background: "#fafafa",
                            maxWidth: 200,
                        }}
                    >
                        <p>Select itinerary:</p>
                        <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                            {itineraries.map((iti) => (
                                <li key={iti.id} style={{ marginBottom: 4 }}>
                                    <button
                                        onClick={() => handleChoose(iti.id)}
                                        disabled={adding}
                                    >
                                        {iti.name}
                                    </button>
                                </li>
                            ))}
                        </ul>
                        {addError && (
                            <p style={{ color: "red", marginTop: 4 }}>{addError}</p>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

