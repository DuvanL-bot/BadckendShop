const pool = require("../conex");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

// Crear orden en BD
async function createOrder(id_user, total_amount, currency) {
  const query = `
    INSERT INTO orders (id_user, total_amount, currency, status, created_at, updated_at)
    VALUES ($1, $2, $3, 'pending', NOW(), NOW())
    RETURNING *
  `;
  const valores = [id_user, total_amount, currency];
  try {
    const res = await pool.query(query, valores);
    return res.rows[0];
  } catch (error) {
    console.error(error);
    throw error;
  }
}

// Guardar productos de la orden
async function saveOrderItems(id_order, items) {
  try {
    for (const item of items) {
      const subtotal = item.unit_price * item.quantity;
      await pool.query(
        `INSERT INTO order_items (id_order, id_product, quantity, unit_price, subtotal)
         VALUES ($1, $2, $3, $4, $5)`,
        [id_order, item.id_product, item.quantity, item.unit_price, subtotal]
      );
    }
  } catch (error) {
    console.error(error);
    throw error;
  }
}

// Procesar pago con Stripe
async function payOrder(id_user, total_amount, currency, items) {
  try {
    const paymentMethod = await stripe.paymentMethods.create({
      type: "card",
      card: { token: "tok_visa" }, 
    });

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(total_amount * 100), 
      currency: currency || "usd",
      payment_method: paymentMethod.id,
      confirm: true,
      automatic_payment_methods: {
        enabled: true,
        allow_redirects: "never",
      },
    });

    const order = await createOrder(id_user, total_amount, currency);

    await saveOrderItems(order.id_order, items);

    await pool.query(
      `UPDATE orders 
       SET status = $1, stripe_payment_id = $2, stripe_payment_method = $3, updated_at = NOW()
       WHERE id_order = $4`,
      [paymentIntent.status, paymentIntent.id, paymentMethod.id, order.id_order]
    );

    return { order, paymentIntent };
  } catch (error) {
    console.error(error);
    throw error;
  }
}

// Cancelar orden
async function cancelOrder(id_order, stripe_payment_id) {
  try {
    const canceled = await stripe.paymentIntents.cancel(stripe_payment_id);

    await pool.query(
      `UPDATE orders SET status = 'canceled', updated_at = NOW() WHERE id_order = $1`,
      [id_order]
    );

    return canceled;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

async function getOrders(id_user) {
  const query = `
    SELECT 
      o.id_order, o.total_amount, o.currency, o.status,
      o.stripe_payment_id, o.created_at,
      oi.id_product, oi.quantity, oi.unit_price, oi.subtotal,
      p.title_product, p.thumbnail_product
    FROM orders o
    INNER JOIN order_items oi ON o.id_order = oi.id_order
    INNER JOIN products p ON oi.id_product = p.id_product
    WHERE o.id_user = $1
    ORDER BY o.created_at DESC
  `;
  try {
    const res = await pool.query(query, [id_user]);
    return res.rows;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

module.exports = { payOrder, cancelOrder, getOrders };
