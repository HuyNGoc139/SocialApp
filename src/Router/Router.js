import {createNativeStackNavigator} from '@react-navigation/native-stack';
import React, {useEffect, useState} from 'react';


// import auth from '@react-native-firebase/auth'
import LoginScreen from '../Auth/Login';
import RegisterScreen from '../Auth/Register';
import HomeScreen from '../HomeScreen';

const Router = () => {
  

  const Stack = createNativeStackNavigator();
  const MainNavigator = (
    <Stack.Navigator
      >
      <Stack.Screen name="HomeScreen" component={HomeScreen} />
    </Stack.Navigator>
  );
  const AuthNavigator = (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}>
      <Stack.Screen name="LoginScreen" component={LoginScreen} />
<Stack.Screen name="RegisterScreen" component={RegisterScreen} />
    </Stack.Navigator>
  );

  const [isLogin, setIsLogin] = useState(true);
//   useEffect(() => {
//     auth().onAuthStateChanged(user => {
//       if (user) {
//         setIsLogin(true);
//       } else {
//         setIsLogin(false);
//       }
//     });
//   }, []);
    

  return isLogin ? MainNavigator : AuthNavigator;
};

export default Router;
