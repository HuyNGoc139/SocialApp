import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import { AddSquare, Heart } from 'iconsax-react-native';
import SpaceComponent from '../components/SpaceComponent';
import { fontFamilies } from '../constants/fontFamily';
import PostCardComponent from '../components/post/PostCardComponent';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';

const HomeScreen = ({ navigation }: any) => {
  const [unReadCount, setUnreadCount] = useState<number>(0);
  const user = useSelector((state: RootState) => state.auth.user);
  useEffect(() => {
    const unsubscribePosts = getAllPost();
    const unsubscribeNotifications = listenToUnreadNotifications();

    return () => {
      unsubscribePosts();
      unsubscribeNotifications();
    };
  }, [user]);
  const [postsList, setPostsList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const flatListRef = useRef<FlatList<any>>(null);
  const userCurrent = auth().currentUser;
  const listenToUnreadNotifications = () => {
    const unsubscribe = firestore()
      .collection('notifi')
      .where('receiverId', '==', userCurrent?.uid)
      .onSnapshot(
        snapshot => {
          const unreadNotifications = snapshot.docs.filter(doc => {
            const data = doc.data();
            return data.isRead === false;
          });
          const unreadCount = unreadNotifications.length; // Số lượng thông báo chưa đọc
          setUnreadCount(unreadCount); // Cập nhật state
        },
        error => {
          console.error('Error fetching unread notifications:', error);
          setUnreadCount(0); // Trả về 0 nếu có lỗi
        },
      );

    // Trả về hàm hủy đăng ký khi component bị unmount
    return unsubscribe;
  };

  const getAllPost = () => {
    // Lắng nghe sự thay đổi của collection "Posts"
    const unsubscribe = firestore()
      .collection('Posts')
      .orderBy('createAt', 'desc')
      .onSnapshot(
        async snapshot => {
          // Khi có sự thay đổi, lấy dữ liệu mới
          setIsLoading(true);
          const postsWithUsers = await Promise.all(
            snapshot.docs.map(async doc => {
              const postData = doc.data();

              // Truy vấn thông tin người dùng dựa trên userId
              if (postData.userId == user?.uid) {
                const userData = user;
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
                const userSnapshot = await firestore()
                  .collection('Users')
                  .doc(postData.userId)
                  .get();

                const userData = userSnapshot.data();
                return {
                  id: doc.id,
                  url: postData.url,
                  createAt: postData.createAt.toDate(),
                  body: postData.body,
                  userId: postData.userId,
                  type: postData.type,
                  user: userData || null,
                };
              }

              // Kết hợp dữ liệu bài đăng và thông tin người dùng
            }),
          );

          setPostsList(postsWithUsers);
          flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
          setIsLoading(false);
        },
        error => {
          console.error('Error fetching and sorting posts with users:', error);
          setIsLoading(false);
        },
      );

    // Trả về hàm hủy đăng ký khi component bị unmount
    return unsubscribe;
  };

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.header}>
        <Text style={styles.textHeader}>HuySocial</Text>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <TouchableOpacity
            onPress={() => navigation.navigate('NotificationScreen', { user })}
          >
            {unReadCount > 0 ? (
              <>
                <Heart size={30} color="red" variant="Bold" />
                <View style={styles.viewNoti}>
                  <Text style={styles.textNoti}>{unReadCount}</Text>
                </View>
              </>
            ) : (
              <Heart size="30" color="white" />
            )}
          </TouchableOpacity>
          <SpaceComponent width={10} />
          <TouchableOpacity
            onPress={() => navigation.navigate('CreatePostScreen', { user })}
          >
            <AddSquare size="30" color="white" />
          </TouchableOpacity>
          <SpaceComponent width={10} />
          <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
            {user?.url ? (
              <Image style={styles.image} source={{ uri: user.url }} />
            ) : (
              <Image
                style={styles.image}
                source={require('../assets/image/avatar.png')}
              />
            )}
          </TouchableOpacity>
        </View>
      </View>
      <View style={{ flex: 1, marginHorizontal: 16 }}>
        {isLoading ? (
          <ActivityIndicator size="large" color="black" />
        ) : (
          <FlatList
            showsVerticalScrollIndicator={false}
            showsHorizontalScrollIndicator={false}
            initialNumToRender={5}
            ref={flatListRef}
            data={postsList}
            keyExtractor={item => item.id.toString()}
            renderItem={({ item }: any) => (
              <PostCardComponent
                key={item.id}
                post={item}
                userCurrent={user}
                navigation={navigation}
              />
            )}
          />
        )}
      </View>
    </View>
  );
};
export default HomeScreen;
const styles = StyleSheet.create({
  header: {
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    height: 80,
    flexDirection: 'row',
    backgroundColor: '#50c7c7',
  },
  textNoti: {
    color: 'black',
    lineHeight: 20,
  },
  viewNoti: {
    position: 'absolute',
    backgroundColor: 'white',
    height: 18,
    width: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 100,
    top: 12,
    left: 12,
  },
  textHeader: {
    flex: 1,
    marginLeft: 10,
    color: 'white',
    fontSize: 24,
    fontFamily: fontFamilies.semiBold,
  },
  image: {
    height: 48,
    width: 48,
    borderRadius: 100,
    marginRight: 12,
  },
});
