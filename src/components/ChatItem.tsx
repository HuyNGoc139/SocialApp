import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, Text, Button, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { colors } from '../constants/color';
import { fontFamilies } from '../constants/fontFamily';
import firestore from '@react-native-firebase/firestore'
import auth from '@react-native-firebase/auth'
import { handleDateTime } from '../funtion/handleDateTime';
import { formatDate } from '../funtion/formatDate';
import { User } from '../models/user';
interface Props{
    userName:string,
    uid:string,
    img?:[],
    onPress: () => void;
    currentuser:any
}
const ChatItem=(props:Props)=>{
    const{userName,uid,onPress,currentuser}=props //uid = user select
    const[lastMessage,setLastmessage]=useState<any>(undefined)
    const [user,setUser]=useState<User>()
    useEffect(()=>{
        getUser()
    },[])
    const getUser=()=>{
        firestore().doc(`Users/${uid}`).onSnapshot((snap:any)=>{
            if(snap.exists){
    
                setUser({
                    ...snap.data()
                })
            }
            else{console.log('task not found')}
        })
    }
    useEffect(()=>{
        let roomId = getRoomId(currentuser?.uid ?? '', uid);
        const messagesRef = firestore().collection('Rooms').doc(roomId).collection('messages');
    
        // Tạo query để sắp xếp các tin nhắn theo thời gian tạo
        const q = messagesRef.orderBy('createdAt', 'desc');
    
        // Lắng nghe thay đổi trên collection 'messages'
        const unsubscribe = q.onSnapshot((snapshot) => {
            // Lấy tất cả các tin nhắn từ snapshot
            let allMessages = snapshot.docs.map(doc => doc.data());
    
            // Cập nhật trạng thái với danh sách tin nhắn đã sắp xếp
            setLastmessage(allMessages[0] ? allMessages[0] : null);
        }, (error) => {
            console.error('Error fetching messages:', error);
        });
    
        return unsubscribe;

    },[])
    // console.log(lastMessage)
    const getRoomId = (userId1: string, userId2: string) => {
        const sortedIds = [userId1, userId2].sort();
        return sortedIds.join('-');
    };
    const renderLastmessage=()=>{
        if(typeof lastMessage=='undefined') return 'Loading...';
        if(lastMessage){
            if(currentuser.uid==lastMessage.userId){
                return `You: ${lastMessage.url? 'Image' :lastMessage.text}`
            }
            else return lastMessage.url? 'Image' :lastMessage.text
        }
        else {return 'Say hi!!!'}
    }
    const renderTime = () => {
        if (lastMessage) {
          let date=new Date(lastMessage?.createdAt?.seconds * 1000);
          return formatDate(date)
        } else {
          return 'Time';
        }
      };
    return(
        <TouchableOpacity style={styles.container} onPress={onPress}>
            {user?.url?<Image style={{height:60,width:60,borderRadius:100}} source={{uri:user.url}}/> :<Image style={{height:60,width:60,borderRadius:100}} source={require('../asset/image/avatar.png')}/>}
            <View style={{flex:1,marginLeft:10}}>
                <View style={{flexDirection:'row',justifyContent:'space-between'}}>
                <Text style={{fontFamily:fontFamilies.semiBold,color:'black',fontSize:18}}>{userName}</Text>
                <Text style={{fontFamily:fontFamilies.regular,fontSize:16}}>{renderTime()}</Text>
                </View>
                <Text style={{fontFamily:fontFamilies.regular,fontSize:16}}>{renderLastmessage()}</Text>
            </View>
        </TouchableOpacity>
    )
}
const styles = StyleSheet.create({
    container:{
        flexDirection:'row',
        justifyContent:'center',
        borderBottomWidth:1,
        margin:10,
        padding:8
    }
  });
export default ChatItem