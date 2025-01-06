import React, { useEffect, useRef, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import {
  View,
  Text,
  Button,
  TouchableOpacity,
  Image,
  StatusBar,
  TextInput,
  Alert,
} from 'react-native';
import {
  ArrowSquareLeft,
  Back,
  Call,
  Camera,
  MessageRemove,
  Send2,
  Video,
  VideoAdd,
} from 'iconsax-react-native';
import SpaceComponent from '../components/SpaceComponent';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import MessageList from '../components/chat/MessageList';
import { fontFamilies } from '../constants/fontFamily';
import { User } from '../models/user';
import ImagePicker from 'react-native-image-crop-picker';
import storage from '@react-native-firebase/storage';
import axios from 'axios';

const RoomScreen = ({ navigation, route }: any) => {
  const userSelect = route.params;
  const [message, setMessage] = useState<any[]>([]);
  const [user, setUser] = useState<User>();
  const userCurrent = auth().currentUser;
  const [textRef, setTextRef] = useState('');
  useEffect(() => {
    getUser();
    createRoom(); // Chỉ gọi createRoom sau khi getUser hoàn tất
    getAllMessage();
  }, [userCurrent?.uid]);
  // useEffect(() => {

  //     }, []);
  const getUser = () => {
    firestore()
      .doc(`Users/${userCurrent?.uid}`)
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
  const handleSendMessage = async () => {
    let message = textRef.trim();
    if (!message) return;
    try {
      let roomId = getRoomId(userCurrent?.uid ?? '', userSelect.uid);
      const docRef = firestore().collection('Rooms').doc(roomId);
      const messagesRef = docRef.collection('messages');
      const response = await axios.post(
        'http://192.168.4.77:3000/api/message/encrypt',
        {
          message,
        },
      );
      await messagesRef.add({
        userId: userCurrent?.uid,
        text: response.data?.encryptedData || '',
        senderName: user?.username,
        // createdAt: firestore.FieldValue.serverTimestamp(),
        createdAt: new Date(),
      });
      await docRef.update({
        lastMessageAt: firestore.FieldValue.serverTimestamp(),
        lastMessage: message, // Lưu nội dung tin nhắn cuối cùng (tuỳ chọn)
      });
      // const response = await axios.post(
      //   'http://192.168.4.77:3000/api/message/send',
      //   {
      //     roomId,
      //     message,
      //     senderName: user?.username,
      //     userId: userCurrent?.uid,
      //   },
      // );
      // console.log('Message sent successfully');
      // getAllMessage();
      // await docRef.update({
      //   lastMessageAt: firestore.FieldValue.serverTimestamp(),
      //   lastMessage: message, // Lưu nội dung tin nhắn cuối cùng (tuỳ chọn)
      // });
      setTextRef(''); // Xóa nội dung input sau khi gửi
    } catch (err) {
      console.log('Error sending message:', err);
    }
  };

  // const getAllMessage = async () => {
  //   try {
  //     let roomId = getRoomId(userCurrent?.uid ?? '', userSelect.uid);

  //     // Gửi yêu cầu tới server để lấy tin nhắn
  //     const response = await axios.post(
  //       'http://192.168.4.77:3000/api/message/get',
  //       {
  //         roomId,
  //       },
  //     );

  //     // Nếu không có tin nhắn (status 404), trả về danh sách trống
  //     if (response.status === 404) {
  //       console.log('No messages found');
  //       setMessage([]); // Đặt trạng thái tin nhắn là danh sách rỗng
  //       return [];
  //     }

  //     // Xử lý danh sách tin nhắn từ phản hồi của server
  //     let allMessages = response.data.messages.map((doc: any) => ({
  //       id: doc.id, // Giữ lại id của tin nhắn
  //       roomId: roomId, // Gắn roomId hiện tại
  //       senderName: doc.senderName,
  //       text: doc.text || '', // Nếu text không có, để trống
  //       url: doc.url || null, // Nếu có url, giữ nguyên, nếu không thì null
  //       createdAt: new Date(
  //         doc.createdAt._seconds * 1000 + doc.createdAt._nanoseconds / 1e6,
  //       ), // Chuyển Firestore timestamp thành Date
  //       updatedAt: doc.updatedAt
  //         ? new Date(
  //             doc.updatedAt._seconds * 1000 + doc.updatedAt._nanoseconds / 1e6,
  //           )
  //         : null, // Nếu updatedAt tồn tại, chuyển thành Date
  //       userId: doc.userId,
  //     }));

  //     // Cập nhật state tin nhắn
  //     setMessage(allMessages);

  //     // Trả về danh sách tin nhắn
  //     return allMessages;
  //   } catch (error: any) {
  //     // Xử lý lỗi nhưng không hiển thị ra giao diện
  //     console.log('Error fetching messages:', error.message);

  //     // Trả về danh sách trống nếu có lỗi
  //     setMessage([]);
  //     return [];
  //   }
  // };
  const getAllMessage = () => {
    let roomId = getRoomId(userCurrent?.uid ?? '', userSelect.uid);
    const messagesRef = firestore()
      .collection('Rooms')
      .doc(roomId)
      .collection('messages');

    // Tạo query để sắp xếp các tin nhắn theo thời gian tạo
    const q = messagesRef.orderBy('createdAt', 'asc');

    // Lắng nghe thay đổi trên collection 'messages'
    const unsubscribe = q.onSnapshot(
      async snapshot => {
        try {
          // Lấy tất cả các tin nhắn từ snapshot
          let allMessages = snapshot.docs.map(doc => ({
            id: doc.id,
            roomId: roomId,
            ...doc.data(),
          }));

          // Gửi từng message lên server để giải mã
          const decryptedMessages = await Promise.all(
            allMessages.map(async (message: any) => {
              // Kiểm tra xem text có phải dạng mã hóa hay không
              if (message.text?.content && message.text?.iv) {
                try {
                  const response = await axios.post(
                    'http://192.168.4.77:3000/api/message/decrypt',
                    {
                      encryptedData: message.text, // Gửi `content` và `iv`
                    },
                  );
                  return {
                    ...message,
                    text: response.data.decryptedData, // Gán text đã giải mã
                  };
                } catch (error) {
                  console.error('Error decrypting message:', error);
                  return { ...message, text: 'Failed to decrypt' }; // Thêm fallback nếu giải mã thất bại
                }
              } else {
                // Nếu không phải dạng mã hóa, giữ nguyên text
                return message;
              }
            }),
          );

          // Cập nhật state với danh sách tin nhắn đã giải mã
          setMessage(decryptedMessages);
        } catch (error) {
          console.error('Error processing messages:', error);
        }
      },
      error => {
        console.error('Error fetching messages:', error);
      },
    );

    return unsubscribe;
  };
  const handleSelectImage = async () => {
    ImagePicker.openPicker({
      width: 300,
      height: 400,
      cropping: true,
      mediaType: 'any',
    })
      .then(async image => {
        const filename = image.path.substring(image.path.lastIndexOf('/') + 1); // Lấy tên file từ đường dẫn
        const reference = storage().ref(`Images/${filename}`); // Tạo reference đến Firebase Storage
        await reference.putFile(image.path);
        const url = await reference.getDownloadURL();

        let roomId = getRoomId(userCurrent?.uid ?? '', userSelect.uid);
        const docRef = firestore().collection('Rooms').doc(roomId);
        const messagesRef = docRef.collection('messages');
        await messagesRef.add({
          userId: userCurrent?.uid,
          url: url,

          senderName: user?.username,
          // createdAt: firestore.FieldValue.serverTimestamp(),
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
      let roomId = getRoomId(userCurrent?.uid ?? '', userSelect.uid);
      const docRef = firestore().collection('Rooms').doc(roomId);
      const messagesRef = docRef.collection('messages');
      await messagesRef.add({
        userId: userCurrent?.uid,
        videourl: url,

        senderName: user?.username,
        // createdAt: firestore.FieldValue.serverTimestamp(),
        createdAt: new Date(),
      });
    } catch (error) {
      console.log('Error selecting media:', error);
    }
  };

  const confirmDeleteMessages = () => {
    Alert.alert(
      'Xóa tất cả tin nhắn',
      'Bạn có chắc chắn muốn xóa tất cả tin nhắn không?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', onPress: handleDeleteAllMessages },
      ],
      { cancelable: true },
    );
  };
  // Hàm xóa tất cả tin nhắn
  const handleDeleteAllMessages = async () => {
    let roomId = getRoomId(userCurrent?.uid ?? '', userSelect.uid);
    const messagesRef = firestore()
      .collection('Rooms')
      .doc(roomId)
      .collection('messages');
    const batch = firestore().batch();

    try {
      const snapshot = await messagesRef.get();
      snapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
      });
      await batch.commit();
      console.log('All messages deleted successfully');
      Alert.alert('Đã xóa tất cả tin nhắn');
    } catch (error) {
      console.error('Error deleting all messages:', error);
      Alert.alert('Lỗi xóa tin nhắn');
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: 'white' }}>
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
          {userSelect?.url ? (
            <Image
              style={{
                height: 48,
                width: 48,
                borderRadius: 100,
                marginLeft: 12,
              }}
              source={{ uri: userSelect.url }}
            />
          ) : (
            <Image
              style={{
                height: 48,
                width: 48,
                borderRadius: 100,
                marginLeft: 12,
              }}
              source={require('../assets/image/avatar.png')}
            />
          )}
          <Text
            style={{
              lineHeight: 56,
              fontSize: 20,
              color: 'black',
              marginLeft: 10,
              textAlign: 'center',
            }}
          >
            {userSelect.username}
          </Text>
        </View>
        <View
          style={{ flex: 1, flexDirection: 'row', justifyContent: 'flex-end' }}
        >
          <Call size="28" color="black" />
          <SpaceComponent width={20} />
          <Video size="28" color="black" />
          <SpaceComponent width={20} />
          <TouchableOpacity onPress={confirmDeleteMessages}>
            <MessageRemove size="28" color="black" />
          </TouchableOpacity>
        </View>
      </View>
      <View style={{ flex: 1, justifyContent: 'center' }}>
        <View style={{ flex: 1 }}>
          <MessageList
            messages={message}
            currenUser={userCurrent}
            url={userSelect?.url}
          />
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
          }}
        >
          <TouchableOpacity
            style={{ marginLeft: 10 }}
            onPress={handleSelectImage}
          >
            <Image
              source={require('../assets/image.png')}
              style={{ width: 28, height: 28 }}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={{ marginLeft: 10 }}
            onPress={handleSelectMedia}
          >
            <VideoAdd size="28" color="black" />
          </TouchableOpacity>
          <TextInput
            value={textRef}
            placeholder="Type Message..."
            style={{ flex: 1, fontFamily: fontFamilies.regular, fontSize: 16 }}
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
export default RoomScreen;
