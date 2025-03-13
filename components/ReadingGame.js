import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Text, Image, TouchableOpacity, ScrollView, Dimensions, Animated } from 'react-native';
import { Audio } from 'expo-av';
import * as Speech from 'expo-speech';

const { width, height } = Dimensions.get('window');

const ReadingGame = () => {
  // Story content - The Tale of Kintu (Ugandan folklore)
  const storyPages = [
    {
      text: "Long ago, Kintu was the first person on Earth. He lived alone with his cow, which was his only friend and source of food.",
      image: require('../assets/images/kintu-cow.png'),
      altText: "Kintu standing beside his cow in a grassy field"
    },
    {
      text: "Gulu, the god of the sky, had many children. His daughter, Nambi, saw Kintu and fell in love with him.",
      image: require('../assets/images/nambi.png'),
      altText: "Nambi looking at Kintu from the sky"
    },
    {
      text: "Nambi decided to marry Kintu and take him to live with her in the sky. But her father, Gulu, set difficult tests for Kintu to prove his worth.",
      image: require('../assets/images/gulu-tests.png'),
      altText: "Gulu setting tests for Kintu"
    },
    {
      text: "First, Kintu had to eat enormous amounts of food. With help from termites who secretly ate the food, Kintu passed the test.",
      image: require('../assets/images/kintu-food.png'),
      altText: "Kintu eating food with termites helping"
    },
    {
      text: "Then, Kintu had to find his special cow among thousands of identical cows. A bee helped him by landing on his cow's horn.",
      image: require('../assets/images/kintu-cow-search.png'),
      altText: "Kintu finding his cow with the help of a bee"
    },
    {
      text: "After passing all tests, Gulu allowed Kintu to marry Nambi. But he warned them to leave quickly and not come back, or Death would follow them.",
      image: require('../assets/images/kintu-nambi.png'),
      altText: "Kintu and Nambi getting married"
    },
    {
      text: "Nambi remembered she forgot to bring chicken feed. Despite Kintu's warning, she went back to get it. Death secretly followed them to Earth.",
      image: require('../assets/images/death-follows.png'),
      altText: "Death following Kintu and Nambi to Earth"
    },
    {
      text: "Kintu and Nambi started a family on Earth. They became the ancestors of the Baganda people. But because Death followed them, people don't live forever.",
      image: require('../assets/images/kintu-family.png'),
      altText: "Kintu and Nambi with their family"
    },
  ];

  const [currentPage, setCurrentPage] = useState(0);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [isReading, setIsReading] = useState(false);
  const [pageSound, setPageSound] = useState(null);
  const [textSize, setTextSize] = useState('medium'); // options: small, medium, large
  const [readingSpeed, setReadingSpeed] = useState(0.8); // Default speed
  const readTimeoutRef = useRef(null);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  // Load sounds
  useEffect(() => {
    async function loadSounds() {
      const pageTurnSound = new Audio.Sound();
      try {
        await pageTurnSound.loadAsync(require('../assets/sounds/page-turn.mp3'));
        setPageSound(pageTurnSound);
      } catch (error) {
        console.error('Error loading sounds', error);
      }
    }
    
    loadSounds();
    
    // Cleanup on unmount
    return () => {
      if (pageSound) pageSound.unloadAsync();
      if (readTimeoutRef.current) clearTimeout(readTimeoutRef.current);
      Speech.stop();
    };
  }, []);

  // Split current page text into words
  const words = storyPages[currentPage].text.split(' ');

  const handlePageTurn = (direction) => {
    if (isReading) {
      // Stop reading if in progress
      Speech.stop();
      if (readTimeoutRef.current) clearTimeout(readTimeoutRef.current);
      setIsReading(false);
      setHighlightedIndex(-1);
    }

    // Play page turn sound
    if (pageSound) {
      pageSound.replayAsync();
    }

    // Page transition animation
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      })
    ]).start();

    // Set new page after fade out
    setTimeout(() => {
      if (direction === 'next' && currentPage < storyPages.length - 1) {
        setCurrentPage(currentPage + 1);
      } else if (direction === 'prev' && currentPage > 0) {
        setCurrentPage(currentPage - 1);
      }
    }, 300);
  };

  const readStory = () => {
    if (isReading) {
      // Stop reading
      Speech.stop();
      if (readTimeoutRef.current) clearTimeout(readTimeoutRef.current);
      setIsReading(false);
      setHighlightedIndex(-1);
      return;
    }

    setIsReading(true);
    
    // Start reading word by word
    const readNextWord = (index) => {
      if (index < words.length) {
        setHighlightedIndex(index);
        
        // Read current word
        Speech.speak(words[index], {
          rate: readingSpeed,
          onDone: () => {
            // Schedule next word after a short delay
            readTimeoutRef.current = setTimeout(() => {
              readNextWord(index + 1);
            }, 200);
          }
        });
      } else {
        // Finished reading this page
        setIsReading(false);
        setHighlightedIndex(-1);
      }
    };
    
    readNextWord(0);
  };

  const getTextSize = () => {
    switch(textSize) {
      case 'small': return 16;
      case 'large': return 22;
      default: return 18;
    }
  };

  return (
    <View style={styles.container}>
      {/* Header with character */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Reading with Boni</Text>
        <Image 
          source={require('../assets/images/boni-character.png')} 
          style={styles.characterImage}
          resizeMode="contain"
        />
      </View>
      
      {/* Text size controls */}
      <View style={styles.accessibilityControls}>
        <Text style={styles.accessibilityLabel}>Text Size:</Text>
        <TouchableOpacity 
          onPress={() => setTextSize('small')}
          accessibilityLabel="Small text size"
          accessibilityRole="button"
        >
          <Text style={[styles.sizeButton, textSize === 'small' && styles.activeSizeButton]}>A</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          onPress={() => setTextSize('medium')}
          accessibilityLabel="Medium text size"
          accessibilityRole="button"
        >
          <Text style={[styles.sizeButton, textSize === 'medium' && styles.activeSizeButton]}>A</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          onPress={() => setTextSize('large')}
          accessibilityLabel="Large text size"
          accessibilityRole="button"
        >
          <Text style={[styles.sizeButton, textSize === 'large' && styles.activeSizeButton]}>A</Text>
        </TouchableOpacity>
      </View>

      {/* Reading speed controls */}
      <View style={styles.speedControls}>
        <Text style={styles.accessibilityLabel}>Reading Speed:</Text>
        <TouchableOpacity 
          onPress={() => setReadingSpeed(0.5)}
          accessibilityLabel="Slow reading speed"
          accessibilityRole="button"
        >
          <Text style={[styles.speedButton, readingSpeed === 0.5 && styles.activeSpeedButton]}>Slow</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          onPress={() => setReadingSpeed(1.0)}
          accessibilityLabel="Normal reading speed"
          accessibilityRole="button"
        >
          <Text style={[styles.speedButton, readingSpeed === 0.8 && styles.activeSpeedButton]}>Normal</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          onPress={() => setReadingSpeed(1.5)}
          accessibilityLabel="Fast reading speed"
          accessibilityRole="button"
        >
          <Text style={[styles.speedButton, readingSpeed === 1.2 && styles.activeSpeedButton]}>Fast</Text>
        </TouchableOpacity>
      </View>

      {/* Story content */}
      <Animated.View style={[styles.storyContainer, { opacity: fadeAnim }]}>
        <Image 
          source={storyPages[currentPage].image} 
          style={styles.storyImage}
          resizeMode="contain"
          accessibilityLabel={storyPages[currentPage].altText}
        />
        
        <View style={styles.textContainer}>
          <Text style={styles.storyText}>
            {words.map((word, index) => (
              <Text 
                key={index}
                style={[
                  styles.word,
                  { fontSize: getTextSize() },
                  index === highlightedIndex && styles.highlightedWord
                ]}
              >
                {word}{' '}
              </Text>
            ))}
          </Text>
        </View>
      </Animated.View>
      
      {/* Navigation and controls */}
      <View style={styles.controls}>
        <TouchableOpacity 
          style={[styles.navButton, currentPage === 0 && styles.disabledButton]}
          onPress={() => handlePageTurn('prev')}
          disabled={currentPage === 0}
          accessibilityLabel="Previous page"
          accessibilityRole="button"
          accessibilityState={{ disabled: currentPage === 0 }}
          accessibilityHint="Navigate to previous story page"
        >
          <Text style={styles.navButtonText}>←</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.readButton}
          onPress={readStory}
          accessibilityLabel={isReading ? "Stop reading" : "Read to Me"}
          accessibilityRole="button"
          accessibilityHint={isReading ? "Stop the story narration" : "Start reading the story aloud"}
        >
          <Text style={styles.readButtonText}>
            {isReading ? "Stop" : "Read to Me"}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.navButton, currentPage === storyPages.length - 1 && styles.disabledButton]}
          onPress={() => handlePageTurn('next')}
          disabled={currentPage === storyPages.length - 1}
          accessibilityLabel="Next page"
          accessibilityRole="button"
          accessibilityState={{ disabled: currentPage === storyPages.length - 1 }}
          accessibilityHint="Navigate to next story page"
        >
          <Text style={styles.navButtonText}>→</Text>
        </TouchableOpacity>
      </View>
      
      {/* Page indicator */}
      <View style={styles.pageIndicator}>
        {storyPages.map((_, index) => (
          <View 
            key={index} 
            style={[
              styles.pageIndicatorDot,
              index === currentPage && styles.currentPageDot
            ]} 
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5E9BE', // Light beige background
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#5D3A00', // Dark brown
  },
  characterImage: {
    width: 60,
    height: 60,
  },
  accessibilityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  accessibilityLabel: {
    fontSize: 18,
    marginRight: 10,
  },
  sizeButton: {
    fontSize: 18,
    marginHorizontal: 5,
    padding: 5,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
  },
  activeSizeButton: {
    backgroundColor: '#FF6B95', // Pink
    color: 'white',
  },
  speedControls: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  speedButton: {
    fontSize: 18,
    marginHorizontal: 5,
    padding: 5,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
  },
  activeSpeedButton: {
    backgroundColor: '#FF6B95', // Pink
    color: 'white',
  },
  storyContainer: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  storyImage: {
    width: '100%',
    height: '50%',
    marginBottom: 15,
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  storyText: {
    fontSize: 18,
    lineHeight: 26,
    color: '#333',
  },
  word: {
    fontSize: 18,
    color: '#333',
  },
  highlightedWord: {
    backgroundColor: '#FFEB3B', // Yellow highlight
    fontWeight: 'bold',
    borderRadius: 4,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 20,
  },
  navButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FF6B95', // Pink
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    elevation: 3,
  },
  navButtonText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  disabledButton: {
    backgroundColor: '#ccc',
    opacity: 0.7,
  },
  readButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#4CAF50', // Green
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    elevation: 3,
  },
  readButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  pageIndicator: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 10,
  },
  pageIndicatorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ccc',
    marginHorizontal: 4,
  },
  currentPageDot: {
    backgroundColor: '#FF6B95', // Pink
    width: 12,
    height: 12,
    borderRadius: 6,
  },
});

export default ReadingGame;