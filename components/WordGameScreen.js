import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Image, Dimensions, Animated } from 'react-native';
import { Audio } from 'expo-av';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import * as ScreenOrientation from 'expo-screen-orientation'; // Add this import

// Get screen dimensions
const { width, height } = Dimensions.get('window');

const WordGameScreen = () => {
  // Keep all existing state variables and refs
  const [currentWord, setCurrentWord] = useState('KANZU');
  const [displayWord, setDisplayWord] = useState('K____');
  const [currentQuestion, setCurrentQuestion] = useState('Traditional attire in Buganda culture');
  const [letters, setLetters] = useState(['A', 'N', 'Z', 'U', 'B', 'L', 'R', 'T', 'S', 'M']);
  const [selectedLetters, setSelectedLetters] = useState([]);
  const [correctSound, setCorrectSound] = useState();
  const [wrongSound, setWrongSound] = useState();
  const [animatingLetter, setAnimatingLetter] = useState(null);
  
  // Animation values
  const letterScale = useState(new Animated.Value(1))[0];
  const bounceValue = useState(new Animated.Value(0))[0];
  
  // For letter flying animation
  const flyingLetterPosition = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;
  const flyingLetterOpacity = useRef(new Animated.Value(0)).current;
  const flyingLetterScale = useRef(new Animated.Value(1)).current;
  
  // References to measure positions
  const letterRefs = useRef({});
  const wordSlotRefs = useRef({});
  const containerRef = useRef(null);
  
  const router = useRouter();
  
  // Updated useEffect to lock screen orientation
  useEffect(() => {
    // Lock to landscape orientation
    async function setLandscapeOrientation() {
      await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
    }
    
    // Load sounds
    async function loadSounds() {
      const correctSoundObject = new Audio.Sound();
      const wrongSoundObject = new Audio.Sound();
      
      try {
        await correctSoundObject.loadAsync(require('@/assets/sounds/correct.mp3'));
        await wrongSoundObject.loadAsync(require('@/assets/sounds/wrong.mp3'));
        
        setCorrectSound(correctSoundObject);
        setWrongSound(wrongSoundObject);
      } catch (error) {
        console.error('Error loading sounds', error);
      }
    }
    
    setLandscapeOrientation();
    loadSounds();
    
    wordSlotRefs.current[0] = wordSlotRefs.current[0] || null;
    
    return () => {
      // Reset orientation when component unmounts
      ScreenOrientation.unlockAsync();
      
      if (correctSound) correctSound.unloadAsync();
      if (wrongSound) wrongSound.unloadAsync();
    };
  }, []);
  
  // Keeping all the existing functionality for animations
  const animateLetterToWord = (letter, letterIndex, destinationIndex) => {
    // All existing animation logic kept intact
    const letterRef = letterRefs.current[letterIndex];
    const wordRef = wordSlotRefs.current[destinationIndex];
    
    if (!letterRef || !wordRef) return;
    
    letterRef.measureLayout(
      containerRef.current,
      (letterX, letterY, letterWidth, letterHeight) => {
        wordRef.measureLayout(
          containerRef.current,
          (wordX, wordY, wordWidth, wordHeight) => {
            setAnimatingLetter({ 
              letter, 
              index: destinationIndex,
              startX: letterX,
              startY: letterY,
              endX: wordX,
              endY: wordY,
              width: letterWidth,
              height: letterHeight,
              destWidth: wordWidth,
              destHeight: wordHeight
            });
            
            flyingLetterOpacity.setValue(1);
            flyingLetterPosition.setValue({ x: 0, y: 0 });
            
            Animated.parallel([
              Animated.timing(flyingLetterPosition.x, {
                toValue: wordX - letterX + (wordWidth - letterWidth) / 2,
                duration: 600,
                useNativeDriver: true,
              }),
              Animated.timing(flyingLetterPosition.y, {
                toValue: wordY - letterY + (wordHeight - letterHeight) / 2,
                duration: 600,
                useNativeDriver: true,
              }),
              Animated.sequence([
                Animated.timing(flyingLetterScale, {
                  toValue: 1.2,
                  duration: 300,
                  useNativeDriver: true,
                }),
                Animated.timing(flyingLetterScale, {
                  toValue: 1,
                  duration: 300,
                  useNativeDriver: true,
                }),
              ])
            ]).start(() => {
              flyingLetterOpacity.setValue(0);
              setAnimatingLetter(null);
              
              updateDisplayWord(letter);
            });
          },
          () => console.error('Failed to measure word slot')
        );
      },
      () => console.error('Failed to measure letter')
    );
  };
  
  const updateDisplayWord = (letter) => {
    // Existing logic kept intact
    let newDisplay = '';
    for (let i = 0; i < currentWord.length; i++) {
      if (currentWord[i] === letter || displayWord[i] !== '_') {
        newDisplay += currentWord[i];
      } else {
        newDisplay += '_';
      }
    }
    
    setDisplayWord(newDisplay);
    
    if (!newDisplay.includes('_')) {
      Animated.spring(bounceValue, {
        toValue: 1,
        friction: 3,
        tension: 40,
        useNativeDriver: true,
      }).start(() => {
        setTimeout(() => {
          bounceValue.setValue(0);
        }, 1500);
      });
    }
  };

  const handleLetterPress = (letter, letterIndex) => {
    // Existing logic kept intact
    Animated.sequence([
      Animated.timing(letterScale, {
        toValue: 1.2,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(letterScale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      })
    ]).start();
    
    if (currentWord.includes(letter) && !selectedLetters.includes(letter)) {
      if (correctSound) {
        correctSound.replayAsync();
      }
      
      const newSelectedLetters = [...selectedLetters, letter];
      setSelectedLetters(newSelectedLetters);
      
      const positions = [];
      for (let i = 0; i < currentWord.length; i++) {
        if (currentWord[i] === letter && displayWord[i] === '_') {
          positions.push(i);
        }
      }
      
      if (positions.length > 0) {
        animateLetterToWord(letter, letterIndex, positions[0]);
      }
    } else {
      if (wrongSound) {
        wrongSound.replayAsync();
      }
    }
  };
  
  // Modified layout for landscape orientation
  return (
    <View ref={containerRef} style={styles.container}>
      <StatusBar style="auto" />
      
      {/* Top bar with coin and question */}
      <View style={styles.topBar}>
        {/* Question text */}
        <View style={styles.questionContainer}>
          <Text style={styles.questionText}>{currentQuestion}</Text>
        </View>
        
        {/* Coin */}
        <View style={styles.coinContainer}>
          <Image 
            source={require('@/assets/images/coin.png')} 
            style={styles.coin}
            resizeMode="contain"
          />
        </View>
      </View>
      
      {/* Main content area */}
      <View style={styles.gameContent}>
        {/* Left character */}
        <View style={styles.leftCharacter}>
          <Image 
            source={require('@/assets/images/bird.png')} 
            style={styles.character}
            resizeMode="contain"
          />
        </View>
        
        {/* Center game area */}
        <View style={styles.centerArea}>
          {/* Word to guess */}
          <Animated.View 
            style={[
              styles.wordContainer,
              { 
                transform: [
                  { 
                    scale: bounceValue.interpolate({
                      inputRange: [0, 0.5, 1],
                      outputRange: [1, 1.2, 1]
                    })
                  }
                ] 
              }
            ]}
          >
            {/* First letter */}
            <View 
              style={styles.letterSlotFirst}
              ref={ref => wordSlotRefs.current[0] = ref}
            >
              <Text style={styles.wordText}>{displayWord[0]}</Text>
            </View>
            
            {/* Remaining letters */}
            {displayWord.slice(1).split('').map((char, index) => (
              <View 
                key={index} 
                ref={ref => wordSlotRefs.current[index + 1] = ref}
                style={styles.letterSlot}
              >
                <Text style={styles.wordText}>{char !== '_' ? char : ''}</Text>
                {char === '_' && <View style={styles.dash} />}
              </View>
            ))}
          </Animated.View>
          
          {/* Letter choices */}
          <View style={styles.lettersContainer}>
            {letters.map((letter, index) => (
              <TouchableOpacity 
                key={index}
                ref={ref => letterRefs.current[index] = ref}
                style={[
                  styles.letterCircle,
                  selectedLetters.includes(letter) && styles.letterSelected
                ]}
                onPress={() => handleLetterPress(letter, index)}
                disabled={selectedLetters.includes(letter)}
              >
                <Animated.Text 
                  style={[
                    styles.letterText,
                    { transform: [{ scale: letterScale }] }
                  ]}
                >
                  {letter}
                </Animated.Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        
        {/* Right hint button */}
        <View style={styles.rightControls}>
          <TouchableOpacity style={styles.hintButton}>
            <Image 
              source={require('@/assets/images/house.png')} 
              style={styles.hintImage}
              resizeMode="contain"
            />
          </TouchableOpacity>
        </View>
      </View>
      
      {/* Flying letter animation */}
      {animatingLetter && (
        <Animated.View
          style={[
            styles.flyingLetter,
            {
              left: animatingLetter.startX,
              top: animatingLetter.startY,
              width: animatingLetter.width,
              height: animatingLetter.height,
              transform: [
                { translateX: flyingLetterPosition.x },
                { translateY: flyingLetterPosition.y },
                { scale: flyingLetterScale }
              ],
              opacity: flyingLetterOpacity,
            }
          ]}
        >
          <Text style={styles.flyingLetterText}>{animatingLetter.letter}</Text>
        </Animated.View>
      )}
    </View>
  );
};

// Updated styles for landscape orientation
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#9DE7A9', // Light green background
    padding: 10,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 5,
  },
  coinContainer: {
    marginLeft: 'auto',
  },
  coin: {
    width: 40,
    height: 40,
  },
  questionContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    maxWidth: '70%',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  questionText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#5D3A00',
    textAlign: 'center',
  },
  gameContent: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  leftCharacter: {
    width: '15%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerArea: {
    width: '70%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rightControls: {
    width: '15%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  lettersContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    width: '100%',
    marginTop: 20,
  },
  letterCircle: {
    width: 55,
    height: 55,
    borderRadius: 28,
    backgroundColor: '#FF6B95', // Pink color
    margin: 8,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  letterSelected: {
    backgroundColor: '#ccc', // Grayed out when selected
    opacity: 0.7,
  },
  letterText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
  },
  wordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  wordText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#5D3A00', // Dark brown
  },
  letterSlotFirst: {
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 5,
  },
  letterSlot: {
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 5,
    position: 'relative',
  },
  dash: {
    position: 'absolute',
    bottom: 0,
    width: 40,
    height: 5,
    backgroundColor: '#5D3A00', // Dark brown
    borderRadius: 2,
  },
  character: {
    width: 80,
    height: 80,
  },
  hintButton: {
    width: 70,
    height: 70,
    backgroundColor: 'white',
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  hintImage: {
    width: 50,
    height: 50,
  },
  flyingLetter: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
  flyingLetterText: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#FF6B95',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
});

export default WordGameScreen;