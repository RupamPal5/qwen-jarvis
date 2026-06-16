import subprocess
import pexpect
import psutil

class WSL2SystemBridge:
    def __init__(self):
        self.allowed_commands = {
            "ls", "cd", "pwd", "echo", "cat", "grep", "find", "top", "htop", "free", "df", "nvidia-smi"
        }

    def execute_wsl_command(self, command):
        """
        Runs commands in Ubuntu WSL2 using subprocess.
        
        Args:
            command (str): The command to run.
            
        Returns:
            str: Output of the command.
        """
        if not self.is_safe_command(command):
            return "Error: Command is not allowed."
        
        try:
            result = subprocess.run(["wsl", "-c", command], capture_output=True, text=True, check=True)
            return result.stdout
        except subprocess.CalledProcessError as e:
            return f"Error: {e.stderr}"

    def spawn_pty_shell(self):
        """
        Creates an interactive PTY session using pexpect.
        
        Returns:
            pexpect.spawn: The PTY session object.
        """
        try:
            shell = pexpect.spawn("wsl -c bash")
            return shell
        except Exception as e:
            print(f"Error: {e}")
            return None

    def open_external_application(self, app_name):
        """
        Launches browser/tools on host system.
        
        Args:
            app_name (str): The name of the application to launch.
            
        Returns:
            bool: True if the application was launched successfully, False otherwise.
        """
        try:
            subprocess.run(["start", app_name], check=True)
            return True
        except subprocess.CalledProcessError as e:
            print(f"Error: {e}")
            return False

    def monitor_hardware_status(self):
        """
        Checks CPU/RAM/GPU usage.
        
        Returns:
            dict: Dictionary containing hardware usage data.
        """
        cpu_usage = psutil.cpu_percent(interval=1)
        memory_info = psutil.virtual_memory()
        gpu_info = self.get_gpu_info()
        
        return {
            "cpu_usage": cpu_usage,
            "memory_usage": memory_info.percent,
            "gpu_usage": gpu_info
        }

    def is_safe_command(self, command):
        """
        Validates if the command is safe.
        
        Args:
            command (str): The command to validate.
            
        Returns:
            bool: True if the command is allowed, False otherwise.
        """
        return all(cmd not in command for cmd in self.allowed_commands)

    def get_gpu_info(self):
        """
        Retrieves GPU usage information using nvidia-smi.
        
        Returns:
            float: GPU usage percentage.
        """
        try:
            result = subprocess.run(["nvidia-smi", "--query-gpu=utilization.gpu", "--format=csv,noheader,nounits"], capture_output=True, text=True, check=True)
            gpu_usage = float(result.stdout.strip())
            return gpu_usage
        except (subprocess.CalledProcessError, ValueError):
            return 0.0

# Example usage
if __name__ == "__main__":
    bridge = WSL2SystemBridge()
    print(bridge.execute_wsl_command("ls -la"))
    shell = bridge.spawn_pty_shell()
    if shell:
        shell.interact()
    print(bridge.open_external_application("chrome"))
    print(bridge.monitor_hardware_status())
