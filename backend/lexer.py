

# ─── Token types ───────────────────────────────────────────────
TOKEN_TYPES = {
    "VAR_DECL":    "Variable Declaration",
    "ASSIGN":      "Assignment Operator",
    "INT_LITERAL": "Integer Literal",
    "FLOAT_LITERAL":"Float Literal",
    "IDENTIFIER":  "Identifier",
    "IF":          "If Statement",
    "ELSE":        "Else Statement",
    "FOR":         "For Loop",
    "WHILE":       "While Loop",
    "PRINT":       "Print Statement",
    "FUNC_DEF":    "Function Definition",
    "RETURN":      "Return Statement",
    "PLUS":        "Addition Operator",
    "MINUS":       "Subtraction Operator",
    "MULTIPLY":    "Multiplication Operator",
    "DIVIDE":      "Division Operator",
    "GREATER":     "Greater Than",
    "LESS":        "Less Than",
    "EQUALS":      "Equals",
    "AND":         "Logical AND",
    "OR":          "Logical OR",
    "NOT":         "Logical NOT",
    "COLON":       "Colon / Block Start",
    "EOF":         "End of Input",
    "UNKNOWN":     "Unknown Token",
}

# ─── Keyword mapping: spoken phrase → token type ───────────────
KEYWORD_MAP = [
    # declarations (check longer phrases first!)
    ("define variable",     "VAR_DECL"),
    ("declare variable",    "VAR_DECL"),
    ("define function",     "FUNC_DEF"),
    ("declare function",    "FUNC_DEF"),

    # control flow
    ("if",                  "IF"),
    ("else",                "ELSE"),
    ("for loop",            "FOR"),
    ("for",                 "FOR"),
    ("while loop",          "WHILE"),
    ("while",               "WHILE"),

    # operators
    ("is equal to",         "ASSIGN"),
    ("equals",              "ASSIGN"),
    ("equal to",            "ASSIGN"),
    ("plus",                "PLUS"),
    ("add",                 "PLUS"),
    ("minus",               "MINUS"),
    ("subtract",            "MINUS"),
    ("multiply",            "MULTIPLY"),
    ("times",               "MULTIPLY"),
    ("divide",              "DIVIDE"),
    ("divided by",          "DIVIDE"),
    ("greater than",        "GREATER"),
    ("less than",           "LESS"),
    ("and",                 "AND"),
    ("or",                  "OR"),
    ("not",                 "NOT"),

    # statements
    ("print",               "PRINT"),
    ("display",             "PRINT"),
    ("return",              "RETURN"),
]

# ─── Number words → int ────────────────────────────────────────
NUMBER_WORDS = {
    "zero": 0, "one": 1, "two": 2, "three": 3, "four": 4,
    "five": 5, "six": 6, "seven": 7, "eight": 8, "nine": 9,
    "ten": 10, "eleven": 11, "twelve": 12, "twenty": 20,
    "thirty": 30, "forty": 40, "fifty": 50, "hundred": 100,
}


def tokenize(spoken_text: str) -> list[dict]:
    """
    Convert a spoken English string into a list of token dicts.
    Each token: { type, value, position, description }
    """
    text = spoken_text.lower().strip()
    tokens = []
    position = 0
    remaining = text

    while remaining:
        remaining = remaining.strip()
        if not remaining:
            break

        matched = False

        # 1. Try keyword phrases (longest match wins — list is ordered)
        for phrase, token_type in KEYWORD_MAP:
            if remaining.startswith(phrase):
                tokens.append({
                    "type":        token_type,
                    "value":       phrase,
                    "position":    position,
                    "description": TOKEN_TYPES.get(token_type, ""),
                })
                position += len(phrase)
                remaining = remaining[len(phrase):]
                matched = True
                break

        if matched:
            continue

        # 2. Try number words
        word = remaining.split()[0] if remaining.split() else ""
        if word in NUMBER_WORDS:
            tokens.append({
                "type":        "INT_LITERAL",
                "value":       str(NUMBER_WORDS[word]),
                "position":    position,
                "description": TOKEN_TYPES["INT_LITERAL"],
            })
            position += len(word)
            remaining = remaining[len(word):]
            continue

        # 3. Try numeric digits
        if remaining[0].isdigit():
            num = ""
            i = 0
            is_float = False
            while i < len(remaining) and (remaining[i].isdigit() or remaining[i] == "."):
                if remaining[i] == ".":
                    is_float = True
                num += remaining[i]
                i += 1
            tok_type = "FLOAT_LITERAL" if is_float else "INT_LITERAL"
            tokens.append({
                "type":        tok_type,
                "value":       num,
                "position":    position,
                "description": TOKEN_TYPES[tok_type],
            })
            position += i
            remaining = remaining[i:]
            continue

        # 4. Treat remaining word as IDENTIFIER
        if remaining[0].isalpha():
            word_chars = ""
            i = 0
            while i < len(remaining) and (remaining[i].isalnum() or remaining[i] == "_"):
                word_chars += remaining[i]
                i += 1
            tokens.append({
                "type":        "IDENTIFIER",
                "value":       word_chars,
                "position":    position,
                "description": TOKEN_TYPES["IDENTIFIER"],
            })
            position += i
            remaining = remaining[i:]
            continue

        # 5. Skip unknown single character
        tokens.append({
            "type":        "UNKNOWN",
            "value":       remaining[0],
            "position":    position,
            "description": TOKEN_TYPES["UNKNOWN"],
        })
        position += 1
        remaining = remaining[1:]

    # Always end with EOF
    tokens.append({
        "type":        "EOF",
        "value":       "",
        "position":    position,
        "description": TOKEN_TYPES["EOF"],
    })

    return tokens