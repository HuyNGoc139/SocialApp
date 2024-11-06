
import { Colors, Fonts } from '../styles';
import React, { useState } from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { TextInput, TextInputProps } from 'react-native-paper';
import { CloseSquare, Eye, EyeSlash } from 'iconsax-react-native';
import { AppText } from './AppText';

type TLoginInputProps = {
  label: string;
  errorMessages?: string;
  isRequired?: boolean;
  isSecure?: boolean;
  wrapperStyle?: StyleProp<ViewStyle>;
} & TextInputProps;
{/* <FloatingLabelInput
          label={t('auth.password')}
          isSecure
          wrapperStyle={{ marginTop: 16 }}
          outlineColor={Colors.black23}
          value={watch('password')}
          style={{ height: 52 }}
          onChangeText={(text) => setValue('password', text)}
          errorMessages={errors?.password?.message}
        /> */}

export const FloatingLabelInput = ({
  label,
  errorMessages,
  isRequired,
  isSecure,
  wrapperStyle,
  disabled,
  textColor,
  ...inputProps
}: TLoginInputProps) => {
  const [show, setShow] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={[styles.container, wrapperStyle]}>
      <TextInput
        right={
          isSecure ? (
            <TextInput.Icon
              forceTextInputFocus={false}
              icon={() => (!show ? <Eye size="20" color="black" /> : <EyeSlash size="20" color="black" />)}
              onPress={() => setShow(!show)}
            />
          ) : undefined
        }
        label={
          <AppText
            style={[
              styles.label,
              {
                color: disabled
                  ? Colors.black38
                  : isFocused
                  ? Colors.primary
                  : Colors.nero,
              },
            ]}
          >
            {label}
            {isRequired && (
              <AppText style={{ color: Colors.sunsetOrange }}> *</AppText>
            )}
          </AppText>
        }
        mode="outlined"
        outlineStyle={{ borderRadius: 15 }}
        outlineColor={Colors.black23}
        activeOutlineColor={Colors.primary}
        secureTextEntry={isSecure && !show}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        disabled={disabled}
        {...inputProps}
        textColor={
          disabled
            ? textColor === Colors.nero
              ? Colors.black38
              : textColor
            : textColor
        }
        style={[{ fontFamily: Fonts.regular }, inputProps.style]}
      />
      {errorMessages && (
        <AppText
          style={[
            styles.label,
            {
              color: Colors.mediumCarmine,
              marginTop: 3,
              paddingHorizontal: 14,
            },
          ]}
        >
          *{errorMessages}
        </AppText>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },

  label: {
    fontSize: 14,
  },

  labelContainer: {
    position: 'absolute',
    left: 12,
    zIndex: 999,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
});
