

import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Button,
  TouchableOpacity,
  Alert,
  Modal,
  Dimensions,
} from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import ReactNativeBiometrics from 'react-native-biometrics';
import firestore from '@react-native-firebase/firestore';

import BottomSheet, {
  BottomSheetView,
  BottomSheetTextInput,
} from '@gorhom/bottom-sheet';
import PINCode from '@haskkor/react-native-pincode';
import { OtpInput } from 'react-native-otp-entry';
import { AppText } from '../components/AppText';
import { Colors } from 'react-native-ui-lib';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';

const Bimotrics = forwardRef(( {setPin,input,groupID,getPin,containerStyle},ref) => {
  // ref
  const bottomSheetRef = useRef<BottomSheet>(null);
  const rnBiometrics = new ReactNativeBiometrics();
  const user = useSelector((state: RootState) => state.auth.user);
  const [modalVisible, setModalVisible] = useState(false);
    const [action,setAction] = useState()
  const snapPoints = useMemo(() => ['100%'], []);

useEffect(()=>{
    if(action){
        input()
    }
},[action])



  const getSecurity =  async() =>{
    const get = firestore()
    .collection('Group').doc(groupID)
    const userDoc = await get.get();
    if (userDoc.exists) {
      const data = userDoc.data();
      const access = data?.security?.[user?.uid]?.access;
      const pin = data?.security?.[user?.uid]?.pin;

    if(pin === getPin){
      setAction(true)
      }
   
    }  
}
  const handleSheetChanges = useCallback((index: number) => {
    console.log('handleSheetChanges', index);
  }, []);

    useImperativeHandle(ref, () => ({
        childFunction() {
            bottomSheetRef.current?.snapToIndex(0);    
        },
      }));
  
  const handleBiometricAuth = () => {
    console.log(rnBiometrics.allowDeviceCredentials);
    rnBiometrics
      .simplePrompt({
        promptMessage: 'Xác thực sinh trắc học',
      })
      .then(result => {
        if (result.success) {
          if (rnBiometrics.allowDeviceCredentials === false) {
            bottomSheetRef.current?.close();
            console.log('ok');
            setAction(true)
            input()
          } else {
            console.log('no');
            Alert.alert('TouchID đã được mở khoá');
            rnBiometrics.allowDeviceCredentials = false;
          }
        } else {
        }
      })
      .catch(error => {
        Alert.alert('TouchId tạm khoá do nhập sai quá nhiều lần');
        rnBiometrics.allowDeviceCredentials = true;
      });
  };
  return (
    <GestureHandlerRootView style={containerStyle}>
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          Alert.alert('Modal has been closed.');
          setModalVisible(!modalVisible);
        }}
      >
        <View
          style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}
        >
          <View
            style={{
              margin: 20,
              backgroundColor: 'white',
              borderRadius: 20,
              padding: 35,
              alignItems: 'center',
              shadowColor: '#000',
              shadowOffset: {
                width: 0,
                height: 2,
              },
              shadowOpacity: 0.25,
              shadowRadius: 4,
              elevation: 5,
            }}
          >
            <AppText fontFamily="bold" style={styles.verifyText}>
              Xác thực hay yếu tố
            </AppText>

            <View style={{ width: '80%', margin: 30 }}>
              <OtpInput
                numberOfDigits={4}
                onTextChange={text => {setPin(text)}}
                textInputProps={{}}
                theme={{
                  containerStyle: {
                    alignSelf: 'center',
                  },
                  pinCodeTextStyle: styles.pinCodeTextStyle,
                  pinCodeContainerStyle: styles.pinCodeContainerStyle,
                }}
              />
            </View>

            <TouchableOpacity
              style={{
                backgroundColor: '#52a2e3',
                borderRadius: 10,
                justifyContent: 'center',
                alignItems: 'center',
              }}
              onPress={() =>{ getSecurity(),setModalVisible(false)}}
            >
              <Text style={{ margin: 15 }}>Xác nhận</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      
      <BottomSheet
        ref={bottomSheetRef}
        enablePanDownToClose
        index={-1}
        snapPoints={snapPoints}
        keyboardBehavior="fillParent"
        enableDynamicSizing={false}
        onChange={handleSheetChanges}
      >
        <BottomSheetView style={styles.contentContainer}>
          <TouchableOpacity
            style={{
              margin: 25,
              backgroundColor: '#52a2e3',
              width: '90%',
              height: '30%',
              borderRadius: 10,
              justifyContent: 'center',
              alignItems: 'center',
            }}
            onPress={() => {
              setModalVisible(true), bottomSheetRef.current?.close();
            }}
          >
            <Text>Sử dụng mã PIN</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={{
              backgroundColor: '#52a2e3',
              width: '90%',
              height: '30%',
              borderRadius: 10,
              justifyContent: 'center',
              alignItems: 'center',
            }}
            onPress={handleBiometricAuth}
          >
            <Text>Sử dụng mã sinh TouchID</Text>
          </TouchableOpacity>
        </BottomSheetView>
      </BottomSheet>
    </GestureHandlerRootView>
  );
});
const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.white,
    minHeight: height * 0.6,
    borderRadius: 15,
    alignItems: 'center',
    padding: 20,
    alignSelf: 'center',
  },
  contentContainer: {
    flex: 1,
    alignItems: 'center',
  },
  closeIcon: {
    position: 'absolute',
    right: 10,
    top: 10,
    zIndex: 9999,
  },

  verifyText: {
    fontSize: 18,
    marginTop: 30,
    marginBottom: 16,
    textAlign: 'center',
    color: Colors.nero,
  },

  verifyErrorText: {
    color: Colors.mediumCarmine,
    marginTop: 10,
  },

  verifyDescription: {
    fontSize: 14,
    color: Colors.nero,
    textAlign: 'center',
  },

  otpPinWrapper: {
    width: '60%',
    marginTop: 10,
    alignSelf: 'center',
  },

  textBtn: {
    fontSize: 12,
    color: Colors.white,
  },

  timerText: {
    fontSize: 14,
    color: Colors.primary,
    textAlign: 'center',
  },

  button: {
    width: 150,
    alignSelf: 'center',
    marginTop: 30,
    borderRadius: 20,
    height: 36,
    justifyContent: 'center',
  },

  contentButton: {
    width: 150,
  },

  resendText: {
    fontSize: 14,
    color: Colors.primary,
  },

  pinCodeTextStyle: {
    fontSize: 28,
  },

  pinCodeContainerStyle: {
    borderRadius: 0,
    borderWidth: 0,
    borderBottomWidth: 2,
    width: 18,
    borderBottomColor: Colors.black,
  },
});
export default Bimotrics;

