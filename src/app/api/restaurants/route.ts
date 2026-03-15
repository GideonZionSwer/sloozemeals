import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'
import { canAccessCountry } from '@/lib/rbac'

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('token')?.value
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = await verifyToken(token)
    if (!payload) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const restaurants = await prisma.restaurant.findMany({
      include: { menuItems: true }
    })

    const filtered = restaurants.filter(r =>
      canAccessCountry(
        payload.role as 'ADMIN' | 'MANAGER' | 'MEMBER',
        payload.country as string,
        r.country
      )
    )

    return NextResponse.json(filtered)
  } catch (error) {
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}