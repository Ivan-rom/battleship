import { Ship } from "./utils/types";

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
  players: [
    {
      index: number | string;
      ships: Ship[];
      playerField: (0 | 1 | 2 | 3)[][];
    },
    {
      index: number | string;
      ships: Ship[];
      playerField: (0 | 1 | 2 | 3)[][];
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

  addShips(
    idGame: number | string,
    playerIndex: number | string,
    ships: Ship[]
  ) {
    const game = this.games.find((el) => el.idGame === idGame);

    const player = game?.players.find((el) => el.index === playerIndex)!;

    player.ships = ships;

    for (let i = 0; i < 10; i++) {
      const line = new Array(10).fill(0);
      player.playerField.push(line);
    }

    ships.forEach(({ position, length, direction }) => {
      player.playerField[position.y][position.x] = 1;

      if (length === 1) return;

      for (let i = 1; i < length; i++) {
        if (direction) {
          player.playerField[position.y + i][position.x] = 1;
        } else {
          player.playerField[position.y][position.x + i] = 1;
        }
      }
    });
    return game;
  }

  getGameById(idGame: number | string) {
    return this.games.find((el) => el.idGame === idGame);
  }

  updateWinners(playerIndex: number | string) {
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
