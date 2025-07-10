import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import DocumentPicker from 'react-native-document-picker';
import DoodleLabBrushParser from 'doodlelab-brush-parser';
import type { ProcreateBrushData } from 'doodlelab-brush-parser';

interface BrushFilePickerProps {
  onBrushLoad: (data: ProcreateBrushData) => void;
}

export const BrushFilePicker: React.FC<BrushFilePickerProps> = ({ onBrushLoad }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pickBrushFile = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const result = await DocumentPicker.pick({
        type: [DocumentPicker.types.allFiles],
        copyTo: 'documentDirectory',
      });

      if (result && result.length > 0) {
        const file = result[0];
        console.log('Selected file:', file);

        // .brush 파일인지 확인
        if (!file.name?.endsWith('.brush')) {
          Alert.alert('오류', 'Procreate 브러시 파일(.brush)을 선택해주세요.');
          return;
        }

        // 파일 경로 처리
        const filePath = file.fileCopyUri || file.uri;
        console.log('Using file path:', filePath);

        // 브러시 파싱
        console.log('🔍 About to call parseBrushFile with path:', filePath);
        try {
          const parsedBrush = await DoodleLabBrushParser.parseBrushFile(filePath);
          console.log('✅ Parsed brush data:', parsedBrush);
          onBrushLoad(parsedBrush);
          Alert.alert('성공', '브러시가 성공적으로 로드되었습니다!');
        } catch (parseError: any) {
          console.error('❌ Native parsing error:', parseError);
          throw parseError;
        }
      }
    } catch (err: any) {
      console.error('Error picking brush file:', err);
      setError(err.message || '브러시 파일을 선택하는 중 오류가 발생했습니다.');
      Alert.alert('오류', err.message || '브러시 파일을 선택하는 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.section}>
      <TouchableOpacity
        style={[styles.button, isLoading && styles.buttonDisabled]}
        onPress={pickBrushFile}
        disabled={isLoading}
      >
        <Text style={styles.buttonText}>
          {isLoading ? 'Loading...' : 'Load Brush'}
        </Text>
      </TouchableOpacity>
      
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>❌ {error}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    width: '100%',
    alignItems: 'center',
  },
  button: {
    backgroundColor: '#222',
    paddingVertical: 18,
    paddingHorizontal: 32,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#444',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#111',
    borderColor: '#222',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  errorContainer: {
    marginTop: 15,
    padding: 12,
    backgroundColor: 'rgba(255, 59, 48, 0.1)',
    borderRadius: 8,
    width: '100%',
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 14,
    textAlign: 'center',
  },
}); 