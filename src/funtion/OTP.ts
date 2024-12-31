import axios from 'axios';
import { loginUser } from '../redux/authAction';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../redux/store';

export const handleSendOTP = async (email: string) => {
  try {
    const response = await axios.post('http://192.168.4.77:3000/api/otp/send', {
      email,
    });
    console.log('OTP has been sent to your email!', response.data);
  } catch (error) {
    console.log('Error sending OTP.', error);
  }
};
