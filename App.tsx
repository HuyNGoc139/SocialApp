import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { AppState, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import LoginScreen from './src/Auth/Login';
import RegisterScreen from './src/Auth/Register';
import FriendScreen from './src/screen/Friend';
import ProfileScreen from './src/screen/ProfileScreen';
import HomeScreen from './src/screen/HomeScreen';
import ChatScreen from './src/screen/ChatScreen';
import { Home, Profile2User, Menu, Message } from 'iconsax-react-native';
import auth from '@react-native-firebase/auth';
import RoomScreen from './src/screen/RoomScreen';
import CreatePostScreen from './src/screen/CreatePostScreen';
import PostDetail from './src/screen/PostDetail';
import { MenuProvider } from 'react-native-popup-menu';
import NotificationScreen from './src/screen/NotificationScreen';
import ModalAddSubtasks from './src/components/account/ModalAddSubtasks';
import ProfileModalComponent from './src/components/friend/ProfileFriend';
import { Provider } from 'react-redux';
import store from './src/redux/store';
import { PaperProvider } from 'react-native-paper';
import RNBootSplash from 'react-native-bootsplash';
import RoomGroup from './src/screen/ChatGroup/RoomGroup';
import { updateUserStatus } from './src/funtion/updateUserStatus';
import { createNotifications } from 'react-native-notificated';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import GroupDetails from './src/screen/ChatGroup/GroupDetails';
import PinCodeScreen from './src/screen/PinCode';
const { NotificationsProvider, useNotifications, ...events } =
  createNotifications();
const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Định nghĩa HomeTab như một component
const HomeTab = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      headerShown: false,
      tabBarStyle: {
        backgroundColor: '#ffffff',
        borderTopColor: 'transparent',
        elevation: 0,
        height: 56,
      },
      tabBarIcon: ({ focused }) => {
        let icon;
        const iconColor = focused ? '#4267B2' : 'black'; // Màu xanh Facebook khi được chọn, màu xám khi không được chọn

        switch (route.name) {
          case 'Home':
            icon = (
              <Home
                size="28"
                color={iconColor}
                variant={focused ? 'Bold' : 'Outline'}
              />
            );
            break;
          case 'Friend':
            icon = (
              <Profile2User
                size="28"
                color={iconColor}
                variant={focused ? 'Bold' : 'Outline'}
              />
            );
            break;
          case 'Chat':
            icon = (
              <Message
                size="28"
                color={iconColor}
                variant={focused ? 'Bold' : 'Outline'}
              />
            );
            break;
          case 'Profile':
            icon = (
              <Menu
                size="28"
                color={iconColor}
                variant={focused ? 'Bold' : 'Outline'}
              />
            );
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
        return (
          <Text style={{ color: focused ? '#4267B2' : 'black', fontSize: 12 }}>
            {label}
          </Text>
        );
      },
    })}
  >
    <Tab.Screen name="Home" component={HomeScreen} />
    <Tab.Screen name="Friend" component={FriendScreen} />
    <Tab.Screen name="Chat" component={ChatScreen} />
    <Tab.Screen name="Profile" component={ProfileScreen} />
  </Tab.Navigator>
);

const App: React.FC = () => {
  const [isLogin, setIsLogin] = useState(false);
  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (nextAppState === 'active') {
        updateUserStatus('online');
      } else {
        updateUserStatus('offline');
      }
    });

    return () => {
      subscription.remove();
    };
  }, []);
  useEffect(() => {
    // Ẩn màn hình khởi động sau khi ứng dụng đã tải xong
    RNBootSplash.hide({ fade: true });
  }, []);
  useEffect(() => {
    const unsubscribe = auth().onAuthStateChanged(user => {
      if (user) {
        setIsLogin(true);
      } else {
        setIsLogin(false);
      }
    });
    return () => unsubscribe();
  }, []);
  return (
    <PaperProvider>
      <Provider store={store}>
        <MenuProvider>
          <GestureHandlerRootView style={{ flex: 1 }}>
            <NotificationsProvider>
              <SafeAreaView style={{ flex: 1 }}>
                <NavigationContainer>
                  <Stack.Navigator screenOptions={{ headerShown: false }}>
                    {isLogin ? (
                      <>
                        <Stack.Screen name="HomeTab" component={HomeTab} />
                        <Stack.Screen
                          name="RoomScreen"
                          component={RoomScreen}
                        />
                        <Stack.Screen name="RoomGroup" component={RoomGroup} />
                        <Stack.Screen
                          name="GroupDetails"
                          component={GroupDetails}
                        />
                        <Stack.Screen
                          name="CreatePostScreen"
                          component={CreatePostScreen}
                        />
                        <Stack.Screen
                          name="PostDetail"
                          component={PostDetail}
                        />
                        <Stack.Screen
                          name="NotificationScreen"
                          component={NotificationScreen}
                        />
                        <Stack.Screen
                          name="Update"
                          component={ModalAddSubtasks}
                        />
                        {/* <Stack.Screen
                          name="PinCode"
                          component={PinCodeScreen}
                        /> */}
                        <Stack.Screen
                          name="ProfileModalComponent"
                          component={ProfileModalComponent}
                          options={{
                            presentation: 'modal', // Thiết lập trình bày như modal
                            headerShown: false, // Ẩn header nếu cần
                          }}
                        />
                      </>
                    ) : (
                      <>
                        <Stack.Screen
                          name="LoginScreen"
                          component={LoginScreen}
                        />
                        <Stack.Screen
                          name="RegisterScreen"
                          component={RegisterScreen}
                        />
                      </>
                    )}
                  </Stack.Navigator>
                </NavigationContainer>
              </SafeAreaView>
            </NotificationsProvider>
          </GestureHandlerRootView>
        </MenuProvider>
      </Provider>
    </PaperProvider>
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
