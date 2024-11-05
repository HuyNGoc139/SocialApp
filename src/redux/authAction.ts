import { createAsyncThunk } from '@reduxjs/toolkit';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { Alert } from 'react-native';
import { User } from '../models/user';

export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async ({
    email,
    password,
  }: { email: string; password: string; },
  { rejectWithValue }) => {
    try {
      const userCredential = await auth().signInWithEmailAndPassword(email, password);
      const uid = userCredential.user.uid;
      const userDoc = await firestore().collection('Users').doc(uid).get();
      if (userDoc.exists) {
        return { uid,
          ...userDoc.data() as User};
      } else {
        throw new Error('User not found');
      }
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const registerUser = createAsyncThunk(
  'auth/registerUser',
  async ({
    email,
    password,
    username
  }: { email: string; password: string; username:string }, { rejectWithValue }) => {
    try {
      
      const userCredential = await auth().createUserWithEmailAndPassword(email, password);
      const uid = userCredential.user.uid;

      await firestore().collection('Users').doc(uid).set({
        userId: uid,
        email,
        username,
        friends: [],
        createAt: new Date(),
        url: "",
        uid,
      });

      return { uid,
         email, username,friends: [] };
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const logoutUser = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      auth()
        .signOut()
        .then(() => {
          Alert.alert('Đăng xuất thành công!');
        })
        .catch((error) => {
        });
    } catch (error) {
      return rejectWithValue('Logout failed!');
    }
  }
);
