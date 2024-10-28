import { DB } from "../db";
import { getResponse } from "../utils/methods";
import { AddUserToRoomRequest, Client, MessageTypes } from "../utils/types";

export function addUserToRoomHandler(
  db: DB,
  clients: Client[],
  { client, user }: Client,
  { data }: AddUserToRoomRequest
) {
  const error = db.addUserToRoom(data.indexRoom, user.index);

  if (error) return client.send(error);

  const room = db.getRoomByIndex(data.indexRoom);

  if (room?.roomUsers.length === 2) {
    const [player1, player2] = room.roomUsers;

    db.removeRoom(data.indexRoom);

    const game = db.createGame(player1.index, player2.index);

    const client1 = clients.find((el) => el.user.index === player1.index);
    const client2 = clients.find((el) => el.user.index === player2.index);

    client1?.client.send(
      getResponse(MessageTypes.CREATE_GAME, {
        idGame: game.idGame,
        idPlayer: player1.index,
      })
    );

    client2?.client.send(
      getResponse(MessageTypes.CREATE_GAME, {
        idGame: game.idGame,
        idPlayer: player2.index,
      })
    );
  }

  clients.forEach((currentClient) => {
    currentClient.client.send(
      getResponse(MessageTypes.UPDATE_ROOM, db.getAvailableRooms())
    );
  });
}
