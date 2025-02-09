import React, { PureComponent, ReactNode } from 'react';
import { StyleProp, Text, View, ViewStyle, TextStyle } from 'react-native';
import { globalStyles } from '../styles/globalStyles';
import { fontFamilies } from '../constants/fontFamily';
import { colors } from '../constants/color';
import TextComponent from './TextComponent';
interface Props {
  text: string;
  size?: number;
  font?: string;
  color?: string;
  styles?: StyleProp<TextStyle>;
}
const TitleComponent = (props: Props) => {
  const { text, size, font, color, styles } = props;
  return (
    <TextComponent
      size={size ?? 20}
      font={font ?? fontFamilies.semiBold}
      color={color}
      text={text}
    />
  );
};
export default TitleComponent;
