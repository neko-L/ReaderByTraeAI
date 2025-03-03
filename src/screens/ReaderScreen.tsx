import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import RNFS from 'react-native-fs';
import Pdf from 'react-native-pdf';
import AsyncStorage from '@react-native-async-storage/async-storage';
import uuid from 'react-native-uuid';

type RootStackParamList = {
  Bookshelf: undefined;
  Reader: { book: Book };
};

type ReaderScreenRouteProp = RouteProp<RootStackParamList, 'Reader'>;
type ReaderScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Reader'>;

interface Book {
  id: string;
  title: string;
  author?: string;
  filePath: string;
  progress: number;
}

interface Highlight {
  id: string;
  text: string;
  position: number;
  color: string;
}

// 存储键
const BOOKS_STORAGE_KEY = '@book_reader_books';
const HIGHLIGHTS_KEY_PREFIX = '@book_reader_highlights_';

const ReaderScreen: React.FC = () => {
  const route = useRoute<ReaderScreenRouteProp>();
  const navigation = useNavigation<ReaderScreenNavigationProp>();
  const { book } = route.params;
  
  const [content, setContent] = useState<string>('');
  const [highlights, setHighlights] = useState<Highlight[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [selectedText, setSelectedText] = useState<string>('');
  const [fileType, setFileType] = useState<string>('');

  useEffect(() => {
    // 设置导航标题
    navigation.setOptions({
      title: book.title,
      headerRight: () => (
        <TouchableOpacity onPress={handleSaveProgress} style={styles.saveButton}>
          <Text style={styles.saveButtonText}>保存进度</Text>
        </TouchableOpacity>
      ),
    });

    // 确定文件类型
    const extension = book.filePath.split('.').pop()?.toLowerCase() || '';
    setFileType(extension);

    // 加载文件内容
    loadContent();

    // 加载之前的高亮标记
    loadHighlights();

    return () => {
      // 退出时保存阅读进度
      handleSaveProgress();
    };
  }, []);

  const loadContent = async () => {
    try {
      // 对于txt文件，直接读取内容
      if (fileType === 'txt') {
        const fileContent = await RNFS.readFile(book.filePath, 'utf8');
        setContent(fileContent);
      }
      // 其他文件类型在各自的渲染器中处理
    } catch (error) {
      console.error('加载文件内容失败:', error);
      Alert.alert('错误', '无法加载文件内容，请确保文件格式正确且未损坏。');
    }
  };

  const loadHighlights = async () => {
    try {
      // 从AsyncStorage加载高亮标记
      const highlightsKey = `${HIGHLIGHTS_KEY_PREFIX}${book.id}`;
      const savedHighlights = await AsyncStorage.getItem(highlightsKey);
      if (savedHighlights) {
        setHighlights(JSON.parse(savedHighlights));
      }
    } catch (error) {
      console.error('加载高亮标记失败:', error);
    }
  };

  const saveHighlights = async () => {
    try {
      // 保存高亮标记到AsyncStorage
      const highlightsKey = `${HIGHLIGHTS_KEY_PREFIX}${book.id}`;
      await AsyncStorage.setItem(highlightsKey, JSON.stringify(highlights));
    } catch (error) {
      console.error('保存高亮标记失败:', error);
    }
  };

  const handleSaveProgress = async () => {
    try {
      // 计算阅读百分比
      const progressPercentage = Math.round((currentPage / totalPages) * 100);
      
      // 从AsyncStorage获取所有书籍
      const savedBooksJson = await AsyncStorage.getItem(BOOKS_STORAGE_KEY);
      if (savedBooksJson) {
        const savedBooks: Book[] = JSON.parse(savedBooksJson);
        
        // 更新当前书籍的进度
        const updatedBooks = savedBooks.map(savedBook => 
          savedBook.id === book.id 
            ? { ...savedBook, progress: progressPercentage } 
            : savedBook
        );
        
        // 保存更新后的书籍列表
        await AsyncStorage.setItem(BOOKS_STORAGE_KEY, JSON.stringify(updatedBooks));
        console.log('阅读进度已保存:', progressPercentage);
      }
    } catch (error) {
      console.error('保存阅读进度失败:', error);
    }
  };

  const handleTextSelection = (event: any) => {
    const { selectedText } = event.nativeEvent;
    if (selectedText && selectedText.trim().length > 0) {
      setSelectedText(selectedText);
    }
  };

  const handleHighlight = () => {
    if (selectedText) {
      const newHighlight: Highlight = {
        id: uuid.v4().toString(),
        text: selectedText,
        position: content.indexOf(selectedText),
        color: '#FFEB3B', // 默认黄色高亮
      };

      const updatedHighlights = [...highlights, newHighlight];
      setHighlights(updatedHighlights);
      setSelectedText('');
      
      // 保存高亮标记
      saveHighlights();
    }
  };

  // 渲染高亮文本
  const renderHighlightedContent = () => {
    if (!content || highlights.length === 0) {
      return <Text style={styles.textContent}>{content}</Text>;
    }

    // 按位置排序高亮
    const sortedHighlights = [...highlights].sort((a, b) => a.position - b.position);
    const textParts = [];
    let lastIndex = 0;

    sortedHighlights.forEach((highlight, index) => {
      if (highlight.position >= 0) {
        // 添加高亮前的文本
        if (highlight.position > lastIndex) {
          textParts.push(
            <Text key={`text-${index}`} style={styles.textContent}>
              {content.substring(lastIndex, highlight.position)}
            </Text>
          );
        }
        // 添加高亮文本
        textParts.push(
          <Text
            key={`highlight-${highlight.id}`}
            style={[styles.textContent, { backgroundColor: highlight.color }]}
          >
            {highlight.text}
          </Text>
        );
        lastIndex = highlight.position + highlight.text.length;
      }
    });

    // 添加最后一部分文本
    if (lastIndex < content.length) {
      textParts.push(
        <Text key="text-end" style={styles.textContent}>
          {content.substring(lastIndex)}
        </Text>
      );
    }

    return <Text>{textParts}</Text>;
  };

  const renderContent = () => {
    switch (fileType) {
      case 'txt':
        return (
          <ScrollView style={styles.textContainer}>
            {React.cloneElement(renderHighlightedContent(), {
              selectable: true,
              onSelectionChange: handleTextSelection
            })}
          </ScrollView>
        );
      case 'pdf':
        return (
          <Pdf
            source={{ uri: book.filePath }}
            style={styles.pdf}
            onPageChanged={(page) => setCurrentPage(page)}
            onLoadComplete={(numberOfPages) => {
              setTotalPages(numberOfPages);
              // 如果有保存的进度，可以在这里设置初始页面
            }}
          />
        );
      default:
        return (
          <View style={styles.unsupportedContainer}>
            <Text style={styles.unsupportedText}>不支持的文件格式: {fileType}</Text>
          </View>
        );
    }
  };

  return (
    <View style={styles.container}>
      {renderContent()}
      
      {selectedText ? (
        <View style={styles.selectionToolbar}>
          <TouchableOpacity style={styles.highlightButton} onPress={handleHighlight}>
            <Text style={styles.highlightButtonText}>高亮标注</Text>
          </TouchableOpacity>
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF8F0',
  },
  textContainer: {
    flex: 1,
    padding: 16,
  },
  textContent: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
  },
  pdf: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  unsupportedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  unsupportedText: {
    fontSize: 18,
    color: '#E74C3C',
  },
  selectionToolbar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFF',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#EEE',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  highlightButton: {
    backgroundColor: '#E67E22',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 4,
  },
  highlightButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
  },
  saveButton: {
    marginRight: 8,
  },
  saveButtonText: {
    color: '#E67E22',
    fontSize: 16,
  },
});

export default ReaderScreen;