import { Image, Switch, Text, TouchableOpacity, View } from 'react-native';

import { useEffect, useState, useCallback, useMemo } from 'react';

import ImagePicker from 'react-native-image-crop-picker';

import { Designtools, Sms } from 'iconsax-react-native';
import firestore from '@react-native-firebase/firestore';
import DateTimePickerComponent from './DateTimePickerComponent';
import storage from '@react-native-firebase/storage';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../redux/store';
import { logoutUser, updateUser } from '../../redux/authAction';
import Container from '../Container';
import SectionComponent from '../SectionComponent';
import RowComponent from '../RowComponent';
import TitleComponent from '../TitleComponent';
import InputComponent from '../InputComponent';
import TextComponent from '../TextComponent';
import ButtonComponent from '../ButtonComponent';
import SpaceComponent from '../SpaceComponent';
import { User } from '../../models/user';
import { handleDateTime } from '../../funtion/handleDateTime';
import { useApp } from '../../hook/useAppHook';
import { VerifyOTPModal } from '../chat/VerifyOtpModal';
import { fontFamilies } from '../../constants/fontFamily';
import { handleSendOTP } from '../../funtion/OTP';

const initialValue = {
  email: '',
  username: '',
  DateBitrhDay: new Date(),
  url: '',
  uid: '',
};

const ModalAddSubtasks = ({ navigation, route }: any) => {
  const { userId } = route.params;
  const dispatch = useDispatch<AppDispatch>();
  const user2 = useSelector((state: RootState) => state.auth.user);
  // useEffect(() => {
  //   getUser();
  // }, [userId]);
  const [user, setUser] = useState<User | null>(user2);
  const [userName, setUserName] = useState<any>(user2?.username);
  const [isLoading, setISLoading] = useState(false);
  const [urlprofile, seturlprofile] = useState<any>(user2?.url);
  const [emailOTP, setEmailOTP] = useState<any>(user?.emailOTP);
  const [isEnabled, setIsEnabled] = useState(user2?.TwoFA ? true : false);
  const [isVisible, setIsVisible] = useState(false);
  const [isVisible2, setIsVisible2] = useState(false);
  const [emailOTPActive, setEmailOTPActive] = useState<boolean | null>(null);
  const [prevUser, setPrevUser] = useState<User | null>(user2);
  const [prevUrlProfile, setPrevUrlProfile] = useState<string | undefined>(
    user2?.url,
  );
  const [prevIsEnabled, setPrevIsEnabled] = useState<boolean>(
    user?.TwoFA ? true : false,
  );
  const { toastMessage } = useApp();

  useEffect(() => {
    // Lắng nghe thay đổi từ Firestore
    const unsubscribe = firestore()
      .collection('Users')
      .doc(userId)
      .onSnapshot(
        docSnapshot => {
          if (docSnapshot.exists) {
            const data = docSnapshot.data();
            setEmailOTPActive(data?.emailOTPActive ?? null); // Cập nhật trạng thái
          } else {
            console.error('User document not found');
            setEmailOTPActive(null); // Trả về null nếu không tìm thấy tài liệu
          }
        },
        error => {
          console.error('Error listening to emailOTPActive:', error);
          setEmailOTPActive(null); // Xử lý lỗi
        },
      );

    // Dừng lắng nghe khi component bị unmount
    return () => {
      unsubscribe();
    };
  }, []);

  // const getUser = useCallback(() => {
  //   firestore()
  //     .doc(`Users/${userId}`)
  //     .onSnapshot((snap: any) => {
  //       if (snap.exists) {
  //         setUser({
  //           userId,
  //           ...snap.data(),
  //         });
  //         setUserName(snap.data().username);
  //       } else {
  //         console.log('task not found');
  //       }
  //     });
  // }, [userId]);
  // const handleSaveDataToDatabase = useCallback(async () => {
  //   // const data = {
  //   //   ...user,
  //   //   updatedAt: Date.now(),
  //   //   uid: userId,
  //   //   TwoFA: isEnabled,
  //   //   url:urlprofile,
  //   // };
  //   setISLoading(true);
  //   try {
  //     // await firestore()
  //     //   .doc(`Users/${userId}`)
  //     //   .update(data)
  //     //   .then(() => {
  //     //     console.log('Updated Profile');
  //     //   });
  //     dispatch(updateUser({userId, user:user??initialValue, isEnabled,urlprofile}
  //     ))

  //     navigation.goBack();
  //     // dispatch(logoutUser())
  //     setISLoading(false);
  //   } catch (error) {
  //     setISLoading(false);
  //   }
  // }, [user, urlprofile, userId, isEnabled]);

  const handleSaveDataToDatabase = useCallback(async () => {
    // Kiểm tra sự thay đổi trước khi dispatch
    if (
      JSON.stringify(user) !== JSON.stringify(prevUser) ||
      urlprofile !== prevUrlProfile ||
      isEnabled !== prevIsEnabled ||
      user2?.emailOTP !== emailOTP
    ) {
      setISLoading(true);
      try {
        dispatch(
          updateUser({
            userId,
            user: user ?? initialValue,
            isEnabled,
            urlprofile,
            emailOTP,
          }),
        );
        setPrevUser(user);
        setPrevUrlProfile(urlprofile);
        setPrevIsEnabled(isEnabled);
        toastMessage({
          type: 'success',
          title: 'Thông báo',
          description: 'Cập nhật thông tin thành công',
        });
        navigation.goBack();
        // Cập nhật trạng thái trước sau khi save
      } catch (error) {
        console.log('Error saving data:', error);
      } finally {
        setISLoading(false);
      }
    } else {
      toastMessage({
        type: 'warning',
        title: 'Thông báo',
        description: 'Thông tin chưa có gì thay đổi.',
      });
      // navigation.goBack()
    }
  }, [
    user,
    urlprofile,
    isEnabled,
    prevUser,
    prevUrlProfile,
    prevIsEnabled,
    dispatch,
    userId,
    navigation,
  ]);
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
    ) : user?.url ? (
      <Image
        style={{ borderRadius: 5000, width: 300, height: 300 }}
        source={{ uri: user.url }}
      />
    ) : (
      <Image
        style={{ borderRadius: 5000, width: 300, height: 300 }}
        source={require('../../assets/image/avatar.png')}
      />
    );
  }, [urlprofile, user?.url]);

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
          <Text style={{ fontSize: 32, color: 'white', fontWeight: '800' }}>
            Update Information
          </Text>
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
            // onValueChange={toggleSwitch}
            value={emailOTPActive}
            disabled={true}
          />
        </View>

        <InputComponent
          prefix={<Sms size="32" color="#FAFAFA" />}
          title="Email 2FA"
          onChange={val => {
            setEmailOTP(val);
            handleChangeValue('emailOTP', val);
          }}
          placeholder="Email"
          value={emailOTP}
        />
        <TouchableOpacity
          onPress={() => {
            if (emailOTP !== user2?.emailOTP) {
              setIsVisible2(true);
              handleSendOTP(user2?.emailOTP || '');
            }
          }}
          style={{
            alignSelf: 'center',
            backgroundColor: emailOTP !== user2?.emailOTP ? 'green' : 'gray',
            paddingVertical: 10,
            paddingHorizontal: 24,
            borderRadius: 25,
          }}
          disabled={emailOTP !== user2?.emailOTP ? false : true}
        >
          <Text style={{ color: 'white', fontSize: 20 }}>Save</Text>
        </TouchableOpacity>

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
        <View style={{ flexDirection: 'row' }}>
          <Text
            style={{
              color: 'white',
              fontSize: 20,
              fontFamily: fontFamilies.medium,
            }}
          >
            Active Email:
          </Text>
          <TouchableOpacity
            onPress={() => {
              if (!emailOTPActive) {
                setIsVisible(true);
                handleSendOTP(user2?.emailOTP || '');
              } else {
                setIsVisible(true);
                handleSendOTP(user2?.emailOTP || '');
              }
            }}
            style={{
              flex: 1,
              justifyContent: 'center',
              alignItems: 'flex-end',
            }}
          >
            <Text
              style={{
                color: emailOTPActive ? 'red' : 'green',
                fontSize: 20,
                fontFamily: fontFamilies.medium,
              }}
            >
              {emailOTPActive ? 'Tắt' : 'Bật'}
            </Text>
          </TouchableOpacity>
        </View>
        <DateTimePickerComponent
          selected={
            user?.DateBitrhDay instanceof Date ? user.DateBitrhDay : new Date()
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
      <VerifyOTPModal
        isVisible={isVisible}
        onClose={() => setIsVisible(false)}
        email={user2?.email || ''}
        password={''}
        isActive={true}
        userId={userId}
        emailOTP={user2?.emailOTP || ''}
      />
      <VerifyOTPModal
        isVisible={isVisible2}
        onClose={() => setIsVisible2(false)}
        email={user2?.email || ''}
        password={''}
        isActive={true}
        userId={userId}
        emailOTP={user2?.emailOTP || ''}
        isVerifyEmail={true}
        newEmail={emailOTP}
        updateUser2={{
          userId,
          user: user ?? initialValue,
          isEnabled,
          urlprofile,
          emailOTP,
        }}
      />
    </Container>
    // </Modal>
  );
};

export default ModalAddSubtasks;
