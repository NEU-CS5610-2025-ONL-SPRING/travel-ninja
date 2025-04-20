import React, { useState } from "react";
import CreateItinerary from "./CreateItinerary";
import ItinerariesList from "./ItinerariesList";

export default function Itineraries() {

    return (
        <div>
            <h2>Create Itinerary</h2>
            <CreateItinerary></CreateItinerary>
            <ItinerariesList></ItinerariesList>
        </div>
    );
}
