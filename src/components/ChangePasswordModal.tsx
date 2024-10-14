import React, { useState } from 'react';
import {
  Modal,
  View,
  Alert,
  TouchableOpacity,
  ImageBackground,
  Text,
} from 'react-native';
import auth from '@react-native-firebase/auth';
import RowComponent from './RowComponent';
import TextComponent from './TextComponent';
import ButtonComponent from './ButtonComponent';
import Container from './Container';
import InputComponent from './InputComponent';
import { Designtools, Lock1, LockSlash } from 'iconsax-react-native'; // Import biểu tượng Lock
import { fontFamilies } from '../constants/fontFamily';

interface ChangePasswordModalProps {
  isVisible: boolean;
  onClose: () => void;
}

const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({
  isVisible,
  onClose,
}) => {
  const [oldPassword, setOldPassword] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');

  // Hàm đổi mật khẩu
  const reauthenticateAndChangePassword = () => {
    const user = auth().currentUser;

    if (!user) {
      Alert.alert('Không tìm thấy người dùng hiện tại');
      return;
    }

    // Kiểm tra các điều kiện mật khẩu
    if (!oldPassword || !newPassword || !confirmPassword) {
      Alert.alert('Vui lòng không để trống các ô mật khẩu');
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert('Mật khẩu mới phải dài hơn 6 ký tự');
      return;
    }

    if (newPassword === oldPassword) {
      Alert.alert('Mật khẩu mới không được trùng với mật khẩu cũ');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Mật khẩu mới và xác nhận không khớp');
      return;
    }

    const credential = auth.EmailAuthProvider.credential(
      user.email ?? '',
      oldPassword,
    );

    // Reauthenticate user
    user
      .reauthenticateWithCredential(credential)
      .then(() => {
        // Đổi mật khẩu
        user
          .updatePassword(newPassword)
          .then(() => {
            Alert.alert('Đổi mật khẩu thành công, Vui lòng đăng nhập lại!');
            auth().signOut(); // Đăng xuất sau khi đổi mật khẩu
          })
          .catch(error => Alert.alert('Lỗi đổi mật khẩu', error.message));
      })
      .catch(error => Alert.alert('Lỗi xác thực mật khẩu cũ', error.message));
  };

  return (
    <Modal visible={isVisible} animationType="slide" onRequestClose={onClose}>
      <ImageBackground
        resizeMode="cover"
        source={require('../asset/image/bg.png')}
        style={{ width: '100%', height: '100%' }}
      >
        <View style={{ margin: 20, flex: 1, justifyContent: 'center' }}>
          <View>
            <Text
              style={{
                fontFamily: fontFamilies.bold,
                fontSize: 24,
                textAlign: 'center',
                color: 'white',
              }}
            >
              Change PassWord
            </Text>
          </View>
          <InputComponent
            prefix={<LockSlash size="32" color="#FAFAFA" />}
            title="Current Password"
            onChange={val => setOldPassword(val)}
            isPassword
            placeholder="Current Password"
            value={oldPassword}
          />

          <InputComponent
            prefix={<Lock1 size="32" color="#FAFAFA" />}
            title="Password"
            onChange={val => setNewPassword(val)}
            placeholder="Password"
            isPassword
            value={newPassword}
          />

          <InputComponent
            prefix={<Lock1 size="32" color="#FAFAFA" />}
            title="Confirm PassWord"
            onChange={val => setConfirmPassword(val)}
            placeholder="Confirm PassWord"
            isPassword
            value={confirmPassword}
          />
        </View>
        <RowComponent styles={{ marginBottom: 20 }}>
          <View
            style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
          >
            <TouchableOpacity onPress={onClose}>
              <TextComponent flex={0} text="Đóng" color="white" />
            </TouchableOpacity>
          </View>
          <View style={{ flex: 1 }}>
            <ButtonComponent
              text="Đổi mật khẩu"
              onPress={reauthenticateAndChangePassword}
            />
          </View>
        </RowComponent>
      </ImageBackground>
    </Modal>
  );
};

export default ChangePasswordModal;
