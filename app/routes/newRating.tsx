import { useState } from "react";
import { useLoaderData } from "react-router";
import { NavBar } from "~/components/navBar";
import { RatingCreate } from "~/components/ratingCreate";
import { RestaurantSearch } from "~/components/restaurantSearch";
import { Restaurant } from "~/types";

export default function NewRating() {
  const [tempRestaurant, setTempRestaurant] = useState<Restaurant | undefined>(
    undefined
  );
  const [tempRating, setTempRating] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [showPredictions, setShowPredictions] = useState(false);
  const [input, setInput] = useState("");

  const handleSelect = (prediction: Restaurant) => {
    setInput("");
    setTempRestaurant(prediction);
    setShowPredictions(false);
  };

  return (
    <div className="flex">
      <NavBar />
      <div className="flex-1 min-h-screen flex justify-center bg-primary items-center flex-col">
        <div className="rounded-lg bg-white p-6 w-full max-w-md">
          <div className="relative">
            <RestaurantSearch
              showPredictions={showPredictions}
              setShowPredictions={setShowPredictions}
              handleSelect={handleSelect}
              input={input}
              setInput={setInput}
            />
          </div>
          <RatingCreate
            tempRestaurant={tempRestaurant}
            setTempRestaurant={setTempRestaurant}
            tempRating={tempRating}
            setTempRating={setTempRating}
            setErrorMessage={setErrorMessage}
          />
          {errorMessage && (
            <div className="text-red-500 mt-2 ml-1">{errorMessage}</div>
          )}
        </div>
      </div>
    </div>
  );
}
