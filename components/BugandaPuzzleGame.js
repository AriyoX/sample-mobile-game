import React, { useState, useEffect, useRef } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  Image, 
  TouchableOpacity, 
  Dimensions, 
  Animated, 
  Alert 
} from 'react-native';
import { PanResponder } from 'react-native';
import { Audio } from 'expo-av';
import { StatusBar } from 'expo-status-bar';

const { width, height } = Dimensions.get('window');
const GRID_SIZE = 3; // 3x3 puzzle
const PUZZLE_PADDING = 20;
const PUZZLE_CONTAINER_SIZE = width - 40;
const TILE_SIZE = (PUZZLE_CONTAINER_SIZE - (PUZZLE_PADDING * 2)) / GRID_SIZE;
const TILE_MARGIN = 2;

const BugandaPuzzleGame = () => {
  // Different puzzle images representing Buganda cultural elements
  const puzzleImages = [
    {
      id: 1,
      name: 'Kasubi Tombs',
      source: require('../assets/images/kasubi-tombs.png'),
      description: 'A UNESCO World Heritage site and burial ground of Buganda kings'
    },
    {
      id: 2,
      name: 'Buganda Royal Drums',
      source: require('../assets/images/buganda-drums.png'),
      description: 'Traditional royal drums used in Buganda ceremonies'
    },
    {
      id: 3,
      name: 'Lubiri Palace',
      source: require('../assets/images/lubiri-palace.png'),
      description: 'The palace of the Kabaka (King) of Buganda'
    }
  ];

  const [currentPuzzle, setCurrentPuzzle] = useState(0);
  const [tiles, setTiles] = useState([]);
  const [isComplete, setIsComplete] = useState(false);
  const [moves, setMoves] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [showPreview, setShowPreview] = useState(true);
  const [soundEffects, setSoundEffects] = useState({
    tileMove: null,
    success: null,
  });
  const [animatedPositions, setAnimatedPositions] = useState({});
  
  const previewAnim = useRef(new Animated.Value(1)).current;
  const successAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Load sound effects
    const loadSounds = async () => {
      const tileMoveSound = new Audio.Sound();
      const successSound = new Audio.Sound();
      
      try {
        await tileMoveSound.loadAsync(require('../assets/sounds/page-turn.mp3'));
        await successSound.loadAsync(require('../assets/sounds/correct.mp3'));
        
        setSoundEffects({
          tileMove: tileMoveSound,
          success: successSound,
        });
      } catch (error) {
        console.error('Failed to load sounds', error);
      }
    };
    
    loadSounds();
    
    // Cleanup function
    return () => {
      if (soundEffects.tileMove) soundEffects.tileMove.unloadAsync();
      if (soundEffects.success) soundEffects.success.unloadAsync();
    };
  }, []);

  useEffect(() => {
    if (showPreview) {
      // Show the full image for 3 seconds before starting the game
      setTimeout(() => {
        Animated.timing(previewAnim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }).start(() => {
          setShowPreview(false);
          initializePuzzle();
        });
      }, 3000);
    }
  }, [showPreview]);

  const initializePuzzle = () => {
    const newTiles = [];
    const newAnimatedPositions = {};
    let tileCount = 0;
    
    // Create tiles (except for the last one which will be empty)
    for (let row = 0; row < GRID_SIZE; row++) {
      for (let col = 0; col < GRID_SIZE; col++) {
        tileCount++;
        if (tileCount < GRID_SIZE * GRID_SIZE) {
          // Create the tile
          newTiles.push({
            id: tileCount,
            correctPosition: { row, col },
            currentPosition: { row, col },
            imageX: col * TILE_SIZE,
            imageY: row * TILE_SIZE,
          });
          
          // Create animated values for this tile
          newAnimatedPositions[tileCount] = {
            left: new Animated.Value(col * (TILE_SIZE + TILE_MARGIN * 2) + PUZZLE_PADDING),
            top: new Animated.Value(row * (TILE_SIZE + TILE_MARGIN * 2) + PUZZLE_PADDING),
          };
        }
      }
    }
    
    // Shuffle the tiles
    const shuffledTiles = shuffleTiles([...newTiles]);
    
    // Update animated positions for shuffled tiles
    shuffledTiles.forEach(tile => {
      const left = tile.currentPosition.col * (TILE_SIZE + TILE_MARGIN * 2) + PUZZLE_PADDING;
      const top = tile.currentPosition.row * (TILE_SIZE + TILE_MARGIN * 2) + PUZZLE_PADDING;
      
      newAnimatedPositions[tile.id].left.setValue(left);
      newAnimatedPositions[tile.id].top.setValue(top);
    });
    
    setTiles(shuffledTiles);
    setAnimatedPositions(newAnimatedPositions);
    setGameStarted(true);
    setMoves(0);
    setIsComplete(false);
  };

  const shuffleTiles = (tilesArray) => {
    // Fisher-Yates shuffle algorithm
    for (let i = tilesArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [tilesArray[i].currentPosition, tilesArray[j].currentPosition] = 
      [tilesArray[j].currentPosition, tilesArray[i].currentPosition];
    }
    
    // Ensure the puzzle is solvable
    if (!isPuzzleSolvable(tilesArray)) {
      // Swap the first two tiles to make it solvable
      [tilesArray[0].currentPosition, tilesArray[1].currentPosition] = 
      [tilesArray[1].currentPosition, tilesArray[0].currentPosition];
    }
    
    return tilesArray;
  };

  const isPuzzleSolvable = (tilesArray) => {
    // This is a simplified check - in a real game you'd need a more robust algorithm
    // For a 3x3 puzzle, counting inversions works
    let inversions = 0;
    for (let i = 0; i < tilesArray.length; i++) {
      for (let j = i + 1; j < tilesArray.length; j++) {
        if (tilesArray[i].id > tilesArray[j].id) {
          inversions++;
        }
      }
    }
    return inversions % 2 === 0;
  };

  const getEmptyPosition = () => {
    // Find the position that doesn't have a tile
    for (let row = 0; row < GRID_SIZE; row++) {
      for (let col = 0; col < GRID_SIZE; col++) {
        let tileFound = false;
        for (let t = 0; t < tiles.length; t++) {
          if (tiles[t].currentPosition.row === row && tiles[t].currentPosition.col === col) {
            tileFound = true;
            break;
          }
        }
        if (!tileFound) {
          return { row, col };
        }
      }
    }
    return null;
  };

  const canMoveTile = (tilePosition, emptyPosition) => {
    // Check if the tile is adjacent to the empty position
    const rowDiff = Math.abs(tilePosition.row - emptyPosition.row);
    const colDiff = Math.abs(tilePosition.col - emptyPosition.col);
    
    return (rowDiff === 1 && colDiff === 0) || (rowDiff === 0 && colDiff === 1);
  };

  const moveTile = (tileId) => {
    if (isComplete) return;
    
    const tileIndex = tiles.findIndex(t => t.id === tileId);
    if (tileIndex === -1) {
      console.log(`Tile ${tileId} not found`);
      return;
    }
    
    const tile = tiles[tileIndex];
    const emptyPos = getEmptyPosition();
    
    console.log(`Attempting to move tile ${tileId} from (${tile.currentPosition.row}, ${tile.currentPosition.col}) to empty space at (${emptyPos.row}, ${emptyPos.col})`);
    
    if (canMoveTile(tile.currentPosition, emptyPos)) {
      console.log(`Tile ${tileId} can move and will be moved`);
      
      // Play sound effect
      if (soundEffects.tileMove) {
        soundEffects.tileMove.replayAsync();
      }
      
      // Calculate new position for animation
      const newLeft = emptyPos.col * (TILE_SIZE + TILE_MARGIN * 2) + PUZZLE_PADDING;
      const newTop = emptyPos.row * (TILE_SIZE + TILE_MARGIN * 2) + PUZZLE_PADDING;
      
      // Animate the tile movement
      Animated.parallel([
        Animated.timing(animatedPositions[tileId].left, {
          toValue: newLeft,
          duration: 150,
          useNativeDriver: false, // We need to use false for layout properties
        }),
        Animated.timing(animatedPositions[tileId].top, {
          toValue: newTop,
          duration: 150,
          useNativeDriver: false, // We need to use false for layout properties
        })
      ]).start();
      
      // Update tile position in state
      const newTiles = [...tiles];
      newTiles[tileIndex] = {
        ...tile,
        currentPosition: { ...emptyPos }
      };
      
      setTiles(newTiles);
      setMoves(moves + 1);
      
      // Check if puzzle is complete
      setTimeout(() => {
        checkPuzzleCompletion(newTiles);
      }, 300);
    } else {
      console.log(`Tile ${tileId} cannot move`);
    }
  };

  const checkPuzzleCompletion = (currentTiles) => {
    const isCompleted = currentTiles.every(tile => 
      tile.correctPosition.row === tile.currentPosition.row && 
      tile.correctPosition.col === tile.currentPosition.col
    );
    
    if (isCompleted) {
      setIsComplete(true);
      
      // Play success sound
      if (soundEffects.success) {
        soundEffects.success.replayAsync();
      }
      
      // Show success animation
      Animated.spring(successAnim, {
        toValue: 1,
        friction: 5,
        tension: 40,
        useNativeDriver: true,
      }).start();
      
      // Show completion message
      setTimeout(() => {
        Alert.alert(
          "Congratulations!",
          `You completed the ${puzzleImages[currentPuzzle].name} puzzle in ${moves} moves!`,
          [
            { 
              text: "Next Puzzle", 
              onPress: () => {
                successAnim.setValue(0);
                setCurrentPuzzle((currentPuzzle + 1) % puzzleImages.length);
                setShowPreview(true);
                previewAnim.setValue(1);
              } 
            }
          ]
        );
      }, 1000);
    }
  };

  const createTilePanResponder = (tileId) => {
    return PanResponder.create({
      onStartShouldSetPanResponder: () => !isComplete,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        // Only respond to deliberate swipes, not small movements
        const { dx, dy } = gestureState;
        return !isComplete && (Math.abs(dx) > 10 || Math.abs(dy) > 10);
      },
      onPanResponderRelease: (_, gestureState) => {
        const { dx, dy } = gestureState;
        const tileIndex = tiles.findIndex(t => t.id === tileId);
        const tile = tiles[tileIndex];
        const emptyPos = getEmptyPosition();

        // Determine swipe direction (use the dominant axis)
        if (Math.abs(dx) > Math.abs(dy)) {
          // Horizontal swipe
          if (dx > 0 && tile.currentPosition.col + 1 === emptyPos.col && 
              tile.currentPosition.row === emptyPos.row) {
            // Swipe right
            moveTile(tileId);
          } else if (dx < 0 && tile.currentPosition.col - 1 === emptyPos.col && 
                    tile.currentPosition.row === emptyPos.row) {
            // Swipe left
            moveTile(tileId);
          }
        } else {
          // Vertical swipe
          if (dy > 0 && tile.currentPosition.row + 1 === emptyPos.row && 
              tile.currentPosition.col === emptyPos.col) {
            // Swipe down
            moveTile(tileId);
          } else if (dy < 0 && tile.currentPosition.row - 1 === emptyPos.row && 
                    tile.currentPosition.col === emptyPos.col) {
            // Swipe up
            moveTile(tileId);
          }
        }
      }
    });
  };

  const renderTile = (tile) => {
    const emptyPos = getEmptyPosition();
    const canMove = canMoveTile(tile.currentPosition, emptyPos);
    const panResponder = createTilePanResponder(tile.id);
    
    return (
      <Animated.View
        key={tile.id}
        style={[
          styles.tile,
          {
            width: TILE_SIZE,
            height: TILE_SIZE,
            left: animatedPositions[tile.id].left,
            top: animatedPositions[tile.id].top,
            // Increase z-index for middle tile to ensure it's on top
            zIndex: tile.id === 5 ? 10 : 1,
          }
        ]}
        {...panResponder.panHandlers}
      >
        <TouchableOpacity
          style={{ 
            width: '100%', 
            height: '100%',
            justifyContent: 'center',
            alignItems: 'center'
          }}
          onPress={() => {
            console.log(`Tile ${tile.id} pressed. Can move: ${canMove}`);
            moveTile(tile.id);
          }}
          activeOpacity={0.6} // Make the touch feedback more visible
          accessible={true}
          accessibilityLabel={`Tile ${tile.id}`}
          accessibilityHint={canMove ? "Double tap to move this tile or swipe it toward an empty space" : "This tile cannot be moved"}
          accessibilityRole="button"
          accessibilityState={{ disabled: !canMove }}
        >
          <Image
            source={puzzleImages[currentPuzzle].source}
            style={{
              width: PUZZLE_CONTAINER_SIZE - (PUZZLE_PADDING * 2),
              height: PUZZLE_CONTAINER_SIZE - (PUZZLE_PADDING * 2),
              position: 'absolute',
              top: -tile.imageY,
              left: -tile.imageX,
            }}
            accessible={false}
          />
          <View style={[styles.tileNumber, { opacity: 0.9 }]}>
            <Text style={styles.tileNumberText}>{tile.id}</Text>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      
      <View style={styles.header}>
        <Text style={styles.title}>{puzzleImages[currentPuzzle].name}</Text>
        {gameStarted && (
          <Text style={styles.moves}>Moves: {moves}</Text>
        )}
      </View>
      
      <View style={styles.puzzleContainer}>
        {/* Show full image preview */}
        {showPreview && (
          <Animated.View 
            style={[
              styles.previewContainer,
              { opacity: previewAnim }
            ]}
          >
            <Image
              source={puzzleImages[currentPuzzle].source}
              style={styles.previewImage}
              resizeMode="contain"
            />
            <Text style={styles.previewText}>Memorize the image</Text>
          </Animated.View>
        )}
        
        {/* Show puzzle tiles */}
        {!showPreview && tiles.map(tile => renderTile(tile))}
        
        {/* Success animation overlay */}
        <Animated.View 
          style={[
            styles.successOverlay,
            {
              opacity: successAnim,
              transform: [
                { scale: successAnim.interpolate({
                  inputRange: [0, 0.5, 1],
                  outputRange: [0.5, 1.2, 1]
                })}
              ]
            }
          ]}
        >
          <Image
            source={puzzleImages[currentPuzzle].source}
            style={styles.successImage}
            resizeMode="contain"
          />
          <Text style={styles.successText}>Well done!</Text>
        </Animated.View>
      </View>
      
      <View style={styles.footer}>
        <Text style={styles.description}>
          {puzzleImages[currentPuzzle].description}
        </Text>
        
        {gameStarted && !showPreview && (
          <TouchableOpacity 
            style={styles.resetButton}
            onPress={initializePuzzle}
            accessible={true}
            accessibilityLabel="Reset Puzzle"
            accessibilityHint="Starts a new shuffled puzzle"
            accessibilityRole="button"
          >
            <Text style={styles.resetButtonText}>Reset Puzzle</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF9E6', // Light cream background
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 10,
  },
  header: {
    width: '100%',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#873600', // Brown color for Buganda theme
    marginBottom: 5,
  },
  moves: {
    fontSize: 18,
    color: '#555',
  },
  puzzleContainer: {
    width: PUZZLE_CONTAINER_SIZE,
    height: PUZZLE_CONTAINER_SIZE,
    backgroundColor: '#E6CCB2', // Light brown background
    borderRadius: 10,
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 2,
    borderColor: '#873600',
  },
  tile: {
    position: 'absolute',
    borderRadius: 5,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#873600',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tileNumber: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tileNumberText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#873600',
  },
  previewContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF9E6',
    zIndex: 10,
  },
  previewImage: {
    width: '80%',
    height: '80%',
  },
  previewText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#873600',
    marginTop: 10,
  },
  successOverlay: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 249, 230, 0.9)',
    zIndex: 20,
  },
  successImage: {
    width: '70%',
    height: '60%',
    borderRadius: 10,
    borderWidth: 3,
    borderColor: '#873600',
  },
  successText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#873600',
    marginTop: 20,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  footer: {
    width: '100%',
    alignItems: 'center',
    marginTop: 15,
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    color: '#5D4037',
    marginBottom: 15,
    fontStyle: 'italic',
  },
  resetButton: {
    backgroundColor: '#873600',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
  },
  resetButtonText: {
    color: '#FFF9E6',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default BugandaPuzzleGame;