import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import {
  View,
  Text,
  Button,
  TouchableOpacity,
  Image,
  StyleSheet,
} from 'react-native';
import { colors } from '../constants/color';
import { fontFamilies } from '../constants/fontFamily';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import { handleDateTime } from '../funtion/handleDateTime';
import { formatDate } from '../funtion/formatDate';
import { User } from '../models/user';
interface Props {
  userName: string;
  uid: string;
  img?: [];
  onPress: () => void;
  currentuser: any;
  url?: string;
}
const ChatItem = (props: Props) => {
  const { userName, uid, onPress, currentuser, url } = props; //uid = user select
  const [lastMessage, setLastmessage] = useState<any>(undefined);
  const [user, setUser] = useState<User>();
  useEffect(() => {
    getUser();
  }, []);
  const getUser = () => {
    firestore()
      .doc(`Users/${uid}`)
      .onSnapshot((snap: any) => {
        if (snap.exists) {
          setUser({
            ...snap.data(),
          });
        } else {
          console.log('task not found');
        }
      });
  };
  useEffect(() => {
    let roomId = getRoomId(currentuser?.uid ?? '', uid);
    const messagesRef = firestore()
      .collection('Rooms')
      .doc(roomId)
      .collection('messages');

    const q = messagesRef.orderBy('createdAt', 'desc');
    const unsubscribe = q.onSnapshot(
      snapshot => {
        let allMessages = snapshot.docs.map(doc => doc.data());
        setLastmessage(allMessages[0] ? allMessages[0] : null);
      },
      error => {
        console.error('Error fetching messages:', error);
      },
    );

    return unsubscribe;
  }, []);
  const getRoomId = (userId1: string, userId2: string) => {
    const sortedIds = [userId1, userId2].sort();
    return sortedIds.join('-');
  };
  const renderLastmessage = () => {
    if (typeof lastMessage == 'undefined') return 'Loading...';
    if (lastMessage) {
      if (currentuser.uid == lastMessage.userId) {
        return `You: ${lastMessage.url ? 'Image' : lastMessage.text}`;
      } else return lastMessage.url ? 'Image' : lastMessage.text;
    } else {
      return 'Say hi!!!';
    }
  };
  const renderTime = () => {
    if (lastMessage) {
      let date = new Date(lastMessage?.createdAt?.seconds * 1000);
      return formatDate(date);
    } else {
      return 'Time';
    }
  };
  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      {user?.url ? (
        <Image style={styles.image} source={{ uri: user.url }} />
      ) : (
        <Image
          style={styles.image}
          source={require('../assets/image/avatar.png')}
        />
      )}
      <View style={{ flex: 1, marginLeft: 10 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Text style={styles.textBold}>{userName}</Text>
          <Text style={styles.text}>{renderTime()}</Text>
        </View>
        <Text style={styles.text}>{renderLastmessage()}</Text>
      </View>
    </TouchableOpacity>
  );
};
const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    borderBottomWidth: 1,
    marginLeft: 10,
    marginRight: 10,
    padding: 8,
  },
  text: {
    fontFamily: fontFamilies.regular,
    fontSize: 16,
  },
  textBold: {
    fontFamily: fontFamilies.semiBold,
    color: 'black',
    fontSize: 18,
  },
  image: {
    height: 60,
    width: 60,
    borderRadius: 100,
  },
});
export default ChatItem;
