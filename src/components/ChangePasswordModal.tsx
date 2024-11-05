import React, { useMemo, useState } from 'react';
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
import { useApp } from '../hook/useAppHook';
import * as yup from 'yup';
import { useForm } from 'react-hook-form';
import { isValidPassword } from '../funtion/ultils';
interface ChangePasswordModalProps {
  isVisible: boolean;
  onClose: () => void;
}

const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({
  isVisible,
  onClose,
}) => {
  const { toastMessage } = useApp();
  const [oldPassword, setOldPassword] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const reauthenticateAndChangePassword = () => {
    const user = auth().currentUser;
    if (!user) {
      Alert.alert('Không tìm thấy người dùng hiện tại');
      return;
    }
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

  const changePasswordSchema = useMemo(
    () =>
      yup.object().shape({
        currentPassword: yup.string().required(('Vui lòng không để trống')),
        newPassword: yup
          .string()
          .required('Vui lòng không để trống các ô mật khẩu')
          .matches(
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@#$%*?&!.-_> </^~`])[A-Za-z\d@#$%*?&!.-_> </^~`]{10,15}$/,
            'Vui lòng nhập đúng định dạng',
          )
          .test(
            'newPassword',
            ('Mật khẩu không chính xác'),
            function (value) {
              return value !== this.parent.currentPassword;
            },
          ),
        confirmPassword: yup
          .string()
          .required(('validation.required'))
          .oneOf([yup.ref('newPassword')], ('validation.confirm password')),
      }),
    [],
  );

  const {
    setValue,
    watch,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
    resolver: yupResolver(changePasswordSchema),
    mode: 'all',
  });
  const checkOne =
    watch('newPassword')?.length >= 10 && watch('newPassword')?.length <= 15;

  const checkTwo =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@#$%*?&!.-_> </^~`])/.test(
      watch('newPassword'),
    );
  return (
    <Modal visible={isVisible} animationType="slide" onRequestClose={onClose}>
        <View style={{ margin: 20, flex: 1,}}>
          <View>
            <Text
              style={{
                fontFamily: fontFamilies.bold,
                fontSize: 24,
                textAlign: 'center',
                color: 'black',
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
    </Modal>
  );
};

export default ChangePasswordModal;
function yupResolver(changePasswordSchema: yup.ObjectSchema<{ currentPassword: string; newPassword: string; confirmPassword: string; }, yup.AnyObject, { currentPassword: undefined; newPassword: undefined; confirmPassword: undefined; }, "">): import("react-hook-form").Resolver<{ currentPassword: string; newPassword: string; confirmPassword: string; }, any> | undefined {
  throw new Error('Function not implemented.');
}

