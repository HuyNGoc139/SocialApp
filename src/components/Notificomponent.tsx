import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native"
import { fontFamilies } from "../constants/fontFamily";
import { formatDate } from '../funtion/formatDate';
import { handleDateTime } from "../funtion/handleDateTime";
import { useEffect, useState } from "react";
import storage from '@react-native-firebase/storage'
import firestore from '@react-native-firebase/firestore'
import auth from '@react-native-firebase/auth'
const Notificomponent=(props:any)=>{
    const{data,userCurrent,navigation}=props
    const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);
    const postId=data.postId
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
      
          // Truy vấn thông tin người dùng dựa trên userId
          const userSnapshot = await firestore()
            .collection('Users')
            .doc(postData?.userId)
            .get();
      
          const userData = userSnapshot.data();
      
          // Kết hợp dữ liệu bài đăng và thông tin người dùng
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
    return(
        <TouchableOpacity onPress={handlePress}
        style={[styles.container,{backgroundColor:data.isRead?'white':'#babfbf'}]}>
            {data.UserSender?.url ? (
          <Image
            style={{ height: 56, width: 56, borderRadius: 12, marginRight: 12 }}
            source={{ uri: data.UserSender?.url }}
          />
        ) : (
          <Image
            style={{ height: 56, width: 56, borderRadius: 12, marginRight: 12 }}
            source={require('../asset/image/avatar.png')}
          />
        )}
        <View style={{flex:1}}>
            <View style={{flexDirection:'row',alignItems:'center',height:28}}>
            <Text style={{fontFamily:fontFamilies.bold,fontSize:16,color:'black'}}>{data.UserSender.username} 
            </Text>
            {data.type=='like'?<Text style={{fontFamily:fontFamilies.regular,fontSize:16,color:'black'}}> đã thích bài viết của bạn.</Text>
            :<Text style={{fontFamily:fontFamilies.regular,fontSize:16,color:'black'}}> đã bình luận bài viết của bạn.</Text>}
            </View>
            <View>
            {data.type=='comment'?<Text style={{fontFamily:fontFamilies.regular,fontSize:14}}>"{data.commentText}"</Text>:<></>}
            <Text>{handleDateTime.convertFirestoreTimestamp(data.createdAt)}</Text>
            </View>
        </View>
        </TouchableOpacity>
    )
}
export default Notificomponent
const styles=StyleSheet.create({
    container:{
        borderWidth:1,
        borderRadius:16,
        marginTop:10,
        padding:10,
        flexDirection:'row'
    }
})