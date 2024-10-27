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

type MessageDraft<MessageType extends MessageTypes, DataType> = {
  id: 0;
  type: MessageType;
  data: DataType;
};

type RegRequest = MessageDraft<
  MessageTypes.REG,
  {
    name: string;
    password: string;
  }
>;

type UpdateWinnersResponse = MessageDraft<
  MessageTypes.UPDATE_WINNERS,
  {
    name: string;
    wins: number;
  }[]
>;

type CreateRoomRequest = MessageDraft<MessageTypes.CREATE_ROOM, "">;

type AddUserToRoomRequest = MessageDraft<
  MessageTypes.ADD_USER_TO_ROOM,
  { indexRoom: number | string }
>;

type CreateGameResponse = MessageDraft<
  MessageTypes.CREATE_GAME,
  {
    idGame: number | string;
    idPlayer: number | string;
  }
>;

type UpdateRoomResponse = MessageDraft<
  MessageTypes.UPDATE_ROOM,
  {
    roomId: number | string;
    roomUsers: {
      name: string;
      index: number | string;
    }[];
  }[]
>;

type AddShipsRequest = MessageDraft<
  MessageTypes.ADD_SHIPS,
  {
    gameId: string | number;
    ships: Ship[];
    indexPlayer: number | string;
  }
>;

type StartGameResponse = MessageDraft<
  MessageTypes.START_GAME,
  {
    ships: Ship[];
    currentPlayerIndex: number | string;
  }
>;

type AttackRequest = MessageDraft<
  MessageTypes.ATTACK,
  {
    gameId: number | string;
    x: number;
    y: number;
    indexPlayer: number | string;
  }
>;

type AttackResponse = MessageDraft<
  MessageTypes.ATTACK,
  {
    position: {
      x: number;
      y: number;
    };
    currentPlayer: number | string;
    status: AttackStatus;
  }
>;

type RandomAttackRequest = MessageDraft<
  MessageTypes.RANDOM_ATTACK,
  {
    gameId: number | string;
    indexPlayer: number | string;
  }
>;

type TurnResponse = MessageDraft<
  MessageTypes.TURN,
  {
    currentPlayer: number | string;
  }
>;

type FinishResponse = MessageDraft<
  MessageTypes.FINISH,
  {
    winPlayer: number | string;
  }
>;

export type Message =
  | RegRequest
  | UpdateWinnersResponse
  | CreateRoomRequest
  | AddUserToRoomRequest
  | CreateGameResponse
  | UpdateRoomResponse
  | AddShipsRequest
  | StartGameResponse
  | AttackRequest
  | AttackResponse
  | RandomAttackRequest
  | TurnResponse
  | FinishResponse;

export type Client = {
  client: WebSocket;
  user: { name: string; index: number | string };
};
