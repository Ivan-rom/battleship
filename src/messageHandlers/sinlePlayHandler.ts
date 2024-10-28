import { DB } from "../db";
import { generateBotShips } from "../utils/generateBotShips";
import { getResponse } from "../utils/methods";
import { Client, MessageTypes } from "../utils/types";

export function singlePlayHandler(db: DB, { client, user }: Client) {
  const game = db.createSingleGame(user.index);

  client.send(
    getResponse(MessageTypes.CREATE_GAME, {
      idGame: game.idGame,
      idPlayer: user.index,
    })
  );

  const botShips = generateBotShips();

  db.addShips(game.idGame, db.bot.index, botShips);
}
