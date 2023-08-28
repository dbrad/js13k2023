
function enemy_unit(_hp: number, _level: number, _type: number, _ai_pattern: number[], _options: [number, number][],): EnemyUnit
{
    return {
        _hp,
        _max_hp: _hp,
        _buffs: [],
        _debuffs: [],
        _type,
        _xp_value: 1,
        _ai_pattern: _ai_pattern,
        _ai_index: 0,
        _options: _options,
        _intent: [],
    };
}

export function make_cultist(level: number = 1): EnemyUnit
{
    return enemy_unit(10, level, ENEMY_UNIT_CULTIST, [], []);
}
export function make_demon(): void { }