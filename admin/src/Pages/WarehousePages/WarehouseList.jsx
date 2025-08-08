import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const WarehouseList = () => {
  const navigate = useNavigate()
  const [editingWarehouse, setEditingWarehouse] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    name: "",
    pincode: "",
    address: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);

  const deleteWarehouse = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this warehouse?"
    );
    if (!confirmDelete) return;

    try {
      await axios.delete(
        `https://ecommerce-8342.onrender.com/api/warehouse/delete/${id}`
      );
      await fetchWarehouses();
    } catch (err) {
      alert("Failed to delete warehouse");
      console.error(err);
    }
  };

  const fetchWarehouses = async () => {
    try {
      const res = await axios.get(
        "https://ecommerce-8342.onrender.com/api/warehouse/list"
      ); // make sure this route exists
      setWarehouses(res.data);
    } catch (err) {
      console.error("Failed to fetch warehouses:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWarehouses();
  }, []);

  return (
    <div className="p-4 sm:p-6 max-w-screen-xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Warehouses</h1>

      <button
        onClick={() => setShowModal(true)}
        className="bg-blue-600 text-white px-4 py-2 rounded mb-6"
      >
        ➕ Add Warehouse
      </button>

      {loading ? (
        <p className="text-gray-500">Loading warehouses...</p>
      ) : warehouses.length === 0 ? (
        <p className="text-gray-500">No warehouses found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded shadow text-sm md:text-base">
            <thead>
              <tr className="bg-gray-100 text-left">
                <th className="py-2 px-4">ID</th>
                <th className="py-2 px-4">Name</th>
                <th className="py-2 px-4">Pincode</th>
                <th className="py-2 px-4">Address</th>
                <th className="py-2 px-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {warehouses.map((w) => (
                <tr key={w.id} className="border-t">
                  <td className="py-2 px-4">{w.id}</td>
                  <td className="py-2 px-4">{w.name}</td>
                  <td className="py-2 px-4">{w.pincode}</td>
                  <td className="py-2 px-4">{w.address}</td>
                  <td className="py-2 px-4 space-x-2">
                    <button
                      className="bg-yellow-500 text-white px-3 py-1 rounded"
                      onClick={() => {
                        setEditingWarehouse(w);
                        setForm({
                          name: w.name,
                          pincode: w.pincode,
                          address: w.address,
                        });
                        setShowModal(true);
                      }}
                    >
                      ✏️
                    </button>

                    <button
                      className="bg-red-600 text-white px-3 py-1 rounded"
                      onClick={() => deleteWarehouse(w.id)}
                    >
                      🗑️
                    </button>

                    <button
                      className="bg-green-600 text-white px-3 py-1 rounded"
                      onClick={() =>
                        navigate(`/warehouseproducts/${w.id}/products`)
                      }
                    >
                      📦 Products
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-opacity-40 flex items-center justify-center z-50 px-4">
          <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
            <h2 className="text-lg font-bold mb-4">Add Warehouse</h2>

            <div className="space-y-4">
              <input
                type="text"
                placeholder="Warehouse Name"
                className="w-full border px-3 py-2 rounded text-sm"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
              <input
                type="text"
                placeholder="Pincode"
                className="w-full border px-3 py-2 rounded text-sm"
                value={form.pincode}
                onChange={(e) => setForm({ ...form, pincode: e.target.value })}
              />
              <textarea
                placeholder="Address"
                className="w-full border px-3 py-2 rounded text-sm"
                rows={3}
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
              />
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  setSubmitting(true);
                  try {
                    if (editingWarehouse) {
                      // 🔄 EDIT
                      await axios.put(
                        `https://ecommerce-8342.onrender.com/api/warehouse/update/${editingWarehouse.id}`,
                        form
                      );
                    } else {
                      // ➕ ADD
                      await axios.post(
                        "https://ecommerce-8342.onrender.com/api/warehouse/add",
                        form
                      );
                    }
                    await fetchWarehouses();
                    setShowModal(false);
                    setForm({ name: "", pincode: "", address: "" });
                    setEditingWarehouse(null);
                  } catch (err) {
                    alert("Failed to save warehouse");
                    console.error(err);
                  } finally {
                    setSubmitting(false);
                  }
                }}
                disabled={submitting}
                className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
              >
                {submitting ? "Saving..." : editingWarehouse ? "Edit" : "Add"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WarehouseList;
