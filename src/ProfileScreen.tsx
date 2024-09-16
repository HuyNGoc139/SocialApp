import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, Text, Button, Alert, Image, TouchableOpacity } from 'react-native';
import firestore from '@react-native-firebase/firestore'
import auth from '@react-native-firebase/auth'
import ButtonComponent from './components/ButtonComponent';
import { globalStyles } from './styles/globalStyles';
import TextComponent from './components/TextComponent';
import { colors } from './constants/color';
import TitleComponent from './components/TitleComponent';
import { fontFamilies } from './constants/fontFamily';
import RowComponent from './components/RowComponent';
import { Information, Logout } from 'iconsax-react-native';
import SpaceComponent from './components/SpaceComponent';
import { handleDateTime } from './funtion/handleDateTime';
import ModalAddSubtasks from './components/ModalAddSubtasks';
import { User } from './models/user';
interface FirebaseTimestamp {
  seconds: number;
  nanoseconds: number;
}
const initialValue={
  email:'',
  username:'',
}

const ProfileScreen=({navigation}:any)=>{
  const [isVisibleModalSubTasks, setIsVisibleModalSubTasks] = useState(false);
  const userCurrent = auth().currentUser;  
  const [user,setUser]=useState<User>()
  useEffect(()=>{
    getUser()
},[userCurrent?.uid])
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
    const handleLogout = () => {
        auth()
          .signOut()
          .then(() => {
            Alert.alert('Đăng xuất thành công!');
            // Điều hướng về màn hình đăng nhập hoặc màn hình khác
          })
          .catch(error => {
            Alert.alert('Đăng xuất thất bại!', error.message);
          });
      };
      
      const getFormattedDate = (timestamp: FirebaseTimestamp) => {
        if (!timestamp) return '';
        const date = new Date(timestamp.seconds * 1000);
        return handleDateTime.DateString(date); // Hoặc sử dụng `date.toISOString()` để định dạng khác
      };
      console.log('====================================');
      console.log(user);
      console.log('====================================');
    return(
        <>
        <View style={{flex:1}}>
          <View style={{flex:1}}>
            <View style={globalStyles.header}>
              <Text style={globalStyles.textHeader}>Profile</Text>
            </View>
          <View style={{justifyContent:'center',alignItems:'center',width:'100%',height:320}}>
            {user?.url? <Image style={{borderRadius:5000,width:300,height:300}} source={{uri:user.url}}/>:<Image style={{borderRadius:5000,width:300,height:300}} source={require('./asset/image/avatar.png')}/>}
          </View>
          <View style={{flex:1,backgroundColor:'#ababab',
          borderRadius:20 ,
          justifyContent:'center',
          alignItems:'center',
          margin:12}}>
            <View style={{width: '90%', height:180,justifyContent:'space-evenly'}}>
            <Text style={{fontFamily:fontFamilies.regular,fontSize:18,color:'black'}}>UserName: {user?.username}</Text>
            <Text style={{fontFamily:fontFamilies.regular,fontSize:18,color:'black'}}>Email: {user?.email}</Text>
            <Text style={{fontFamily:fontFamilies.regular,fontSize:18,color:'black'}}>Date Of Birth: {getFormattedDate(user?.DateBitrhDay)}</Text>
            <Text style={{fontFamily:fontFamilies.regular,fontSize:18,color:'black'}}>createAt: {handleDateTime.DateString(userCurrent?.metadata.creationTime)}</Text>
            </View>
            <View style={{flex:1}}>
            <RowComponent styles={{width:'90%'}}>
              <Text style={{fontFamily:fontFamilies.regular,fontSize:18,color:'black',flex:1}}>Update information</Text>
                <TouchableOpacity onPress={()=>setIsVisibleModalSubTasks(true)}>
                <Information size="28"color="black"/>
                </TouchableOpacity>
              </RowComponent>
              <SpaceComponent height={12}></SpaceComponent>
              <RowComponent styles={{width:'90%'}}>
              <Text style={{fontFamily:fontFamilies.regular,fontSize:18,color:'black',flex:1}}>LogOut</Text>
                <TouchableOpacity onPress={handleLogout}>
                <Logout size="28"color="black"/>
                </TouchableOpacity>
              </RowComponent>
            </View>

          </View>
          </View>
        </View>
        <ModalAddSubtasks visible={isVisibleModalSubTasks}
        userId={userCurrent?.uid??''} 
        onClose={()=>setIsVisibleModalSubTasks(false)}/>
        </>
    )
}
export default ProfileScreen