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
    let error = "";

    if (this.users.find((user) => user.name === name)) {
      error = "User with this name already exists";
    }

    const newUser: User = { name, password, index: this.users.length + 1 };

    if (!error) this.users.push(newUser);

    return { ...newUser, error: Boolean(error), errorText: error };
  }
}
