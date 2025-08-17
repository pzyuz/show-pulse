// Robust dotenv loading that works in this project's CommonJS context
const { config } = require('dotenv');
const path = require('path');

// Explicitly specify .env path to avoid working directory issues
config({ path: path.resolve(__dirname, '.env') });

// Warn if TMDB key is missing at config time (non-fatal, aids debugging)
if (!process.env.EXPO_PUBLIC_TMDB_KEY) {
  console.warn('⚠️  EXPO_PUBLIC_TMDB_KEY not found in environment at config time');
}

module.exports = {
  expo: {
    name: "Show Pulse",
    slug: "showpulse",
    version: "1.0.0",
    orientation: "portrait",
    userInterfaceStyle: "light",
    assetBundlePatterns: [
      "**/*"
    ],
    ios: {
      supportsTablet: true
    },
    android: {
      package: "com.pzyuz.showpulse",
      adaptiveIcon: {
        backgroundColor: "#FFFFFF"
      }
    },
    // Ensure the TMDB key is exposed to the app at runtime
    extra: {
      tmdbApiKey: process.env.TMDB_API_KEY,
      supabaseUrl: process.env.SUPABASE_URL,
      supabaseAnonKey: process.env.SUPABASE_ANON_KEY,
      eas: {
        projectId: "5442abc4-3618-4e7b-9192-89181b7f96d5"
      }
    },
  }
};
