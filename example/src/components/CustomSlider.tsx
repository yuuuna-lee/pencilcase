import React, { useState } from 'react';
import {
  View,
  Text,
  PanResponder,
  StyleSheet,
} from 'react-native';

interface CustomSliderProps {
  value: number;
  onValueChange: (value: number) => void;
  minimumValue: number;
  maximumValue: number;
}

export const CustomSlider: React.FC<CustomSliderProps> = ({
  value,
  onValueChange,
  minimumValue,
  maximumValue,
}) => {
  const [sliderWidth, setSliderWidth] = useState(0);

  const sliderPanResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: (event) => {
      const { locationX } = event.nativeEvent;
      const newValue = Math.max(
        minimumValue,
        Math.min(
          maximumValue,
          Math.round((locationX / sliderWidth) * (maximumValue - minimumValue) + minimumValue)
        )
      );
      onValueChange(newValue);
    },
    onPanResponderMove: (event) => {
      const { locationX } = event.nativeEvent;
      const newValue = Math.max(
        minimumValue,
        Math.min(
          maximumValue,
          Math.round((locationX / sliderWidth) * (maximumValue - minimumValue) + minimumValue)
        )
      );
      onValueChange(newValue);
    },
  });

  const thumbPosition = ((value - minimumValue) / (maximumValue - minimumValue)) * 100;

  return (
    <View style={styles.container}>
      <View
        style={styles.slider}
        onLayout={(event) => {
          setSliderWidth(event.nativeEvent.layout.width);
        }}
        {...sliderPanResponder.panHandlers}
      >
        <View style={styles.track} />
        <View
          style={[
            styles.trackFill,
            { width: `${thumbPosition}%` }
          ]}
        />
        <View
          style={[
            styles.thumb,
            { left: `${thumbPosition}%` }
          ]}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 10,
  },
  slider: {
    width: '100%',
    height: 20,
    justifyContent: 'center',
  },
  track: {
    width: '100%',
    height: 4,
    backgroundColor: '#333',
    borderRadius: 2,
  },
  trackFill: {
    position: 'absolute',
    height: 4,
    backgroundColor: '#FFFFFF',
    borderRadius: 2,
  },
  thumb: {
    position: 'absolute',
    width: 24,
    height: 24,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginLeft: -12, // thumb 너비의 절반
    borderWidth: 2,
    borderColor: '#000000',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
}); 