import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Animated,
  Keyboard,
  Platform,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

// Sample suggestions for placeholder text
const SUGGESTIONS = [
  "Shaadi arrange hogi ya love?",
  "Career mein success kab milega?",
  "Anxiety ka kya upaay hai?",
  "Partner ko trust karna chahiye?",
  "Love life ka future kya hai?",
  "Foreign travel kab karu?",
  "Mera promotion kab hoga?",
  "Ex wapas aayega kya?",
  "Mere andar negative kya hai?",
  "Meri health kab improve hogi?",
];

interface ChatInputProps {
  onSend: (message: string) => void;
  isLoading: boolean;
  disabled?: boolean;
}

const ChatInput = ({ onSend, isLoading, disabled }: ChatInputProps) => {
  const [message, setMessage] = useState('');
  const [currentPlaceholder, setCurrentPlaceholder] = useState('');
  const [currentSuggestionIndex, setCurrentSuggestionIndex] = useState(0);
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Handle keyboard show/hide
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      () => setKeyboardVisible(true)
    );
    const keyboardDidHideListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => setKeyboardVisible(false)
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  // Animate placeholder text
  useEffect(() => {
    if (isInputFocused) {
      setCurrentPlaceholder(SUGGESTIONS[currentSuggestionIndex]);
      return;
    }

    let currentText = '';
    let currentIndex = 0;
    let isTyping = true;
    let timeoutId: NodeJS.Timeout;

    const animatePlaceholder = () => {
      const currentSuggestion = SUGGESTIONS[currentSuggestionIndex];

      if (isTyping) {
        if (currentIndex < currentSuggestion.length) {
          currentText += currentSuggestion[currentIndex];
          setCurrentPlaceholder(currentText);
          currentIndex++;
          timeoutId = setTimeout(animatePlaceholder, 80);
        } else {
          isTyping = false;
          timeoutId = setTimeout(animatePlaceholder, 1500);
        }
      } else {
        if (currentText.length > 0) {
          currentText = currentText.slice(0, -1);
          setCurrentPlaceholder(currentText);
          timeoutId = setTimeout(animatePlaceholder, 80);
        } else {
          isTyping = true;
          currentIndex = 0;
          setCurrentSuggestionIndex((prev) => (prev + 1) % SUGGESTIONS.length);
          timeoutId = setTimeout(animatePlaceholder, 80);
        }
      }
    };

    timeoutId = setTimeout(animatePlaceholder, 80);
    return () => clearTimeout(timeoutId);
  }, [currentSuggestionIndex, isInputFocused]);

  // Fade animation for placeholder
  useEffect(() => {
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  }, [currentPlaceholder, fadeAnim]);

  const handleSend = () => {
    if (message.trim() && !isLoading && !disabled) {
      onSend(message);
      setMessage('');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={message}
          onChangeText={setMessage}
          placeholder={disabled ? "Devi is typing..." : currentPlaceholder}
          placeholderTextColor="#999"
          multiline
          maxLength={500}
          onFocus={() => setIsInputFocused(true)}
          onBlur={() => setIsInputFocused(false)}
          editable={!disabled}
        />
        <TouchableOpacity
          style={[
            styles.sendButton,
            (!message.trim() || isLoading || disabled) && styles.disabledButton,
          ]}
          onPress={handleSend}
          disabled={!message.trim() || isLoading || disabled}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Ionicons name="send" size={20} color="#fff" />
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(139, 92, 246, 0.3)',
    backgroundColor: 'rgba(34, 0, 56, 0.9)',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.5)',
    paddingHorizontal: 16,
  },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 120,
    color: '#fff',
    fontSize: 16,
    paddingVertical: 8,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#8b5cf6',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  disabledButton: {
    backgroundColor: 'rgba(139, 92, 246, 0.5)',
  },
});

export default ChatInput;