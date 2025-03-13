import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  ScrollView, 
  Image, 
  TouchableOpacity, 
  Platform, 
  StatusBar as RNStatusBar,
  Animated,
  Dimensions
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

// Define achievement data structure
interface Achievement {
  id: string;
  title: string;
  description: string;
  image: any;
  category: 'word' | 'reading' | 'puzzle' | 'luganda';
  isUnlocked: boolean;
  progress?: number; // 0-100 for progress-based achievements
  date?: string;     // Date when achievement was earned
}

const AchievementsScreen = () => {
  const router = useRouter();
  const [achievements, setAchievements] = useState<Achievement[]>([
    // Word Game Achievements
    {
      id: 'word_1',
      title: 'Word Wizard! 🔤',
      description: 'Complete 5 word games without mistakes',
      image: require('../assets/images/coin.png'),
      category: 'word',
      isUnlocked: true,
      date: '2025-03-10'
    },
    {
      id: 'word_2',
      title: 'Super Speller! 📚',
      description: 'Learn 20 new words',
      image: require('../assets/images/coin.png'),
      category: 'word',
      isUnlocked: true,
      date: '2025-03-12'
    },
    {
      id: 'word_3',
      title: 'Word Champion! 🏆',
      description: 'Earn a perfect score in 3 games in a row',
      image: require('../assets/images/coin.png'),
      category: 'word',
      isUnlocked: false,
      progress: 67 // 2/3 complete
    },
    
    // Reading Achievements
    {
      id: 'reading_1',
      title: 'First Story! 📖',
      description: 'Read your first story with Boni',
      image: require('../assets/images/book.png'),
      category: 'reading',
      isUnlocked: true,
      date: '2025-03-08'
    },
    {
      id: 'reading_2',
      title: 'Bookworm! 🐛',
      description: 'Read 5 complete stories',
      image: require('../assets/images/book.png'),
      category: 'reading',
      isUnlocked: false,
      progress: 40 // 2/5 complete
    },
    {
      id: 'reading_3',
      title: 'Speed Reader! ⚡',
      description: 'Finish a story on fast speed',
      image: require('../assets/images/book.png'),
      category: 'reading',
      isUnlocked: false
    },
    
    // Puzzle Game Achievements
    {
      id: 'puzzle_1',
      title: 'Puzzle Pro! 🧩',
      description: 'Complete your first puzzle',
      image: require('../assets/images/puzzle.png'),
      category: 'puzzle',
      isUnlocked: true,
      date: '2025-03-09'
    },
    {
      id: 'puzzle_2',
      title: 'Quick Fingers! 👐',
      description: 'Complete a puzzle in under 30 seconds',
      image: require('../assets/images/puzzle.png'),
      category: 'puzzle',
      isUnlocked: false
    },
    {
      id: 'puzzle_3',
      title: 'Explorer! 🗺️',
      description: 'Complete all Buganda cultural puzzles',
      image: require('../assets/images/puzzle.png'),
      category: 'puzzle',
      isUnlocked: false,
      progress: 33 // 1/3 complete
    },
    
    // Luganda Learning Achievements
    {
      id: 'luganda_1',
      title: 'First Words! 🎯',
      description: 'Complete your first Luganda lesson',
      image: require('../assets/images/blocks.png'),
      category: 'luganda',
      isUnlocked: true,
      date: '2025-03-11'
    },
    {
      id: 'luganda_2',
      title: 'Growing Vocab! 🌱',
      description: 'Learn 10 Luganda words',
      image: require('../assets/images/blocks.png'),
      category: 'luganda',
      isUnlocked: false,
      progress: 70 // 7/10 complete
    },
    {
      id: 'luganda_3',
      title: 'Star Student! 🌟',
      description: 'Score 100% in 3 Luganda quizzes',
      image: require('../assets/images/blocks.png'),
      category: 'luganda',
      isUnlocked: false
    },
  ]);
  
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [shineAnim] = useState(new Animated.Value(0));
  const [bounceAnim] = useState(new Animated.Value(1));
  const [rotateAnim] = useState(new Animated.Value(0));
  
  // Animate the shine effect for unlocked achievements
  useEffect(() => {
    // Shine animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(shineAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(shineAnim, {
          toValue: 0,
          duration: 1500,
          useNativeDriver: true,
        })
      ])
    ).start();
    
    // Bounce animation for stats
    Animated.loop(
      Animated.sequence([
        Animated.timing(bounceAnim, {
          toValue: 1.05,
          duration: 500,
          useNativeDriver: true
        }),
        Animated.timing(bounceAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true
        })
      ])
    ).start();
    
    // Rotation animation for star
    Animated.loop(
      Animated.sequence([
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true
        }),
        Animated.timing(rotateAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true
        })
      ])
    ).start();
  }, []);
  
  // Filter achievements by category
  const filteredAchievements = selectedCategory === 'all' 
    ? achievements 
    : achievements.filter(a => a.category === selectedCategory);
  
  // Calculate total stats
  const totalAchievements = achievements.length;
  const unlockedAchievements = achievements.filter(a => a.isUnlocked).length;
  const completionPercentage = Math.round((unlockedAchievements / totalAchievements) * 100);
  
  // Shine animation interpolation
  const shinePosition = shineAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['-150%', '150%']
  });
  
  // Rotate animation interpolation
  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg']
  });
  
  // Navigate back to home
  const goBack = () => {
    router.push("/");
  };

  const getAchievementColor = (category: string) => {
    switch(category) {
      case 'word': return { backgroundColor: 'rgba(157, 231, 169, 0.2)', borderColor: '#9DE7A9' };
      case 'reading': return { backgroundColor: 'rgba(245, 233, 190, 0.2)', borderColor: '#F5E9BE' };
      case 'puzzle': return { backgroundColor: 'rgba(255, 249, 230, 0.2)', borderColor: '#FFF9E6' };
      case 'luganda': return { backgroundColor: 'rgba(227, 242, 253, 0.2)', borderColor: '#E3F2FD' };
      default: return { backgroundColor: '#FFFFFF', borderColor: '#EEEEEE' };
    }
  };
  
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <Stack.Screen 
        options={{
          headerShown: false,
        }}
      />
      
      <View style={styles.topBar}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={goBack}
          activeOpacity={0.7}
          accessibilityLabel="Go back to home"
          accessibilityHint="Returns to the home screen"
        >
          <Image 
            source={require('../assets/images/coin.png')} // Replace with a back arrow icon
            style={styles.backIcon} 
          />
          <Text style={styles.backText}>Home</Text>
        </TouchableOpacity>
      </View>
      
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        {/* Fun Header with Character */}
        <View style={styles.funHeader}>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Your Awesome{"\n"}Achievements!</Text>
            <Animated.View 
              style={[
                styles.statsBadge, 
                { transform: [{ scale: bounceAnim }] }
              ]}
            >
              <Text style={styles.statsNumber}>{unlockedAchievements}</Text>
              <Text style={styles.statsText}>Earned</Text>
            </Animated.View>
          </View>
          <Image 
            source={require('../assets/images/boni-character.png')} 
            style={styles.characterImage}
          />
        </View>
        
        {/* Banner with progress */}
        <View style={styles.progressBanner}>
          <View style={styles.progressTextContainer}>
            <Text style={styles.progressTitle}>Your Progress</Text>
            <Text style={styles.progressPercentage}>{completionPercentage}%</Text>
          </View>
          
          <View style={styles.starsContainer}>
            {[...Array(Math.min(5, Math.ceil(completionPercentage/20)))].map((_, i) => (
              <Animated.Image 
                key={i} 
                source={require('../assets/images/coin.png')} // Replace with star image
                style={[
                  styles.starIcon,
                  i === unlockedAchievements % 5 ? 
                  { transform: [{ rotate: spin }] } : null
                ]} 
              />
            ))}
            {[...Array(5 - Math.min(5, Math.ceil(completionPercentage/20)))].map((_, i) => (
              <Image 
                key={i + 5} 
                source={require('../assets/images/coin.png')} // Replace with empty star
                style={[styles.starIcon, styles.emptyStar]} 
              />
            ))}
          </View>
        </View>
        
        {/* Category filters */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesContainer}
        >
          <TouchableOpacity 
            onPress={() => setSelectedCategory('all')}
            style={[
              styles.categoryButton,
              selectedCategory === 'all' && styles.selectedCategoryButton
            ]}
          >
            <Text style={[
              styles.categoryText,
              selectedCategory === 'all' && styles.selectedCategoryText
            ]}>All Badges</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            onPress={() => setSelectedCategory('word')}
            style={[
              styles.categoryButton,
              styles.wordCategory,
              selectedCategory === 'word' && styles.selectedCategoryButton
            ]}
          >
            <Text style={[
              styles.categoryText,
              selectedCategory === 'word' && styles.selectedCategoryText
            ]}>Word Game</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            onPress={() => setSelectedCategory('reading')}
            style={[
              styles.categoryButton,
              styles.readingCategory,
              selectedCategory === 'reading' && styles.selectedCategoryButton
            ]}
          >
            <Text style={[
              styles.categoryText,
              selectedCategory === 'reading' && styles.selectedCategoryText
            ]}>Reading</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            onPress={() => setSelectedCategory('puzzle')}
            style={[
              styles.categoryButton,
              styles.puzzleCategory,
              selectedCategory === 'puzzle' && styles.selectedCategoryButton
            ]}
          >
            <Text style={[
              styles.categoryText,
              selectedCategory === 'puzzle' && styles.selectedCategoryText
            ]}>Puzzle</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            onPress={() => setSelectedCategory('luganda')}
            style={[
              styles.categoryButton,
              styles.lugandaCategory,
              selectedCategory === 'luganda' && styles.selectedCategoryButton
            ]}
          >
            <Text style={[
              styles.categoryText,
              selectedCategory === 'luganda' && styles.selectedCategoryText
            ]}>Luganda</Text>
          </TouchableOpacity>
        </ScrollView>
        
        {/* Achievement grid */}
        <View style={styles.achievementsContainer}>
          {filteredAchievements.map((achievement) => {
            const colorStyles = getAchievementColor(achievement.category);
            
            return (
              <View 
                key={achievement.id} 
                style={[
                  styles.achievementCard,
                  colorStyles,
                  !achievement.isUnlocked && styles.lockedAchievement
                ]}
              >
                {achievement.isUnlocked && (
                  <Animated.View 
                    style={[
                      styles.shine,
                      { transform: [{ translateX: shinePosition }] }
                    ]} 
                  />
                )}
                <View style={[styles.achievementIconContainer, { borderColor: colorStyles.borderColor }]}>
                  <Image source={achievement.image} style={styles.achievementIcon} />
                  {achievement.isUnlocked && (
                    <Image 
                      source={require('../assets/images/coin.png')} 
                      style={styles.checkmarkIcon} 
                    />
                  )}
                  {!achievement.isUnlocked && (
                    <View style={styles.lockOverlay}>
                      <Image 
                        source={require('../assets/images/coin.png')} 
                        style={styles.lockIcon} 
                      />
                    </View>
                  )}
                </View>
                
                <View style={styles.achievementDetails}>
                  <Text style={styles.achievementTitle}>{achievement.title}</Text>
                  <Text style={styles.achievementDescription}>{achievement.description}</Text>
                  
                  {achievement.isUnlocked ? (
                    <View style={styles.achievementDateContainer}>
                      <Image 
                        source={require('../assets/images/coin.png')} 
                        style={styles.calendarIcon} 
                      />
                      <Text style={styles.achievementDate}>
                        Earned on {achievement.date ? new Date(achievement.date).toLocaleDateString() : 'Unknown'}
                      </Text>
                    </View>
                  ) : achievement.progress ? (
                    <View style={styles.progressContainer}>
                      <View style={styles.progressTrack}>
                        <View 
                          style={[
                            styles.progressFill,
                            { width: `${achievement.progress}%` }
                          ]} 
                        />
                      </View>
                      <Text style={styles.progressText}>{achievement.progress}%</Text>
                    </View>
                  ) : (
                    <Text style={styles.lockedText}>Keep playing to unlock this badge!</Text>
                  )}
                </View>
              </View>
            );
          })}
        </View>
        
        {/* Add padding at bottom to prevent navigation from covering content */}
        <View style={styles.bottomPadding} />
      </ScrollView>
    </SafeAreaView>
  );
};

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F9F9F9',
    paddingTop: Platform.OS === 'android' ? RNStatusBar.currentHeight : 0,
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  topBar: {
    paddingTop: 10,
    paddingHorizontal: 16,
    paddingBottom: 5,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#F0F0F0',
    alignSelf: 'flex-start',
  },
  backIcon: {
    width: 20,
    height: 20,
    marginRight: 6,
    tintColor: '#333',
  },
  backText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  funHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#4EACFE',
    borderRadius: 20,
    padding: 20,
    marginBottom: 15,
    overflow: 'hidden',
  },
  headerContent: {
    flex: 2,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 15,
  },
  statsBadge: {
    backgroundColor: '#FFD600',
    borderRadius: 16,
    padding: 10,
    alignItems: 'center',
    alignSelf: 'flex-start',
  },
  statsNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  statsText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    textTransform: 'uppercase',
  },
  characterImage: {
    flex: 1,
    height: 130,
    resizeMode: 'contain',
  },
  progressBanner: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 15,
    marginBottom: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  progressTextContainer: {
    flex: 1,
  },
  progressTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  progressPercentage: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#56B4FF',
  },
  starsContainer: {
    flexDirection: 'row',
  },
  starIcon: {
    width: 26,
    height: 26,
    marginHorizontal: 2,
    tintColor: '#FFD600',
  },
  emptyStar: {
    tintColor: '#E0E0E0',
  },
  categoriesContainer: {
    paddingBottom: 15,
  },
  categoryButton: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 20,
    marginRight: 10,
    backgroundColor: '#F0F0F0',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  selectedCategoryButton: {
    backgroundColor: '#56B4FF',
    borderColor: '#56B4FF',
  },
  wordCategory: {
    backgroundColor: 'rgba(157, 231, 169, 0.3)',
    borderColor: '#9DE7A9',
  },
  readingCategory: {
    backgroundColor: 'rgba(245, 233, 190, 0.3)',
    borderColor: '#F5E9BE',
  },
  puzzleCategory: {
    backgroundColor: 'rgba(255, 249, 230, 0.3)',
    borderColor: '#FFF9E6',
  },
  lugandaCategory: {
    backgroundColor: 'rgba(227, 242, 253, 0.3)',
    borderColor: '#E3F2FD',
  },
  categoryText: {
    fontWeight: '600',
    fontSize: 15,
    color: '#555',
  },
  selectedCategoryText: {
    color: '#FFF',
  },
  achievementsContainer: {
    marginTop: 10,
  },
  achievementCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 2,
    borderColor: '#EEEEEE',
  },
  lockedAchievement: {
    opacity: 0.75,
    backgroundColor: '#F8F8F8',
  },
  shine: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '30%',
    height: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    transform: [{ skewX: '-20deg' }],
  },
  achievementIconContainer: {
    width: 65,
    height: 65,
    borderRadius: 32.5,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    position: 'relative',
    borderWidth: 2,
  },
  achievementIcon: {
    width: 40,
    height: 40,
  },
  checkmarkIcon: {
    position: 'absolute',
    bottom: -6,
    right: -6,
    width: 24,
    height: 24,
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    tintColor: '#FFFFFF',
  },
  lockOverlay: {
    position: 'absolute',
    bottom: -6,
    right: -6,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  lockIcon: {
    width: 14,
    height: 14,
    tintColor: '#FFFFFF',
  },
  achievementDetails: {
    flex: 1,
  },
  achievementTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  achievementDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  achievementDateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  calendarIcon: {
    width: 16,
    height: 16,
    marginRight: 6,
    tintColor: '#56B4FF',
  },
  achievementDate: {
    fontSize: 12,
    color: '#56B4FF',
    fontWeight: '600',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  progressTrack: {
    flex: 1,
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    overflow: 'hidden',
    marginRight: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FFD600',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: '#FFD600',
    fontWeight: '600',
  },
  lockedText: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
  },
  bottomPadding: {
    height: 90,
  },
});

export default AchievementsScreen;