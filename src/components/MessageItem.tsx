import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  Alert,
  TextInput,
  Button,
  TouchableOpacity,
} from 'react-native';
import { fontFamilies } from '../constants/fontFamily';
import { handleDateTime } from '../funtion/handleDateTime';
import { formatDate } from '../funtion/formatDate';
import {
  Menu,
  MenuOptions,
  MenuOption,
  MenuTrigger,
} from 'react-native-popup-menu';
import { More, Save2 } from 'iconsax-react-native';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import Video from 'react-native-video';
// Định nghĩa type cho props của MessageItem
interface MessageItemProps {
  mess: any; // Thay 'any' bằng type cụ thể cho tin nhắn nếu có
  currenUser: any; // Thay 'any' bằng type cụ thể cho người dùng hiện tại nếu có
}

const MessageItem: React.FC<MessageItemProps> = ({ mess, currenUser }) => {
  //my message
  const [isEditing, setIsEditing] = useState(false); // Trạng thái để kiểm tra đang sửa hay không
  const [editedText, setEditedText] = useState(mess.text); // Lưu trữ nội dung sửa đổi

  // Hàm cập nhật tin nhắn trên Firestore
  const handleSaveMessage = () => {
    const messageRef = firestore()
      .collection('Rooms')
      .doc(mess.roomId)
      .collection('messages')
      .doc(mess.id);

    messageRef
      .update({
        text: editedText,
        updatedAt: firestore.FieldValue.serverTimestamp(),
      })
      .then(() => {
        setIsEditing(false);
      })
      .catch(error => {
        console.error('Error updating message:', error);
      });
  };
  const renderTime = () => {
    if (mess) {
      let date = new Date(mess?.createdAt?.seconds * 1000);
      return formatDate(date);
    } else {
      return 'Time';
    }
  };
  const handleDeleteMessage = async () => {
    try {
      // Hiển thị hộp thoại xác nhận trước khi xóa
      Alert.alert(
        'Delete Comment',
        'Are you sure you want to delete this message?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'OK',
            onPress: async () => {
              const messageRef = firestore()
                .collection('Rooms')
                .doc(mess.roomId)
                .collection('messages')
                .doc(mess.id);

              messageRef
                .delete()
                .then(() => {
                  console.log('Message deleted successfully');
                })
                .catch(error => {
                  console.error('Error deleting message:', error);
                });
            },
          },
        ],
      );
    } catch (err) {
      console.error('Error deleting message:', err);
    }
  };

  const handleEditMessage = () => {
    setIsEditing(true);
  };
  if (currenUser.uid == mess.userId) {
    return (
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'flex-end',
          marginBottom: 12,
          marginRight: 12,
        }}
      >
        <View
          style={{ backgroundColor: '#a4dede', borderRadius: 25, padding: 20 }}
        >
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Menu>
              <MenuTrigger>
                {isEditing ? (
                  <>
                    <TextInput
                      style={{
                        fontFamily: fontFamilies.regular,
                        fontSize: 16,
                        color: 'black',
                        marginBottom: 10,
                      }}
                      value={editedText}
                      onChangeText={setEditedText}
                    />
                    {mess.url && (
                      <Image
                        style={{
                          height: 160,
                          width: 160,
                          borderRadius: 10,
                          marginTop: 10,
                        }}
                        source={{ uri: mess.url }}
                      />
                    )}
                    {mess.videourl && (
                      <Video
                        source={{ uri: mess.videourl }}
                        style={{
                          height: 160,
                          width: 160,
                          borderRadius: 10,
                          marginTop: 10,
                        }}
                        controls
                      />
                    )}
                  </>
                ) : mess.url ? (
                  <>
                    <Image
                      style={{ height: 160, width: 160, borderRadius: 10 }}
                      source={{ uri: mess.url }}
                    />
                    <Text
                      style={{
                        fontFamily: fontFamilies.regular,
                        fontSize: 16,
                        color: 'black',
                      }}
                    >
                      {mess.text}
                    </Text>
                  </>
                ) : mess.videourl ? (
                  <>
                    <Text
                      style={{
                        fontFamily: fontFamilies.regular,
                        fontSize: 16,
                        color: 'black',
                      }}
                    >
                      {mess.text}
                    </Text>
                    <Video
                      source={{ uri: mess.videourl }}
                      style={{ height: 160, width: 160, borderRadius: 10 }}
                      controls
                    />
                  </>
                ) : (
                  <Text
                    style={{
                      fontFamily: fontFamilies.regular,
                      fontSize: 16,
                      color: 'black',
                    }}
                  >
                    {mess.text}
                  </Text>
                )}
              </MenuTrigger>

              <MenuOptions
                customStyles={{
                  optionsContainer: {
                    borderRadius: 10,
                    borderCurve: 'continuous',
                    marginTop: 40,
                    marginRight: 30,
                  },
                }}
              >
                <MenuOption onSelect={handleEditMessage}>
                  <Text style={{ padding: 10 }}>Edit</Text>
                </MenuOption>
                <MenuOption onSelect={handleDeleteMessage}>
                  <Text style={{ padding: 10, color: 'red' }}>Delete</Text>
                </MenuOption>
              </MenuOptions>
            </Menu>
            {isEditing && (
              <TouchableOpacity
                style={{ paddingBottom: 12 }}
                onPress={handleSaveMessage}
              >
                <Save2 size="20" color="red" />
              </TouchableOpacity>
            )}
          </View>
          <Text style={{ fontFamily: fontFamilies.regular, fontSize: 12 }}>
            {handleDateTime.GetHour(mess.createdAt)}
          </Text>
        </View>
      </View>
    );
  } else {
    return (
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'flex-start',
          marginBottom: 12,
          marginLeft: 12,
        }}
      >
        <View
          style={{ backgroundColor: '#a4dede', borderRadius: 25, padding: 20 }}
        >
          {mess.url ? (
            <>
              <Image
                style={{ height: 160, width: 160, borderRadius: 10 }}
                source={{ uri: mess.url }}
              />
              {mess.text ? (
                <Text
                  style={{
                    fontFamily: fontFamilies.regular,
                    fontSize: 16,
                    color: 'black',
                    marginTop: 10,
                  }}
                >
                  {mess.text}
                </Text>
              ) : null}
            </>
          ) : mess.videourl ? (
            <>
              <Text
                style={{
                  fontFamily: fontFamilies.regular,
                  fontSize: 16,
                  color: 'black',
                }}
              >
                {mess.text}
              </Text>
              <Video
                source={{ uri: mess.videourl }}
                style={{
                  height: 160,
                  width: 160,
                  borderRadius: 10,
                  marginTop: 10,
                }}
                controls
              />
            </>
          ) : (
            <Text
              style={{
                fontFamily: fontFamilies.regular,
                fontSize: 16,
                color: 'black',
              }}
            >
              {mess.text}
            </Text>
          )}
          <Text style={{ fontFamily: fontFamilies.regular, fontSize: 12 }}>
            {handleDateTime.GetHour(mess.createdAt)}
          </Text>
        </View>
      </View>
    );
  }
};

export default MessageItem;
