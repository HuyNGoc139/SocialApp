import React, { useEffect, useRef, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, Text, Button, TouchableOpacity, Image, StatusBar, TextInput } from 'react-native';
import { ArrowSquareLeft, Back, Call, Camera, Send2, Video } from 'iconsax-react-native';
import RowComponent from './components/RowComponent';
import { colors } from './constants/color';
import { globalStyles } from './styles/globalStyles';
import SpaceComponent from './components/SpaceComponent';
import firestore from '@react-native-firebase/firestore'
import auth from '@react-native-firebase/auth'
import MessageList from './components/MessageList';
import { fontFamilies } from './constants/fontFamily';
import { User } from './models/user';
import ImagePicker from 'react-native-image-crop-picker';
import storage from '@react-native-firebase/storage'
const RoomScreen=({navigation,route}:any)=>{
    const userSelect=route.params
    const [message,setMessage]=useState<any[]>([])
    const [user,setUser]=useState<User>()
    const userCurrent=auth().currentUser
    const [textRef,setTextRef]=useState('')
    useEffect(() => {
    getUser()
    createRoom(); // Chỉ gọi createRoom sau khi getUser hoàn tất   
    getAllMessage()      
    }, [userCurrent?.uid]);
    useEffect(() => {
             
        }, []);
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
   
    const getRoomId = (userId1: string, userId2: string) => {
        const sortedIds = [userId1, userId2].sort();
        return sortedIds.join('-');
    };

    const createRoom = async () => {
        if (!userCurrent || !userSelect) {
            console.error('User information is missing.');
            return;
        }

        const roomId = getRoomId(userCurrent.uid ?? '', userSelect.uid);
        console.log('Room ID:', roomId);

        if (!roomId || roomId.includes('undefined')) {
            console.error('Invalid room ID:', roomId);
            return;
        }

        const roomRef = firestore().collection('Rooms').doc(roomId);
        const roomSnapshot = await roomRef.get();

        if (!roomSnapshot.exists) {
            await roomRef.set({
                userIds: [userCurrent.uid, userSelect.uid],
                createdAt: firestore.FieldValue.serverTimestamp(),
            });

            console.log('Room created with ID:', roomId);
        } else {
            console.log('Room already exists with ID:', roomId);
        }
    };
    const handleSendMessage= async()=>{
        
        let message = textRef.trim();
        if (!message) return;
        try {
            let roomId = getRoomId(userCurrent?.uid ?? '', userSelect.uid);
            const docRef = firestore().collection('Rooms').doc(roomId);
            const messagesRef = docRef.collection('messages');
            await messagesRef.add({
                userId: userCurrent?.uid,
                text: message,
                profileUrl: userCurrent?.photoURL,
                senderName: user?.username,
                // createdAt: firestore.FieldValue.serverTimestamp(),
                createdAt: new Date()
            });
            
            console.log('Message sent successfully');
            setTextRef(''); // Xóa nội dung input sau khi gửi
        } catch (err) {
            console.log('Error sending message:', err);
        }
    }



    const getAllMessage=()=>{
        let roomId = getRoomId(userCurrent?.uid ?? '', userSelect.uid);
        const messagesRef = firestore().collection('Rooms').doc(roomId).collection('messages');
    
        // Tạo query để sắp xếp các tin nhắn theo thời gian tạo
        const q = messagesRef.orderBy('createdAt', 'asc');
    
        // Lắng nghe thay đổi trên collection 'messages'
        const unsubscribe = q.onSnapshot((snapshot) => {
            // Lấy tất cả các tin nhắn từ snapshot
            let allMessages = snapshot.docs.map(doc => doc.data());
    
            // Cập nhật trạng thái với danh sách tin nhắn đã sắp xếp
            setMessage(allMessages);
        }, (error) => {
            console.error('Error fetching messages:', error);
        });
    
        return unsubscribe;

    }


    const handleSelectImage =async () => {
        ImagePicker.openPicker({
          width: 300,
          height: 400,
          cropping: true,
          mediaType:'any'
        }).then(async image => {
          console.log(image);
          // Gửi ảnh tới Firestore hoặc server
            const filename = image.path.substring(image.path.lastIndexOf('/') + 1); // Lấy tên file từ đường dẫn
            const reference = storage().ref(`Images/${filename}`); // Tạo reference đến Firebase Storage
            await reference.putFile(image.path)
            const url=await reference.getDownloadURL()
            console.log('url',url)
            
            let roomId = getRoomId(userCurrent?.uid ?? '', userSelect.uid);
            const docRef = firestore().collection('Rooms').doc(roomId);
            const messagesRef = docRef.collection('messages');
            await messagesRef.add({
                userId: userCurrent?.uid,
                url:url,
                profileUrl: userCurrent?.photoURL,
                senderName: user?.username,
                // createdAt: firestore.FieldValue.serverTimestamp(),
                createdAt: new Date()
            });


        }).catch(error => {
          console.log('Error selecting image:', error);
        });
      };
    
    return(
        <View style={{flex:1,backgroundColor:'white'}}>
            <View style={{backgroundColor:'white',
            justifyContent:'flex-start',
            borderBottomWidth:1,
            alignItems:'center',
            height:68,
            flexDirection:'row',
            padding:12,
            marginBottom:12
            }}>
            <TouchableOpacity onPress={()=>navigation.goBack()}>
            <ArrowSquareLeft size={28} color='black'/>
            </TouchableOpacity>
            <View style={{flex:1,flexDirection:'row'}}>
            <Image style={{borderRadius:100,width:50,height:50,marginLeft:10}} source={require('./asset/image/avatar.png')}/>
            <Text style={{lineHeight:56,fontSize:20,color:'black',marginLeft:10}}>{userSelect.userName}</Text>
            </View>
            <View style={{flex:1,flexDirection:'row',justifyContent:'flex-end'}}>
            <Call size="28" color="black"/>
            <SpaceComponent width={20}/>
            <Video size="28" color="black"/>
            </View>
            </View>
            <View style={{flex:1,justifyContent:'center'}}>
            <View style={{flex:1}}>
                <MessageList messages={message} currenUser={userCurrent}/>
            </View>
            </View>
            <View style={{marginBottom:16,}}>
                    
                <View style={{flexDirection:'row',
                justifyContent:'space-between',alignItems:'center',
                borderWidth:1,
                borderRadius:50,}}>
                    <TouchableOpacity style={{marginLeft:10}} onPress={handleSelectImage}>
                    <Camera size="28" color="black"/>
                    </TouchableOpacity>
                    <TextInput 
                    value={textRef}
                    placeholder='Type Message...'
                    style={{flex:1,fontFamily:fontFamilies.regular,fontSize:16,}}
                    onChangeText={val=>setTextRef(val)}
                    />
                    <TouchableOpacity onPress={handleSendMessage} style={{marginRight:10}}>
                    <Send2 size="28"color="black"/>
                    </TouchableOpacity>

                </View>
            </View>
        </View>
    )
}
export default RoomScreen