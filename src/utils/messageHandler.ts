import { RawData } from "ws";
import { Client, MessageTypes } from "./types";
import { getKilledPositions, parseMessage } from "./methods";
import { DB } from "../db";

export const messageHandler =
  ({ client, user }: Client, clients: Client[], db: DB) =>
  async (msg: RawData) => {
    try {
      const message = await parseMessage(msg);

      switch (message.type) {
        case MessageTypes.REG:
          const existedUser = db.getUser(message.data.name);

          let response = { type: MessageTypes.REG, data: "", id: 0 };

          if (existedUser) {
            if (existedUser.password === message.data.password) {
              response.data = JSON.stringify({
                ...existedUser,
                error: false,
                errorText: "",
              });
            } else {
              response.data = JSON.stringify({
                ...existedUser,
                error: true,
                errorText: "Wrong password",
              });
            }
          } else {
            const newUser = db.addUser(
              message.data.name,
              message.data.password
            );

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
              JSON.stringify({
                type: MessageTypes.UPDATE_WINNERS,
                id: 0,
                data: JSON.stringify(db.winners),
              })
            );

            currentClient.client.send(
              JSON.stringify({
                type: MessageTypes.UPDATE_ROOM,
                id: 0,
                data: JSON.stringify(db.getAvailableRooms()),
              })
            );
          });

          break;

        case MessageTypes.CREATE_ROOM:
          const newRoom = db.createRoom();
          const createError = db.addUserToRoom(newRoom.roomId, user.index);

          if (createError) return client.send(createError);

          clients.forEach((currentClient) => {
            currentClient.client.send(
              JSON.stringify({
                id: 0,
                type: MessageTypes.UPDATE_ROOM,
                data: JSON.stringify(db.getAvailableRooms()),
              })
            );
          });
          break;

        case MessageTypes.ADD_USER_TO_ROOM:
          const addError = db.addUserToRoom(message.data.indexRoom, user.index);

          if (addError) return client.send(addError);

          const room = db.getRoomByIndex(message.data.indexRoom);

          if (room?.roomUsers.length === 2) {
            const player1 = room.roomUsers[0];
            const player2 = room.roomUsers[1];
            const game = db.createGame(player1.index, player2.index);

            const client1 = clients.find(
              (el) => el.user.index === player1.index
            );
            const client2 = clients.find(
              (el) => el.user.index === player2.index
            );

            client1?.client.send(
              JSON.stringify({
                id: 0,
                type: MessageTypes.CREATE_GAME,
                data: JSON.stringify({
                  idGame: game.idGame,
                  idPlayer: player1.index,
                }),
              })
            );

            client2?.client.send(
              JSON.stringify({
                id: 0,
                type: MessageTypes.CREATE_GAME,
                data: JSON.stringify({
                  idGame: game.idGame,
                  idPlayer: player2.index,
                }),
              })
            );
          }

          clients.forEach((currentClient) => {
            currentClient.client.send(
              JSON.stringify({
                id: 0,
                type: MessageTypes.UPDATE_ROOM,
                data: JSON.stringify(db.getAvailableRooms()),
              })
            );
          });
          break;

        case MessageTypes.ADD_SHIPS:
          const game = db.addShips(
            message.data.gameId,
            message.data.indexPlayer,
            message.data.ships
          );

          if (game?.players.every((player) => player.ships.length !== 0)) {
            const gameClient1 = clients.find(
              (el) => game.players[0].index === el.user.index
            );
            const gameClient2 = clients.find(
              (el) => game.players[1].index === el.user.index
            );

            gameClient1!.client.send(
              JSON.stringify({
                id: 0,
                type: MessageTypes.START_GAME,
                data: JSON.stringify({
                  currentPlayerIndex: game.players[0].index,
                  ships: game.players[0].ships,
                }),
              })
            );

            gameClient2!.client.send(
              JSON.stringify({
                id: 0,
                type: MessageTypes.START_GAME,
                data: JSON.stringify({
                  currentPlayerIndex: game.players[1].index,
                  ships: game.players[1].ships,
                }),
              })
            );

            const turnMessage = {
              id: 0,
              type: MessageTypes.TURN,
              data: JSON.stringify({
                currentPlayer: game.players[0].index,
              }),
            };

            gameClient1?.client.send(JSON.stringify(turnMessage));
            gameClient2?.client.send(JSON.stringify(turnMessage));
          }
          break;

        case MessageTypes.ATTACK:
          const gameAttack = db.getGameById(message.data.gameId);

          const attackedPlayer = gameAttack?.players.find(
            (el) => el.index !== message.data.indexPlayer
          );

          const gameClients = clients.filter((el) =>
            gameAttack?.players.some((player) => player.index === el.user.index)
          );

          let dataFeedback: {
            position: {
              x: number;
              y: number;
            };
            currentPlayer: number | string;
            status: "miss" | "killed" | "shot";
          } = {
            position: {
              x: message.data.x,
              y: message.data.y,
            },
            currentPlayer: message.data.indexPlayer,
            status: "miss",
          };

          const { x, y } = message.data;

          if (
            attackedPlayer?.playerField[y][x] !== 0 &&
            attackedPlayer?.playerField[y][x] !== 1
          )
            return;

          let isFinish = false;

          if (attackedPlayer?.playerField[y][x] === 1) {
            dataFeedback.status = "shot";

            attackedPlayer.playerField[y][x] = 2;

            const shootPositions = getKilledPositions(
              attackedPlayer.playerField,
              x,
              y
            );

            if (shootPositions.isKilled) {
              dataFeedback.status = "killed";

              shootPositions.empty.forEach(({ x, y }) => {
                attackedPlayer.playerField[y][x] = 3;

                gameClients.forEach((currentClient) => {
                  currentClient.client.send(
                    JSON.stringify({
                      id: 0,
                      type: MessageTypes.ATTACK,
                      data: JSON.stringify({
                        position: { x, y },
                        currentPlayer: message.data.indexPlayer,
                        status: "miss",
                      }),
                    })
                  );
                });
              });

              shootPositions.killed.forEach(({ x, y }) => {
                attackedPlayer.playerField[y][x] = 2;

                gameClients.forEach((currentClient) => {
                  currentClient.client.send(
                    JSON.stringify({
                      id: 0,
                      type: MessageTypes.ATTACK,
                      data: JSON.stringify({
                        position: { x, y },
                        currentPlayer: message.data.indexPlayer,
                        status: "killed",
                      }),
                    })
                  );
                });
              });
            }
          } else {
            attackedPlayer.playerField[y][x] = 3;
          }

          gameClients.forEach((currentClient) => {
            currentClient.client.send(
              JSON.stringify({
                id: 0,
                type: MessageTypes.ATTACK,
                data: JSON.stringify(dataFeedback),
              })
            );

            if (dataFeedback.status === "miss") {
              currentClient.client.send(
                JSON.stringify({
                  id: 0,
                  type: MessageTypes.TURN,
                  data: JSON.stringify({
                    currentPlayer: attackedPlayer?.index,
                  }),
                })
              );
            }

            if (attackedPlayer.playerField.every((row) => !row.includes(1))) {
              isFinish = true;

              currentClient.client.send(
                JSON.stringify({
                  id: 0,
                  type: MessageTypes.FINISH,
                  data: JSON.stringify({
                    winPlayer: message.data.indexPlayer,
                  }),
                })
              );
            }
          });

          if (isFinish) {
            const updatedWinners = db.updateWinners(message.data.indexPlayer);

            clients.forEach((currentClient) => {
              currentClient.client.send(
                JSON.stringify({
                  id: 0,
                  type: MessageTypes.UPDATE_WINNERS,
                  data: JSON.stringify(updatedWinners),
                })
              );
            });
          }
          break;

        default:
          break;
      }
      console.log(message);
    } catch (error) {
      console.log(error);
    }
  };
