import React, { useMemo } from 'react';
import { StyleProp, StyleSheet, TextStyle, ViewStyle } from 'react-native';
import { Button, ButtonProps } from 'react-native-paper';
import { Colors } from '../styles';

type TAppButtonProps = {
  label: string;
  additionalStyles?: ButtonProps['style'];
  contentStyle?: ButtonProps['contentStyle'];
  children?: ButtonProps['children'];
  fontFamily?: 'bold' | 'semiBold' | 'medium' | 'regular' | 'thin';
} & Omit<ButtonProps, 'children' | 'style'>;
export const AppButton = ({
  label,
  additionalStyles,
  children,
  fontFamily = 'semiBold',
  ...props
}: TAppButtonProps) => {
  const defaultOutlineHeightStyle = useMemo<StyleProp<ViewStyle>>(
    () => ({
      height: props.mode === 'outlined' ? 34 : 36,
    }),
    [props.mode],
  );

  const defaultOutlineLabelStyle = useMemo<StyleProp<TextStyle>>(
    () => ({
      color: props.disabled ? Colors.black45 : Colors.nero,
    }),
    [props.disabled],
  );

  return (
    <Button
      {...props}
      mode={props.mode || 'contained'}
      contentStyle={[
        styles.contentStyle,
        defaultOutlineHeightStyle,

        props.contentStyle,
      ]}
      labelStyle={[
        styles.label,
        props.labelStyle,
        props.mode === 'outlined' ? defaultOutlineLabelStyle : {},
      ]}
      style={[styles.button, additionalStyles]}
    >
      {children || label}
    </Button>
  );
};

const styles = StyleSheet.create({
  button: {
    width: '100%',
    borderRadius: 14,
    opacity: 1,
  },
  contentStyle: {
    height: 36,
    marginVertical: 4,
  },
  label: {
    fontSize: 14,
    textAlignVertical: 'center',
  },
});
