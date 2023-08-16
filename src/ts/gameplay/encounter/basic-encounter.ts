import { new_set } from "@root/shared";

let encounter_id = 0;
export function reset_encounter_id(): void
{
    encounter_id = 0;
}

export function create_basic_encounter(row: number, column: number): Encounter
{
    return {
        _id: encounter_id++,
        _row: row,
        _column: column,
        _from_edges: new_set(),
        _to_edges: new_set(),
        _type: -1,
        _visited: false,
        _event: -1,
        _treasure: -1,
        _hero_ids: [],
        _enemy_ids: []
    };
}