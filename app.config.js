export default {
  expo: {
    name: "ShowPulse",
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
    extra: {
      tmdbApiKey: process.env.TMDB_API_KEY,
      supabaseUrl: process.env.SUPABASE_URL,
      supabaseAnonKey: process.env.SUPABASE_ANON_KEY,
      eas: {
        projectId: "5442abc4-3618-4e7b-9192-89181b7f96d5"
      }
    }
  }
};
