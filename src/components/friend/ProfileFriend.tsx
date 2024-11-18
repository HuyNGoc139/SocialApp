import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import SpaceComponent from '../SpaceComponent';
import { fontFamilies } from '../../constants/fontFamily';
import RenderFriend from './RenderFriendComponent';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { handleDateTime } from '../../funtion/handleDateTime';
import {
  ArrowSquareLeft,
  Messages1,
  UserAdd,
  UserRemove,
  UserTick,
} from 'iconsax-react-native';
import PostCardComponent from '../post/PostCardComponent';

interface FirebaseTimestamp {
  seconds: number;
  nanoseconds: number;
}

const ProfileModalComponent: React.FC<any> = React.memo(
  ({ navigation, route }) => {
    const { userId, noadd } = route.params;
    const [user, setUser] = useState<any>(null);
    const [friends, setFriends] = useState<any[]>([]);
    const [postsList, setPostsList] = useState<any[]>([]);
    const userCurrent = auth().currentUser;
    const [userfr, setUserfr] = useState<any>(null);
    const [isfriends, setIsFriends] = useState<boolean>(true);
    const [isFriendRequested, setIsFriendRequested] = useState<boolean>();
    const [RequestedtoFriend, setRequestedtoFriend] = useState<boolean>();
    const [isLoading, setIsLoading] = useState(false);
    useEffect(() => {
      getUserfr();
    }, [userId]);

    useEffect(() => {
      if (userfr?.uid) {
        getUser();
        const friendsUnsubscribe = getUserFriends();
        const postsUnsubscribe = getAllPost();
        checkIfFriend();
        checkFriendRequestStatus();
        checkRequestToFriend();
        return () => {
          friendsUnsubscribe(); // Hủy bỏ subscription cho bạn bè
          postsUnsubscribe(); // Hủy bỏ subscription cho bài viết
        };
      }
    }, [userfr?.uid]);

    const checkRequestToFriend = async () => {
      try {
        const snapshot = await firestore()
          .collection('FriendRequests')
          .where('senderId', '==', userCurrent?.uid)
          .where('receiverId', '==', userId)
          .get();

        if (!snapshot.empty) {
          setRequestedtoFriend(true); // Đã gửi yêu cầu
        } else {
          setRequestedtoFriend(false); // Chưa gửi yêu cầu
        }
      } catch (error) {
        console.error('Error checking friend request:', error);
      }
    };

    const getUser = async () => {
      const userDoc = await firestore().doc(`Users/${userCurrent?.uid}`).get();
      if (userDoc.exists) {
        setUser(userDoc.data());
      }
    };

    const getAllPost = () => {
      setIsLoading(true);
      const unsubscribe = firestore()
        .collection('Posts')
        .orderBy('createAt', 'desc')
        .onSnapshot(async snapshot => {
          const postsWithUsers = await Promise.all(
            snapshot.docs.map(async doc => {
              const postData = doc.data();
              if (postData.userId === userfr.uid) {
                const userSnapshot = await firestore()
                  .doc(`Users/${postData.userId}`)
                  .get();
                const userData = userSnapshot.exists
                  ? userSnapshot.data()
                  : null;
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
            }),
          );
          setPostsList(postsWithUsers.filter(post => post !== null));
          setIsLoading(false);
        });
      return unsubscribe;
    };

    const getUserfr = async () => {
      const userDoc = await firestore().doc(`Users/${userId}`).get();
      if (userDoc.exists) {
        setUserfr(userDoc.data());
      }
    };

    const getUserFriends = () => {
      const unsubscribe = firestore()
        .doc(`Users/${userfr?.uid}`)
        .onSnapshot(
          async userDoc => {
            if (userDoc.exists) {
              const userData = userDoc.data();
              const friendsList = userData?.friends || [];
              if (friendsList.length > 0) {
                const friendsData = await Promise.all(
                  friendsList.map(async (friendId: string) => {
                    const friendDoc = await firestore()
                      .doc(`Users/${friendId}`)
                      .get();
                    return friendDoc.exists
                      ? { id: friendId, ...friendDoc.data() }
                      : null;
                  }),
                );
                setFriends(friendsData.filter(friend => friend !== null));
              } else {
                setFriends([]);
              }
            }
          },
          error => {
            console.error('Error fetching friends:', error);
          },
        );

      // Hủy bỏ việc lắng nghe khi component unmount
      return unsubscribe;
    };

    const handleAcceptRequest = async () => {
      // Logic để chấp nhận yêu cầu kết bạn
      try {
        await firestore()
          .doc(`Users/${userCurrent?.uid}`)
          .update({
            friends: firestore.FieldValue.arrayUnion(userId),
          });

        await firestore()
          .doc(`Users/${userId}`)
          .update({
            friends: firestore.FieldValue.arrayUnion(userCurrent?.uid),
          });

        const snapshot = await firestore()
          .collection('FriendRequests')
          .where('senderId', '==', userId)
          .where('receiverId', '==', userCurrent?.uid)
          .get();

        if (!snapshot.empty) {
          const docId = snapshot.docs[0].id;
          await firestore().collection('FriendRequests').doc(docId).delete(); // Xóa yêu cầu
        }

        console.log('Friend request accepted and friends updated');
        setIsFriends(true); // Cập nhật trạng thái bạn bè
        setIsFriendRequested(false); // Đặt lại trạng thái yêu cầu
      } catch (error) {
        console.log('Error accepting friend request:', error);
      }
    };
    const cancelFriendRequest = async () => {
      try {
        const snapshot = await firestore()
          .collection('FriendRequests')
          .where('senderId', '==', userCurrent?.uid)
          .where('receiverId', '==', userId)
          .get();

        if (!snapshot.empty) {
          const docId = snapshot.docs[0].id;
          await firestore().collection('FriendRequests').doc(docId).delete();
          console.log('Friend request canceled');
          setRequestedtoFriend(false); // Cập nhật trạng thái yêu cầu
        }
      } catch (error) {
        console.error('Error canceling friend request:', error);
      }
    };
    const sendFriendRequest = async () => {
      try {
        await firestore().collection('FriendRequests').add({
          senderId: userCurrent?.uid,
          receiverId: userId,
          status: 'pending',
          timestamp: firestore.FieldValue.serverTimestamp(),
        });
        console.log('Friend request sent');
        setRequestedtoFriend(true); // Cập nhật trạng thái yêu cầu
      } catch (error) {
        console.error('Error sending friend request:', error);
      }
    };
    const RejectRequest = async () => {
      try {
        const snapshot = await firestore()
          .collection('FriendRequests')
          .where('senderId', '==', userId)
          .where('receiverId', '==', userCurrent?.uid)
          .get();

        if (!snapshot.empty) {
          const docId = snapshot.docs[0].id;
          await firestore().collection('FriendRequests').doc(docId).delete(); // Xóa yêu cầu
          console.log('Friend request rejected');
          setIsFriendRequested(false); // Cập nhật trạng thái yêu cầu
        }
      } catch (error) {
        console.error('Error rejecting friend request:', error);
      }
    };

    const checkIfFriend = async () => {
      try {
        // Lấy tài liệu của người dùng hiện tại từ Firestore
        const userDoc = await firestore()
          .doc(`Users/${userCurrent?.uid}`)
          .get();

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
        setIsFriends(false);
        await firestore()
          .doc(`Users/${userCurrent?.uid}`)
          .update({
            friends: firestore.FieldValue.arrayRemove(userId),
          });
        await firestore()
          .doc(`Users/${userId}`)
          .update({
            friends: firestore.FieldValue.arrayRemove(userCurrent?.uid),
          });

        console.log('Unfriend operation completed and friends updated');
        await getUserFriends();
      } catch (error) {
        console.log('Error unfriend:', error);
      }
    };
    const checkFriendRequestStatus = async () => {
      try {
        const snapshot = await firestore()
          .collection('FriendRequests')
          .where('senderId', '==', userId)
          .where('receiverId', '==', userCurrent?.uid)
          .get();

        if (!snapshot.empty) {
          setIsFriendRequested(true); // Có yêu cầu kết bạn
        } else {
          setIsFriendRequested(false); // Không có yêu cầu
        }
      } catch (error) {
        console.error('Error checking friend request status:', error);
      }
    };

    const getFormattedDate = (timestamp: FirebaseTimestamp) => {
      if (!timestamp) return '';
      const date = new Date(timestamp.seconds * 1000);
      return handleDateTime.DateString(date);
    };
    const handlenaviroom = () => {
      navigation.navigate('RoomScreen', {
        uid: userfr.uid,
        userName: userfr.username,
      });
    };
    return (
      <ScrollView style={styles.modalContainer}>
        <View style={{ flex: 1, marginHorizontal: 10 }}>
          <View style={styles.headerContainer}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <ArrowSquareLeft size="32" color="black" />
            </TouchableOpacity>
            <View
              style={{
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center',
                paddingRight: 32,
              }}
            >
              <Text style={styles.text}>Profile</Text>
            </View>
          </View>

          <View style={styles.profilecontainer}>
            {userfr?.url ? (
              <Image style={styles.avatar} source={{ uri: userfr.url }} />
            ) : (
              <Image
                style={styles.avatar}
                source={require('../../assets/image/avatar.png')}
              />
            )}
            <Text
              style={{
                fontFamily: fontFamilies.bold,
                fontSize: 24,
                color: 'black',
              }}
            >
              {userfr?.username}
            </Text>
            {friends.length > 0 ? (
              <RenderFriend friend={friends} length={friends.length} />
            ) : null}
          </View>
          {!noadd ? (
            <View style={styles.buttonContainer}>
              {isFriendRequested ? (
                <>
                  <TouchableOpacity
                    style={styles.button}
                    onPress={handleAcceptRequest}
                  >
                    <UserTick size="32" color="black" />
                    <SpaceComponent width={12} />
                    <Text style={[styles.text, { fontSize: 16 }]}>
                      Accept Request
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.button}
                    onPress={RejectRequest}
                  >
                    <UserRemove size="32" color="black" />
                    <SpaceComponent width={12} />
                    <Text style={[styles.text, { fontSize: 16 }]}>
                      Reject Request
                    </Text>
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  <TouchableOpacity
                    style={styles.button}
                    onPress={
                      isfriends
                        ? handleUnfriend
                        : !RequestedtoFriend
                        ? sendFriendRequest
                        : cancelFriendRequest
                    }
                  >
                    {isfriends ? (
                      <>
                        <UserRemove size="32" color="black" />
                        <SpaceComponent width={12} />
                        <Text style={[styles.text, { fontSize: 16 }]}>
                          Remove Friend
                        </Text>
                      </>
                    ) : (
                      <>
                        <UserAdd size="32" color="black" />
                        <SpaceComponent width={12} />
                        <Text style={[styles.text, { fontSize: 16 }]}>
                          {RequestedtoFriend ? 'Cancel Request' : 'Add Friend'}
                        </Text>
                      </>
                    )}
                  </TouchableOpacity>
                </>
              )}
              {/* Nút Message */}
              <TouchableOpacity style={styles.button} onPress={handlenaviroom}>
                <Messages1 size="32" color="black" />
                <SpaceComponent width={12} />
                <Text style={[styles.text, { fontSize: 16 }]}>Message</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <></>
          )}

          <View style={styles.infoContainer}>
            <View style={{ width: '90%' }}>
              <SpaceComponent height={12} />
              <Text style={styles.text}>Email: {userfr?.email}</Text>
              <SpaceComponent height={12} />
              {user?.DateBitrhDay ? (
                <Text style={styles.text}>
                  Date Of Birth: {getFormattedDate(userfr?.DateBitrhDay)}
                </Text>
              ) : null}
            </View>
          </View>

          {isLoading ? (
            <ActivityIndicator />
          ) : postsList.length ? (
            postsList.map(item => (
              <View key={item.id}>
                <PostCardComponent
                  post={item}
                  userCurrent={user}
                  isEdit={false}
                  isSelect={true}
                  navigation={navigation}
                />
              </View>
            ))
          ) : (
            <Text style={{ textAlign: 'center', color: 'red', flex: 1 }}>
              User has not posted any posts yet.
            </Text>
          )}
        </View>
      </ScrollView>
    );
  },
);

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    paddingLeft: 10,
  },
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
  button: {
    width: '46%',
    backgroundColor: '#d8eded',
    height: 48,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 16,
    marginBottom: 10,
  },
  profilecontainer: {
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    marginTop: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
    flexWrap: 'wrap',
  },
});

export default ProfileModalComponent;
