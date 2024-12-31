import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { AppText, TAppTextStyle } from '../AppText';
import { Colors } from '../../styles';

type TCountdownTextProps = {
  seconds: number;
  onCountdownEnd?: () => void;
  textStyle?: TAppTextStyle;
};

export const CountdownText = ({
  seconds,
  onCountdownEnd,
  textStyle,
}: TCountdownTextProps) => {
  const [timeLeft, setTimeLeft] = useState(seconds);
  const formatTimeCountdown = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(
      remainingSeconds,
    ).padStart(2, '0')}`;
  };

  useEffect(() => {
    if (timeLeft === 0) {
      onCountdownEnd?.();
      return;
    }

    const interval = setInterval(() => {
      setTimeLeft(prevTime => prevTime - 1);
    }, 1000);

    return () => clearInterval(interval);
  });

  return (
    <View>
      <AppText style={[styles.defaultText, textStyle]}>
        {formatTimeCountdown(timeLeft)}
      </AppText>
    </View>
  );
};

const styles = StyleSheet.create({
  defaultText: {
    fontSize: 14,
    color: Colors.primary,
    textAlign: 'center',
  },
});
