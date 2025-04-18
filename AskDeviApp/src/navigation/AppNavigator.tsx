import { createStackNavigator } from "@react-navigation/stack"
import HomeScreen from "../screens/HomeScreen"
import ChatScreen from "../screens/ChatScreen"
import ChatHistoryScreen from "../screens/ChatHistoryScreen"
import ProfileScreen from "../screens/ProfileScreen"
import LoginScreen from "../screens/LoginScreen"
import RegisterScreen from "../screens/RegisterScreen"
import WalletScreen from "../screens/WalletScreen"

const Stack = createStackNavigator()

const AppNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: "#220038" },
      }}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="Chat" component={ChatScreen} />
      <Stack.Screen name="ChatHistory" component={ChatHistoryScreen} />
      <Stack.Screen name="Profile" component={ProfileScreen} />
      <Stack.Screen name="Wallet" component={WalletScreen} />
    </Stack.Navigator>
  )
}

export default AppNavigator