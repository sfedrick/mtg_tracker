# MTG Tracker

A Magic: The Gathering companion app for tracking life totals and creature counters when playing with physical cards. No more stacking a hundred counters by hand — just open the app and track everything digitally.

**Live app:** https://mtg-tracker-4hkd.onrender.com

## Features

- Track life totals for 2–4 players
- Add creatures with power/toughness and adjust counters at runtime
- Multiplayer rooms — share a 6-character room code so everyone stays in sync in real time
- Rejoins your room automatically if you refresh the page

## Running locally

```bash
# Install dependencies
npm install

# Start the frontend (Vite dev server)
npm run dev

# Start the Socket.io room server (separate terminal)
npm run dev:server
```

By default the frontend expects the server at `http://localhost:3001`. Override this with a `VITE_SERVER_URL` environment variable (e.g. in `.env.local`) for production deployments.

## License

This project is licensed under the [Creative Commons Attribution 4.0 International (CC BY 4.0)](https://creativecommons.org/licenses/by/4.0/) license.
You are free to share and adapt this project for any purpose, including commercially, as long as you give appropriate credit.
