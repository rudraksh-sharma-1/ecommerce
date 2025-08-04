import React, { useEffect, useState } from "react";
import axios from "axios";

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [expanded, setExpanded] = useState(null);

  const fetchOrders = async () => {
    const res = await axios.get("https://ecommerce-wvkv.onrender.com/api/order/all");
    setOrders(res.data.orders || []);
  };

  const deleteOrder = async (order_id) => {
    if (!window.confirm("Are you sure you want to delete this order?")) return;
    await axios.delete(`https://ecommerce-wvkv.onrender.com/api/order/delete/${order_id}`);
    fetchOrders(); // Refresh list
  };

  const updateOrder = async (id, status, adminnotes) => {
    await axios.put(`https://ecommerce-wvkv.onrender.com/api/order/status/${id}`, { status, adminnotes });
    fetchOrders(); // Refresh
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-semibold mb-6">📦 Admin Orders Panel</h1>

      <div className="space-y-6">
        {orders.map((order) => (
          <div key={order.id} className="bg-white p-4 rounded-lg shadow-md">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-semibold text-gray-800">Order ID: {order.id}</p>
                <p>User ID: {order.user_id}</p>
                <p>Razorpay Payment ID: {order.razorpay_payment_id}</p>
                {/* <p>User ID: {order.razorpay_order_id}</p>
                <p>User ID: {order.razorpay_signature}</p> */}
                <p>Total Amount: ₹{order.total}</p>
                <p>Status: {order.status}</p>

                {/* ➕ Delivery Address Section */}
                <div className="mt-3 text-sm text-gray-700 bg-gray-50 p-3 rounded border">
                  <p className="font-semibold mb-1">📦 Delivery Address</p>
                  <p>Name: {order.users?.name || "Not Provided"}</p>
                  <p>Email: {order.users?.email || "Not Provided"}</p>
                  <p>Phone: {order.users?.phone || "Not Provided"}</p>

                  <p>Address: {order.address}, {order.city}, {order.state}, {order.pincode}, {order.country}</p>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setExpanded(expanded === order.id ? null : order.id)}
                  className="bg-blue-100 text-blue-700 px-3 py-1 rounded"
                >
                  {expanded === order.id ? "Hide Items" : "View Items"}
                </button>
                <button
                  onClick={() => deleteOrder(order.id)}
                  className="bg-red-100 text-red-600 px-3 py-1 rounded"
                >
                  Delete
                </button>
              </div>
            </div>

            {expanded === order.id && (
              <OrderItems orderId={order.id} onUpdate={updateOrder} status={order.status} adminnotes={order.adminnotes} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

const OrderItems = ({ orderId, onUpdate, status, adminnotes }) => {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({ status, adminnotes });

  useEffect(() => {
    axios.get(`https://ecommerce-wvkv.onrender.com/api/orderItems/order/${orderId}`).then((res) => {
      setItems(res.data.items || []);
    });
  }, [orderId]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = () => {
    onUpdate(orderId, form.status, form.adminnotes);
  };

  return (
    <div className="mt-4 border-t pt-4">
      <div className="mb-2">
        <label className="block text-sm font-medium">Status</label>
        <select
          name="status"
          value={form.status}
          onChange={handleChange}
          className="border px-2 py-1 rounded w-full"
        >
          <option value="Pending">Pending</option>
          <option value="Processing">Processing</option>
          <option value="Shipped">Shipped</option>
          <option value="Delivered">Delivered</option>
          <option value="Cancelled">Cancelled</option>
        </select>
      </div>

      <div className="mb-2">
        <label className="block text-sm font-medium">Admin Notes</label>
        <textarea
          name="adminnotes"
          value={form.adminnotes??""}
          onChange={handleChange}
          className="border px-2 py-1 rounded w-full"
        />
      </div>

      <button
        onClick={handleSubmit}
        className="bg-green-600 text-white px-4 py-1 rounded hover:bg-green-700"
      >
        Save Changes
      </button>

      <div className="mt-4">
        <h4 className="font-semibold text-gray-800 mb-2">Items:</h4>
        {items.map((item) => (
          <div key={item.id} className="border rounded p-2 mb-2 bg-gray-100">
            <p className="text-sm font-medium">
              {item.products?.name || "Unknown Product"} — Qty: {item.quantity}
            </p>
            {item.products?.image && (
              <img src={item.products.image} alt="product" className="w-16 h-16 object-cover mt-1" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminOrders;
