import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from './lib/supabase'
import './Order.css'

function Order() {
  const { id } = useParams()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isCompleted, setIsCompleted] = useState(false)

  const fetchOrder = async () => {
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
      .eq('id', id)
      .single()

    if (error) {
      console.error(error)
      return
    }

    setOrder(data)
    setIsCompleted(data.status === 'completed')
    setLoading(false)
  }

  useEffect(() => {
    fetchOrder()
  }, [id])

  useEffect(() => {
    if (!id || isCompleted) {
        alert('Your order is ready!')
        return
    }
    const interval = setInterval(() => {
      fetchOrder()
    }, 10000)

    return () => clearInterval(interval)
  }, [id, isCompleted] )

  if (loading) {
    return <div className="order-page"><p>Loading order...</p></div>
  }

  if (!order) {
    return (
      <div className="order-page">
        <p>Order not found.</p>
        <Link to="/">Go Home</Link>
      </div>
    )
  }

  return (
    <div className="order-page">
      <div className="order-card">
        <p className="order-eyebrow">Order Status</p>
        <h1>Order #{order.id}</h1>
        <p>{order.customer_name}</p>

        {isCompleted ? (
          <div className="status-box completed">
            Your order is complete!
          </div>
        ) : (
          <div className="status-box pending">
            Your order is being prepared.
          </div>
        )}

        <div className="order-items">
          {order.order_items?.map((item) => (
            <div key={item.id} className="order-item-row">
              <span>
                {item.menu_name}
                {item.temp ? ` / ${item.temp}` : ''}
                {item.decaf ? ' / Decaf' : ''}
              </span>
              <strong>x {item.quantity}</strong>
            </div>
          ))}
        </div>

        <div className="order-summary">
          <p>Total: {order.total_count} item(s)</p>
          <p>Status: {order.status}</p>
        </div>

        <Link to="/" className="back-home-link">Back to Home</Link>
      </div>
    </div>
  )
}

export default Order