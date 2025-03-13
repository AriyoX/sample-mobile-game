import React from 'react';
import { StyleSheet, SafeAreaView } from 'react-native';
import ReadingGame from '@/components/ReadingGame';

export default function ReadingScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ReadingGame />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});