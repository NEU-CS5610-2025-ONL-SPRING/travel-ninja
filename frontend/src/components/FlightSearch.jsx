import React, { useState, useEffect } from "react";
import FlightComponent from "./FlightComponent";
import "../style/FlightSearch.css";

export default function FlightSearch() {
    const today = new Date().toISOString().split('T')[0];
    const API_URL = process.env.REACT_APP_API_URL;

    const joinUrl = (base, path) => {
        return `${base}/${path}`.replace(/([^:]\/)\/+/g, "$1");
    };

    const [formData, setFormData] = useState({
        departureDate: today,
        returnDate: today,
        originLocationCode: "",
        destinationLocationCode: "",
        adults: 1,
    });

    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({});

    // Validate form fields
    const validateField = (name, value) => {
        let newErrors = { ...errors };

        switch (name) {
            case "departureDate":
                if (new Date(value) < new Date(today)) {
                    newErrors.departureDate = "Departure date cannot be in the past";
                } else {
                    delete newErrors.departureDate;
                }
                break;

            case "returnDate":
                if (new Date(value) < new Date(today)) {
                    newErrors.returnDate = "Return date cannot be in the past";
                } else if (new Date(value) < new Date(formData.departureDate)) {
                    newErrors.returnDate = "Return date cannot be before departure date";
                } else {
                    delete newErrors.returnDate;
                }
                break;

            case "originLocationCode":
                if (!value) {
                    newErrors.originLocationCode = "Origin is required";
                } else if (!/^[A-Z]{3}$/.test(value)) {
                    newErrors.originLocationCode = "Please enter a valid 3-letter airport code";
                } else {
                    delete newErrors.originLocationCode;
                }
                break;

            case "destinationLocationCode":
                if (!value) {
                    newErrors.destinationLocationCode = "Destination is required";
                } else if (!/^[A-Z]{3}$/.test(value)) {
                    newErrors.destinationLocationCode = "Please enter a valid 3-letter airport code";
                } else if (value === formData.originLocationCode) {
                    newErrors.destinationLocationCode = "Destination cannot be the same as origin";
                } else {
                    delete newErrors.destinationLocationCode;
                }
                break;

            case "adults":
                if (!value || value < 1) {
                    newErrors.adults = "At least 1 passenger is required";
                } else if (value > 9) {
                    newErrors.adults = "Maximum 9 passengers allowed";
                } else {
                    delete newErrors.adults;
                }
                break;

            default:
                break;
        }

        setErrors(newErrors);
        return !newErrors[name];
    };

    useEffect(() => {
        if (touched.returnDate) {
            validateField("returnDate", formData.returnDate);
        }
    }, [formData.departureDate]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        const updatedValue = name === "adults" ? Number(value) : value;

        setFormData((prevData) => ({
            ...prevData,
            [name]: updatedValue,
        }));

        setTouched(prev => ({ ...prev, [name]: true }));
        validateField(name, updatedValue);
    };

    const handleBlur = (e) => {
        const { name, value } = e.target;
        setTouched(prev => ({ ...prev, [name]: true }));
        validateField(name, value);
    };

    const isFormValid = () => {
        return (
            formData.departureDate &&
            formData.returnDate &&
            formData.originLocationCode &&
            formData.destinationLocationCode &&
            formData.adults >= 1 &&
            Object.keys(errors).length === 0
        );
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setTouched({
            departureDate: true,
            returnDate: true,
            originLocationCode: true,
            destinationLocationCode: true,
            adults: true
        });

        const isDepartureDateValid = validateField("departureDate", formData.departureDate);
        const isReturnDateValid = validateField("returnDate", formData.returnDate);
        const isOriginValid = validateField("originLocationCode", formData.originLocationCode);
        const isDestinationValid = validateField("destinationLocationCode", formData.destinationLocationCode);
        const isAdultsValid = validateField("adults", formData.adults);

        if (isDepartureDateValid && isReturnDateValid && isOriginValid && isDestinationValid && isAdultsValid) {
            setLoading(true);
            setError(null);
            setResults([]);

            try {
                const flightsUrl = joinUrl(API_URL, "flights");
                console.log("Sending request to:", flightsUrl);

                const res = await fetch(flightsUrl, {
                    method: "POST",
                    credentials: "include",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ ...formData, max: 10 }),
                });

                if (!res.ok) {
                    throw new Error(`Server returned ${res.status}: ${res.statusText}`);
                }
                const contentType = res.headers.get("content-type");
                if (contentType && contentType.includes("application/json")) {
                    const data = await res.json();
                    setResults(data);
                } else {
                    throw new Error("Server returned non-JSON response");
                }
            } catch (err) {
                console.error("Flight search error:", err);

                if (err.message.includes("Server returned")) {
                    setError("The flight search service is currently unavailable. Please try again later.");
                } else if (err.message.includes("non-JSON")) {
                    setError("We encountered an error processing flight data. Please try again later.");
                } else if (err.message.includes("Failed to fetch")) {
                    setError("Could not connect to the flight search service. Please check your internet connection.");
                } else {
                    setError("An error occurred while searching for flights. Please try again later.");
                }
            } finally {
                setLoading(false);
            }
        }
    };

    return (
        <div className="flight-search-container">
            <h2 className="flight-search-title">Search Flights</h2>
            <form className="flight-search-form" onSubmit={handleSubmit}>
                <div className="form-row">
                    <div className="form-group">
                        <label htmlFor="departureDate">Departure Date</label>
                        <input
                            type="date"
                            id="departureDate"
                            name="departureDate"
                            value={formData.departureDate}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            min={today}
                            className={touched.departureDate && errors.departureDate ? "input-error" : ""}
                            required
                        />
                        {touched.departureDate && errors.departureDate && (
                            <div className="error-message-input">{errors.departureDate}</div>
                        )}
                    </div>
                    <div className="form-group">
                        <label htmlFor="returnDate">Return Date</label>
                        <input
                            type="date"
                            id="returnDate"
                            name="returnDate"
                            value={formData.returnDate}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            min={formData.departureDate}
                            className={touched.returnDate && errors.returnDate ? "input-error" : ""}
                            required
                        />
                        {touched.returnDate && errors.returnDate && (
                            <div className="error-message-input">{errors.returnDate}</div>
                        )}
                    </div>
                </div>
                <div className="form-row">
                    <div className="form-group">
                        <label htmlFor="originLocationCode">Origin (Airport Code)</label>
                        <input
                            type="text"
                            id="originLocationCode"
                            name="originLocationCode"
                            value={formData.originLocationCode}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            placeholder="e.g. LAX"
                            maxLength="3"
                            className={touched.originLocationCode && errors.originLocationCode ? "input-error" : ""}
                            required
                        />
                        {touched.originLocationCode && errors.originLocationCode && (
                            <div className="error-message-input">{errors.originLocationCode}</div>
                        )}
                    </div>
                    <div className="form-group">
                        <label htmlFor="destinationLocationCode">Destination (Airport Code)</label>
                        <input
                            type="text"
                            id="destinationLocationCode"
                            name="destinationLocationCode"
                            value={formData.destinationLocationCode}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            placeholder="e.g. JFK"
                            maxLength="3"
                            className={touched.destinationLocationCode && errors.destinationLocationCode ? "input-error" : ""}
                            required
                        />
                        {touched.destinationLocationCode && errors.destinationLocationCode && (
                            <div className="error-message-input">{errors.destinationLocationCode}</div>
                        )}
                    </div>
                </div>
                <div className="form-row">
                    <div className="form-group">
                        <label htmlFor="adults">Number of Passengers</label>
                        <input
                            type="number"
                            id="adults"
                            name="adults"
                            value={formData.adults}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            min="1"
                            max="9"
                            className={touched.adults && errors.adults ? "input-error" : ""}
                            required
                        />
                        {touched.adults && errors.adults && (
                            <div className="error-message-input">{errors.adults}</div>
                        )}
                    </div>
                    <div className="form-group search-button-container">
                        <button
                            className="submit-button"
                            type="submit"
                            disabled={!isFormValid()}
                        >
                            Search Flights
                        </button>
                    </div>
                </div>
            </form>

            {loading && <div className="loading-message">Searching for the best flights...</div>}

            {error && <div className="error-message">{error}</div>}

            {results && results.length > 0 && results[0].length > 0 && (
                <div className="results-container">
                    {results.map((flightOption, index) => {
                        const outbound = flightOption[0];
                        const inbound = flightOption[1];
                        const reqBody = { outbound, inbound };

                        return (
                            <FlightComponent
                                key={index}
                                reqBody={reqBody}
                                index={index}
                            />
                        );
                    })}
                </div>
            )}
        </div>
    );
}