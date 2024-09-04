export const Strength_Trait_Buff_Description: Record<number, string> = {
    3: "All Strength pieces gain +20%AD",
    5: "All Strength pieces gain +45%AD",
    7: "All Strength pieces gain +70%AD. Each Strength piece on battlefield would provide +5%AD more.",
};

export const Brute_Trait_Buff_Description: Record<number, string> = {
    3: "At the beginning of Battle Phase, Brute pieces gain Shield equal to 30% Max. HP.",
    6: "At the beginning of Battle Phase, Brute pieces gain Shield equal to 60% Max. HP. After 4 turns, Brute pieces gain +40 Armor.",
    8: "At the beginning of Battle Phase, Brute pieces gain Shield equal to 100% Max. HP. At the end of turn, Brute pieces gain +10 Armor and Recover HP equal to 100% Shield.",
};

export const Light_Trait_Buff_Description: Record<number, string> = {
    2: "All Light pieces gain +10 Init., -10 Max. Mana.",
    4: "All Light pieces gain +20 Init., -20 Max. Mana, +1 Range.",
    6: "All Light pieces gain +30 Init., +60 Max. Mana, +2 Range. Light pieces’ Skill Mana Cost are reduced to 30%.",
};

export const Dark_Trait_Buff_Description: Record<number, string> = {
    2: "The buff would last until the end of Battle Stage.",
    4: "All friendly units’ death would trigger the effect, and gain +10%AD and +5%HP per stack instead. The buff would last until the end of Battle Stage.",
    6: "ALL units’ death would trigger the effect, and gain +10%AD and +5%HP per stack instead. Death of friendly units would trigger the effect twice. The buff would last until the end of Battle Stage.",
};

export const Cunning_Trait_Buff_Description: Record<number, string> = {
    3: "Gain 1 Gold at the end of Battle Stage. If you lose this battle, lose extra 2 Life.",
    5: "Gain 2 Gold and 1 Exp. at the end of Battle Stage. If you lose this battle, lose extra 4 Life.",
    7: "Gain 5 Gold and 1 Exp. at the end of Battle Stage. If you lose this battle, lose extra 6 Life. If you win this battle, Recover 4 Life.",
};

export const Magical_Trait_Buff_Description: Record<number, string> = {
    3: "Magical pieces gain +20AP.",
    6: "Magical pieces gain +50AP.",
    9: "ALL pieces gain +30AP, then Magical pieces gain +70AP. Whenever Magical pieces cast their skill, gain +20AP until the end of Battle Stage.",
};

export const Hunter_Trait_Buff_Description: Record<number, string> = {
    3: "Hunter pieces deal 1 extra True Damage after Auto Attack per 5 Init.",
    6: "Hunter pieces gain +20 Init. and +1 Range. They deal 1 extra True Damage after Auto Attack per 3 Init.",
    9: "Hunter pieces gain +40 Init. and +2 Range. They can attack Twice per turn. They deal extra True Damage after Auto Attack equal to Init.",
};

export const Imaginary_Trait_Buff_Description: Record<number, string> = {
    3: "At the end of action of Imaginary pieces, they gain an extra action with -75 Init. this turn, until the Init. is below 0.",
};

export const Trait_Buff_Description: Record<string, Record<number, string>> = {
    Strength: Strength_Trait_Buff_Description,
    Brute: Brute_Trait_Buff_Description,
    Light: Light_Trait_Buff_Description,
    Dark: Dark_Trait_Buff_Description,
    Cunning: Cunning_Trait_Buff_Description,
    Magical: Magical_Trait_Buff_Description,
    Hunter: Hunter_Trait_Buff_Description,
    Imaginary: Imaginary_Trait_Buff_Description,
};
