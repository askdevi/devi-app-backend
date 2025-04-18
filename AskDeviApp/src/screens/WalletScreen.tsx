import React, { useState, useEffect } from "react"
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  SafeAreaView,
} from "react-native"
import Icon from "react-native-vector-icons/Ionicons"
import auth from "@react-native-firebase/auth"
import firestore from "@react-native-firebase/firestore"
import { useNavigation } from "@react-navigation/native"
import RazorpayCheckout from "react-native-razorpay"

const subscriptionPlans = [
  { name: "Celestial Explorer", questions: 10, price: 99 },
  { name: "Astral Voyager", questions: 25, price: 199 },
]

const timePlans = [
  { name: "Hourly Access", duration: "10 Minutes", price: 99 },
  { name: "Hourly Access", duration: "1 Hour", price: 199 },
  { name: "Daily Access", duration: "1 Day", price: 299 },
]

const WalletScreen = () => {
  const [walletTokens, setWalletTokens] = useState(0)
  const [remainingTime, setRemainingTime] = useState("0h 0m")
  const [loading, setLoading] = useState(true)
  const [isProcessing, setIsProcessing] = useState(false)
  const navigation = useNavigation()

  const fetchUserData = async () => {
    try {
      setLoading(true)
      const user = auth().currentUser
      
      if (!user) {
        Alert.alert("Not logged in", "Please log in to view your wallet.")
        navigation.navigate("Login")
        return
      }

      const userDoc = await firestore().collection("users").doc(user.uid).get()
      
      if (!userDoc.exists) {
        setWalletTokens(0)
        setRemainingTime("0h 0m")
        return
      }

      const userData = userDoc.data() || {}
      setWalletTokens(userData.tokens || 0)
      
      if (userData.timePackage?.expiresAt) {
        const expiresAt = userData.timePackage.expiresAt.toDate()
        const now = new Date()
        if (expiresAt > now) {
          const diffMs = expiresAt - now
          const hours = Math.floor(diffMs / (1000 * 60 * 60))
          const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))
          setRemainingTime(`${hours}h ${minutes}m`)
          return
        }
      }
      setRemainingTime("0h 0m")

    } catch (error) {
      console.error("Error fetching wallet data:", error)
      Alert.alert("Error", "Failed to fetch wallet data. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', fetchUserData)
    return unsubscribe
  }, [navigation])

  const handlePayment = async (amount: number, questions: number, duration?: string) => {
    try {
      setIsProcessing(true)
      const user = auth().currentUser
      if (!user) {
        Alert.alert("Error", "You must be logged in to make a purchase.")
        navigation.navigate("Login")
        return
      }

      // Create order via backend API
      const apiUrl = Platform.OS === "android" 
        ? "http://10.0.2.2:3000/api/create-order" 
        : "http://localhost:3000/api/create-order"
      
      const orderResponse = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${await user.getIdToken()}`,
        },
        body: JSON.stringify({ amount }),
      })

      if (!orderResponse.ok) throw new Error("Failed to create order")
      const orderData = await orderResponse.json()

      // Razorpay payment flow
      const options = {
        description: duration || `${questions} Questions`,
        image: "https://your-app-icon.png",
        currency: "INR",
        key: "rzp_live_C2QqZmPmv7QHJw",
        amount: amount * 100,
        name: "Ask Devi",
        order_id: orderData.orderId,
        prefill: { email: user.email || "", contact: user.phoneNumber || "" }
      }

      RazorpayCheckout.open(options).then(async (paymentData) => {
        // Update Firestore directly like ProfileScreen
        const batch = firestore().batch()
        const userRef = firestore().collection("users").doc(user.uid)
        
        if (questions > 0) {
          batch.update(userRef, {
            tokens: firestore.FieldValue.increment(questions)
          })
        } else if (duration) {
          const expiresAt = new Date()
          expiresAt.setMinutes(expiresAt.getMinutes() + (duration === "1 Day" ? 1440 : duration === "1 Hour" ? 60 : 10))
          
          batch.update(userRef, {
            timePackage: {
              name: duration,
              expiresAt: firestore.Timestamp.fromDate(expiresAt)
            }
          })
        }

        await batch.commit()
        fetchUserData()
        Alert.alert("Success", "Purchase completed successfully!")
      }).catch(error => {
        console.error("Payment failed:", error)
        Alert.alert("Payment Failed", error.description || "Payment could not be completed")
      })

    } catch (error) {
      console.error("Payment error:", error)
      Alert.alert("Error", "Failed to process payment. Please try again.")
    } finally {
      setIsProcessing(false)
    }
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#8b5cf6" />
        <Text style={styles.loadingText}>Loading wallet data...</Text>
      </View>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="#FFD700" />
        </TouchableOpacity>
        <Text style={styles.title}>Wallet</Text>
        <TouchableOpacity onPress={fetchUserData}>
          <Icon name="refresh" size={24} color="#FFD700" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Balance Cards */}
        <View style={styles.balanceContainer}>
          <View style={styles.balanceCard}>
            <Text style={styles.balanceTitle}>Available Tokens</Text>
            <Text style={styles.balanceValue}>{walletTokens}</Text>
          </View>
          <View style={styles.balanceCard}>
            <Text style={styles.balanceTitle}>Remaining Time</Text>
            <Text style={styles.balanceValue}>{remainingTime}</Text>
          </View>
        </View>

        {/* Time Packages */}
        <Text style={styles.sectionTitle}>Time Packages</Text>
        <View style={styles.packagesContainer}>
          {timePlans.map((plan, index) => (
            <View key={`time-${index}`} style={styles.packageCard}>
              <Text style={styles.packageTitle}>{plan.duration}</Text>
              <Text style={styles.packagePrice}>₹{plan.price}</Text>
              <TouchableOpacity 
                style={styles.buyButton}
                onPress={() => handlePayment(plan.price, 0, plan.duration)}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.buyButtonText}>BUY NOW</Text>
                )}
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {/* Question Packages */}
        <Text style={styles.sectionTitle}>Question Packages</Text>
        <View style={styles.packagesContainer}>
          {subscriptionPlans.map((plan, index) => (
            <View key={`question-${index}`} style={styles.packageCard}>
              <Text style={styles.packageTitle}>{plan.questions} Questions</Text>
              <Text style={styles.packagePrice}>₹{plan.price}</Text>
              <TouchableOpacity 
                style={styles.buyButton}
                onPress={() => handlePayment(plan.price, plan.questions)}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.buyButtonText}>BUY NOW</Text>
                )}
              </TouchableOpacity>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#220038',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFD700',
  },
  content: {
    padding: 16,
  },
  balanceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  balanceCard: {
    backgroundColor: 'rgba(139, 92, 246, 0.2)',
    borderRadius: 12,
    padding: 16,
    width: '48%',
    alignItems: 'center',
  },
  balanceTitle: {
    color: '#FFD700',
    fontSize: 16,
    marginBottom: 8,
  },
  balanceValue: {
    color: '#FFD700',
    fontSize: 24,
    fontWeight: 'bold',
  },
  sectionTitle: {
    color: '#FFD700',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  packagesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  packageCard: {
    backgroundColor: 'rgba(139, 92, 246, 0.2)',
    borderRadius: 12,
    padding: 16,
    width: '48%',
    marginBottom: 16,
    alignItems: 'center',
  },
  packageTitle: {
    color: '#FFD700',
    fontSize: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  packagePrice: {
    color: '#FFD700',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  buyButton: {
    backgroundColor: '#8b5cf6',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    width: '100%',
    alignItems: 'center',
  },
  buyButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#FFD700',
    marginTop: 16,
  },
})

export default WalletScreen
