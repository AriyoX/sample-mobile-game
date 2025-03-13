import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TouchableOpacity, 
  Image, 
  Animated, 
  SafeAreaView,
  Dimensions,
  ScrollView
} from 'react-native';
import { Audio } from 'expo-av';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

// Enhanced Luganda vocabulary data with examples and image references
const LUGANDA_WORDS = [
  { 
    luganda: 'Omukazi', 
    english: 'Woman', 
    audio: 'correct.mp3',
    example: 'Omukazi oyo mulungi nnyo.',
    exampleTranslation: 'That woman is very beautiful.',
    image: require('../assets/images/coin.png') 
  },
  { 
    luganda: 'Omusajja', 
    english: 'Man', 
    audio: 'wrong.mp3',
    example: 'Omusajja oyo mugumikiriza.',
    exampleTranslation: 'That man is patient.',
    image: require('../assets/images/coin.png') 
  },
  { 
    luganda: 'Amazzi', 
    english: 'Water', 
    audio: 'correct.mp3',
    example: 'Amazzi gano mangi.',
    exampleTranslation: 'This water is a lot.',
    image: require('../assets/images/coin.png') 
  },
  { 
    luganda: 'Emmere', 
    english: 'Food', 
    audio: 'wrong.mp3',
    example: 'Emmere eno nnungi.',
    exampleTranslation: 'This food is delicious.',
    image: require('../assets/images/coin.png') 
  },
  { 
    luganda: 'Ekibuga', 
    english: 'City', 
    audio: 'correct.mp3',
    example: 'Ekibuga kya Kampala kinene.',
    exampleTranslation: 'Kampala city is big.',
    image: require('../assets/images/coin.png') 
  },
  { 
    luganda: 'Okukyala', 
    english: 'To visit', 
    audio: 'wrong.mp3',
    example: 'Njagala okukyala mu kyalo kyange.',
    exampleTranslation: 'I want to visit my village.',
    image: require('../assets/images/coin.png') 
  },
  { 
    luganda: 'Okuyiga', 
    english: 'To learn', 
    audio: 'correct.mp3',
    example: 'Njagala okuyiga Oluganda.',
    exampleTranslation: 'I want to learn Luganda.',
    image: require('../assets/images/coin.png') 
  },
  { 
    luganda: 'Ennyumba', 
    english: 'House', 
    audio: 'wrong.mp3',
    example: 'Ennyumba yange nnungi.',
    exampleTranslation: 'My house is beautiful.',
    image: require('../assets/images/coin.png') 
  },
  { 
    luganda: 'Eggulu', 
    english: 'Sky', 
    audio: 'correct.mp3',
    example: 'Eggulu lino bbululu.',
    exampleTranslation: 'The sky is blue.',
    image: require('../assets/images/coin.png') 
  },
  { 
    luganda: 'Emmunyeenye', 
    english: 'Star', 
    audio: 'wrong.mp3',
    example: 'Emmunyeenye nyingi ziri mu ggulu.',
    exampleTranslation: 'There are many stars in the sky.',
    image: require('../assets/images/coin.png') 
  },
];

const LugandaLearningGame = () => {
  // Game state management
  const [gameState, setGameState] = useState('learning'); // 'learning' or 'playing'
  const [currentLearningIndex, setCurrentLearningIndex] = useState(0);
  
  // Existing game state
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [currentWord, setCurrentWord] = useState(LUGANDA_WORDS[0]);
  const [options, setOptions] = useState([]);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isCorrect, setIsCorrect] = useState(null);
  const [sound, setSound] = useState();
  const [correctSound, setCorrectSound] = useState();
  const [wrongSound, setWrongSound] = useState();
  const [progressWidth, setProgressWidth] = useState(new Animated.Value(0));
  const [shakingOption, setShakingOption] = useState(null);
  const shakeAnimation = new Animated.Value(0);

  // Load initial game state
  useEffect(() => {
    if (gameState === 'playing') {
      generateOptions();
    }
    loadSounds();
    
    return () => {
      if (sound) sound.unloadAsync();
      if (correctSound) correctSound.unloadAsync();
      if (wrongSound) wrongSound.unloadAsync();
    };
  }, [gameState]);

  // Update progress bar
  useEffect(() => {
    if (gameState === 'playing') {
      Animated.timing(progressWidth, {
        toValue: (currentWordIndex / LUGANDA_WORDS.length) * 100,
        duration: 500,
        useNativeDriver: false,
      }).start();
    }
  }, [currentWordIndex, gameState]);

  // Handle shaking animation for wrong answers
  useEffect(() => {
    if (shakingOption !== null) {
      Animated.sequence([
        Animated.timing(shakeAnimation, { toValue: 10, duration: 100, useNativeDriver: true }),
        Animated.timing(shakeAnimation, { toValue: -10, duration: 100, useNativeDriver: true }),
        Animated.timing(shakeAnimation, { toValue: 10, duration: 100, useNativeDriver: true }),
        Animated.timing(shakeAnimation, { toValue: 0, duration: 100, useNativeDriver: true })
      ]).start(() => {
        setShakingOption(null);
      });
    }
  }, [shakingOption]);

  const loadSounds = async () => {
    try {
      const correctSoundObject = new Audio.Sound();
      await correctSoundObject.loadAsync(require('../assets/sounds/correct.mp3'));
      setCorrectSound(correctSoundObject);
      
      const wrongSoundObject = new Audio.Sound();
      await wrongSoundObject.loadAsync(require('../assets/sounds/wrong.mp3'));
      setWrongSound(wrongSoundObject);
    } catch (error) {
      console.error('Error loading sounds', error);
    }
  };

  const playWordSound = async (word = currentWord) => {
    try {
      console.log(`Playing sound for: ${word.luganda}`);
      
      if (sound) {
        await sound.unloadAsync();
      }
      
      const { sound: newSound } = await Audio.Sound.createAsync(
        require('../assets/sounds/wrong.mp3')
      );
      setSound(newSound);
      await newSound.playAsync();
    } catch (error) {
      console.error('Error playing sound', error);
    }
  };
  
  // Learning screen navigation
  const nextLearningWord = () => {
    if (currentLearningIndex < LUGANDA_WORDS.length - 1) {
      setCurrentLearningIndex(currentLearningIndex + 1);
    }
  };
  
  const previousLearningWord = () => {
    if (currentLearningIndex > 0) {
      setCurrentLearningIndex(currentLearningIndex - 1);
    }
  };
  
  const startGame = () => {
    setGameState('playing');
    setCurrentWordIndex(0);
    setScore(0);
    setLives(3);
    setSelectedOption(null);
    setIsCorrect(null);
    generateOptions();
  };
  
  // Game functionality
  const generateOptions = () => {
    const correctAnswer = LUGANDA_WORDS[currentWordIndex].english;
    let optionsArray = [correctAnswer];
    
    // Add 3 random incorrect options
    while (optionsArray.length < 4) {
      const randomIndex = Math.floor(Math.random() * LUGANDA_WORDS.length);
      const randomOption = LUGANDA_WORDS[randomIndex].english;
      
      if (!optionsArray.includes(randomOption)) {
        optionsArray.push(randomOption);
      }
    }
    
    // Shuffle options
    optionsArray = optionsArray.sort(() => Math.random() - 0.5);
    setOptions(optionsArray);
    setCurrentWord(LUGANDA_WORDS[currentWordIndex]);
  };
  
  const handleOptionSelect = (option) => {
    setSelectedOption(option);
    
    if (option === currentWord.english) {
      // Correct answer
      setIsCorrect(true);
      setScore(score + 10);
      
      if (correctSound) {
        correctSound.replayAsync();
      }
      
      // Move to next word after a short delay
      setTimeout(() => {
        nextWord();
      }, 1000);
    } else {
      // Wrong answer
      setIsCorrect(false);
      setLives(lives - 1);
      setShakingOption(option);
      
      if (wrongSound) {
        wrongSound.replayAsync();
      }
      
      // Game over if no lives left
      if (lives <= 1) {
        console.log('Game Over!');
        // Return to learning screen
        setTimeout(() => {
          setGameState('learning');
          setCurrentLearningIndex(0);
        }, 1500);
      }
      
      // Allow trying again after a short delay
      setTimeout(() => {
        setSelectedOption(null);
        setIsCorrect(null);
      }, 1500);
    }
  };
  
  const nextWord = () => {
    const nextIndex = currentWordIndex + 1;
    
    if (nextIndex < LUGANDA_WORDS.length) {
      setCurrentWordIndex(nextIndex);
      setSelectedOption(null);
      setIsCorrect(null);
      
      setTimeout(() => {
        generateOptions();
      }, 300);
    } else {
      // Game completed - could show a success screen in a real app
      console.log('Game Completed! Final score:', score);
      // Return to learning mode
      setGameState('learning');
      setCurrentLearningIndex(0);
    }
  };
  
  const resetGame = () => {
    setGameState('learning');
    setCurrentLearningIndex(0);
    setCurrentWordIndex(0);
    setScore(0);
    setLives(3);
    setSelectedOption(null);
    setIsCorrect(null);
  };
  
  const getOptionStyle = (option) => {
    if (selectedOption === null) {
      return styles.optionButton;
    }
    
    if (option === currentWord.english) {
      return [styles.optionButton, styles.correctOption];
    }
    
    if (option === selectedOption && option !== currentWord.english) {
      return [styles.optionButton, styles.wrongOption];
    }
    
    // Just return normal style for non-selected options
    return styles.optionButton;
  };
  
  // Render the Learning Screen
  const renderLearningScreen = () => {
    const currentLearnWord = LUGANDA_WORDS[currentLearningIndex];
    
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.learningHeader}>
          <Text style={styles.learningTitle}>Learn Luganda Words</Text>
          <TouchableOpacity 
            style={styles.skipButton}
            onPress={startGame}
          >
            <Text style={styles.skipButtonText}>Skip to Game</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.wordCardContainer}>
          <View style={styles.wordCard}>
            <Image 
              source={currentLearnWord.image} 
              style={styles.wordImage}
              resizeMode="contain"
            />
            
            <View style={styles.wordTextContainer}>
              <View style={styles.wordTitleContainer}>
                <Text style={styles.lugandaWordTitle}>{currentLearnWord.luganda}</Text>
                <TouchableOpacity 
                  style={styles.soundButtonSmall}
                  onPress={() => playWordSound(currentLearnWord)}
                >
                  <Image 
                    source={require('../assets/images/sound.png')} 
                    style={styles.soundIconSmall} 
                    resizeMode="contain"
                  />
                </TouchableOpacity>
              </View>
              
              <Text style={styles.englishTranslation}>{currentLearnWord.english}</Text>
              
              <View style={styles.exampleContainer}>
                <Text style={styles.exampleText}>{currentLearnWord.example}</Text>
                <Text style={styles.exampleTranslation}>{currentLearnWord.exampleTranslation}</Text>
              </View>
            </View>
          </View>
        </View>
        
        <View style={styles.navigationContainer}>
          <TouchableOpacity 
            style={[
              styles.navButton, 
              currentLearningIndex === 0 ? styles.navButtonDisabled : {}
            ]}
            onPress={previousLearningWord}
            disabled={currentLearningIndex === 0}
          >
            <Text style={styles.navButtonText}>Previous</Text>
          </TouchableOpacity>
          
          <Text style={styles.paginationText}>
            {currentLearningIndex + 1} / {LUGANDA_WORDS.length}
          </Text>
          
          {currentLearningIndex < LUGANDA_WORDS.length - 1 ? (
            <TouchableOpacity 
              style={styles.navButton}
              onPress={nextLearningWord}
            >
              <Text style={styles.navButtonText}>Next</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity 
              style={[styles.navButton, styles.startButton]}
              onPress={startGame}
            >
              <Text style={styles.startButtonText}>Start Game</Text>
            </TouchableOpacity>
          )}
        </View>
      </SafeAreaView>
    );
  };
  
  // Render the Game Screen
  const renderGameScreen = () => {
    return (
      <SafeAreaView style={styles.container}>
        {/* Progress bar */}
        <View style={styles.progressContainer}>
          <Animated.View 
            style={[
              styles.progressBar, 
              { width: progressWidth.interpolate({
                  inputRange: [0, 100],
                  outputRange: ['0%', '100%']
                })
              }
            ]} 
          />
        </View>
        
        {/* Lives */}
        <View style={styles.livesContainer}>
          {[...Array(lives)].map((_, index) => (
            <Image 
              key={index} 
              source={require('../assets/images/heart.png')} 
              style={styles.heartIcon} 
              resizeMode="contain"
            />
          ))}
        </View>
        
        {/* Score */}
        <View style={styles.scoreContainer}>
          <Image 
            source={require('../assets/images/star.png')} 
            style={styles.starIcon} 
            resizeMode="contain"
          />
          <Text style={styles.scoreText}>{score}</Text>
        </View>
        
        {/* Question */}
        <View style={styles.questionContainer}>
          <Text style={styles.questionLabel}>Select the correct translation:</Text>
          <View style={styles.wordContainer}>
            <Text style={styles.lugandaWord}>{currentWord.luganda}</Text>
            <TouchableOpacity 
              style={styles.soundButton}
              onPress={() => playWordSound()}
            >
              <Image 
                source={require('../assets/images/sound.png')} 
                style={styles.soundIcon} 
                resizeMode="contain"
              />
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Options */}
        <View style={styles.optionsContainer}>
          {options.map((option, index) => (
            <Animated.View 
              key={index} 
              style={[
                option === shakingOption ? 
                { transform: [{ translateX: shakeAnimation }] } : 
                {}
              ]}
            >
              <TouchableOpacity
                style={getOptionStyle(option)}
                onPress={() => handleOptionSelect(option)}
                disabled={isCorrect === true} // Only disable when correct answer is selected
              >
                <Text style={styles.optionText}>{option}</Text>
              </TouchableOpacity>
            </Animated.View>
          ))}
        </View>
        
        {/* Feedback message */}
        {isCorrect !== null && (
          <View style={styles.feedbackContainer}>
            <Text style={[
              styles.feedbackText, 
              isCorrect ? styles.correctFeedback : styles.wrongFeedback
            ]}>
              {isCorrect ? 'Correct! 🎉' : 'Try again! 😕'}
            </Text>
          </View>
        )}
        
        {/* Next button - shown after answering */}
        {isCorrect === true && (
          <TouchableOpacity 
            style={styles.nextButton}
            onPress={nextWord}
          >
            <Text style={styles.nextButtonText}>Continue</Text>
          </TouchableOpacity>
        )}
      </SafeAreaView>
    );
  };
  
  return gameState === 'learning' ? renderLearningScreen() : renderGameScreen();
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#F5F7FB',
  },
  // Learning screen styles
  learningHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  learningTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1CB0F6',
  },
  skipButton: {
    backgroundColor: '#E3F2FD',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  skipButtonText: {
    color: '#1CB0F6',
    fontWeight: '600',
  },
  wordCardContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  wordCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  wordImage: {
    width: '100%',
    height: 180,
    marginBottom: 20,
  },
  wordTextContainer: {
    alignItems: 'center',
  },
  wordTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  lugandaWordTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1CB0F6',
  },
  soundButtonSmall: {
    marginLeft: 10,
    padding: 8,
    backgroundColor: '#E3F2FD',
    borderRadius: 16,
  },
  soundIconSmall: {
    width: 20,
    height: 20,
  },
  englishTranslation: {
    fontSize: 22,
    fontWeight: '600',
    color: '#4B4B4B',
    marginBottom: 16,
  },
  exampleContainer: {
    width: '100%',
    backgroundColor: '#F8F9FA',
    padding: 16,
    borderRadius: 12,
    marginTop: 10,
  },
  exampleText: {
    fontSize: 16,
    fontStyle: 'italic',
    color: '#4B4B4B',
    marginBottom: 8,
  },
  exampleTranslation: {
    fontSize: 16,
    color: '#777',
  },
  navigationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
  },
  navButton: {
    backgroundColor: '#1CB0F6',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
  },
  navButtonDisabled: {
    backgroundColor: '#B0E0FF',
  },
  navButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  paginationText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#777',
  },
  startButton: {
    backgroundColor: '#58CC02',
  },
  startButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  
  // Game screen styles
  progressContainer: {
    width: '100%',
    height: 10,
    backgroundColor: '#E0E0E0',
    borderRadius: 5,
    marginBottom: 20,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#58CC02',
    borderRadius: 5,
  },
  livesContainer: {
    flexDirection: 'row',
    marginBottom: 10,
    alignSelf: 'flex-start',
  },
  heartIcon: {
    width: 25,
    height: 25,
    marginRight: 5,
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    alignSelf: 'flex-end',
  },
  starIcon: {
    width: 25,
    height: 25,
    marginRight: 5,
  },
  scoreText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFB800',
  },
  questionContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  questionLabel: {
    fontSize: 16,
    color: '#777',
    marginBottom: 15,
  },
  wordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 30,
  },
  lugandaWord: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1CB0F6',
  },
  soundButton: {
    marginLeft: 15,
    padding: 8,
    backgroundColor: '#E3F2FD',
    borderRadius: 20,
  },
  soundIcon: {
    width: 24,
    height: 24,
  },
  optionsContainer: {
    width: '100%',
  },
  optionButton: {
    backgroundColor: 'white',
    borderWidth: 2,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  correctOption: {
    backgroundColor: '#D7FFB8',
    borderColor: '#58CC02',
  },
  wrongOption: {
    backgroundColor: '#FFEBEB',
    borderColor: '#FF4B4B',
  },
  disabledOption: {
    opacity: 0.7,
  },
  optionText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#4B4B4B',
  },
  feedbackContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  feedbackText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  correctFeedback: {
    color: '#58CC02',
  },
  wrongFeedback: {
    color: '#FF4B4B',
  },
  nextButton: {
    backgroundColor: '#58CC02',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 12,
    alignSelf: 'center',
    marginTop: 20,
  },
  nextButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default LugandaLearningGame;