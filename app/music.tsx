import React from 'react';
import { StyleSheet, SafeAreaView } from 'react-native';
import LugandaMusicGame from '@/components/LugandaMusicGame';
import { useNavigation } from '@react-navigation/native';

export default function ReadingScreen() {
  const navigation = useNavigation();
  
  return (
    <SafeAreaView style={styles.container}>
      <LugandaMusicGame navigation={navigation} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});