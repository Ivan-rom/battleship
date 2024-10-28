import { DB } from "../db";
import { getKilledPositions } from "../utils/getKilledPostions";
import { getResponse } from "../utils/methods";
import {
  AttackRequest,
  AttackStatus,
  Client,
  MessageTypes,
} from "../utils/types";

export function attackHandler(
  db: DB,
  clients: Client[],
  { data: { gameId, indexPlayer, x, y } }: AttackRequest
) {
  const game = db.getGameById(gameId);

  if (game?.turn !== indexPlayer) return;

  const attackedPlayer = game?.players.find((el) => el.index !== indexPlayer);

  const gameClients = clients.filter((el) =>
    game?.players.some((player) => player.index === el.user.index)
  );

  let dataFeedback: {
    position: {
      x: number;
      y: number;
    };
    currentPlayer: number | string;
    status: AttackStatus;
  } = {
    position: { x, y },
    currentPlayer: indexPlayer,
    status: AttackStatus.MISS,
  };

  if (
    attackedPlayer?.playerField[y][x] !== AttackStatus.EMPTY &&
    attackedPlayer?.playerField[y][x] !== AttackStatus.SHIP
  )
    return;

  let isFinish = false;

  if (attackedPlayer?.playerField[y][x] === AttackStatus.SHIP) {
    dataFeedback.status = AttackStatus.SHOT;

    attackedPlayer.playerField[y][x] = AttackStatus.SHOT;

    const shootPositions = getKilledPositions(attackedPlayer.playerField, x, y);

    if (shootPositions.isKilled) {
      dataFeedback.status = AttackStatus.KILLED;

      shootPositions.empty.forEach(({ x, y }) => {
        attackedPlayer.playerField[y][x] = AttackStatus.MISS;

        gameClients.forEach((currentClient) => {
          currentClient.client.send(
            getResponse(MessageTypes.ATTACK, {
              position: { x, y },
              currentPlayer: indexPlayer,
              status: AttackStatus.MISS,
            })
          );
        });
      });

      shootPositions.killed.forEach(({ x, y }) => {
        attackedPlayer.playerField[y][x] = AttackStatus.KILLED;

        gameClients.forEach((currentClient) => {
          currentClient.client.send(
            getResponse(MessageTypes.ATTACK, {
              position: { x, y },
              currentPlayer: indexPlayer,
              status: AttackStatus.KILLED,
            })
          );
        });
      });
    }
  } else {
    attackedPlayer.playerField[y][x] = AttackStatus.MISS;
  }

  gameClients.forEach((currentClient) => {
    currentClient.client.send(getResponse(MessageTypes.ATTACK, dataFeedback));

    const currentPlayer =
      dataFeedback.status === AttackStatus.MISS
        ? attackedPlayer?.index
        : indexPlayer;

    currentClient.client.send(
      getResponse(MessageTypes.TURN, { currentPlayer })
    );

    game.turn = currentPlayer;

    if (
      attackedPlayer.playerField.every(
        (row) => !row.includes(AttackStatus.SHIP)
      )
    ) {
      isFinish = true;

      currentClient.client.send(
        getResponse(MessageTypes.FINISH, {
          winPlayer: indexPlayer,
        })
      );
    }
  });

  if (isFinish) {
    const updatedWinners = db.updateWinners(indexPlayer);

    clients.forEach((currentClient) => {
      currentClient.client.send(
        getResponse(MessageTypes.UPDATE_WINNERS, updatedWinners)
      );
    });
  }
}
