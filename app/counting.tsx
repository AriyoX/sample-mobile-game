import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Stack } from 'expo-router';
import LugandaCountingGame from '../components/LugandaCountingGame';
import { StatusBar } from 'expo-status-bar';

export default function CountingScreen() {
  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <Stack.Screen 
        options={{
          title: 'Luganda Counting',
          headerStyle: {
            backgroundColor: '#FFECB3',
          },
          headerTintColor: '#5D3A00',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }} 
      />
      <LugandaCountingGame />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});