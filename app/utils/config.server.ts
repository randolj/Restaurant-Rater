import dotenv from 'dotenv';
dotenv.config();

if (!process.env.GOOGLE_PLACES_API_KEY) {
    throw new Error("GOOGLE_PLACES_API_KEY is not set in .env file");
}

export const GOOGLE_PLACES_API_KEY = process.env.GOOGLE_PLACES_API_KEY;