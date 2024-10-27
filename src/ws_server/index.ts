import { RawData, WebSocket, WebSocketServer } from "ws";
import { parseMessage } from "../utils/methods";
import { MessageTypes } from "../utils/types";
import { DB } from "../db";

type Client = {
  client: WebSocket;
  user: { name: string; index: number | string };
};

const db = new DB();
const clients: Client[] = [];

const wss = new WebSocketServer({ port: 3000 });

wss.on("connection", clientHandler);

function clientHandler(client: WebSocket) {
  console.log("Client connection");

  const clientData = { client, user: { name: "", index: 0 } };

  clients.push(clientData);

  client.on("message", messageHandler(clientData));

  client.on("close", () => {
    console.log("Client connection closed");
  });
}

const messageHandler =
  ({ client, user }: Client) =>
  async (msg: RawData) => {
    try {
      const message = await parseMessage(msg);

      switch (message.type) {
        case MessageTypes.REG:
          const existedUser = db.getUser(message.data.name);

          let response = { type: MessageTypes.REG, data: "", id: 0 };

          if (existedUser) {
            if (existedUser.password === message.data.password) {
              response.data = JSON.stringify({
                ...existedUser,
                error: false,
                errorText: "",
              });
            } else {
              response.data = JSON.stringify({
                ...existedUser,
                error: true,
                errorText: "Wrong password",
              });
            }
          } else {
            const newUser = db.addUser(
              message.data.name,
              message.data.password
            );

            response.data = JSON.stringify({
              ...newUser,
              error: false,
              errorText: "",
            });

            user.name = newUser.name;
            user.index = newUser.index;
          }

          client.send(JSON.stringify(response));

          clients.forEach((currentClient) => {
            currentClient.client.send(
              JSON.stringify({
                type: MessageTypes.UPDATE_WINNERS,
                id: 0,
                data: JSON.stringify(db.winners),
              })
            );

            currentClient.client.send(
              JSON.stringify({
                type: MessageTypes.UPDATE_ROOM,
                id: 0,
                data: JSON.stringify(db.getAvailableRooms()),
              })
            );
          });

          break;

        case MessageTypes.CREATE_ROOM:
          const newRoom = db.createRoom();
          const createError = db.addUserToRoom(newRoom.roomId, user.index);

          if (createError) return client.send(createError);

          clients.forEach((currentClient) => {
            currentClient.client.send(
              JSON.stringify({
                id: 0,
                type: MessageTypes.UPDATE_ROOM,
                data: JSON.stringify(db.getAvailableRooms()),
              })
            );
          });
          break;

        case MessageTypes.ADD_USER_TO_ROOM:
          const addError = db.addUserToRoom(message.data.indexRoom, user.index);

          if (addError) return client.send(addError);

          const room = db.getRoomByIndex(message.data.indexRoom);

          if (room?.roomUsers.length === 2) {
            const player1 = room.roomUsers[0];
            const player2 = room.roomUsers[1];
            const game = db.createGame(player1.index, player2.index);

            const client1 = clients.find(
              (el) => el.user.index === player1.index
            );
            const client2 = clients.find(
              (el) => el.user.index === player2.index
            );

            client1?.client.send(
              JSON.stringify({
                id: 0,
                type: MessageTypes.CREATE_GAME,
                data: JSON.stringify({
                  idGame: game.idGame,
                  idPlayer: player1.index,
                }),
              })
            );

            client2?.client.send(
              JSON.stringify({
                id: 0,
                type: MessageTypes.CREATE_GAME,
                data: JSON.stringify({
                  idGame: game.idGame,
                  idPlayer: player2.index,
                }),
              })
            );
          }

          clients.forEach((currentClient) => {
            currentClient.client.send(
              JSON.stringify({
                id: 0,
                type: MessageTypes.UPDATE_ROOM,
                data: JSON.stringify(db.getAvailableRooms()),
              })
            );
          });
          break;

        default:
          break;
      }
      console.log(message);
    } catch (error) {
      console.log(error);
    }
  };
