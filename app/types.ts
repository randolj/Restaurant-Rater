export interface AutocompleteResponse {
    predictions: Prediction[];
    status: string;
}

export interface Prediction {
    description: string;
    matched_substrings: Array<{ length: number; offset: number }>;
    place_id: string;
    reference: string;
    structured_formatting: {
        main_text: string;
        main_text_matched_substrings: Array<{ length: number; offset: number }>;
        secondary_text: string;
    };
    terms: Array<{ offset: number; value: string }>;
    types: string[];
}

export type SimplifiedPrediction = {
    place_id: string;
    main_text: string;
};

export type Restaurant = {
    place_id: string;
    name: string;
    main_text: string;
    rating: number;
    postedBy: {
        name: string;
    };
};


