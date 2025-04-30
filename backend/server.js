const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
  }
});

app.use(cors());
app.use(express.json());

let foodInventory = [];

// API to get current food inventory
app.get('/api/inventory', (req, res) => {
  res.json(foodInventory);
});

// API to update food inventory (add or update an item)
app.post('/api/inventory', (req, res) => {
  const { id, name, quantity, location, expiry } = req.body;
  if (!name || !quantity || !location) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  if (id) {
    // Update existing item
    const index = foodInventory.findIndex(item => item.id === id);
    if (index !== -1) {
      foodInventory[index] = { id, name, quantity, location, expiry };
    } else {
      foodInventory.push({ id, name, quantity, location, expiry });
    }
  } else {
    // Add new item with generated id
    const newItem = {
      id: Date.now().toString(),
      name,
      quantity,
      location,
      expiry
    };
    foodInventory.push(newItem);
  }

  // Emit updated inventory to all clients
  io.emit('inventoryUpdate', foodInventory);

  res.json({ success: true, inventory: foodInventory });
});

// API to delete an inventory item
app.delete('/api/inventory/:id', (req, res) => {
  const { id } = req.params;
  foodInventory = foodInventory.filter(item => item.id !== id);
  io.emit('inventoryUpdate', foodInventory);
  res.json({ success: true, inventory: foodInventory });
});

// Socket.IO connection
io.on('connection', (socket) => {
  console.log('a user connected');
  // Send current inventory on new connection
  socket.emit('inventoryUpdate', foodInventory);

  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
