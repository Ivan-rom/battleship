import { RawData } from "ws";
import { Request, MessageTypes, MessageDraft, AttackStatus } from "./types";

export async function parseRequest(message: RawData) {
  const messageString = message.toString();

  const parsedMessage = JSON.parse(messageString);

  if (parsedMessage.type !== MessageTypes.CREATE_ROOM) {
    parsedMessage.data = JSON.parse(parsedMessage.data);
  }

  const messageData = parsedMessage as Request;

  return messageData;
}

export function getResponse(type: MessageTypes, data: any) {
  const response: MessageDraft<typeof type, string> = {
    id: 0,
    type,
    data: JSON.stringify(data),
  };

  return JSON.stringify(response);
}

export function getRandomNumber(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

export function getRandomAttack(field: AttackStatus[][]) {
  const randomX = getRandomNumber(0, 9);
  const randomY = getRandomNumber(0, 9);

  if (
    field[randomY][randomX] === AttackStatus.KILLED ||
    field[randomY][randomX] === AttackStatus.MISS ||
    field[randomY][randomX] === AttackStatus.SHOT
  ) {
    return getRandomAttack(field);
  }

  return {
    x: randomX,
    y: randomY,
  };
}
