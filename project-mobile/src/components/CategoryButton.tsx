import React from 'react'
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native'

interface Props {
  icon: any
  label: string
  onPress: () => void
}

export const CategoryButton: React.FC<Props> = ({ icon, label, onPress }) => (
  <TouchableOpacity style={styles.container} onPress={onPress}>
    <Image source={icon} style={styles.icon} />
    <Text style={styles.label}>{label}</Text>
  </TouchableOpacity>
)

const styles = StyleSheet.create({
  container: {
    width: 80,
    alignItems: 'center',
    marginHorizontal: 8,
  },
  icon: { width: 48, height: 48, marginBottom: 4, resizeMode: 'contain' },
  label: { fontSize: 12, textAlign: 'center' },
})
