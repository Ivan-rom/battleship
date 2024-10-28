import { WebSocket } from "ws";

export enum MessageTypes {
  REG = "reg",
  UPDATE_WINNERS = "update_winners",
  CREATE_ROOM = "create_room",
  ADD_USER_TO_ROOM = "add_user_to_room",
  CREATE_GAME = "create_game",
  UPDATE_ROOM = "update_room",
  ADD_SHIPS = "add_ships",
  START_GAME = "start_game",
  ATTACK = "attack",
  RANDOM_ATTACK = "randomAttack",
  TURN = "turn",
  FINISH = "finish",
}

enum ShipTypes {
  SMALL = "small",
  MEDIUM = "medium",
  LARGE = "large",
  HUGE = "huge",
}

enum AttackStatus {
  MISS = "miss",
  KILLED = "killed",
  SHOT = "shot",
}

export type Ship = {
  position: {
    x: number;
    y: number;
  };
  direction: boolean;
  length: number;
  type: ShipTypes;
};

export type MessageDraft<MessageType extends MessageTypes, DataType> = {
  id: 0;
  type: MessageType;
  data: DataType;
};

export type RegRequest = MessageDraft<
  MessageTypes.REG,
  {
    name: string;
    password: string;
  }
>;

type CreateRoomRequest = MessageDraft<MessageTypes.CREATE_ROOM, "">;

export type AddUserToRoomRequest = MessageDraft<
  MessageTypes.ADD_USER_TO_ROOM,
  { indexRoom: number | string }
>;

export type AddShipsRequest = MessageDraft<
  MessageTypes.ADD_SHIPS,
  {
    gameId: string | number;
    ships: Ship[];
    indexPlayer: number | string;
  }
>;

export type AttackRequest = MessageDraft<
  MessageTypes.ATTACK,
  {
    gameId: number | string;
    x: number;
    y: number;
    indexPlayer: number | string;
  }
>;

type RandomAttackRequest = MessageDraft<
  MessageTypes.RANDOM_ATTACK,
  {
    gameId: number | string;
    indexPlayer: number | string;
  }
>;

export type Request =
  | RegRequest
  | CreateRoomRequest
  | AddUserToRoomRequest
  | AddShipsRequest
  | AttackRequest
  | RandomAttackRequest;

export type Client = {
  client: WebSocket;
  user: { name: string; index: number | string };
};
