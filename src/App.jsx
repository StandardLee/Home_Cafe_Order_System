import { useState } from 'react'
import './App.css'
import { supabase } from './lib/supabase'
import { useNavigate } from 'react-router-dom'

function MenuSection({ title, items, selectedTemps, changeTemp, addToCart }) {
  return (
    <div className="menu-column">
      <h3 className="category-title">{title}</h3>

      {items.map((menu) => (
        <div className="menu-item" key={menu.id}>
          <div className="menu-info">
            <h3>{menu.name}</h3>
          </div>

          <div className="menu-actions">
            {menu.hasTempOption && (
              <div className="temp-selector">
                <button
                  type="button"
                  className={
                    selectedTemps[menu.id] === 'Hot' ? 'temp-btn active' : 'temp-btn'
                  }
                  onClick={() => changeTemp(menu.id, 'Hot')}
                >
                  Hot
                </button>

                  <button
                    type="button"
                  className={
                    selectedTemps[menu.id] === 'Ice' ? 'temp-btn active' : 'temp-btn'
                  }
                  onClick={() => changeTemp(menu.id, 'Ice')}
                >
                  Ice
                </button>
              </div>)}

            <button
              type="button"
              className="add-btn"
              onClick={() => addToCart(menu)}
            >
              Add to cart
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}



function App() {
  const menuItems = [
    { id: 1, name: 'Espresso', category: 'Espresso', hasTempOption: false  },
    { id: 2, name: 'Americano', category: 'Espresso', hasTempOption: true  },
    { id: 3, name: 'Cafe Latte', category: 'Espresso', hasTempOption: true  },
    { id: 4, name: 'Cafe Mocha', category: 'Espresso', hasTempOption: true  },
    { id: 5, name: 'Cafe Miel', category: 'Espresso', hasTempOption: true  },
    { id: 6, name: 'Standard Latte', category: 'Espresso', hasTempOption: true  },
    { id: 7, name: 'Affogato', category: 'Espresso', hasTempOption: false  },
    { id: 8, name: 'Shakerato', category: 'Espresso', hasTempOption: false  },
    { id: 9, name: 'Infused Tea', category: 'Tea', hasTempOption: true  },
    { id: 10, name: 'Green Tea', category: 'Tea', hasTempOption: true  },
    { id: 11, name: 'Puer Tea', category: 'Tea', hasTempOption: true  },
    { id: 12, name: 'Barley Tea', category: 'Non-Caffein', hasTempOption: true  },
    { id: 13, name: 'Yuzu Tea', category: 'Non-Caffein', hasTempOption: true  },
    { id: 14, name: 'Yuzu Ade', category: 'Non-Caffein', hasTempOption: false  },
    { id: 15, name: 'Herb Tea', category: 'Non-Caffein', hasTempOption: true  },
  ]

  const espressoMenu = menuItems.filter((item) => item.category === 'Espresso')
  const teaMenu = menuItems.filter((item) => item.category === 'Tea')
  const nonCaffeinMenu = menuItems.filter((item) => item.category === 'Non-Caffein')

  const [selectedTemps, setSelectedTemps] = useState({})

  const [cartItems, setCartItems] = useState([])

  const changeTemp = (menuId, temp) => {
    setSelectedTemps((prev) => ({
      ...prev,
      [menuId]: temp,
    }))
  }

  const addToCart = (menu) => {
    const selectedTemp = selectedTemps[menu.id]
    
    if(menu.hasTempOption && !selectedTemp){
      alert('Please select Hot or ice first.')
      return
    }

    const cartKey = menu.hasTempOption 
      ? `${menu.id}-${selectedTemp}`
      : `${menu.id}`

    setCartItems((prev) => {
      const existingItem = prev.find((item) => item.cartKey === cartKey)

      if (existingItem) {
        return prev.map((item) =>
          item.cartKey === cartKey
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      }

      return [
        ...prev,
        {
          cartKey,
          menuId: menu.id,
          name: menu.name,
          category: menu.category,
          temp: menu.hasTempOption ? selectedTemp: null,
          quantity: 1,
          decaf: false,
        },
      ]
    })
  }

  const [customerName, setCustomerName] = useState('')

  const toggleDecaf = (cartKey) => {
    setCartItems((prev) =>
      prev.map((item) =>
        item.cartKey === cartKey
          ? { ...item, decaf: !item.decaf }
          : item
      )
    )
  }

  const increaseQuantity = (cartKey) => {
    setCartItems((prev) =>
      prev.map((item) =>
        item.cartKey === cartKey
          ? { ...item, quantity: item.quantity + 1 }
          : item
      )
    )
  }

  const decreaseQuantity = (cartKey) => {
    setCartItems((prev) =>
      prev
        .map((item) =>
          item.cartKey === cartKey
            ? { ...item, quantity: item.quantity - 1 }
            : item
        )
        .filter((item) => item.quantity > 0)
    )
  }
  
  const removeCartItem = (cartKey) => {
    setCartItems((prev) => prev.filter((item) => item.cartKey !== cartKey))
  }
  
  const totalCount = cartItems.reduce((sum, item) => sum + item.quantity, 0)

  const navigate = useNavigate()

  const handleProceed = async () => {
    if (cartItems.length === 0) {
      alert('Cart is empty.')
      return
    }

    if (!customerName.trim()) {
      alert('Please enter your name.')
      return
    }

    const { data: orderData, error: orderError } = await supabase
      .from('orders')
      .insert([
        {
          customer_name: customerName.trim(),
          total_count: totalCount,
          status: 'pending',
        },
      ])
      .select()

    console.log('error:', orderError)

    if (orderError) {
      console.error('orders insert error:', orderError)
      alert(orderError.message)
      return
    }

    const orderId = orderData[0].id

    const itemsToInsert = cartItems.map((item) => ({
      order_id: orderId,
      menu_name: item.name,
      temp: item.temp,
      quantity: item.quantity,
      decaf: item.decaf,
    }))

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(itemsToInsert)

    if (itemsError) {
      console.error('order_items insert error:', itemsError)
      alert(itemsError.message)
      return
    }
  
    setCartItems([])
    setCustomerName('')

    navigate(`/order/${orderId}`)
  }

  return (
    <div className="page">
      <div className="topbar">
        <button
          type="button"
          className="admin-link-btn"
          onClick={() => window.open('/admin', '_blank', 'noopener,noreferrer')}
        >
          Admin
        </button>

      </div>
      <div className="app">
        <header className="hero">
          <p className="eyebrow">Home Cafe Order System</p>
          <h1>Standard Cafe</h1>
        </header>
        
        <section className="card">
          <h2>Menu</h2>

          <div className="menu-columns">
            <div className="menu-wide">
              <MenuSection
                title="Espresso"
                items={espressoMenu}
                selectedTemps={selectedTemps}
                changeTemp={changeTemp}
                addToCart={addToCart}
              />
            </div>

            <MenuSection
              title="Tea"
              items={teaMenu}
              selectedTemps={selectedTemps}
              changeTemp={changeTemp}
              addToCart={addToCart}
            />

            <MenuSection
              title="Non-Caffein"
              items={nonCaffeinMenu}
              selectedTemps={selectedTemps}
              changeTemp={changeTemp}
              addToCart={addToCart}
            />
          </div>
        </section>

        <section className="card cart-section">
          <div className="cart-header">
            <h2>Cart</h2>
            <span>{totalCount} Order</span>
          </div>

          <div className="order-form">
            <input
              id="customerName"
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Enter your name"
            />
          </div>

          {cartItems.length === 0 ? (
            <p className="empty-text">Ready to order!</p>
          ) : (
            <div className="cart-list">
              {cartItems.map((item) => (
                <div className="cart-item" key={item.cartKey}>
                  <div className="cart-info">
                    <h3>
                      {item.name} 
                      {item.temp && <span className="temp-badge">{item.temp}</span>}
                    </h3>
                  </div>

                  <div className="cart-actions">
                    <div className="counter">
                      <button
                        type="button"
                        onClick={() => decreaseQuantity(item.cartKey)}
                      >
                        -
                      </button>

                      <span>{item.quantity}</span>

                      <button
                        type="button"
                        onClick={() => increaseQuantity(item.cartKey)}
                      >
                        +
                      </button>
                    </div>

                    {item.category === 'Espresso'&&(
                      <label className="decaf-check">
                        <input
                          type="checkbox"
                          checked={item.decaf}
                          onChange={() => toggleDecaf(item.cartKey)}
                        />
                        Decaf
                      </label>
                    )}

                    <button
                      type="button"
                      className="remove-btn"
                      onClick={() => removeCartItem(item.cartKey)}
                    >
                      Delete
                    </button>

                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="summary">
            <p>Total: {totalCount} Order</p>
          </div>

          <button type="button" className="order-button"  onClick={handleProceed}>
            Proceed
          </button>
        </section>
      </div>
    </div>
  )
}

export default App