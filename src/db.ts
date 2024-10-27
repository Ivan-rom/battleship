type User = {
  name: string;
  password: string;
  index: number | string;
};

type Winner = {
  name: string;
  wins: number;
};

type Room = {
  roomId: number | string;
  roomUsers: {
    name: string;
    index: number | string;
  }[];
};

type Game = {
  idGame: number | string;
  player1: number | string;
  player2: number | string;
};

export class DB {
  users: User[];
  winners: Winner[];
  rooms: Room[];
  games: Game[];

  constructor() {
    this.users = [];
    this.winners = [];
    this.rooms = [];
    this.games = [];
  }

  addUser(name: string, password: string) {
    const newUser: User = { name, password, index: this.users.length + 1 };

    this.users.push(newUser);

    return newUser;
  }

  getUser(name: string) {
    return this.users.find((user) => user.name === name);
  }

  createRoom() {
    const newRoom: Room = {
      roomId: this.rooms.length + 1,
      roomUsers: [],
    };
    this.rooms.push(newRoom);
    return newRoom;
  }

  addUserToRoom(roomId: number | string, userIndex: number | string) {
    const room = this.rooms
      .filter((el) => el.roomUsers.length < 2)
      .find((el) => el.roomId === roomId);

    if (!room) return "Room is not available";

    if (room.roomUsers.find((user) => user.index === userIndex))
      return "You are already in room";

    const user = this.users.find((el) => el.index === userIndex);

    room.roomUsers.push(user!);
  }

  getAvailableRooms() {
    const filteredRooms = this.rooms.filter(
      (room) => room.roomUsers.length === 1
    );
    return filteredRooms;
  }

  getRoomByIndex(roomId: number | string) {
    return this.rooms.find((room) => room.roomId === roomId);
  }

  createGame(playerIndex1: number | string, playerIndex2: number | string) {
    const game: Game = {
      idGame: this.games.length + 1,
      player1: playerIndex1,
      player2: playerIndex2,
    };

    this.games.push(game);

    return game;
  }
}
