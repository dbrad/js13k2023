import { debug_log } from "@debug/log";
import { rand_int, srand_int, srand_seed, srand_shuffle } from "math";
import { create_basic_encounter, reset_encounter_id } from "./encounter/basic-encounter";

export function generate_new_map(): RunMap
{
    let map: RunMap = {
        _rows: [], _encounters: []
    };

    const seed = rand_int(0, 2 ** 32);
    srand_seed(seed);

    for (let row = 0; row < 13; row++)
    {
        map._rows[row] = [-1, -1, -1, -1, -1, -1, -1];
    }

    reset_encounter_id();

    // Set the starting columns
    const start_indexes = srand_shuffle([1, 5]);
    let number_of_starts = srand_int(2, 2);
    for (let i = 0; i < number_of_starts; i++)
    {
        let column = start_indexes[i];
        let encounter: Encounter = create_basic_encounter(0, column); // TODO: Start encounter
        let encounter_id = encounter._id;

        map._encounters[encounter_id] = encounter;
        map._rows[0][column] = encounter_id;
    }

    for (let pass = 0; pass < 2; pass++)
    {
        for (let row = 0; row < 11; row++)
        {
            for (let column = 0; column < 7; column++)
            {
                let encounter_id = map._rows[row][column];
                if (encounter_id > -1)
                {
                    let next_row_number = row + 1;
                    let next_row = map._rows[next_row_number];

                    let min_offset = column === 0 ? 0 : -1;
                    let max_offset = column === 6 ? 0 : 1;
                    let offset = srand_int(min_offset, max_offset);
                    let target_column = column + offset;

                    if (next_row[target_column] === -1)
                    {
                        let new_encounter: Encounter;
                        if (next_row_number === 6)
                        {
                            new_encounter = create_basic_encounter(next_row_number, target_column); // TODO: Mid level loot
                        }
                        else
                        {
                            new_encounter = create_basic_encounter(next_row_number, target_column); // TODO: GENERATE REAL ENCOUNTERS
                        }
                        new_encounter._from_edges.add(encounter_id);
                        map._encounters[new_encounter._id] = new_encounter;
                        next_row[target_column] = new_encounter._id;
                    }
                    else
                    {
                        map._encounters[next_row[target_column]]._from_edges.add(encounter_id);
                    }
                    map._encounters[encounter_id]._to_edges.add(next_row[target_column]);
                }
            }
        }
    }

    let boss_encounter = create_basic_encounter(12, 3); // TODO: Boss encounter
    let boss_encounter_id = boss_encounter._id;
    map._rows[12][3] = boss_encounter_id;
    map._encounters[boss_encounter_id] = boss_encounter;

    // Add edges to the boss from all encounters on the second last row.
    for (let column = 0; column < 7; column++)
    {
        let encounter_id = map._rows[11][column];
        if (encounter_id > -1)
        {
            boss_encounter._from_edges.add(encounter_id);
            map._encounters[encounter_id]._to_edges.add(boss_encounter_id);
        }
    }

    debug_log(map);

    return map;
}