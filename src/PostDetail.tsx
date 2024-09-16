import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, Text, Button, TouchableOpacity, ScrollView, TextInput, StyleSheet, FlatList } from 'react-native';
import { ArrowSquareLeft, Send2 } from 'iconsax-react-native';
import PostCardComponent from './components/PostCardComponent';
import { globalStyles } from './styles/globalStyles';
import InputComponent from './components/InputComponent';
import { fontFamilies } from './constants/fontFamily';
import storage from '@react-native-firebase/storage'
import firestore from '@react-native-firebase/firestore'
import auth from '@react-native-firebase/auth'
import { User } from './models/user';
import CommentItem from './components/CommentItem';
const PostDetail=({navigation,route}:any)=>{
    const [textRef,setTextRef]=useState('')
    const {post,userCurrent}=route.params

  //do phai cho truyen nen render lau
    const [userComment, setUserComment] = useState<any[]>([]);
    const [user,setUser]=useState<User>()
    useEffect(() => {
        const docRef = firestore().collection('Posts').doc(post.id);
        const commentRef = docRef.collection('comments').orderBy('createdAt', 'desc'); // Sắp xếp giảm dần theo createdAt
      
        const unsubscribe = commentRef.onSnapshot(snapshot => {
          if (!snapshot.empty) {
            const comment = snapshot.docs.map((doc) => {
              return {
                ...doc.data(),
              };
            });
            setUserComment(comment); // Cập nhật danh sách bình luận
          } else {
            console.log('Không có bình luận.');
            setUserComment([]);
          }
        });
      
        return () => unsubscribe(); // Hủy lắng nghe khi component bị unmount
      }, []);
      const handleSentComment = async () => {
        let comment = textRef.trim();
        if (!comment) return;
        try {
            const docRef = firestore().collection('Posts').doc(post.id);
            const commentsRef = docRef.collection('comments');
            
            // Tạo một comment với ID do chính bạn tạo
            const newCommentRef = commentsRef.doc(); // Lấy tham chiếu tới comment mới
            
            // Dùng set() để thêm comment với ID đã tạo
            await newCommentRef.set({
                commentId: newCommentRef.id, // Sử dụng ID của comment đã tạo
                userId: userCurrent?.userId,
                text: comment,
                profileUrl: userCurrent.url ?? '',
                senderName: userCurrent?.username,
                createdAt: new Date(),
            });
    
            console.log('Comments sent successfully');
            setTextRef(''); // Xóa nội dung input sau khi gửi
        } catch (err) {
            console.log('Error sending message:', err);
        }
    };
    return(
        <ScrollView>
            <View style={[globalStyles.header,{paddingLeft:12,flex:1,paddingRight:12}]}>
            <TouchableOpacity style={{}} onPress={()=>navigation.goBack()}>
            <ArrowSquareLeft size="28" color="white"/>
            </TouchableOpacity>
            <View style={{flex:1,justifyContent:'center',alignItems:'center'}}>
            <Text style={[globalStyles.textHeader]}>Detail</Text>
            </View>
            </View>
            <View style={{flex:1,margin:12}}>
            <PostCardComponent
            post={post} 
            userCurrent={userCurrent}
            navigation={navigation}/>
            </View>
            <View style={styles.input}> 
            <TextInput 
                    value={textRef}
                    placeholder='Comments'
                    style={{flex:1,fontFamily:fontFamilies.regular,fontSize:16,}}
                    onChangeText={val=>setTextRef(val)}
                    /> 
                    <TouchableOpacity onPress={handleSentComment} style={{marginRight:10}}>
                    <Send2 size="28"color="black"/>
                    </TouchableOpacity>
            </View>
            <View style={{margin:15}}>
            {userComment.length > 0 ? (
                userComment.map((cmt,index) => (
                    <CommentItem key={index} cmt={cmt} userCurrent={userCurrent} postid={post.id}/>
                ))
            ) : (
                <View style={{justifyContent:'center',alignItems:'center'}}><Text style={{fontFamily:fontFamilies.regular,
                color:'black',
                fontSize:18
                }}>Be first to comment.</Text></View>
            )}
            </View>
        </ScrollView>
    )
}
export default PostDetail
const styles=StyleSheet.create({
    input:{
    flexDirection:'row',
    justifyContent:'space-between',alignItems:'center',
    borderWidth:1,
    borderRadius:50,
    margin:12,
    paddingLeft:12
    }
})