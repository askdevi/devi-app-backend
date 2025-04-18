import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import ChatInput from '../components/Chat/ChatInput';
import ChatMessage from '../components/Chat/ChatMessage';
import { auth } from '../lib/firebase';

// Message type definition
interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
}

const ChatScreen = ({ navigation }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialGreeting, setIsInitialGreeting] = useState(true);
  const flatListRef = useRef<FlatList>(null);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (messages.length > 0 && flatListRef.current) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  // Initial greeting message
  useEffect(() => {
    if (isInitialGreeting) {
      setTimeout(() => {
        const user = auth().currentUser;
        const greeting = `Namaste ${user?.displayName || 'there'}🙏\nI'm Devi, your personal Vedic astrologer. Which secrets of your stars would you like to explore today? Whether it's love, career, health, or personal growth, feel free to ask me anything😊\nLet's begin...`;
        
        const greetingMessage: Message = {
          id: Date.now().toString(),
          content: greeting,
          role: 'assistant',
        };
        
        setMessages([greetingMessage]);
        setIsInitialGreeting(false);
      }, 1000);
    }
  }, [isInitialGreeting]);

  // Send message to backend and get response
  const handleSendMessage = async (text: string) => {
    if (!text.trim()) return;

    // Add user message to chat
    const userMessage: Message = {
      id: Date.now().toString(),
      content: text,
      role: 'user',
    };
    
    setMessages(prevMessages => [...prevMessages, userMessage]);
    setIsLoading(true);

    try {
      // Format messages for API
      const formattedMessages = messages.map(({ content, role }) => ({
        content,
        role,
      }));

      // Add the new user message
      formattedMessages.push({
        content: text,
        role: 'user',
      });

      // Call API
      const response = await fetch('http://10.0.2.2:3000/api/devi', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: text,
          messages: formattedMessages,
          userId: auth().currentUser?.uid,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const data = await response.json();
      
      // Add assistant response to chat
      const assistantMessage: Message = {
        id: Date.now().toString(),
        content: data.response,
        role: 'assistant',
      };
      
      setMessages(prevMessages => [...prevMessages, assistantMessage]);
    } catch (error) {
      console.error('Error getting response:', error);
      
      // Add error message
      const errorMessage: Message = {
        id: Date.now().toString(),
        content: 'Sorry, I encountered an error. Please try again.',
        role: 'assistant',
      };
      
      setMessages(prevMessages => [...prevMessages, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#FFD700" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chat with Devi</Text>
        <TouchableOpacity 
          style={styles.historyButton}
          onPress={() => navigation.navigate('ChatHistory')}
        >
          <Ionicons name="time-outline" size={24} color="#FFD700" />
        </TouchableOpacity>
      </View>

      {/* Messages */}
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <ChatMessage message={item} />}
        contentContainerStyle={styles.messageList}
        ListEmptyComponent={
          isInitialGreeting ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#8b5cf6" />
              <Text style={styles.loadingText}>Connecting with the stars...</Text>
            </View>
          ) : null
        }
      />

      {/* Loading indicator for new messages */}
      {isLoading && (
        <View style={styles.typingIndicator}>
          <Text style={styles.typingText}>Devi is typing</Text>
          <View style={styles.dotContainer}>
            <View style={[styles.dot, styles.dot1]} />
            <View style={[styles.dot, styles.dot2]} />
            <View style={[styles.dot, styles.dot3]} />
          </View>
        </View>
      )}

      {/* Input area */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <ChatInput 
          onSend={handleSendMessage} 
          isLoading={isLoading}
          disabled={isInitialGreeting}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#220038',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(139, 92, 246, 0.3)',
    backgroundColor: 'rgba(34, 0, 56, 0.9)',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFD700',
  },
  historyButton: {
    padding: 8,
  },
  messageList: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  loadingText: {
    marginTop: 16,
    color: '#cccccc',
    fontSize: 16,
  },
  typingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 24,
    marginBottom: 8,
  },
  typingText: {
    color: '#cccccc',
    marginRight: 8,
  },
  dotContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FFD700',
    marginHorizontal: 2,
    opacity: 0.7,
  },
  dot1: {
    animationName: 'bounce',
    animationDuration: '0.6s',
    animationIterationCount: 'infinite',
  },
  dot2: {
    animationName: 'bounce',
    animationDuration: '0.6s',
    animationDelay: '0.2s',
    animationIterationCount: 'infinite',
  },
  dot3: {
    animationName: 'bounce',
    animationDuration: '0.6s',
    animationDelay: '0.4s',
    animationIterationCount: 'infinite',
  },
});

export default ChatScreen;