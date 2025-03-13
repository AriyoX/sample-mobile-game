import React from 'react';
import { StyleSheet, SafeAreaView } from 'react-native';
import LugandaLearningGame from '@/components/LugandaLearningGame';

export default function LugandaScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <LugandaLearningGame />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});