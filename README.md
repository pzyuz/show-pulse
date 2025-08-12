# Show Pulse

A minimal React Native (Expo, TypeScript) mobile app to track TV series and notify users about renewals, cancellations, and date changes — with Guest Mode for testing without sign-up.

## Features

- **Guest Mode**: Test the app without creating an account - all data is stored locally
- **TV Show Tracking**: Search and add your favorite TV shows using TMDB API
- **Show Management**: View show details, status, air dates, and network information
- **Local Storage**: Guest mode uses AsyncStorage to persist data across app restarts
- **Modern UI**: Clean, responsive interface built with React Native StyleSheet
- **TypeScript**: Full type safety throughout the application

## Tech Stack

- **Frontend**: React Native with Expo
- **Language**: TypeScript
- **Navigation**: React Navigation v6
- **State Management**: React Context + AsyncStorage
- **Data Fetching**: React Query (TanStack Query)
- **Backend**: Supabase (PostgreSQL + Edge Functions)
- **External API**: TMDB (The Movie Database)
- **Storage**: AsyncStorage for guest mode, Supabase for authenticated users

## Prerequisites

- Node.js 18+ and npm
- Expo CLI (`npm install -g @expo/cli`)
- Expo Go app on your mobile device
- Supabase account (for production features)
- TMDB API key

## Quick Start

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ShowPulse
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env
   ```
   
   Edit `.env` and add your API keys:
   ```
   TMDB_API_KEY=your_tmdb_api_key_here
   SUPABASE_URL=your_supabase_url_here
   SUPABASE_ANON_KEY=your_supabase_anon_key_here
   ```

4. **Start the development server**
   ```bash
   npx expo start
   ```

5. **Run on your device**
   - Scan the QR code with Expo Go (iOS/Android)
   - Or press `a` for Android or `i` for iOS simulator

## Environment Setup

### TMDB API Key

1. Go to [TMDB](https://www.themoviedb.org/)
2. Create an account and log in
3. Go to Settings → API
4. Request an API key (choose "Developer" option)
5. Copy your API key to `.env`

### Supabase Setup (Optional for Guest Mode)

1. Go to [Supabase](https://supabase.com/)
2. Create a new project
3. Go to Settings → API
4. Copy your project URL and anon key to `.env`
5. Run the database schema in `db/schema.sql`

## Project Structure

```
ShowPulse/
├── src/
│   ├── components/          # Reusable UI components
│   ├── screens/            # Screen components
│   │   ├── AuthScreen.tsx
│   │   ├── MyShowsScreen.tsx
│   │   ├── AddShowScreen.tsx
│   │   ├── ShowDetailsScreen.tsx
│   │   └── SettingsScreen.tsx
│   ├── services/           # API services
│   │   ├── supabase.ts
│   │   └── tmdb.ts
│   ├── store/              # State management
│   │   ├── auth.tsx
│   │   └── queryClient.tsx
│   ├── types/              # TypeScript definitions
│   │   └── index.ts
│   └── utils/              # Utility functions
│       └── navigation.tsx
├── db/                     # Database schema
│   └── schema.sql
├── supabase/               # Supabase Edge Functions
│   └── functions/
│       └── poll-shows/
│           └── index.ts
├── App.tsx                 # Main app component
├── app.config.js           # Expo configuration
├── package.json            # Dependencies
└── README.md
```

## Guest Mode

The app includes a "Continue as Guest" feature that allows users to:

- Browse and search TV shows
- Add shows to a local watchlist
- View show details and information
- Export/delete local data
- All data is stored locally using AsyncStorage

This mode is perfect for:
- Testing the app without setup
- Users who want to try before creating an account
- Offline usage (limited to previously searched shows)

## Database Schema

The app uses three main tables:

- **shows**: TV show information from TMDB
- **user_shows**: User-show relationships and notification preferences
- **show_snapshots**: Historical data for change detection

All tables include Row Level Security (RLS) policies for data protection.

## Supabase Edge Function

The `poll-shows` function:

- Fetches show data from TMDB
- Compares with previous snapshots
- Detects changes that would trigger notifications
- Updates the database with latest information
- Logs notification events (ready for implementation)

## Development

### Available Scripts

- `npm start` - Start Expo development server
- `npm run android` - Run on Android
- `npm run ios` - Run on iOS
- `npm run web` - Run in web browser
- `npm test` - Run Jest tests
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier

### Code Style

- ESLint configuration for code quality
- Prettier for consistent formatting
- TypeScript strict mode enabled
- React Native best practices

## Testing

The app includes Jest setup for unit testing:

- Mocked AsyncStorage for testing
- React Native testing utilities
- TypeScript support

## Deployment

### EAS Build

1. Install EAS CLI: `npm install -g @eas-cli`
2. Login: `eas login`
3. Configure: `eas build:configure`
4. Build: `eas build --platform all`

### Supabase Edge Functions

1. Install Supabase CLI
2. Link your project: `supabase link --project-ref <your-project-ref>`
3. Deploy: `supabase functions deploy poll-shows`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For issues and questions:
- Check the existing issues
- Create a new issue with detailed information
- Include device/OS information for mobile-specific issues

## Roadmap

- [ ] Push notification implementation
- [ ] Email notification system
- [ ] Offline mode improvements
- [ ] Social features (sharing, recommendations)
- [ ] Advanced filtering and search
- [ ] Dark mode support
- [ ] Internationalization
- [ ] Performance optimizations
