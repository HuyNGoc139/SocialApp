import React, { memo, useState } from 'react';
import {
  View,
  Text,
  Image,
  Alert,
  TextInput,
  Button,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { fontFamilies } from '../../constants/fontFamily';
import { handleDateTime } from '../../funtion/handleDateTime';
import { formatDate } from '../../funtion/formatDate';
import {
  Menu,
  MenuOptions,
  MenuOption,
  MenuTrigger,
} from 'react-native-popup-menu';
import axios from 'axios';
import firestore from '@react-native-firebase/firestore';
import Video from 'react-native-video';
import { useNavigation } from '@react-navigation/native';
// Định nghĩa type cho props của MessageItem
interface MessageItemProps {
  mess: any;
  currenUser: any;
  url?: string;
  roomId?: any;
}

const MessageItem: React.FC<MessageItemProps> = ({
  mess,
  currenUser,
  url,
  roomId,
}) => {
  const [showMenu, setShowMenu] = useState(null);
  const reactions = ['❤️', '😂', '😮', '😢', '👍', '👎'];
  const addReaction = async (messageId: any, reaction: any) => {
    //addreaction vao db

    const messageRef = firestore()
      .collection('Rooms')
      .doc(mess.roomId)
      .collection('messages')
      .doc(messageId);

    // Cập nhật phản ứng duy nhất
    await messageRef.update({
      reaction, // Lưu trực tiếp phản ứng vào trường reaction
    });
    setShowMenu(null); // Ẩn menu sau khi chọn
  };
  const removeReaction = async (messageId: any) => {
    const messageRef = firestore()
      .collection('Rooms')
      .doc(mess.roomId)
      .collection('messages')
      .doc(messageId);

    // Xóa phản ứng bằng cách đặt trường reaction thành null
    await messageRef.update({
      reaction: firestore.FieldValue.delete(),
    });
    setShowMenu(null); // Ẩn menu sau khi chọn
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
              try {
                console.log(mess);
                const messageRef = firestore()
                  .collection('Rooms')
                  .doc(mess.roomId)
                  .collection('messages')
                  .doc(mess.id);
                // Thực hiện xóa tin nhắn
                await messageRef.delete();
                console.log('Message deleted successfully');
              } catch (error) {
                console.error('Error deleting message:', error);
              }
            },
          },
        ],
      );
    } catch (err) {
      console.error('Error in handleDeleteMessage:', err);
    }
  };

  if (currenUser.uid == mess.userId) {
    return (
      <View>
        <TouchableOpacity
          onLongPress={() => setShowMenu(mess.id)}
          style={{
            // flexDirection: 'row',
            alignSelf: 'flex-end',
            justifyContent: 'flex-end',
            marginBottom: mess.reaction ? 0 : 12,
            marginRight: 12,
          }}
        >
          <View
            style={{
              backgroundColor: '#a4dede',
              borderRadius: 25,
              padding: 10,
              // flexDirection: 'row',
              alignItems: 'flex-end',
            }}
          >
            <Menu>
              <MenuTrigger>
                {mess.url ? (
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
                        textAlign: 'right',
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
                      marginRight: 10,
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
                <MenuOption onSelect={handleDeleteMessage}>
                  <Text style={{ padding: 10, color: 'red' }}>Delete</Text>
                </MenuOption>
              </MenuOptions>
            </Menu>
            <Text style={{ fontFamily: fontFamilies.regular, fontSize: 12 }}>
              {handleDateTime.GetHour(mess.createdAt)}
            </Text>
          </View>
        </TouchableOpacity>
        {mess.reaction && (
          <TouchableOpacity
            style={{
              alignSelf: 'flex-end',
              marginRight: 20,
            }}
            onPress={() => removeReaction(mess.id)}
          >
            <Text style={styles.reaction}>{mess.reaction}</Text>
          </TouchableOpacity>
        )}
        {showMenu === mess.id && (
          <View style={[styles.reactionMenu, { right: 0, bottom: 0 }]}>
            {reactions.map(reaction => (
              <TouchableOpacity
                key={reaction}
                onPress={() => addReaction(mess.id, reaction)}
              >
                <Text style={styles.reactionOption}>{reaction}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity onPress={() => setShowMenu(null)}>
              <Text style={styles.reactionOption}>X</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  } else {
    return (
      <View>
        <TouchableOpacity
          onLongPress={() => setShowMenu(mess.id)}
          style={{
            flexDirection: 'row',
            justifyContent: 'flex-start',
            marginRight: 12,
            marginLeft: 12,
            alignSelf: 'flex-start',
          }}
        >
          {url ? (
            <Image
              style={{
                height: 40,
                width: 40,
                borderRadius: 100,
                marginRight: 6,
              }}
              source={{ uri: url }}
            />
          ) : (
            <Image
              style={{
                height: 40,
                width: 40,
                borderRadius: 100,
                marginRight: 6,
              }}
              source={require('../../assets/image/avatar.png')}
            />
          )}
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'flex-start',
              marginBottom: mess.reaction ? 0 : 12,
              marginLeft: 0,
            }}
          >
            <View
              style={{
                backgroundColor: '#a4dede',
                borderRadius: 25,
                padding: 10,
                // flexDirection: 'row',
                // alignItems: 'center',
              }}
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
                    marginRight: 10,
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
        </TouchableOpacity>
        {mess.reaction && (
          <TouchableOpacity
            style={{
              alignSelf: 'flex-start',
              marginLeft: 68,
            }}
            onPress={() => removeReaction(mess.id)}
          >
            <Text style={styles.reaction}>{mess.reaction}</Text>
          </TouchableOpacity>
        )}
        {showMenu === mess.id && (
          <View style={[styles.reactionMenu, { left: 0, bottom: 0 }]}>
            {reactions.map(reaction => (
              <TouchableOpacity
                key={reaction}
                onPress={() => addReaction(mess.id, reaction)}
              >
                <Text style={styles.reactionOption}>{reaction}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity onPress={() => setShowMenu(null)}>
              <Text style={styles.reactionOption}>X</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  }
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f8f9fa',
  },
  messageText: {
    fontSize: 16,
    padding: 10,
    backgroundColor: '#e1f5fe',
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  reaction: {
    fontSize: 20,
  },
  reactionMenu: {
    position: 'absolute',
    // bottom: '100%',
    // left: 0,
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 5,
    elevation: 5,
  },
  reactionOption: {
    fontSize: 18,
    marginHorizontal: 5,
  },
});
export default memo(MessageItem);
