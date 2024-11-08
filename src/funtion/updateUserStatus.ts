import auth from '@react-native-firebase/auth';
import { AppState } from 'react-native';
import firestore from '@react-native-firebase/firestore';
export const updateUserStatus = async (status: 'online' | 'offline') => {
  const user = auth().currentUser;
  if (user) {
    try {
      await firestore().collection('Users').doc(user.uid).update({
        status: status,
      });
    } catch (error) {
      console.error('Error updating user status: ', error);
    }
  }
};
