

class SemanticError:
    def __init__(self, level, message, node_type=""):
        self.level   = level       # "error" | "warning" | "info"
        self.message = message
        self.node_type = node_type

    def to_dict(self):
        return {
            "level":     self.level,
            "message":   self.message,
            "node_type": self.node_type,
        }


class SymbolEntry:
    def __init__(self, name, sym_type, data_type, scope, value=None):
        self.name      = name       # variable/function name
        self.sym_type  = sym_type   # "variable" | "function" | "parameter"
        self.data_type = data_type  # "int" | "float" | "unknown" | "function"
        self.scope     = scope      # "global" | "local"
        self.value     = value      # literal value if known
        self.used      = False      # has it been referenced?

    def to_dict(self):
        return {
            "name":      self.name,
            "sym_type":  self.sym_type,
            "data_type": self.data_type,
            "scope":     self.scope,
            "value":     self.value,
            "used":      self.used,
        }


class SemanticAnalyser:
    def __init__(self):
        self.symbol_table: dict[str, SymbolEntry] = {}
        self.errors: list[SemanticError] = []
        self.current_scope = "global"

    # ─── Main entry ───────────────────────────────────────────
    def analyse(self, ast: dict) -> dict:
        self._walk(ast)
        self._check_unused()
        return {
            "symbol_table": [e.to_dict() for e in self.symbol_table.values()],
            "errors":       [e.to_dict() for e in self.errors],
            "error_count":  sum(1 for e in self.errors if e.level == "error"),
            "warning_count":sum(1 for e in self.errors if e.level == "warning"),
        }

    # ─── AST walker ───────────────────────────────────────────
    def _walk(self, node: dict):
        if not node or not isinstance(node, dict):
            return

        t = node.get("type", "")

        if t == "Program":
            for child in node.get("body", []):
                self._walk(child)

        elif t == "VarDecl":
            self._handle_var_decl(node)

        elif t == "FuncDef":
            self._handle_func_def(node)

        elif t == "PrintStmt":
            for child in node.get("children", []):
                self._walk(child)

        elif t == "IfStmt":
            for child in node.get("children", []):
                self._walk(child)

        elif t == "ForLoop":
            var = node.get("var", "i")
            # loop variable declared implicitly in local scope
            self.symbol_table[var] = SymbolEntry(
                name=var, sym_type="variable",
                data_type="int", scope="local", value=None
            )
            for child in node.get("children", []):
                self._walk(child)

        elif t == "WhileLoop":
            for child in node.get("children", []):
                self._walk(child)

        elif t == "ReturnStmt":
            for child in node.get("children", []):
                self._walk(child)

        elif t == "ExprStmt":
            for child in node.get("children", []):
                self._walk(child)

        elif t == "BinaryOp":
            self._handle_binary_op(node)

        elif t == "Identifier":
            self._handle_identifier_use(node)

        elif t in ("IntLiteral", "FloatLiteral", "CompareOp",
                   "Condition", "RangeStart", "RangeEnd",
                   "Param", "FuncName", "Unknown"):
            for child in node.get("children", []):
                self._walk(child)

    # ─── Handlers ─────────────────────────────────────────────
    def _handle_var_decl(self, node):
        name = node.get("name", "")
        if not name:
            self.errors.append(SemanticError(
                "error", "Variable declaration missing name", "VarDecl"
            ))
            return

        # Check for re-declaration
        if name in self.symbol_table:
            self.errors.append(SemanticError(
                "warning",
                f"Variable '{name}' re-declared (shadows previous declaration)",
                "VarDecl"
            ))

        # Infer data type from value child
        data_type = "unknown"
        value = None
        children = node.get("children", [])
        for child in children:
            if child.get("type") == "IntLiteral":
                data_type = "int"
                value = child.get("value")
            elif child.get("type") == "FloatLiteral":
                data_type = "float"
                value = child.get("value")
            elif child.get("type") == "BinaryOp":
                data_type = self._infer_expr_type(child)

        self.symbol_table[name] = SymbolEntry(
            name=name, sym_type="variable",
            data_type=data_type, scope=self.current_scope,
            value=value
        )

        # Walk children (but skip the Identifier child — it's the LHS, not a use)
        for child in children:
            if child.get("type") != "Identifier":
                self._walk(child)

    def _handle_func_def(self, node):
        name = node.get("name", "")
        if not name:
            self.errors.append(SemanticError(
                "error", "Function definition missing name", "FuncDef"
            ))
            return

        if name in self.symbol_table:
            self.errors.append(SemanticError(
                "warning", f"Function '{name}' re-declared", "FuncDef"
            ))

        self.symbol_table[name] = SymbolEntry(
            name=name, sym_type="function",
            data_type="function", scope="global", value=None
        )

        # Register parameters
        prev_scope = self.current_scope
        self.current_scope = "local"
        for child in node.get("children", []):
            if child.get("type") == "Param":
                pname = child.get("name", "")
                if pname:
                    self.symbol_table[pname] = SymbolEntry(
                        name=pname, sym_type="parameter",
                        data_type="unknown", scope="local", value=None
                    )
        self.current_scope = prev_scope

    def _handle_identifier_use(self, node):
        name = node.get("name", "")
        if not name:
            return
        if name in self.symbol_table:
            self.symbol_table[name].used = True
        else:
            self.errors.append(SemanticError(
                "error",
                f"'{name}' is used but was never declared",
                "Identifier"
            ))

    def _handle_binary_op(self, node):
        children = node.get("children", [])
        types = [self._infer_expr_type(c) for c in children]

        # Type mismatch check: int op float is a warning in strict mode
        if "int" in types and "float" in types:
            self.errors.append(SemanticError(
                "warning",
                "Mixed int and float in expression — implicit conversion applied",
                "BinaryOp"
            ))

        for child in children:
            self._walk(child)

    def _infer_expr_type(self, node) -> str:
        if not node:
            return "unknown"
        t = node.get("type", "")
        if t == "IntLiteral":
            return "int"
        if t == "FloatLiteral":
            return "float"
        if t == "Identifier":
            name = node.get("name", "")
            entry = self.symbol_table.get(name)
            return entry.data_type if entry else "unknown"
        if t == "BinaryOp":
            child_types = [self._infer_expr_type(c)
                           for c in node.get("children", [])]
            if "float" in child_types:
                return "float"
            if "int" in child_types:
                return "int"
        return "unknown"

    def _check_unused(self):
        for name, entry in self.symbol_table.items():
            if entry.sym_type == "variable" and not entry.used:
                self.errors.append(SemanticError(
                    "warning",
                    f"Variable '{name}' is declared but never used",
                    "VarDecl"
                ))
            elif entry.sym_type == "function" and not entry.used:
                self.errors.append(SemanticError(
                    "warning",
                    f"Function '{name}' is defined but never called",
                    "FuncDef"
                ))


def analyse_ast(ast: dict) -> dict:
    """Public function: takes AST dict, returns semantic results."""
    analyser = SemanticAnalyser()


class SemanticError:
    def __init__(self, level, message, node_type=""):
        self.level   = level       # "error" | "warning" | "info"
        self.message = message
        self.node_type = node_type

    def to_dict(self):
        return {
            "level":     self.level,
            "message":   self.message,
            "node_type": self.node_type,
        }


class SymbolEntry:
    def __init__(self, name, sym_type, data_type, scope, value=None):
        self.name      = name       # variable/function name
        self.sym_type  = sym_type   # "variable" | "function" | "parameter"
        self.data_type = data_type  # "int" | "float" | "unknown" | "function"
        self.scope     = scope      # "global" | "local"
        self.value     = value      # literal value if known
        self.used      = False      # has it been referenced?

    def to_dict(self):
        return {
            "name":      self.name,
            "sym_type":  self.sym_type,
            "data_type": self.data_type,
            "scope":     self.scope,
            "value":     self.value,
            "used":      self.used,
        }


class SemanticAnalyser:
    def __init__(self):
        self.symbol_table: dict[str, SymbolEntry] = {}
        self.errors: list[SemanticError] = []
        self.current_scope = "global"

    # ─── Main entry ───────────────────────────────────────────
    def analyse(self, ast: dict) -> dict:
        self._walk(ast)
        self._check_unused()
        return {
            "symbol_table": [e.to_dict() for e in self.symbol_table.values()],
            "errors":       [e.to_dict() for e in self.errors],
            "error_count":  sum(1 for e in self.errors if e.level == "error"),
            "warning_count":sum(1 for e in self.errors if e.level == "warning"),
        }

    # ─── AST walker ───────────────────────────────────────────
    def _walk(self, node: dict):
        if not node or not isinstance(node, dict):
            return

        t = node.get("type", "")

        if t == "Program":
            for child in node.get("body", []):
                self._walk(child)

        elif t == "VarDecl":
            self._handle_var_decl(node)

        elif t == "FuncDef":
            self._handle_func_def(node)

        elif t == "PrintStmt":
            for child in node.get("children", []):
                self._walk(child)

        elif t == "IfStmt":
            for child in node.get("children", []):
                self._walk(child)

        elif t == "ForLoop":
            var = node.get("var", "i")
            # loop variable declared implicitly in local scope
            self.symbol_table[var] = SymbolEntry(
                name=var, sym_type="variable",
                data_type="int", scope="local", value=None
            )
            for child in node.get("children", []):
                self._walk(child)

        elif t == "WhileLoop":
            for child in node.get("children", []):
                self._walk(child)

        elif t == "ReturnStmt":
            for child in node.get("children", []):
                self._walk(child)

        elif t == "ExprStmt":
            for child in node.get("children", []):
                self._walk(child)

        elif t == "BinaryOp":
            self._handle_binary_op(node)

        elif t == "Identifier":
            self._handle_identifier_use(node)

        elif t in ("IntLiteral", "FloatLiteral", "CompareOp",
                   "Condition", "RangeStart", "RangeEnd",
                   "Param", "FuncName", "Unknown"):
            for child in node.get("children", []):
                self._walk(child)

    # ─── Handlers ─────────────────────────────────────────────
    def _handle_var_decl(self, node):
        name = node.get("name", "")
        if not name:
            self.errors.append(SemanticError(
                "error", "Variable declaration missing name", "VarDecl"
            ))
            return

        # Check for re-declaration
        if name in self.symbol_table:
            self.errors.append(SemanticError(
                "warning",
                f"Variable '{name}' re-declared (shadows previous declaration)",
                "VarDecl"
            ))

        # Infer data type from value child
        data_type = "unknown"
        value = None
        children = node.get("children", [])
        for child in children:
            if child.get("type") == "IntLiteral":
                data_type = "int"
                value = child.get("value")
            elif child.get("type") == "FloatLiteral":
                data_type = "float"
                value = child.get("value")
            elif child.get("type") == "BinaryOp":
                data_type = self._infer_expr_type(child)

        self.symbol_table[name] = SymbolEntry(
            name=name, sym_type="variable",
            data_type=data_type, scope=self.current_scope,
            value=value
        )

        # Walk children (but skip the Identifier child — it's the LHS, not a use)
        for child in children:
            if child.get("type") != "Identifier":
                self._walk(child)

    def _handle_func_def(self, node):
        name = node.get("name", "")
        if not name:
            self.errors.append(SemanticError(
                "error", "Function definition missing name", "FuncDef"
            ))
            return

        if name in self.symbol_table:
            self.errors.append(SemanticError(
                "warning", f"Function '{name}' re-declared", "FuncDef"
            ))

        self.symbol_table[name] = SymbolEntry(
            name=name, sym_type="function",
            data_type="function", scope="global", value=None
        )

        # Register parameters
        prev_scope = self.current_scope
        self.current_scope = "local"
        for child in node.get("children", []):
            if child.get("type") == "Param":
                pname = child.get("name", "")
                if pname:
                    self.symbol_table[pname] = SymbolEntry(
                        name=pname, sym_type="parameter",
                        data_type="unknown", scope="local", value=None
                    )
        self.current_scope = prev_scope

    def _handle_identifier_use(self, node):
        name = node.get("name", "")
        if not name:
            return
        if name in self.symbol_table:
            self.symbol_table[name].used = True
        else:
            self.errors.append(SemanticError(
                "error",
                f"'{name}' is used but was never declared",
                "Identifier"
            ))

    def _handle_binary_op(self, node):
        children = node.get("children", [])
        types = [self._infer_expr_type(c) for c in children]

        # Type mismatch check: int op float is a warning in strict mode
        if "int" in types and "float" in types:
            self.errors.append(SemanticError(
                "warning",
                "Mixed int and float in expression — implicit conversion applied",
                "BinaryOp"
            ))

        for child in children:
            self._walk(child)

    def _infer_expr_type(self, node) -> str:
        if not node:
            return "unknown"
        t = node.get("type", "")
        if t == "IntLiteral":
            return "int"
        if t == "FloatLiteral":
            return "float"
        if t == "Identifier":
            name = node.get("name", "")
            entry = self.symbol_table.get(name)
            return entry.data_type if entry else "unknown"
        if t == "BinaryOp":
            child_types = [self._infer_expr_type(c)
                           for c in node.get("children", [])]
            if "float" in child_types:
                return "float"
            if "int" in child_types:
                return "int"
        return "unknown"

    def _check_unused(self):
        for name, entry in self.symbol_table.items():
            if entry.sym_type == "variable" and not entry.used:
                self.errors.append(SemanticError(
                    "warning",
                    f"Variable '{name}' is declared but never used",
                    "VarDecl"
                ))
            elif entry.sym_type == "function" and not entry.used:
                self.errors.append(SemanticError(
                    "warning",
                    f"Function '{name}' is defined but never called",
                    "FuncDef"
                ))


def analyse_ast(ast: dict) -> dict:
    """Public function: takes AST dict, returns semantic results."""
    analyser = SemanticAnalyser()
    return analyser.analyse(ast)