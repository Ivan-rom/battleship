import { RawData } from "ws";
import { AttackRequest, Client, MessageTypes } from "./types";
import { getRandomAttack, parseRequest } from "./methods";
import { DB } from "../db";
import { attackHandler } from "../messageHandlers/attackHandler";
import { regHandler } from "../messageHandlers/regHandler";
import { addShipsHandler } from "../messageHandlers/addShipsHandler";
import { createRoomHandler } from "../messageHandlers/createRoomHandler";
import { addUserToRoomHandler } from "../messageHandlers/addUserToRoomHandler";
import { randomAttackHandler } from "../messageHandlers/randomAttackHandler";
import { singlePlayHandler } from "../messageHandlers/sinlePlayHandler";

export const messageHandler =
  (client: Client, clients: Client[], db: DB) => async (msg: RawData) => {
    try {
      const request = await parseRequest(msg);

      switch (request.type) {
        case MessageTypes.REG:
          regHandler(db, clients, client, request);
          break;

        case MessageTypes.CREATE_ROOM:
          createRoomHandler(db, clients, client);
          break;

        case MessageTypes.ADD_USER_TO_ROOM:
          addUserToRoomHandler(db, clients, client, request);
          break;

        case MessageTypes.ADD_SHIPS:
          addShipsHandler(db, clients, request);
          break;

        case MessageTypes.ATTACK:
          attackHandler(db, clients, request);
          break;

        case MessageTypes.RANDOM_ATTACK:
          randomAttackHandler(db, clients, request);
          break;

        case MessageTypes.SINGLE_PLAY:
          singlePlayHandler(db, client);
          break;

        default:
          break;
      }
      // console.log(request);
    } catch (error) {
      console.log(error);
    }
  };
