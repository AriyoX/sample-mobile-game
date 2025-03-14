import React, { useState, useEffect, useRef } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  Image, 
  TouchableOpacity, 
  Animated, 
  Dimensions,
  SafeAreaView
} from 'react-native';
import { Audio } from 'expo-av';
import { StatusBar } from 'expo-status-bar';

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
  
  const bounceAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  
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
    
    setCurrentItem(newItem);
    setItemsToCount(newItemsToCount);
    setSelectedCount(null);
    setShowFeedback(false);
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
      
      // Move to next level after a delay
      setTimeout(() => {
        setCurrentLevel(prevLevel => prevLevel + 1);
      }, 1500);
    }
  };
  
  // Alternative implementation for generating options
  const renderNumberOptions = () => {
    const correctAnswer = itemsToCount.length;
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
    
    return options.map(number => (
      <TouchableOpacity
        key={number}
        style={[
          styles.numberButton,
          selectedCount === number && (isCorrect ? styles.correctButton : styles.incorrectButton)
        ]}
        onPress={() => handleNumberPress(number)}
        disabled={showFeedback}
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
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerText}>Balanga - Counting Game</Text>
        <View style={styles.scoreContainer}>
          <Text style={styles.scoreText}>Score: {score}</Text>
        </View>
      </View>
      
      {/* Level indicator */}
      <View style={styles.levelContainer}>
        <Text style={styles.levelText}>Level {currentLevel}</Text>
      </View>
      
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
      
      {/* Number options */}
      <View style={styles.optionsContainer}>
        {renderNumberOptions()}
      </View>
      
      
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFECB3', // Warm yellow background
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 20,
    paddingTop: 10,
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
  levelContainer: {
    backgroundColor: '#8BC34A', // Light green
    paddingHorizontal: 20,
    paddingVertical: 5,
    borderRadius: 20,
    marginTop: 10,
  },
  levelText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  promptContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  promptText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#5D3A00', // Dark brown
    textAlign: 'center',
  },
  promptTextEnglish: {
    fontSize: 16,
    fontStyle: 'italic',
    color: '#5D3A00', // Dark brown
    opacity: 0.7,
    textAlign: 'center',
  },
  itemsContainer: {
    width: '100%',
    height: height * 0.4,
    position: 'relative',
  },
  countItem: {
    width: 60,
    height: 60,
    position: 'absolute',
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
  },
  optionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    width: '100%',
    marginBottom: 20,
  },
  numberButton: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#F57C00', // Orange
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
  },
  correctButton: {
    backgroundColor: '#4CAF50', // Green
  },
  incorrectButton: {
    backgroundColor: '#F44336', // Red
  },
  numberText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: 'white',
  },
  lugandaText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
  characterContainer: {
    position: 'absolute',
    bottom: 10,
    right: 10,
  },
  characterImage: {
    width: 100,
    height: 120,
  },
});

export default LugandaCountingGame;