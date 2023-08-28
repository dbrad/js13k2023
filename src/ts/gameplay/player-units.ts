function player_unit(_hp: number, _level: number, _type: number): PlayerUnit
{
    return {
        _hp,
        _max_hp: _hp,
        _buffs: [],
        _debuffs: [],
        _xp: 0,
        _max_xp: 3,
        _level,
        _type,
    };
}
export function make_knight(level: number = 1): PlayerUnit
{
    return player_unit(10, level, PLAYER_UNIT_KNIGHT);
}
export function make_paladin(): void { }
export function make_cleric(): void { }
export function make_bowman(): void { }