import React from 'react';
import { StyleSheet, SafeAreaView } from 'react-native';
import BugandaPuzzleGame from '@/components/BugandaPuzzleGame';

export default function PuzzleScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <BugandaPuzzleGame />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});