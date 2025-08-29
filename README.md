# Show Pulse

A React Native (Expo) mobile app to track TV series and notify users about renewals, cancellations, and date changes.

## Features

- **Guest Mode**: Try the app without signing up - all data is stored locally
- **Show Tracking**: Add shows from TMDB search, view details, and manage your list
- **Dark Theme**: User-selectable light and dark themes with automatic persistence
- **Smart UI**: Swipe actions, favorites, filtering, and sorting
- **External Links**: IMDb and Metacritic integration

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Expo CLI (`npm install -g @expo/cli`)
- Expo Go app on your mobile device

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd ShowPulse
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env` and add your TMDB API key:
```
EXPO_PUBLIC_TMDB_KEY=your_tmdb_api_key_here
```

4. Start the development server:
```bash
npx expo start
```

5. Scan the QR code with Expo Go on your device

## Theme System

Show Pulse includes a comprehensive theming system that supports both light and dark themes. The theme is user-selectable and persists across app restarts.

### Using Themes in Components

1. **Import the theme hook**:
```typescript
import { useTheme } from '../theme/ThemeProvider';
```

2. **Access theme in your component**:
```typescript
const { theme, themeMode, setThemeMode } = useTheme();
```

3. **Create themed styles**:
```typescript
const styles = createStyles(theme);

const createStyles = (theme: any) => StyleSheet.create({
  container: {
    backgroundColor: theme.background.primary,
  },
  text: {
    color: theme.text.primary,
  },
  placeholder: {
    color: theme.text.muted,
  },
});
```

### Theme Structure

The theme object provides semantic color tokens organized by purpose:

#### Background Colors
- `theme.background.primary` - Main app background
- `theme.background.secondary` - Secondary surfaces (cards, inputs)
- `theme.background.surface` - Elevated surfaces (sections, cards)
- `theme.background.header` - Navigation header background

#### Text Colors
- `theme.text.primary` - Main text color
- `theme.text.secondary` - Secondary text (descriptions, captions)
- `theme.text.muted` - Muted text (placeholders, disabled)

#### Action Colors
- `theme.action.primary.background/text` - Primary actions (buttons, links)
- `theme.action.secondary.background/text` - Secondary actions
- `theme.action.destructive.background/text` - Destructive actions (delete, remove)

#### Status Colors
- `theme.status.success.background/text` - Success states
- `theme.status.warning.background/text` - Warning states
- `theme.status.danger.background/text` - Error/danger states
- `theme.status.neutral.background/text` - Neutral states

#### UI Component Colors
- `theme.ui.chip.default.background/border/text` - Default chip state
- `theme.ui.chip.selected.background/border/text` - Selected chip state

#### Border Colors
- `theme.border.primary` - Main borders
- `theme.border.secondary` - Secondary borders
- `theme.border.subtle` - Subtle borders

#### Shadow
- `theme.special.shadow` - Shadow color for elevation

### Theme Selection

Users can change themes in the Settings screen:
- **Light Theme**: Clean, bright interface (default)
- **Dark Theme**: Comfortable for low-light environments

The theme selection is automatically saved to AsyncStorage and restored on app launch.

### Best Practices

1. **Always use theme tokens** instead of hardcoded colors
2. **Use semantic naming** - prefer `theme.status.success.background` over `theme.colors.green`
3. **Test both themes** to ensure good contrast and readability
4. **Consider accessibility** - ensure text remains readable in both themes

## Project Structure

```
src/
├── components/          # Reusable UI components
├── screens/            # Screen components
├── services/           # API and external services
├── store/              # State management and data persistence
├── theme/              # Theme system and providers
├── types/              # TypeScript type definitions
└── utils/              # Utility functions and helpers
```

## Key Technologies

- **React Native** with Expo SDK 53
- **TypeScript** for type safety
- **React Navigation** for routing
- **React Query** for data fetching
- **AsyncStorage** for local data persistence
- **TMDB API** for show information

## Development

### Available Scripts

- `npm start` - Start Expo development server
- `npm run android` - Run on Android emulator
- `npm run ios` - Run on iOS simulator
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking

### Building for Production

```bash
# Build APK for Android
npx eas build --platform android --profile preview

# Build AAB for Play Store
npx eas build --platform android --profile production
```

## Contributing

1. Follow the existing code style and theme system
2. Ensure all new components use theme colors
3. Test on both light and dark themes
4. Maintain accessibility standards

## License

This project is licensed under the MIT License.
