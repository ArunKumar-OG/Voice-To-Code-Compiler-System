# backend/main.py

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from lexer import tokenize
from semantic import analyse_ast

app = FastAPI(title="Voice-to-Code Compiler API")

# Allow React dev server to call this API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)

class SpeechInput(BaseModel):
    text: str

@app.get("/")
def root():
    return {"message": "Voice-to-Code Compiler API is running"}

@app.post("/compile/lex")
def lex_endpoint(data: SpeechInput):
    """
    Step 1 endpoint: takes spoken text, returns token list.
    Future steps will extend this to /compile/parse, /compile/semantic, etc.
    """
    if not data.text.strip():
        return {"tokens": [], "error": "Empty input"}

    tokens = tokenize(data.text)
    return {
        "input": data.text,
        "tokens": tokens,
        "token_count": len(tokens),
    }

@app.post("/compile/parse")
def parse_endpoint(data: SpeechInput):
    """
    Step 2: tokenize then parse → returns tokens + AST.
    """
    if not data.text.strip():
        return {"tokens": [], "ast": None, "error": "Empty input"}

    tokens = tokenize(data.text)
    result = parse_tokens(tokens)

    return {
        "input":       data.text,
        "tokens":      tokens,
        "token_count": len(tokens),
        "ast":         result["ast"],
        "parse_error": result["error"],
    }



@app.post("/compile/semantic")
def semantic_endpoint(data: SpeechInput):
    """
    Step 3: lex → parse → semantic analysis.
    Returns tokens + AST + symbol table + errors.
    """
    if not data.text.strip():
        return {"error": "Empty input"}

    tokens = tokenize(data.text)
    parse_result = parse_tokens(tokens)
    ast = parse_result["ast"]
    semantic_result = analyse_ast(ast)

    return {
        "input":         data.text,
        "tokens":        tokens,
        "token_count":   len(tokens),
        "ast":           ast,
        "parse_error":   parse_result["error"],
        "symbol_table":  semantic_result["symbol_table"],
        "errors":        semantic_result["errors"],
        "error_count":   semantic_result["error_count"],
        "warning_count": semantic_result["warning_count"],
    }