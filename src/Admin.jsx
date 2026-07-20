import { useState } from 'react'
import './Admin.css'
import { supabase } from './lib/supabase'

const ADMIN_PASSWORD = 'YOUR PASSWORD'

function Admin() {
  const [password, setPassword] = useState('')
  const [isAuthed, setIsAuthed] = useState(false)
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(false)

  const handleLogin = async () => {
    if (password !== ADMIN_PASSWORD) {
      alert('Wrong password')
      return
    }

    setIsAuthed(true)
    await fetchPendingOrders()
  }

  const fetchPendingOrders = async () => {
    setLoading(true)

    const { data, error } = await supabase
      .from('orders')
      .select(`
        id,
        customer_name,
        total_count,
        status,
        created_at,
        order_items (
          id,
          menu_name,
          temp,
          quantity,
          decaf
        )
      `)
      .eq('status', 'pending')
      .order('id', { ascending: false })

    setLoading(false)

    if (error) {
      console.error(error)
      alert(error.message)
      return
    }

    setOrders(data || [])
  }

  const handleComplete = async (orderId) => {
    const { error } = await supabase
      .from('orders')
      .update({ status: 'completed' })
      .eq('id', orderId)

    if (error) {
      console.error(error)
      alert(error.message)
      return
    }

    await fetchPendingOrders()
  }

  if (!isAuthed) {
    return (
      <div className="admin-page">
        <div className="admin-login-card">
          <h1>Admin</h1>
          <p>Enter the password.</p>

          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="admin-input"
          />

          <button type="button" className="primary-btn" onClick={handleLogin}>
            Enter
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="admin-page">
      <div className="admin-header">
        <h1>Pending Orders</h1>
        <button type="button" className="secondary-btn" onClick={fetchPendingOrders}>
          Refresh
        </button>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : orders.length === 0 ? (
        <p>No pending orders.</p>
      ) : (
        <div className="admin-order-list">
          {orders.map((order) => (
            <div className="admin-order-card" key={order.id}>
              <div className="admin-order-top">
                <div>
                  <h2>{order.customer_name}</h2>
                  <p>Order #{order.id}</p>
                  <p>{order.total_count} item(s)</p>
                </div>

                <button
                  type="button"
                  className="complete-btn"
                  onClick={() => handleComplete(order.id)}
                >
                  Complete
                </button>
              </div>

              <div className="admin-items">
                {order.order_items?.map((item) => (
                  <div key={item.id} className="admin-item-row">
                    <span>
                      {item.menu_name}
                      {item.temp ? ` / ${item.temp}` : ''}
                      {item.decaf ? ' / Decaf' : ''}
                    </span>
                    <strong>x {item.quantity}</strong>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Admin