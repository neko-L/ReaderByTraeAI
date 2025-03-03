import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, Text, Alert, PermissionsAndroid, Platform } from 'react-native';
import uuid from 'react-native-uuid';
import RNFS from 'react-native-fs';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import BookItem from '../components/BookItem';

interface Book {
  id: string;
  title: string;
  author?: string;
  filePath: string;
  progress: number;
}

type RootStackParamList = {
  Bookshelf: undefined;
  Reader: { book: Book };
};

type BookshelfScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Bookshelf'>;

const BOOKS_STORAGE_KEY = '@book_reader_books';

const BookshelfScreen: React.FC = () => {
  const navigation = useNavigation<BookshelfScreenNavigationProp>();
  const [books, setBooks] = useState<Book[]>([]);

  // 加载保存的书籍数据
  useEffect(() => {
    loadBooks();
  }, []);

  // 从AsyncStorage加载书籍数据
  const loadBooks = async () => {
    try {
      const savedBooks = await AsyncStorage.getItem(BOOKS_STORAGE_KEY);
      if (savedBooks) {
        setBooks(JSON.parse(savedBooks));
      }
    } catch (error) {
      console.error('加载书籍失败:', error);
      Alert.alert('错误', '加载书籍列表失败');
    }
  };

  // 保存书籍数据到AsyncStorage
  const saveBooks = async (updatedBooks: Book[]) => {
    try {
      await AsyncStorage.setItem(BOOKS_STORAGE_KEY, JSON.stringify(updatedBooks));
    } catch (error) {
      console.error('保存书籍失败:', error);
      Alert.alert('错误', '保存书籍列表失败');
    }
  };

  // 由于react-native-document-picker兼容性问题，我们使用一个模拟的添加书籍功能
  const handleAddBook = async () => {
    try {
      // 创建一个示例书籍
      const demoTitle = '示例书籍' + Math.floor(Math.random() * 1000);
      
      // 在实际应用中，这里应该使用文件选择器
      // 目前我们使用一个模拟的文件路径
      const demoFilePath = '/storage/emulated/0/Download/sample.txt';
      
      const newBook: Book = {
        id: uuid.v4().toString(),
        title: demoTitle,
        filePath: demoFilePath,
        progress: 0,
      };

      const updatedBooks = [...books, newBook];
      setBooks(updatedBooks);
      saveBooks(updatedBooks);
      
      Alert.alert('成功', `已添加示例书籍: ${demoTitle}\n在实际应用中，这里应该打开文件选择器。`);
    } catch (err) {
      console.error('添加书籍时出错：', err);
      Alert.alert('错误', '添加书籍失败');
    }
  };

  const handleBookPress = (book: Book) => {
    // 导航到阅读器页面，并传递书籍信息
    navigation.navigate('Reader', { book });
  };

  // 更新书籍进度
  const updateBookProgress = async (bookId: string, progress: number) => {
    const updatedBooks = books.map(book => 
      book.id === bookId ? { ...book, progress } : book
    );
    setBooks(updatedBooks);
    saveBooks(updatedBooks);
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={books}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <BookItem
            title={item.title}
            author={item.author}
            progress={item.progress}
            onPress={() => handleBookPress(item)}
          />
        )}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>您的书架是空的</Text>
            <Text style={styles.emptySubText}>点击下方按钮添加书籍</Text>
          </View>
        }
      />
      <TouchableOpacity style={styles.addButton} onPress={handleAddBook}>
        <Text style={styles.addButtonText}>添加书籍</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  listContainer: {
    padding: 16,
    flexGrow: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666',
    marginBottom: 8,
  },
  emptySubText: {
    fontSize: 14,
    color: '#999',
  },
  addButton: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    backgroundColor: '#E67E22',
    padding: 16,
    borderRadius: 28,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  addButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default BookshelfScreen;