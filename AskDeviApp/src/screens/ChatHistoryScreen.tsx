import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { db, auth } from '../lib/firebase';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';

interface ChatHistory {
  id: string;
  createdAt: string;
  lastUpdated: string;
  messages: Array<{
    content: string;
    role: 'user' | 'assistant';
  }>;
}

const ChatHistoryScreen = ({ navigation }) => {
  const [chats, setChats] = useState<ChatHistory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchChatHistory();
  }, []);

  const fetchChatHistory = async () => {
    try {
      const user = auth().currentUser;
      if (!user) {
        navigation.navigate('Login');
        return;
      }

      const chatsRef = collection(db, 'chats');
      const q = query(
        chatsRef, 
        where('userId', '==', user.uid),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      
      const chatHistories: ChatHistory[] = [];
      querySnapshot.forEach((doc) => {
        chatHistories.push({
          id: doc.id,
          ...doc.data(),
        } as ChatHistory);
      });
      
      setChats(chatHistories);
    } catch (error) {
      console.error('Error fetching chat history:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDateTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      if (isNaN(date.getTime())) {
        return 'Invalid date';
      }
      
      return date.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        hour12: true,
      });
    } catch (error) {
      return 'Invalid date';
    }
  };

  const getPreviewText = (messages: ChatHistory['messages']) => {
    if (!messages || messages.length === 0) return 'No messages';
    const lastMessage = messages[messages.length - 1];
    const preview = lastMessage.content.slice(0, 100);
    return preview.length < lastMessage.content.length 
      ? `${preview}...` 
      : preview;
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#8b5cf6" />
        <Text style={styles.loadingText}>Loading chat history...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#FFD700" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chat History</Text>
        <View style={{ width: 40 }} />
      </View>

      {chats.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No chat history found</Text>
          <TouchableOpacity 
            style={styles.newChatButton}
            onPress={() => navigation.navigate('Chat')}
          >
            <Text style={styles.newChatButtonText}>Start a new chat</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={chats}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          renderItem={({ item }) => (
            <TouchableOpacity 
              style={styles.chatItem}
              onPress={() => navigation.navigate('Chat')}
            >
              <Text style={styles.chatDate}>
                {formatDateTime(item.createdAt)}
              </Text>
              <Text style={styles.chatPreview}>
                {getPreviewText(item.messages)}
              </Text>
            </TouchableOpacity>
          )}
        />
      )}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#220038',
  },
  loadingText: {
    marginTop: 16,
    color: '#cccccc',
    fontSize: 16,
  },
  listContainer: {
    padding: 16,
  },
  chatItem: {
    backgroundColor: 'rgba(139, 92, 246, 0.2)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.3)',
  },
  chatDate: {
    color: '#FFD700',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  chatPreview: {
    color: '#ffffff',
    fontSize: 14,
    lineHeight: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyText: {
    color: '#cccccc',
    fontSize: 16,
    marginBottom: 24,
    textAlign: 'center',
  },
  newChatButton: {
    backgroundColor: '#8b5cf6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  newChatButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ChatHistoryScreen;