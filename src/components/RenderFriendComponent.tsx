import React, { useState } from 'react';
import {
  Image,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  FlatList,
} from 'react-native';
import { fontFamilies } from '../constants/fontFamily';
import ProfileModalComponent from './ProfileFriend';
import { useNavigation } from '@react-navigation/native';
import auth from '@react-native-firebase/auth';

interface Props {
  length: number;
  friend: any[];
}

const RenderFriend = (props: Props) => {
  const { friend, length } = props;
  const [modalVisible, setModalVisible] = useState(false);
  const navigation = useNavigation<any>();
  const userCurrent = auth().currentUser;
  const handleProfileFr = (item: any) => {
    if (item.userId == userCurrent?.uid) {
      navigation.navigate('Profile');
    } else {
      navigation.navigate('ProfileModalComponent', {
        userId: item.userId,
      });
    }
    setModalVisible(false);
  };

  return (
    <>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Text style={styles.text}>{length} friends</Text>
        <TouchableOpacity
          onPress={() => setModalVisible(true)}
          style={{ flexDirection: 'row' }}
        >
          {friend
            .slice(0, 2)
            .map((item: any, index: number) =>
              item.url ? (
                <Image
                  key={index}
                  source={{ uri: item.url }}
                  style={styles.image}
                />
              ) : (
                <Image
                  key={index}
                  source={require('../assets/image/avatar.png')}
                  style={styles.image}
                />
              ),
            )}
          {friend.length > 2 && (
            <View
              style={[
                styles.image,
                { backgroundColor: 'white', alignItems: 'center' },
              ]}
            >
              <Text style={styles.moreText}>+{length - 2}</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Modal for showing all friends */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalBackground}>
            <View style={styles.modalView}>
              <Text style={styles.modalText}>All Friends</Text>
              <FlatList
                data={friend}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    onPress={() => handleProfileFr(item)}
                    style={styles.friendContainer}
                  >
                    {item.url ? (
                      <Image
                        source={{ uri: item.url }}
                        style={styles.modalImage}
                      />
                    ) : (
                      <Image
                        source={require('../assets/image/avatar.png')}
                        style={styles.modalImage}
                      />
                    )}
                    <Text style={styles.friendName}>
                      {item.username || 'Friend'}
                    </Text>
                  </TouchableOpacity>
                )}
                keyExtractor={(item, index) => index.toString()}
                showsVerticalScrollIndicator={false}
              />
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={styles.closeButton}
              >
                <Text style={styles.closeButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    </>
  );
};

export default RenderFriend;

const styles = StyleSheet.create({
  text: {
    fontFamily: fontFamilies.regular,
    fontSize: 18,
    color: 'black',
    marginRight: 40,
  },
  image: {
    width: 40,
    height: 40,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: 'gray',
    marginLeft: -12,
  },
  moreText: {
    fontSize: 18,
    color: 'black',
    lineHeight: 40,
  },
  modalBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)', // Adjust transparency for a better background effect
  },
  modalView: {
    width: '90%', // Make modal width responsive
    maxHeight: '80%', // Limit modal height
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  modalText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  friendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
  },
  modalImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: 'gray',
    marginRight: 10,
  },
  friendName: {
    fontSize: 18,
    color: 'black',
  },
  closeButton: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#FF6347', // Tomato color
    borderRadius: 5,
    alignSelf: 'center',
  },
  closeButtonText: {
    color: 'white',
    fontSize: 18,
  },
});
