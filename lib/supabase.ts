import 'react-native-url-polyfill/auto'
import { Platform } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { createClient } from '@supabase/supabase-js'

// During web server rendering there is no browser, so skip storage there
const isServer = Platform.OS === 'web' && typeof window === 'undefined'

export const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL!,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      storage: isServer ? undefined : AsyncStorage,
      persistSession: !isServer,
      autoRefreshToken: !isServer,
      detectSessionInUrl: false,
    },
  }
)