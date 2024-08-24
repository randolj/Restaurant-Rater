# Fullstack Template App

The goal of this app is to allow users to select restaurants and rate their favorites! My idea is to have it similar to instagram with a feed and all.

The app is built using **Remix** for the frontend and backend logic, with **Prisma** managing database interaction. Styling is handled using **Tailwind CSS**.

## Features

- **Login and Signup:** Basic authentication features are in place to manage user accounts.
- **Restaurant Search:** Using Google Places API, the search bar returns an array of restaurants matching your query.
- **Restaurant Selection:** Currently, the user can only select a restaurant they searched.

### Coming Soon

- **Deletion of Files:** Will delete unneeded files from template app.
- **Home & Add Rating pages:** Separate the home page which will show all users' restaurant ratings and an add rating page to add your own
- **Creating NavBar:** Will create a navbar for easy navigation to Home page, Add Rating page and User's profile page

## Installation

To get started, clone the repository and install the necessary dependencies:

```bash
npm install
```

### DB Setup

To connect the app to a database, follow these steps:

1. **MongoDB Atlas Setup:**

   - Create a MongoDB Atlas account if you don't have one.
   - Create a new cluster and get your connection string (MongoDB URL).
   - Replace the placeholder in your `.env` file with your MongoDB URL:

     ```
     DATABASE_URL="your-mongodb-url"
     GOOGLE_PLACES_API_KEY="your-google-places-api-key"
     ```

2. **Prisma Setup:**

   - Run the following command to generate the Prisma client:
     ```bash
     npx prisma generate
     ```
   - Verify and view your Prisma setup by running:
     ```bash
     npx prisma studio
     ```
     This command will open Prisma Studio, where you can view and manage your database schema.

3. **Environment Variables:**

   - Ensure your `.env` file is set up correctly with the necessary environment variables, including `DATABASE_URL`, `SESSION_SECRET` and `GOOGLE_PLACES_API_KEY`.

4. **Running the App:**

   - After setting up the database, start the application as usual:

     ```bash
     npm run dev
     ```

   - Your app should now be connected to your MongoDB database and fully functional.

## Screenshots

### Signup

<img width="1512" alt="Screenshot 2024-08-19 at 1 10 45 AM" src="https://github.com/user-attachments/assets/38a98748-2e0e-4340-a6e3-9bdff3cb7ae7">

### Login

<img width="1512" alt="Screenshot 2024-08-19 at 1 11 30 AM" src="https://github.com/user-attachments/assets/6b0ae4d6-f260-48e2-a30f-660735dda04e">

### Restaurant selection
![Restaurant rating process](https://github.com/user-attachments/assets/b7e51253-50a2-45fd-b788-ff364cf0abb4)
