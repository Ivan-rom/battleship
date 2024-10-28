import { AttackStatus } from "./types";

type Position = {
  x: number;
  y: number;
};

export function getKilledPositions(
  field: AttackStatus[][],
  x: number,
  y: number
) {
  const result: {
    killed: Position[];
    empty: Position[];
    isKilled: boolean;
  } = {
    killed: [],
    empty: [],
    isKilled: false,
  };

  if (
    field[y][x + 1] === AttackStatus.SHIP ||
    field[y][x - 1] === AttackStatus.SHIP
  ) {
    return result;
  }

  result.killed.push({ y, x });

  if (y !== 0) {
    if (field[y - 1][x] === AttackStatus.SHIP) return result;

    if (field[y - 1][x] === AttackStatus.SHOT) {
      // to the left
      for (let i = y; i >= 0; i--) {
        if (field[i][x] === AttackStatus.SHIP) return result;

        if (field[i][x] !== AttackStatus.SHOT) break;

        result.killed.push({ y: i, x });
      }
    }
  }

  if (y !== 9) {
    if (field[y + 1][x] === AttackStatus.SHIP) return result;

    if (field[y + 1][x] === AttackStatus.SHOT) {
      // to the right
      for (let i = y; i < 10; i++) {
        if (field[i][x] === AttackStatus.SHIP) return result;

        if (field[i][x] !== AttackStatus.SHOT) break;

        result.killed.push({ y: i, x });
      }
    }
  }

  if (field[y][x - 1] === AttackStatus.SHOT) {
    // to the top
    for (let i = x; i >= 0; i--) {
      if (field[y][i] === AttackStatus.SHIP) return result;

      if (field[y][i] !== AttackStatus.SHOT) break;

      result.killed.push({ y, x: i });
    }
  }

  if (field[y][x + 1] === AttackStatus.SHOT) {
    // to the bottom
    for (let i = x; i < 10; i++) {
      if (field[y][i] === AttackStatus.SHIP) return result;

      if (field[y][i] !== AttackStatus.SHOT) break;

      result.killed.push({ y, x: i });
    }
  }

  result.empty = getEmptyPositions(field, result.killed);

  result.isKilled = true;

  return result;
}

function getEmptyPositions(field: AttackStatus[][], killed: Position[]) {
  const result: Position[] = [];

  killed.forEach((killedPosition) => {
    let position;

    if (killedPosition.y !== 0) {
      // top
      position = { y: killedPosition.y - 1, x: killedPosition.x };

      if (!killed.includes(position) && isEmpty(field, position)) {
        result.push(position);
      }

      if (killedPosition.x !== 0) {
        // top left
        position = { y: killedPosition.y - 1, x: killedPosition.x - 1 };

        if (!killed.includes(position) && isEmpty(field, position)) {
          result.push(position);
        }
      }

      if (killedPosition.x !== 9) {
        // top right
        position = { y: killedPosition.y - 1, x: killedPosition.x + 1 };

        if (!killed.includes(position) && isEmpty(field, position)) {
          result.push(position);
        }
      }
    }

    if (killedPosition.y !== 9) {
      // bottom
      position = { y: killedPosition.y + 1, x: killedPosition.x };

      if (!killed.includes(position) && isEmpty(field, position)) {
        result.push(position);
      }

      if (killedPosition.x !== 0) {
        // bottom left
        position = { y: killedPosition.y + 1, x: killedPosition.x - 1 };

        if (!killed.includes(position) && isEmpty(field, position)) {
          result.push(position);
        }
      }

      if (killedPosition.x !== 9) {
        // bottom right
        position = { y: killedPosition.y + 1, x: killedPosition.x + 1 };

        if (!killed.includes(position) && isEmpty(field, position)) {
          result.push(position);
        }
      }
    }

    if (killedPosition.x !== 0) {
      // left
      position = { y: killedPosition.y, x: killedPosition.x - 1 };

      if (!killed.includes(position) && isEmpty(field, position)) {
        result.push(position);
      }
    }

    if (killedPosition.x !== 9) {
      // right
      position = { y: killedPosition.y, x: killedPosition.x + 1 };

      if (!killed.includes(position) && isEmpty(field, position)) {
        result.push(position);
      }
    }
  });

  return result;
}

function isEmpty(field: AttackStatus[][], { x, y }: Position) {
  return field[y][x] === AttackStatus.EMPTY;
}
