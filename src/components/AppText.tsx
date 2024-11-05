import { Fonts } from '../styles/fonts';
import React, { memo } from 'react';
import { StyleProp, Text, TextProps, TextStyle } from 'react-native';

export type TAppTextStyle = StyleProp<Omit<TextStyle, 'fontFamily'>>;

type Props = {
  children: string | string[] | React.ReactNode;
  style?: TAppTextStyle;
  fontFamily?: 'thin' | 'regular' | 'medium' | 'semibold' | 'bold';
} & Omit<TextProps, 'style'>;

interface IFonts {
  [key: string]: Pick<TextStyle, 'fontFamily' | 'fontWeight'>;
}

const FONTS: IFonts = {
  thin: {
    fontFamily: Fonts.thin,
    fontWeight: '300',
  },
  regular: {
    fontFamily: Fonts.regular,
    fontWeight: '400',
  },
  medium: {
    fontFamily: Fonts.medium,
    fontWeight: '500',
  },
  semibold: {
    fontFamily: Fonts.semiBold,
    fontWeight: '600',
  },
  bold: {
    fontFamily: Fonts.bold,
    fontWeight: '700',
  },
};

export const AppText = memo((props: Props) => {
  const { fontFamily = 'regular', children, style, ...textProps } = props;

  return (
    <Text style={[FONTS[fontFamily], style]} {...textProps}>
      {children}
    </Text>
  );
});
