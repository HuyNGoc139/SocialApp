import { ArrowDown2, ArrowSquareLeft, ArrowUp2 } from 'iconsax-react-native';
import { Alert, Image, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import ModalChangeName from '../../components/chat/ModalChangeName';
import { useEffect, useMemo, useRef, useState } from 'react';
import SpaceComponent from '../../components/SpaceComponent';
import { fontFamilies } from '../../constants/fontFamily';
import firestore from '@react-native-firebase/firestore';
import { User } from '../../models/user';
import { useSelector } from 'react-redux';
import { RootState } from '../../redux/store';

import { PinModal } from '../../Security/PinModal';
import ReactNativeBiometrics from 'react-native-biometrics';
import Bimotrics from '../../Security/Bimotrics';
import BottomSheet from '@gorhom/bottom-sheet';
import { Button } from 'react-native';
const GroupDetails = ({ navigation, route }: any) => {
  const group = route.params;
  const [visible, setVisible] = useState(false);
  const [isShow, setIsShow] = useState(false);
  const [members, setMembers] = useState<User[]>([]);
  const [access,setAccess] = useState()
  const [modalVisible, setModalVisible] = useState(false);
  const [pin, setPin] = useState();
  const [changePin, setChangePin] = useState();

  const rnBiometrics = new ReactNativeBiometrics();
  const bottomSheetRef = useRef<BottomSheet>(null);



  const user = useSelector((state: RootState) => state.auth.user);
  useEffect(() => {
    getAllMembers();
    getSecurity()
    setSecurity()
  }, []);

  useEffect(()=>{
    setSecurity()
    getPinDb()
  },[access])
  const getSecurity =  async() =>{
      const get = firestore()
      .collection('Group').doc(group.id)
      const userDoc = await get.get();
      if (userDoc.exists) {
        const data = userDoc.data();
        const access = data?.security?.[user?.uid]?.access;
        const pin = data?.security?.[user?.uid]?.pin;

      if(access === true && pin){
          setAccess(true)
        }else{
          setAccess(false)
        }
     
      }  
  }

 const setSecurity= async()=>{
  const userRef = firestore()
      .collection('Group').doc(group.id)
      if(access === true){
      await userRef.update({
          [`security.${user?.uid}.access`]: true,
        });
      }
      if(access === false){
        await userRef.update({
          [`security.${user?.uid}.access`]: false,
        });
      }
 }

 const getPinDb = async() =>{
  const get = firestore()
  .collection('Group').doc(group.id)
  const userDoc = await get.get();
  if (userDoc.exists) {
    const data = userDoc.data();
  const pin = data?.security?.[user?.uid]?.pin;
  if(access === true ){
    if(pin === undefined){
      setModalVisible(true)
      setChangePin(false)
    }else{
      setModalVisible(false)
      setChangePin(true)
    }
  }
  }  
 }

 const setPinDb = async()=>{
  const userRef = firestore()
  .collection('Group').doc(group.id)
      await userRef.update({
    [`security.${user?.uid}`]: {
      pin:pin,
      access: true,
    },
  });
 }

 const handleBiometricAuth = () => {
     console.log(rnBiometrics.allowDeviceCredentials);
     rnBiometrics
       .simplePrompt({
         promptMessage: 'Xác thực sinh trắc học',
       })
       .then(result => {
         if (result.success) {
           if (rnBiometrics.allowDeviceCredentials === false) {         
             Alert.alert('Xác thực thành công bằng sinh trắc học!');
             setAccess(false)
           } else {
             Alert.alert('TouchID đã được mở khoá');
             rnBiometrics.allowDeviceCredentials = false;
           }
         } else {
          setAccess(true)
         }
       })
       .catch(error => {
         Alert.alert('TouchId tạm khoá do nhập sai quá nhiều lần');
         rnBiometrics.allowDeviceCredentials = true;
         setAccess(true)
       });
   };

  const handleChangePin = () =>{
    // setModalVisible(true)

  }
 const toggleSwitch = () => {
  setAccess(previousState => !previousState)
  if(access){
    handleBiometricAuth()
  }
};

  const getAllMembers = () => {
    const currentUserFriends = group.members || [];
    const unsubscribeUsers = firestore()
      .collection('Users')
      .onSnapshot(snapshot => {
        const items: User[] = [];
        if (snapshot.empty) {
          console.log('User not found');
        } else {
          snapshot.forEach(item => {
            if (item.id !== user?.uid && currentUserFriends.includes(item.id)) {
              items.push({
                username: item.data().username,
                uid: item.id,
                email: item.data()?.email,
                url: item.data()?.url,
              });
            }
          });
          setMembers(items);
        }
      });
    return () => {
      unsubscribeUsers();
    };
  };

  const childRef = useRef();

  const callChildFunction = () => {
    if (childRef.current) {
      childRef.current.childFunction();
    }
  };
  return (
    <View style={{ flex: 1, backgroundColor: 'white' }}>
      <View
        style={{
          backgroundColor: 'white',
          justifyContent: 'flex-start',
          height: 68,
          padding: 12,
          marginBottom: 12,
        }}
      >
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ArrowSquareLeft size={28} color="black" />
        </TouchableOpacity>
      </View>

      <View
        style={{
          alignSelf: 'center',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {group.url ? (
          <Image
            source={{ uri: group.url }}
            style={{
              width: 100,
              height: 100,
              borderRadius: 1000,
              marginBottom: 10,
            }}
          />
        ) : (
          <Image
            source={require('../../assets/image/avatargroup.png')}
            style={{
              width: 100,
              height: 100,
              borderRadius: 1000,
              marginBottom: 10,
            }}
          />
        )}

        <Text style={{ textAlign: 'center', fontSize: 20, color: 'black' }}>
          {group.groupName}
        </Text>
        <TouchableOpacity onPress={() => setVisible(true)}>
          <Text style={{ color: 'blue' }}>Thay đổi tên hoặc ảnh nhóm</Text>
        </TouchableOpacity>
      </View>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'center',
          alignItems: 'center',
          marginTop: 16,
        }}
      >
        <TouchableOpacity>
          <Image
            style={{ width: 24, height: 24 }}
            source={require('../../assets/adduser.png')}
          />
        </TouchableOpacity>
        <SpaceComponent width={24} />
        <TouchableOpacity>
          <Image
            tintColor={'red'}
            style={{ width: 24, height: 24 }}
            source={require('../../assets/logout.png')}
          />
        </TouchableOpacity>
      </View>

      <View style={{ flex: 1, padding: 20 }}>
        <TouchableOpacity
          style={{
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
          }}
          onPress={() => setIsShow(!isShow)}
        >
          <Text
            style={{
              color: 'black',
              fontSize: 18,
              fontFamily: fontFamilies.regular,
              flex: 1,
            }}
          >
            Xem tất cả thành viên
          </Text>
          {!isShow ? (
            <ArrowDown2 size="24" color="black" />
          ) : (
            <ArrowUp2 size="24" color="black" />
          )}
        </TouchableOpacity>
        {isShow ? (
          <View>
            {members.length > 0 ? (
              <>
                <View style={{ marginTop: 10 }}>
                  {members.map((item, index) => {
                    return (
                      <View
                        style={{ flexDirection: 'row', marginTop: 16 }}
                        key={index}
                      >
                        {item?.url ? (
                          <Image
                            style={styles.image}
                            source={{ uri: item.url }}
                          />
                        ) : (
                          <Image
                            style={styles.image}
                            source={require('../../assets/image/avatar.png')}
                          />
                        )}
                        <View
                          style={{ marginLeft: 10, justifyContent: 'center' }}
                        >
                          <View>
                            <Text style={styles.textBold}>{item.username}</Text>
                          </View>
                        </View>
                      </View>
                    );
                  })}
                </View>
              </>
            ) : (
              <></>
            )}
          </View>
        ) : (
          <></>
        )}
        <View style={{flexDirection:'row',marginVertical:10}}>
          <Text   style={{
              color: 'black',
              fontSize: 18,
              fontFamily: fontFamilies.regular,
              flex: 1,
            }}>Bảo mật</Text>
          <Switch value={access}   onValueChange={toggleSwitch}></Switch>
        </View>
        {changePin? <TouchableOpacity onPress={callChildFunction}><Text style={{ color: 'black',
              fontSize: 18,
              fontFamily: fontFamilies.regular,
              }}>Đổi mã pin</Text></TouchableOpacity>:null}
      </View>

      <ModalChangeName
        isVisible={visible}
        onClose={() => {
          setVisible(false);
          navigation.navigate('Chat');
        }}
        onSave={() => setVisible(false)}
        group={group}
      />
      <PinModal  modalVisible={modalVisible} setModalVisible={setModalVisible} onpress={setPinDb} setPin={setPin}
      cancel={setModalVisible}
      ></PinModal>
      <Bimotrics ref={childRef} input={()=>setModalVisible(true)
      } setPin={setPin} groupID={group.id} getPin={pin}/>
        
      
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    // borderBottomWidth: 1,
    marginLeft: 10,
    marginRight: 10,
    padding: 8,
    marginTop: 10,
  },
  text: {
    fontFamily: fontFamilies.regular,
    fontSize: 16,
  },
  textBold: {
    fontFamily: fontFamilies.semiBold,
    color: 'black',
    fontSize: 18,
    textAlign: 'center',
  },
  image: {
    height: 40,
    width: 40,
    borderRadius: 100,
  },
});
export default GroupDetails;
