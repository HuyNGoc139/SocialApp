import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { fontFamilies } from '../constants/fontFamily';
import { handleDateTime } from '../funtion/handleDateTime';
import { formatDate } from '../funtion/formatDate';
import SpaceComponent from './SpaceComponent';
import { Trash } from 'iconsax-react-native';
import storage from '@react-native-firebase/storage';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';

const CommentItem = (props: any) => {
  const { cmt, userCurrent, postid } = props;
  const handelDeleteComment = async () => {
    try {
      Alert.alert(
        'Delete Comment',
        'Are you sure you want to delete this comment?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'OK',
            onPress: async () => {
              const postRef = firestore().collection('Posts').doc(postid); // Tham chiếu đến document của post
              const commentRef = postRef
                .collection('comments')
                .doc(cmt.commentId);

              await commentRef.delete();
              // console.log('Comment deleted successfully');
            },
          },
        ],
      );
    } catch (err) {
      console.error('Error deleting comment:', err);
    }
  };
  return (
    <View style={styles.container}>
      {cmt?.user.url ? (
        <Image
          style={{ height: 42, width: 42, borderRadius: 12, marginRight: 12 }}
          source={{ uri: cmt.user.url }}
        />
      ) : (
        <Image
          style={{ height: 48, width: 48, borderRadius: 12, marginRight: 12 }}
          source={require('../assets/image/avatar.png')}
        />
      )}
      <View style={{ flex: 1 }}>
        <View style={{ flexDirection: 'row' }}>
          <Text style={styles.textUser}>{cmt.user.username}</Text>
          <SpaceComponent width={10} />
          <Text>{handleDateTime.GetHour(cmt.createdAt)}</Text>
        </View>
        <View>
          <Text style={{ fontFamily: fontFamilies.regular, fontSize: 14 }}>
            {cmt.text}
          </Text>
        </View>
      </View>
      {cmt.userId == userCurrent.uid || cmt.userId == userCurrent.userId ? (
        <TouchableOpacity onPress={handelDeleteComment}>
          <Trash size="24" color="rgb(237, 7, 61)" />
        </TouchableOpacity>
      ) : (
        <></>
      )}
    </View>
  );
};

export default CommentItem;
const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgb(192, 204, 204)',
    borderRadius: 16,
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  textUser: {
    fontSize: 16,
    fontFamily: fontFamilies.semiBold,
    color: 'black',
  },
});
