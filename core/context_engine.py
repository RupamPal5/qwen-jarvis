import subprocess
import datetime
import os

def get_active_window():
    """Returns the title of the currently active window (WSL2 compatible)."""
    try:
        # Use PowerShell to get active window title (works in WSL2)
        result = subprocess.run(
            ['powershell.exe', '-Command', 
             '(Add-Type -MemberDefinition "[DllImport(\"user32.dll\")] public static extern IntPtr GetForegroundWindow();" -Name "Win32" -Namespace "Win32" -PassThru)::GetForegroundWindow() | ForEach-Object { $h = $_; Add-Type -MemberDefinition "[DllImport(\"user32.dll\")] public static extern int GetWindowText(IntPtr hWnd, System.Text.StringBuilder lpString, int nMaxCount); [DllImport(\"user32.dll\")] public static extern int GetWindowTextLength(IntPtr hWnd);" -Name "Win32" -Namespace "Win32" -PassThru; $len = [Win32.Win32]::GetWindowTextLength($h); $sb = New-Object System.Text.StringBuilder ($len + 1); [Win32.Win32]::GetWindowText($h, $sb, $sb.Capacity) | Out-Null; $sb.ToString() }'],
            capture_output=True, text=True, timeout=2
        )
        if result.stdout.strip():
            return result.stdout.strip()
        return "Unknown Window"
    except Exception as e:
        return "Unknown Window"

def get_circadian_mode():
    """Determines JARVIS's communication style based on time of day."""
    hour = datetime.datetime.now().hour
    
    if 6 <= hour <= 10:
        return 'HIGH_SIGNAL_BULLETS'  # Morning: Short, punchy updates
    elif 22 <= hour or hour <= 2:
        return 'RELAXED_LONG_FORM'    # Night: Detailed, calm explanations
    else:
        return 'STANDARD'             # Day: Normal professional tone

if __name__ == "__main__":
    print("🔒 CONTEXT ENGINE ONLINE")
    print(f"Current Mode: {get_circadian_mode()}")
    print(f"Active Window: {get_active_window()}")
