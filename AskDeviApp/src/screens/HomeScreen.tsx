import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView } from "react-native"
import Icon from "react-native-vector-icons/Ionicons"
import { useNavigation } from "@react-navigation/native"

const HomeScreen = () => {
  const navigation = useNavigation()

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Ask Devi</Text>
        <TouchableOpacity 
          style={styles.walletButton} 
          onPress={() => navigation.navigate("Wallet" as never)}
        >
          <Icon name="wallet-outline" size={24} color="#FFD700" />
          <Text style={styles.footerButtonText}>Wallet</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {/* Your existing home screen content */}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity 
          style={styles.footerButton} 
          onPress={() => navigation.navigate("Home" as never)}
        >
          <Icon name="home" size={24} color="#FFD700" />
          <Text style={styles.footerButtonText}>Home</Text>
        </TouchableOpacity>
        
        {/* <TouchableOpacity 
          style={styles.footerButton} 
          onPress={() => navigation.navigate("Wallet" as never)}
        >
          <Icon name="wallet-outline" size={24} color="#FFD700" />
          <Text style={styles.footerButtonText}>Wallet</Text>
        </TouchableOpacity> */}

        <TouchableOpacity 
          style={styles.footerButton} 
          onPress={() => navigation.navigate("Chat" as never)}
        >
          <Icon name="chatbubble-ellipses" size={24} color="#d1d5db" />
          <Text style={styles.footerButtonText}>Chat</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.footerButton} 
          onPress={() => navigation.navigate("Profile" as never)}
        >
          <Icon name="person" size={24} color="#d1d5db" />
          <Text style={styles.footerButtonText}>Profile</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#220038",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(139, 92, 246, 0.3)",
    backgroundColor: "rgba(34, 0, 56, 0.9)",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FFD700",
  },
  walletButton: {
    padding: 8,
  },
  content: {
    flex: 1,
  },
  footer: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: "rgba(139, 92, 246, 0.3)",
    backgroundColor: "rgba(34, 0, 56, 0.9)",
  },
  footerButton: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 10,
  },
  footerButtonText: {
    color: "#d1d5db",
    marginTop: 4,
    fontSize: 12,
  },
})

export default HomeScreen