// app/routes/autocomplete.tsx
import { json, LoaderFunction } from "@remix-run/node";
import axios from "axios";
import { GOOGLE_PLACES_API_KEY } from "~/utils/config.server";
import { AutocompleteResponse } from "~/types";

type SimplifiedPrediction = {
  place_id: string;
  main_text: string;
};

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

    // Extract place_id and main_text from each prediction
    const simplifiedPredictions: SimplifiedPrediction[] = predictions.map(
      (prediction) => ({
        place_id: prediction.place_id,
        main_text: prediction.structured_formatting.main_text,
      })
    );

    return json({ predictions: simplifiedPredictions });
  } catch (error) {
    console.error(error);
    throw new Response("Failed to fetch autocomplete data", { status: 500 });
  }
};
