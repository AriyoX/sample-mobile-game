import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Image, Dimensions, Animated } from 'react-native';
import { Audio } from 'expo-av';
import { StatusBar } from 'expo-status-bar';

const { width, height } = Dimensions.get('window');

const WordGameScreen = () => {
  const [currentWord, setCurrentWord] = useState('TREE');
  const [displayWord, setDisplayWord] = useState('T___');
  const [letters, setLetters] = useState(['A', 'E', 'B', 'L', 'R']);
  const [selectedLetters, setSelectedLetters] = useState([]);
  const [correctSound, setCorrectSound] = useState();
  const [wrongSound, setWrongSound] = useState();
  
  // Animation values
  const letterScale = useState(new Animated.Value(1))[0];
  const bounceValue = useState(new Animated.Value(0))[0];
  
  useEffect(() => {
    // Load sounds
    async function loadSounds() {
      const correctSoundObject = new Audio.Sound();
      const wrongSoundObject = new Audio.Sound();
      
      try {
        // Update paths to use @/ alias for better imports
        await correctSoundObject.loadAsync(require('@/assets/sounds/correct.mp3'));
        await wrongSoundObject.loadAsync(require('@/assets/sounds/wrong.mp3'));
        
        setCorrectSound(correctSoundObject);
        setWrongSound(wrongSoundObject);
      } catch (error) {
        console.error('Error loading sounds', error);
      }
    }
    
    loadSounds();
    
    // Cleanup on unmount
    return () => {
      if (correctSound) correctSound.unloadAsync();
      if (wrongSound) wrongSound.unloadAsync();
    };
  }, []);
  
  const handleLetterPress = (letter, index) => {
    // Animate the letter being pressed
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
      // Play correct sound
      if (correctSound) {
        correctSound.replayAsync();
      }
      
      // Update selected letters
      const newSelectedLetters = [...selectedLetters, letter];
      setSelectedLetters(newSelectedLetters);
      
      // Update displayed word
      let newDisplay = '';
      for (let i = 0; i < currentWord.length; i++) {
        if (currentWord[i] === letter || displayWord[i] !== '_') {
          newDisplay += currentWord[i];
        } else {
          newDisplay += '_';
        }
      }
      
      setDisplayWord(newDisplay);
      
      // Check if word is complete
      if (!newDisplay.includes('_')) {
        // Word complete animation
        Animated.spring(bounceValue, {
          toValue: 1,
          friction: 3,
          tension: 40,
          useNativeDriver: true,
        }).start(() => {
          setTimeout(() => {
            bounceValue.setValue(0);
            // Here you would normally load the next word
          }, 1500);
        });
      }
    } else {
      // Play wrong sound
      if (wrongSound) {
        wrongSound.replayAsync();
      }
    }
  };
  
  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      
      {/* Top coin */}
      <View style={styles.coinContainer}>
        <Image 
          source={require('@/assets/images/coin.png')} 
          style={styles.coin}
          resizeMode="contain"
        />
      </View>
      
      {/* Letter circles */}
      <View style={styles.lettersContainer}>
        {letters.map((letter, index) => (
          <TouchableOpacity 
            key={index}
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
        <Text style={styles.wordText}>{displayWord[0]}</Text>
        {displayWord.slice(1).split('').map((char, index) => (
          <View key={index} style={styles.letterSlot}>
            <Text style={styles.wordText}>{char !== '_' ? char : ''}</Text>
          </View>
        ))}
      </Animated.View>
      
      {/* Bottom characters */}
      <View style={styles.charactersContainer}>
        <Image 
          source={require('@/assets/images/bird.png')} 
          style={styles.character}
          resizeMode="contain"
        />
        
        {/* House hint button */}
        <TouchableOpacity style={styles.hintButton}>
          <Image 
            source={require('@/assets/images/house.png')} 
            style={styles.hintImage}
            resizeMode="contain"
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#9DE7A9', // Light green background
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
  },
  coinContainer: {
    position: 'absolute',
    top: 40,
    right: 20,
  },
  coin: {
    width: 40,
    height: 40,
  },
  lettersContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: 100,
    width: '100%',
  },
  letterCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#FF6B95', // Pink color
    margin: 10,
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
    fontSize: 30,
    fontWeight: 'bold',
    color: 'white',
  },
  wordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 40,
  },
  wordText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#5D3A00', // Dark brown
    marginHorizontal: 5,
  },
  letterSlot: {
    width: 40,
    height: 5,
    backgroundColor: '#5D3A00', // Dark brown
    marginHorizontal: 5,
    borderRadius: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 45,
  },
  charactersContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 20,
    marginBottom: 20,
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
});

export default WordGameScreen;