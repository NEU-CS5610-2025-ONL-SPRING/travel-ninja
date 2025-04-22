TravelNinja - Travel Planning Application
TravelNinja is a comprehensive travel planning application that helps users search for flights, create travel itineraries, and save their favorite travel plans. The application features a clean, responsive dark-themed UI and offers secure user authentication.

Features
User authentication (login/registration)
Flight search powered by Amadeus API
Itinerary creation and management
Responsive design for all devices

Deployment
The application is deployed at https://frontend-4fcrqfdux-shreyas-sahus-projects.vercel.app/

Frontend: https://frontend-4fcrqfdux-shreyas-sahus-projects.vercel.app/
Backend: https://travel-ninja.onrender.com

Running the Project Locally
Prerequisites
Node.js (v16 or later)
PostgreSQL
Amadeus API credentials

Environment Setup
Clone the repository:

git clone https://github.com/NEU-CS5610-2025-ONL-SPRING/final-project-part-3-travel-ninja.git
cd travel-ninja
Set up environment variables:

Create a .env file in the backend directory with the following variables:
Create a .env file in the frontend directory with:
Installation and Running
Backend setup:
cd api
npm install
npx prisma generate
npx prisma migrate dev
npm start

Frontend setup:
cd frontend
npm install
npm start
Installation and Running
Backend setup:
cd api
npm install
npx prisma generate
npx prisma migrate dev
npm start

Frontend setup:
cd frontend
npm install
npm start
Access the application at http://localhost:3000

Testing
To run backend tests:
cd api
npm test

To run frontend tests:
cd frontend
npm test
