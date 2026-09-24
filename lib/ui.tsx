import { Pressable, Text, StyleSheet } from 'react-native'

export const colors = {
  ink: '#1F2A44', teal: '#0F766E', tealSoft: '#DDF1EE',
  marigold: '#F5A524', bg: '#F6F8FA', line: '#D9DFE7', muted: '#5B677A',
}

export function Chip({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={[s.chip, active && s.chipOn]}>
      <Text style={[s.chipText, active && s.chipTextOn]}>{label}</Text>
    </Pressable>
  )
}

const s = StyleSheet.create({
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: colors.line, backgroundColor: '#fff', marginRight: 8, marginBottom: 8 },
  chipOn: { backgroundColor: colors.teal, borderColor: colors.teal },
  chipText: { color: colors.ink, fontSize: 14 },
  chipTextOn: { color: '#fff', fontWeight: '600' },
})