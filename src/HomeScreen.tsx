import React, { useEffect, useRef, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, Text, Button, StyleSheet, TouchableOpacity, Image, FlatList } from 'react-native';
import firestore from '@react-native-firebase/firestore'
import auth from '@react-native-firebase/auth'
import { AddSquare, Heart, Velas } from 'iconsax-react-native';
import SpaceComponent from './components/SpaceComponent';
import { User } from './models/user';
import { fontFamilies } from './constants/fontFamily';
import { posts } from './models/user';
import PostCardComponent from './components/PostCardComponent';
const HomeScreen=({navigation}:any)=>{

  useEffect(()=>{
 getUser()
 getAllPost()
  },[])
  const [user,setUser]=useState<User>()
  const [postsList, setPostsList] = useState<any[]>([]);
  const flatListRef = useRef<FlatList<any>>(null);
 const userCurrent = auth().currentUser;
 const getUser=()=>{
    firestore().doc(`Users/${userCurrent?.uid}`).onSnapshot((snap:any)=>{
        if(snap.exists){

            setUser({
                ...snap.data()
            })
        }
        else{console.log('user not found')}
    })
}

const getAllPost = () => {
  // Lắng nghe sự thay đổi của collection "Posts"
  const unsubscribe = firestore()
    .collection('Posts')
    .orderBy('createAt', 'desc')
    .onSnapshot(async (snapshot) => {
      // Khi có sự thay đổi, lấy dữ liệu mới
      const postsWithUsers = await Promise.all(
        snapshot.docs.map(async (doc) => {
          const postData = doc.data();

          // Truy vấn thông tin người dùng dựa trên userId
          const userSnapshot = await firestore()
            .collection('Users')
            .doc(postData.userId)
            .get();
          
          const userData = userSnapshot.data();

          // Kết hợp dữ liệu bài đăng và thông tin người dùng
          return {
            id: doc.id,
            url: postData.url,
            createAt: postData.createAt.toDate(),
            body: postData.body,
            userId: postData.userId,
            type: postData.type,
            user: userData || null,
          };
        })
      );

      console.log('Fetched and sorted posts with users:', postsWithUsers);
      setPostsList(postsWithUsers);
      flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
    }, (error) => {
      console.error('Error fetching and sorting posts with users:', error);
    });

  // Trả về hàm hủy đăng ký khi component bị unmount
  return unsubscribe;
};

    return(
        <View style={{flex:1}}>
            <View style={styles.header}> 
                <Text style={{flex:1,marginLeft:10,color:'black',fontSize:24,fontFamily:fontFamilies.regular}}>ScocialAPP</Text>
                <View style={{flexDirection:'row',justifyContent:'center',
        alignItems:'center',}}>
                <TouchableOpacity>
                <Heart size="28" color="black"/>
                </TouchableOpacity>
                <SpaceComponent width={10}/>
                <TouchableOpacity onPress={() => navigation.navigate('CreatePostScreen',{user})}>
                <AddSquare size="28" color="black"/>
                </TouchableOpacity>
                <SpaceComponent width={10}/>
                <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
         {user?.url?<Image style={{ height: 42, width: 42, borderRadius: 100, marginRight: 12 }} source={{uri:user.url}} /> : <Image style={{ height: 48, width: 48, borderRadius: 100, marginRight: 12 }} source={require('./asset/image/avatar.png')} />}
        </TouchableOpacity>
                </View>
            </View>
            <View style={{flex:1,margin:16}}>
            <FlatList 
            showsVerticalScrollIndicator={false}
            showsHorizontalScrollIndicator={false}
            ref={flatListRef}
            data={postsList}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }: any) => (
            <PostCardComponent key={item.id} 
            post={item} 
            userCurrent={user}
            navigation={navigation}/>
            )}
            />
            </View>
        </View>
    )
}
export default HomeScreen
const styles=StyleSheet.create({
    header:{
        justifyContent:'center',
        alignItems:'center',
        borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    height: 80,
    flexDirection: 'row',
    backgroundColor:'white'
    },
    footer:{

    }
})