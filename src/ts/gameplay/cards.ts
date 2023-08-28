export let CARDS: Card[] = [];
function add_card(id: number, _name: string, _target_type: number, _card_effects: [number, number][]): void
{
    CARDS[id] = { _name, _target_type, _card_effects };
};

add_card(CARD_STRIKE, "strike", TARGET_ENEMY, [[CARD_EFFECT_DAMAGE, 1]]);
add_card(CARD_BLOCK, "block", TARGET_HERO, [[CARD_EFFECT_BLOCK, 1]]);
add_card(CARD_HEAL, "heal", TARGET_HERO, [[CARD_EFFECT_HEAL, 1]]);

export function resolve_card(card_id: number, target_unit: number = -1): void
{
    let card = CARDS[card_id];
    for (let [effect_id, value] of card._card_effects)
    {
        // TODO: Apply card effects
        if (effect_id === CARD_EFFECT_DAMAGE)
        {
            // NOTE: Damage to single enemy target

        }
    }
}