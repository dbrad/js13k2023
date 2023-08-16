type Encounter = {
    _id: number,
    _row: number,
    _column: number,
    _from_edges: Set<number>,
    _to_edges: Set<number>,
    _type: number,
    _visited: boolean,
    _event: number,
    _treasure: number,
    _hero_ids: number[],
    _enemy_ids: number[],
};

type RunMap = {
    _rows: number[][],
    _encounters: Encounter[],
};