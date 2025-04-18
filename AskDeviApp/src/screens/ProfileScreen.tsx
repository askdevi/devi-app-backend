"use client"

import { useState, useEffect } from "react"
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  SafeAreaView,
} from "react-native"
import { Picker } from "@react-native-picker/picker"
import DateTimePicker from "@react-native-community/datetimepicker"
import Icon from "react-native-vector-icons/Ionicons"
import auth from "@react-native-firebase/auth"
import firestore from "@react-native-firebase/firestore"


interface Location {
  name: string
  latitude: number
  longitude: number
}

const ProfileScreen = ({ navigation }) => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phoneNumber: "",
    birthDate: "",
    birthTime: "",
    relationshipStatus: "",
    occupation: "",
    gender: "",
    preferredLanguage: "",
  })

  const [location, setLocation] = useState<Location | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [showTimePicker, setShowTimePicker] = useState(false)
  const [locationModalVisible, setLocationModalVisible] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState([])

  // Format date for display
  const formatDate = (dateString: string) => {
    if (!dateString) return ""
    const date = new Date(dateString)
    return date.toLocaleDateString()
  }

  // Format time for display
  const formatTime = (timeString: string) => {
    if (!timeString) return ""
    const [hours, minutes] = timeString.split(":")
    const date = new Date()
    date.setHours(Number.parseInt(hours, 10))
    date.setMinutes(Number.parseInt(minutes, 10))
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  // Fetch user data on component mount
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const user = auth().currentUser
        if (!user) {
          navigation.navigate("Login")
          return
        }

        const userDoc = await firestore().collection("users").doc(user.uid).get()

        if (!userDoc.exists) {
          navigation.navigate("Login")
          return
        }

        const userData = userDoc.data()

        setFormData({
          firstName: userData?.firstName || "",
          lastName: userData?.lastName || "",
          phoneNumber: userData?.phoneNumber || "",
          birthDate: userData?.birthDate || "",
          birthTime: userData?.birthTime || "",
          relationshipStatus: userData?.relationshipStatus || "",
          occupation: userData?.occupation || "",
          gender: userData?.gender || "",
          preferredLanguage: userData?.preferredLanguage || "",
        })

        if (userData?.birthPlace) {
          setLocation(userData.birthPlace)
        }
      } catch (err) {
        console.error("Error fetching user data:", err)
        setError("Error fetching user data. Please try again.")
      } finally {
        setLoading(false)
      }
    }

    fetchUserData()
  }, [navigation])

  // Handle date change
  const onDateChange = (event, selectedDate) => {
    setShowDatePicker(false)
    if (selectedDate) {
      const formattedDate = selectedDate.toISOString().split("T")[0]
      setFormData((prev) => ({ ...prev, birthDate: formattedDate }))
    }
  }

  // Handle time change
  const onTimeChange = (event, selectedTime) => {
    setShowTimePicker(false)
    if (selectedTime) {
      const hours = selectedTime.getHours().toString().padStart(2, "0")
      const minutes = selectedTime.getMinutes().toString().padStart(2, "0")
      setFormData((prev) => ({ ...prev, birthTime: `${hours}:${minutes}` }))
    }
  }

  // Mock function for location search
  // In a real app, you would integrate with a location API like Google Places or Mapbox
  const searchLocations = (query: string) => {
    // Mock data - replace with actual API call
    const mockResults = [
      { id: "1", name: "New Delhi, India", latitude: 28.6139, longitude: 77.209 },
      { id: "2", name: "Mumbai, India", latitude: 19.076, longitude: 72.8777 },
      { id: "3", name: "Bangalore, India", latitude: 12.9716, longitude: 77.5946 },
      { id: "4", name: "Chennai, India", latitude: 13.0827, longitude: 80.2707 },
    ].filter((item) => item.name.toLowerCase().includes(query.toLowerCase()))

    setSearchResults(mockResults)
  }

  // Handle location selection
  const handleLocationSelect = (item) => {
    setLocation({
      name: item.name,
      latitude: item.latitude,
      longitude: item.longitude,
    })
    setLocationModalVisible(false)
  }

  // Handle form submission
  const handleSubmit = async () => {
    setError(null)
    setIsSubmitting(true)

    if (!location) {
      setError("Birth place is required")
      setIsSubmitting(false)
      return
    }

    const user = auth().currentUser
    if (!user) {
      setError("No authenticated user found")
      setIsSubmitting(false)
      return
    }

    try {
      // In a real app, you would call your birth chart API here
      // For now, we'll mock the response
      const birthChartDetails = {
        // Mock birth chart data
        ascendant: "Aries",
        planets: {
          sun: "Taurus",
          moon: "Gemini",
          // other planets...
        },
      }

      await firestore()
        .collection("users")
        .doc(user.uid)
        .update({
          ...formData,
          birthPlace: location,
          birthChart: birthChartDetails,
          updatedAt: firestore.FieldValue.serverTimestamp(),
        })

      Alert.alert("Success", "Your profile has been updated successfully!", [{ text: "OK" }])
    } catch (err) {
      console.error("Error updating user data:", err)
      setError("Error updating user data. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#8b5cf6" />
        <Text style={styles.loadingText}>Loading your profile...</Text>
      </View>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="#FFD700" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={styles.formContainer}>
          {/* Name Fields */}
          <View style={styles.row}>
            <View style={styles.halfField}>
              <Text style={styles.label}>First Name</Text>
              <TextInput
                style={styles.input}
                value={formData.firstName}
                onChangeText={(text) => setFormData((prev) => ({ ...prev, firstName: text }))}
                placeholder="First Name"
                placeholderTextColor="#9ca3af"
              />
            </View>
            <View style={styles.halfField}>
              <Text style={styles.label}>Last Name</Text>
              <TextInput
                style={styles.input}
                value={formData.lastName}
                onChangeText={(text) => setFormData((prev) => ({ ...prev, lastName: text }))}
                placeholder="Last Name"
                placeholderTextColor="#9ca3af"
              />
            </View>
          </View>

          {/* Phone Number */}
          <View style={styles.field}>
            <Text style={styles.label}>Phone Number</Text>
            <TextInput
              style={[styles.input, styles.disabledInput]}
              value={formData.phoneNumber}
              editable={false}
              placeholder="Phone Number"
              placeholderTextColor="#9ca3af"
            />
          </View>

          {/* Birth Date */}
          <View style={styles.row}>
            <View style={styles.halfField}>
              <Text style={styles.label}>Birth Date</Text>
              <TouchableOpacity style={styles.datePickerButton} onPress={() => setShowDatePicker(true)}>
                <Text style={styles.datePickerText}>
                  {formData.birthDate ? formatDate(formData.birthDate) : "Select Date"}
                </Text>
                <Icon name="calendar-outline" size={20} color="#FFD700" />
              </TouchableOpacity>
              {showDatePicker && (
                <DateTimePicker
                  value={formData.birthDate ? new Date(formData.birthDate) : new Date()}
                  mode="date"
                  display="default"
                  onChange={onDateChange}
                />
              )}
            </View>
            <View style={styles.halfField}>
              <Text style={styles.label}>Birth Time</Text>
              <TouchableOpacity style={styles.datePickerButton} onPress={() => setShowTimePicker(true)}>
                <Text style={styles.datePickerText}>
                  {formData.birthTime ? formatTime(formData.birthTime) : "Select Time"}
                </Text>
                <Icon name="time-outline" size={20} color="#FFD700" />
              </TouchableOpacity>
              {showTimePicker && (
                <DateTimePicker
                  value={(() => {
                    const date = new Date()
                    if (formData.birthTime) {
                      const [hours, minutes] = formData.birthTime.split(":")
                      date.setHours(Number.parseInt(hours, 10))
                      date.setMinutes(Number.parseInt(minutes, 10))
                    }
                    return date
                  })()}
                  mode="time"
                  display="default"
                  onChange={onTimeChange}
                />
              )}
            </View>
          </View>

          {/* Birth Place */}
          <View style={styles.field}>
            <Text style={styles.label}>Birth Place</Text>
            <TouchableOpacity
              style={styles.locationButton}
              onPress={() => {
                setLocationModalVisible(true)
                setSearchQuery("")
                searchLocations("")
              }}
            >
              <Text style={styles.locationText}>{location ? location.name : "Select Birth Place"}</Text>
              <Icon name="location-outline" size={20} color="#FFD700" />
            </TouchableOpacity>
          </View>

          {/* Location Modal */}
          {locationModalVisible && (
            <View style={styles.modalContainer}>
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Select Birth Place</Text>
                  <TouchableOpacity onPress={() => setLocationModalVisible(false)}>
                    <Icon name="close" size={24} color="#FFD700" />
                  </TouchableOpacity>
                </View>

                <TextInput
                  style={styles.searchInput}
                  value={searchQuery}
                  onChangeText={(text) => {
                    setSearchQuery(text)
                    searchLocations(text)
                  }}
                  placeholder="Search for a city..."
                  placeholderTextColor="#9ca3af"
                />

                <ScrollView style={styles.searchResults}>
                  {searchResults.map((item) => (
                    <TouchableOpacity
                      key={item.id}
                      style={styles.searchResultItem}
                      onPress={() => handleLocationSelect(item)}
                    >
                      <Text style={styles.searchResultText}>{item.name}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </View>
          )}

          {/* Relationship Status */}
          <View style={styles.field}>
            <Text style={styles.label}>Relationship Status</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={formData.relationshipStatus}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, relationshipStatus: value }))}
                style={styles.picker}
                dropdownIconColor="#FFD700"
              >
                <Picker.Item label="Select status" value="" color="#9ca3af" />
                <Picker.Item label="Single" value="single" color="#ffffff" />
                <Picker.Item label="Dating" value="dating" color="#ffffff" />
                <Picker.Item label="Married" value="married" color="#ffffff" />
                <Picker.Item label="Other" value="other" color="#ffffff" />
              </Picker>
            </View>
          </View>

          {/* Occupation */}
          <View style={styles.field}>
            <Text style={styles.label}>Occupation</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={formData.occupation}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, occupation: value }))}
                style={styles.picker}
                dropdownIconColor="#FFD700"
              >
                <Picker.Item label="Select Occupation" value="" color="#9ca3af" />
                <Picker.Item label="Employed" value="employed" color="#ffffff" />
                <Picker.Item label="Self-Employed" value="self-employed" color="#ffffff" />
                <Picker.Item label="Homemaker" value="homemaker" color="#ffffff" />
                <Picker.Item label="Student" value="student" color="#ffffff" />
                <Picker.Item label="Other" value="other" color="#ffffff" />
              </Picker>
            </View>
          </View>

          {/* Gender */}
          <View style={styles.field}>
            <Text style={styles.label}>Gender</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={formData.gender}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, gender: value }))}
                style={styles.picker}
                dropdownIconColor="#FFD700"
              >
                <Picker.Item label="Select gender" value="" color="#9ca3af" />
                <Picker.Item label="Male" value="male" color="#ffffff" />
                <Picker.Item label="Female" value="female" color="#ffffff" />
                <Picker.Item label="Other" value="other" color="#ffffff" />
              </Picker>
            </View>
          </View>

          {/* Preferred Language */}
          <View style={styles.field}>
            <Text style={styles.label}>Preferred Language</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={formData.preferredLanguage}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, preferredLanguage: value }))}
                style={styles.picker}
                dropdownIconColor="#FFD700"
              >
                <Picker.Item label="Select Language" value="" color="#9ca3af" />
                <Picker.Item label="Hinglish" value="hinglish" color="#ffffff" />
                <Picker.Item label="English" value="english" color="#ffffff" />
              </Picker>
            </View>
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={[styles.submitButton, isSubmitting && styles.disabledButton]}
            onPress={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator size="small" color="#220038" />
            ) : (
              <Text style={styles.submitButtonText}>Update Your Data</Text>
            )}
          </TouchableOpacity>

          {/* Error Message */}
          {error && <Text style={styles.errorText}>{error}</Text>}
        </View>
      </ScrollView>
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
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFD700",
  },
  scrollView: {
    flex: 1,
  },
  formContainer: {
    padding: 16,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  field: {
    marginBottom: 16,
  },
  halfField: {
    width: "48%",
  },
  label: {
    fontSize: 14,
    marginBottom: 6,
    color: "#d1d5db",
  },
  input: {
    backgroundColor: "rgba(139, 92, 246, 0.2)",
    borderWidth: 1,
    borderColor: "rgba(139, 92, 246, 0.5)",
    borderRadius: 8,
    padding: 12,
    color: "#ffffff",
    fontSize: 16,
  },
  disabledInput: {
    opacity: 0.7,
  },
  datePickerButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "rgba(139, 92, 246, 0.2)",
    borderWidth: 1,
    borderColor: "rgba(139, 92, 246, 0.5)",
    borderRadius: 8,
    padding: 12,
  },
  datePickerText: {
    color: "#ffffff",
    fontSize: 16,
  },
  locationButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "rgba(139, 92, 246, 0.2)",
    borderWidth: 1,
    borderColor: "rgba(139, 92, 246, 0.5)",
    borderRadius: 8,
    padding: 12,
  },
  locationText: {
    color: "#ffffff",
    fontSize: 16,
  },
  pickerContainer: {
    backgroundColor: "rgba(139, 92, 246, 0.2)",
    borderWidth: 1,
    borderColor: "rgba(139, 92, 246, 0.5)",
    borderRadius: 8,
    overflow: "hidden",
  },
  picker: {
    color: "#ffffff",
    height: 50,
  },
  submitButton: {
    backgroundColor: "#FFD700",
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
    marginTop: 16,
  },
  disabledButton: {
    opacity: 0.7,
  },
  submitButtonText: {
    color: "#220038",
    fontSize: 16,
    fontWeight: "bold",
  },
  errorText: {
    color: "#ef4444",
    marginTop: 8,
    textAlign: "center",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#220038",
  },
  loadingText: {
    marginTop: 16,
    color: "#d1d5db",
    fontSize: 16,
  },
  modalContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  modalContent: {
    backgroundColor: "#2A0043",
    borderRadius: 12,
    width: "90%",
    maxHeight: "80%",
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(139, 92, 246, 0.5)",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFD700",
  },
  searchInput: {
    backgroundColor: "rgba(139, 92, 246, 0.2)",
    borderWidth: 1,
    borderColor: "rgba(139, 92, 246, 0.5)",
    borderRadius: 8,
    padding: 12,
    color: "#ffffff",
    fontSize: 16,
    marginBottom: 16,
  },
  searchResults: {
    maxHeight: 300,
  },
  searchResultItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(139, 92, 246, 0.3)",
  },
  searchResultText: {
    color: "#ffffff",
    fontSize: 16,
  },
})

export default ProfileScreen
