import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaView, StyleSheet, Text, View } from 'react-native';
import LoginScreen from './src/Auth/Login';
import RegisterScreen from './src/Auth/Register';
import FriendScreen from './src/Friend';
import ProfileScreen from './src/ProfileScreen';
import HomeScreen from './src/HomeScreen';
import ChatScreen from './src/ChatScreen';
import { Home, Profile2User, Menu, Message } from 'iconsax-react-native';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore'; // Nhập firestore
import RoomScreen from './src/RoomScreen';
import CreatePostScreen from './src/CreatePostScreen';
import PostDetail from './src/PostDetail';
import { MenuProvider } from 'react-native-popup-menu';
import NotificationScreen from './src/NotificationScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Định nghĩa HomeTab như một component
const HomeTab: React.FC<{ friendRequestCount: number }> = ({ friendRequestCount }) => (
  <Tab.Navigator 
    screenOptions={({ route }) => ({
      headerShown: false,
      tabBarStyle: {
        backgroundColor: '#ffffff',
        borderTopColor: 'transparent',
        elevation: 0,
        height: 60,
      },
      tabBarIcon: ({ focused }) => {
        let icon;
        const iconColor = focused ? '#4267B2' : 'black'; // Màu xanh Facebook khi được chọn, màu xám khi không được chọn
        
        switch (route.name) {
          case 'Home':
            icon = <Home size="28" color={iconColor} variant={focused ? 'Bold' : 'Outline'} />;
            break;
          case 'Friend':
            icon = (
              <View>
                <Profile2User size="28" color={iconColor} variant={focused ? 'Bold' : 'Outline'} />
                {friendRequestCount > 0 && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{friendRequestCount}</Text>
                  </View>
                )}
              </View>
            );
            break;
          case 'Chat':
            icon = <Message size="28" color={iconColor} variant={focused ? 'Bold' : 'Outline'} />;
            break;
          case 'Profile':
            icon = <Menu size="28" color={iconColor} variant={focused ? 'Bold' : 'Outline'} />;
            break;
        }
        return icon;
      },
      tabBarLabel: ({ focused }) => {
        let label;
        switch (route.name) {
          case 'Home':
            label = 'Home';
            break;
          case 'Friend':
            label = 'Friends';
            break;
          case 'Chat':
            label = 'Chat';
            break;
          case 'Profile':
            label = 'Profile';
            break;
        }
        return <Text style={{ color: focused ? "#4267B2" : "black", fontSize: 12 }}>{label}</Text>;
      },
    })}>
    <Tab.Screen name='Home' component={HomeScreen} />
    <Tab.Screen name='Friend' component={FriendScreen} />
    <Tab.Screen name='Chat' component={ChatScreen} />
    <Tab.Screen name='Profile' component={ProfileScreen} />
  </Tab.Navigator>
);


const App: React.FC = () => {
  const [isLogin, setIsLogin] = useState(false);
  const [friendRequestCount, setFriendRequestCount] = useState(0);

  useEffect(() => {
    const unsubscribe = auth().onAuthStateChanged(user => {
      if (user) {
        setIsLogin(true);
        // Bắt đầu lắng nghe số lượng yêu cầu kết bạn khi người dùng đã đăng nhập
        handleGetFriendRequestCount(user.uid);
      } else {
        setIsLogin(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleGetFriendRequestCount = (userId: string) => {
    const unsubscribe = firestore()
      .collection('FriendRequests')
      .where('receiverId', '==', userId)
      .where('status', '==', 'pending')
      .onSnapshot(snapshot => {
        setFriendRequestCount(snapshot.size); // Cập nhật số lượng yêu cầu kết bạn
      }, error => {
        console.log('Error fetching friend requests:', error);
      });

    return () => unsubscribe(); // Clean up subscription khi component unmount
  };

  return (
    <MenuProvider>
      <SafeAreaView style={{ flex: 1 }}>
        <NavigationContainer>
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            {isLogin ? (
              <>
                <Stack.Screen name="HomeTab">
                  {() => <HomeTab friendRequestCount={friendRequestCount} />}
                </Stack.Screen>
                <Stack.Screen name="RoomScreen" component={RoomScreen} />
                <Stack.Screen name="CreatePostScreen" component={CreatePostScreen} />
                <Stack.Screen name="PostDetail" component={PostDetail} />
                <Stack.Screen name="NotificationScreen" component={NotificationScreen} />
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
    </MenuProvider>
  );
};

export default App;

const styles = StyleSheet.create({
  badge: {
    position: 'absolute',
    right: 0,
    top: -4,
    backgroundColor: 'red',
    borderRadius: 12,
    paddingHorizontal: 6,
  },
  badgeText: {
    color: 'white',
    fontSize: 12,
  },
});
