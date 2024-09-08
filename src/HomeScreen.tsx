import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, Text, Button, StyleSheet, TouchableOpacity, Image } from 'react-native';
import firestore from '@react-native-firebase/firestore'
import auth from '@react-native-firebase/auth'
import { AddSquare, Heart, Velas } from 'iconsax-react-native';
import SpaceComponent from './components/SpaceComponent';
import { User } from './models/user';
import { fontFamilies } from './constants/fontFamily';
const HomeScreen=({navigation}:any)=>{
  useEffect(()=>{
 getUser()
  },[])
  const [user,setUser]=useState<User>()
 const userCurrent = auth().currentUser;      
 const getUser=()=>{
    firestore().doc(`Users/${userCurrent?.uid}`).onSnapshot((snap:any)=>{
        if(snap.exists){

            setUser({
                ...snap.data()
            })
        }
        else{console.log('task not found')}
    })
}

    return(
        <View style={{flex:1}}>
            <View style={styles.header}> 
                <Text style={{flex:1,marginLeft:10,color:'black',fontSize:24,fontFamily:fontFamilies.regular}}>ScocialAPP</Text>
                <View style={{flexDirection:'row',justifyContent:'center',
        alignItems:'center',}}>
                <TouchableOpacity>
                <Heart size="28" color="black"/>
                </TouchableOpacity>
                <SpaceComponent width={10}/>
                <TouchableOpacity onPress={() => navigation.navigate('CreatePostScreen',{user})}>
                <AddSquare size="28" color="black"/>
                </TouchableOpacity>
                <SpaceComponent width={10}/>
                <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
         {user?.url?<Image style={{ height: 42, width: 42, borderRadius: 100, marginRight: 12 }} source={{uri:user.url}} /> : <Image style={{ height: 48, width: 48, borderRadius: 100, marginRight: 12 }} source={require('./asset/image/avatar.png')} />}
        </TouchableOpacity>
                </View>
            </View>
        </View>
    )
}
export default HomeScreen
const styles=StyleSheet.create({
    header:{
        justifyContent:'center',
        alignItems:'center',
        borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    height: 80,
    flexDirection: 'row',
    backgroundColor:'white'
    },
})