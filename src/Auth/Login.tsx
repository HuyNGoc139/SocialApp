import { StyleSheet, Text, TextComponent, TextInput, TouchableOpacity, View } from "react-native"



import { SetStateAction, useEffect, useState } from "react"



import { Eye, EyeSlash, Lock, Sms } from "iconsax-react-native"
import { Image } from "react-native"
import SectionComponent from "../components/SectionComponent"
import { fontFamilies } from "../constants/fontFamily"
import InputComponent from "../components/InputComponent"
import ButtonComponent from "../components/ButtonComponent"
import SpaceComponent from "../components/SpaceComponent"
import RowComponent from "../components/RowComponent"
import { globalStyles } from "../styles/globalStyles"
import TitleComponent from "../components/TitleComponent"
import Container from "../components/Container"
import { validateEmail, validatePassword } from "./validate"
import firestore from '@react-native-firebase/firestore'
import auth from '@react-native-firebase/auth'


// import auth from '@react-native-firebase/auth';
const LoginScreen=({navigation}:any)=>{
    const[email,setEmail]=useState<string>('')
    const[password,setPassword]=useState<string>('')
    const[isLoading,setIsLoading]=useState<boolean>(false)
    const[errText,setErrorText]=useState('')
    const[showPass,setShowPass]=useState(false)
    const handleLogin = async () => {
        if (!email || !password) {
          setErrorText('Please enter your email and password!!!');
        }else if(!validateEmail(email)){
          setErrorText('Please enter the correct email format')
        }else if(!validatePassword(password)){
          setErrorText('Password must be to 6 characters');
        }
         else {
          setErrorText('');
          setIsLoading(true);
          await auth()
            .signInWithEmailAndPassword(email, password)
            .then(userCredential => {
              const user = userCredential.user;
    
              if (user) {
                console.log(user);
                setIsLoading(false);
                navigation.navigate('HomeTab')
              }
            })
            .catch((error: { message: SetStateAction<string> }) => {
              setErrorText(error.message);
              setIsLoading(false);
            });
        }
      };
    return(
    <Container>
      <Image source={require('../asset/image/login.png')} style={Style.imag} />
            <SectionComponent styles={{justifyContent:'center',marginTop:12}}>
                <InputComponent value={email} onChange={(val=>setEmail(val))} 
                prefix={<Sms
                    size="32"
                    color="#FAFAFA"
                   />}
                   placeholder="Email"
                   title="Email"
                />
                <InputComponent value={password} onChange={(val=>setPassword(val))} 
                prefix={<Lock
                    size="32"
                    color="#FAFAFA"
                   />}
                   placeholder="Password"
                   title="Password"
                   isPassword
                />
                <View style={{justifyContent:'center',alignItems:'center'}}>
                    {errText&&<Text style={{fontFamily:fontFamilies.regular,fontSize:14,color:'coral'}}>{errText}</Text>}
                </View>
                <ButtonComponent onPress={handleLogin} text="Login" isLoading={isLoading}></ButtonComponent>
                    <SpaceComponent height={20}></SpaceComponent>
                    <RowComponent styles={{marginTop: 20}}>
          <Text style={[globalStyles.text]}>
            You don't have an account?{' '}
            <Text
              style={{color: 'coral'}}
              onPress={() => navigation.navigate('RegisterScreen')}>
              Create an account
            </Text>
          </Text>
        </RowComponent>

            </SectionComponent>
    </Container>
  );
}
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
  tinp: {
    width: 350,
    height: 50,
    marginBottom: 20,
    alignSelf: 'center',
    borderRadius: 10,
    backgroundColor: 'white',
    elevation: 1,
    color:'black',
    marginTop:5
  },
});
export default LoginScreen