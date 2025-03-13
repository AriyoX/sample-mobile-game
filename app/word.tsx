import React from 'react';
import { StyleSheet, SafeAreaView } from 'react-native';
import WordGameScreen from '@/components/WordGameScreen';

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <WordGameScreen />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
