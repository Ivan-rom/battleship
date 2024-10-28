import { generateId } from "./utils/methods";
import { AttackStatus, Ship } from "./utils/types";

type User = {
  name: string;
  password: string;
  index: string;
};

type Winner = {
  name: string;
  wins: number;
};

type Room = {
  roomId: string;
  roomUsers: {
    name: string;
    index: string;
  }[];
};

type Game = {
  idGame: string;
  turn: string;
  players: [
    {
      index: string;
      ships: Ship[];
      playerField: AttackStatus[][];
    },
    {
      index: string;
      ships: Ship[];
      playerField: AttackStatus[][];
    }
  ];
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
    const newUser: User = { name, password, index: generateId() };

    this.users.push(newUser);

    return newUser;
  }

  getUser(name: string) {
    return this.users.find((user) => user.name === name);
  }

  createRoom() {
    const newRoom: Room = {
      roomId: generateId(),
      roomUsers: [],
    };
    this.rooms.push(newRoom);
    return newRoom;
  }

  removeRoom(roomId: string) {
    const roomIndex = this.rooms.findIndex((el) => el.roomId === roomId);

    if (roomIndex === -1) return "Room not found";

    this.rooms.splice(roomIndex, 1);
  }

  addUserToRoom(roomId: string, userIndex: string) {
    const room = this.rooms
      .filter((el) => el.roomUsers.length < 2)
      .find((el) => el.roomId === roomId);

    if (!room) return "Room is not available";

    if (room.roomUsers.find((user) => user.index === userIndex))
      return "You are already in room";

    const user = this.users.find((el) => el.index === userIndex);

    const prevRoomIndex = this.rooms.findIndex((el) =>
      el.roomUsers.some(({ index }) => index === userIndex)
    );

    if (prevRoomIndex !== -1) {
      const prevRoom = this.rooms[prevRoomIndex];

      if (prevRoom.roomUsers[0].index === userIndex) {
        prevRoom.roomUsers.shift();
      } else {
        prevRoom.roomUsers.pop();
      }

      if (prevRoom.roomUsers.length === 0) {
        this.rooms.splice(prevRoomIndex, 1);
      }
    }

    room.roomUsers.push(user!);
  }

  getAvailableRooms() {
    const filteredRooms = this.rooms.filter(
      (room) => room.roomUsers.length === 1
    );
    return filteredRooms;
  }

  getRoomByIndex(roomId: string) {
    return this.rooms.find((room) => room.roomId === roomId);
  }

  createGame(playerIndex1: string, playerIndex2: string) {
    const game: Game = {
      idGame: generateId(),
      turn: playerIndex1,
      players: [
        {
          index: playerIndex1,
          ships: [],
          playerField: [],
        },
        {
          index: playerIndex2,
          ships: [],
          playerField: [],
        },
      ],
    };

    this.games.push(game);

    return game;
  }

  removeGameById(idGame: string) {
    const gameIndex = this.games.findIndex((el) => el.idGame === idGame);

    if (gameIndex === -1) return "Game is not found";

    this.games.splice(gameIndex, 1);
  }

  addShips(idGame: string, playerIndex: string, ships: Ship[]) {
    const game = this.games.find((el) => el.idGame === idGame);

    const player = game?.players.find((el) => el.index === playerIndex)!;

    player.ships = ships;

    for (let i = 0; i < 10; i++) {
      const line = new Array(10).fill(AttackStatus.EMPTY);
      player.playerField.push(line);
    }

    ships.forEach(({ position, length, direction }) => {
      player.playerField[position.y][position.x] = AttackStatus.SHIP;

      if (length === 1) return;

      for (let i = 1; i < length; i++) {
        if (direction) {
          player.playerField[position.y + i][position.x] = AttackStatus.SHIP;
        } else {
          player.playerField[position.y][position.x + i] = AttackStatus.SHIP;
        }
      }
    });
  }

  getGameById(idGame: string) {
    return this.games.find((el) => el.idGame === idGame);
  }

  updateWinners(playerIndex: string) {
    const player = this.users.find((el) => el.index === playerIndex)!;
    const winnerIndex = this.winners.findIndex((el) => el.name === player.name);

    if (winnerIndex === -1) {
      const newWinner = { name: player.name, wins: 1 };
      this.winners.push(newWinner);
      return this.winners;
    }

    this.winners[winnerIndex].wins += 1;
    this.winners.sort((a, b) => a.wins - b.wins);
    return this.winners;
  }
}
