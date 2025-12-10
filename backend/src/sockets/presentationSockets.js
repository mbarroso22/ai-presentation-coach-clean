// For handling real-time events like advancing slides, joining sessions, etc.

const activeSessions = {}; 
// structure: { [presentationId]: { currentSlideIndex, listeners: Set<socket.id> } }

function registerPresentationSockets(io, socket) {
  // Join a presentation room
  socket.on("join_presentation", ({ presentationId }) => {
    const roomName = `presentation_${presentationId}`;
    socket.join(roomName);

    if (!activeSessions[presentationId]) {
      activeSessions[presentationId] = {
        currentSlideIndex: 0,
      };
    }

    socket.emit("presentation_state", {
      presentationId,
      currentSlideIndex: activeSessions[presentationId].currentSlideIndex,
    });

    console.log(`Socket ${socket.id} joined room ${roomName}`);
  });

  // Advance slide
  socket.on("advance_slide", ({ presentationId, newIndex }) => {
    if (!activeSessions[presentationId]) {
      activeSessions[presentationId] = { currentSlideIndex: 0 };
    }

    activeSessions[presentationId].currentSlideIndex = newIndex;

    const roomName = `presentation_${presentationId}`;
    io.to(roomName).emit("slide_changed", {
      presentationId,
      currentSlideIndex: newIndex,
    });

    console.log(
      `Presentation ${presentationId} changed to slide index ${newIndex}`
    );
  });

  // Optional: previous_slide
  socket.on("previous_slide", ({ presentationId, newIndex }) => {
    if (!activeSessions[presentationId]) {
      activeSessions[presentationId] = { currentSlideIndex: 0 };
    }
    activeSessions[presentationId].currentSlideIndex = newIndex;

    const roomName = `presentation_${presentationId}`;
    io.to(roomName).emit("slide_changed", {
      presentationId,
      currentSlideIndex: newIndex,
    });

    console.log(
      `Presentation ${presentationId} changed to slide index ${newIndex} (previous)`
    );
  });
}

module.exports = {
  registerPresentationSockets,
};
