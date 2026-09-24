import { Stack } from 'expo-router'
import { colors } from '../../lib/ui'
import TopNav from '../../lib/TopNav'

export default function Layout() {
  return (
    <Stack screenOptions={{ headerStyle: { backgroundColor: colors.ink }, headerTintColor: '#fff' }}>
      <Stack.Screen name="index" options={{ headerTitle: () => <TopNav /> }} />
      <Stack.Screen name="roommates" options={{ headerTitle: () => <TopNav /> }} />
      <Stack.Screen name="sign-in" options={{ title: 'Sign in' }} />
      <Stack.Screen name="post-room" options={{ title: 'Post a room' }} />
    </Stack>
  )
}