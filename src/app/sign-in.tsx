import { useState } from 'react'
import { View, Text, TextInput, Pressable, StyleSheet } from 'react-native'
import { useRouter } from 'expo-router'
import { supabase } from '../../lib/supabase'
import { colors } from '../../lib/ui'

export default function SignIn() {
  const router = useRouter()
  const [mode, setMode] = useState<'in' | 'up'>('in')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit() {
    setBusy(true); setError('')
    const { error } = mode === 'in'
      ? await supabase.auth.signInWithPassword({ email, password })
      : await supabase.auth.signUp({ email, password })
    setBusy(false)
    if (error) return setError(error.message)
    router.replace('/')
  }

  return (
    <View style={s.wrap}>
      <Text style={s.h}>{mode === 'in' ? 'Welcome back' : 'Create your account'}</Text>
      <TextInput style={s.input} placeholder="Email" autoCapitalize="none" keyboardType="email-address" value={email} onChangeText={setEmail} />
      <TextInput style={s.input} placeholder="Password (6+ characters)" secureTextEntry value={password} onChangeText={setPassword} />
      {!!error && <Text style={s.err}>{error}</Text>}
      <Pressable style={s.btn} onPress={submit} disabled={busy}>
        <Text style={s.btnText}>{busy ? 'Please wait…' : mode === 'in' ? 'Sign in' : 'Sign up'}</Text>
      </Pressable>
      <Pressable onPress={() => setMode(mode === 'in' ? 'up' : 'in')}>
        <Text style={s.link}>{mode === 'in' ? 'New here? Create an account' : 'Have an account? Sign in'}</Text>
      </Pressable>
    </View>
  )
}

const s = StyleSheet.create({
  wrap: { flex: 1, padding: 24, backgroundColor: colors.bg, maxWidth: 480, width: '100%', alignSelf: 'center' },
  h: { fontSize: 24, fontWeight: '700', color: colors.ink, marginBottom: 20 },
  input: { backgroundColor: '#fff', borderWidth: 1, borderColor: colors.line, borderRadius: 10, padding: 12, marginBottom: 12, fontSize: 16 },
  err: { color: '#B42318', marginBottom: 12 },
  btn: { backgroundColor: colors.teal, borderRadius: 10, padding: 14, alignItems: 'center', marginBottom: 16 },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  link: { color: colors.teal, textAlign: 'center' },
})