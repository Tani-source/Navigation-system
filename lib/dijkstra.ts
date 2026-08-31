/**
 * Mathematical Engine for Predictive Routing & Discrete Mathematics Visualization
 * 
 * Vertices V = {0, 1, ..., N-1} where N = 100 for a 10x10 grid.
 * Graph is represented strictly by an N x N (100x100) Adjacency Matrix W.
 * 
 * Discrete Math Concepts:
 * - V: Set of all vertices {0..99}
 * - E: Set of edges (u, v) where W[u][v] < Infinity
 * - S: Finalized vertices set with settled minimum distance d(v)
 * - Q: Unvisited candidate set (Q = V \ S)
 * - d(v): Distance vector from source vertex s to vertex v
 * - π(v): Predecessor pointer array for path reconstruction
 */

export const GRID_ROWS = 10;
export const GRID_COLS = 10;
export const TOTAL_NODES = GRID_ROWS * GRID_COLS; // 100 vertices

export interface DijkstraStep {
  setS: Set<number>;          // Finalized nodes with settled shortest path
  setQ: Set<number>;          // Unvisited node priority queue set
  distances: number[];        // Distance array d(v)
  previous: (number | null)[];// Predecessor pointers π(v)
  currentNode: number | null; // Currently selected vertex u = argmin_{v ∈ Q} d(v)
  evaluatingNeighbor: number | null; // Neighbor v being relaxed
  path: number[];             // Reconstructed path array
  phase: 'init' | 'exploring' | 'relaxing' | 'found' | 'unreachable';
  relaxedNodes: Set<number>;  // Nodes that have been discovered/relaxed but not yet finalized in S
}

/**
 * Returns (row, col) coordinates for a node index 0..99
 */
export function getNodeCoords(index: number, cols: number = GRID_COLS): { row: number; col: number } {
  return {
    row: Math.floor(index / cols),
    col: index % cols,
  };
}

/**
 * Returns node index 0..99 for (row, col)
 */
export function getNodeIndex(row: number, col: number, cols: number = GRID_COLS): number {
  return row * cols + col;
}

/**
 * Mathematically builds a 100x100 Adjacency Matrix.
 * W[i][j] = 1 for orthogonal neighbors (top, bottom, left, right) if neither is blocked.
 * W[i][j] = Infinity if not connected or if either node is blocked by an obstacle.
 * W[i][i] = 0 (self-distance)
 */
export function createAdjacencyMatrix(
  obstacles: Set<number> | number[],
  rows: number = GRID_ROWS,
  cols: number = GRID_COLS
): number[][] {
  const n = rows * cols;
  const obstacleSet = new Set(obstacles);

  // Initialize n x n matrix filled with Infinity
  const matrix: number[][] = Array.from({ length: n }, (_, i) =>
    Array.from({ length: n }, (_, j) => (i === j ? 0 : Infinity))
  );

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const u = getNodeIndex(r, c, cols);

      // If node u is an obstacle, all edges into/out of u remain Infinity
      if (obstacleSet.has(u)) continue;

      // Check 4 orthogonal directions
      const neighbors = [
        { r: r - 1, c },     // Top
        { r: r + 1, c },     // Bottom
        { r, c: c - 1 },     // Left
        { r, c: c + 1 },     // Right
      ];

      for (const neighbor of neighbors) {
        if (
          neighbor.r >= 0 &&
          neighbor.r < rows &&
          neighbor.c >= 0 &&
          neighbor.c < cols
        ) {
          const v = getNodeIndex(neighbor.r, neighbor.c, cols);
          // Only connect if neighbor v is not an obstacle
          if (!obstacleSet.has(v)) {
            matrix[u][v] = 1;
          }
        }
      }
    }
  }

  return matrix;
}

/**
 * Dynamically updates an Adjacency Matrix when a single node u changes obstacle status.
 * If set to obstacle, edge weights W[u][v] and W[v][u] become Infinity for all v != u.
 * If removed from obstacle, edge weights to valid adjacent neighbors are restored to 1.
 */
export function updateAdjacencyMatrixObstacle(
  matrix: number[][],
  nodeIndex: number,
  isObstacle: boolean,
  obstacles: Set<number>,
  rows: number = GRID_ROWS,
  cols: number = GRID_COLS
): number[][] {
  const n = rows * cols;
  // Deep clone matrix or copy rows
  const newMatrix = matrix.map((row) => [...row]);

  const { row: r, col: c } = getNodeCoords(nodeIndex, cols);

  if (isObstacle) {
    // Set row and column nodeIndex to Infinity (except self)
    for (let i = 0; i < n; i++) {
      if (i !== nodeIndex) {
        newMatrix[nodeIndex][i] = Infinity;
        newMatrix[i][nodeIndex] = Infinity;
      }
    }
  } else {
    // Restore edges to adjacent non-obstacle neighbors
    const neighbors = [
      { r: r - 1, c },
      { r: r + 1, c },
      { r, c: c - 1 },
      { r, c: c + 1 },
    ];

    for (const neighbor of neighbors) {
      if (
        neighbor.r >= 0 &&
        neighbor.r < rows &&
        neighbor.c >= 0 &&
        neighbor.c < cols
      ) {
        const v = getNodeIndex(neighbor.r, neighbor.c, cols);
        if (!obstacles.has(v)) {
          newMatrix[nodeIndex][v] = 1;
          newMatrix[v][nodeIndex] = 1;
        }
      }
    }
  }

  return newMatrix;
}

/**
 * Reconstructs path array [startNode, ..., targetNode] from predecessor pointers π
 */
export function reconstructPath(previous: (number | null)[], targetNode: number): number[] {
  const path: number[] = [];
  let curr: number | null = targetNode;

  while (curr !== null) {
    path.unshift(curr);
    curr = previous[curr];
  }

  return path;
}

/**
 * Dijkstra Generator Function
 * Yields discrete step snapshots during computation.
 * 
 * Formal Algorithm:
 * 1. S = ∅
 * 2. Q = V
 * 3. d(s) = 0, d(v) = ∞ for all v ≠ s
 * 4. While Q ≠ ∅:
 *      u = argmin_{v ∈ Q} d(v)
 *      If d(u) = ∞, break (unreachable)
 *      Q = Q \ {u}
 *      S = S ∪ {u}
 *      If u = target, reconstruct path and finish
 *      For each neighbor v of u:
 *        If d(u) + W[u][v] < d(v):
 *          d(v) = d(u) + W[u][v]
 *          π(v) = u
 */
export function* dijkstraGenerator(
  adjMatrix: number[][],
  startNode: number,
  targetNode: number
): Generator<DijkstraStep, DijkstraStep, void> {
  const n = adjMatrix.length;

  const distances: number[] = Array(n).fill(Infinity);
  const previous: (number | null)[] = Array(n).fill(null);
  const setS = new Set<number>();
  const setQ = new Set<number>();
  const relaxedNodes = new Set<number>();

  for (let i = 0; i < n; i++) {
    setQ.add(i);
  }

  distances[startNode] = 0;

  // Yield initial step
  const initialStep: DijkstraStep = {
    setS: new Set(setS),
    setQ: new Set(setQ),
    distances: [...distances],
    previous: [...previous],
    currentNode: null,
    evaluatingNeighbor: null,
    path: [],
    phase: 'init',
    relaxedNodes: new Set(relaxedNodes),
  };
  yield initialStep;

  while (setQ.size > 0) {
    // Find u ∈ Q with minimum d(u)
    let u: number | null = null;
    let minDistance = Infinity;

    for (const node of setQ) {
      if (distances[node] < minDistance) {
        minDistance = distances[node];
        u = node;
      }
    }

    // If minimum distance is Infinity, remaining nodes in Q are disconnected
    if (u === null || minDistance === Infinity) {
      const unreachableStep: DijkstraStep = {
        setS: new Set(setS),
        setQ: new Set(setQ),
        distances: [...distances],
        previous: [...previous],
        currentNode: null,
        evaluatingNeighbor: null,
        path: [],
        phase: 'unreachable',
        relaxedNodes: new Set(relaxedNodes),
      };
      return unreachableStep;
    }

    // Move u from Q to S
    setQ.delete(u);
    setS.add(u);
    relaxedNodes.delete(u);

    const currentPath = reconstructPath(previous, u);

    // Yield exploring u state
    yield {
      setS: new Set(setS),
      setQ: new Set(setQ),
      distances: [...distances],
      previous: [...previous],
      currentNode: u,
      evaluatingNeighbor: null,
      path: currentPath,
      phase: 'exploring',
      relaxedNodes: new Set(relaxedNodes),
    };

    // Check if we reached the target node
    if (u === targetNode) {
      const finalPath = reconstructPath(previous, targetNode);
      const foundStep: DijkstraStep = {
        setS: new Set(setS),
        setQ: new Set(setQ),
        distances: [...distances],
        previous: [...previous],
        currentNode: u,
        evaluatingNeighbor: null,
        path: finalPath,
        phase: 'found',
        relaxedNodes: new Set(relaxedNodes),
      };
      return foundStep;
    }

    // Relax all neighbors v of u
    for (let v = 0; v < n; v++) {
      const edgeWeight = adjMatrix[u][v];

      if (edgeWeight !== Infinity && setQ.has(v)) {
        const altDistance = distances[u] + edgeWeight;

        if (altDistance < distances[v]) {
          distances[v] = altDistance;
          previous[v] = u;
          relaxedNodes.add(v);

          yield {
            setS: new Set(setS),
            setQ: new Set(setQ),
            distances: [...distances],
            previous: [...previous],
            currentNode: u,
            evaluatingNeighbor: v,
            path: reconstructPath(previous, u),
            phase: 'relaxing',
            relaxedNodes: new Set(relaxedNodes),
          };
        }
      }
    }
  }

  // End of generator if Q becomes empty without reaching target
  return {
    setS: new Set(setS),
    setQ: new Set(setQ),
    distances: [...distances],
    previous: [...previous],
    currentNode: null,
    evaluatingNeighbor: null,
    path: [],
    phase: 'unreachable',
    relaxedNodes: new Set(relaxedNodes),
  };
}

/**
 * Preset obstacle maze maps for interactive testing
 */
export function getObstaclePreset(presetName: 'maze' | 'center' | 'spiral' | 'random' | 'none'): number[] {
  const obstacles: number[] = [];
  const cols = GRID_COLS;

  if (presetName === 'none') return [];

  if (presetName === 'center') {
    // 4x4 block in center
    for (let r = 3; r <= 6; r++) {
      for (let c = 3; c <= 6; c++) {
        obstacles.push(getNodeIndex(r, c, cols));
      }
    }
  } else if (presetName === 'maze') {
    // Alternating vertical walls
    for (let r = 0; r <= 7; r++) obstacles.push(getNodeIndex(r, 2, cols));
    for (let r = 2; r <= 9; r++) obstacles.push(getNodeIndex(r, 5, cols));
    for (let r = 0; r <= 7; r++) obstacles.push(getNodeIndex(r, 7, cols));
  } else if (presetName === 'spiral') {
    // Spiral pattern
    for (let c = 1; c <= 8; c++) obstacles.push(getNodeIndex(1, c, cols));
    for (let r = 2; r <= 8; r++) obstacles.push(getNodeIndex(r, 8, cols));
    for (let c = 1; c <= 7; c++) obstacles.push(getNodeIndex(8, c, cols));
    for (let r = 3; r <= 7; r++) obstacles.push(getNodeIndex(r, 1, cols));
    for (let c = 2; c <= 6; c++) obstacles.push(getNodeIndex(3, c, cols));
  } else if (presetName === 'random') {
    // Random ~20-25 obstacles avoiding start (0) and end (99)
    const count = 22;
    const set = new Set<number>();
    while (set.size < count) {
      const idx = Math.floor(Math.random() * TOTAL_NODES);
      if (idx !== 0 && idx !== TOTAL_NODES - 1) {
        set.add(idx);
      }
    }
    return Array.from(set);
  }

  return obstacles;
}
