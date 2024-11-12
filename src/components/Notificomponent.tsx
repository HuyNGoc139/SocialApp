import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { fontFamilies } from '../constants/fontFamily';
import { handleDateTime } from '../funtion/handleDateTime';
import { memo, useEffect, useState } from 'react';
import firestore from '@react-native-firebase/firestore';
import {
  Menu,
  MenuOption,
  MenuOptions,
  MenuTrigger,
} from 'react-native-popup-menu';
import { MoreSquare } from 'iconsax-react-native';
const Notificomponent = (props: any) => {
  const { data, userCurrent, navigation } = props;
  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const postId = data.postId;
  useEffect(() => {
    const fetchPost = async () => {
      const fetchedPost = await getPostWithUserById(postId);
      setPost(fetchedPost);
    };

    fetchPost();
  }, []);
  const getPostWithUserById = async (postId: string) => {
    try {
      const postDoc = await firestore().collection('Posts').doc(postId).get();

      if (!postDoc.exists) {
        console.error('Post not found');
        return null;
      }

      const postData = postDoc.data();

      const userSnapshot = await firestore()
        .collection('Users')
        .doc(postData?.userId)
        .get();

      const userData = userSnapshot.data();

      return {
        id: postDoc.id,
        url: postData?.url,
        createAt: postData?.createAt.toDate(),
        body: postData?.body,
        userId: postData?.userId,
        type: postData?.type,
        user: userData || null,
      };
    } catch (error) {
      console.error('Error fetching post with user:', error);
      return null;
    }
  };
  const handlePress = async () => {
    try {
      // Cập nhật isRead = true
      await firestore().collection('notifi').doc(data.id).update({
        isRead: true,
      });

      // Chuyển trang
      navigation.navigate('PostDetail', { post, userCurrent });
    } catch (error) {
      console.error('Error updating notification:', error);
    }
  };
  const handletruePress = async () => {
    try {
      // Cập nhật isRead = true
      await firestore().collection('notifi').doc(data.id).update({
        isRead: true,
      });

      // Chuyển trang
    } catch (error) {
      console.error('Error updating notification:', error);
    }
  };
  const handlenonPress = async () => {
    try {
      // Cập nhật isRead = true
      await firestore().collection('notifi').doc(data.id).update({
        isRead: false,
      });
    } catch (error) {
      console.error('Error updating notification:', error);
    }
  };
  return (
    <TouchableOpacity
      onPress={handlePress}
      style={[
        styles.container,
        { backgroundColor: data.isRead ? 'white' : '#d3d4f0' },
      ]}
    >
      <View style={{ flex: 1, flexDirection: 'row' }}>
        {data.UserSender?.url ? (
          <Image
            style={{ height: 56, width: 56, borderRadius: 12, marginRight: 12 }}
            source={{ uri: data.UserSender?.url }}
          />
        ) : (
          <Image
            style={{ height: 56, width: 56, borderRadius: 12, marginRight: 12 }}
            source={require('../assets/image/avatar.png')}
          />
        )}
        <View>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            {/* <Text style={{fontFamily:fontFamilies.bold,fontSize:16,color:'black'}}>{data.UserSender.username} 
            </Text> */}
            {data.type === 'like' ? (
              <Text style={styles.text}>
                <Text style={styles.textBold}>{data.UserSender.username} </Text>
                đã thích bài viết của bạn.
              </Text>
            ) : (
              <Text style={styles.text}>
                <Text style={styles.textBold}>{data.UserSender.username} </Text>
                đã bình luận về bài viết của bạn.
              </Text>
            )}
          </View>

          {data.type == 'comment' ? (
            <Text style={{ fontFamily: fontFamilies.regular, fontSize: 14 }}>
              "{data.commentText}"
            </Text>
          ) : (
            <></>
          )}
          <Text>
            {handleDateTime.convertFirestoreTimestamp(data.createdAt)}
          </Text>
        </View>
      </View>
      <View>
        <Menu>
          <MenuTrigger style={{}}>
            <MoreSquare size="28" color="#FF8A65" />
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
            <MenuOption
              onSelect={() => {
                handletruePress();
              }}
            >
              <Text style={{ padding: 10 }}>Đánh dấu là đã đọc</Text>
            </MenuOption>
            <MenuOption
              onSelect={() => {
                handlenonPress();
              }}
            >
              <Text style={{ padding: 10, color: 'red' }}>
                Đánh dấu là chưa đọc
              </Text>
            </MenuOption>
          </MenuOptions>
        </Menu>
      </View>
    </TouchableOpacity>
  );
};
export default memo(Notificomponent);
const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderRadius: 16,
    marginTop: 10,
    padding: 10,
    flexDirection: 'row',
  },
  text: {
    fontFamily: fontFamilies.regular,
    fontSize: 15,
    color: 'black',
    width: 260,
  },
  textBold: {
    fontFamily: fontFamilies.bold,
    fontSize: 16,
    color: 'black',
  },
});
