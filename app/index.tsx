import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

const HomeScreen = () => {
  const router = useRouter();

  // Fixed typing issue by using specific route paths
  const navigateToGame = (game: 'word' | 'reading' | 'puzzle' | 'explore') => {
    router.push(`/(tabs)/${game}`);
  };
  
  // For index tab, we need a separate method
  const navigateToHome = () => {
    router.push('/');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <Stack.Screen 
        options={{
          headerShown: false,
        }}
      />
      
      {/* Header with profile and level */}
      <View style={styles.header}>
        <View style={styles.profileSection}>
          <Image 
            source={require('../assets/images/avatar.png')} // Using a known existing image
            style={styles.profileImage}
          />
          <Text style={styles.profileName}>Grace</Text>
        </View>
        <View style={styles.levelBadge}>
          <Text style={styles.levelText}>Level 1</Text>
        </View>
      </View>
      
      {/* Main banner with dinosaur character */}
      <View style={styles.mainBanner}>
        <Text style={styles.bannerText}>Let's play{'\n'}with us!</Text>
        <View style={styles.charactersContainer}>
          <Image 
            source={require('../assets/images/boni-character.png')} 
            style={styles.dinoImage}
          />
        </View>
      </View>
      
      <View style={styles.gameRow}>
          <TouchableOpacity 
            style={[styles.gameCard, styles.wordsCard]}
            onPress={() => navigateToGame('word')}
            accessibilityLabel="Word Game"
            accessibilityHint="Play word games to learn vocabulary"
          >
            <Image 
              source={require('../assets/images/blocks.png')} // Using a known existing image
              style={styles.gameIcon}
            />
            <Text style={styles.gameTitle}>Word Game</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.gameCard, styles.readingCard]}
            onPress={() => navigateToGame('reading')}
            accessibilityLabel="Reading with Boni"
            accessibilityHint="Read stories with Boni character"
          >
            <Image 
              source={require('../assets/images/book.png')} 
              style={styles.gameIcon}
            />
            <Text style={styles.gameTitle}>Reading{'\n'}with Boni</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.gameRow}>
          <TouchableOpacity 
            style={[styles.gameCard, styles.puzzleCard]}
            onPress={() => navigateToGame('puzzle')}
            accessibilityLabel="Buganda Puzzle"
            accessibilityHint="Solve Buganda cultural puzzles"
          >
            <Image 
              source={require('../assets/images/puzzle.png')} // Using a known existing image
              style={styles.gameIcon}
            />
            <Text style={styles.gameTitle}>Buganda{'\n'}Puzzle</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.gameCard, styles.exploreCard]}
            onPress={() => navigateToGame('explore')}
            accessibilityLabel="Explore"
            accessibilityHint="Explore more features"
          >
            <Image 
              source={require('../assets/images/explore.png')} // Using a known existing image
              style={styles.gameIcon}
            />
            <Text style={styles.gameTitle}>Explore</Text>
          </TouchableOpacity>
        </View>
      
      {/* Bottom navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navButton}>
          <Image 
            source={require('../assets/images/coin.png')} 
            style={[styles.navIcon, styles.activeNavIcon]}
          />
          <Text style={styles.navText}>Home</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.navButton}>
          <Image 
            source={require('../assets/images/coin.png')} 
            style={styles.navIcon}
          />
          <Text style={styles.navText}>Settings</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.navButton}>
          <Image 
            source={require('../assets/images/coin.png')} 
            style={styles.navIcon}
          />
          <Text style={styles.navText}>Profile</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#56B4FF',
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 8,
  },
  profileName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  levelBadge: {
    backgroundColor: '#FFD600',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  levelText: {
    fontWeight: 'bold',
    color: '#000',
  },
  mainBanner: {
    backgroundColor: '#4EACFE',
    borderRadius: 30,
    padding: 20,
    marginBottom: 16,
    height: 180,
    overflow: 'hidden',
    position: 'relative',
  },
  bannerText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
    width: '50%',
  },
  charactersContainer: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: '60%',
    height: '100%',
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
  },
  dinoImage: {
    width: 120,
    height: 150,
    position: 'absolute',
    right: 5,
    bottom: -5,
  },
  gameGrid: {
    flex: 1,
    marginBottom: 70, // Space for bottom nav
  },
  gameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  gameCard: {
    width: '48%',
    height: 120,
    borderRadius: 20,
    padding: 16,
    justifyContent: 'flex-end',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  wordsCard: {
    backgroundColor: '#9DE7A9', // Match the header color of Word Game
  },
  readingCard: {
    backgroundColor: '#F5E9BE', // Match the header color of Reading Game
  },
  puzzleCard: {
    backgroundColor: '#FFF9E6', // Match the header color of Puzzle Game
  },
  exploreCard: {
    backgroundColor: '#D0D0D0', // Gray color for Explore
  },
  gameIcon: {
    width: 50,
    height: 50,
    marginBottom: 8,
  },
  gameTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#000',
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 30,
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  navButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  navIcon: {
    width: 24,
    height: 24,
    opacity: 0.5,
  },
  activeNavIcon: {
    opacity: 1,
    tintColor: '#56B4FF',
  },
  navText: {
    fontSize: 12,
    marginTop: 4,
    color: '#333',
  },
});

export default HomeScreen;