export function getKilledPositions(
  field: (0 | 1 | 2 | 3)[][],
  x: number,
  y: number
) {
  const result: {
    killed: { x: number; y: number }[];
    empty: { x: number; y: number }[];
    isKilled: boolean;
  } = {
    killed: [],
    empty: [],
    isKilled: false,
  };

  if (field[y][x + 1] === 1 || field[y][x - 1] === 1) {
    return result;
  }

  result.killed.push({ y, x });

  if (y !== 0) {
    if (field[y - 1][x] === 1) return result;

    if (field[y - 1][x] === 2) {
      // to the left
      for (let i = y; i >= 0; i--) {
        if (field[i][x] === 1) return result;

        if (field[i][x] !== 2) break;

        result.killed.push({ y: i, x });
      }
    }
  }

  if (y !== 9) {
    if (field[y + 1][x] === 1) return result;

    if (field[y + 1][x] === 2) {
      // to the right
      for (let i = y; i < 10; i++) {
        if (field[i][x] === 1) return result;

        if (field[i][x] !== 2) break;

        result.killed.push({ y: i, x });
      }
    }
  }

  if (field[y][x - 1] === 2) {
    // to the top
    for (let i = x; i >= 0; i--) {
      if (field[y][i] === 1) return result;

      if (field[y][i] !== 2) break;

      result.killed.push({ y, x: i });
    }
  }

  if (field[y][x + 1] === 2) {
    // to the bottom
    for (let i = x; i < 10; i++) {
      if (field[y][i] === 1) return result;

      if (field[y][i] !== 2) break;

      result.killed.push({ y, x: i });
    }
  }

  result.killed.forEach((killed) => {
    let position;

    if (killed.y !== 0) {
      // top
      position = { y: killed.y - 1, x: killed.x };

      if (!result.killed.includes(position)) {
        result.empty.push(position);
      }

      if (killed.x !== 0) {
        // top left
        position = { y: killed.y - 1, x: killed.x - 1 };

        if (!result.killed.includes(position)) {
          result.empty.push(position);
        }
      }

      if (killed.x !== 9) {
        // top right
        position = { y: killed.y - 1, x: killed.x + 1 };

        if (!result.killed.includes(position)) {
          result.empty.push(position);
        }
      }
    }

    if (killed.y !== 9) {
      // bottom
      position = { y: killed.y + 1, x: killed.x };

      if (!result.killed.includes(position)) {
        result.empty.push(position);
      }

      if (killed.x !== 0) {
        // bottom left
        position = { y: killed.y + 1, x: killed.x - 1 };

        if (!result.killed.includes(position)) {
          result.empty.push(position);
        }
      }

      if (killed.x !== 9) {
        // bottom right
        position = { y: killed.y + 1, x: killed.x + 1 };

        if (!result.killed.includes(position)) {
          result.empty.push(position);
        }
      }
    }

    if (killed.x !== 0) {
      // left
      position = { y: killed.y, x: killed.x - 1 };

      if (!result.killed.includes(position)) {
        result.empty.push(position);
      }
    }

    if (killed.x !== 9) {
      // right
      position = { y: killed.y, x: killed.x + 1 };

      if (!result.killed.includes(position)) {
        result.empty.push(position);
      }
    }
  });

  result.isKilled = true;

  return result;
}
