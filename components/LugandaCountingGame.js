import React, { useState, useEffect, useRef } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  Image, 
  TouchableOpacity, 
  Animated, 
  Dimensions,
  SafeAreaView,
  Alert
} from 'react-native';
import { Audio } from 'expo-av';
import { StatusBar } from 'expo-status-bar';
import * as ScreenOrientation from 'expo-screen-orientation'; // Add screen orientation import

const { width, height } = Dimensions.get('window');

// Luganda numbers 1-10 with their pronunciations
const lugandaNumbers = [
  { number: 1, luganda: 'Emu', audio: 'correct.mp3' },
  { number: 2, luganda: 'Bbiri', audio: 'correct.mp3' },
  { number: 3, luganda: 'Ssatu', audio: 'correct.mp3' },
  { number: 4, luganda: 'Nnya', audio: 'correct.mp3' },
  { number: 5, luganda: 'Ttaano', audio: 'correct.mp3' },
  { number: 6, luganda: 'Mukaaga', audio: 'correct.mp3' },
  { number: 7, luganda: 'Musanvu', audio: 'correct.mp3' },
  { number: 8, luganda: 'Munaana', audio: 'correct.mp3' },
  { number: 9, luganda: 'Mwenda', audio: 'correct.mp3' },
  { number: 10, luganda: 'Kkumi', audio: 'correct.mp3' },
];

// Ugandan cultural items to count
const culturalItems = [
  { name: 'Matoke', image: 'coin.png' },
  { name: 'Engoma', image: 'coin.png' },
  { name: 'Ensiimbi', image: 'coin.png' },
  { name: 'Amatooke', image: 'coin.png' },
  { name: 'Ekikomera', image: 'coin.png' },
];

const LugandaCountingGame = () => {
  const [currentLevel, setCurrentLevel] = useState(1);
  const [currentItem, setCurrentItem] = useState(culturalItems[0]);
  const [itemsToCount, setItemsToCount] = useState([]);
  const [selectedCount, setSelectedCount] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [score, setScore] = useState(0);
  const [sound, setSound] = useState(null);
  const [numberOptions, setNumberOptions] = useState([]); // Add this state to store options
  const [dimensions, setDimensions] = useState({ width, height });
  
  const bounceAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  // Add orientation locking
  useEffect(() => {
    // Lock to landscape orientation
    async function setLandscapeOrientation() {
      await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
    }
    
    setLandscapeOrientation();
    
    return () => {
      // Reset orientation when component unmounts
      ScreenOrientation.unlockAsync();
    };
  }, []);
  
  // Add listener for dimension changes
  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setDimensions(window);
    });
    
    return () => {
      subscription?.remove();
    };
  }, []);
  
  // Setup level when component mounts or level changes
  useEffect(() => {
    setupLevel();
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [currentLevel]);
  
  const setupLevel = () => {
    // Choose a random item from cultural items
    const randomItemIndex = Math.floor(Math.random() * culturalItems.length);
    const newItem = culturalItems[randomItemIndex];
    
    // Number of items to display (1-5 for early levels, 1-10 for later levels)
    const maxItems = currentLevel <= 5 ? 5 : 10;
    const itemCount = Math.max(1, Math.min(currentLevel, maxItems));
    
    // Generate the items to count
    const newItemsToCount = Array.from({ length: itemCount }, (_, i) => ({
      id: i,
      x: Math.random() * (width * 0.7),
      y: Math.random() * (height * 0.4),
      rotate: Math.random() * 360,
      scale: 0.8 + Math.random() * 0.4,
    }));
    
    // Generate number options here and store them in state
    const correctAnswer = itemCount;
    const options = [correctAnswer];
    
    // Generate all possible options that are within range
    const possibleOptions = [];
    for (let i = 1; i <= 10; i++) {
      if (i !== correctAnswer) {
        possibleOptions.push(i);
      }
    }
    
    // Randomly select 2 more options
    while (options.length < 3 && possibleOptions.length > 0) {
      const randomIndex = Math.floor(Math.random() * possibleOptions.length);
      options.push(possibleOptions[randomIndex]);
      possibleOptions.splice(randomIndex, 1);
    }
    
    // Shuffle the options
    options.sort(() => Math.random() - 0.5);
    
    setCurrentItem(newItem);
    setItemsToCount(newItemsToCount);
    setSelectedCount(null);
    setShowFeedback(false);
    setNumberOptions(options); // Store generated options
  };
  
  const playNumberSound = async (number) => {
    try {
      if (sound) {
        await sound.unloadAsync();
      }
      
      // In a real app, you'd have actual audio files
      // For this example, we'll just log which sound would play
      console.log(`Playing sound for: ${lugandaNumbers[number-1].luganda}`);
      
      const { sound: newSound } = await Audio.Sound.createAsync(
        require(`../assets/sounds/correct.mp3`)
      );
      setSound(newSound);
      await newSound.playAsync();
    } catch (error) {
      console.error('Error playing sound', error);
    }
  };
  
  // Modify the handleNumberPress function to allow retrying after incorrect answers
  const handleNumberPress = (number) => {
    setSelectedCount(number);
    playNumberSound(number);
    
    // Check if the answer is correct
    const isAnswerCorrect = number === itemsToCount.length;
    setIsCorrect(isAnswerCorrect);
    
    // Show feedback
    setShowFeedback(true);
    
    // Animate the feedback
    Animated.sequence([
      Animated.spring(bounceAnim, {
        toValue: 1.2,
        friction: 3,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.spring(bounceAnim, {
        toValue: 1,
        friction: 3,
        tension: 40,
        useNativeDriver: true,
      })
    ]).start();
    
    // If correct, add to score and prepare for next level
    if (isAnswerCorrect) {
      setScore(score + 10);
      
      // Rotate animation for correct answer
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }).start(() => {
        rotateAnim.setValue(0);
      });
      
      // Move to next level after a delay, but only if not at level 10
      setTimeout(() => {
        if (currentLevel < 10) {
          setCurrentLevel(prevLevel => prevLevel + 1);
        } else {
          // Game completed!
          Alert.alert(
            "Oyenze bulungi! (Well done!)",
            `Congratulations! You've completed all 10 levels with a score of ${score + 10}!`,
            [
              { 
                text: "Play Again", 
                onPress: () => {
                  setCurrentLevel(1);
                  setScore(0);
                } 
              }
            ]
          );
        }
      }, 1500);
    } else {
      // For incorrect answers, clear feedback after a short delay to allow another try
      setTimeout(() => {
        setShowFeedback(false);
        setSelectedCount(null);
      }, 1500);
    }
  };
  
  // Modify renderNumberOptions to use the stored options instead of generating new ones
  const renderNumberOptions = () => {
    return numberOptions.map(number => (
      <TouchableOpacity
        key={number}
        style={[
          styles.numberButton,
          selectedCount === number && (isCorrect ? styles.correctButton : styles.incorrectButton)
        ]}
        onPress={() => handleNumberPress(number)}
        disabled={showFeedback && isCorrect} // Only disable if showing correct feedback
      >
        <Text style={styles.numberText}>{number}</Text>
        <Text style={styles.lugandaText}>
          {number >= 1 && number <= lugandaNumbers.length ? lugandaNumbers[number-1].luganda : ""}
        </Text>
      </TouchableOpacity>
    ));
  };
  
  const renderItemsToCount = () => {
    return itemsToCount.map(item => (
      <Animated.Image
        key={item.id}
        source={require(`../assets/images/coin.png`)} // Replace with your item image `)}
        style={{
          width: 60,
          height: 60,
          position: 'absolute',
          left: item.x,
          top: item.y,
          transform: [
            { rotate: `${item.rotate}deg` },
            { scale: item.scale }
          ]
        }}
        resizeMode="contain"
      />
    ));
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="auto" />
      
      {/* Main content area - remove top bar to prevent content overflow */}
      <View style={styles.gameContent}>
        {/* Left section - Level and character */}
        <View style={styles.leftSection}>
          <View style={styles.levelContainer}>
            <Text style={styles.levelText}>Level {currentLevel}</Text>
          </View>
          
          <Image 
            source={require('../assets/images/bird.png')} 
            style={styles.characterImage}
            resizeMode="contain"
          />
          
          <View style={styles.scoreContainer}>
            <Text style={styles.scoreText}>Score: {score}</Text>
          </View>
        </View>
        
        {/* Center section - Items to count and prompt */}
        <View style={styles.centerSection}>
          {/* Question prompt */}
          <View style={styles.promptContainer}>
            <Text style={styles.promptText}>
              Balanga {currentItem.name} emeka?
            </Text>
            <Text style={styles.promptTextEnglish}>
              (How many {currentItem.name} do you see?)
            </Text>
          </View>
          
          {/* Items to count */}
          <View style={styles.itemsContainer}>
            {renderItemsToCount()}
          </View>
        </View>
        
        {/* Right section - Number options */}
        <View style={styles.rightSection}>
          <View style={styles.optionsContainer}>
            {renderNumberOptions()}
          </View>
        </View>
      </View>
      
      {/* Feedback animation */}
      {showFeedback && (
        <Animated.View 
          style={[
            styles.feedbackContainer,
            {
              transform: [
                { scale: bounceAnim },
                {
                  rotate: rotateAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0deg', '360deg']
                  })
                }
              ]
            }
          ]}
        >
          <Text style={[
            styles.feedbackText,
            isCorrect ? styles.correctText : styles.incorrectText
          ]}>
            {isCorrect ? 'Kirungi! (Correct!)' : 'Gezaako nate! (Try again!)'}
          </Text>
        </Animated.View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFECB3', // Warm yellow background
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 5,
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#5D3A00', // Dark brown
  },
  scoreContainer: {
    backgroundColor: '#FF9800', // Orange
    paddingHorizontal: 15,
    paddingVertical: 5,
    borderRadius: 20,
  },
  scoreText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  gameContent: {
    flex: 1,
    flexDirection: 'row',
    width: '100%',
    paddingHorizontal: 10,
  },
  leftSection: {
    width: '15%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
  },
  levelContainer: {
    backgroundColor: '#8BC34A', // Light green
    paddingHorizontal: 20,
    paddingVertical: 5,
    borderRadius: 20,
    marginBottom: 20,
  },
  levelText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  characterImage: {
    width: 80,
    height: 80,
  },
  centerSection: {
    width: '70%',
    alignItems: 'center',
  },
  promptContainer: {
    alignItems: 'center',
    marginBottom: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  promptText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#5D3A00', // Dark brown
    textAlign: 'center',
  },
  promptTextEnglish: {
    fontSize: 14,
    fontStyle: 'italic',
    color: '#5D3A00', // Dark brown
    opacity: 0.7,
    textAlign: 'center',
  },
  itemsContainer: {
    width: '100%',
    height: 200,
    position: 'relative',
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 15,
  },
  rightSection: {
    width: '15%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionsContainer: {
    alignItems: 'center',
    justifyContent: 'space-around',
    height: '80%',
  },
  numberButton: {
    width: 65,
    height: 65,
    borderRadius: 35,
    backgroundColor: '#F57C00', // Orange
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    marginVertical: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  correctButton: {
    backgroundColor: '#4CAF50', // Green
  },
  incorrectButton: {
    backgroundColor: '#F44336', // Red
  },
  numberText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  lugandaText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: 'white',
  },
  feedbackContainer: {
    position: 'absolute',
    top: '50%',
    alignSelf: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 30,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  feedbackText: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  correctText: {
    color: '#4CAF50', // Green
  },
  incorrectText: {
    color: '#F44336', // Red
  }
});

export default LugandaCountingGame;