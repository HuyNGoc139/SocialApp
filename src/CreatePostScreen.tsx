import React, { useEffect, useRef, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, Text, Button, TouchableOpacity, ScrollView, Image, StyleSheet } from 'react-native';
import firestore from '@react-native-firebase/firestore'
import auth from '@react-native-firebase/auth'
import { ArrowSquareLeft, Back, Camera,  Forbidden2,  VideoAdd } from 'iconsax-react-native';
import { globalStyles } from './styles/globalStyles';
import { fontFamilies } from './constants/fontFamily';
import { RichEditor, RichToolbar, actions } from 'react-native-pell-rich-editor';
import SpaceComponent from './components/SpaceComponent';
import ImagePicker from 'react-native-image-crop-picker';
import storage from '@react-native-firebase/storage'
import Video from 'react-native-video';
import { posts } from './models/user';
import ButtonComponent from './components/ButtonComponent';
const initialValue:posts={
  id:'',
  url:'',
  createAt:new Date(),
  body:'',
  userId:'', //=user cua nguoi dang
  type:'',
}
const CreatePostScreen=({navigation,route}:any)=>{
  const[data,setDate]=useState<posts>(initialValue)
  const { user } = route.params;
  const richText = useRef<RichEditor>(null);
  const[text,setText]=useState('')
  const[file,setFile]=useState('')
  const [videoUrl, setVideoUrl] = useState('');
  const[type,setType]=useState('')
  const handleSelectImage = async () => {
    setType('image')
    try {
      const image = await ImagePicker.openPicker({
        width: 300,
        height: 400,
        cropping: true,
        mediaType: 'any',
      });
  
      console.log('Selected image:', image);
  
      // Lấy tên file từ đường dẫn
      const filename = image.path.substring(image.path.lastIndexOf('/') + 1);
  
      // Tạo reference đến Firebase Storage
      const reference = storage().ref(`Images/${filename}`);
  
      // Upload file
      await reference.putFile(image.path);
  
      // Lấy URL của file đã upload
      const url = await reference.getDownloadURL();
  
      // Cập nhật URL ảnh vào state
      setFile(url);
    } catch (error) {
      console.log('Error selecting image:', error);
    }
  };
  const handleSelectMedia = async () => {
    setType('video')
    ImagePicker.openPicker({
      mediaType: 'video', // Cho phép chọn cả ảnh và video
    })
      .then(async (media) => {
        console.log(media);
        const filename = media.path.substring(media.path.lastIndexOf('/') + 1); // Lấy tên file từ đường dẫn
        const reference = storage().ref(`Media/${filename}`); // Tạo reference đến Firebase Storage
        await reference.putFile(media.path);
        const url = await reference.getDownloadURL();
        console.log('url', url);
        setFile(url)
      })
      .catch((error) => {
        console.log('Error selecting media:', error);
      });
  };
  const handleSavePost = async () => {
    if (user) {
      const postId = firestore().collection('Posts').doc().id;

      const data = {
        id: postId,
        url: file,
        createAt: new Date(),
        body: text,
        userId: user.userId,
        type: type,
      };

      try {
        await firestore().collection('Posts').doc(postId).set(data);
        console.log('Post saved successfully');
        navigation.goBack();
      } catch (error) {
        console.error('Error saving post:', error);
      }
    } else {
      console.error('User is not authenticated');
    }
  };

    return(
        <View style={{flex:1}}>
            <View style={[globalStyles.header,{padding:12}]}>
            <TouchableOpacity onPress={()=>{navigation.goBack()}}>
            <ArrowSquareLeft color='white' size={32}/>
            </TouchableOpacity>
            <View style={{justifyContent:'center',alignItems:'center',flex:1}}>
            <Text style={[globalStyles.textHeader,{flex:1,lineHeight:58}]}>CreatePostScreen</Text>
            </View>
            </View>
            <ScrollView style={{flex:1,margin:20}}>
            <View style={{flexDirection:'row'}}>
                <View style={{flexDirection:'row'}}>
                {user?.url?<Image style={{ height: 56, width: 56, borderRadius: 12, marginRight: 12 }} source={{uri:user.url}} /> 
            : <Image style={{ height: 48, width: 48, borderRadius: 100, marginRight: 12 }} source={require('./asset/image/avatar.png')} />}
                </View>
                <View>
                    <Text style={{fontSize:20,fontFamily:fontFamilies.regular,color:'black'}}>{user.username}</Text>
                    <Text style={{fontSize:17,fontFamily:fontFamilies.regular}}>Public</Text>
                </View>
            </View>
            <View style={{flex:1,marginTop:20,height:320}}>
            <RichToolbar style={styles.richbar}
            selectedButtonStyle={styles.selectedButton}
            editor={richText}
            actions={[actions.setBold,
                        actions.setItalic,
                        actions.keyboard,
                        actions.setStrikethrough,
                        actions.setUnderline,
                        actions.removeFormat,
                        actions.checkboxList,
                        actions.undo,
                        actions.heading1,
                        actions.heading4,
                        actions.redo,]}
                        iconMap={{
                            [actions.heading1]: () => <Text>H1</Text>, // Đặt biểu tượng cho heading1
                            [actions.heading4]: () => <Text>H4</Text>, // Đặt biểu tượng cho heading4
                          }}
                        />
            <View>
            <RichEditor ref={richText}
          style={styles.richEditor}
          placeholder="Nhập nội dung tại đây..."
          onChange={(val) => setText(val)}/>
            </View>
            </View>
            <View>
            {file&&<View style={{flex:1,marginBottom:20,justifyContent:'center',alignItems:'center'}}>
            {type=='image'?<Image style={{width:300,height:300,borderRadius:16}} source={{uri:file}}/>:<></>}
            {type=='video'?<Video
          source={{ uri: file }} // URL của video
          style={{ width: 300, height: 300 }}
          controls // Hiển thị các nút điều khiển (play/pause, etc.)
          resizeMode="contain" // Tùy chọn thay đổi kích thước video
        />:<></>}
            <TouchableOpacity onPress={()=>setFile('')}
            style={{position:'absolute',top:-8,right:24}}>
            <Forbidden2 size="32" variant='Bold' color="red"/>
            </TouchableOpacity>
            </View>}

            <View style={styles.addpicture}>
              <Text style={{flex:1,fontFamily:fontFamilies.regular,color:'black',fontSize:16}}>Add your Post</Text>
              <TouchableOpacity onPress={handleSelectImage}>
                <Camera size="32"color="#FF8A65"/> 
                </TouchableOpacity> 
                <SpaceComponent width={10}/> 
              <TouchableOpacity onPress={handleSelectMedia}>
              <VideoAdd size="32"color="#FF8A65"/>   
                </TouchableOpacity>        
            </View>
            
            </View>
            
            </ScrollView>
            <View style={{margin:20}}>
              <ButtonComponent text='Post' onPress={handleSavePost} color=''/>
            </View>
        </View>
    )
}
export default CreatePostScreen

const styles=StyleSheet.create({
    richbar:{
        
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    
    },
    richEditor: {
        flex: 1,
        minHeight: 240,
        borderWidth: 1,
        borderColor: '#ccc',
        padding: 10,
        borderRadius:16,
      },
      selectedButton: {
        backgroundColor: '#ddd', // Màu nền khi nút được chọn
        borderRadius: 8, // Độ cong cho nút
      },
      addpicture:{
        flex: 1,
        flexDirection:'row',
        borderWidth: 1,
        borderColor: '#ccc',
        padding: 10,
        borderRadius:16,
        justifyContent:'center',
        alignItems:'center'
      }
})