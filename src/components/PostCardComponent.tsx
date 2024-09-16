import React, { useEffect, useState } from 'react';
import { View, Text, Button, StyleSheet, Image, TouchableOpacity, Modal, FlatList } from 'react-native';
import { fontFamilies } from '../constants/fontFamily';
import { formatDate } from '../funtion/formatDate';
import { Heart, Message, More, Send2, User } from 'iconsax-react-native';
import RenderHTML from 'react-native-render-html';
import Video from 'react-native-video';
import SpaceComponent from './SpaceComponent';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import  { memo } from 'react';

const PostCardComponent = ({ post = {}, userCurrent = {}, navigation = () => {} }: any) => {
    const MemoizedRenderHTML = memo(RenderHTML);
    // const { post, userCurrent,navigation } = props;
    const user = post.user;
    const [like, setLike] = useState(false);
    const [userLike, setUserLike] = useState<any[]>([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [url, setUrl] = useState('');
    const [userComment, setUserComment] = useState<any[]>([]);
    useEffect(() => {
      const unsubscribeLikes = subscribeLikes();
      const unsubscribeComments = subscribeComments();
    
      // Cleanup subscription khi component unmount
      return () => {
        unsubscribeLikes();
        unsubscribeComments();
      };
    }, []);
    
    const subscribeLikes = () => {
      const docRef = firestore().collection('Posts').doc(post.id);
      const likeRef = docRef.collection('like');
    
      // Lắng nghe sự thay đổi trong collection 'like'
      return likeRef.onSnapshot((snapshot) => {
        if (!snapshot.empty) {
          const likes = snapshot.docs.map((doc) => ({
            userId: doc.id,
            ...doc.data(),
          }));
    
          setUserLike(likes);
    
          // Kiểm tra xem userCurrent đã like hay chưa
          const currentUserLike = likes.find((like) => like.userId === userCurrent.userId);
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
    };
    
    const subscribeComments = () => {
      const docRef = firestore().collection('Posts').doc(post.id);
      const commentRef = docRef.collection('comments');
    
      // Lắng nghe sự thay đổi trong collection 'comments'
      return commentRef.onSnapshot((snapshot) => {
        if (!snapshot.empty) {
          const comments = snapshot.docs.map((doc) => ({
            userId: doc.id,
            ...doc.data(),
          }));
    
          setUserComment(comments);
        } else {
          setUserComment([]);
        }
      });
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
            url:userCurrent.url??''
          },
          { merge: true }
        );
        setLike(true);
      }
    };
    const renderUserLike = ({ item }: any) => {
        return (<View style={[styles.userItem,{flexDirection:'row',flex:1}]}>
            {item?.url ? (
          <Image
            style={{ height: 36, width: 36, borderRadius: 100, marginRight: 12 }}
            source={{ uri: item.url }}
          />
        ) : (
            <Image
            style={{ height: 36, width: 36, borderRadius: 100, marginRight: 12 }}
            source={require('../asset/image/avatar.png')}
          />
        )}
        <Text style={{ fontSize: 16, fontFamily: fontFamilies.semiBold, color: 'black',flex:1 }}>{item.senderName}</Text>
        <Heart size="32" variant="Bold" color="red" />
      </View>)
    }
  return (
    <>
    <View style={styles.container}>
      <View style={styles.header}>
        {user?.url ? (
          <Image
            style={{ height: 56, width: 56, borderRadius: 12, marginRight: 12 }}
            source={{ uri: user.url }}
          />
        ) : (
          <Image
            style={{ height: 56, width: 56, borderRadius: 12, marginRight: 12 }}
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
        
      </View>
      <View style={{ flex: 1 }}>
        <View style={{marginLeft:8,marginBottom:4}}>
        {post.body ? (
          <MemoizedRenderHTML source={{ html: post.body }} contentWidth={100} tagsStyles={{
            body: { color: 'black',fontSize:18 },
            h1: { fontSize: 36, fontWeight: 'bold' },
            h4: { fontSize: 20, fontWeight: 'bold' },
          }}/>
        ) : (
          <></>
        )}
        </View>
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
            <TouchableOpacity onPress={()=>setModalVisible(true)}>
            <Text style={{ color: 'gray', fontSize: 18, marginLeft: 4 }}>{userLike.length}</Text>
            </TouchableOpacity>
          </View>
          <SpaceComponent width={12} />
          <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
            <TouchableOpacity onPress={()=>navigation.navigate('PostDetail',{post,
            userCurrent})}>
              <Message size="32" color="gray" />
            </TouchableOpacity>
            <Text style={{ color: 'gray', fontSize: 18, marginLeft: 4 }}>{userComment.length}</Text>
          </View>
          <SpaceComponent width={12} />
          <TouchableOpacity>
            <Send2 size="32" color="gray" />
          </TouchableOpacity>
        </View>
      </View>
      
    </View>
    <Modal style={{justifyContent:'center',alignContent:'center'}}
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
              keyExtractor={(item) => item.userId}
            />
            <Button title="Close" onPress={() => setModalVisible(false)} />
          </View>
        </View>
      </Modal>
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
      flex:1,
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
        width:'100%',
      fontSize: 18,
      fontWeight: 'bold',
      marginBottom: 10,
    },
    userItem: {
        flex:1,
      padding: 10,
      borderBottomWidth: 1,
      borderBottomColor: '#ddd',
      justifyContent:'center',
      alignItems:'center'
    },
    userName: {
      fontSize: 16,
    },
  });