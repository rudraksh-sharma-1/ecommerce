// components/BusinessUsersList.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';

const BusinessUsersList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);


  const fetchBusinessUsers = async () => {
    try {
      const res = await axios.get('https://ecommerce-8342.onrender.com/api/business/business-users'); // update if deployed
      setUsers(res.data);
    } catch (err) {
      console.error('Error fetching business users:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBusinessUsers();
  }, []);

  if (loading) return <p>Loading...</p>;

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Business Partners</h2>
      <ul className="space-y-2">
        {users.map((user) => (
          <li key={user.id} className="border p-3 rounded-md shadow-sm">
            <p><strong>First Name:</strong> {user.first_name}</p>
            <p><strong>Last Name:</strong> {user.last_name}</p>
            <p><strong>Business Type:</strong> {user.business_type}</p>
            <p><strong>PAN:</strong> {user.pan}</p>
            <p><strong>GSTIN:</strong> {user.gstin}</p>
            <p><strong>Phone No:</strong> {user.phone_no}</p>
            <p><strong>date of creation:</strong>{user.created_at}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default BusinessUsersList;
