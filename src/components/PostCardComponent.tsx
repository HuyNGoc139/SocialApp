import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  Button,
  StyleSheet,
  Image,
  TouchableOpacity,
  Modal,
  FlatList,
  Alert,
} from 'react-native';
import { fontFamilies } from '../constants/fontFamily';
import { formatDate } from '../funtion/formatDate';
import {
  Heart,
  Message,
  More,
  MoreSquare,
  Send2,
  User,
} from 'iconsax-react-native';
import RenderHTML from 'react-native-render-html';
import Video from 'react-native-video';
import SpaceComponent from './SpaceComponent';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import { WebView } from 'react-native-webview';
import HTMLView from 'react-native-htmlview';
import RenderHtml from 'react-native-render-html';
import { memo } from 'react';
import {
  Menu,
  MenuOptions,
  MenuOption,
  MenuTrigger,
} from 'react-native-popup-menu';
import ModalEditPost from './ModalEditPost';
import ProfileModalComponent from './ProfileFriend';
const PostCardComponent = ({
  post = {},
  userCurrent = {},
  isEdit,
  isSelect,
  navigation = () => {},
}: any) => {
  const MemoizedRenderHTML = memo(RenderHTML);
  // const { post, userCurrent,navigation } = props;
  const user = post.user;
  const [like, setLike] = useState(false);
  const [userLike, setUserLike] = useState<any[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [url, setUrl] = useState('');
  const [isModalFriendVisible, setModalFriendVisible] = useState(false);
  const [userComment, setUserComment] = useState<any[]>([]);
  const [isVisibleModal, setIsVisibleModal] = useState(false);
  useEffect(() => {
    const unsubscribeLikes = subscribeLikes();
    const unsubscribeComments = subscribeComments();

    // Cleanup subscription khi component unmount
    return () => {
      unsubscribeLikes();
      unsubscribeComments();
    };
  }, []);
  //hom nay sua o day
  const sendLikeNotification = useCallback(async () => {
    try {
      const notificationRef = firestore().collection('notifi');

      await notificationRef.add({
        postId: post.id,
        senderName: userCurrent.username,
        senderId: userCurrent.userId,
        type: 'like', // loại thông báo (like hoặc comment)
        createdAt: new Date(),
        receiverId: post.userId, // người đăng bài viết
        isRead: false,
      });
      console.log('Notification sent successfully');
    } catch (error) {
      console.log('Error sending notification:', error);
    }
  }, [post.id, userCurrent.username, userCurrent.userId, post.userId]);
  //hom nay sua o day

  const subscribeLikes = useCallback(() => {
    const docRef = firestore().collection('Posts').doc(post.id);
    const likeRef = docRef.collection('like');

    // Lắng nghe sự thay đổi trong collection 'like'
    return likeRef.onSnapshot(snapshot => {
      if (!snapshot.empty) {
        const likes = snapshot.docs.map(doc => ({
          userId: doc.id,
          ...doc.data(),
        }));

        setUserLike(likes);

        // Kiểm tra xem userCurrent đã like hay chưa
        const currentUserLike = likes.find(
          like => like.userId === userCurrent.userId,
        );
        if (currentUserLike) {
          setLike(true);
        } else {
          setLike(false);
        }
      } else {
        setUserLike([]);
        setLike(false);
      }
    });
  }, [post.id, userCurrent.userId]);

  const subscribeComments = useCallback(() => {
    const docRef = firestore().collection('Posts').doc(post.id);
    const commentRef = docRef.collection('comments');

    // Lắng nghe sự thay đổi trong collection 'comments'
    return commentRef.onSnapshot(snapshot => {
      if (!snapshot.empty) {
        const comments = snapshot.docs.map(doc => ({
          userId: doc.id,
          ...doc.data(),
        }));

        setUserComment(comments);
      } else {
        setUserComment([]);
      }
    });
  }, [post.id]);

  const sendLike = useCallback(async () => {
    const docRef = firestore().collection('Posts').doc(post.id);
    const likeRef = docRef.collection('like').doc(userCurrent?.userId);
    const notificationRef = firestore()
      .collection('notifi')
      .where('postId', '==', post.id)
      .where('senderId', '==', userCurrent?.userId)
      .where('type', '==', 'like'); // Tìm thông báo "like" cho bài post này

    if (like) {
      // Nếu user đã like, xóa like khỏi Firestore
      await likeRef.delete();

      // Xóa thông báo like tương ứng
      const notificationsSnapshot = await notificationRef.get();
      notificationsSnapshot.forEach(async doc => {
        await doc.ref.delete(); // Xóa từng thông báo
      });

      setLike(false);
    } else {
      // Nếu user chưa like, thêm like vào Firestore
      await likeRef.set(
        {
          userId: userCurrent.userId,
          senderName: userCurrent?.username,
          createdAt: new Date(),
          url: userCurrent.url ?? '',
        },
        { merge: true },
      );

      // Thêm thông báo mới vào collection 'notifications'
      if (userCurrent.userId !== post.userId) {
        await sendLikeNotification();
      }

      setLike(true);
    }
  }, [like, post.id, userCurrent]);
  const renderUserLike = ({ item }: any) => {
    return (
      <View style={[styles.userItem, { flexDirection: 'row', flex: 1 }]}>
        {item?.url ? (
          <Image
            style={{
              height: 36,
              width: 36,
              borderRadius: 100,
              marginRight: 12,
            }}
            source={{ uri: item.url }}
          />
        ) : (
          <Image
            style={{
              height: 36,
              width: 36,
              borderRadius: 100,
              marginRight: 12,
            }}
            source={require('../asset/image/avatar.png')}
          />
        )}
        <Text
          style={{
            fontSize: 16,
            fontFamily: fontFamilies.semiBold,
            color: 'black',
            flex: 1,
          }}
        >
          {item.senderName}
        </Text>
        <Heart size="32" variant="Bold" color="red" />
      </View>
    );
  };
  const handleDeletePost = useCallback(async () => {
    try {
      Alert.alert('Delete Post', 'Do you want delete post?', [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Ok',
          onPress: async () => {
            const postref = firestore().collection('Posts').doc(post.id);
            postref
              .delete()
              .then(() => console.log('Post deleted successfully'))
              .catch(error => console.log(error));
          },
        },
      ]);
    } catch (error) {
      console.log(error);
    }
  }, [post.id]);

  return (
    <>
      <View style={styles.container}>
        <View style={styles.header}>
          {user?.url ? (
            <Image style={styles.imagUser} source={{ uri: user.url }} />
          ) : (
            <Image
              style={styles.imagUser}
              source={require('../asset/image/avatar.png')}
            />
          )}

          <TouchableOpacity
            style={{ flex: 1 }}
            onPress={() => {
              if (post.userId == userCurrent.uid) {
                navigation.navigate('Profile');
              } else {
                navigation.navigate('ProfileModalComponent', {
                  userId: post.userId,
                });
              }
            }}
            disabled={isSelect} // Sử dụng disabled để vô hiệu hóa nút
          >
            <Text
              style={{
                fontSize: 16,
                fontFamily: fontFamilies.semiBold,
                color: 'black',
              }}
            >
              {user.username}
            </Text>
            <Text style={{ fontSize: 12, fontFamily: fontFamilies.regular }}>
              {formatDate(post.createAt)}
            </Text>
          </TouchableOpacity>

          {isEdit && (
            <Menu>
              <MenuTrigger style={{}}>
                <MoreSquare size="32" color="gray" />
              </MenuTrigger>
              <MenuOptions
                customStyles={{
                  optionsContainer: {
                    borderRadius: 10,
                    borderCurve: 'continuous',
                    marginTop: 40,
                    marginRight: 30,
                  },
                }}
              >
                <MenuOption onSelect={() => setIsVisibleModal(true)}>
                  <Text style={{ padding: 10 }}>Edit</Text>
                </MenuOption>
                <MenuOption onSelect={handleDeletePost}>
                  <Text style={{ padding: 10, color: 'red' }}>Delete</Text>
                </MenuOption>
              </MenuOptions>
            </Menu>
          )}
        </View>
        <View style={{ flex: 1 }}>
          <View style={{ marginLeft: 8, marginBottom: 4 }}>
            {post.body ? (
              <>
                <MemoizedRenderHTML
                  source={{ html: post.body }}
                  contentWidth={100}
                  tagsStyles={{
                    body: { color: 'black', fontSize: 18 },
                    h1: { fontSize: 36, fontWeight: 'bold' },
                    h4: { fontSize: 20, fontWeight: 'bold' },
                  }}
                />
              </>
            ) : (
              <></>
            )}
          </View>
          {post.url && (
            <View
              style={{
                flex: 1,
                marginBottom: 20,
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              {post.type == 'image' ? (
                <Image style={styles.image} source={{ uri: post.url }} />
              ) : (
                <></>
              )}
              {post.type == 'video' ? (
                <Video
                  source={{ uri: post.url }}
                  style={styles.image}
                  controls
                  resizeMode="contain"
                />
              ) : (
                <></>
              )}
            </View>
          )}
          <View style={{ flexDirection: 'row', marginTop: 10 }}>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <TouchableOpacity onPress={sendLike}>
                {like ? (
                  <Heart size="32" variant="Bold" color="red" />
                ) : (
                  <Heart size="32" color="gray" />
                )}
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setModalVisible(true)}>
                <Text style={{ color: 'gray', fontSize: 18, marginLeft: 4 }}>
                  {userLike.length}
                </Text>
              </TouchableOpacity>
            </View>
            <SpaceComponent width={12} />
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <TouchableOpacity
                disabled={isSelect}
                onPress={() =>
                  navigation.navigate('PostDetail', { post, userCurrent })
                }
              >
                <Message size="32" color="gray" />
              </TouchableOpacity>
              <Text style={{ color: 'gray', fontSize: 18, marginLeft: 4 }}>
                {userComment.length}
              </Text>
            </View>
            <SpaceComponent width={12} />
            <TouchableOpacity>
              <Send2 size="32" color="gray" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
      <Modal
        style={{ justifyContent: 'center', alignContent: 'center' }}
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            {/* <Text style={styles.modalTitle}>Danh sách người đã like</Text> */}
            <FlatList
              data={userLike}
              renderItem={renderUserLike}
              keyExtractor={item => item.userId}
            />
            <Button title="Close" onPress={() => setModalVisible(false)} />
          </View>
        </View>
      </Modal>
      <ModalEditPost
        visible={isVisibleModal}
        onClose={() => setIsVisibleModal(false)}
        post={post}
      />
      {/* <ProfileModalComponent isVisible={isModalFriendVisible}
        onClose={()=>setModalFriendVisible(false)}
        userId={post.userId}
        navigation={navigation}
        url={post.url}
        /> */}
    </>
  );
};

export default PostCardComponent;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: 10,
    marginBottom: 16,
    borderRadius: 20,
    borderCurve: 'continuous',
    padding: 10,
    borderWidth: 0.6,
    backgroundColor: 'white',
    borderColor: 'gray',
    paddingVertical: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    width: 300,
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    //   alignItems: 'center',
  },
  modalTitle: {
    width: '100%',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  userItem: {
    flex: 1,
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    justifyContent: 'center',
    alignItems: 'center',
  },
  userName: {
    fontSize: 16,
  },
  image: {
    width: 350,
    height: 350,
    borderRadius: 16,
  },
  imagUser: {
    height: 56,
    width: 56,
    borderRadius: 12,
    marginRight: 12,
  },
});
