import React, { forwardRef, useImperativeHandle, useRef, useState } from 'react';
import { View, PanResponder, StyleSheet, Text } from 'react-native';
import { Canvas, useImage, Group, Image as SkiaImage } from '@shopify/react-native-skia';

interface Point {
  x: number;
  y: number;
}

interface DrawingCanvasProps {
  shapeImageBase64: string;
  is3DBrush: boolean;
  brushSize: number;
  brushColor: string;
  opacity: number;
  spacing: number;
  backgroundColor?: string;
}

export interface DrawingCanvasRef {
  clear: () => void;
}

export const DrawingCanvas = forwardRef<DrawingCanvasRef, DrawingCanvasProps>(
  ({ shapeImageBase64, is3DBrush, brushSize, brushColor, opacity, spacing, backgroundColor = '#000' }, ref) => {
    const [strokes, setStrokes] = useState<Point[][]>([]);
    const [currentStroke, setCurrentStroke] = useState<Point[]>([]);
    const shapeImage = useImage(
      shapeImageBase64 ? `data:image/png;base64,${shapeImageBase64}` : null
    );
    const lastPointRef = useRef<Point | null>(null);

    useImperativeHandle(ref, () => ({
      clear: () => {
        setStrokes([]);
        setCurrentStroke([]);
        lastPointRef.current = null;
      },
    }));

    const effectiveSpacing = is3DBrush ? Math.max(spacing * 0.5, 0.05) : spacing;
    const effectiveOpacity = is3DBrush ? opacity * 0.5 : opacity;
    const minDist = brushSize * effectiveSpacing * 0.5;

    const panResponder = PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt) => {
        const { locationX: x, locationY: y } = evt.nativeEvent;
        setCurrentStroke([{ x, y }]);
        lastPointRef.current = { x, y };
      },
      onPanResponderMove: (evt) => {
        const { locationX: x, locationY: y } = evt.nativeEvent;
        const last = lastPointRef.current;
        if (!last) return;
        const dx = x - last.x;
        const dy = y - last.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist >= minDist) {
          const steps = Math.floor(dist / minDist);
          for (let i = 1; i <= steps; i++) {
            const t = i / steps;
            const interpX = last.x + (x - last.x) * t;
            const interpY = last.y + (y - last.y) * t;
            setCurrentStroke((prev) => [...prev, { x: interpX, y: interpY }]);
        }
          lastPointRef.current = { x, y };
        }
      },
      onPanResponderRelease: () => {
        if (currentStroke.length > 0) {
          setStrokes((prev) => [...prev, currentStroke]);
          setCurrentStroke([]);
          lastPointRef.current = null;
        }
      },
      onPanResponderTerminate: () => {
        setCurrentStroke([]);
        lastPointRef.current = null;
      },
    });

    // UI에 디버깅 정보 표시 및 이미지 없음 처리
      return (
      <View style={[styles.container, { backgroundColor }]} {...panResponder.panHandlers}>
        <Text style={styles.debugText}>
          3D: {is3DBrush ? 'O' : 'X'} | Strokes: {strokes.length} | Current: {currentStroke.length}
        </Text>
        {!shapeImage && (
          <View style={styles.noImageBox}>
            <Text style={styles.noImageText}>이미지 없음</Text>
          </View>
        )}
        <Canvas style={{ flex: 1 }}>
          {strokes.map((stroke, i) => (
            <Group key={i}>
              {stroke.map((pt, j) =>
                shapeImage ? (
                  <SkiaImage
                    key={j}
                image={shapeImage}
                    x={pt.x - brushSize / 2}
                    y={pt.y - brushSize / 2}
                    width={brushSize}
                    height={brushSize}
                    opacity={effectiveOpacity * (is3DBrush ? 0.7 + 0.3 * (j / stroke.length) : 1)}
                    color={brushColor}
              />
                ) : null
              )}
            </Group>
          ))}
          <Group>
            {currentStroke.map((pt, j) =>
              shapeImage ? (
                <SkiaImage
                  key={j}
                  image={shapeImage}
                  x={pt.x - brushSize / 2}
                  y={pt.y - brushSize / 2}
                  width={brushSize}
                  height={brushSize}
                  opacity={effectiveOpacity * (is3DBrush ? 0.7 + 0.3 * (j / currentStroke.length) : 1)}
              color={brushColor}
            />
              ) : null
          )}
        </Group>
          </Canvas>
      </View>
    );
  }
);

const styles = StyleSheet.create({
  container: { flex: 1 },
  debugText: { color: '#fff', fontSize: 12, position: 'absolute', top: 2, left: 4, zIndex: 10 },
  noImageBox: { position: 'absolute', top: '50%', left: 0, right: 0, alignItems: 'center', zIndex: 20 },
  noImageText: { color: '#fff', fontSize: 18, backgroundColor: 'rgba(0,0,0,0.7)', padding: 8, borderRadius: 8 },
}); 