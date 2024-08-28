export interface RestaurantData {
  name: string;
  rating: number;
  postedBy: any;
}


export const categories = [
  { name: "Others", value: "OTHERS" },
  { name: "Office", value: "OFFICE" },
  { name: "Home", value: "HOME" }
] as const;

export type Category = (typeof categories)[number]["value"];