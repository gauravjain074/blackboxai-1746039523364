import React, { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const socket = io('http://localhost:5000');

function App() {
  const [inventory, setInventory] = useState([]);
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    quantity: '',
    location: '',
    expiry: ''
  });

  useEffect(() => {
    socket.on('inventoryUpdate', (data) => {
      setInventory(data);
    });

    // Cleanup on unmount
    return () => {
      socket.off('inventoryUpdate');
    };
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.quantity || !formData.location) {
      alert('Please fill in all required fields (name, quantity, location).');
      return;
    }
    try {
      const response = await fetch('http://localhost:5000/api/inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: formData.id || undefined,
          name: formData.name,
          quantity: formData.quantity,
          location: formData.location,
          expiry: formData.expiry
        })
      });
      const data = await response.json();
      if (data.success) {
        setFormData({ id: '', name: '', quantity: '', location: '', expiry: '' });
      } else {
        alert('Failed to update inventory');
      }
    } catch (error) {
      alert('Error updating inventory');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;
    try {
      const response = await fetch(`http://localhost:5000/api/inventory/${id}`, {
        method: 'DELETE'
      });
      const data = await response.json();
      if (!data.success) {
        alert('Failed to delete item');
      }
    } catch (error) {
      alert('Error deleting item');
    }
  };

  const handleEdit = (item) => {
    setFormData({
      id: item.id,
      name: item.name,
      quantity: item.quantity,
      location: item.location,
      expiry: item.expiry || ''
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6 font-['Roboto']">
      <header className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-green-700 mb-2">Food Donation Real-Time Inventory</h1>
        <p className="text-gray-600">Helping reduce starvation and food waste by connecting donors and NGOs</p>
      </header>

      <section className="max-w-4xl mx-auto bg-white p-6 rounded shadow">
        <h2 className="text-2xl font-semibold mb-4 text-green-600">Update Food Inventory (Food Banks)</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block font-medium mb-1" htmlFor="name">Food Name <span className="text-red-500">*</span></label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="e.g. Bread, Rice, Fruits"
              required
            />
          </div>
          <div>
            <label className="block font-medium mb-1" htmlFor="quantity">Quantity <span className="text-red-500">*</span></label>
            <input
              type="number"
              id="quantity"
              name="quantity"
              value={formData.quantity}
              onChange={handleInputChange}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="e.g. 10"
              min="1"
              required
            />
          </div>
          <div>
            <label className="block font-medium mb-1" htmlFor="location">Location <span className="text-red-500">*</span></label>
            <input
              type="text"
              id="location"
              name="location"
              value={formData.location}
              onChange={handleInputChange}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="e.g. Hostel A, Hotel XYZ"
              required
            />
          </div>
          <div>
            <label className="block font-medium mb-1" htmlFor="expiry">Expiry Date</label>
            <input
              type="date"
              id="expiry"
              name="expiry"
              value={formData.expiry}
              onChange={handleInputChange}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <div className="flex space-x-4">
            <button
              type="submit"
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
            >
              {formData.id ? 'Update' : 'Add'} Inventory
            </button>
            {formData.id && (
              <button
                type="button"
                onClick={() => setFormData({ id: '', name: '', quantity: '', location: '', expiry: '' })}
                className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500 transition"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </section>

      <section className="max-w-4xl mx-auto mt-10 bg-white p-6 rounded shadow">
        <h2 className="text-2xl font-semibold mb-4 text-green-600">Current Food Inventory (Donors & NGOs)</h2>
        {inventory.length === 0 ? (
          <p className="text-gray-600">No food inventory available currently.</p>
        ) : (
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-green-100">
                <th className="border border-gray-300 px-4 py-2 text-left">Food Name</th>
                <th className="border border-gray-300 px-4 py-2 text-left">Quantity</th>
                <th className="border border-gray-300 px-4 py-2 text-left">Location</th>
                <th className="border border-gray-300 px-4 py-2 text-left">Expiry Date</th>
                <th className="border border-gray-300 px-4 py-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {inventory.map(item => (
                <tr key={item.id} className="hover:bg-green-50">
                  <td className="border border-gray-300 px-4 py-2">{item.name}</td>
                  <td className="border border-gray-300 px-4 py-2">{item.quantity}</td>
                  <td className="border border-gray-300 px-4 py-2">{item.location}</td>
                  <td className="border border-gray-300 px-4 py-2">{item.expiry || '-'}</td>
                  <td className="border border-gray-300 px-4 py-2 space-x-2">
                    <button
                      onClick={() => handleEdit(item)}
                      className="text-blue-600 hover:text-blue-800"
                      title="Edit"
                    >
                      <i className="fas fa-edit"></i>
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="text-red-600 hover:text-red-800"
                      title="Delete"
                    >
                      <i className="fas fa-trash-alt"></i>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}

export default App;
