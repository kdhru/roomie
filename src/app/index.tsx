import { useCallback, useEffect, useState } from 'react'
import { FlatList, View, Text, TextInput, Pressable, StyleSheet, ActivityIndicator } from 'react-native'
import { Link } from 'expo-router'
import { supabase } from '../../lib/supabase'
import { colors, Chip } from '../../lib/ui'

const URGENCY: Record<string, string> = { asap: 'Needed this week', this_month: 'Needed this month', no_rush: 'No rush' }

export default function Browse() {
  const [rows, setRows] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [maxRent, setMaxRent] = useState('')
  const [gender, setGender] = useState('')
  const [ptype, setPtype] = useState('')
  const [urgency, setUrgency] = useState('')
  const [verifiedOnly, setVerifiedOnly] = useState(false)
  const [sort, setSort] = useState<'new' | 'low' | 'high'>('new')
  const [signedIn, setSignedIn] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSignedIn(!!data.session))
    const { data: sub } = supabase.auth.onAuthStateChange((_e, sess) => setSignedIn(!!sess))
    return () => sub.subscription.unsubscribe()
  }, [])

  const load = useCallback(async () => {
    setLoading(true)
    let q = supabase
      .from('listings')
      .select(verifiedOnly ? '*, profiles!inner(full_name, verified)' : '*, profiles(full_name, verified)')
      .eq('active', true)
    if (verifiedOnly) q = q.eq('profiles.verified', true)
    if (Number(maxRent)) q = q.lte('rent', Number(maxRent))
    if (gender) q = q.in('gender_pref', ['any', gender])
    if (ptype) q = q.eq('property_type', ptype)
    if (urgency) q = q.eq('urgency', urgency)
    q = sort === 'new' ? q.order('created_at', { ascending: false }) : q.order('rent', { ascending: sort === 'low' })
    const { data } = await q
    setRows(data ?? [])
    setLoading(false)
  }, [maxRent, gender, ptype, urgency, verifiedOnly, sort])

  useEffect(() => { load() }, [load])

  const toggle = (cur: string, v: string, set: (x: string) => void) => set(cur === v ? '' : v)

  const header = (
    <View style={s.filters}>
      <View style={s.topRow}>
        <Link href="/post-room" asChild><Pressable style={s.post}><Text style={s.postText}>Post a room, free</Text></Pressable></Link>
        {signedIn
          ? <Pressable onPress={() => supabase.auth.signOut()}><Text style={s.link}>Sign out</Text></Pressable>
          : <Link href="/sign-in" style={s.link}>Sign in</Link>}
      </View>
      <TextInput style={s.input} placeholder="Max rent per month (₹)" keyboardType="numeric" value={maxRent} onChangeText={setMaxRent} />
      <View style={s.row}>
        {[['male', 'Male'], ['female', 'Female']].map(([v, l]) => <Chip key={v} label={l} active={gender === v} onPress={() => toggle(gender, v, setGender)} />)}
        {[['flat', 'Flat'], ['pg', 'PG'], ['house', 'House']].map(([v, l]) => <Chip key={v} label={l} active={ptype === v} onPress={() => toggle(ptype, v, setPtype)} />)}
        {Object.entries(URGENCY).map(([v, l]) => <Chip key={v} label={l} active={urgency === v} onPress={() => toggle(urgency, v, setUrgency)} />)}
        <Chip label="Verified only" active={verifiedOnly} onPress={() => setVerifiedOnly(!verifiedOnly)} />
      </View>
      <View style={s.row}>
        {[['new', 'Newest'], ['low', 'Rent: low to high'], ['high', 'Rent: high to low']].map(([v, l]) => <Chip key={v} label={l} active={sort === v} onPress={() => setSort(v as any)} />)}
      </View>
    </View>
  )

  return (
    <FlatList
      style={{ backgroundColor: colors.bg }}
      contentContainerStyle={s.list}
      data={rows}
      keyExtractor={(r) => r.id}
      ListHeaderComponent={header}
      ListEmptyComponent={loading ? <ActivityIndicator style={{ marginTop: 40 }} /> : <Text style={s.empty}>No rooms match these filters. Clear a filter or post the first room in this area.</Text>}
      renderItem={({ item }) => (
        <View style={s.card}>
          <Text style={s.title}>{item.title}</Text>
          <Text style={s.meta}>{item.area}, {item.city}</Text>
          <Text style={s.rent}>₹{item.rent.toLocaleString('en-IN')} <Text style={s.meta}>per month</Text></Text>
          <View style={s.row}>
            <Text style={s.tag}>{item.property_type.toUpperCase()}</Text>
            <Text style={[s.tag, item.urgency === 'asap' && s.tagUrgent]}>{URGENCY[item.urgency]}</Text>
            {item.profiles?.verified && <Text style={[s.tag, s.tagVerified]}>Verified</Text>}
          </View>
        </View>
      )}
    />
  )
}

const s = StyleSheet.create({
  list: { padding: 16, maxWidth: 720, width: '100%', alignSelf: 'center' },
  filters: { marginBottom: 8 },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  post: { backgroundColor: colors.teal, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 10 },
  postText: { color: '#fff', fontWeight: '700' },
  link: { color: colors.teal, fontWeight: '600' },
  input: { backgroundColor: '#fff', borderWidth: 1, borderColor: colors.line, borderRadius: 10, padding: 12, marginBottom: 10, fontSize: 16 },
  row: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 2 },
  card: { backgroundColor: '#fff', borderRadius: 12, borderWidth: 1, borderColor: colors.line, padding: 16, marginBottom: 12 },
  title: { fontSize: 17, fontWeight: '700', color: colors.ink },
  meta: { color: colors.muted, fontSize: 14, fontWeight: '400' },
  rent: { fontSize: 20, fontWeight: '700', color: colors.ink, marginVertical: 6 },
  tag: { fontSize: 12, color: colors.ink, backgroundColor: colors.bg, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, marginRight: 6, marginTop: 4, overflow: 'hidden' },
  tagUrgent: { backgroundColor: '#FDEBC8' },
  tagVerified: { backgroundColor: colors.tealSoft, color: colors.teal, fontWeight: '700' },
  empty: { textAlign: 'center', color: colors.muted, marginTop: 40 },
})