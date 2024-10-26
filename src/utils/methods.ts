import { RawData } from "ws";
import { Message, MessageTypes } from "./types";

export async function parseMessage(message: RawData) {
  const messageString = message.toString();

  const parsedMessage = JSON.parse(messageString);
  parsedMessage.data = JSON.parse(parsedMessage.data);

  const messageData = parsedMessage as Message;

  return messageData;
}
