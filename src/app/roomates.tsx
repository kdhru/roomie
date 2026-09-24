import { useEffect, useMemo, useState } from 'react'
import { FlatList, View, Text, TextInput, Pressable, StyleSheet, ActivityIndicator, useWindowDimensions } from 'react-native'
import { Link } from 'expo-router'
import { supabase } from '../../lib/supabase'
import { colors, Chip } from '../../lib/ui'
import { compatibility, Prefs } from '../../lib/match'

const GROUPS: { key: keyof Prefs; label: string; options: string[] }[] = [
  { key: 'shift', label: 'Work shift', options: ['Morning', 'Evening', 'Night'] },
  { key: 'bedtime', label: 'Bedtime', options: ['9 PM', '10 PM', '11 PM', '12 AM', '1 AM'] },
  { key: 'cleanliness', label: 'Cleanliness', options: ['Organised', 'Messy', 'Both'] },
  { key: 'diet', label: 'Food', options: ['Vegetarian', 'Non-Vegetarian', 'Jain', 'Vegan', 'No Restrictions'] },
  { key: 'habits', label: 'Smoking or drinking', options: ['Non-Smoker/Non-Drinker', 'Smoker', 'Drinker', 'Both', "Okay with Roommate's Habits"] },
]

const initials = (n: string) => n.split(' ').map((w) => w[0]).slice(0, 2).join('')
const tone = (s: number | null) => (s === null ? colors.muted : s >= 80 ? colors.teal : s >= 55 ? '#B7791F' : colors.muted)

export default function Roommates() {
  const { width } = useWindowDimensions()
  const cols = width >= 1000 ? 3 : width >= 640 ? 2 : 1
  const [rows, setRows] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [signedIn, setSignedIn] = useState(true)
  const [me, setMe] = useState<Prefs>({})
  const [q, setQ] = useState('')
  const [shown, setShown] = useState(30)

  useEffect(() => {
    (async () => {
      const { data: s } = await supabase.auth.getSession()
      setSignedIn(!!s.session)
      if (s.session) {
        const { data } = await supabase.from('flatmate_seekers').select('*').limit(1000)
        setRows(data ?? [])
      }
      setLoading(false)
    })()
  }, [])

  const list = useMemo(() => {
    const term = q.trim().toLowerCase()
    return rows
      .filter((r) => !term || `${r.user_name} ${r.profession}`.toLowerCase().includes(term))
      .map((r) => ({ ...r, ...compatibility(me, r) }))
      .sort((a, b) => (b.score ?? 0) - (a.score ?? 0))
  }, [rows, me, q])

  const hasPrefs = Object.values(me).some(Boolean)
  const set = (k: keyof Prefs, v: string) => { setMe({ ...me, [k]: me[k] === v ? undefined : v }); setShown(30) }

  const header = (
    <View style={s.head}>
      <Text style={s.h1}>Find flatmates who live like you</Text>
      <TextInput style={s.input} placeholder="Search by name or profession" value={q} onChangeText={setQ} />
      <View style={s.panel}>
        <Text style={s.panelTitle}>Your lifestyle {hasPrefs ? '' : '(pick what matters to you to see match scores)'}</Text>
        {GROUPS.map((g) => (
          <View key={g.key} style={s.group}>
            <Text style={s.label}>{g.label}</Text>
            <View style={s.row}>{g.options.map((o) => <Chip key={o} label={o} active={me[g.key] === o} onPress={() => set(g.key, o)} />)}</View>
          </View>
        ))}
      </View>
      <Text style={s.count}>{list.length} people{hasPrefs ? ', best matches first' : ''}</Text>
    </View>
  )

  if (!loading && !signedIn) {
    return (
      <View style={s.center}>
        <Text style={s.h1}>Sign in to see roommates</Text>
        <Link href="/sign-in" style={s.link}>Sign in or create an account</Link>
      </View>
    )
  }

  return (
    <FlatList
      key={cols}
      numColumns={cols}
      style={{ backgroundColor: colors.bg }}
      contentContainerStyle={s.list}
      data={list.slice(0, shown)}
      keyExtractor={(r) => r.id}
      ListHeaderComponent={header}
      ListEmptyComponent={loading ? <ActivityIndicator style={{ marginTop: 40 }} /> : <Text style={s.empty}>No one matches that search. Clear it to see everyone.</Text>}
      ListFooterComponent={list.length > shown ? <Pressable style={s.more} onPress={() => setShown(shown + 30)}><Text style={s.moreText}>Show more people</Text></Pressable> : null}
      renderItem={({ item: p }) => {
        const tag = (k: string, text: string) => <Text key={k} style={[s.tag, (p.hits[k] ?? 0) >= 0.8 && s.tagHit]}>{(p.hits[k] ?? 0) >= 0.8 ? '✓ ' : ''}{text}</Text>
        return (
          <View style={{ width: `${100 / cols}%`, padding: 8 }}>
            <View style={s.card}>
              <View style={s.cardTop}>
                <View style={s.avatar}><Text style={s.avatarText}>{initials(p.user_name)}</Text></View>
                <View style={{ flex: 1 }}>
                  <Text style={s.name}>{p.user_name}</Text>
                  <Text style={s.meta}>{p.profession}, {p.personality}</Text>
                </View>
                {p.score !== null && <Text style={[s.score, { color: tone(p.score) }]}>{p.score}% match</Text>}
              </View>
              {p.score !== null && <View style={s.bar}><View style={[s.barFill, { width: `${p.score}%`, backgroundColor: tone(p.score) }]} /></View>}
              <View style={s.row}>
                {tag('shift', `${p.work_shift} shift`)}
                {tag('bedtime', `Sleeps ${p.bedtime}, up ${p.wake_time}`)}
                {tag('cleanliness', p.cleanliness)}
                {tag('diet', p.dietary_restrictions)}
                {tag('habits', p.smoking_drinking)}
              </View>
              <Text style={s.meta}>Wants: {p.room_type_preference}. Pets: {p.pets}</Text>
            </View>
          </View>
        )
      }}
    />
  )
}

const s = StyleSheet.create({
  list: { padding: 12, maxWidth: 1200, width: '100%', alignSelf: 'center' },
  head: { padding: 8 },
  h1: { fontSize: 24, fontWeight: '700', color: colors.ink, marginBottom: 12 },
  input: { backgroundColor: '#fff', borderWidth: 1, borderColor: colors.line, borderRadius: 24, paddingHorizontal: 18, paddingVertical: 12, fontSize: 16, marginBottom: 12 },
  panel: { backgroundColor: '#fff', borderWidth: 1, borderColor: colors.line, borderRadius: 14, padding: 16 },
  panelTitle: { fontWeight: '700', color: colors.ink, marginBottom: 8 },
  group: { marginTop: 6 },
  label: { color: colors.muted, fontSize: 13, marginBottom: 6 },
  row: { flexDirection: 'row', flexWrap: 'wrap' },
  count: { color: colors.muted, marginTop: 14 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg, padding: 24 },
  link: { color: colors.teal, fontWeight: '700', fontSize: 16 },
  card: { backgroundColor: '#fff', borderRadius: 14, borderWidth: 1, borderColor: colors.line, padding: 16, flex: 1 },
  cardTop: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.tealSoft, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: colors.teal, fontWeight: '700' },
  name: { fontSize: 16, fontWeight: '700', color: colors.ink },
  meta: { color: colors.muted, fontSize: 13, marginTop: 2 },
  score: { fontWeight: '700', fontSize: 15 },
  bar: { height: 6, borderRadius: 3, backgroundColor: colors.bg, marginBottom: 12, overflow: 'hidden' },
  barFill: { height: 6, borderRadius: 3 },
  tag: { fontSize: 12, color: colors.ink, backgroundColor: colors.bg, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, marginRight: 6, marginBottom: 6, overflow: 'hidden' },
  tagHit: { backgroundColor: colors.tealSoft, color: colors.teal, fontWeight: '600' },
  empty: { textAlign: 'center', color: colors.muted, marginTop: 40 },
  more: { alignSelf: 'center', margin: 20, paddingHorizontal: 20, paddingVertical: 12, borderRadius: 10, borderWidth: 1, borderColor: colors.teal },
  moreText: { color: colors.teal, fontWeight: '700' },
})