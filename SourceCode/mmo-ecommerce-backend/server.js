// server.js
const app = require('./src/app'); // Import app instance từ app.js
require('dotenv').config(); // Đảm bảo biến môi trường được load ở entry point

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});