# groc-list-smpl

A simple, mobile-first grocery list PWA built for iPhone. Supports multiple lists, real-time sharing, offline use, and fast item entry with type-ahead suggestions.

## Tech stack

- React + Vite
- Tailwind CSS v4
- Firebase (Firestore, Auth, Hosting)

## Getting started

1. Clone the repo
2. Install dependencies:
   ```
   npm install
   ```
3. Copy the env template and fill in your Firebase project values:
   ```
   cp .env.example .env.local
   ```
4. In the Firebase Console, enable **Google Sign-In** under Authentication and create a **Firestore** database.
5. Start the dev server:
   ```
   npm run dev
   ```

## Firebase setup

All config values come from Firebase Console → Project settings → Your apps → web app config object.

See `.env.example` for the required variable names.

## Firestore security rules

The `firestore.rules` file contains the production security rules. Deploy them with:

```
firebase deploy --only firestore:rules
```
