import { WebSocket, WebSocketServer } from "ws";
import { Client } from "../utils/types";
import { DB } from "../db";
import { messageHandler } from "../utils/messageHandler";

const db = new DB();
const clients: Client[] = [];

const wss = new WebSocketServer({ port: 3000 });

wss.on("connection", clientHandler);

function clientHandler(client: WebSocket) {
  console.log("Client connection");

  const clientData = { client, user: { name: "", index: 0 } };

  clients.push(clientData);

  client.on("message", messageHandler(clientData, clients, db));

  client.on("close", () => {
    const clientIndex = clients.findIndex((el) => el.client === client);
    clients.splice(clientIndex, 1);
    console.log(`Client connection closed`);
  });
}
