import { ThemeProvider } from 'ThemeProvider';
import * as SplashScreen from 'expo-splash-screen';
import * as React from 'react';
import { Platform, StatusBar, Animated, View, StyleSheet } from 'react-native';

import RootNavigation from './src/navigation/RootNavigation';
import loadAssetsAsync from './src/utilities/loadAssetsAsync';

SplashScreen.preventAutoHideAsync();

// Enhanced splash screen with fade animation
const EnhancedSplash = () => {
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <View style={styles.splashContainer}>
      <Animated.View style={[styles.splashContent, { opacity: fadeAnim }]}>
        {/* Animated gradient background effect */}
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  splashContainer: {
    flex: 1,
    backgroundColor: '#6366F1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  splashContent: {
    width: 200,
    height: 200,
  },
});

function useSplashScreen(loadingFunction: () => Promise<void>) {
  const [isLoadingCompleted, setLoadingComplete] = React.useState(false);

  // Load any resources or data that we need prior to rendering the app
  React.useEffect(() => {
    async function loadAsync() {
      try {
        await loadingFunction();
      } catch (e) {
        // We might want to provide this error information to an error reporting service
        console.warn(e);
      } finally {
        setLoadingComplete(true);
        await SplashScreen.hide();
      }
    }

    loadAsync();
  }, []);

  return isLoadingCompleted;
}

export default function App() {
  const [appReady, setAppReady] = React.useState(false);
  const fadeAnim = React.useRef(new Animated.Value(1)).current;

  const isLoadingCompleted = useSplashScreen(async () => {
    if (Platform.OS === 'ios') {
      StatusBar.setBarStyle('dark-content', false);
    }
    await loadAssetsAsync();
  });

  React.useEffect(() => {
    if (isLoadingCompleted) {
      // Fade out splash and fade in app
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }).start(() => setAppReady(true));
    }
  }, [isLoadingCompleted]);

  return (
    <ThemeProvider>
      {isLoadingCompleted ? (
        <Animated.View style={{ flex: 1, opacity: appReady ? 1 : 0 }}>
          <RootNavigation />
        </Animated.View>
      ) : (
        <EnhancedSplash />
      )}
    </ThemeProvider>
  );
}
