#!/usr/bin/env python3
"""
Reel Motion Studio — Local MCP Server (JSON-RPC 2.0 over stdio, zero external dependencies)

Allows any MCP-enabled AI client (Antigravity, Claude Desktop, Cursor, Codex, Windsurf) to connect
directly to your local Reel Motion Studio WITHOUT any API key:
- `list_studio_projects`: List all projects in `studio/projects/`
- `inspect_studio_project`: Read full project state, uploaded files (audio/video/logo/screenshots/references),
  transcript, and available styles/icons/SFX so the AI can design a complete edit plan
- `apply_ai_direction`: Write the AI's complete editing plan (style, palette, fonts, handle, text positions,
  footage FX, audio mix, beats, cover, and Persian `analysisReport`) directly into the live Studio project
- `render_studio_project`: Trigger preview or full MP4 render directly from the AI agent
"""

from __future__ import annotations

import json
import sys
import urllib.request
from pathlib import Path
from typing import Any

STUDIO_BASE = "http://127.0.0.1:8765"
ROOT = Path(__file__).resolve().parent.parent
PROJECTS_DIR = ROOT / "studio" / "projects"

TOOLS = [
    {
        "name": "list_studio_projects",
        "description": "List all local Reel Motion Studio projects with their IDs, titles, styles, and beat counts.",
        "inputSchema": {"type": "object", "properties": {}},
    },
    {
        "name": "inspect_studio_project",
        "description": "Inspect a Studio project's uploaded files (source audio/video, logo, screenshots, references), transcript, current state, and available styles/icons/SFX.",
        "inputSchema": {
            "type": "object",
            "properties": {"project_id": {"type": "string", "description": "Studio project ID (e.g. proj-20261124-...)"}},
            "required": ["project_id"],
        },
    },
    {
        "name": "apply_ai_direction",
        "description": "Push a complete AI-designed editing plan (style, designSystemRef, layout, brand colors/fonts/handle, options, beats, cover, and Persian analysisReport) directly into the live Reel Motion Studio web app.",
        "inputSchema": {
            "type": "object",
            "properties": {
                "project_id": {"type": "string"},
                "plan": {
                    "type": "object",
                    "description": "Complete direction JSON matching the Studio schema (analysisReport, style, layout, brand, options, cover, beats)",
                },
            },
            "required": ["project_id", "plan"],
        },
    },
    {
        "name": "render_studio_project",
        "description": "Render preview frames or final MP4 for a Studio project using Pinterest Faceless or Plan Engine.",
        "inputSchema": {
            "type": "object",
            "properties": {
                "project_id": {"type": "string"},
                "mode": {"type": "string", "enum": ["check", "preview", "full"], "default": "preview"},
                "engine": {"type": "string", "enum": ["auto", "pinterest", "plan-engine"], "default": "auto"},
            },
            "required": ["project_id"],
        },
    },
    {
        "name": "save_custom_style_from_reference",
        "description": "Save a deeply analyzed reference style (with extracted palette, motion blueprint, typography rules, and gallery thumbnail) permanently into the Studio gallery.",
        "inputSchema": {
            "type": "object",
            "properties": {
                "cloneId": {"type": "string"},
                "label": {"type": "string"},
                "primary": {"type": "string"},
                "accent": {"type": "string"},
                "dark": {"type": "string"},
                "text": {"type": "string"},
                "notes": {"type": "string", "description": "Detailed Persian frame-by-frame motion, text, and transition rules"},
            },
            "required": ["cloneId", "label"],
        },
    },
]


def http_json(path: str, method: str = "GET", body: dict[str, Any] | None = None) -> Any:
    data = json.dumps(body, ensure_ascii=False).encode("utf-8") if body is not None else None
    headers = {"Content-Type": "application/json"} if data else {}
    req = urllib.request.Request(STUDIO_BASE + path, data=data, headers=headers, method=method)
    with urllib.request.urlopen(req, timeout=30) as resp:
        return json.loads(resp.read().decode("utf-8"))


def handle_tool(name: str, args: dict[str, Any]) -> Any:
    if name == "list_studio_projects":
        return http_json("/api/projects")
    if name == "inspect_studio_project":
        pid = args["project_id"]
        proj = http_json(f"/api/projects/{pid}")
        req_p = PROJECTS_DIR / pid / "ai_request.json"
        ai_req = json.loads(req_p.read_text(encoding="utf-8")) if req_p.exists() else None
        return {"project": proj, "aiRequest": ai_req}
    if name == "apply_ai_direction":
        pid = args["project_id"]
        plan = args["plan"]
        plan["engine"] = "mcp-local-ai"
        return http_json(f"/api/projects/{pid}/apply-ai-plan", method="POST", body=plan)
    if name == "render_studio_project":
        pid = args["project_id"]
        return http_json(
            f"/api/projects/{pid}/render",
            method="POST",
            body={"mode": args.get("mode", "preview"), "engine": args.get("engine", "auto")},
        )
    if name == "save_custom_style_from_reference":
        return http_json("/api/reference/save-style", method="POST", body=args)
    raise ValueError(f"Unknown tool: {name}")


def send(msg: dict[str, Any]) -> None:
    sys.stdout.write(json.dumps(msg, ensure_ascii=False) + "\n")
    sys.stdout.flush()


def main() -> None:
    for line in sys.stdin:
        line = line.strip()
        if not line:
            continue
        try:
            req = json.loads(line)
        except Exception:
            continue
        rid = req.get("id")
        method = req.get("method")
        params = req.get("params") or {}

        if method == "initialize":
            send({
                "jsonrpc": "2.0",
                "id": rid,
                "result": {
                    "protocolVersion": "2024-11-05",
                    "capabilities": {"tools": {}},
                    "serverInfo": {"name": "reel-motion-studio-mcp", "version": "1.0.0"},
                },
            })
        elif method == "notifications/initialized":
            continue
        elif method == "tools/list":
            send({"jsonrpc": "2.0", "id": rid, "result": {"tools": TOOLS}})
        elif method == "tools/call":
            try:
                res = handle_tool(params["name"], params.get("arguments") or {})
                send({
                    "jsonrpc": "2.0",
                    "id": rid,
                    "result": {"content": [{"type": "text", "text": json.dumps(res, ensure_ascii=False, indent=2)}]},
                })
            except Exception as exc:
                send({
                    "jsonrpc": "2.0",
                    "id": rid,
                    "result": {"content": [{"type": "text", "text": f"Error: {exc}"}], "isError": True},
                })
        elif rid is not None:
            send({"jsonrpc": "2.0", "id": rid, "error": {"code": -32601, "message": f"Method not found: {method}"}})


if __name__ == "__main__":
    main()
