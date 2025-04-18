import { View, Text, StyleSheet } from "react-native"
import { Svg, Line } from "react-native-svg"

interface WalletTimeDisplayProps {
  value: string
}

const WalletTimeDisplay = ({ value }: WalletTimeDisplayProps) => {
  return (
    <View style={styles.container}>
      <View style={styles.timeDisplay}>
        <Text style={styles.value}>{value}</Text>
        <Svg height="10" width="40" style={styles.line}>
          <Line x1="0" y1="5" x2="40" y2="5" stroke="#FFD700" strokeWidth="2" />
        </Svg>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
  },
  timeDisplay: {
    width: 120,
    height: 120,
    borderRadius: 12,
    backgroundColor: "rgba(139, 92, 246, 0.2)",
    borderWidth: 1,
    borderColor: "rgba(139, 92, 246, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  value: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFD700",
    textAlign: "center",
  },
  line: {
    marginTop: 8,
  },
})

export default WalletTimeDisplay