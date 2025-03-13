import { Tabs } from 'expo-router';
import React from 'react';
import { Platform, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';

import { HapticTab } from '@/components/HapticTab';
import { IconSymbol } from '@/components/ui/IconSymbol';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const router = useRouter();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: true,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarStyle: Platform.select({
          ios: {
            position: 'absolute',
          },
          default: {},
        }),
        // Add a back button to each header
        headerLeft: () => (
          <TouchableOpacity
            style={{ marginLeft: 16 }}
            onPress={() => router.push('/')}
            accessibilityLabel="Go back to home"
            accessibilityHint="Returns to the main menu"
          >
            <IconSymbol size={28} name="chevron.left" color="#5D3A00" />
          </TouchableOpacity>
        ),
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Word Game',
          headerStyle: {
            backgroundColor: '#9DE7A9',
          },
          headerTintColor: '#5D3A00',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="reading"
        options={{
          title: 'Reading Game',
          headerStyle: {
            backgroundColor: '#F5E9BE',
          },
          headerTintColor: '#5D3A00',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="book.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="puzzle"
        options={{
          title: 'Puzzle Game',
          headerStyle: {
            backgroundColor: '#FFF9E6',
          },
          headerTintColor: '#873600',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="puzzlepiece.fill" color={color} />,
        }}
      />
     <Tabs.Screen
        name="explore"
        options={{
          title: 'Explore',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="paperplane.fill" color={color} />,
        }}
      /> 
    </Tabs>
  );
}
