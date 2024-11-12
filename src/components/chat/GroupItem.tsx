import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';

import firestore from '@react-native-firebase/firestore';
import { useSelector } from 'react-redux';
import { RootState } from '../../redux/store';
import { formatDate } from '../../funtion/formatDate';

interface Props {
  userName: string;
  groupid: string;
  img?: [];
  onPress: () => void;
  currentuser: any;
  url?: string;
}

const GroupItem = (props: Props) => {
  const { userName, groupid, onPress, currentuser, url } = props; //uid = user select
  const [lastMessage, setLastmessage] = useState<any>(undefined);
  const user = useSelector((state: RootState) => state.auth.user);

  useEffect(() => {
    const messagesRef = firestore()
      .collection('Group')
      .doc(groupid)
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

  const renderLastmessage = () => {
    if (typeof lastMessage == 'undefined') return 'Loading...';
    if (lastMessage) {
      if (user?.uid == lastMessage.userId) {
        return `You: ${lastMessage.url ? 'Image' : lastMessage.text}`;
      } else
        return `${lastMessage.senderName}: ${
          lastMessage.url ? 'Image' : lastMessage.text
        }`;
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
      {url ? (
        <Image style={styles.image} source={{ uri: url }} />
      ) : (
        <Image
          style={styles.image}
          source={require('../../assets/image/avatargroup.png')}
        />
      )}
      <View style={{ flex: 1, marginLeft: 10 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Text numberOfLines={2} style={[styles.textBold, { width: '85%' }]}>
            {userName}
          </Text>
          <Text style={styles.text}>{renderTime()}</Text>
        </View>
        <Text numberOfLines={1} style={styles.text}>
          {renderLastmessage()}
        </Text>
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
    color: '#888',
    fontSize: 14,
  },
  textBold: {
    color: 'black',
    fontSize: 16,
    fontWeight: '600',
  },
  image: {
    height: 60,
    width: 60,
    borderRadius: 100,
  },
});
export default GroupItem;
