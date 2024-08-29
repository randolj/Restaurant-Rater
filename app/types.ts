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

export type User = {
    id: string;
    username: string;
    createdAt: Date;
    updatedAt: Date;
    email: string;
    name: string;
    places: Restaurant[];
}

// TODO: I'm not super happy with this type, ideally would add the Rating type but need to brainstorm that
// I would prefer Restaurant to just have name/main_text, place_id & id
// createdAt, postedBy and rating would go on the Rating type like below
export type Restaurant = {
    id: string;
    place_id: string;
    name: string;
    main_text: string;
    rating: number;
    createdAt: Date;
    postedBy: User;
};

export type Rating = {
    restaurant: Restaurant;
    createdAt: Date;
    postedBy: User;
    rating: number;
}


