window.weaponsLibrary = {
    "Ближнее": {
        "Кухонный нож": {
            "description": "СЛ:14 накладывает :bleeding_effect_icon_high:",
            "damage": "1d4",
            "damage_mod": 1,
            "weight":"легкое",
            "type": "ближнее"
        },
        "Перчатка капкан": {
            "description": "при попадании валделец и противник получают::prone_effect_icon_high:",
            "damage": "1d4",
            "damage_mod": 1,
            "weight":"легкое",
            "type": "ближнее"
        },
        "Металическая труба": {
            "description": "-",
            "damage": "1d6",
            "damage_mod": 1,
            "weight":"среднее",
            "type": "ближнее"
        },
        "Верталетный меч": {
            "description": "лов-1, защ-1, СЛ:12, накладывает::bleeding_effect_icon_high:",
            "damage": "1d8",
            "damage_mod": 3,
            "weight":"среднее",
            "type": "ближнее"
        },
        "Гаечный ключ": {
            "description": "раз в акт можно снять с механизма любой дебаф, бонусным действием",
            "damage": "1d4",
            "damage_mod": 2,
            "weight":"среднее",
            "type": "ближнее"
        },
        "Развадной ключ": {
            "description": "СЛ:10, если противник:механизм, накладывает::vulnerability_effect_icon_high:",
            "damage": "1d4",
            "damage_mod": 2,
            "weight":"среднее",
            "type": "ближнее"
        },
        "Кирка": {
            "description": "лов-1, СЛ:14 накладывает :vulnerability_effect_icon_high:",
            "damage": "1d6",
            "damage_mod": 2,
            "weight":"двуручное",
            "type": "ближнее"
        },
        "Рапира из арматуры": {
            "description": "Если противник имеет: :vuln_icon:, то урон +1d4",
            "damage": "1d6",
            "damage_mod": 0,
            "weight":"среднее",
            "type": "ближнее"
        },
        "Гитара": {
            "description": "позволяет использовать музыкальные заклинания",
            "damage": "1d4",
            "damage_mod": 0,
            "weight":"двуручное",
            "type": "ближнее"
        }, 
        "Паучьи когти": {
            "description": "-",
            "damage": "1d8",
            "damage_mod": 0,
            "weight":"двуручное",
            "type": "ближнее"
        }, 
        "Ржавая кувалда": {
            "description": "лов-1 (двуручное)",
            "damage": "1d8",
            "damage_mod": 1,
            "weight":"двуручное",
            "type": "ближнее"
        },
        "Бита": {
            "description": "СЛ:12 отталкивает:3",
            "damage": "1d6",
            "damage_mod": 1,
            "weight":"среднее",
            "type": "ближнее"
        },
        "Топор для костей": {
            "description": "-",
            "damage": "1d6",
            "damage_mod": 2,
            "weight":"среднее",
            "type": "ближнее"
        },
        "Серп": {
            "description": "СЛ:16 накладывает :bleeding_effect_icon_high:",
            "damage": "1d4",
            "damage_mod": 2,
            "weight":"среднее",
            "type": "ближнее"
        },
        "Оскверненный серп": {
            "description": "СЛ:13 накладывает на владельца :madness_icon: + :bleeding_effect_icon_high:",
            "damage": "1d4",
            "damage_mod": 2,
            "weight":"среднее",
            "type": "ближнее"
        },
        "Топор дровосека": {
            "description": "лов-1, СЛ:12 накладывает :bleeding_effect_icon_high:",
            "damage": "1d8",
            "damage_mod": 2,
            "weight":"двуручное",
            "type": "ближнее"
        }
    },
    "Дальнее": {
        "Гвоздомет": {
            "description": "СЛ:15 накладывает :prone_effect_icon_high:",
            "damage": "1d4",
            "damage_mod": 1,
            "weight":"среднее",
            "type": "дальнее"
        },
        "Автомат А": {
            "description": "Пистолет модифицерованный удлинением с рукоядью на конце",
            "damage": "1d6",
            "damage_mod": 1,
            "weight":"среднее",
            "type": "дальнее"
        },
        "Пистолет А": {
            "description": "СЛ:19 накладывает::vulnerability_effect_icon_high:",
            "damage": "1d4",
            "damage_mod": 1,
            "weight":"легкое",
            "type": "дальнее"
        },
        "Пистолет Б": {
            "description": "СЛ:19 накладывает::vulnerability_effect_icon_high:",
            "damage": "1d4",
            "damage_mod": 1,
            "weight":"легкое",
            "type": "дальнее"
        },
        "Обрез": {
            "description": "если находится в притык, урн 2d4",
            "damage": "1d4",
            "damage_mod": 0,
            "weight":"легкое",
            "type": "дальнее"
        },
        "Винтовка со штыком": {
            "description": "бонусным действием можно накладывать: :bleeding_effect_icon_high:, в ближнем бою",
            "damage": "1d8",
            "damage_mod": 1,
            "weight":"среднее",
            "type": "дальнее"
        },
        "Энерго лук": {
            "description": "СЛ:17 накладывает: :electrified_effect_icon_high:",
            "damage": "1d6",
            "damage_mod": 2,
            "weight":"двуручное",
            "type": "дальнее"
        }, 
        "Воздушка": {
            "description": "СЛ:17 накладывает::prone_effect_icon_high:",
            "damage": "1d6",
            "damage_mod": 2,
            "weight":"среднее",
            "type": "дальнее"
        }
    },
    "Колдовское": {
        "Перчатки мага": {
            "description": "Дают возможность кастовать заклы типа:глиф и трикветры в зоне доясягаемости дальнего боя",
            "damage": "0",
            "damage_mod": 0,
            "weight":"двуручное",
            "type": "колдовское"
        }
    },
    "Щиты": {
        "Автомобильная дверь": {
            "description": ":shield_icon: +2, лов-1, если закрыться личная :shield_icon: +2",
            "damage": "0",
            "damage_mod": 0,
            "weight":"среднее",
            "type": "щит"
        },
        "Деревянный баклер": {
            "description": ":shield_icon: +1, если закрыться личная :shield_icon: +1, но баклер ломается",
            "damage": "0",
            "damage_mod": 0,
            "weight":"легкое",
            "type": "щит"
        }
    },
    "Особое": {
        "Острая монетка": {
            "description": "При попадании накладывает::vulnerability_effect_icon_high:",
            "damage": "1d4",
            "damage_mod": 0,
            "weight":"легкое",
            "type": "дальнее"
        },
        "Сумка мимик": {
            "description": "Если покормить мясом: след день урон 1d6+2, не использует модификаторы игроков на урон, +1 слот инвентаря",
            "damage": "1d4",
            "damage_mod": 0,
            "weight":"среднее",
            "type": "ближнее"
        }
    }
};