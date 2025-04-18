import { View, Text, StyleSheet } from "react-native"
import { Svg, Circle, G } from "react-native-svg"

interface WalletTokenDisplayProps {
  value: number
}

const WalletTokenDisplay = ({ value }: WalletTokenDisplayProps) => {
  return (
    <View style={styles.container}>
      <View style={styles.tokenDisplay}>
        <Svg height="120" width="120" viewBox="0 0 100 100">
          {/* Orbital Ring */}
          <Circle cx="50" cy="50" r="40" stroke="#FFD700" strokeWidth="1" strokeDasharray="5,5" fill="transparent" />

          {/* Glowing Orbs */}
          <G>
            <Circle cx="50" cy="10" r="3" fill="#FFD700" />
            <Circle cx="85" cy="50" r="3" fill="#FFD700" />
            <Circle cx="50" cy="90" r="3" fill="#FFD700" />
          </G>
        </Svg>
        <View style={styles.valueContainer}>
          <Text style={styles.value}>{value}</Text>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
  },
  tokenDisplay: {
    width: 120,
    height: 120,
    borderRadius: 12,
    backgroundColor: "rgba(139, 92, 246, 0.2)",
    borderWidth: 1,
    borderColor: "rgba(139, 92, 246, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  valueContainer: {
    position: "absolute",
    justifyContent: "center",
    alignItems: "center",
  },
  value: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#FFD700",
  },
})

export default WalletTokenDisplay