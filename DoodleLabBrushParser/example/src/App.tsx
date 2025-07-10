import React, { useState, useRef } from 'react';
import {
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
} from 'react-native';
import DocumentPicker from 'react-native-document-picker';
import DoodleLabBrushParser from '../../src/NativeDoodleLabBrushParser';
import { DrawingCanvas, DrawingCanvasRef } from './components/DrawingCanvas';
import Slider from '@react-native-community/slider';

const COLOR_PALETTE = [
  '#FFFFFF', '#FF3B30', '#FF9500', '#FFCC00', '#34C759', '#00C7BE', '#30B0C7', '#32ADE6', '#007AFF', '#5856D6', '#000000'
];

const App = () => {
  const [brushInfo, setBrushInfo] = useState<any>(null);
  const [brushSize, setBrushSize] = useState(40);
  const [brushColor, setBrushColor] = useState('#FFFFFF');
  const [opacity, setOpacity] = useState(0.8);
  const [spacing, setSpacing] = useState(0.15); // 기본값 더 작게
  const [backgroundColor, setBackgroundColor] = useState('#000');
  const canvasRef = useRef<DrawingCanvasRef>(null);

  const handleFilePick = async () => {
    try {
      const res = await DocumentPicker.pickSingle({ type: [DocumentPicker.types.allFiles] });
      if (res && res.uri) {
        const result = await DoodleLabBrushParser.parseBrushFile(res.uri);
        setBrushInfo(result);
    canvasRef.current?.clear();
      }
    } catch (e) {
      // 취소 또는 오류
    }
  };

  const toggleBackground = () => {
    setBackgroundColor((prev) => (prev === '#000' ? '#fff' : '#000'));
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle={backgroundColor === '#000' ? 'light-content' : 'dark-content'} />
      <View style={styles.header}>
        <Text style={styles.title}>PencilCase Turbo</Text>
        <TouchableOpacity style={styles.fileButton} onPress={handleFilePick}>
          <Text style={styles.fileButtonText}>브러시 선택</Text>
        </TouchableOpacity>
      </View>
      {brushInfo && (
        <View style={styles.infoPanel}>
          <Text style={styles.infoText}>파일명: {brushInfo.name}</Text>
          <Text style={styles.infoText}>타입: {brushInfo.is3DBrush ? '3D 브러시' : '일반 브러시'}</Text>
          </View>
      )}
            <View style={styles.controlsContainer}>
        <View style={styles.sliderGroup}>
          <Text style={styles.label}>브러시 크기: {brushSize}</Text>
          <Slider
            style={styles.slider}
            minimumValue={5}
            maximumValue={100}
                  value={brushSize}
                  onValueChange={setBrushSize}
          />
        </View>
        <View style={styles.sliderGroup}>
          <Text style={styles.label}>간격 (spacing): {spacing.toFixed(2)}</Text>
          <Slider
            style={styles.slider}
            minimumValue={0.05} // 최소값 더 작게
            maximumValue={0.5} // 최대값도 더 촘촘하게
            step={0.01}
            value={spacing}
            onValueChange={setSpacing}
          />
        </View>
        <View style={styles.sliderGroup}>
          <Text style={styles.label}>불투명도: {opacity.toFixed(2)}</Text>
          <Slider
            style={styles.slider}
            minimumValue={0.1}
            maximumValue={1}
            step={0.01}
            value={opacity}
            onValueChange={setOpacity}
                />
              </View>
        <View style={styles.colorPickerGroup}>
          <Text style={styles.label}>색상</Text>
          <View style={styles.colorRow}>
            {COLOR_PALETTE.map((color) => (
                    <TouchableOpacity
                      key={color}
                style={[styles.colorButton, { backgroundColor: color }, brushColor === color && styles.selectedColorButton]}
                      onPress={() => setBrushColor(color)}
                    />
                  ))}
                </View>
              </View>
        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.actionButton} onPress={() => canvasRef.current?.clear()}>
            <Text style={styles.actionButtonText}>🗑️ 캔버스 지우기</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={toggleBackground}>
            <Text style={styles.actionButtonText}>🔄 배경 전환</Text>
              </TouchableOpacity>
            </View>
      </View>
      {brushInfo && (
        <View style={styles.canvasContainer}>
          <DrawingCanvas
            ref={canvasRef}
            shapeImageBase64={brushInfo.shapeImageBase64}
            is3DBrush={brushInfo.is3DBrush}
            brushSize={brushSize}
            brushColor={brushColor}
            opacity={opacity}
            spacing={spacing}
            backgroundColor={backgroundColor}
          />
          </View>
        )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  header: { padding: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  title: { color: '#fff', fontSize: 24, fontWeight: 'bold' },
  fileButton: { backgroundColor: '#667eea', padding: 12, borderRadius: 8 },
  fileButtonText: { color: '#fff', fontWeight: 'bold' },
  infoPanel: { backgroundColor: '#222', padding: 12, margin: 10, borderRadius: 8 },
  infoText: { color: '#fff', fontSize: 16 },
  controlsContainer: { padding: 16, backgroundColor: '#111' },
  sliderGroup: { marginVertical: 10 },
  label: { color: '#fff', marginBottom: 4 },
  slider: { width: '100%', height: 40 },
  colorPickerGroup: { marginVertical: 10 },
  colorRow: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 4 },
  colorButton: { width: 32, height: 32, borderRadius: 16, margin: 4, borderWidth: 2, borderColor: 'transparent' },
  selectedColorButton: { borderColor: '#fff', borderWidth: 2 },
  buttonRow: { flexDirection: 'row', marginTop: 10 },
  actionButton: { backgroundColor: '#333', padding: 10, borderRadius: 8, marginRight: 10 },
  actionButtonText: { color: '#fff', fontWeight: 'bold' },
  canvasContainer: { flex: 1, minHeight: 300 },
});

export default App;
