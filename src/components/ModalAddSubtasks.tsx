import {
  Alert,
  Dimensions,
  Image,
  Modal,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { globalStyles } from '../styles/globalStyles';
import RowComponent from './RowComponent';
import TextComponent from './TextComponent';
import ButtonComponent from './ButtonComponent';
import { useEffect, useState, useCallback, useMemo } from 'react';
import TitleComponent from './TitleComponent';
import InputComponent from './InputComponent';
import { colors } from '../constants/color';
import { fontFamilies } from '../constants/fontFamily';
import SectionComponent from './SectionComponent';
import Container from './Container';
import ImagePicker from 'react-native-image-crop-picker';
import SpaceComponent from './SpaceComponent';
import { Designtools, Sms } from 'iconsax-react-native';
import firestore from '@react-native-firebase/firestore';
import DateTimePickerComponent from './DateTimePickerComponent';
import storage from '@react-native-firebase/storage';
import auth from '@react-native-firebase/auth';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../redux/store';
import { logoutUser } from '../redux/authAction';
interface Props {
  // visible: boolean;
  // onClose: () => void;
  userId: string;
}

const initialValue = {
  email: '',
  username: '',
  DateBitrhDay: new Date(),
  url: '',
};

const ModalAddSubtasks = ({ navigation, route }: any) => {
  const { userId } = route.params;
  const dispatch = useDispatch<AppDispatch>();
  useEffect(() => {
    getUser();
  }, [userId]);

  const [user, setUser] = useState(initialValue);
  const [userName, setUserName] = useState('');
  const [isLoading, setISLoading] = useState(false);
  const [urlprofile, seturlprofile] = useState('');
  const [isEnabled, setIsEnabled] = useState(false);
  const toggleSwitch = () => setIsEnabled(!isEnabled);
  const getUser = useCallback(() => {
    firestore()
      .doc(`Users/${userId}`)
      .onSnapshot((snap: any) => {
        if (snap.exists) {
          setUser({
            userId,
            ...snap.data(),
          });
          setUserName(snap.data().username);
        } else {
          console.log('task not found');
        }
      });
  }, [userId]);
  const handleSaveDataToDatabase = useCallback(async () => {
    const data = {
      ...user,
      updatedAt: Date.now(),
      uid: userId,
      TwoFA: isEnabled,
    };
    setISLoading(true);
    try {
      await firestore()
        .doc(`Users/${userId}`)
        .update(data)
        .then(() => {
          console.log('Updated Profile');
        });
      // navigation.goBack();
      dispatch(logoutUser()); //khong can
      setISLoading(false);
    } catch (error) {
      setISLoading(false);
    }
  }, [user, urlprofile, userId, isEnabled]);

  const handleChangeValue = useCallback(
    (id: string, value: string | Date | string[]) => {
      const item: any = { ...user };
      item[`${id}`] = value;
      setUser(item);
    },
    [user],
  );

  const handleSelectImage = useCallback(async () => {
    ImagePicker.openPicker({
      width: 300,
      height: 400,
      cropping: true,
    })
      .then(async image => {
        const filename = image.path.substring(image.path.lastIndexOf('/') + 1);
        const reference = storage().ref(`Images/${filename}`);
        await reference.putFile(image.path);
        const url = await reference.getDownloadURL();
        seturlprofile(url);
      })
      .catch(error => {
        console.log('Error selecting image:', error);
      });
  }, []);

  const renderProfileImage = useMemo(() => {
    return urlprofile ? (
      <Image
        style={{ borderRadius: 5000, width: 300, height: 300 }}
        source={{ uri: urlprofile }}
      />
    ) : user.url ? (
      <Image
        style={{ borderRadius: 5000, width: 300, height: 300 }}
        source={{ uri: user.url }}
      />
    ) : (
      <Image
        style={{ borderRadius: 5000, width: 300, height: 300 }}
        source={require('../assets/image/avatar.png')}
      />
    );
  }, [urlprofile, user.url]);

  return (
    <Container>
      <SectionComponent
        styles={{
          flex: 1,
          justifyContent: 'center',
        }}
      >
        <RowComponent
          styles={{
            marginBottom: 8,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <TitleComponent text="Update information" size={32} />
        </RowComponent>

        <TouchableOpacity
          onPress={handleSelectImage}
          style={{
            justifyContent: 'center',
            alignItems: 'center',
            width: '100%',
            height: 320,
          }}
        >
          {renderProfileImage}
        </TouchableOpacity>
        <View style={{ flexDirection: 'row' }}>
          <TitleComponent text={'Two-factor Authentication'} />
          <Switch
            trackColor={{ false: '#767577', true: '#81b0ff' }}
            thumbColor={isEnabled ? '#f5dd4b' : '#f4f3f4'}
            ios_backgroundColor="#3e3e3e"
            onValueChange={toggleSwitch}
            value={isEnabled}
          />
        </View>
        <InputComponent
          prefix={<Sms size="32" color="#FAFAFA" />}
          title="Email"
          onChange={val => {}}
          placeholder="Email"
          value={user.email}
        />
        <InputComponent
          prefix={<Designtools size="32" color="#FAFAFA" />}
          title="UserName"
          onChange={val => {
            setUserName(val);
            handleChangeValue('username', val);
          }}
          placeholder="UserName"
          allowClear
          value={userName}
        />
        <DateTimePickerComponent
          selected={
            user.DateBitrhDay instanceof Date ? user.DateBitrhDay : new Date()
          }
          onSelect={val => handleChangeValue('DateBitrhDay', val)}
          placeholder="Choice"
          type="date"
          title="Date Of Bitrh"
        />
        <RowComponent>
          <View
            style={{
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <TextComponent flex={0} text="OnClose" color="white" />
            </TouchableOpacity>
          </View>
          <View style={{ flex: 1 }}>
            <ButtonComponent
              isLoading={isLoading}
              text="Save"
              onPress={handleSaveDataToDatabase}
            />
          </View>
        </RowComponent>
        <SpaceComponent height={20} />
      </SectionComponent>
    </Container>
    // </Modal>
  );
};

export default ModalAddSubtasks;
