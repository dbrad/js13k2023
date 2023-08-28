import { CARDS } from "@gameplay/cards";

let file_saving = false;
export let GAME_STATE: CurrentGameState;
export let COMBAT_STATE: CombatState;
export let PLAYER_UNITS: PlayerUnit[] = []; // TODO: Merge into GameState
export let PLAYER_CARDS: PlayerCard[] = []; // TODO: Merge into GameState
export let ENEMY_UNITS: EnemyUnit[] = []; // TODO: Merge into GameState

export let META_STATE: MetaGameState;
export let OPTIONS_STATE: OptionsState;

export function get_card_from_index(index: number): Card
{
    return CARDS[PLAYER_CARDS[index]._card_id];
}
export function reset_combat_state(): void
{
    COMBAT_STATE = [-1, -1, -1];
}

export function new_game_state(): void
{
    META_STATE = [0] as MetaGameState;
    GAME_STATE = [0, {}, 0] as CurrentGameState;

    save_game_state();
}

export function save_game_state(): void
{
    if (!file_saving)
    {
        file_saving = true;
        postMessage([ETM_MSG_SAVE_GAME, [META_STATE, GAME_STATE]]);
    }
}

export function set_game_state(data: GameState): void
{
    file_saving = false;
    if (data && data.length !== null)
    {
        META_STATE = data[0];
        GAME_STATE = data[1];
    }
}

export function set_option_state(data: OptionsState): void
{
    file_saving = false;
    if (data && data.length !== null)
    {
        OPTIONS_STATE = data;
    }
}