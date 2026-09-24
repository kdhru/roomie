import { View, StyleSheet } from 'react-native'
import { Link, usePathname } from 'expo-router'
import { colors } from './ui'

export default function TopNav() {
  const path = usePathname()
  return (
    <View style={s.row}>
      {[['/', 'Rooms'], ['/roommates', 'Roommates']].map(([href, label]) => (
        <Link key={href} href={href as any} style={[s.item, path === href && s.on]}>{label}</Link>
      ))}
    </View>
  )
}

const s = StyleSheet.create({
  row: { flexDirection: 'row', gap: 24 },
  item: { color: 'rgba(255,255,255,0.65)', fontSize: 16, fontWeight: '600', paddingVertical: 4, borderBottomWidth: 2, borderBottomColor: 'transparent' },
  on: { color: '#fff', borderBottomColor: colors.marigold },
})