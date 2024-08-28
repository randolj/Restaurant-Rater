import { useRef, useState } from "react";
import { useFetcher } from "react-router-dom";
import { Restaurant } from "~/types";

export function RestaurantSearch({
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
}) {
  const fetcher = useFetcher<{ predictions: Restaurant[] }>();
  const inputRef = useRef<HTMLInputElement>(null);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setInput(value);

    if (value) {
      fetcher.load(`/autocomplete?input=${value}`);
      setShowPredictions(true);
    } else {
      fetcher.data = { predictions: [] };
      setShowPredictions(false);
    }
  };

  const handleBlur = () => {
    setTimeout(() => setShowPredictions(false), 100); // Slight delay to allow click event on predictions
  };

  const handleFocus = () => {
    if (fetcher.data?.predictions && fetcher.data?.predictions?.length > 0) {
      setShowPredictions(true);
    }
  };
  return (
    <div>
      <h2 className="text-3xl font-bold mb-5">
        Rate a place you just visited!
      </h2>
      <label className="block text-gray-700 text-sm font-bold mb-2">
        Restaurant Name:
      </label>
      <input
        type="text"
        name="restaurant"
        value={input}
        onChange={handleChange}
        onBlur={handleBlur}
        onFocus={handleFocus}
        ref={inputRef}
        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
        required
        autoComplete="off"
      />
      {showPredictions && fetcher.data?.predictions && (
        <ul
          className="absolute z-10 bg-white border border-gray-300 w-full mt-1 list-none"
          style={{ listStyle: "none", padding: 0 }}
        >
          {fetcher.data.predictions.map((prediction) => (
            <li
              key={prediction.place_id}
              onClick={() => handleSelect(prediction)}
              className="p-2 cursor-pointer hover:bg-gray-100"
            >
              {prediction.main_text}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
