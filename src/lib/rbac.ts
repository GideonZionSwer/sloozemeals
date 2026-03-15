type Role = 'ADMIN' | 'MANAGER' | 'MEMBER'

type Action =
  | 'VIEW_RESTAURANTS'
  | 'CREATE_ORDER'
  | 'PLACE_ORDER'
  | 'CANCEL_ORDER'
  | 'MANAGE_PAYMENT'

const PERMISSIONS: Record<Action, Role[]> = {
  VIEW_RESTAURANTS: ['ADMIN', 'MANAGER', 'MEMBER'],
  CREATE_ORDER: ['ADMIN', 'MANAGER', 'MEMBER'],
  PLACE_ORDER: ['ADMIN', 'MANAGER'],
  CANCEL_ORDER: ['ADMIN', 'MANAGER'],
  MANAGE_PAYMENT: ['ADMIN'],
}

export function can(role: Role, action: Action): boolean {
  return PERMISSIONS[action].includes(role)
}

export function canAccessCountry(
  userRole: Role,
  userCountry: string,
  targetCountry: string
): boolean {
  if (userRole === 'ADMIN') return true
  return userCountry === targetCountry
}