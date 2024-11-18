import { ArrowSquareLeft } from "iconsax-react-native"
import { Image, Text, TouchableOpacity, View } from "react-native"
import ModalChangeName from "../../components/chat/ModalChangeName";
import { useState } from "react";

const GroupDetails = ({ navigation, route }: any) =>{
    const group=route.params;
    const [visible, setVisible] = useState(false);
return (
    <View style={{flex:1,backgroundColor:'white',}}>
        
        <View
        style={{
          backgroundColor: 'white',
          justifyContent: 'flex-start',
          height: 68,
          padding: 12,
          marginBottom: 12,
        }}
      >
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ArrowSquareLeft size={28} color="black" />
        </TouchableOpacity>
      </View>

      <View style={{alignSelf:'center',alignItems:'center',justifyContent:'center'}}>
        {group.url?<Image source={{uri:group.url}} 
        style={{width:100,height:100,borderRadius:1000,marginBottom:10}}/>:
        <Image source={require('../../assets/image/avatargroup.png')} 
        style={{width:100,height:100,borderRadius:1000,marginBottom:10}}/>}

        <Text style={{textAlign:'center',fontSize:20,color:'black'}}>{group.groupName}</Text>
        <TouchableOpacity onPress={() => setVisible(true)}>
            <Text style={{color:'blue'}}>Thay đổi tên hoặc ảnh nhóm</Text>
        </TouchableOpacity>
      </View>
      <ModalChangeName
        isVisible={visible}
        onClose={() => {setVisible(false)
            navigation.navigate('Chat')
        }}
        onSave={()=>setVisible(false)}
        group={group}
      />
    </View>
)
}
export default GroupDetails