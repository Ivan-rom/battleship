import { DB } from "../db";
import { getResponse } from "../utils/methods";
import { AddShipsRequest, Client, MessageTypes } from "../utils/types";

export function addShipsHandler(
  db: DB,
  clients: Client[],
  { data }: AddShipsRequest
) {
  const game = db.getGameById(data.gameId);

  db.addShips(data.gameId, data.indexPlayer, data.ships);

  if (game?.players.every((player) => player.ships.length !== 0)) {
    const gameClient1 = clients.find(
      (el) => game.players[0].index === el.user.index
    );
    const gameClient2 = clients.find(
      (el) => game.players[1].index === el.user.index
    );

    gameClient1!.client.send(
      getResponse(MessageTypes.START_GAME, {
        currentPlayerIndex: game.players[0].index,
        ships: game.players[0].ships,
      })
    );

    gameClient2!.client.send(
      getResponse(MessageTypes.START_GAME, {
        currentPlayerIndex: game.players[1].index,
        ships: game.players[1].ships,
      })
    );

    const turnMessage = getResponse(MessageTypes.TURN, {
      currentPlayer: game.players[0].index,
    });

    gameClient1?.client.send(turnMessage);
    gameClient2?.client.send(turnMessage);
  }
}
