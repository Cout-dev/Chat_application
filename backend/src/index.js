const WebSocket = require('ws');
const axios = require('axios');

const wss = new WebSocket.Server({ port: 8080 });

wss.on('connection', (ws) => {
  console.log('✅ Client Connected');

  ws.on('message', async (data) => {
    try {
      const messageData = JSON.parse(data.toString());
      console.log('📩 Received:', messageData);

      const token = messageData.token;
      if (!token) {
        throw new Error('❌ No authentication token provided.');
      }

      // Use correct field name "Timestamp" instead of "timestamp"
      const formattedData = {
        data: {
          message: messageData.message,
          Timestamp: messageData.timestamp, // Fix casing here
        },
      };

      // Save message to Strapi with Authentication Header
      const response = await axios.post('http://localhost:1337/api/chats', formattedData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log('✅ Message saved to Strapi:', response.data);

      ws.send(JSON.stringify({
        message: messageData.message,
        Timestamp: messageData.timestamp, // Fix casing here as well
        status: 'echoed',
      }));

    } catch (error) {
      console.error('❌ Error:', error.response?.data || error.message);
      ws.send(JSON.stringify({ error: 'Failed to save message' }));
    }
  });

  ws.on('close', () => console.log('🔴 Client Disconnected'));
});

console.log('🚀 WebSocket running on ws://localhost:8080');
