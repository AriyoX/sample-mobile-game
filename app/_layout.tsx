import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/useColorScheme';
import { IconSymbol } from '@/components/ui/IconSymbol';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  // Custom back handler that reliably goes back to home
  const goBackToHome = () => {
    router.replace('/');  // Using replace instead of push to avoid stacking
  };

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        {/* Home screen doesn't show header */}
        <Stack.Screen name="index" options={{ headerShown: false }} />
        
        {/* Game screens with header and back button */}
        <Stack.Screen
          name="word"
          options={{
            title: 'Word Game',
            headerStyle: { backgroundColor: '#9DE7A9' },
            headerTintColor: '#5D3A00',
            headerLeft: () => (
              <TouchableOpacity
                style={{ marginLeft: 16 }}
                onPress={goBackToHome}
                accessibilityLabel="Go back to home"
                accessibilityHint="Returns to the home screen"
              >
                <IconSymbol size={28} name="chevron.left" color="#5D3A00" />
              </TouchableOpacity>
            ),
          }}
        />
        
        <Stack.Screen
          name="reading"
          options={{
            title: 'Reading Game',
            headerStyle: { backgroundColor: '#F5E9BE' },
            headerTintColor: '#5D3A00',
            headerLeft: () => (
              <TouchableOpacity
                style={{ marginLeft: 16 }}
                onPress={goBackToHome}
                accessibilityLabel="Go back to home"
                accessibilityHint="Returns to the home screen"
              >
                <IconSymbol size={28} name="chevron.left" color="#5D3A00" />
              </TouchableOpacity>
            ),
          }}
        />
        
        <Stack.Screen
          name="puzzle"
          options={{
            title: 'Puzzle Game',
            headerStyle: { backgroundColor: '#FFF9E6' },
            headerTintColor: '#873600',
            headerLeft: () => (
              <TouchableOpacity
                style={{ marginLeft: 16 }}
                onPress={goBackToHome}
                accessibilityLabel="Go back to home"
                accessibilityHint="Returns to the home screen"
              >
                <IconSymbol size={28} name="chevron.left" color="#5D3A00" />
              </TouchableOpacity>
            ),
          }}
        />
        
        <Stack.Screen
          name="explore"
          options={{
            title: 'Explore',
            headerLeft: () => (
              <TouchableOpacity
                style={{ marginLeft: 16 }}
                onPress={goBackToHome}
                accessibilityLabel="Go back to home"
                accessibilityHint="Returns to the home screen"
              >
                <IconSymbol size={28} name="chevron.left" color="#5D3A00" />
              </TouchableOpacity>
            ),
          }}
        />
        
        <Stack.Screen
          name="luganda"
          options={{
            title: 'Luganda Learning',
            headerStyle: { backgroundColor: '#E3F2FD' },
            headerTintColor: '#1CB0F6',
            headerLeft: () => (
              <TouchableOpacity
                style={{ marginLeft: 16 }}
                onPress={goBackToHome}
                accessibilityLabel="Go back to home"
                accessibilityHint="Returns to the home screen"
              >
                <IconSymbol size={28} name="chevron.left" color="#1CB0F6" />
              </TouchableOpacity>
            ),
          }}
        />
        
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
