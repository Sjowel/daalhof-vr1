# Daalhof VR1 – Football Team App

## Project Description
This project is a mobile-first web application developed for the women’s football team **Daalhof VR1**.  
The app provides a clear and accessible overview of upcoming matches, recent results, and the current league standings.

The goal of this project is to practice front-end development using **Next.js** and to work with a **mock API** that simulates real football data. The application is designed to be easily demonstrable on both desktop and mobile devices.

---

## Main Features
- **Upcoming Matches**
  - Displays future fixtures automatically
  - Shows date, kickoff time, opponent, and home/away indication

- **Latest Result**
  - Shows the most recent played match with score and team logos

- **Results Overview**
  - List of all played matches, sorted by most recent
  - Includes match dates, scores, and team names

- **League Standings**
  - League table overview
  - Daalhof VR1 is highlighted
  - Standings update automatically based on played matches involving Daalhof

- **Automatic Data Refresh**
  - Data refreshes every 5 seconds without manually reloading the page
  - Powered by a mock API (`/api/home`)

- **Mobile-First Design**
  - Optimized for phone screens
  - Bottom navigation for easy mobile use

---

## Running the Project Locally

### Requirements
- Node.js (version 18 or higher recommended)
- npm

### Steps
1. Clone the repository:
   ```bash
   git clone <your-repository-url>
2. Navigate to the project folder:

cd daalhof-vr1


3. Install dependencies:

npm install


4. Start the development server:

npm run dev


5. Open the application in your browser:

http://localhost:3000

- **Testing on a Mobile Device (optional)**

Connect your laptop and phone to the same network (or use a phone hotspot)

Find your laptop’s local IP address

Open http://<your-ip>:3000 on your phone browser

---

- **Hosted Version**

The application is hosted on Vercel.

Live demo:
[https://<your-vercel-project>.vercel.app](https://daalhof-vr1.vercel.app/)

- **Technologies used**
-Next.js (App Router)
-React
-TypeScript
-CSS (global styling)
-Mock API (Next.js Route Handlers)

- **Notes**

This project uses a mock API instead of a real football data API.
Only matches involving Daalhof VR1 automatically affect the standings; other teams’ standings are manually defined for demonstration purposes.
