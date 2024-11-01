import {
  ImageBackground,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useCallback, useMemo, useState } from 'react';
import { Eye, EyeSlash, Lock, Sms } from 'iconsax-react-native';
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

const LoginScreen = ({ navigation }: any) => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errText, setErrorText] = useState<string>('');
  const [showPass, setShowPass] = useState(false);
  const dispatch = useDispatch<AppDispatch>();
  // Memoize error message if it's based on computation (for optimization)
  const errorMessage = useMemo(() => errText, [errText]);

  // Memoize handleLogin function using useCallback to prevent re-creation on every render
  const handleLogin = useCallback(async () => {
    if (!email || !password) {
      setErrorText('Please enter your email and password!!!');
    } else if (!validateEmail(email)) {
      setErrorText('Please enter the correct email format');
    } else if (!validatePassword(password)) {
      setErrorText('Password must be at least 6 characters');
    } else {
      setErrorText('');
      dispatch(loginUser({ email, password }))
      // setIsLoading(true);
      // await auth()
      //   .signInWithEmailAndPassword(email, password)
      //   .then(userCredential => {
      //     const user = userCredential.user;

      //     if (user) {
      //       setIsLoading(false);
      //       // navigation.navigate('HomeTab');
      //     }
      //   })
      //   .catch((error: { message: string }) => {
      //     setErrorText(error.message);
      //     setIsLoading(false);
      //   });
    }
  }, [email, password, navigation]);

  return (
    <ImageBackground
      resizeMode="cover"
      source={require('../asset/image/bg.png')}
      style={{ width: '100%', height: '100%' }}
    >
      <Image source={require('../asset/image/login.png')} style={Style.imag} />
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
