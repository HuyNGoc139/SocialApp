import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, Text, Button, Alert, Image, TouchableOpacity, ScrollView, FlatList } from 'react-native';
import firestore from '@react-native-firebase/firestore'
import auth from '@react-native-firebase/auth'
import ButtonComponent from './components/ButtonComponent';
import { globalStyles } from './styles/globalStyles';
import TextComponent from './components/TextComponent';
import { colors } from './constants/color';
import TitleComponent from './components/TitleComponent';
import { fontFamilies } from './constants/fontFamily';
import RowComponent from './components/RowComponent';
import { Information, Logout, MoreSquare, PasswordCheck } from 'iconsax-react-native';
import SpaceComponent from './components/SpaceComponent';
import { handleDateTime } from './funtion/handleDateTime';
import ModalAddSubtasks from './components/ModalAddSubtasks';
import { User } from './models/user';
import PostCardComponent from './components/PostCardComponent';
import {
  Menu,
  MenuOptions,
  MenuOption,
  MenuTrigger,
} from 'react-native-popup-menu';
import ChangePasswordModal from './components/ChangePasswordModal';
interface FirebaseTimestamp {
  seconds: number;
  nanoseconds: number;
}
const initialValue={
  email:'',
  username:'',
}

const ProfileScreen=({navigation}:any)=>{
  const [isVisibleModalSubTasks, setIsVisibleModalSubTasks] = useState(false);
  const userCurrent = auth().currentUser;  
  const [user,setUser]=useState<User>()
  const [postsList, setPostsList] = useState<any[]>([]);
  const [isModalVisible, setModalVisible] = useState(false);
  useEffect(()=>{
    getUser()
    getAllPost()
},[])

   const getAllPost = () => {
      const unsubscribe = firestore()
        .collection('Posts')
        .orderBy('createAt', 'desc')
        .onSnapshot(async (snapshot) => {
          const postsWithUsers = await Promise.all(
            snapshot.docs.map(async (doc) => {
              const postData = doc.data();
    
              // Kiểm tra nếu postData.userId bằng với userId đã truyền vào
              if (postData.userId === userCurrent?.uid) {
                // Lấy thông tin của người dùng từ collection 'Users'
                const userSnapshot = await firestore().doc(`Users/${postData.userId}`).get();
                const userData = userSnapshot.exists ? userSnapshot.data() : null;
    
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
            })
          );
    
          // Loại bỏ các giá trị null không khớp và cập nhật danh sách bài đăng
          setPostsList(postsWithUsers.filter((post) => post !== null));
        }, (error) => {
          console.error('Error fetching posts:', error);
        });
    
      return unsubscribe; // Trả về hàm hủy đăng ký khi component bị unmount
    };
  const getUser=()=>{
    // const userCurrent = auth().currentUser;  
    firestore().doc(`Users/${userCurrent?.uid}`).onSnapshot((snap:any)=>{
        if(snap.exists){

            setUser({
                ...snap.data()
            })
        }
        else{console.log('task not found')}
    })
}
    const handleLogout = () => {
        auth()
          .signOut()
          .then(() => {
            Alert.alert('Đăng xuất thành công!');
            // Điều hướng về màn hình đăng nhập hoặc màn hình khác
          })
          .catch(error => {
            Alert.alert('Đăng xuất thất bại!', error.message);
          });
      };
      
      const getFormattedDate = (timestamp: FirebaseTimestamp) => {
        if (!timestamp) return '';
        const date = new Date(timestamp.seconds * 1000);
        return handleDateTime.DateString(date); // Hoặc sử dụng `date.toISOString()` để định dạng khác
      };

    return(
        <>
        <ScrollView style={{flex:1}}>
          <View style={{flex:1}}>
            <View style={globalStyles.header}>
              <Text style={globalStyles.textHeader}>Profile</Text>
            </View>
          <View style={{justifyContent:'center',alignItems:'center',width:'100%',height:320}}>
            {user?.url? <Image style={{borderRadius:5000,width:300,height:300}} source={{uri:user.url}}/>:<Image style={{borderRadius:5000,width:300,height:300}} source={require('./asset/image/avatar.png')}/>}
          </View>
          <View style={{flex:1,backgroundColor:'#ababab',
          borderRadius:20 ,
          justifyContent:'center',
          alignItems:'center',
          margin:12}}>
            <View style={{width: '90%', height:180,justifyContent:'space-evenly'}}>
            <Text style={{fontFamily:fontFamilies.regular,fontSize:18,color:'black'}}>UserName: {user?.username}</Text>
            <Text style={{fontFamily:fontFamilies.regular,fontSize:18,color:'black'}}>Email: {user?.email}</Text>
            <Text style={{fontFamily:fontFamilies.regular,fontSize:18,color:'black'}}>Date Of Birth: {getFormattedDate(user?.DateBitrhDay)}</Text>
            <Text style={{fontFamily:fontFamilies.regular,fontSize:18,color:'black'}}>createAt: {handleDateTime.DateString(userCurrent?.metadata.creationTime)}</Text>
            </View>
            <View style={{flex:1}}>
            <RowComponent styles={{width:'90%'}}>
              <Text style={{fontFamily:fontFamilies.regular,fontSize:18,color:'black',flex:1}}>Update information</Text>
                <TouchableOpacity onPress={()=>setIsVisibleModalSubTasks(true)}>
                <Information size="28"color="black"/>
                </TouchableOpacity>
              </RowComponent>
              <SpaceComponent height={12}></SpaceComponent>
              <RowComponent styles={{width:'90%'}}>
              <Text style={{fontFamily:fontFamilies.regular,fontSize:18,color:'black',flex:1}}>Change Password</Text>
                <TouchableOpacity onPress={()=>setModalVisible(true)}>
                <PasswordCheck size="28"color="black"/>
                </TouchableOpacity>
              </RowComponent>
              <SpaceComponent height={12}></SpaceComponent>
              <RowComponent styles={{width:'90%'}}>
              <Text style={{fontFamily:fontFamilies.regular,fontSize:18,color:'black',flex:1}}>LogOut</Text>
                <TouchableOpacity onPress={handleLogout}>
                <Logout size="28"color="black"/>
                </TouchableOpacity>
              </RowComponent>
            </View>

          </View>
          </View>
          <View>
          <View style={{flex:1,margin:16}}>
          {postsList.map((item) => (
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
        <ModalAddSubtasks visible={isVisibleModalSubTasks}
        userId={userCurrent?.uid??''} 
        onClose={()=>setIsVisibleModalSubTasks(false)}/>
        <ChangePasswordModal 
        isVisible={isModalVisible} 
        onClose={() => setModalVisible(false)} 
      />
        </>
    )
}
export default ProfileScreen