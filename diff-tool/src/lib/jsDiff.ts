export interface Edit {
  type: 0 | 1 | 2; // KEEP, ADD, DEL
  text: string;
}

function splitLines(text: string): string[] {
  return text.split(/\r\n|\r|\n/);
}

function computeEditPath(oldLines: string[], newLines: string[]): number[][] {
  const oldLen = oldLines.length;
  const newLen = newLines.length;
  const maxDist = oldLen + newLen;

  const furthestX = new Array<number>(2 * maxDist + 1).fill(0);
  const trace: number[][] = [];

  for (let dist = 0; dist <= maxDist; dist++) {
    trace.push(furthestX.slice());

    for (let diagonal = -dist; diagonal <= dist; diagonal += 2) {
      const idx = diagonal + maxDist;

      let x: number;
      if (
        diagonal === -dist ||
        (diagonal !== dist && furthestX[idx - 1] < furthestX[idx + 1])
      ) {
        x = furthestX[idx + 1];
      } else {
        x = furthestX[idx - 1] + 1;
      }
      let y = x - diagonal;

      while (x < oldLen && y < newLen && oldLines[x] === newLines[y]) {
        x++;
        y++;
      }

      furthestX[idx] = x;

      if (x >= oldLen && y >= newLen) {
        return trace;
      }
    }
  }
  return trace;
}

function backtrack(
  oldLines: string[],
  newLines: string[],
  trace: number[][],
  maxDist: number,
): Edit[] {
  const result: Edit[] = [];

  let x = oldLines.length;
  let y = newLines.length;

  for (let dist = trace.length - 1; dist >= 0; dist--) {
    const furthestX = trace[dist];
    const diagonal = x - y;
    const idx = diagonal + maxDist;

    const prevDiagonal =
      diagonal === -dist ||
      (diagonal !== dist && furthestX[idx - 1] < furthestX[idx + 1])
        ? diagonal + 1
        : diagonal - 1;

    const prevX = furthestX[prevDiagonal + maxDist];
    const prevY = prevX - prevDiagonal;

    while (x > prevX && y > prevY) {
      x--;
      y--;
      result.push({ type: 0, text: oldLines[x] });
    }

    if (dist > 0) {
      if (x === prevX) {
        y--;
        result.push({ type: 1, text: newLines[y] });
      } else {
        x--;
        result.push({ type: 2, text: oldLines[x] });
      }
    }
  }

  result.reverse();
  return result;
}

export function diff(oldText: string, newText: string): Edit[] {
  const oldLines = splitLines(oldText);
  const newLines = splitLines(newText);
  const maxDist = oldLines.length + newLines.length;
  const trace = computeEditPath(oldLines, newLines);
  return backtrack(oldLines, newLines, trace, maxDist);
}
