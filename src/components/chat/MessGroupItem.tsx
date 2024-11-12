import React, { memo, useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  Alert,
  TextInput,
  TouchableOpacity,
} from 'react-native';

import {
  Menu,
  MenuOptions,
  MenuOption,
  MenuTrigger,
} from 'react-native-popup-menu';
import { Save2 } from 'iconsax-react-native';
import firestore from '@react-native-firebase/firestore';
import Video from 'react-native-video';
import { fontFamilies } from '../../constants/fontFamily';
import { handleDateTime } from '../../funtion/handleDateTime';

interface MessageItemProps {
  mess: any;
  currenUser: any;
}

const MessageGroupItem: React.FC<MessageItemProps> = ({ mess, currenUser }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState(mess.text);
  const [userSender, setUserSender] = useState<any>();
  useEffect(() => {
    getSenderUser();
  }, [mess.userId]);
  const getSenderUser = useCallback(async () => {
    if (mess.userId != currenUser.uid) {
      const userDoc = await firestore().doc(`Users/${mess.userId}`).get();
      if (userDoc.exists) {
        setUserSender(userDoc.data());
      }
    }
  }, [mess.userId]);
  const handleSaveMessage = () => {
    const messageRef = firestore()
      .collection('Group')
      .doc(mess.groupId)
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

  const handleDeleteMessage = async () => {
    try {
      Alert.alert(
        'Delete Comment',
        'Are you sure you want to delete this message?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'OK',
            onPress: async () => {
              try {
                const messageRef = firestore()
                  .collection('Group')
                  .doc(mess.groupId)
                  .collection('messages')
                  .doc(mess.id);
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
          style={{
            backgroundColor: '#a4dede',
            borderRadius: 25,
            padding: 10,
            // flexDirection: 'row',
            alignItems: 'flex-end',
          }}
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
      <View>
        <Text
          style={{
            marginLeft: 60,
            marginBottom: 4,
            fontSize: 14,
            color: 'black',
            fontWeight: '500',
          }}
        >
          {userSender?.username}
        </Text>

        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'flex-start',
            // marginRight: 12,
            marginLeft: 12,
          }}
        >
          {userSender?.url ? (
            <Image
              style={{
                height: 40,
                width: 40,
                borderRadius: 100,
                marginRight: 6,
              }}
              source={{ uri: userSender.url }}
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
              marginBottom: 6,
              marginLeft: 0,
            }}
          >
            <View
              style={{
                backgroundColor: '#a4dede',
                borderRadius: 25,
                padding: 10,
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
        </View>
      </View>
    );
  }
};

export default memo(MessageGroupItem);
