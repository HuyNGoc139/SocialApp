import React, { useEffect, useState } from 'react';
import { View, Text, Button, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { fontFamilies } from '../constants/fontFamily';
import { formatDate } from '../funtion/formatDate';
import { Heart, Message, More, Send2 } from 'iconsax-react-native';
import RenderHTML from 'react-native-render-html';
import Video from 'react-native-video';
import SpaceComponent from './SpaceComponent';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';

const PostCardComponent = (props: any) => {
    const { post, userCurrent } = props;
    const user = post.user;
    const [like, setLike] = useState(false);
    const [userLike, setUserLike] = useState<any[]>([]);
  
    useEffect(() => {
      getLikes();
    }, [like]);
  
    const getLikes = async () => {
      const docRef = firestore().collection('Posts').doc(post.id);
      const likeRef = docRef.collection('like');
  
      // Lấy tất cả các user đã like
      const snapshot = await likeRef.get();
  
      // Kiểm tra nếu có dữ liệu
      if (!snapshot.empty) {
        const likes = snapshot.docs.map((doc) => {
          return {
            userId: doc.id, // hoặc doc.data().userId
            ...doc.data(), // Lấy tất cả dữ liệu của user đã like
          };
        });
        setUserLike(likes); // Đây là danh sách các user đã like
  
        // Kiểm tra xem userCurrent đã like hay chưa
        const currentUserLike = likes.find((like) => like.userId === userCurrent.userId);
        if (currentUserLike) {
          setLike(true); // Nếu userCurrent đã like, đặt trạng thái like thành true
        } else {
          setLike(false); // Nếu chưa like, đặt trạng thái like thành false
        }
      } else {
        console.log('Không có ai đã like bài viết này.');
        setUserLike([]);
      }
    };
  
    const sendLike = async () => {
      const docRef = firestore().collection('Posts').doc(post.id);
      const likeRef = docRef.collection('like').doc(userCurrent?.userId);
  
      if (like) {
        // Nếu userCurrent đã like, xóa like khỏi Firestore
        await likeRef.delete();
        setLike(false);
      } else {
        // Nếu userCurrent chưa like, thêm like vào Firestore
        await likeRef.set(
          {
            userId: userCurrent.userId,
            senderName: userCurrent?.username,
            createdAt: new Date(),
          },
          { merge: true }
        );
        setLike(true);
      }
  
      // Cập nhật lại danh sách các user đã like
    };
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        {user?.url ? (
          <Image
            style={{ height: 56, width: 56, borderRadius: 12, marginRight: 12 }}
            source={{ uri: user.url }}
          />
        ) : (
          <Image
            style={{ height: 48, width: 48, borderRadius: 12, marginRight: 12 }}
            source={require('../asset/image/avatar.png')}
          />
        )}
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 16, fontFamily: fontFamilies.semiBold, color: 'black' }}>
            {user.username}
          </Text>
          <Text style={{ fontSize: 12, fontFamily: fontFamilies.regular }}>
            {formatDate(post.createAt)}
          </Text>
        </View>
        <TouchableOpacity>
          <More size="32" color="black" />
        </TouchableOpacity>
      </View>
      <View style={{ flex: 1 }}>
        {post.body ? (
          <RenderHTML source={{ html: post.body }} contentWidth={100} />
        ) : (
          <></>
        )}
        {post.url && (
          <View style={{ flex: 1, marginBottom: 20, justifyContent: 'center', alignItems: 'center' }}>
            {post.type == 'image' ? (
              <Image style={{ width: 350, height: 350, borderRadius: 16 }} source={{ uri: post.url }} />
            ) : (
              <></>
            )}
            {post.type == 'video' ? (
              <Video
                source={{ uri: post.url }}
                style={{ width: 300, height: 300 }}
                controls
                resizeMode="contain"
              />
            ) : (
              <></>
            )}
          </View>
        )}
        <View style={{ flexDirection: 'row', marginTop: 10 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
            <TouchableOpacity onPress={sendLike}>
              {like ? (
                <Heart size="32" variant="Bold" color="red" />
              ) : (
                <Heart size="32"  color="gray" />
              )}
            </TouchableOpacity>
            <Text style={{ color: 'gray', fontSize: 18, marginLeft: 4 }}>{userLike.length}</Text>
          </View>
          <SpaceComponent width={12} />
          <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
            <TouchableOpacity>
              <Message size="32" color="gray" />
            </TouchableOpacity>
            <Text style={{ color: 'gray', fontSize: 18, marginLeft: 4 }}>0</Text>
          </View>
          <SpaceComponent width={12} />
          <TouchableOpacity>
            <Send2 size="32" color="gray" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
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
});
