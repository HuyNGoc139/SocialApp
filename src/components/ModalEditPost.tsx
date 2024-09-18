import { Image, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native"
import RowComponent from "./RowComponent"
import ButtonComponent from "./ButtonComponent"
import SpaceComponent from "./SpaceComponent"
import Container from "./Container"
import SectionComponent from "./SectionComponent"
import TitleComponent from "./TitleComponent"
import { useEffect, useRef, useState } from "react"
import TextComponent from "./TextComponent"
import { fontFamilies } from "../constants/fontFamily"
import { Camera, Forbidden2, VideoAdd } from "iconsax-react-native"
import Video from "react-native-video"
import { RichEditor, RichToolbar, actions } from "react-native-pell-rich-editor"
import { globalStyles } from "../styles/globalStyles"
import firestore from '@react-native-firebase/firestore'
import auth from '@react-native-firebase/auth'
import ImagePicker from 'react-native-image-crop-picker';
import storage from '@react-native-firebase/storage'
interface Props{
    visible:boolean,
    onClose:() => void,
    post:any,
}
const ModalEditPost=(props:Props)=>{
  const [isLoading, setIsLoading] = useState(false);
    const{visible,onClose,post}=props
    const richText = useRef<RichEditor>(null);
  const[text,setText]=useState('')
  const[file,setFile]=useState('')
  // const [videoUrl, setVideoUrl] = useState('');
  const[type,setType]=useState('')
  useEffect(()=>{
    if(post&&post.id){
      setType(post.type)
      setFile(post.url)
      richText?.current?.setContentHTML(post.body)
      setText(post.body)
    }
  },[])
  const handleSelectImage = async () => {
    setType('image');
    setIsLoading(true); // Bắt đầu tải ảnh
    try {
      const image = await ImagePicker.openPicker({
        width: 300,
        height: 400,
        cropping: true,
        mediaType: 'any',
      });
  
      console.log('Selected image:', image);
  
      const filename = image.path.substring(image.path.lastIndexOf('/') + 1);
      const reference = storage().ref(`Images/${filename}`);
      await reference.putFile(image.path);
      const url = await reference.getDownloadURL();
      setFile(url);
    } catch (error) {
      console.log('Error selecting image:', error);
    } finally {
      setIsLoading(false); // Kết thúc tải ảnh
    }
  };
  const handleSelectMedia = async () => {
    setType('video');
    setIsLoading(true); // Bắt đầu tải media
    try {
      const media = await ImagePicker.openPicker({
        mediaType: 'video',
      });
  
      console.log(media);
      const filename = media.path.substring(media.path.lastIndexOf('/') + 1);
      const reference = storage().ref(`Media/${filename}`);
      await reference.putFile(media.path);
      const url = await reference.getDownloadURL();
      setFile(url);
    } catch (error) {
      console.log('Error selecting media:', error);
    } finally {
      setIsLoading(false); // Kết thúc tải media
    }
  };
  const handleUpdatePost = async () => {
    if (post) {
      setIsLoading(true); // Bắt đầu cập nhật bài đăng
  
      const data = {
        ...post,
        url: file,
        updateAt: new Date(), // Thêm thời gian cập nhật
        body: text,
        type: type,
      };
  
      try {
        await firestore().collection('Posts').doc(post.id).update(data);
        console.log('Post updated successfully');
        onClose()
      } catch (error) {
        console.error('Error updating post:', error);
      } finally {
        setIsLoading(false); // Kết thúc cập nhật bài đăng
      }
    } else {
      console.error('User is not authenticated');
    }
  };
    return(
        <Modal visible={visible} style={{}} transparent animationType="slide">
                <ScrollView style={{flex:1,
                backgroundColor:'#c5d6d6'}}>
      <View>
        <View style={[globalStyles.header,{padding:12}]}>
            <View style={{justifyContent:'center',alignItems:'center',flex:1}}>
            <Text style={[globalStyles.textHeader,{flex:1,lineHeight:58}]}>Update Post</Text>
            </View>
            </View>
        <ScrollView style={{flex:1,margin:20}}>
            <View style={{flexDirection:'row'}}>
                <View style={{flexDirection:'row'}}>
                {post.user?.url?<Image style={{ height: 56, width: 56, borderRadius: 12, marginRight: 12 }} source={{uri:post.user.url}} /> 
            : <Image style={{ height: 48, width: 48, borderRadius: 12, marginRight: 12 }} source={require('../asset/image/avatar.png')} />}
                </View>
                <View>
                    <Text style={{fontSize:20,fontFamily:fontFamilies.regular,color:'black'}}>{post.user.username}</Text>
                    <Text style={{fontSize:17,fontFamily:fontFamilies.regular}}>Public</Text>
                </View>
            </View>
            <View style={{flex:1,marginTop:20,height:320}}>
            <RichToolbar style={styles.richbar}
            editorStyle={{ color: 'black' }}
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
          initialContentHTML={text}
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
        <RowComponent>
                <View style={{flex:1,justifyContent:'center',alignItems:'center'}}>
                <TouchableOpacity onPress={onClose}>
                    <TextComponent flex={0} text="OnClose" color="black"/>
                </TouchableOpacity>
                </View>
                <View style={{flex:1}}>
                <ButtonComponent isLoading={isLoading} text="Save" onPress={handleUpdatePost}/>
                </View>
            </RowComponent>
        <SpaceComponent height={20} />

        </View>
    </ScrollView>  
        </Modal>
    )
}
export default ModalEditPost
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
        borderBottomLeftRadius:16,
        backgroundColor: '#fff',
        borderBottomRightRadius:16,
      },
      selectedButton: {
        backgroundColor: '#ddd', // Màu nền khi nút được chọn
        borderRadius: 8, // Độ cong cho nút
      },
      addpicture:{
        flex: 1,
        flexDirection:'row',
        borderWidth: 1,
        borderColor: 'black',
        padding: 10,
        borderRadius:16,
        justifyContent:'center',
        alignItems:'center'
      }
})