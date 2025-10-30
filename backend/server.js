const http = require("http");
const mongoose = require("mongoose");
const socketIo = require("socket.io");
const app = require("./app");
// const LeadSyncService = require("./services/leadSyncService");

// Create server
const server = http.createServer(app);

// Setup socket.io
const io = socketIo(server, {
  cors: {
    origin: [
      "https://lead-management-system-black.vercel.app",
      "http://localhost:5173",
    ],
    credentials: true,
  },
});

// Socket logic import
const { emitNewLead, emitLeadUpdate } = require("./socket")(io);

// Attach to app (so controllers can use)
app.set("emitNewLead", emitNewLead);
app.set("emitLeadUpdate", emitLeadUpdate);

// Connect DB
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("✅ MongoDB Connected");
    // LeadSyncService.startSynchronization();
  })
  .catch(console.error);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 Backend running on ${PORT}`));
