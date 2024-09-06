import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, Text, Button } from 'react-native';
import firestore from '@react-native-firebase/firestore'
import auth from '@react-native-firebase/auth'
const HomeScreen=()=>{
  useEffect(()=>{
 
  },[])
 const user = auth().currentUser;      

    return(
        <View>
            <Text>HomeScreen</Text>
        </View>
    )
}
export default HomeScreen