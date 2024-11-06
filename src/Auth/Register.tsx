import React, { useEffect, useState } from 'react';
import Container from '../components/Container';
import SectionComponent from '../components/SectionComponent';
import RowComponent from '../components/RowComponent';
import { globalStyles } from '../styles/globalStyles';
import ButtonComponent from '../components/ButtonComponent';
import SpaceComponent from '../components/SpaceComponent';
import InputComponent from '../components/InputComponent';
import { Lock, Sms, User } from 'iconsax-react-native';
import TitleComponent from '../components/TitleComponent';
import { Alert, Image, ImageBackground, Text } from 'react-native';
import TextComponent from '../components/TextComponent';
import { validateEmail, validatePassword } from './validate';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../redux/store';
import { registerUser } from '../redux/authAction';
const RegisterScreen = ({ navigation }: any) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorText, setErrorText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [username, setUsername] = useState('');
  const dispatch = useDispatch<AppDispatch>();
  useEffect(() => {
    if (email) {
      setErrorText('');
    }
  }, [email]);

  const handleCreateAccount = async () => {
    if (!username) {
      setErrorText('Please enter your username!!!');
    } else if (!email) {
      setErrorText('Please enter your email!!!');
    } else if (!validateEmail(email)) {
      setErrorText('Please enter the correct email format');
    } else if (!password || !confirmPassword) {
      setErrorText('Please enter your password!!!');
    } else if (!validatePassword(password)) {
      setErrorText('Password must be to 6 characters');
    } else if (password !== confirmPassword) {
      setErrorText('Password is not match!!!');
    } else {
      dispatch(registerUser({email,password,username}))
      // setIsLoading(true);
      // await auth()
      //   .createUserWithEmailAndPassword(email, password)
      //   .then(async userCredential => {
      //     const user = userCredential.user;

      //     if (user) {
      //       await user.updateProfile({
      //         displayName: username,
      //       });
      //       await firestore().collection('Users').doc(user.uid).set({
      //         username: username, // Thêm trường tên người dùng
      //         email: user.email,
      //         createAt: new Date(),
      //         uid: user.uid,
      //         userId: user.uid,
      //       });
      //       console.log('User registered successfully:', user);
      //       Alert.alert('Create Acount Sucess');
      //       setIsLoading(false);
      //     }
      //   })
      //   .catch((err: { message: React.SetStateAction<string> }) => {
      //     setIsLoading(false);
      //     setErrorText(err.message);
      //   });
    }
  };
  return (
    <ImageBackground
      resizeMode="cover"
      source={require('../assets/image/bg.png')}
      style={{ width: '100%', height: '100%' }}
    >
      <SectionComponent
        styles={{
          flex: 1,
          justifyContent: 'center',
        }}
      >
        <Image
          source={require('../assets/image/register.png')}
          style={globalStyles.imag}
        />
        <InputComponent
          prefix={<User size="32" color="#FAFAFA" />}
          title="Username"
          value={username}
          onChange={val => setUsername(val)}
          placeholder="Username"
          allowClear
        />
        <InputComponent
          prefix={<Sms size="32" color="#FAFAFA" />}
          title="Email"
          value={email}
          onChange={val => setEmail(val)}
          placeholder="Email"
          allowClear
          type="email-address"
        />
        <InputComponent
          title="Password"
          isPassword
          value={password}
          onChange={val => setPassword(val)}
          placeholder="Password"
          prefix={<Lock size="32" color="#FAFAFA" />}
        />
        <InputComponent
          title="Comfirm password"
          isPassword
          value={confirmPassword}
          onChange={val => setConfirmPassword(val)}
          placeholder="Comfirm password"
          prefix={<Lock size="32" color="#FAFAFA" />}
        />

        {errorText && <TextComponent text={errorText} color="coral" flex={0} />}
        <SpaceComponent height={20} />

        <ButtonComponent
          isLoading={isLoading}
          text="Register"
          onPress={handleCreateAccount}
        />

        <RowComponent styles={{ marginTop: 20 }}>
          <Text style={[globalStyles.text]}>
            You have an account?{' '}
            <Text
              style={{ color: 'coral' }}
              onPress={() => navigation.navigate('LoginScreen')}
            >
              Login
            </Text>
          </Text>
        </RowComponent>
      </SectionComponent>
    </ImageBackground>
  );
};

export default RegisterScreen;
