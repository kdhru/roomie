import { useEffect, useState } from 'react'
import { ScrollView, View, Text, TextInput, Pressable, StyleSheet } from 'react-native'
import { useRouter } from 'expo-router'
import { supabase } from '../../lib/supabase'
import { colors, Chip } from '../../lib/ui'

export default function PostRoom() {
  const router = useRouter()
  const [userId, setUserId] = useState<string | null>(null)
  const [f, setF] = useState({ title: '', city: '', area: '', rent: '', description: '' })
  const [property_type, setType] = useState('flat')
  const [gender_pref, setGender] = useState('any')
  const [urgency, setUrgency] = useState('no_rush')
  const [posted_by, setPostedBy] = useState('tenant')
  const [error, setError] = useState('')

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) router.replace('/sign-in')
      else setUserId(data.session.user.id)
    })
  }, [])

  async function submit() {
    if (!f.title || !f.city || !f.area || !Number(f.rent)) return setError('Fill in title, city, area and monthly rent.')
    const { error } = await supabase.from('listings').insert({
      owner_id: userId, title: f.title, city: f.city, area: f.area, rent: Number(f.rent),
      description: f.description, property_type, gender_pref, urgency, posted_by,
    })
    if (error) return setError(error.message)
    router.replace('/')
  }

  const opts = (list: [string, string][], val: string, set: (v: string) => void) => (
    <View style={s.row}>{list.map(([v, l]) => <Chip key={v} label={l} active={val === v} onPress={() => set(v)} />)}</View>
  )

  return (
    <ScrollView contentContainerStyle={s.wrap}>
      <TextInput style={s.input} placeholder="Title (e.g. Room in 2BHK near metro)" value={f.title} onChangeText={(t) => setF({ ...f, title: t })} />
      <TextInput style={s.input} placeholder="City" value={f.city} onChangeText={(t) => setF({ ...f, city: t })} />
      <TextInput style={s.input} placeholder="Area (e.g. HSR Layout)" value={f.area} onChangeText={(t) => setF({ ...f, area: t })} />
      <TextInput style={s.input} placeholder="Monthly rent in ₹" keyboardType="numeric" value={f.rent} onChangeText={(t) => setF({ ...f, rent: t })} />
      <TextInput style={[s.input, { height: 90 }]} multiline placeholder="Describe the room and the flatmates" value={f.description} onChangeText={(t) => setF({ ...f, description: t })} />
      <Text style={s.label}>Property</Text>
      {opts([['flat', 'Flat'], ['pg', 'PG'], ['house', 'House']], property_type, setType)}
      <Text style={s.label}>Looking for</Text>
      {opts([['any', 'Anyone'], ['male', 'Male'], ['female', 'Female']], gender_pref, setGender)}
      <Text style={s.label}>How soon</Text>
      {opts([['asap', 'This week'], ['this_month', 'This month'], ['no_rush', 'No rush']], urgency, setUrgency)}
      <Text style={s.label}>You are</Text>
      {opts([['tenant', 'Tenant'], ['owner', 'Owner'], ['broker', 'Broker']], posted_by, setPostedBy)}
      {!!error && <Text style={s.err}>{error}</Text>}
      <Pressable style={s.btn} onPress={submit}><Text style={s.btnText}>Post room</Text></Pressable>
    </ScrollView>
  )
}

const s = StyleSheet.create({
  wrap: { padding: 20, backgroundColor: colors.bg, maxWidth: 560, width: '100%', alignSelf: 'center' },
  input: { backgroundColor: '#fff', borderWidth: 1, borderColor: colors.line, borderRadius: 10, padding: 12, marginBottom: 12, fontSize: 16 },
  label: { color: colors.muted, marginBottom: 6, marginTop: 4 },
  row: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 6 },
  err: { color: '#B42318', marginVertical: 8 },
  btn: { backgroundColor: colors.teal, borderRadius: 10, padding: 14, alignItems: 'center', marginTop: 12 },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
})