let file_saving = false;
export let GAME_STATE: CurrentGameState;
export let META_STATE: MetaGameState;
export let OPTIONS_STATE: OptionsState;

export function new_game_state(): void
{
    META_STATE = [0] as MetaGameState;
    GAME_STATE = [0] as CurrentGameState;

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