# backend/parser.py

class ParseError(Exception):
    pass


class Parser:
    """
    Recursive-descent parser.
    Grammar rules handled:
      program       → statement*
      statement     → var_decl | print_stmt | if_stmt | for_stmt
                    | while_stmt | func_def | return_stmt | expr_stmt
      var_decl      → VAR_DECL IDENTIFIER ASSIGN expression
      print_stmt    → PRINT expression
      if_stmt       → IF expression
      for_stmt      → FOR IDENTIFIER expression expression
      while_stmt    → WHILE expression
      func_def      → FUNC_DEF IDENTIFIER IDENTIFIER*
      return_stmt   → RETURN expression
      expr_stmt     → expression
      expression    → term ((PLUS|MINUS) term)*
      term          → factor ((MULTIPLY|DIVIDE) factor)*
      factor        → INT_LITERAL | FLOAT_LITERAL | IDENTIFIER
    """

    def __init__(self, tokens: list[dict]):
        # Drop EOF for parsing — we check bounds instead
        self.tokens = [t for t in tokens if t["type"] != "EOF"]
        self.pos = 0

    # ─── Helpers ──────────────────────────────────────────────
    def peek(self):
        if self.pos < len(self.tokens):
            return self.tokens[self.pos]
        return {"type": "EOF", "value": ""}

    def advance(self):
        tok = self.peek()
        self.pos += 1
        return tok

    def expect(self, token_type):
        tok = self.peek()
        if tok["type"] != token_type:
            raise ParseError(
                f"Expected {token_type} but got {tok['type']} ('{tok['value']}')"
            )
        return self.advance()

    def match(self, *types):
        if self.peek()["type"] in types:
            return self.advance()
        return None

    # ─── Grammar rules ────────────────────────────────────────
    def parse(self):
        body = []
        while self.peek()["type"] != "EOF" and self.pos < len(self.tokens):
            stmt = self.statement()
            if stmt:
                body.append(stmt)
        return {
            "type": "Program",
            "body": body,
            "children": body,
        }

    def statement(self):
        tok = self.peek()
        t = tok["type"]

        if t == "VAR_DECL":
            return self.var_decl()
        elif t == "PRINT":
            return self.print_stmt()
        elif t == "IF":
            return self.if_stmt()
        elif t == "FOR":
            return self.for_stmt()
        elif t == "WHILE":
            return self.while_stmt()
        elif t == "FUNC_DEF":
            return self.func_def()
        elif t == "RETURN":
            return self.return_stmt()
        else:
            return self.expr_stmt()

    def var_decl(self):
        self.advance()  # consume VAR_DECL
        name_tok = self.expect("IDENTIFIER")
        self.expect("ASSIGN")
        value = self.expression()
        node = {
            "type": "VarDecl",
            "name": name_tok["value"],
            "children": [
                {"type": "Identifier", "name": name_tok["value"], "children": []},
                value,
            ],
        }
        return node

    def print_stmt(self):
        self.advance()  # consume PRINT
        expr = self.expression()
        return {
            "type": "PrintStmt",
            "children": [expr],
        }

    def if_stmt(self):
        self.advance()  # consume IF
        condition = self.expression()
        return {
            "type": "IfStmt",
            "children": [
                {"type": "Condition", "children": [condition]},
            ],
        }

    def for_stmt(self):
        self.advance()  # consume FOR
        var_tok = self.match("IDENTIFIER") or {"value": "i"}
        start = self.expression()
        end = self.expression()
        return {
            "type": "ForLoop",
            "var": var_tok["value"],
            "children": [
                {"type": "Identifier", "name": var_tok["value"], "children": []},
                {"type": "RangeStart", "children": [start]},
                {"type": "RangeEnd",   "children": [end]},
            ],
        }

    def while_stmt(self):
        self.advance()  # consume WHILE
        condition = self.expression()
        return {
            "type": "WhileLoop",
            "children": [
                {"type": "Condition", "children": [condition]},
            ],
        }

    def func_def(self):
        self.advance()  # consume FUNC_DEF
        name_tok = self.expect("IDENTIFIER")
        params = []
        while self.peek()["type"] == "IDENTIFIER":
            params.append({
                "type": "Param",
                "name": self.advance()["value"],
                "children": [],
            })
        return {
            "type": "FuncDef",
            "name": name_tok["value"],
            "children": [
                {"type": "FuncName", "name": name_tok["value"], "children": []},
                *params,
            ],
        }

    def return_stmt(self):
        self.advance()  # consume RETURN
        expr = self.expression()
        return {
            "type": "ReturnStmt",
            "children": [expr],
        }

    def expr_stmt(self):
        expr = self.expression()
        return {"type": "ExprStmt", "children": [expr]}

    # ─── Expressions (with operator precedence) ───────────────
    def expression(self):
        left = self.term()
        while self.peek()["type"] in ("PLUS", "MINUS"):
            op = self.advance()
            right = self.term()
            left = {
                "type": "BinaryOp",
                "op": op["value"],
                "op_type": op["type"],
                "children": [left, right],
            }
        return left

    def term(self):
        left = self.factor()
        while self.peek()["type"] in ("MULTIPLY", "DIVIDE"):
            op = self.advance()
            right = self.factor()
            left = {
                "type": "BinaryOp",
                "op": op["value"],
                "op_type": op["type"],
                "children": [left, right],
            }
        return left

    def factor(self):
        tok = self.peek()
        if tok["type"] == "INT_LITERAL":
            self.advance()
            return {"type": "IntLiteral", "value": tok["value"], "children": []}
        elif tok["type"] == "FLOAT_LITERAL":
            self.advance()
            return {"type": "FloatLiteral", "value": tok["value"], "children": []}
        elif tok["type"] == "IDENTIFIER":
            self.advance()
            return {"type": "Identifier", "name": tok["value"], "children": []}
        elif tok["type"] == "GREATER":
            self.advance()
            right = self.factor()
            return {"type": "CompareOp", "op": ">", "children": [right]}
        elif tok["type"] == "LESS":
            self.advance()
            right = self.factor()
            return {"type": "CompareOp", "op": "<", "children": [right]}
        else:
            # skip unknown token so we don't loop forever
            self.advance()
            return {"type": "Unknown", "value": tok["value"], "children": []}


def parse_tokens(tokens: list[dict]) -> dict:
    """Public function: takes token list, returns AST dict."""
    parser = Parser(tokens)
    try:
        ast = parser.parse()
        return {"ast": ast, "error": None}
    except ParseError as e:
        return {
            "ast": {"type": "Program", "body": [], "children": []},
            "error": str(e),
        }