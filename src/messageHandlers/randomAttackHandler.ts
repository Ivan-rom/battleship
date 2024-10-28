import { DB } from "../db";
import { getRandomAttack } from "../utils/methods";
import {
  AttackRequest,
  Client,
  MessageTypes,
  RandomAttackRequest,
} from "../utils/types";
import { attackHandler } from "./attackHandler";

export function randomAttackHandler(
  db: DB,
  clients: Client[],
  { data }: RandomAttackRequest
) {
  const game = db.getGameById(data.gameId);

  const attackedPlayer = game?.players.find(
    (el) => el.index !== data.indexPlayer
  )!;

  const randomAttack = getRandomAttack(attackedPlayer.playerField);

  const attackRequest: AttackRequest = {
    id: 0,
    type: MessageTypes.ATTACK,
    data: {
      ...data,
      ...randomAttack,
    },
  };

  attackHandler(db, clients, attackRequest);
}
