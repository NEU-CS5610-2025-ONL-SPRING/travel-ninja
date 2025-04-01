import React, { useState } from "react";

export default function FlightSearch() {

    const API_URL = process.env.REACT_APP_API_URL;
    const [formData, setFormData] = useState({
        departureDate: "2025-04-08",
        returnDate: "2025-04-22",
        originLocationCode: "MAA",
        destinationLocationCode: "DEL",
        adults: 5,
    });
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [addedFlight, setAddedFlight] = useState(false);

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


        const queryParams = new URLSearchParams(formData).toString();
        const apiUrl = `${API_URL}/flights`;

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

    const addFlight = async (reqBody) => {
        setAddedFlight(true);

        const apiUrl = `${API_URL}/addFlight`;
        console.log(reqBody);

        try {
            const res = await fetch(`${API_URL}/addFlight`, {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(reqBody),
            });
            const data = await res.json();
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

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
            {addedFlight && <p>Saved Flight</p>}
            {loading && <p>Loading...</p>}
            {error && <p style={{ color: "red" }}>{error}</p>}
            {results && results.length > 0 && results[0].length > 0 && (
                <div>
                    {results.map((flightOption, index) => {

                        const outbound = flightOption[0];
                        const flightName = outbound.segmentsDetails[0].flightNumber;
                        const airlineName = outbound.segmentsDetails[0].airlineName;
                        const source = outbound.originCode;
                        const destination = outbound.arrivalCode;
                        const departureDate = outbound.departureTime;
                        const returnDate = outbound.arrivalTime;
                        const price = outbound.price.total;
                        const reqBody = { outbound, flightName, airlineName, source, destination, departureDate, returnDate, price };

                        return (
                            <div key={index} style={{ border: "1px solid #ccc", padding: "16px", marginBottom: "16px" }}>
                                <h3>Outbound Flight</h3>
                                <p>Source: {source}</p>
                                <p>Destination: {destination}</p>
                                <p>Departure Time: {departureDate}</p>
                                <p>Arrival Time: {returnDate}</p>
                                <p>
                                    Price: {price} {outbound.price.currency}
                                </p>
                                <p>Airline Name: {airlineName}</p>
                                <p>Flight Number: {flightName}</p>
                                <button onClick={() => addFlight(reqBody)}>Save Flight</button>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
