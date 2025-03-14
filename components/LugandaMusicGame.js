import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Text, Image, TouchableOpacity, Dimensions, SafeAreaView } from 'react-native';
import { Audio } from 'expo-av';
import { StatusBar } from 'expo-status-bar';
import * as Animatable from 'react-native-animatable';

const { width, height } = Dimensions.get('window');

const LugandaMusicGame = () => {
  const [sounds, setSounds] = useState({});
  const [currentInstrument, setCurrentInstrument] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  
  // Pattern game states
  const [patternMode, setPatternMode] = useState(false);
  const [patternPlaying, setPatternPlaying] = useState(false);
  const [pattern, setPattern] = useState([]);
  const [userPattern, setUserPattern] = useState([]);
  const [message, setMessage] = useState('');
  
  // Reference for timeouts to allow cleanup
  const timeoutRef = useRef(null);

  // Luganda traditional instruments
  const instruments = [
    {
      id: 'engoma',
      name: 'Engoma',
      description: 'Engoma y\'ekisinde ekyobuwangwa',
      image: require('../assets/images/coin.png'),
      sound: require('../assets/sounds/correct.mp3'),
    },
    {
      id: 'endingidi',
      name: 'Endingidi',
      description: 'Endingidi y\'ekisinde ekyobuwangwa',
      image: require('../assets/images/coin.png'),
      sound: require('../assets/sounds/wrong.mp3'),
    },
    {
      id: 'amadinda',
      name: 'Amadinda',
      description: 'Amadinda g\'ekisinde ekyobuwangwa',
      image: require('../assets/images/coin.png'),
      sound: require('../assets/sounds/correct.mp3'),
    },
    {
      id: 'ensaasi',
      name: 'Ensaasi',
      description: 'Ensaasi z\'ekisinde ekyobuwangwa',
      image: require('../assets/images/coin.png'),
      sound: require('../assets/sounds/wrong.mp3'),
    },
  ];

  useEffect(() => {
    // Load all sounds
    async function loadSounds() {
      const soundObjects = {};
      
      for (const instrument of instruments) {
        const sound = new Audio.Sound();
        try {
          await sound.loadAsync(instrument.sound);
          soundObjects[instrument.id] = sound;
        } catch (error) {
          console.error(`Error loading sound for ${instrument.name}:`, error);
        }
      }
      
      setSounds(soundObjects);
    }
    
    loadSounds();
    
    // Cleanup on component unmount
    return () => {
      Object.values(sounds).forEach(sound => {
        if (sound) sound.unloadAsync();
      });
      
      // Clear any pending timeouts
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const playSound = async (instrumentId) => {
    try {
      const sound = sounds[instrumentId];
      if (sound) {
        setCurrentInstrument(instrumentId);
        setIsPlaying(true);
        await sound.setPositionAsync(0);
        await sound.playAsync();
        
        // If in pattern mode, add to user pattern
        if (patternMode && !patternPlaying) {
          const newUserPattern = [...userPattern, instrumentId];
          setUserPattern(newUserPattern);
          
          // Check if pattern is complete
          if (newUserPattern.length === pattern.length) {
            checkPattern(newUserPattern);
          }
        }
        
        // Set isPlaying to false when done
        sound.setOnPlaybackStatusUpdate(status => {
          if (status.didJustFinish) {
            setIsPlaying(false);
            setCurrentInstrument(null);
          }
        });
      }
    } catch (error) {
      console.error(`Error playing sound for ${instrumentId}:`, error);
      setIsPlaying(false);
    }
  };

  // Generate a random pattern using the instruments
  const generatePattern = () => {
    const length = 4; // Start with a simple pattern
    const newPattern = [];
    
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * instruments.length);
      newPattern.push(instruments[randomIndex].id);
    }
    
    return newPattern;
  };

  // Play the traditional pattern
  const playPattern = async () => {
    setPatternPlaying(true);
    setMessage('Wuliriza olunyiriri lw\'amaloboozi...');
    setUserPattern([]);
    
    const newPattern = generatePattern();
    setPattern(newPattern);
    
    // Play each instrument in sequence
    for (let i = 0; i < newPattern.length; i++) {
      if (!patternPlaying) return; // Stop if skipped
      
      // Wait a bit before playing next sound
      await new Promise(resolve => {
        timeoutRef.current = setTimeout(async () => {
          await playSound(newPattern[i]);
          resolve();
        }, 800);
      });
    }
    
    setPatternPlaying(false);
    setMessage('Kati ggwe gezaako okukola olunyiriri lw\'amaloboozi ge wawulidde');
  };

  // Skip the pattern playback
  const skipPattern = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    // Stop any playing sounds
    Object.values(sounds).forEach(sound => {
      sound?.stopAsync();
    });
    
    setPatternPlaying(false);
    setMessage('Kati ggwe gezaako okukola olunyiriri lw\'amaloboozi');
  };

  // Check if user pattern matches the generated pattern
  const checkPattern = (userInputPattern) => {
    let correct = true;
    
    for (let i = 0; i < pattern.length; i++) {
      if (userInputPattern[i] !== pattern[i]) {
        correct = false;
        break;
      }
    }
    
    if (correct) {
      setMessage('Weebale! Okikoze bulungi!');
    } else {
      setMessage('Gezaako nate!');
    }
    
    // Reset user pattern after a delay
    setTimeout(() => {
      setUserPattern([]);
    }, 2000);
  };

  // Start the pattern game
  const startPatternGame = () => {
    setPatternMode(true);
    playPattern();
  };

  const renderInstruments = () => {
    return instruments.map((instrument) => (
      <Animatable.View
        key={instrument.id}
        animation="fadeIn"
        duration={800}
        delay={instruments.indexOf(instrument) * 200}
      >
        <TouchableOpacity
          style={[
            styles.instrumentButton,
            currentInstrument === instrument.id && styles.activeInstrument
          ]}
          onPress={() => playSound(instrument.id)}
          // Removed the disabled={isPlaying} to eliminate lag
        >
          <Image
            source={instrument.image}
            style={styles.instrumentImage}
            resizeMode="contain"
          />
          <Text style={styles.instrumentName}>{instrument.name}</Text>
        </TouchableOpacity>
      </Animatable.View>
    ));
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="auto" />
      
      <View style={styles.header}>
        <Text style={styles.title}>Ebisinde by'e Uganda</Text>
        <Text style={styles.subtitle}>Kozesa ebisinde by'e Uganda</Text>
      </View>
      
      <View style={styles.instrumentsContainer}>
        {renderInstruments()}
      </View>
      
      <View style={styles.instructionsContainer}>
        <Text style={styles.instructionText}>
          {patternMode 
            ? message || 'Nyiga ku kisinde okuwulira eddoboozi lyakyo'
            : 'Nyiga ku kisinde okuwulira eddoboozi lyakyo'
          }
        </Text>
      </View>
      
      <View style={styles.buttonContainer}>
        {!patternMode ? (
          <TouchableOpacity 
            style={styles.patternButton}
            onPress={startPatternGame}
          >
            <Text style={styles.buttonText}>Zanya "Olukwatagana"</Text>
          </TouchableOpacity>
        ) : patternPlaying ? (
          <TouchableOpacity 
            style={styles.skipButton}
            onPress={skipPattern}
          >
            <Text style={styles.buttonText}>Buuka</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity 
            style={styles.patternButton}
            onPress={playPattern}
          >
            <Text style={styles.buttonText}>Ddamu Olukwatagana</Text>
          </TouchableOpacity>
        )}
      </View>
      
      <Animatable.View 
        animation="bounceIn"
        style={styles.characterContainer}
      >
        <Image
          source={require('../assets/images/coin.png')}
          style={styles.characterImage}
          resizeMode="contain"
        />
      </Animatable.View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9E0BB', // Warm background color
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#8B4513', // Brown color for text
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: '#8B4513',
    opacity: 0.8,
  },
  instrumentsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    marginTop: 20,
  },
  instrumentButton: {
    width: width * 0.4,
    height: width * 0.4,
    backgroundColor: '#FFD699', // Light orange
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 10,
    padding: 10,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  activeInstrument: {
    backgroundColor: '#FFAF4D', // Darker orange when active
    transform: [{ scale: 1.05 }],
  },
  instrumentImage: {
    width: '70%',
    height: '70%',
    marginBottom: 10,
  },
  instrumentName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#8B4513',
    textAlign: 'center',
  },
  instructionsContainer: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 10,
    backgroundColor: '#FFE4B5', // Light yellow
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    minHeight: 60,
    justifyContent: 'center',
  },
  instructionText: {
    fontSize: 16,
    fontStyle: 'italic',
    color: '#8B4513',
    textAlign: 'center',
  },
  buttonContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  patternButton: {
    backgroundColor: '#8B4513',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
    elevation: 5,
  },
  skipButton: {
    backgroundColor: '#D2691E',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
    elevation: 5,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  characterContainer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
  },
  characterImage: {
    width: 100,
    height: 100,
  },
});

export default LugandaMusicGame;