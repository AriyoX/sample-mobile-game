import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView, Platform, StatusBar as RNStatusBar } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

const HomeScreen = () => {
  const router = useRouter();

  // Fixed typing issue by using specific route paths
  const navigateToGame = (game: 'word' | 'reading' | 'puzzle' | 'explore' | 'luganda' | 'counting') => {
    router.push(`/${game}`); // No more (tabs) prefix
  };
  
  // Add navigation to achievements screen
  const navigateToScreen = (screen: 'achievements') => {
    router.push(`/${screen}`);
  };
  
  // For index tab, we need a separate method
  const navigateToHome = () => {
    router.push('/');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <Stack.Screen 
        options={{
          headerShown: false,
        }}
      />
      
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        {/* Header with profile and level */}
        <View style={styles.header}>
          <View style={styles.profileSection}>
            <Image 
              source={require('../assets/images/avatar.png')}
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
              source={require('../assets/images/blocks.png')}
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
              source={require('../assets/images/puzzle.png')}
              style={styles.gameIcon}
            />
            <Text style={styles.gameTitle}>Buganda{'\n'}Puzzle</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.gameCard, styles.lugandaCard]}
            onPress={() => navigateToGame('luganda')}
            accessibilityLabel="Luganda Learning"
            accessibilityHint="Learn Luganda language vocabulary"
          >
            <Image 
              source={require('../assets/images/blocks.png')}
              style={styles.gameIcon}
            />
            <Text style={styles.gameTitle}>Luganda{'\n'}Learning</Text>
          </TouchableOpacity>
        </View>

        {/* Add new row for counting game */}
        <View style={styles.gameRow}>
          <TouchableOpacity 
            style={[styles.gameCard, styles.countingCard]}
            onPress={() => navigateToGame('counting')}
            accessibilityLabel="Luganda Counting"
            accessibilityHint="Learn to count in Luganda language"
          >
            <Image 
              source={require('../assets/images/blocks.png')}
              style={styles.gameIcon}
            />
            <Text style={styles.gameTitle}>Luganda{'\n'}Counting</Text>
          </TouchableOpacity>

          {/* Empty placeholder or future game */}
          <View style={{width: '48%'}} />
        </View>
        
        {/* Add padding at bottom to prevent navigation from covering content */}
        <View style={styles.bottomPadding} />
      </ScrollView>
      
      {/* Bottom navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity 
          style={styles.navButton}
          onPress={navigateToHome}
        >
          <Image 
            source={require('../assets/images/coin.png')} 
            style={[styles.navIcon, styles.activeNavIcon]}
          />
          <Text style={styles.navText}>Home</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.navButton}
          onPress={() => navigateToScreen('achievements')}
          accessibilityLabel="Achievements screen"
          accessibilityHint="View your earned achievements and progress"
        >
          <Image 
            source={require('../assets/images/coin.png')} 
            style={styles.navIcon}
          />
          <Text style={styles.navText}>Achievements</Text>
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
  safeArea: {
    flex: 1,
    backgroundColor: '#56B4FF',
    // Ensure we have padding for the status bar on Android
    paddingTop: Platform.OS === 'android' ? RNStatusBar.currentHeight : 0,
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 0, // We have separate padding at bottom
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
    padding: 24,  // Increased padding
    marginBottom: 20,  // Increased margin
    height: 220,  // Increased from 180
    overflow: 'hidden',
    position: 'relative',
  },
  bannerText: {
    fontSize: 28,  // Increased from 24
    fontWeight: 'bold',
    color: '#FFF',
    width: '50%',
  },
  charactersContainer: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: '65%',  // Slightly increased
    height: '100%',
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
  },
  dinoImage: {
    width: 140,  // Increased from 120
    height: 175,  // Increased from 150
    position: 'absolute',
    right: 10,
    bottom: -5,
  },
  gameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  gameCard: {
    width: '48%',
    height: 160, // Increased from 120
    borderRadius: 20,
    padding: 20, // Increased from 16
    justifyContent: 'flex-end',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  wordsCard: {
    backgroundColor: '#9DE7A9',
  },
  readingCard: {
    backgroundColor: '#F5E9BE',
  },
  puzzleCard: {
    backgroundColor: '#FFF9E6',
  },
  exploreCard: {
    backgroundColor: '#D0D0D0',
  },
  lugandaCard: {
    backgroundColor: '#E3F2FD',
  },
  countingCard: {
    backgroundColor: '#FFCDD2',
  },
  gameIcon: {
    width: 65, // Increased from 50
    height: 65, // Increased from 50
    marginBottom: 10, // Increased from 8
  },
  gameTitle: {
    fontSize: 16, // Increased from 14
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#000',
  },
  // Add bottom padding to prevent content from being covered by navigation
  bottomPadding: {
    height: 90, // Enough space for bottom nav plus extra padding
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