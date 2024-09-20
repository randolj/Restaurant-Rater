import { useSubmit } from "@remix-run/react";
import { Restaurant } from "~/types";
import { RestaurantSearch } from "./restaurantSearch";
import { useState } from "react";

export function RatingCreate({
  myRatings,
  tempRestaurant,
  setTempRestaurant,
  tempRating,
  setTempRating,
  setErrorMessage,
  setSelectedRestaurants,
  showPredictions,
  setShowPredictions,
  input,
  setInput,
  handleSelect,
}: {
  handleSelect: (prediction: Restaurant) => void;
  showPredictions: boolean;
  setShowPredictions: (val: boolean) => void;
  input: string;
  setInput: (val: string) => void;
  myRatings: Restaurant[];
  tempRestaurant: Restaurant | undefined;
  tempRating: number | null;
  setTempRestaurant: (value: Restaurant | undefined) => void;
  setTempRating: (value: number | null) => void;
  setErrorMessage: (value: string) => void;
  setSelectedRestaurants?: React.Dispatch<React.SetStateAction<Restaurant[]>>;
}) {
  const submit = useSubmit();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files ? event.target.files[0] : null;
    setSelectedFile(file);
  };

  const handleTempRating = (value: number) => {
    setTempRating(value);
  };

  const handleSubmitRestaurant = (prediction: Restaurant) => {
    setErrorMessage("");
    const validRating = tempRating ?? 0;

    const isAlreadyRated = myRatings.some(
      (rating) => rating.place_id === prediction.place_id
    );

    if (isAlreadyRated) {
      setTempRestaurant(undefined);
      setTempRating(null);
      setErrorMessage("This restaurant has already been rated.");
      return;
    }

    if (tempRating === null || validRating < 1 || validRating > 5) {
      setErrorMessage("Please include a rating");
      return;
    }

    const newRestaurant: Restaurant = {
      ...prediction,
      name: prediction.main_text,
      rating: validRating,
    };

    setSelectedRestaurants &&
      setSelectedRestaurants((prev) => [...prev, newRestaurant]);

    setTempRestaurant(undefined);

    const formData = new FormData();
    formData.append("action", "new");
    formData.append("main_text", prediction.main_text);
    formData.append("place_id", prediction.place_id);
    formData.append("rating", tempRating.toString());

    // Attach file if selected
    if (selectedFile) {
      formData.append("file", selectedFile);
    }

    submit(formData, { method: "post", encType: "multipart/form-data" });

    setTempRating(null);
  };

  return (
    <div className="relative">
      <RestaurantSearch
        showPredictions={showPredictions}
        setShowPredictions={setShowPredictions}
        handleSelect={handleSelect}
        input={input}
        setInput={setInput}
      />
      {/* TODO: Separate into a StagingRestuarant component? */}
      {tempRestaurant && (
        <div className="p-4 border rounded-xl flex justify-between items-center mt-2">
          <div>
            <span className="block">{tempRestaurant.main_text}</span>
            <div className="flex mt-1">
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  onClick={() => handleTempRating(value)}
                  className={`mx-0.5 ${
                    tempRating !== null && tempRating >= value
                      ? ""
                      : "grayscale"
                  }`}
                >
                  ⭐
                </button>
              ))}
            </div>
            <input type="file" accept="image/*" onChange={handleFileChange} />
          </div>
          <button
            onClick={() => handleSubmitRestaurant(tempRestaurant)}
            className="px-4 py-2 bg-blue-500 text-white rounded-md"
          >
            Submit
          </button>
        </div>
      )}
    </div>
  );
}
