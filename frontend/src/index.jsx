import React from "react";
import * as ReactDOMClient from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AppLayout from "./components/AppLayout";
import FlightSearch from "./components/FlightSearch";
import Profile from "./components/Profile";
import Login from "./components/Login";
import Register from "./components/Register";
import NotFound from "./components/NotFound";
import Home from "./components/Home";
import Itineraries from "./components/Itineraries";
import ItineraryDetails from "./components/ItineraryDetails";
import { AuthProvider } from "./security/AuthContext";
import RequireAuth from "./security/RequireAuth";
import './style/index.css';
const container = document.getElementById("root");

const root = ReactDOMClient.createRoot(container);

root.render(
  <AuthProvider>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/app/*"
          element={
            <RequireAuth>
              <AppLayout />
            </RequireAuth>
          }
        >
          <Route index element={<Profile />} />
          <Route path="flightSearch" element={<FlightSearch />} />
          <Route path="itineraries" element={<Itineraries />} />
          <Route path="itineraries/:id" element={<ItineraryDetails></ItineraryDetails>} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  </AuthProvider>
);
