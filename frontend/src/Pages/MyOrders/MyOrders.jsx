// src/pages/MyOrders.jsx
import React, { useEffect, useState } from "react";
import { getUserOrders } from "../../utils/supabaseApi.js"; // make sure path is correct
import { useAuth } from "../../contexts/AuthContext.jsx"; // assuming you have auth context
import { Link } from "react-router-dom";

const MyOrders = () => {
    const { currentUser } = useAuth();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrders = async () => {
            if (!currentUser) return;

            const { success, orders: fetchedOrders, error } = await getUserOrders(currentUser.id);
            if (success) setOrders(fetchedOrders);
            else console.error("Failed to fetch orders:", error);
            setLoading(false);
        };

        fetchOrders();
    }, [currentUser]);

    if (loading) {
        return <div className="p-6 text-center text-lg text-gray-700">Loading your orders...</div>;
    }

    if (!orders.length) {
        return (
            <div className="p-6 text-center text-gray-700">
                <h2 className="text-2xl font-bold mb-2">No Orders Found</h2>
                <p className="mb-4">You haven't placed any orders yet.</p>
                <Link to="/" className="text-blue-600 hover:underline">
                    Continue Shopping
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto p-4 sm:p-6">
            <h1 className="text-3xl font-semibold mb-6">My Orders</h1>
            <div className="space-y-6">
                {orders.map((order) => (
                    <div
                        key={order.id}
                        className="bg-white shadow-sm border border-gray-200 rounded-lg p-4 space-y-4"
                    >
                        <div className="flex justify-between text-sm text-gray-600">
                            <div>
                                <span className="font-semibold">Order ID:</span> {order.id}
                            </div>
                            <div>
                                <span className="font-semibold">Status:</span>{" "}
                                <span className="capitalize text-yellow-600">{order.status}</span>
                            </div>
                        </div>

                        <div className="text-sm text-gray-500">
                            Placed on: {new Date(order.created_at).toLocaleString()}
                        </div>

                        <div className="flex justify-start gap-1 align-middle">
                            <div className="text-sm font-medium text-gray-700">
                                Product Price: ₹{order.subtotal} ||
                            </div>
                            <div className="text-sm font-medium text-gray-700">
                                Shpping Charges: ₹{order.shipping} ||
                            </div>
                            <div className="text-sm font-medium text-gray-700">
                                Total Amount: ₹{order.total}
                            </div>
                        </div>

                        <div className="border-t border-gray-200 pt-3">
                            <h3 className="font-semibold text-gray-800 mb-2">Items:</h3>
                            <ul className="space-y-2">
                                {order.order_items.map((item) => (
                                    <li key={item.id} className="flex items-center gap-4">
                                        <img
                                            src={item.products.image}
                                            alt="Product Image"
                                            className="w-14 h-14 object-cover rounded"
                                        />
                                        <div>
                                            <p className="font-medium">{item.products.name}</p>
                                            <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default MyOrders;
