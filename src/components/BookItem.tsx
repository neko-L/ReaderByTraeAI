import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface BookItemProps {
  title: string;
  author?: string;
  progress: number;
  onPress: () => void;
}

const BookItem: React.FC<BookItemProps> = ({ title, author, progress, onPress }) => {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <View style={styles.bookCover}>
        <Text style={styles.bookInitial}>{title.charAt(0)}</Text>
      </View>
      <View style={styles.bookInfo}>
        <Text style={styles.title} numberOfLines={1}>{title}</Text>
        {author && <Text style={styles.author} numberOfLines={1}>{author}</Text>}
        <View style={styles.progressContainer}>
          <View style={[styles.progressBar, { width: `${progress}%` }]} />
          <Text style={styles.progressText}>{progress}%</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#FFF8F0',
    borderRadius: 8,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  bookCover: {
    width: 60,
    height: 80,
    backgroundColor: '#FFEAD7',
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  bookInitial: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#E67E22',
  },
  bookInfo: {
    flex: 1,
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  author: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  progressContainer: {
    height: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressBar: {
    height: 6,
    backgroundColor: '#E67E22',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 8,
  },
});

export default BookItem;