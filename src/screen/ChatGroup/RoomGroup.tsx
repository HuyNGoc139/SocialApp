import React, { useCallback, useEffect, useRef, useState } from 'react';
import { TextInput } from 'react-native';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Colors,
  Button,
  ColorPicker,
} from 'react-native-ui-lib';
import {
  ArrowSquareLeft,
  Call,
  MessageRemove,
  Send2,
  Video,
} from 'iconsax-react-native';

import firestore from '@react-native-firebase/firestore';

import { useSelector } from 'react-redux';
import { RootState } from '../../redux/store';
import SpaceComponent from '../../components/SpaceComponent';
import MessageList from '../../components/MessageList';

const RoomGroup = ({ navigation, route }: any) => {
  const group = route.params;
  const [message, setMessage] = useState<any[]>([]);
  const user = useSelector((state: RootState) => state.auth.user);
  const [textRef, setTextRef] = useState('');
  useEffect(() => {
    getAllMessage();
  }, [user?.uid]);

  const handleSendMessage = useCallback(async () => {
    let message = textRef.trim();
    if (!message) return;
    try {
      const docRef = firestore().collection('Group').doc(group.id);
      const messagesRef = docRef.collection('messages');
      await messagesRef.add({
        userId: user?.uid,
        text: message,
        senderName: user?.username,
        createdAt: new Date(),
      });
      await docRef.update({
        lastMessageAt: firestore.FieldValue.serverTimestamp(),
        createdAt: new Date(),
        lastMessage: message,
      });
      console.log('Message sent successfully');
      setTextRef('');
    } catch (err) {
      console.log('Error sending message:', err);
    }
  }, [textRef, user?.uid, user?.username, group.id]);

  const getAllMessage = useCallback(() => {
    const messagesRef = firestore()
      .collection('Group')
      .doc(group.id)
      .collection('messages');

    const q = messagesRef.orderBy('createdAt', 'asc');
    const unsubscribe = q.onSnapshot(
      snapshot => {
        let allMessages = snapshot.docs.map(doc => ({
          id: doc.id,
          groupId: group.id,
          ...doc.data(),
        }));

        setMessage(allMessages);
      },
      error => {
        console.error('Error fetching messages:', error);
      },
    );

    return unsubscribe;
  }, [group.id]);

  return (
    <View flex style={{ backgroundColor: 'white' }}>
      <View
        style={{
          backgroundColor: 'white',
          justifyContent: 'flex-start',
          borderBottomWidth: 1,
          alignItems: 'center',
          height: 68,
          flexDirection: 'row',
          padding: 12,
          marginBottom: 12,
        }}
      >
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ArrowSquareLeft size={28} color="black" />
        </TouchableOpacity>
        <View style={{ flex: 1, flexDirection: 'row' }}>
          {group?.photo ? (
            <Image
              style={{
                height: 48,
                width: 48,
                borderRadius: 100,
                marginLeft: 12,
              }}
              source={{ uri: group.photo }}
            />
          ) : (
            <Image
              style={{
                height: 48,
                width: 48,
                borderRadius: 100,
                marginLeft: 12,
              }}
              source={require('../../assets/image/avatargroup.png')}
            />
          )}
          <Text
            numberOfLines={1}
            style={{
              lineHeight: 56,
              fontSize: 20,
              color: 'black',
              marginLeft: 10,
            }}
          >
            {group.groupName}
          </Text>
        </View>
        <View
          style={{ flex: 1, flexDirection: 'row', justifyContent: 'flex-end' }}
        >
          <Call size="28" color="black" />
          <SpaceComponent width={20} />
          <Video size="28" color="black" />
          <SpaceComponent width={20} />
          {/* <TouchableOpacity onPress={confirmDeleteMessages}> */}
          <TouchableOpacity>
            <MessageRemove size="28" color="black" />
          </TouchableOpacity>
        </View>
      </View>
      <View style={{ flex: 1, justifyContent: 'center' }}>
        <View style={{ flex: 1 }}>
          <MessageList messages={message} currenUser={user} type="group" />
        </View>
      </View>
      <View style={{ marginBottom: 16 }}>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderWidth: 1,
            borderRadius: 50,
            marginHorizontal: 10,
            paddingHorizontal: 10,
          }}
        >
          <TextInput
            value={textRef}
            placeholder="Type Message..."
            style={{ flex: 1, fontSize: 16 }}
            onChangeText={val => setTextRef(val)}
          />
          <TouchableOpacity
            onPress={handleSendMessage}
            style={{ marginRight: 10 }}
          >
            <Send2 size="28" color="black" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};
export default RoomGroup;
