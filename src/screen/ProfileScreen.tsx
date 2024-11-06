import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import {
  View,
  Text,
  Button,
  Alert,
  Image,
  TouchableOpacity,
  ScrollView,
  FlatList,
  StyleSheet,
} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import ButtonComponent from '../components/ButtonComponent';
import { globalStyles } from '../styles/globalStyles';
import TextComponent from '../components/TextComponent';
import { colors } from '../constants/color';
import TitleComponent from '../components/TitleComponent';
import { fontFamilies } from '../constants/fontFamily';
import RowComponent from '../components/RowComponent';
import {
  Information,
  Logout,
  MoreSquare,
  PasswordCheck,
} from 'iconsax-react-native';
import SpaceComponent from '../components/SpaceComponent';
import { handleDateTime } from '../funtion/handleDateTime';
import ModalAddSubtasks from '../components/ModalAddSubtasks';
import { User } from '../models/user';
import PostCardComponent from '../components/PostCardComponent';
import {
  Menu,
  MenuOptions,
  MenuOption,
  MenuTrigger,
} from 'react-native-popup-menu';
import ChangePasswordModal from '../components/ChangePasswordModal';
import RenderFriend from '../components/RenderFriendComponent';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../redux/store';
import { logoutUser } from '../redux/authAction';
interface FirebaseTimestamp {
  seconds: number;
  nanoseconds: number;
}
const ProfileScreen = ({ navigation }: any) => {
  const dispatch = useDispatch<AppDispatch>();
  const [isVisibleModalSubTasks, setIsVisibleModalSubTasks] = useState(false);
  const userCurrent = auth().currentUser;
  const [user, setUser] = useState<User>();
  const [postsList, setPostsList] = useState<any[]>([]);
  const [isModalVisible, setModalVisible] = useState(false);
  const [friends, setFriends] = useState<any[]>([]);
  useEffect(() => {
    const fetchData = async () => {
      await getUser();
    };

    fetchData().then(() => {
      if (user?.uid) {
        getUserFriends();
        getAllPost();
      }
    });
  }, [user?.uid]);
  const getUserFriends = () => {
    try {
      firestore()
        .collection('Users')
        .doc(user?.uid)
        .get()
        .then(async userDoc => {
          if (userDoc.exists) {
            const userData = userDoc.data();
            const friendsList = userData?.friends || [];

            if (friendsList.length > 0) {
              const friendsData = await Promise.all(
                friendsList.map(async (friendId: string) => {
                  const friendDoc = await firestore()
                    .collection('Users')
                    .doc(friendId)
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
          } else {
            setFriends([]);
          }
        })
        .catch(error => {
          console.error('Error fetching user friends:', error);
          setFriends([]);
        });
      firestore()
        .collection('Users')
        .doc(user?.uid)
        .onSnapshot(
          async userDoc => {
            if (userDoc.exists) {
              const userData = userDoc.data();
              const friendsList = userData?.friends || [];

              if (friendsList.length > 0) {
                const friendsData = await Promise.all(
                  friendsList.map(async (friendId: string) => {
                    const friendDoc = await firestore()
                      .collection('Users')
                      .doc(friendId)
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
            } else {
              setFriends([]);
            }
          },
          error => {
            console.error('Error fetching user friends:', error);
            setFriends([]);
          },
        );
    } catch (error) {
      console.error('Error setting up snapshot listener:', error);
      setFriends([]);
    }
  };
  const getAllPost = () => {
    const unsubscribe = firestore()
      .collection('Posts')
      .orderBy('createAt', 'desc')
      .onSnapshot(
        async snapshot => {
          const postsWithUsers = await Promise.all(
            snapshot.docs.map(async doc => {
              const postData = doc.data();
              if (postData.userId === userCurrent?.uid) {
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
                  user: userData || null, // Thông tin người dùng
                };
              } else {
                return null; // Nếu không khớp, trả về null
              }
            }),
          );
          setPostsList(postsWithUsers.filter(post => post !== null));
        },
        error => {
          console.error('Error fetching posts:', error);
        },
      );

    return unsubscribe; // Trả về hàm hủy đăng ký khi component bị unmount
  };
  const getUser = async () => {
    // const userCurrent = auth().currentUser;
    await firestore()
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
  const handleLogout = () => {
    dispatch(logoutUser())
  };

  const getFormattedDate = (timestamp: FirebaseTimestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp.seconds * 1000);
    return handleDateTime.DateString(date); // Hoặc sử dụng `date.toISOString()` để định dạng khác
  };
  return (
    <>
      <ScrollView style={{ flex: 1 }}>
        <View style={{ flex: 1 }}>
          <View style={globalStyles.header}>
            <Text style={globalStyles.textHeader}>Profile</Text>
          </View>
          <View
            style={{
              justifyContent: 'center',
              alignItems: 'center',
              width: '100%',
              marginTop: 10,
            }}
          >
            {user?.url ? (
              <Image
                style={{ borderRadius: 5000, width: 300, height: 300 }}
                source={{ uri: user.url }}
              />
            ) : (
              <Image
                style={{ borderRadius: 5000, width: 300, height: 300 }}
                source={require('../assets/image/avatar.png')}
              />
            )}
            <Text
              style={{
                fontFamily: fontFamilies.bold,
                fontSize: 24,
                color: 'black',
              }}
            >
              {user?.username}
            </Text>
            <View>
              {friends.length > 0 ? (
                <RenderFriend friend={friends} length={friends.length} />
              ) : (
                <></>
              )}
            </View>
          </View>
          <View
            style={{
              flex: 1,
              backgroundColor: '#d3e6e6',
              borderRadius: 20,
              justifyContent: 'center',
              alignItems: 'center',
              margin: 12,
            }}
          > 
            <View style={{ width: '90%' }}>
            <SpaceComponent height={10}></SpaceComponent>
            <View style={{flexDirection:'row'}}>
            <Text style={styles.text}>Two-factor authentication:</Text>
            <Text style={[styles.text,{textAlign:'right',flex:1,color:user?.twoFA?'green':'black'}]}>{user?.twoFA?'ACTIVE':'INACTIVE'}</Text>
            </View>
              <SpaceComponent height={10}></SpaceComponent>
              <Text style={styles.text}>Email: {user?.email}</Text>
              <SpaceComponent height={10}></SpaceComponent>
              <Text style={styles.text}>
                Date Of Birth: {getFormattedDate(user?.DateBitrhDay)}
              </Text>
              <SpaceComponent height={10}></SpaceComponent>
              <Text style={styles.text}>
                createAt:{' '}
                {handleDateTime.DateString(userCurrent?.metadata.creationTime)}
              </Text>
            </View>
            <SpaceComponent height={10}></SpaceComponent>
            <View style={{ flex: 1 }}>
              <RowComponent styles={{ width: '90%' }}>
                <Text style={[styles.text, { flex: 1 }]}>
                  Update information
                </Text>
                <TouchableOpacity
                  onPress={() =>
                    navigation.navigate('Update', { userId: user?.uid })
                  }
                >
                  <Information size="28" color="black" />
                </TouchableOpacity>
              </RowComponent>
              <SpaceComponent height={10}></SpaceComponent>
              <RowComponent styles={{ width: '90%' }}>
                <Text style={[styles.text, { flex: 1 }]}>Change Password</Text>
                <TouchableOpacity onPress={() => setModalVisible(true)}>
                  <PasswordCheck size="28" color="black" />
                </TouchableOpacity>
              </RowComponent>
              <SpaceComponent height={10}></SpaceComponent>
              <RowComponent styles={{ width: '90%' }}>
                <Text style={[styles.text, { flex: 1 }]}>LogOut</Text>
                <TouchableOpacity onPress={handleLogout}>
                  <Logout size="28" color="black" />
                </TouchableOpacity>
              </RowComponent>
              <SpaceComponent height={10}></SpaceComponent>
            </View>
          </View>
        </View>
        <View>
          <View style={{ flex: 1, margin: 16 }}>
            {postsList.map(item => (
              <View key={item.id}>
                <PostCardComponent
                  post={item}
                  userCurrent={user}
                  isEdit={true}
                  navigation={navigation}
                />
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
      <ChangePasswordModal
        isVisible={isModalVisible}
        onClose={() => setModalVisible(false)}
      />
    </>
  );
};
export default ProfileScreen;
const styles = StyleSheet.create({
  text: {
    fontFamily: fontFamilies.regular,
    fontSize: 18,
    color: 'black',
  },
});
