import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Image, TextInput } from 'react-native';
import { View, Text, TouchableOpacity } from 'react-native-ui-lib';
import {
  ArrowSquareLeft,
  Call,
  Edit2,
  Send2,
  Video,
  VideoAdd,
} from 'iconsax-react-native';
import ImagePicker from 'react-native-image-crop-picker';
import storage from '@react-native-firebase/storage';
import firestore from '@react-native-firebase/firestore';

import { useSelector } from 'react-redux';
import { RootState } from '../../redux/store';
import SpaceComponent from '../../components/SpaceComponent';
import MessageGroupList from '../../components/chat/MessageGroupList';
import ModalChangeName from '../../components/chat/ModalChangeName';

const RoomGroup = ({ navigation, route }: any) => {
  const group = route.params;
  const [message, setMessage] = useState<any[]>([]);
  const user = useSelector((state: RootState) => state.auth.user);
  const [textRef, setTextRef] = useState('');
  const [visible, setVisible] = useState(false);
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

  const handleSelectImage = async () => {
    ImagePicker.openPicker({
      width: 300,
      height: 400,
      cropping: true,
      mediaType: 'any',
    })
      .then(async image => {
        const filename = image.path.substring(image.path.lastIndexOf('/') + 1);
        const reference = storage().ref(`Images/${filename}`);
        await reference.putFile(image.path);
        const url = await reference.getDownloadURL();
        const docRef = firestore().collection('Group').doc(group.id);
        const messagesRef = docRef.collection('messages');
        await messagesRef.add({
          userId: user?.uid,
          url: url,
          senderName: user?.username,
          createdAt: new Date(),
        });
      })
      .catch(error => {
        console.log('Error selecting image:', error);
      });
  };
  const handleSelectMedia = async () => {
    try {
      const media = await ImagePicker.openPicker({
        mediaType: 'video',
      });
      const filename = media.path.substring(media.path.lastIndexOf('/') + 1);
      const reference = storage().ref(`Media/${filename}`);
      await reference.putFile(media.path);
      const url = await reference.getDownloadURL();
      const docRef = firestore().collection('Group').doc(group.id);
      const messagesRef = docRef.collection('messages');
      await messagesRef.add({
        userId: user?.uid,
        videourl: url,
        senderName: user?.username,
        createdAt: new Date(),
      });
    } catch (error) {
      console.log('Error selecting media:', error);
    }
  };

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
          {group?.url ? (
            <Image
              style={{
                height: 48,
                width: 48,
                borderRadius: 100,
                marginLeft: 12,
              }}
              source={{ uri: group.url }}
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
          <TouchableOpacity
            onPress={() => navigation.navigate('GroupDetails', { ...group })}
          >
            <Image
              source={require('../../assets/inform.png')}
              style={{ width: 24, height: 24 }}
            />
          </TouchableOpacity>
        </View>
      </View>
      <View style={{ flex: 1, justifyContent: 'center' }}>
        <View style={{ flex: 1 }}>
          <MessageGroupList messages={message} currenUser={user} />
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
            style={{ marginLeft: 10 }}
            onPress={handleSelectImage}
          >
            <Image
              source={require('../../assets/image.png')}
              style={{ width: 28, height: 28 }}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={{ marginLeft: 10 }}
            onPress={handleSelectMedia}
          >
            <VideoAdd size="28" color="black" />
          </TouchableOpacity>
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
