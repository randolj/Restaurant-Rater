# Fullstack Template App

I created this repository to serve as a full-stack template application designed to be easily forked and extended for any future projects. The app currently includes basic login and signup features, along with task management functionality when logged in. The task management serves as a placeholder app to demonstrate some DB functionality. 

The app is built using **Remix** for the frontend and backend logic, with **Prisma** managing database interaction. Styling is handled using **Tailwind CSS**.

Feel free to fork and use as a base for your own app! Happy coding!

## Features

- **Login and Signup:** Basic authentication features are in place to manage user accounts.
- **Task Management:** Logged-in users can create, view, and manage their tasks.
- **User Validation:** Cannot access main route without signing in and having the session cookie

### Coming Soon

- **Password Validation:** Enhanced security by enforcing stronger password rules.
- **Improved Error Handling:** Better error handling for incorrect login attempts.
- **Additional Features:** As I learn more, new features will be added to improve its functionality and user experience!

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
   - Ensure your `.env` file is set up correctly with the necessary environment variables, including `DATABASE_URL` and `SESSION_SECRET`.

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

### Tasks
![2024-08-19 01 12 06](https://github.com/user-attachments/assets/f0ef0790-842a-4ea9-b8e6-8385160a1ee1)
