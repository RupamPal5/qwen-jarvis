from typing import Any, Dict, List, Optional

class Workspace:
    def __init__(self, id: str, name: str, theme: str = "dark", layout: str = "default"):
        self.id = id
        self.name = name
        self.theme = theme
        self.layout = layout

class WorkspaceStore:
    def __init__(self):
        self.workspaces: List[Workspace] = []
        self.pending_action: Optional[Dict[str, Any]] = None
        self.human_approval_required: bool = False

    def get_workspaces(self) -> List[Workspace]:
        return self.workspaces

    def set_pending_action(self, action: Optional[Dict[str, Any]]):
        self.pending_action = action

    def set_human_approval_required(self, required: bool):
        self.human_approval_required = required

    def is_human_approval_required(self) -> bool:
        return self.human_approval_required

# Global store instance
_workspace_store = WorkspaceStore()

def get_workspace_store() -> WorkspaceStore:
    return _workspace_store
