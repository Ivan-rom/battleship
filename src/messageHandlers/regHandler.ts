import { DB } from "../db";
import { getResponse } from "../utils/methods";
import { Client, MessageTypes, RegRequest } from "../utils/types";

export function regHandler(
  db: DB,
  clients: Client[],
  { client, user }: Client,
  { data: { name, password } }: RegRequest
) {
  const existedUser = db.getUser(name);

  let response = { type: MessageTypes.REG, data: "", id: 0 };

  if (existedUser) {
    if (existedUser.password === password) {
      response.data = JSON.stringify({
        ...existedUser,
        error: false,
        errorText: "",
      });

      user.name = existedUser.name;
      user.index = existedUser.index;
    } else {
      response.data = JSON.stringify({
        ...existedUser,
        error: true,
        errorText: "Wrong password",
      });
    }
  } else {
    const newUser = db.addUser(name, password);

    response.data = JSON.stringify({
      ...newUser,
      error: false,
      errorText: "",
    });

    user.name = newUser.name;
    user.index = newUser.index;
  }

  client.send(JSON.stringify(response));

  clients.forEach((currentClient) => {
    currentClient.client.send(
      getResponse(MessageTypes.UPDATE_WINNERS, db.winners)
    );
    currentClient.client.send(
      getResponse(MessageTypes.UPDATE_ROOM, db.getAvailableRooms())
    );
  });
}
