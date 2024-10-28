import { getRandomNumber } from "./methods";
import { AttackStatus, Ship, ShipTypes } from "./types";

const SHIPS = [
  {
    type: ShipTypes.HUGE,
    length: 4,
  },
  {
    type: ShipTypes.LARGE,
    length: 3,
  },
  {
    type: ShipTypes.LARGE,
    length: 3,
  },
  {
    type: ShipTypes.MEDIUM,
    length: 2,
  },
  {
    type: ShipTypes.MEDIUM,
    length: 2,
  },
  {
    type: ShipTypes.MEDIUM,
    length: 2,
  },
  {
    type: ShipTypes.SMALL,
    length: 1,
  },
  {
    type: ShipTypes.SMALL,
    length: 1,
  },
  {
    type: ShipTypes.SMALL,
    length: 1,
  },
  {
    type: ShipTypes.SMALL,
    length: 1,
  },
];

export function generateBotShips() {
  const field = [];

  const ships: Ship[] = [];

  for (let i = 0; i < 10; i++) {
    const line = new Array(10).fill(AttackStatus.EMPTY);
    field.push(line);
  }

  for (const { length, type } of SHIPS) {
    let isAvailable = false;

    while (!isAvailable) {
      const x = getRandomNumber(0, 10);
      const y = getRandomNumber(0, 10);
      const direction = Math.random() > 0.5;

      if (canPlaceShip(field, x, y, length, direction)) {
        isAvailable = true;
        placeShip(field, x, y, length, direction);

        ships.push({ position: { x, y }, length, direction, type });
        break;
      }
    }
  }

  return ships;
}

function placeShip(
  field: AttackStatus[][],
  x: number,
  y: number,
  length: number,
  direction: boolean
) {
  for (let i = 0; i < length; i++) {
    const currentX = x + (direction ? 0 : i);
    const currentY = y + (direction ? i : 0);

    field[currentY][currentX] = AttackStatus.SHIP;
  }
}

function canPlaceShip(
  field: AttackStatus[][],
  x: number,
  y: number,
  length: number,
  direction: boolean
) {
  for (let i = 0; i < length; i++) {
    const currentX = x + (direction ? 0 : i);
    const currentY = y + (direction ? i : 0);

    if (
      currentX >= 10 ||
      currentY >= 10 ||
      field[currentY][currentX] !== AttackStatus.EMPTY
    ) {
      return false;
    }

    if (currentY !== 0) {
      // top
      if (field[currentY - 1][currentX] === AttackStatus.SHIP) return false;
      // top left
      if (field[currentY - 1][currentX - 1] === AttackStatus.SHIP) return false;
      //top right
      if (field[currentY - 1][currentX + 1] === AttackStatus.SHIP) return false;
    }

    if (currentY !== 9) {
      // bottom
      if (field[currentY + 1][currentX] === AttackStatus.SHIP) return false;
      // bottom left
      if (field[currentY + 1][currentX - 1] === AttackStatus.SHIP) return false;
      // bottom right
      if (field[currentY + 1][currentX + 1] === AttackStatus.SHIP) return false;
    }

    //  left
    if (field[currentY][currentX - 1] === AttackStatus.SHIP) return false;
    // right
    if (field[currentY][currentX + 1] === AttackStatus.SHIP) return false;
  }

  return true;
}
