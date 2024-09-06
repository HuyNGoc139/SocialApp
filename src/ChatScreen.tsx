import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, FlatList, TextInput } from 'react-native';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import ChatItem from './components/ChatItem';
import { SelectModel } from './models/SelectModal';
import { SearchNormal1 } from 'iconsax-react-native';
import { fontFamilies } from './constants/fontFamily';
import { colors } from './constants/color';

const ChatScreen = ({ navigation }: any) => {
  const [userSelect, setUserSelect] = useState<SelectModel[]>([]);
  const [searchKey, setSearchKey] = useState('');
  const [currentUser, setCurrentUser] = useState<any>(null);
  const[lastMessage,setLastmessage]=useState<any>(undefined)
 
  useEffect(() => {
    const unsubscribe = auth().onAuthStateChanged((user) => {
      if (user) {
        setCurrentUser(user);
        handleGetAllUsers(user.uid);
      }
    });
    return () => unsubscribe(); // Clean up the subscription on unmount
  }, []);
  
  const handleGetAllUsers = async (currentUserId: string) => {

    const getRoomId = (currentUserId: string, userId2: string) => {
    const sortedIds = [currentUserId, userId2].sort();
    return sortedIds.join('-');
};

    
    try {
      const snapshot = await firestore().collection('Users').get();
      if (snapshot.empty) {
        console.log('User not found');
      } else {
        const items: SelectModel[] = [];
        snapshot.forEach((item) => {
          if (item.id !== currentUserId) {
            items.push({
              userName: item.data().username,
              uid: item.id,
            });
           
          }
        });
        setUserSelect(items);
        
        //   items.forEach((i)=>{
        //     let roomId = getRoomId(currentUserId ?? '', i.uid);
        //     const messagesRef = firestore().collection('Rooms').doc(roomId).collection('messages');
   
        // // Tạo query để sắp xếp các tin nhắn theo thời gian tạo
        // const q = messagesRef.orderBy('createdAt', 'desc');
    
        // // Lắng nghe thay đổi trên collection 'messages'
        // const unsubscribe = q.onSnapshot((snapshot) => {
        //     // Lấy tất cả các tin nhắn từ snapshot
        //     let allMessages = snapshot.docs.map(doc => doc.data());
        //   console.log(allMessages)
            
         
        // }, (error) => {
        //     console.error('Error fetching messages:', error);
        // });
        //   })
     
      }
    } catch (err) {
      console.log(err);
    }
  };
  
  return (
    <View style={{ flex: 1 }}>
      <View style={styles.chatHeader}>
        <Text style={{ fontFamily: fontFamilies.regular, fontSize: 24, color: 'white', marginLeft: 12 }}>Chats</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
          <Image style={{ height: 48, width: 48, borderRadius: 100, marginRight: 12 }} source={require('./asset/image/avatar.png')} />
        </TouchableOpacity>
      </View>
      <View style={styles.searchContainer}>
        <SearchNormal1 style={{ marginLeft: 10 }} size={28} color='black' />
        <TextInput onChangeText={val => setSearchKey(val)} style={{ flex: 1, marginLeft: 10 }} />
      </View>
      <View>
        <FlatList
          horizontal
          data={userSelect.filter(ele => ele.userName.toLowerCase().includes(searchKey))}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.userItem}>
              <Image style={styles.avatar} source={require('./asset/image/avatar.png')} />
              <Text numberOfLines={1} ellipsizeMode="tail">{item.userName}</Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {userSelect.length > 0 ? (
        <FlatList
          data={userSelect}
          keyExtractor={(item) => item.uid}
          renderItem={({ item }) => (
            <ChatItem onPress={() => navigation.navigate('RoomScreen',{...item})} 
            key={item.uid}
            currentuser={currentUser} 
            userName={item.userName} 
            uid={item.uid} />
          )}
        />
      ) : (
        <Text>No Messages</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  chatHeader: {
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.fb,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    height: 80,
    flexDirection: 'row'
  },
  searchContainer: {
    margin: 8,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 10
  },
  userItem: {
    margin: 10,
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    height: 80
  },
  avatar: {
    height: 40,
    width: 40,
    borderRadius: 100
  }
});

export default ChatScreen;
