import { RawData } from "ws";
import { Request, MessageTypes, MessageDraft } from "./types";

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
