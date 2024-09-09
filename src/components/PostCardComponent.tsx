import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, Text, Button, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { fontFamilies } from '../constants/fontFamily';
import { handleDateTime } from '../funtion/handleDateTime';
import { formatDate } from '../funtion/formatDate';
import { More } from 'iconsax-react-native';
import RenderHTML from 'react-native-render-html';
import Video from 'react-native-video';

const PostCardComponent=(props:any)=>{
    const{post}=props
    const user=post.user
    return(
        <View style={styles.container}>
            <View style={styles.header}>
            {user?.url?<Image style={{ height: 56, width: 56, borderRadius: 12, marginRight: 12 }} source={{uri:user.url}} /> 
            : <Image style={{ height: 48, width: 48, borderRadius: 12, marginRight: 12 }} source={require('../asset/image/avatar.png')} />}
            <View style={{flex:1}}>
            <Text style={{fontSize:16,fontFamily:fontFamilies.semiBold,color:'black'}}>{user.username}</Text>
            <Text style={{fontSize:12,fontFamily:fontFamilies.regular}}>{formatDate(post.createAt)}</Text>
            </View>
            <TouchableOpacity>
            <More size="32" color="black"/>
            </TouchableOpacity>
            </View>
            <View style={{flex:1}}> 
            {post.body?<RenderHTML source={{html:post.body}}
            contentWidth={100}
            />
            :<></>}
            {post.url&&<View style={{flex:1,marginBottom:20,justifyContent:'center',alignItems:'center'}}>
            {post.type=='image'?<Image style={{width:350,height:350,borderRadius:16}} source={{uri:post.url}}/>:<></>}
            {post.type=='video'?<Video
          source={{ uri: post.url }} // URL của video
          style={{ width: 300, height: 300 }}
          controls // Hiển thị các nút điều khiển (play/pause, etc.)
          resizeMode="contain" // Tùy chọn thay đổi kích thước video
        />:<></>}
            </View>}
            </View>
        </View>
    )
}
export default PostCardComponent
const styles=StyleSheet.create(
    {
        container:{
            flex:1,
            gap:10,
            marginBottom:16,
            borderRadius:20,
            borderCurve:'continuous',
            padding:10,
            borderWidth:0.6,
            backgroundColor:'white',
            borderColor:'gray',
            paddingVertical:12
        },
        header:{
            flexDirection:'row',
            justifyContent:'space-between'
          }
    }
)