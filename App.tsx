import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaView } from 'react-native';
import LoginScreen from './src/Auth/Login';
import RegisterScreen from './src/Auth/Register';
import FriendScreen from './src/Friend';
import ProfileScreen from './src/ProfileScreen';
import HomeScreen from './src/HomeScreen';
import ChatScreen from './src/ChatScreen';
import { Home, Profile2User, Menu, Message } from 'iconsax-react-native';
import auth from '@react-native-firebase/auth';
import RoomScreen from './src/RoomScreen';
import CreatePostScreen from './src/CreatePostScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Định nghĩa HomeTab như một component
const HomeTab = () => (
  <Tab.Navigator screenOptions={{ headerShown: false }}>
    <Tab.Screen name='Home' component={HomeScreen} options={{ tabBarIcon: () => <Home size="28" color="#4267B2" /> }} />
    <Tab.Screen name='Friend' component={FriendScreen} options={{ tabBarIcon: () => <Profile2User size="28" color="#4267B2" /> }} />
    <Tab.Screen name='Chat' component={ChatScreen} options={{ tabBarIcon: () => <Message size="28" color="#4267B2" /> }} />
    <Tab.Screen name='Profile' component={ProfileScreen} options={{ tabBarIcon: () => <Menu size="28" color="#4267B2" /> }} />
  </Tab.Navigator>
);
const ChatStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="ChatScreen" component={ChatScreen} />
    <Stack.Screen name="RoomScreen" component={RoomScreen} />
  </Stack.Navigator>
);
const AuthNavigator = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="LoginScreen" component={LoginScreen} />
    <Stack.Screen name="RegisterScreen" component={RegisterScreen} />
  </Stack.Navigator>
);

function App() {
  const [isLogin, setIsLogin] = useState(false);

  useEffect(() => {
    auth().onAuthStateChanged(user => {
      if (user) {
        setIsLogin(true);
      } else {
        setIsLogin(false);
      }
    });
  }, []);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          {isLogin ? (
            <><Stack.Screen name="HomeTab" component={HomeTab} />
            <Stack.Screen name="RoomScreen" component={RoomScreen} />
            <Stack.Screen name="CreatePostScreen" component={CreatePostScreen} />
            </>
            
          ) : (
            <>
              <Stack.Screen name="LoginScreen" component={LoginScreen} />
              <Stack.Screen name="RegisterScreen" component={RegisterScreen} />
            </>
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaView>
  );
}

export default App;