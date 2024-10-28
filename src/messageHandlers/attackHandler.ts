import { DB } from "../db";
import { getKilledPositions } from "../utils/getKilledPostions";
import { getResponse } from "../utils/methods";
import { AttackRequest, Client, MessageTypes } from "../utils/types";

export function attackHandler(
  db: DB,
  clients: Client[],
  { data: { gameId, indexPlayer, x, y } }: AttackRequest
) {
  const gameAttack = db.getGameById(gameId);

  const attackedPlayer = gameAttack?.players.find(
    (el) => el.index !== indexPlayer
  );

  const gameClients = clients.filter((el) =>
    gameAttack?.players.some((player) => player.index === el.user.index)
  );

  let dataFeedback: {
    position: {
      x: number;
      y: number;
    };
    currentPlayer: number | string;
    status: "miss" | "killed" | "shot";
  } = {
    position: { x, y },
    currentPlayer: indexPlayer,
    status: "miss",
  };

  if (
    attackedPlayer?.playerField[y][x] !== 0 &&
    attackedPlayer?.playerField[y][x] !== 1
  )
    return;

  let isFinish = false;

  if (attackedPlayer?.playerField[y][x] === 1) {
    dataFeedback.status = "shot";

    attackedPlayer.playerField[y][x] = 2;

    const shootPositions = getKilledPositions(attackedPlayer.playerField, x, y);

    if (shootPositions.isKilled) {
      dataFeedback.status = "killed";

      shootPositions.empty.forEach(({ x, y }) => {
        attackedPlayer.playerField[y][x] = 3;

        gameClients.forEach((currentClient) => {
          currentClient.client.send(
            getResponse(MessageTypes.ATTACK, {
              position: { x, y },
              currentPlayer: indexPlayer,
              status: "miss",
            })
          );
        });
      });

      shootPositions.killed.forEach(({ x, y }) => {
        attackedPlayer.playerField[y][x] = 2;

        gameClients.forEach((currentClient) => {
          currentClient.client.send(
            getResponse(MessageTypes.ATTACK, {
              position: { x, y },
              currentPlayer: indexPlayer,
              status: "killed",
            })
          );
        });
      });
    }
  } else {
    attackedPlayer.playerField[y][x] = 3;
  }

  gameClients.forEach((currentClient) => {
    currentClient.client.send(getResponse(MessageTypes.ATTACK, dataFeedback));

    if (dataFeedback.status === "miss") {
      currentClient.client.send(
        getResponse(MessageTypes.TURN, {
          currentPlayer: attackedPlayer?.index,
        })
      );
    }

    if (attackedPlayer.playerField.every((row) => !row.includes(1))) {
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
