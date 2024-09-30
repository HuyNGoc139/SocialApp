import React, { useState, useEffect } from 'react';
import { Modal, View, Text, Image, ScrollView, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { globalStyles } from '../styles/globalStyles';
import SpaceComponent from '../components/SpaceComponent';
import { fontFamilies } from '../constants/fontFamily';
import RenderFriend from '../components/RenderFriendComponent';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { handleDateTime } from '../funtion/handleDateTime';
import { ArrowSquareLeft, Messages1, UserAdd, UserRemove } from 'iconsax-react-native';
import PostCardComponent from './PostCardComponent';

interface FirebaseTimestamp {
  seconds: number;
  nanoseconds: number;
}

interface Props {
  isVisible: boolean;
  onClose: () => void;
  userId: string;
  navigation: any;
}

const ProfileModalComponent = (props: Props) => {
  const { isVisible, onClose, userId, navigation } = props;
  const [user, setUser] = useState<any>(null);
  const [friends, setFriends] = useState<any[]>([]);
  const [postsList, setPostsList] = useState<any[]>([]);
  const userCurrent = auth().currentUser;
  const [userfr, setUserfr] = useState<any>(null);
  const [isfriends, setIsFriends] = useState<boolean>(true);
  useEffect(() => {
    getUserfr();
  }, [userId]);

  useEffect(() => {
    if (userfr?.uid) {
      getUser();
      getUserFriends();
      getAllPost();
    }
  }, [userfr]);

  const handleCloseModal = () => {
    onClose();
  };

  const getUser = async () => {
    const userDoc = await firestore().doc(`Users/${userCurrent?.uid}`).get();
    if (userDoc.exists) {
      setUser(userDoc.data());
    }
  };

  const getAllPost = () => {
    const unsubscribe = firestore()
      .collection('Posts')
      .orderBy('createAt', 'desc')
      .onSnapshot(async (snapshot) => {
        const postsWithUsers = await Promise.all(
          snapshot.docs.map(async (doc) => {
            const postData = doc.data();
            if (postData.userId === userfr.uid) {
              const userSnapshot = await firestore().doc(`Users/${postData.userId}`).get();
              const userData = userSnapshot.exists ? userSnapshot.data() : null;
              return {
                id: doc.id,
                url: postData.url,
                createAt: postData.createAt.toDate(),
                body: postData.body,
                userId: postData.userId,
                type: postData.type,
                user: userData || null,
              };
            } else {
              return null;
            }
          })
        );
        setPostsList(postsWithUsers.filter((post) => post !== null));
      });
    return unsubscribe;
  };

  const getUserfr = async () => {
    const userDoc = await firestore().doc(`Users/${userId}`).get();
    if (userDoc.exists) {
      setUserfr(userDoc.data());
    }
  };

  const getUserFriends = async () => {
    const userDoc = await firestore().doc(`Users/${userfr?.uid}`).get();
    if (userDoc.exists) {
      const userData = userDoc.data();
      const friendsList = userData?.friends || [];
      if (friendsList.length > 0) {
        const friendsData = await Promise.all(
          friendsList.map(async (friendId: string) => {
            const friendDoc = await firestore().doc(`Users/${friendId}`).get();
            return friendDoc.exists ? { id: friendId, ...friendDoc.data() } : null;
          })
        );
        setFriends(friendsData.filter((friend) => friend !== null));
      } else {
        setFriends([]);
      }
    }
  };

  const checkIfFriend = async () => {
    try {
        // Lấy tài liệu của người dùng hiện tại từ Firestore
        const userDoc = await firestore().doc(`Users/${userCurrent?.uid}`).get();

        if (userDoc.exists) {
            const userData = userDoc.data();
            // Kiểm tra nếu mảng friends có chứa ID của người bạn
            if (userData?.friends && userData.friends.includes(userId)) {
                setIsFriends(true); // Đã là bạn bè
            } else {
                setIsFriends(false); // Chưa là bạn bè
            }
        }
    } catch (error) {
        console.log('Error checking friendship status:', error);
    }
};
  const handleUnfriend = async () => {
    try {
      await firestore().doc(`Users/${userCurrent?.uid}`).update({
        friends: firestore.FieldValue.arrayRemove(userId),
      });
      await firestore().doc(`Users/${userId}`).update({
        friends: firestore.FieldValue.arrayRemove(userCurrent?.uid),
      });
      console.log('Unfriend operation completed and friends updated');
    } catch (error) {
      console.log('Error unfriend:', error);
    }
  };

  const getFormattedDate = (timestamp: FirebaseTimestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp.seconds * 1000);
    return handleDateTime.DateString(date);
  };
  const handlenaviroom=()=>{
    navigation.navigate('RoomScreen',{uid:userfr.uid,userName:userfr.username})
    handleCloseModal()
  }
  return (
    <Modal animationType="slide" transparent={false} visible={isVisible}>
      <View style={styles.modalContainer}>
        <View style={[globalStyles.header, { flexDirection: 'row', paddingLeft: 10 }]}>
          <TouchableOpacity onPress={handleCloseModal}>
            <ArrowSquareLeft size="28" color="white" />
          </TouchableOpacity>
          <View style={{ alignItems: 'center', flex: 1 }}>
            <Text style={globalStyles.textHeader}>Profile</Text>
          </View>
        </View>

        <View style={{ justifyContent: 'center', alignItems: 'center', width: '100%', marginTop: 10 }}>
          {user?.url ? (
            <Image style={styles.avatar} source={{ uri: user.url }} />
          ) : (
            <Image style={styles.avatar} source={require('../asset/image/avatar.png')} />
          )}
          <Text style={{ fontFamily: fontFamilies.bold, fontSize: 24, color: 'black' }}>{userfr?.username}</Text>
          {friends.length > 0 ? <RenderFriend friend={friends} length={friends.length} /> : null}
        </View>
        <View style={{flexDirection:'row',justifyContent:'space-around',marginTop:10}}>
            <TouchableOpacity style={styles.button} onPress={()=>setIsFriends(!isfriends)}>
            {isfriends ? (
                    <>
                        <UserRemove size="32" color="black" />
                        <SpaceComponent width={12} />
                        <Text style={[styles.text,{fontSize:16}]}>Remove Friend</Text>
                    </>
                    ) : (
                    <>
                        <UserAdd size="32" color="black" />
                        <SpaceComponent width={12} />
                        <Text style={[styles.text,{fontSize:16}]}>Add Friend</Text>
                    </>
)}
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={handlenaviroom}>
            <Messages1 size="32" color="black"/>
            <SpaceComponent width={12} />
            <Text style={[styles.text,{fontSize:16}]}>Message</Text>
            </TouchableOpacity>
                            </View>
        <View style={styles.infoContainer}>
          <View style={{ width: '90%' }}>
            <SpaceComponent height={12} />
            <Text style={styles.text}>Email: {userfr?.email}</Text>
            <SpaceComponent height={12} />
            {user?.DateBitrhDay ? (
              <Text style={styles.text}>Date Of Birth: {getFormattedDate(userfr?.DateBitrhDay)}</Text>
            ) : null}
          </View>
        </View>

        <FlatList
          data={postsList}
          renderItem={({ item }) => (
            <View key={item.id}>
              <PostCardComponent post={item} userCurrent={user} isEdit={false} isSelect={true} navigation={navigation} />
            </View>
          )}
          keyExtractor={(item) => item.id}
        />
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: 'white',
  },
  avatar: {
    borderRadius: 5000,
    width: 150,
    height: 150,
  },
  infoContainer: {
    backgroundColor: '#ababab',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 12,
  },
  text: {
    fontFamily: fontFamilies.regular,
    fontSize: 18,
    color: 'black',
  },
  button:{
    width:'46%',
    backgroundColor:'#d8eded',
    height:48,
    flexDirection:'row',
    justifyContent:'center',
    alignItems:'center',
    borderRadius:16
  }
});

export default ProfileModalComponent;
