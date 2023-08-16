const BASE_FILE_NAME = "js13k2023-dbrad-";
const SAVE_FILE_NAME = BASE_FILE_NAME + "game";
const OPTIONS_FILE_NAME = BASE_FILE_NAME + "options";

export function has_save_file(): boolean
{
    return window.localStorage.getItem(SAVE_FILE_NAME) !== null;
}
export function save_game(data: any[]): void
{
    let json = JSON.stringify(data);
    let b64 = btoa(json);
    window.localStorage.setItem(SAVE_FILE_NAME, b64);
}
export function load_game(): GameState | null
{
    let b64 = window.localStorage.getItem(SAVE_FILE_NAME);
    if (!b64)
    {
        return null;
    }
    return JSON.parse(atob(b64)) as GameState;
}

export function new_options_file(): OptionsState
{
    return [];
}
export function save_options(o: OptionsState): void
{
    let json = JSON.stringify(o);
    let b64 = btoa(json);
    window.localStorage.setItem(OPTIONS_FILE_NAME, b64);
}
export function load_options(): OptionsState
{
    let b64 = window.localStorage.getItem(OPTIONS_FILE_NAME);
    if (!b64)
    {
        let options = new_options_file();
        save_options(options);
        return options;
    }
    return JSON.parse(atob(b64)) as OptionsState;
}
