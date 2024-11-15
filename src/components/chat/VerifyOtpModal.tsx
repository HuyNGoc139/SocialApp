import React, { useMemo, useState } from 'react';
import {
    Dimensions,
  Image,
  Pressable,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';
import Modal from 'react-native-modal';
import { OtpInput } from 'react-native-otp-entry';
import { MODAL_HEIGHT, MODAL_WIDTH, scaleSize } from '../../funtion/ultils';
import { AppText } from '../AppText';
import { Colors } from '../../styles';

const { width, height } = Dimensions.get('window');

export type TVerifyOTPModalProps = {
  isVisible: boolean;
  onClose: () => void;
  userName: string;
  userEmail: string;
};

export const VerifyOTPModal = (props: TVerifyOTPModalProps) => {
  const { isVisible, onClose, userName, userEmail } = props;
  const dispatch = useAppDispatch();
  const [otpCode, setOtpCode] = useState('');
  const [timer, setTimer] = useState(120);
  const [isTimerActive, setIsTimerActive] = useState(true);
  const [verifyError, setVerifyError] = useState<string>('');
  const [hasSentCode, setHasSentCode] = useState(true);
  const { widthScale, heightScale } = scaleSize(MODAL_WIDTH, MODAL_HEIGHT);

  const closeModal = () => {
    onClose();
    setVerifyError('');
    setOtpCode('');
    setTimer(120);
  };

  const errorVerifyMessageMap = useMemo(
    () =>
      new Map([
        ['error.wrong-authentication-code', 'auth.otp code wrong'],
        ['error.otp-code-is-expired','auth.otp code expired'],
        ['internal server error', 'auth.error occurred'],
      ]),
    [],
  );




  const modalScaleStyle: StyleProp<ViewStyle> = {
    width: widthScale,
    minHeight: heightScale,
  };

  return (
    <Modal
      isVisible={isVisible}
      onModalShow={() => {
        setIsTimerActive(true);
      }}
      onModalHide={closeModal}
    >
      <View style={[styles.container, modalScaleStyle]}>
        <Pressable style={styles.closeIcon} onPress={closeModal}>
          <Image source={require('../../assets/close.png')} style={{width:24,height:24}}/>
        </Pressable>
        <AppText fontFamily="bold" style={styles.verifyText}>
          'verify two step'
        </AppText>

        {/* <SvgIcon
          name="2step-verify"
          width={width * 0.33}
          height={width * 0.33}
        /> */}

        <AppText
          style={[
            styles.verifyDescription,
            {
              marginTop: 5,
            },
          ]}
        >
          'verify two step description'
        </AppText>

        <AppText
          style={[
            styles.verifyDescription,
            {
              marginTop: 16,
            },
          ]}
        >
          abc
        </AppText>

        <View style={styles.otpPinWrapper}>
          <OtpInput
            numberOfDigits={6}
            onTextChange={(text) => {
              if (verifyError) {
                setVerifyError('');
              }
              setOtpCode(text);
            }}
            textInputProps={{
              value: otpCode,
            }}
            theme={{
              containerStyle: {
                alignSelf: 'center',
              },
              pinCodeTextStyle: styles.pinCodeTextStyle,
              pinCodeContainerStyle: styles.pinCodeContainerStyle,
            }}
            onFilled={(text) => {
            }}
          />
        </View>

        {verifyError !== '' && (
          <AppText style={[styles.verifyDescription, styles.verifyErrorText]}>
            {errorVerifyMessageMap.get(verifyError)}
          </AppText>
        )}

        {/* <AppButton
          additionalStyles={styles.button}
          contentStyle={styles.contentButton}
          disabled={otpCode.length !== 6}
          onPress={() => {
            verifyOtpCodeMutation.mutate({
              userName,
              otpCode,
            });
          }}
          label={t('verify')}
        /> */}

        <View style={{ marginTop: 15, marginBottom: 50 }}>
          {isTimerActive ? (
            <>
              <AppText style={styles.verifyDescription}>
                {hasSentCode
                  ? 'auth.has sent code'
                  : 'auth.otp code failed'}
              </AppText>
            </>
          ) : (
            <AppText style={styles.verifyDescription}>
              'not receive code'{' '}
              <AppText
                style={[styles.verifyDescription, { color: Colors.primary }]}
                onPress={() => {
                 //code
                  setIsTimerActive(true);
                }}
              >
                {'resend code'}
              </AppText>
            </AppText>
          )}
        </View>
      </View>
    </Modal>
  );
};

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
function useAppDispatch() {
    throw new Error('Function not implemented.');
}

