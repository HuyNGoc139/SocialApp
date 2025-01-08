import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Modal } from "react-native";
import { AppText } from "../components/AppText";
import { OtpInput } from "react-native-otp-entry";
import { useState } from "react";
import { Colors } from "../styles";
import { Dimensions } from "react-native";
const { width, height } = Dimensions.get('window');



export function PinModal({modalVisible,setModalVisible,onpress,setPin,cancel}){
    //   const [modalVisible, setModalVisible] = useState(false);


    const handleOnpress=()=>{
        onpress()
        setModalVisible(false)
    }
    return(
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
            <TouchableOpacity style={{alignSelf:'flex-end'}}
            onPress={()=>{ setModalVisible(false),cancel(false)}}
            >
            <AppText >X</AppText>
            </TouchableOpacity>
            <AppText fontFamily="bold" style={styles.verifyText}>
              Nhập mã PIN mới
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
              onPress={() => handleOnpress()}
            >
              <Text style={{ margin: 15 }}>Xác nhận</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>   
    )
}
const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.white,
    minHeight: height * 0.6,
    borderRadius: 15,
    alignItems: 'center',
    padding: 20,
    alignSelf: 'center',
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
