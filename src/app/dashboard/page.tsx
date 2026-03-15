'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface MenuItem {
  id: string
  name: string
  price: number
  description: string
}

interface Restaurant {
  id: string
  name: string
  cuisine: string
  country: string
  menuItems: MenuItem[]
}

interface CartItem {
  menuItemId: string
  name: string
  price: number
  quantity: number
  restaurantName: string
}

interface Order {
  id: string
  status: string
  total: number
  createdAt: string
  items: { menuItem: { name: string }; quantity: number; price: number }[]
  payment: { method: string } | null
}

interface User {
  id: string
  name: string
  email: string
  role: 'ADMIN' | 'MANAGER' | 'MEMBER'
  country: string
}

export default function Dashboard() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [restaurants, setRestaurants] = useState<Restaurant[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [cart, setCart] = useState<CartItem[]>([])
  const [activePage, setActivePage] = useState('restaurants')
  const [loading, setLoading] = useState(true)
  const [paymentMethod, setPaymentMethod] = useState('CREDIT_CARD')
  const [message, setMessage] = useState('')

  useEffect(() => {
    fetchUser()
    fetchRestaurants()
    fetchOrders()
  }, [])

  async function fetchUser() {
    const res = await fetch('/api/auth/me')
    if (res.ok) {
      const data = await res.json()
      setUser(data)
    } else {
      router.push('/')
    }
    setLoading(false)
  }

  async function fetchRestaurants() {
    const res = await fetch('/api/restaurants')
    if (res.ok) setRestaurants(await res.json())
  }

  async function fetchOrders() {
    const res = await fetch('/api/orders')
    if (res.ok) setOrders(await res.json())
  }

  function addToCart(item: MenuItem, restaurant: Restaurant) {
    setCart(prev => {
      const existing = prev.find(c => c.menuItemId === item.id)
      if (existing) {
        return prev.map(c => c.menuItemId === item.id ? { ...c, quantity: c.quantity + 1 } : c)
      }
      return [...prev, { menuItemId: item.id, name: item.name, price: item.price, quantity: 1, restaurantName: restaurant.name }]
    })
    setMessage('Added to cart!')
    setTimeout(() => setMessage(''), 2000)
  }

  function removeFromCart(menuItemId: string) {
    setCart(prev => prev.filter(c => c.menuItemId !== menuItemId))
  }

  async function placeOrder() {
    if (cart.length === 0) return
    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        items: cart.map(c => ({ menuItemId: c.menuItemId, quantity: c.quantity, price: c.price })),
        total,
        paymentMethod
      })
    })
    if (res.ok) {
      setCart([])
      setMessage('Order placed successfully!')
      fetchOrders()
      setActivePage('orders')
      setTimeout(() => setMessage(''), 3000)
    }
  }

  async function cancelOrder(orderId: string) {
    const res = await fetch('/api/orders', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId })
    })
    if (res.ok) {
      setMessage('Order cancelled!')
      fetchOrders()
      setTimeout(() => setMessage(''), 2000)
    }
  }

  async function logout() {
    await fetch('/api/auth', { method: 'DELETE' })
    router.push('/')
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fdf4ff' }}>
      <div style={{ color: '#7c3aed', fontSize: '18px', fontWeight: '600' }}>Loading...</div>
    </div>
  )

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const currency = user?.country === 'India' ? '₹' : '$'
  const canPlaceOrder = user?.role === 'ADMIN' || user?.role === 'MANAGER'
  const canCancelOrder = user?.role === 'ADMIN' || user?.role === 'MANAGER'

  const navItems = [
    { id: 'restaurants', label: '🍽️ Restaurants' },
    { id: 'cart', label: `🛒 Cart (${cart.length})` },
    { id: 'orders', label: '📦 Orders' },
    { id: 'access', label: '🔐 Access Control' },
  ]

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#fdf4ff' }}>
      {/* Sidebar */}
      <div style={{ width: '260px', background: '#2d0a4e', display: 'flex', flexDirection: 'column', padding: '24px 0', position: 'fixed', height: '100vh' }}>
        <div style={{ padding: '0 24px 32px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <h1 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '16px' }}>
            <span style={{ color: '#f472b6' }}>Slooze</span>
            <span style={{ color: '#c084fc' }}>meals</span>
          </h1>
          {user && (
            <div style={{ background: 'rgba(255,255,255,0.1)', borderRadius: '12px', padding: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg, #7c3aed, #ec4899)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: '700' }}>
                  {user.name[0]}
                </div>
                <div>
                  <div style={{ color: 'white', fontWeight: '600', fontSize: '14px' }}>{user.name}</div>
                  <div style={{ color: '#c084fc', fontSize: '11px' }}>{user.role} • {user.country}</div>
                </div>
              </div>
            </div>
          )}
        </div>

        <nav style={{ flex: 1, padding: '16px 12px' }}>
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => setActivePage(item.id)}
              style={{
                width: '100%', padding: '12px 16px', borderRadius: '10px', border: 'none',
                background: activePage === item.id ? 'rgba(124,58,237,0.3)' : 'transparent',
                color: activePage === item.id ? '#c084fc' : 'rgba(255,255,255,0.7)',
                cursor: 'pointer', textAlign: 'left', fontSize: '14px', fontWeight: '500',
                marginBottom: '4px', transition: 'all 0.2s',
                borderLeft: activePage === item.id ? '3px solid #7c3aed' : '3px solid transparent'
              }}
            >
              {item.label}
            </button>
          ))}
        </nav>

        <div style={{ padding: '16px 24px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <button
            onClick={logout}
            style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.2)', background: 'transparent', color: 'rgba(255,255,255,0.7)', cursor: 'pointer', fontSize: '14px' }}
          >
            🚪 Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ marginLeft: '260px', flex: 1, padding: '32px' }}>
        {message && (
          <div style={{ position: 'fixed', top: '20px', right: '20px', background: '#7c3aed', color: 'white', padding: '12px 20px', borderRadius: '10px', zIndex: 1000, fontWeight: '600' }}>
            {message}
          </div>
        )}

        {/* Restaurants Page */}
        {activePage === 'restaurants' && (
          <div>
            <h2 style={{ fontSize: '28px', fontWeight: '700', color: '#2d0a4e', marginBottom: '8px' }}>Restaurants</h2>
            <p style={{ color: '#6b7280', marginBottom: '24px' }}>
              {user?.role === 'ADMIN' ? 'Showing all restaurants (Admin access)' : `Showing restaurants in ${user?.country}`}
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
              {restaurants.map(restaurant => (
                <div key={restaurant.id} style={{ background: 'white', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', border: '1px solid #e9d5ff' }}>
                  <div style={{ background: 'linear-gradient(135deg, #7c3aed, #ec4899)', padding: '20px', color: 'white' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: '700' }}>{restaurant.name}</h3>
                    <p style={{ fontSize: '13px', opacity: 0.9 }}>{restaurant.cuisine} • {restaurant.country}</p>
                  </div>
                  <div style={{ padding: '16px' }}>
                    {restaurant.menuItems.map(item => (
                      <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #f3e8ff' }}>
                        <div>
                          <div style={{ fontWeight: '600', fontSize: '14px', color: '#1a1a2e' }}>{item.name}</div>
                          <div style={{ fontSize: '12px', color: '#6b7280' }}>{item.description}</div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontWeight: '700', color: '#7c3aed' }}>{currency}{item.price}</span>
                          <button
                            onClick={() => addToCart(item, restaurant)}
                            style={{ background: '#7c3aed', color: 'white', border: 'none', borderRadius: '6px', padding: '6px 10px', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }}
                          >
                            + Add
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Cart Page */}
        {activePage === 'cart' && (
          <div>
            <h2 style={{ fontSize: '28px', fontWeight: '700', color: '#2d0a4e', marginBottom: '24px' }}>Your Cart</h2>
            {cart.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px', color: '#6b7280' }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>🛒</div>
                <div style={{ fontSize: '18px', fontWeight: '600' }}>Your cart is empty</div>
                <div style={{ fontSize: '14px', marginTop: '8px' }}>Add items from the Restaurants page</div>
              </div>
            ) : (
              <div style={{ maxWidth: '600px' }}>
                <div style={{ background: 'white', borderRadius: '16px', padding: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', marginBottom: '20px' }}>
                  {cart.map(item => (
                    <div key={item.menuItemId} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #f3e8ff' }}>
                      <div>
                        <div style={{ fontWeight: '600', color: '#1a1a2e' }}>{item.name}</div>
                        <div style={{ fontSize: '12px', color: '#6b7280' }}>{item.restaurantName} × {item.quantity}</div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{ fontWeight: '700', color: '#7c3aed' }}>{currency}{(item.price * item.quantity).toFixed(2)}</span>
                        <button onClick={() => removeFromCart(item.menuItemId)} style={{ background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: '6px', padding: '4px 8px', cursor: 'pointer', fontSize: '12px' }}>Remove</button>
                      </div>
                    </div>
                  ))}
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '16px 0 0', fontWeight: '700', fontSize: '18px' }}>
                    <span>Total</span>
                    <span style={{ color: '#7c3aed' }}>{currency}{cartTotal.toFixed(2)}</span>
                  </div>
                </div>

                {canPlaceOrder ? (
                  <div style={{ background: 'white', borderRadius: '16px', padding: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
                    <h3 style={{ fontWeight: '700', marginBottom: '16px', color: '#2d0a4e' }}>Payment Method</h3>
                    <select
                      value={paymentMethod}
                      onChange={e => setPaymentMethod(e.target.value)}
                      style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '2px solid #e9d5ff', marginBottom: '16px', fontSize: '14px' }}
                    >
                      <option value="CREDIT_CARD">Credit Card</option>
                      <option value="DEBIT_CARD">Debit Card</option>
                      <option value="UPI">UPI</option>
                      <option value="CASH">Cash</option>
                    </select>
                    <button
                      onClick={placeOrder}
                      style={{ width: '100%', padding: '14px', background: 'linear-gradient(135deg, #7c3aed, #ec4899)', color: 'white', border: 'none', borderRadius: '10px', fontSize: '16px', fontWeight: '700', cursor: 'pointer' }}
                    >
                      Place Order — {currency}{cartTotal.toFixed(2)}
                    </button>
                  </div>
                ) : (
                  <div style={{ background: '#fee2e2', borderRadius: '12px', padding: '16px', color: '#dc2626', fontWeight: '600', textAlign: 'center' }}>
                    ⚠️ Only Admins and Managers can place orders
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Orders Page */}
        {activePage === 'orders' && (
          <div>
            <h2 style={{ fontSize: '28px', fontWeight: '700', color: '#2d0a4e', marginBottom: '24px' }}>My Orders</h2>
            {orders.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px', color: '#6b7280' }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>📦</div>
                <div style={{ fontSize: '18px', fontWeight: '600' }}>No orders yet</div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {orders.map(order => (
                  <div key={order.id} style={{ background: 'white', borderRadius: '16px', padding: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', border: '1px solid #e9d5ff' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                      <div>
                        <div style={{ fontWeight: '700', color: '#1a1a2e', fontSize: '16px' }}>Order #{order.id.slice(-6)}</div>
                        <div style={{ fontSize: '12px', color: '#6b7280' }}>{new Date(order.createdAt).toLocaleString()}</div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{
                          padding: '6px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: '700',
                          cursor: 'default',
                          background: order.status === 'CONFIRMED' ? '#dcfce7' : order.status === 'CANCELLED' ? '#fee2e2' : '#fef9c3',
                          color: order.status === 'CONFIRMED' ? '#16a34a' : order.status === 'CANCELLED' ? '#dc2626' : '#ca8a04'
                        }}>
                          {order.status}
                        </span>
                        {canCancelOrder && order.status === 'CONFIRMED' && (
                          <button
                            onClick={() => cancelOrder(order.id)}
                            style={{ background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: '8px', padding: '6px 12px', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }}
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </div>
                    {order.items.map((item, i) => (
                      <div key={i} style={{ fontSize: '14px', color: '#6b7280', padding: '4px 0' }}>
                        {item.menuItem.name} × {item.quantity} — {currency}{(item.price * item.quantity).toFixed(2)}
                      </div>
                    ))}
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #f3e8ff' }}>
                      <span style={{ fontSize: '14px', color: '#6b7280' }}>Payment: {order.payment?.method?.replace('_', ' ') || 'N/A'}</span>
                      <span style={{ fontWeight: '700', color: '#7c3aed' }}>Total: {currency}{order.total.toFixed(2)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Access Control Page */}
        {activePage === 'access' && (
          <div>
            <h2 style={{ fontSize: '28px', fontWeight: '700', color: '#2d0a4e', marginBottom: '8px' }}>Access Control</h2>
            <p style={{ color: '#6b7280', marginBottom: '24px' }}>Role-based permissions for all users</p>
            <div style={{ background: 'white', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#2d0a4e' }}>
                    <th style={{ padding: '16px', color: 'white', textAlign: 'left', fontSize: '14px' }}>Permission</th>
                    <th style={{ padding: '16px', color: '#f472b6', textAlign: 'center', fontSize: '14px' }}>ADMIN</th>
                    <th style={{ padding: '16px', color: '#c084fc', textAlign: 'center', fontSize: '14px' }}>MANAGER</th>
                    <th style={{ padding: '16px', color: 'rgba(255,255,255,0.7)', textAlign: 'center', fontSize: '14px' }}>MEMBER</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { action: 'View Restaurants', admin: true, manager: true, member: true },
                    { action: 'Add to Cart', admin: true, manager: true, member: true },
                    { action: 'Place Order', admin: true, manager: true, member: false },
                    { action: 'Cancel Order', admin: true, manager: true, member: false },
                    { action: 'Manage Payments', admin: true, manager: false, member: false },
                    { action: 'View All Countries (ReBAC)', admin: true, manager: false, member: false },
                  ].map((row, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid #f3e8ff', background: i % 2 === 0 ? 'white' : '#fdf4ff' }}>
                      <td style={{ padding: '14px 16px', fontWeight: '500', color: '#1a1a2e', fontSize: '14px' }}>{row.action}</td>
                      <td style={{ padding: '14px 16px', textAlign: 'center' }}>{row.admin ? '✅' : '❌'}</td>
                      <td style={{ padding: '14px 16px', textAlign: 'center' }}>{row.manager ? '✅' : '❌'}</td>
                      <td style={{ padding: '14px 16px', textAlign: 'center' }}>{row.member ? '✅' : '❌'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}