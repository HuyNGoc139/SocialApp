import React from 'react';
import { View, Text } from 'react-native';
import { fontFamilies } from '../constants/fontFamily';
import { handleDateTime } from '../funtion/handleDateTime';
import { formatDate } from '../funtion/formatDate';

// Định nghĩa type cho props của MessageItem
interface MessageItemProps {
    mess: any; // Thay 'any' bằng type cụ thể cho tin nhắn nếu có
    currenUser: any; // Thay 'any' bằng type cụ thể cho người dùng hiện tại nếu có
}

const MessageItem: React.FC<MessageItemProps> = ({ mess, currenUser }) => {
    //my message
    const renderTime = () => {
        if (mess) {
          let date=new Date(mess?.createdAt?.seconds * 1000);
          return formatDate(date)
        } else {
          return 'Time';
        }
      };

    if(currenUser.uid==mess.userId){
        return(
            <View style={{flexDirection:'row',justifyContent:'flex-end',marginBottom:12,marginRight:12}}>
                <View style={{backgroundColor:'#a4dede', borderRadius:100,padding:10}}>
                <Text style={{fontFamily:fontFamilies.regular,fontSize:16,color:'black'}}>{mess.text}</Text>
                <Text style={{fontFamily:fontFamilies.regular,fontSize:12}}>{renderTime()}</Text>
                </View>
            </View>
        )
    }else {
        return(
            <View style={{flexDirection:'row',justifyContent:'flex-start',marginBottom:12,marginLeft:12}}>
                <View style={{backgroundColor:'#a4dede', borderRadius:100,padding:10}}>
                <Text style={{fontFamily:fontFamilies.regular,fontSize:16,color:'black'}}>{mess.text}</Text>
                <Text style={{fontFamily:fontFamilies.regular,fontSize:12}}>{}</Text>
                </View>
            </View>
        )
    }
}

export default MessageItem;