import psutil
import subprocess
import time

def get_cpu_temperature():
    """Reads CPU temperature from Windows via PowerShell (WSL2 compatible)."""
    try:
        # Use PowerShell to query Windows Management Instrumentation (WMI)
        result = subprocess.run(
            ['powershell.exe', '-Command', 
             'Get-CimInstance -ClassName MSAcpi_ThermalZoneTemperature -Namespace root/wmi | Select-Object -ExpandProperty CurrentTemperature'],
            capture_output=True, text=True, timeout=3
        )
        
        if result.stdout.strip():
            # WMI returns temperature in tenths of Kelvin
            temp_kelvin = float(result.stdout.strip()) / 10
            temp_celsius = temp_kelvin - 273.15
            return round(temp_celsius, 1)
        return None
    except:
        # Fallback: Try alternative WMI method
        try:
            result = subprocess.run(
                ['powershell.exe', '-Command',
                 '(Get-CimInstance Win32_PerfFormattedData_Counters_ThermalZoneInformation -Filter "Name like \'%CPU%\'").Temperature'],
                capture_output=True, text=True, timeout=3
            )
            if result.stdout.strip():
                # This returns temperature in Celsius minus 273
                temp_kelvin = float(result.stdout.strip())
                return round(temp_kelvin - 273.15, 1)
        except:
            pass
        return None

def get_system_stats():
    """Returns current CPU, RAM, and temperature."""
    cpu_percent = psutil.cpu_percent(interval=1)
    ram = psutil.virtual_memory()
    temp = get_cpu_temperature()
    
    return {
        'cpu_usage': cpu_percent,
        'ram_usage': ram.percent,
        'ram_available': f"{ram.available / (1024**3):.1f} GB",
        'temperature': temp,
        'status': 'CRITICAL' if temp and temp > 80 else 'WARNING' if temp and temp > 70 else 'OPTIMAL'
    }

def adaptive_model_switching(stats):
    """Switches to lighter model if system is overheating."""
    if stats['temperature'] and stats['temperature'] > 85:
        print("🔥 CRITICAL: Temperature > 85°C! Switching to quantized model...")
        return "qwen2.5:1.5b"  # Tiny model
    elif stats['temperature'] and stats['temperature'] > 70:
        print("⚠️ WARNING: Temperature > 70°C. Consider cooling...")
        return "qwen2.5:7b"  # Standard model
    else:
        return "qwen2.5:7b"  # Full power

if __name__ == "__main__":
    print("🔌 HARDWARE MONITOR ONLINE (WSL2 Compatible)")
    print("Monitoring CPU temperature and power...\n")
    
    try:
        while True:
            stats = get_system_stats()
            model = adaptive_model_switching(stats)
            
            temp_str = f"{stats['temperature']}°C" if stats['temperature'] else "N/A"
            
            print(f"CPU: {stats['cpu_usage']}% | RAM: {stats['ram_usage']}% ({stats['ram_available']}) | Temp: {temp_str} | Status: {stats['status']} | Model: {model}")
            
            time.sleep(5)  # Check every 5 seconds
    except KeyboardInterrupt:
        print("\n✅ Hardware monitor stopped.")

