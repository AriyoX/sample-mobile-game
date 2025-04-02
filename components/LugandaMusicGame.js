
const LugandaMusicGame = ({ navigation }) => {
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

  // Add dimensions state
  const [dimensions, setDimensions] = useState(Dimensions.get('window'));

  // Set landscape orientation when component mounts
  useEffect(() => {
    const setLandscapeOrientation = async () => {
      await ScreenOrientation.lockAsync(
        ScreenOrientation.OrientationLock.LANDSCAPE
      );
    };
    
    setLandscapeOrientation();
    
    // Clean up and reset to portrait when unmounting
    return () => {
      const resetOrientation = async () => {
        await ScreenOrientation.lockAsync(
          ScreenOrientation.OrientationLock.PORTRAIT
        );
      };
      
      resetOrientation();
    };
  }, []);

  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setDimensions(window);
    });

    return () => {
      subscription?.remove();
      // Your existing cleanup code
      Object.values(sounds).forEach(sound => {
        if (sound) sound.unloadAsync();
      });
      
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Ugandan traditional instruments (translated to English)
  const instruments = [
    {
      id: 'engoma',
      name: 'Engoma Drum',
      description: 'A traditional Ugandan cultural instrument',
      image: require('../assets/images/coin.png'),
      sound: require('../assets/sounds/correct.mp3'),
    },
    {
      id: 'endingidi',
      name: 'Endingidi Fiddle',
      description: 'A traditional Ugandan cultural instrument',
      image: require('../assets/images/coin.png'),
      sound: require('../assets/sounds/wrong.mp3'),
    },
    {
      id: 'amadinda',
      name: 'Amadinda Xylophone',
      description: 'A traditional Ugandan cultural instrument',
      image: require('../assets/images/coin.png'),
      sound: require('../assets/sounds/correct.mp3'),
    },
    {
      id: 'ensaasi',
      name: 'Ensaasi Shakers',
      description: 'A traditional Ugandan cultural instrument',
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
    setMessage('Listen to the pattern of sounds...');
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
    setMessage('Now try to recreate the pattern of sounds you heard');
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
    setMessage('Now try to recreate the pattern of sounds');
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
      setMessage('Thank you! Well done!');
    } else {
      setMessage('Try again!');
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

  // Modify renderInstruments to use a horizontal layout in landscape
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
            {
              // Adjust size based on orientation
              width: dimensions.width * 0.2, // Smaller in landscape
              height: dimensions.height * 0.3,
            },
            currentInstrument === instrument.id && styles.activeInstrument
          ]}
          onPress={() => playSound(instrument.id)}
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

  // Modify the main return to use landscape layout
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="auto" />
      
      {/* Re-arrange for landscape */}
      <View style={styles.landscapeLayout}>
        <View style={styles.leftPanel}>
          <View style={styles.header}>
            <Text style={styles.title}>Ugandan Musical Instruments</Text>
            <Text style={styles.subtitle}>Play with Ugandan musical instruments</Text>
          </View>
          
          <View style={styles.instructionsContainer}>
            <Text style={styles.instructionText}>
              {patternMode 
                ? message || 'Tap on an instrument to hear its sound'
                : 'Tap on an instrument to hear its sound'
              }
            </Text>
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
          
          <View style={styles.buttonContainer}>
            {!patternMode ? (
              <TouchableOpacity 
                style={styles.patternButton}
                onPress={startPatternGame}
              >
                <Text style={styles.buttonText}>Play "Pattern Match"</Text>
              </TouchableOpacity>
            ) : patternPlaying ? (
              <TouchableOpacity 
                style={styles.skipButton}
                onPress={skipPattern}
              >
                <Text style={styles.buttonText}>Skip</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity 
                style={styles.patternButton}
                onPress={playPattern}
              >
                <Text style={styles.buttonText}>Repeat Pattern</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
        
        <View style={styles.rightPanel}>
          <View style={styles.instrumentsContainer}>
            {renderInstruments()}
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

// Update styles for landscape
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9E0BB',
  },
  landscapeLayout: {
    flex: 1,
    flexDirection: 'row', // Horizontal layout for landscape
  },
  leftPanel: {
    flex: 0.4, // 40% of screen width
    padding: 20,
    justifyContent: 'space-between',
  },
  rightPanel: {
    flex: 0.6, // 60% of screen width
    padding: 10,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 10,
  },
  title: {
    fontSize: 24, // Slightly smaller for landscape
    fontWeight: 'bold',
    color: '#8B4513',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#8B4513',
    opacity: 0.8,
  },
  instrumentsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  instrumentButton: {
    // Base styles (size is set dynamically in the component)
    backgroundColor: '#FFD699',
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
    alignSelf: 'center',
    marginBottom: 10,
  },
  characterImage: {
    width: 80,
    height: 80,
  },
});

export default LugandaMusicGame;