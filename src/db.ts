type User = {
  name: string;
  password: string;
  index: number | string;
};

export class DB {
  users: User[];

  constructor() {
    this.users = [];
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
