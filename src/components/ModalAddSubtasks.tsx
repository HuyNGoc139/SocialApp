import { Dimensions, Image, Modal, Text, TextInput, TouchableOpacity, View } from "react-native"
import { globalStyles } from "../styles/globalStyles"
import RowComponent from "./RowComponent"
import TextComponent from "./TextComponent"
import ButtonComponent from "./ButtonComponent"
import { useEffect, useState } from "react"
import TitleComponent from "./TitleComponent"
import InputComponent from "./InputComponent"
import { colors } from "../constants/color"
import { fontFamilies } from "../constants/fontFamily"
import SectionComponent from "./SectionComponent"
import Container from "./Container"
import ImagePicker from 'react-native-image-crop-picker';
import SpaceComponent from "./SpaceComponent"
import { Designtools, Lock, Sms, Subtitle } from "iconsax-react-native"
import firestore from '@react-native-firebase/firestore';
import DateTimePickerComponent from "./DateTimePickerComponent"
import storage from '@react-native-firebase/storage'
interface Props{
    visible:boolean,
    onClose:() => void,
    userId:string
}
const initialValue={
    email:'',
    username:'',
    DateBitrhDay:new Date(),
    url:''
}
const ModalAddSubtasks=(props:Props)=>{
    
    const{visible,onClose,userId}=props
    useEffect(()=>{
        getUser()
    },[userId])
    const [user,setUser]=useState(initialValue)
    const [userName,setUserName]=useState('')
    const[isLoading,setISLoading]=useState(false)
    const[urlprofile,seturlprofile]=useState('')
    const getUser=()=>{
        firestore().doc(`Users/${userId}`).onSnapshot((snap:any)=>{
            if(snap.exists){

                setUser({
                    userId,
                    ...snap.data()
                })
                setUserName(user.username)
            }
            else{console.log('task not found')}
        })
    }
    

    const handldeCloseModal=()=>{
        onClose()
    }

    const handleSaveDataToDatabase= async ()=>{
        
        const data={
            ...user,
            updatedAt:Date.now(),
            url:urlprofile,
        }
        setISLoading(true) 
        try {
            
        await firestore().doc(`Users/${userId}`).update(data).then(()=>{
            console.log('Updated Profile')
              })
        handldeCloseModal()
        setISLoading(false)
        } catch (error) {
            console.log(error)
            setISLoading(false)
        }
        
    }
    const handleChangeValue = (id: string, value: string | Date| string[]) => {
        const item: any = {...user};
    
        item[`${id}`] = value;
    
        setUser(item);
      };
      const handleSelectImage =async () => {
        ImagePicker.openPicker({
          width: 300,
          height: 400,
          cropping: true
        }).then(async image => {
          console.log(image);
          // Gửi ảnh tới Firestore hoặc server
            const filename = image.path.substring(image.path.lastIndexOf('/') + 1); // Lấy tên file từ đường dẫn
            const reference = storage().ref(`Images/${filename}`); // Tạo reference đến Firebase Storage
            await reference.putFile(image.path)
            const url=await reference.getDownloadURL()
            console.log('url',url)
            seturlprofile(url)
        }).catch(error => {
          console.log('Error selecting image:', error);
        });
      };
    return(
            <Modal visible={visible} style={{}} transparent animationType="slide">
                <Container>
      <SectionComponent
        styles={{
          flex: 1,
          justifyContent: 'center',
        }}>
        <RowComponent styles={{marginBottom: 16}}>
          <TitleComponent text="Update information" size={32} />
        </RowComponent>

        <TouchableOpacity onPress={handleSelectImage} style={{justifyContent:'center',alignItems:'center',width:'100%',height:320}}>
           {user.url? <Image style={{borderRadius:5000,width:300,height:300}} source={{uri:user.url}}/>:<Image style={{borderRadius:5000,width:300,height:300}} source={require('../asset/image/avatar.png')}/>}
          </TouchableOpacity>

        <InputComponent
        prefix={<Sms
        size="32"
         color="#FAFAFA" />}
        title="Email"

         onChange={val => {} }
        placeholder="Email"
        allowClear
         value={user.email}       />
        <InputComponent
        prefix={<Designtools
        size="32"
         color="#FAFAFA" />}
        title="UserName"
         onChange={val => {{setUserName(val)} 
         handleChangeValue('username',val)}}
        placeholder="UserName"
        allowClear
         value={userName}      />
         <DateTimePickerComponent selected={user.DateBitrhDay instanceof Date ? user.DateBitrhDay : new Date()}
        onSelect={val=>handleChangeValue('DateBitrhDay',val)}
        placeholder="Choice"
        type="date"
        title="Date Of Bitrh"
        />
        <RowComponent>
                <View style={{flex:1,justifyContent:'center',alignItems:'center'}}>
                <TouchableOpacity onPress={handldeCloseModal}>
                    <TextComponent flex={0} text="OnClose" color="white"/>
                </TouchableOpacity>
                </View>
                <View style={{flex:1}}>
                <ButtonComponent isLoading={isLoading} text="Save" onPress={handleSaveDataToDatabase}/>
                </View>
            </RowComponent>
        <SpaceComponent height={20} />

      </SectionComponent>
    </Container>  
        </Modal>

    )

}
export default ModalAddSubtasks