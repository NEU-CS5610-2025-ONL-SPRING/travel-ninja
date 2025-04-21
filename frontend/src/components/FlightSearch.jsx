import React, { useState } from "react";
import FlightComponent from "./FlightComponent";

export default function FlightSearch() {

    const today = new Date().toISOString().split('T')[0];
    const API_URL = process.env.REACT_APP_API_URL;
    const [formData, setFormData] = useState({
        departureDate: today,
        returnDate: today,
        originLocationCode: "MAA",
        destinationLocationCode: "DEL",
        adults: 5,
    });
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: name === "adults" ? Number(value) : value,
        }));
    };


    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setResults(null);

        try {
            const res = await fetch(`${API_URL}/flights`, {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...formData, max: 10 }),
            });
            const data = await res.json();
            setResults(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <h2>Search Flights</h2>
            <form onSubmit={handleSubmit}>
                <div>
                    <label>
                        Departure Date:
                        <input
                            type="date"
                            name="departureDate"
                            value={formData.departureDate}
                            onChange={handleChange}
                            required
                        />
                    </label>
                </div>
                <div>
                    <label>
                        Return Date:
                        <input
                            type="date"
                            name="returnDate"
                            value={formData.returnDate}
                            onChange={handleChange}
                            required
                        />
                    </label>
                </div>
                <div>
                    <label>
                        Origin Location Code:
                        <input
                            type="text"
                            name="originLocationCode"
                            value={formData.originLocationCode}
                            onChange={handleChange}
                            required
                        />
                    </label>
                </div>
                <div>
                    <label>
                        Destination Location Code:
                        <input
                            type="text"
                            name="destinationLocationCode"
                            value={formData.destinationLocationCode}
                            onChange={handleChange}
                            required
                        />
                    </label>
                </div>
                <div>
                    <label>
                        Adults:
                        <input
                            type="number"
                            name="adults"
                            value={formData.adults}
                            onChange={handleChange}
                            min="1"
                            required
                        />
                    </label>
                </div>
                <button type="submit">Search</button>
            </form>
            {loading && <p>Loading...</p>}
            {error && <p style={{ color: "red" }}>{error}</p>}
            {results && results.length > 0 && results[0].length > 0 && (
                <div>
                    {results.map((flightOption, index) => {

                        const outbound = flightOption[0];
                        const inbound = flightOption[1];
                        const reqBody = { outbound, inbound };

                        return (
                            <FlightComponent reqBody={reqBody} index={index}>
                            </FlightComponent>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
