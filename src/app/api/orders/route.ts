import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'
import { can } from '@/lib/rbac'

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('token')?.value
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const payload = await verifyToken(token)
    if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const orders = await prisma.order.findMany({
      where: { userId: payload.id as string },
      include: {
        items: { include: { menuItem: true } },
        payment: true
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(orders)
  } catch {
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get('token')?.value
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const payload = await verifyToken(token)
    if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    if (!can(payload.role as 'ADMIN' | 'MANAGER' | 'MEMBER', 'PLACE_ORDER')) {
      return NextResponse.json({ error: 'Permission denied' }, { status: 403 })
    }

    const { items, total, paymentMethod } = await req.json()

    const order = await prisma.order.create({
      data: {
        userId: payload.id as string,
        total,
        status: 'CONFIRMED',
        items: {
          create: items.map((item: { menuItemId: string; quantity: number; price: number }) => ({
            menuItemId: item.menuItemId,
            quantity: item.quantity,
            price: item.price,
          }))
        },
        payment: {
          create: {
            method: paymentMethod,
            status: 'COMPLETED'
          }
        }
      },
      include: { items: true, payment: true }
    })

    return NextResponse.json(order)
  } catch {
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const token = req.cookies.get('token')?.value
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const payload = await verifyToken(token)
    if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    if (!can(payload.role as 'ADMIN' | 'MANAGER' | 'MEMBER', 'CANCEL_ORDER')) {
      return NextResponse.json({ error: 'Permission denied' }, { status: 403 })
    }

    const { orderId } = await req.json()

    const order = await prisma.order.update({
      where: { id: orderId },
      data: { status: 'CANCELLED' }
    })

    return NextResponse.json(order)
  } catch {
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}