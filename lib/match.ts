export type Prefs = { shift?: string; bedtime?: string; cleanliness?: string; diet?: string; habits?: string }

const HOUR: Record<string, number> = { '9 PM': 21, '10 PM': 22, '11 PM': 23, '12 AM': 24, '1 AM': 25 }
const VEG = ['Vegetarian', 'Jain', 'Vegan']
const WEIGHT = { shift: 20, bedtime: 20, cleanliness: 20, diet: 25, habits: 15 }

// Each function returns 0 to 1: how well two people fit on that point
const fit = {
  shift: (a: string, b: string) => (a === b ? 1 : 0),
  bedtime: (a: string, b: string) => {
    const d = Math.abs((HOUR[a] ?? 23) - (HOUR[b] ?? 23))
    return d === 0 ? 1 : d === 1 ? 0.6 : d === 2 ? 0.2 : 0
  },
  cleanliness: (a: string, b: string) => (a === b ? 1 : a === 'Both' || b === 'Both' ? 0.6 : 0),
  diet: (a: string, b: string) => {
    if (a === b) return 1
    if (a === 'No Restrictions' || b === 'No Restrictions') return 0.8
    return VEG.includes(a) && VEG.includes(b) ? 0.5 : 0
  },
  habits: (a: string, b: string) => {
    const ok = "Okay with Roommate's Habits", clean = 'Non-Smoker/Non-Drinker'
    if (a === b) return 1
    if (a === ok || b === ok) return 0.8
    if (a === clean || b === clean) return 0
    return a === 'Both' || b === 'Both' ? 0.7 : 0.5
  },
}

export function compatibility(me: Prefs, p: any) {
  const other: Prefs = { shift: p.work_shift, bedtime: p.bedtime, cleanliness: p.cleanliness, diet: p.dietary_restrictions, habits: p.smoking_drinking }
  let got = 0, max = 0
  const hits: Record<string, number> = {}
  for (const k of Object.keys(WEIGHT) as (keyof Prefs)[]) {
    if (!me[k]) continue
    const f = fit[k](me[k]!, other[k]!)
    hits[k] = f
    got += WEIGHT[k] * f
    max += WEIGHT[k]
  }
  return { score: max ? Math.round((got / max) * 100) : null, hits }
}