import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  StyleSheet,
} from 'react-native';
import { ArrowSquareLeft, Send2 } from 'iconsax-react-native';
import PostCardComponent from '../components/post/PostCardComponent';
import { globalStyles } from '../styles/globalStyles';
import { fontFamilies } from '../constants/fontFamily';
import firestore from '@react-native-firebase/firestore';
import CommentItem from '../components/post/CommentItem';
const PostDetail = ({ navigation, route }: any) => {
  const [textRef, setTextRef] = useState('');
  const { post, userCurrent } = route.params;
  const [userComment, setUserComment] = useState<any[]>([]);
  useEffect(() => {
    const docRef = firestore().collection('Posts').doc(post.id);
    const commentRef = docRef
      .collection('comments')
      .orderBy('createdAt', 'desc');

    const unsubscribe = commentRef.onSnapshot(async snapshot => {
      if (!snapshot.empty) {
        const commentsWithUserInfo = await Promise.all(
          snapshot.docs.map(async doc => {
            const commentData = doc.data();

            const userSnapshot = await firestore()
              .collection('Users')
              .doc(commentData.userId)
              .get();
            const userInfo = userSnapshot.exists ? userSnapshot.data() : {};

            return {
              ...commentData,
              user: userInfo,
            };
          }),
        );
        setUserComment(commentsWithUserInfo);
      } else {
        setUserComment([]);
      }
    });

    return () => unsubscribe();
  }, []);
  const sendCommentNotification = async (
    comment: string,
    commentId: string,
  ) => {
    try {
      const notificationRef = firestore().collection('notifi');

      await notificationRef.add({
        postId: post.id,
        senderName: userCurrent.username,
        senderId: userCurrent.userId,
        commentText: comment,
        type: 'comment', // loại thông báo (comment)
        createdAt: new Date(),
        receiverId: post.user.userId,
        isRead: false,
        commentId: commentId,
      });
    } catch (error) {
      console.log('Error sending notification:', error);
    }
  };
  const handleSentComment = async () => {
    let comment = textRef.trim();
    if (!comment) return;
    try {
      const docRef = firestore().collection('Posts').doc(post.id);
      const commentsRef = docRef.collection('comments');

      const newCommentRef = commentsRef.doc();

      await newCommentRef.set({
        commentId: newCommentRef.id,
        userId: userCurrent?.userId,
        text: comment,
        profileUrl: userCurrent.url ?? '',
        senderName: userCurrent?.username,
        createdAt: new Date(),
      });
      if (userCurrent.userId !== post.user.userId) {
        await sendCommentNotification(comment, newCommentRef.id);
      }
      console.log('Comments sent successfully');
      setTextRef('');
    } catch (err) {
      console.log('Error sending message:', err);
    }
  };

  return (
    <ScrollView>
      <View
        style={[
          globalStyles.header,
          { paddingLeft: 12, flex: 1, paddingRight: 12 },
        ]}
      >
        <TouchableOpacity style={{}} onPress={() => navigation.goBack()}>
          <ArrowSquareLeft size="28" color="white" />
        </TouchableOpacity>
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            paddingRight: 20,
          }}
        >
          <Text style={[globalStyles.textHeader]}>Post Details</Text>
        </View>
      </View>
      <View style={{ flex: 1, margin: 12 }}>
        <PostCardComponent
          post={post}
          userCurrent={userCurrent}
          navigation={navigation}
        />
      </View>
      <View style={styles.input}>
        <TextInput
          value={textRef}
          placeholder="Comments"
          style={{ flex: 1, fontFamily: fontFamilies.regular, fontSize: 16 }}
          onChangeText={val => setTextRef(val)}
        />
        <TouchableOpacity
          onPress={handleSentComment}
          style={{ marginRight: 10 }}
        >
          <Send2 size="28" color="black" />
        </TouchableOpacity>
      </View>
      <View style={{ margin: 15 }}>
        {userComment.length > 0 ? (
          userComment.map((cmt, index) => (
            <CommentItem
              key={index}
              cmt={cmt}
              userCurrent={userCurrent}
              postid={post.id}
              postUserId={post.userId}
            />
          ))
        ) : (
          <View style={{ justifyContent: 'center', alignItems: 'center' }}>
            <Text
              style={{
                fontFamily: fontFamilies.regular,
                color: 'black',
                fontSize: 18,
              }}
            >
              Be first to comment.
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
};
export default PostDetail;
const styles = StyleSheet.create({
  input: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 50,
    margin: 12,
    paddingLeft: 12,
  },
});
