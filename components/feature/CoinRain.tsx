import React, { useEffect, useRef, useMemo } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';

interface Props {
  active: boolean;
  intensity?: 'light' | 'heavy';
}

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');
const COIN_COUNT_LIGHT = 18;
const COIN_COUNT_HEAVY = 35;
const COIN_EMOJIS = ['🪙', '💰', '⭐', '✨', '🌟'];

interface CoinConfig {
  startX: number;
  startY: number;
  emoji: string;
  size: number;
  duration: number;
  delay: number;
  rotate: number;
  translateY: Animated.Value;
  translateX: Animated.Value;
  opacity: Animated.Value;
  scale: Animated.Value;
}

export function CoinRain({ active, intensity = 'light' }: Props) {
  const count = intensity === 'heavy' ? COIN_COUNT_HEAVY : COIN_COUNT_LIGHT;

  const coins = useMemo<CoinConfig[]>(() =>
    Array.from({ length: count }, (_, i) => ({
      startX: Math.random() * SCREEN_W,
      startY: -60 - Math.random() * 200,
      emoji: COIN_EMOJIS[Math.floor(Math.random() * COIN_EMOJIS.length)],
      size: 16 + Math.random() * 20,
      duration: 1200 + Math.random() * 1200,
      delay: Math.random() * 1000,
      rotate: Math.random() * 360,
      translateY: new Animated.Value(0),
      translateX: new Animated.Value(0),
      opacity: new Animated.Value(0),
      scale: new Animated.Value(0.3),
    })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [count]
  );

  const animationsRef = useRef<Animated.CompositeAnimation[]>([]);

  useEffect(() => {
    if (active) {
      animationsRef.current.forEach(a => a.stop());
      animationsRef.current = [];

      coins.forEach(coin => {
        coin.translateY.setValue(0);
        coin.translateX.setValue(0);
        coin.opacity.setValue(0);
        coin.scale.setValue(0.3);

        const drift = (Math.random() - 0.5) * 80;
        const fallDist = SCREEN_H + 120;

        const anim = Animated.sequence([
          Animated.delay(coin.delay),
          Animated.parallel([
            Animated.timing(coin.opacity, {
              toValue: 1,
              duration: 200,
              useNativeDriver: true,
            }),
            Animated.spring(coin.scale, {
              toValue: 1,
              friction: 4,
              tension: 80,
              useNativeDriver: true,
            }),
            Animated.timing(coin.translateY, {
              toValue: fallDist,
              duration: coin.duration,
              useNativeDriver: true,
            }),
            Animated.timing(coin.translateX, {
              toValue: drift,
              duration: coin.duration,
              useNativeDriver: true,
            }),
          ]),
          Animated.timing(coin.opacity, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
        ]);

        anim.start();
        animationsRef.current.push(anim);
      });
    } else {
      animationsRef.current.forEach(a => a.stop());
      coins.forEach(coin => {
        coin.opacity.setValue(0);
        coin.translateY.setValue(0);
        coin.translateX.setValue(0);
        coin.scale.setValue(0.3);
      });
    }
  }, [active]);

  if (!active) return null;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {coins.map((coin, i) => (
        <Animated.Text
          key={i}
          style={{
            position: 'absolute',
            left: coin.startX,
            top: coin.startY,
            fontSize: coin.size,
            opacity: coin.opacity,
            transform: [
              { translateY: coin.translateY },
              { translateX: coin.translateX },
              { scale: coin.scale },
            ],
          }}
        >
          {coin.emoji}
        </Animated.Text>
      ))}
    </View>
  );
}
