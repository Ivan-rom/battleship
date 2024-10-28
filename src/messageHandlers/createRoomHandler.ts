import { DB } from "../db";
import { getResponse } from "../utils/methods";
import { Client, MessageTypes } from "../utils/types";

export function createRoomHandler(
  db: DB,
  clients: Client[],
  { client, user }: Client
) {
  const newRoom = db.createRoom();

  const error = db.addUserToRoom(newRoom.roomId, user.index);

  if (error) return client.send(error);

  clients.forEach((currentClient) => {
    currentClient.client.send(
      getResponse(MessageTypes.UPDATE_ROOM, db.getAvailableRooms())
    );
  });
}
