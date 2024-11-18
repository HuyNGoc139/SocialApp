import { useState } from 'react';
import {
  Alert,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Modal from 'react-native-modal';
import ImagePicker from 'react-native-image-crop-picker';
import storage from '@react-native-firebase/storage';
import { FloatingLabelInput } from '../FloatingLabelInput';
import SpaceComponent from '../SpaceComponent';
import firestore from '@react-native-firebase/firestore';

interface Props {
  isVisible: boolean;
  onClose: () => void;
  group: any;
  onSave:() => void;
}
const ModalChangeName = ({ isVisible, onClose, group,onSave }: Props) => {
  const [groupName, setGroupName] = useState('');
  const [groupImage, setGroupImage] = useState(group.url);
  const handleSelectImage = async () => {
    ImagePicker.openPicker({
      width: 300,
      height: 400,
      cropping: true,
      mediaType: 'any',
    })
      .then(async image => {
        const filename = image.path.substring(image.path.lastIndexOf('/') + 1);
        const reference = storage().ref(`Images/${filename}`);
        await reference.putFile(image.path);
        const url = await reference.getDownloadURL();
        setGroupImage(url);
      })
      .catch(error => {
        console.log('Error selecting image:', error);
      });
  };
  const handleSavetoDatabase = async () => {
    if (!groupName.trim()) {
      Alert.alert('Lỗi', 'Tên nhóm không được bỏ trống');
      return;
    }
    await firestore().collection('Group').doc(group.id).update({
      url: groupImage,
      groupName: groupName,
    });
    onClose();
  };
  return (
    <Modal isVisible={isVisible} onBackdropPress={onClose}>
      <View style={styles.modalContainer}>
        <View style={{ flexDirection: 'row' }}>
          <Text style={styles.title}>Đổi tên nhóm</Text>
          <TouchableOpacity onPress={onClose}>
            <Image
              style={{ width: 24, height: 24 }}
              source={require('../../assets/image/cancel.png')}
            />
          </TouchableOpacity>
        </View>

        <FloatingLabelInput
          label={'Name group'}
          isRequired
          value={groupName}
          onChangeText={text => setGroupName(text)}
        />
        <SpaceComponent height={10} />
        <View style={{ alignSelf: 'center', position: 'relative' }}>
          {groupImage && (
            <Image source={{ uri: groupImage }} style={styles.imagePreview} />
          )}
          {groupImage && (
            <TouchableOpacity
              onPress={() => setGroupImage(null)}
              style={{
                position: 'absolute',
                top: 4,
                right: 0,
                backgroundColor: 'white',
                borderRadius: 200,
                padding: 4,
              }}
            >
              <Image
                tintColor={'red'}
                source={require('../../assets/delete.png')}
              />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity
          style={styles.imageButton}
          onPress={handleSelectImage}
        >
          <Image
            source={require('../../assets/image.png')}
            style={{ width: 28, height: 28 }}
          />
        </TouchableOpacity>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <TouchableOpacity
            onPress={onSave}
            style={[styles.button, { backgroundColor: 'rgba(87, 87, 89,0.5)' }]}
          >
            <Text style={styles.buttonText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleSavetoDatabase}
            style={[
              styles.button,
              { backgroundColor: 'rgba(48, 50, 171, 0.85)' },
            ]}
          >
            <Text style={styles.buttonText}>Save</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};
const styles = StyleSheet.create({
  modalContainer: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: 'black',
    flex: 1,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 10,
    borderRadius: 5,
    marginBottom: 15,
  },
  imagePreview: {
    width: 100,
    height: 100,
    borderRadius: 100,
    marginBottom: 15,
    alignSelf: 'center',
  },
  imageButton: {
    padding: 10,
    borderRadius: 5,
    marginBottom: 15,
    alignSelf: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  button: {
    width: '46%',
    borderRadius: 12,
    height: 48,
    justifyContent: 'center',
  },
});

export default ModalChangeName;
