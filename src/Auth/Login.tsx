import {
  ImageBackground,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useCallback, useMemo, useState } from 'react';
import { Lock, Sms } from 'iconsax-react-native';
import { Image } from 'react-native';
import SectionComponent from '../components/SectionComponent';
import { fontFamilies } from '../constants/fontFamily';
import InputComponent from '../components/InputComponent';
import ButtonComponent from '../components/ButtonComponent';
import SpaceComponent from '../components/SpaceComponent';
import RowComponent from '../components/RowComponent';
import { globalStyles } from '../styles/globalStyles';
import TitleComponent from '../components/TitleComponent';
import Container from '../components/Container';
import { validateEmail, validatePassword } from './validate';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../redux/store';
import { loginUser } from '../redux/authAction';
import { FloatingLabelInput } from '../components/FloatingLabelInput';
import { Colors } from '../styles';
import { VerifyOTPModal } from '../components/chat/VerifyOtpModal';

const LoginScreen = ({ navigation }: any) => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errText, setErrorText] = useState<string>('');
  const [isVisible, setIsVisible] = useState(false);
  const dispatch = useDispatch<AppDispatch>();
  const errorMessage = useMemo(() => errText, [errText]);
  const handleLogin = useCallback(async () => {
    if (!email || !password) {
      setErrorText('Please enter your email and password!!!');
    } else if (!validateEmail(email)) {
      setErrorText('Please enter the correct email format');
    } else if (!validatePassword(password)) {
      setErrorText('Password must be at least 6 characters');
    } else {
      setErrorText('');
      try {
        const unsubscribe = firestore()
          .collection('Users')
          .where('email', '==', email)
          .onSnapshot(snapshot => {
            if (!snapshot.empty) {
              const userData = snapshot.docs[0].data();
              if (userData?.TwoFA == true) {
                setIsVisible(true);
              } else {
                dispatch(loginUser({ email, password }));
              }
            } else {
              console.log('Không tìm thấy người dùng với email này.');
            }
          });
      } catch (error) {
        if (error instanceof Error) {
          setErrorText(error.message || 'Login failed. Please try again.');
        } else {
          setErrorText('An unknown error occurred. Please try again.');
        }
      }
    }
  }, [email, password, navigation]);

  return (
    <ImageBackground
      resizeMode="cover"
      source={require('../assets/image/bg.png')}
      style={{ width: '100%', height: '100%' }}
    >
      <Image source={require('../assets/image/login.png')} style={Style.imag} />
      <SectionComponent styles={{ justifyContent: 'center', marginTop: 12 }}>
        <InputComponent
          value={email}
          onChange={val => setEmail(val)}
          prefix={<Sms size="32" color="#FAFAFA" />}
          placeholder="Email"
          title="Email"
        />
        <InputComponent
          value={password}
          onChange={val => setPassword(val)}
          prefix={<Lock size="32" color="#FAFAFA" />}
          placeholder="Password"
          title="Password"
          isPassword
        />
        <View style={{ justifyContent: 'center', alignItems: 'center' }}>
          {errorMessage && (
            <Text
              style={{
                fontFamily: fontFamilies.regular,
                fontSize: 14,
                color: 'coral',
              }}
            >
              {errorMessage}
            </Text>
          )}
        </View>
        <ButtonComponent
          onPress={handleLogin}
          text="Login"
          isLoading={isLoading}
        />
        <SpaceComponent height={20} />
        <RowComponent styles={{ marginTop: 20 }}>
          <Text style={[globalStyles.text]}>
            You don't have an account?{' '}
            <Text
              style={{ color: 'coral' }}
              onPress={() => navigation.navigate('RegisterScreen')}
            >
              Create an account
            </Text>
          </Text>
        </RowComponent>
      </SectionComponent>
      <VerifyOTPModal
        isVisible={isVisible}
        onClose={() => setIsVisible(false)}
        email={email}
        password={password}
      />
    </ImageBackground>
  );
};

const Style = StyleSheet.create({
  main: {
    flex: 1,
    backgroundColor: '#fcf3de',
  },
  imag: {
    width: 400,
    height: 300,
    marginTop: 20,
  },
});

export default LoginScreen;
