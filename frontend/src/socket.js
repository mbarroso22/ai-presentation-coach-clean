import { io } from "socket.io-client";

// Use the same origin as the page (works on the VM and in dev with a proxy)
const socket = io({
  transports: ["websocket"],
});

export default socket;
