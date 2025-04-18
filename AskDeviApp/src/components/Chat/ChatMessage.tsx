import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';

interface ChatMessageProps {
  message: {
    id: string;
    content: string;
    role: 'user' | 'assistant';
  };
  isTyping?: boolean;
}

const ChatMessage = ({ message, isTyping }: ChatMessageProps) => {
  const isUser = message.role === 'user';

  return (
    <View style={[
      styles.container,
      isUser ? styles.userContainer : styles.assistantContainer
    ]}>
      <View style={[
        styles.bubble,
        isUser ? styles.userBubble : styles.assistantBubble
      ]}>
        {isTyping ? (
          <View style={styles.typingIndicator}>
            <View style={[styles.dot, styles.dot1]} />
            <View style={[styles.dot, styles.dot2]} />
            <View style={[styles.dot, styles.dot3]} />
          </View>
        ) : (
          <Text style={[
            styles.messageText,
            isUser ? styles.userText : styles.assistantText
          ]}>
            {message.content}
          </Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
    flexDirection: 'row',
  },
  userContainer: {
    justifyContent: 'flex-end',
  },
  assistantContainer: {
    justifyContent: 'flex-start',
  },
  bubble: {
    maxWidth: '80%',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
  },
  userBubble: {
    backgroundColor: 'rgba(139, 92, 246, 0.7)',
    borderColor: 'rgba(139, 92, 246, 0.2)',
  },
  assistantBubble: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderColor: 'rgba(139, 92, 246, 0.2)',
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  userText: {
    color: '#fff',
  },
  assistantText: {
    color: '#000',
  },
  typingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFD700',
    marginHorizontal: 3,
    opacity: 0.7,
  },
  dot1: {
    opacity: 0.4,
  },
  dot2: {
    opacity: 0.7,
  },
  dot3: {
    opacity: 1,
  },
});

export default ChatMessage;