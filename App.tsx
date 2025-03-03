import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar, StyleSheet } from 'react-native';

// 导入屏幕组件
import BookshelfScreen from './src/screens/BookshelfScreen';
import ReaderScreen from './src/screens/ReaderScreen';

// 定义导航堆栈参数列表类型
type RootStackParamList = {
  Bookshelf: undefined;
  Reader: { book: Book };
};

// 定义Book接口
interface Book {
  id: string;
  title: string;
  author?: string;
  filePath: string;
  progress: number;
}

// 创建导航堆栈
const Stack = createNativeStackNavigator<RootStackParamList>();

function App(): React.JSX.Element {
  return (
    <NavigationContainer>
      <StatusBar backgroundColor="#FFF8F0" barStyle="dark-content" />
      <Stack.Navigator
        initialRouteName="Bookshelf"
        screenOptions={{
          headerStyle: {
            backgroundColor: '#FFF8F0',
          },
          headerTintColor: '#E67E22',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
          contentStyle: {
            backgroundColor: '#FFF8F0',
          },
        }}>
        <Stack.Screen
          name="Bookshelf"
          component={BookshelfScreen}
          options={{
            title: '我的书架',
          }}
        />
        <Stack.Screen
          name="Reader"
          component={ReaderScreen}
          options={{
            headerShown: true,
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF8F0',
  },
});

export default App;
