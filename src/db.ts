type User = {
  name: string;
  password: string;
  index: number | string;
};

type Winner = {
  name: string;
  wins: number;
};

export class DB {
  users: User[];
  winners: Winner[];

  constructor() {
    this.users = [];
    this.winners = [];
  }

  addUser(name: string, password: string) {
    const newUser: User = { name, password, index: this.users.length + 1 };

    this.users.push(newUser);

    return newUser;
  }

  getUser(name: string) {
    return this.users.find((user) => user.name === name);
  }
}
