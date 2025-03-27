import Amadeus from "amadeus";
import * as dotenv from "dotenv";
dotenv.config();

const amadeus = new Amadeus({
  clientId: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET
});

export {amadeus}

