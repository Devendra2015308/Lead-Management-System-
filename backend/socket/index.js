const connectedUsers = new Map();

module.exports = (io) => {
  io.on("connection", (socket) => {
    console.log("🔌 User connected:", socket.id);

    socket.on("user_authenticated", (userData) => {
      if (userData?.id) {
        connectedUsers.set(socket.id, userData.id);
        socket.join(`user_${userData.id}`);

        if (userData.role === "admin") {
          socket.join("admin_room");
          console.log(`👨‍💼 Admin ${userData.id} joined admin room`);
        }
      }
    });

    socket.on("disconnect", () => {
      const userId = connectedUsers.get(socket.id);
      console.log("🔌 Disconnected:", userId || socket.id);
      connectedUsers.delete(socket.id);
    });
  });

  return {
    emitNewLead: (lead) => io.to("admin_room").emit("new_lead", lead),
    emitLeadUpdate: (lead) => {
      io.emit("lead_updated", lead);
      if (lead.assignedTo)
        io.to(`user_${lead.assignedTo}`).emit("lead_assigned", lead);
    },
  };
};
