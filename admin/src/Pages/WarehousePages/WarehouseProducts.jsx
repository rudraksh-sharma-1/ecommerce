import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const WarehouseProducts = () => {
  const { id } = useParams(); // warehouse_id
  const navigate = useNavigate();

  const [warehouse, setWarehouse] = useState(null);
  const [products, setProducts] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [selectedProductId, setSelectedProductId] = useState("");
  const [loading, setLoading] = useState(true);

  // Fetch warehouse info
  const fetchWarehouse = async () => {
    const res = await axios.get(`https://ecommerce-8342.onrender.com/api/warehouse/listsingle/${id}`);
    setWarehouse(res.data);
  };

  // Fetch products mapped to this warehouse
  const fetchWarehouseProducts = async () => {
    const res = await axios.get(`https://ecommerce-8342.onrender.com/api/productwarehouse/warehouse/${id}`);
    const mapped = res.data.map((item) => item.products);
    setProducts(mapped);
  };

  // Fetch all available products
  const fetchAllProducts = async () => {
    const res = await axios.get(`https://ecommerce-8342.onrender.com/api/productsroute/allproducts`);
    setAllProducts(res.data);
  };

  const handleAddProduct = async () => {
    if (!selectedProductId) return;

    try {
      await axios.post("https://ecommerce-8342.onrender.com/api/productwarehouse/map", {
        product_id: selectedProductId,
        warehouse_id: parseInt(id),
      });
      setSelectedProductId("");
      await fetchWarehouseProducts();
    } catch (err) {
      alert("Product already mapped or error occurred");
      console.error(err);
    }
  };

  const handleRemoveProduct = async (product_id) => {
    try {
      await axios.post("https://ecommerce-8342.onrender.com/api/productwarehouse/remove", {
        product_id,
        warehouse_id: parseInt(id),
      });
      await fetchWarehouseProducts();
    } catch (err) {
      alert("Failed to remove product");
      console.error(err);
    }
  };

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      await fetchWarehouse();
      await fetchWarehouseProducts();
      await fetchAllProducts();
      setLoading(false);
    };
    load();
  }, [id]);

  if (loading) return <p className="p-4">Loading...</p>;

  return (
    <div className="p-6 max-w-screen-lg mx-auto">
      <div className="mb-6">
        <button
          onClick={() => navigate("/warehouselist")}
          className="text-blue-600 hover:underline mb-2"
        >
          ← Back to Warehouses
        </button>
        <h2 className="text-xl font-bold">Manage Products for the Warehouse:</h2>
        <p className="text-lg">Warehouse Name: {warehouse.name}</p>
        <p className="text-sm text-gray-500">
            Warehouse Details:- 
           Pincode: {warehouse.pincode} • {warehouse.address}
        </p>
      </div>

      <div className="bg-white p-4 rounded shadow mb-6">
        <h3 className="font-semibold mb-2">➕ Add Product</h3>
        <div className="flex gap-2 items-center">
          <select
            className="border rounded px-3 py-2"
            value={selectedProductId}
            onChange={(e) => setSelectedProductId(e.target.value)}
          >
            <option value="">Select product</option>
            {allProducts.map((product) => (
              <option
                key={product.id}
                value={product.id}
                disabled={products.some((p) => p.id === product.id)}
              >
                {product.name}
              </option>
            ))}
          </select>
          <button
            onClick={handleAddProduct}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            Add
          </button>
        </div>
      </div>

      <div className="bg-white p-4 rounded shadow">
        <h3 className="font-semibold mb-4">📦 Products in Warehouse</h3>
        {products.length === 0 ? (
          <p className="text-gray-500">No products mapped to this warehouse.</p>
        ) : (
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-gray-100 text-left">
                <th className="py-2 px-4">Product Name</th>
                <th className="py-2 px-4">Price</th>
                <th className="py-2 px-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id} className="border-t">
                  <td className="py-2 px-4">{product.name}</td>
                  <td className="py-2 px-4">₹{product.price}</td>
                  <td className="py-2 px-4">
                    <button
                      onClick={() => handleRemoveProduct(product.id)}
                      className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                    >
                      🗑 Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default WarehouseProducts;
