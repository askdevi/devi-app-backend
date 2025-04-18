import React, { useEffect, useRef } from 'react';
import { Animated } from 'react-native';

const TwinkleAnimation = () => {
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 1500, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0, duration: 1500, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  return (
    <Animated.View style={{ opacity }}>
      {/* Your animated component */}
    </Animated.View>
  );
};

export default TwinkleAnimation;
