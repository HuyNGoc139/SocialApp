import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import PINCode from '@haskkor/react-native-pincode'; // k dung

const PinCodeScreen = () => {
  const [pinCode, setPinCode] = useState('1234'); // Mã PIN mẫu để so sánh.

  return (
    <View style={styles.container}>
      <PINCode
        status="choose" // Các giá trị: "choose", "enter", "locked"
        colorCircleButtons="#3b82f6" // Màu của các nút.
        colorPassword="#3b82f6" // Màu của các chấm mã PIN.
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
});

export default PinCodeScreen;
