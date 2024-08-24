// app/routes/autocomplete.tsx
import { json, LoaderFunction } from "@remix-run/node";
import axios from "axios";
import { GOOGLE_PLACES_API_KEY } from "~/utils/config.server";
import { AutocompleteResponse } from "~/types";
import { SimplifiedPrediction } from "~/types";

export const loader: LoaderFunction = async ({ request }) => {
  const url = new URL(request.url);
  const input = url.searchParams.get("input");

  if (!input) {
    throw new Response("Input is required", { status: 400 });
  }

  const googlePlacesUrl = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${input}&types=establishment&key=${GOOGLE_PLACES_API_KEY}`;

  try {
    const response = await axios.get<AutocompleteResponse>(googlePlacesUrl);
    const predictions = response.data.predictions;

    const filteredPredictions = predictions.filter(
      (prediction) =>
        prediction.types.includes("restaurant") ||
        prediction.types.includes("food")
    );

    // Extract only place_id and main_text from each prediction
    const simplifiedPredictions: SimplifiedPrediction[] =
      filteredPredictions.map((prediction) => ({
        place_id: prediction.place_id,
        main_text: prediction.structured_formatting.main_text,
      }));

    return json({ predictions: simplifiedPredictions });
  } catch (error) {
    console.error(error);
    throw new Response("Failed to fetch autocomplete data", { status: 500 });
  }
};
