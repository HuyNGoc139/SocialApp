import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth'; // Để lấy thông tin người dùng hiện tại
import { fontFamilies } from '../constants/fontFamily';
import SpaceComponent from './SpaceComponent';
import ProfileModalComponent from './ProfileFriend';

interface Props {
  uid: string; // Người dùng mục tiêu (người nhận yêu cầu)
  isRequest?: boolean;
  navigation: any;
}

const FriendComponent = (props: Props) => {
  const { uid, isRequest, navigation } = props;
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isFriendRequested, setIsFriendRequested] = useState<boolean>(false);
  const currentUser = auth().currentUser; // Người dùng hiện tại
  const [isModalFriendVisible, setModalFriendVisible] = useState(false);
  useEffect(() => {
    getUser();
    checkFriendRequest();
  }, []);

  const getUser = async () => {
    setIsLoading(true);
    const unsubscribe = firestore()
      .doc(`Users/${uid}`)
      .onSnapshot((snap: any) => {
        if (snap.exists) {
          setUser({
            ...snap.data(),
          });
        } else {
          console.log('User not found');
        }
        setIsLoading(false);
      });

    return () => unsubscribe();
  };
  const checkFriendRequest = async () => {
    const snapshot = await firestore()
      .collection('FriendRequests')
      .where('senderId', '==', currentUser?.uid)
      .where('receiverId', '==', uid)
      .get();

    if (!snapshot.empty) {
      setIsFriendRequested(true);
    }
  };

  const handleFriendRequest = async () => {
    if (isFriendRequested) {
      // Hủy yêu cầu kết bạn
      await cancelFriendRequest();
    } else {
      // Gửi yêu cầu kết bạn
      await sendFriendRequest();
    }
    setIsFriendRequested(!isFriendRequested);
  };

  const sendFriendRequest = async () => {
    try {
      await firestore().collection('FriendRequests').add({
        senderId: currentUser?.uid,
        receiverId: uid,
        status: 'pending',
        timestamp: firestore.FieldValue.serverTimestamp(),
      });
    } catch (error) {
      console.error('Error sending friend request:', error);
    }
  };

  const cancelFriendRequest = async () => {
    try {
      const snapshot = await firestore()
        .collection('FriendRequests')
        .where('senderId', '==', currentUser?.uid)
        .where('receiverId', '==', uid)
        .get();

      if (!snapshot.empty) {
        const docId = snapshot.docs[0].id;
        await firestore().collection('FriendRequests').doc(docId).delete();
      }
    } catch (error) {
      console.error('Error canceling friend request:', error);
    }
  };

  const handleAcceptRequest = async () => {
    try {
      // Cập nhật trường friend cho người nhận
      await firestore()
        .doc(`Users/${currentUser?.uid}`)
        .update({
          friends: firestore.FieldValue.arrayUnion(uid), // Thêm ID của người bạn vào mảng
        });

      // Cập nhật trường friend cho người gửi
      await firestore()
        .doc(`Users/${uid}`)
        .update({
          friends: firestore.FieldValue.arrayUnion(currentUser?.uid), // Thêm ID của người nhận vào mảng
        });

      // Xóa yêu cầu bạn bè
      const snapshot = await firestore()
        .collection('FriendRequests')
        .where('senderId', '==', uid)
        .where('receiverId', '==', currentUser?.uid)
        .get();

      if (!snapshot.empty) {
        const docId = snapshot.docs[0].id; // Lấy ID của tài liệu đầu tiên
        await firestore().collection('FriendRequests').doc(docId).delete(); // Xóa yêu cầu
      }
    } catch (error) {
      console.log('Error accepting friend request:', error);
    }
  };

  const handleDeclineRequest = async () => {
    try {
      const snapshot = await firestore()
        .collection('FriendRequests')
        .where('senderId', '==', uid)
        .where('receiverId', '==', currentUser?.uid)
        .get();

      if (!snapshot.empty) {
        const docId = snapshot.docs[0].id;
        await firestore().collection('FriendRequests').doc(docId).delete();
        console.log('Friend request declined');
      }
    } catch (error) {
      console.log('Error declining friend request:', error);
    }
  };

  if (isLoading) {
    return <ActivityIndicator size="large" color="blue" />;
  }

  return (
    <>
      <View style={{ flex: 1, flexDirection: 'row', marginBottom: 12 }}>
        <TouchableOpacity
          onPress={() =>
            navigation.navigate('ProfileModalComponent', {
              userId: uid,
              noadd: true,
            })
          }
        >
          {user?.url ? (
            <Image
              style={{ height: 80, width: 80, borderRadius: 100 }}
              source={{ uri: user.url }}
            />
          ) : (
            <Image
              style={{ height: 80, width: 80, borderRadius: 100 }}
              source={require('../assets/image/avatar.png')}
            />
          )}
        </TouchableOpacity>
        <View style={{ flex: 1, marginLeft: 10 }}>
          <View
            style={{ flexDirection: 'row', justifyContent: 'space-between' }}
          >
            {user && user.username ? (
              <Text style={styles.username}>{user.username}</Text>
            ) : (
              <Text style={styles.username}>Unknown User</Text>
            )}
          </View>
          <View>
            {isRequest ? (
              <View style={{ flexDirection: 'row' }}>
                <TouchableOpacity
                  style={styles.button}
                  onPress={handleAcceptRequest}
                >
                  <Text style={styles.textButton}>Accept</Text>
                </TouchableOpacity>
                <SpaceComponent width={10} />
                <TouchableOpacity
                  style={[styles.button, { backgroundColor: '#e4e6eb' }]}
                  onPress={handleDeclineRequest}
                >
                  <Text style={[styles.textButton, { color: 'black' }]}>
                    Decline
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                style={
                  isFriendRequested ? styles.cancelButton : styles.addButton
                }
                onPress={handleFriendRequest}
              >
                <Text
                  style={isFriendRequested ? styles.cancelText : styles.addText}
                >
                  {isFriendRequested ? 'Cancel Request' : 'Add Friend'}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
      {/* <ProfileModalComponent
        isVisible={isModalFriendVisible}
        onClose={() => setModalFriendVisible(false)}
        userId={uid}
        navigation={navigation}
        noadd={true}
      /> */}
    </>
  );
};

export default FriendComponent;

const styles = StyleSheet.create({
  username: {
    fontFamily: fontFamilies.semiBold,
    color: 'black',
    fontSize: 18,
  },
  addButton: {
    backgroundColor: '#1877f2',
    paddingVertical: 8,
    paddingHorizontal: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  cancelButton: {
    backgroundColor: '#e4e6eb',
    paddingVertical: 8,
    paddingHorizontal: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  addText: {
    fontFamily: fontFamilies.regular,
    fontSize: 16,
    color: 'white',
  },
  cancelText: {
    fontFamily: fontFamilies.regular,
    fontSize: 16,
    color: '#050505',
  },
  button: {
    backgroundColor: '#1778f2',
    width: '36%',
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
    marginTop: 5, // Khoảng cách giữa các nút
  },
  textButton: {
    fontFamily: fontFamilies.regular,
    fontSize: 16,
    color: 'white',
  },
});
