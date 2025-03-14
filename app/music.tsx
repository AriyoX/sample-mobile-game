import React from 'react';
import { StyleSheet, SafeAreaView } from 'react-native';
import LugandaMusicGame from '@/components/LugandaMusicGame';

export default function ReadingScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <LugandaMusicGame />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});