import React, { useMemo, useState } from 'react';
import {
  Modal,
  View,
  Alert,
  TouchableOpacity,
  Text,
  StyleSheet,
} from 'react-native';
import auth from '@react-native-firebase/auth';
import RowComponent from './RowComponent';
import TextComponent from './TextComponent';
import ButtonComponent from './ButtonComponent';
import { TickCircle } from 'iconsax-react-native'; // Import biểu tượng Lock
import { fontFamilies } from '../constants/fontFamily';
import { useApp } from '../hook/useAppHook';
import * as yup from 'yup';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { FloatingLabelInput } from './FloatingLabelInput';
import { Colors } from '../styles';
import { AppText } from './AppText';
interface ChangePasswordModalProps {
  isVisible: boolean;
  onClose: () => void;
}

const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({
  isVisible,
  onClose,
}) => {
  const { toastMessage } = useApp();
  const reauthenticateAndChangePassword = () => {
    const user = auth().currentUser;
    if (!user) {
      Alert.alert('Không tìm thấy người dùng hiện tại');
      return;
    }
    const credential = auth.EmailAuthProvider.credential(
      user.email ?? '',
      watch('currentPassword'),
    );

    user
      .reauthenticateWithCredential(credential)
      .then(() => {
        // Đổi mật khẩu
        user
          .updatePassword(watch('newPassword'))
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
        currentPassword: yup.string().required('Vui lòng không để trống'),
        newPassword: yup
          .string()
          .required('Vui lòng không để trống các ô mật khẩu')
          .matches(
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@#$%*?&!.-_> </^~`])[A-Za-z\d@#$%*?&!.-_> </^~`]{6,15}$/,
            'Vui lòng nhập đúng định dạng',
          )
          .test('newPassword', 'Mật khẩu không chính xác', function (value) {
            return value !== this.parent.currentPassword;
          }),
        confirmPassword: yup
          .string()
          .required('validation.required')
          .oneOf([yup.ref('newPassword')], 'validation.confirm password'),
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
    watch('newPassword')?.length >= 6 && watch('newPassword')?.length <= 15;

  const checkTwo =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@#$%*?&!.-_> </^~`])/.test(
      watch('newPassword'),
    );

  const onSubmit = (data: any) => {
    if (checkOne && checkTwo) {
      reauthenticateAndChangePassword();
    }
  };
  const textColor = (check: boolean) =>
    watch('newPassword')
      ? check
        ? Colors.kellyGreen
        : Colors.mediumCarmine
      : Colors.nero;
  return (
    <Modal visible={isVisible} animationType="slide" onRequestClose={onClose}>
      <View style={{ margin: 20 }}>
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
        <FloatingLabelInput
          label={'Current password'}
          isRequired
          isSecure
          value={watch('currentPassword')}
          onChangeText={text => setValue('currentPassword', text)}
          errorMessages={errors?.currentPassword?.message}
        />

        <FloatingLabelInput
          label={'New password'}
          isRequired
          isSecure
          wrapperStyle={{ marginTop: 10 }}
          value={watch('newPassword')}
          onChangeText={text => setValue('newPassword', text)}
          errorMessages={errors?.newPassword?.message}
        />

        <FloatingLabelInput
          label={'Confirm password'}
          isRequired
          isSecure
          wrapperStyle={{ marginTop: 10 }}
          value={watch('confirmPassword')}
          onChangeText={text => setValue('confirmPassword', text)}
          errorMessages={errors?.confirmPassword?.message}
        />
      </View>
      <View style={styles.validationTextContainer}>
        <View style={styles.validationTextRow}>
          <TickCircle color={textColor(checkOne)} />

          <AppText
            style={[styles.validationText, { color: textColor(checkOne) }]}
          >
            {'Độ dài mật khẩu phải từ 6 đến 15 ký tự'}
          </AppText>
        </View>

        <View style={styles.validationTextRow}>
          <TickCircle color={textColor(checkTwo)} />

          <AppText
            style={[styles.validationText, { color: textColor(checkTwo) }]}
          >
            {
              'Mật khẩu phải bao gồm chữ viết hoa, chữ viết thường, số và ít nhất 1 kí tự đặc biệt.'
            }{' '}
            {'\n'}
            {'@#$%*?&!.-_> </^~`'}{' '}
          </AppText>
        </View>
      </View>
      <RowComponent styles={{ marginBottom: 20 }}>
        <View
          style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
        >
          <TouchableOpacity onPress={onClose}>
            <TextComponent
              size={16}
              flex={0}
              text="Đóng"
              color="black"
              styles={{ textTransform: 'uppercase' }}
            />
          </TouchableOpacity>
        </View>
        <View style={{ flex: 1 }}>
          <ButtonComponent
            text="Đổi mật khẩu"
            onPress={handleSubmit(onSubmit)}
          />
        </View>
      </RowComponent>
    </Modal>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },

  contentListStyle: {
    flex: 1,
  },

  inputWrapper: {
    marginTop: 20,
    padding: 16,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#00000026',
  },

  validationTextContainer: {
    flex: 1,
    marginTop: 20,
    marginHorizontal: 10,
  },

  validationTextRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 15,
  },

  validationText: {
    fontSize: 14,
    flex: 1,
    color: Colors.nero,
    marginLeft: 15,
    textAlign: 'justify',
    lineHeight: 20,
  },

  button: {
    alignSelf: 'center',
    width: '100%',
    borderRadius: 14,
    backgroundColor: Colors.primary,
    marginTop: 'auto',
    padding: 2,
    marginBottom: 10,
  },

  textBtn: {
    fontSize: 14,
    color: Colors.white,
  },
});
export default ChangePasswordModal;
