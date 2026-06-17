# JARVIS V5.0 - God Protocol

**Just A Rather Very Intelligent System - Version 5.0**

JARVIS V5.0 is a dynamic multi-model orchestration system that implements a tri-node consensus architecture for reliable, secure, and intelligent software development assistance. This system combines local and cloud-based AI models in a sophisticated architecture that ensures safety, performance, and adaptability.

![JARVIS Architecture](https://via.placeholder.com/800x400/040607/BF40FA?text=JARVIS+V5.0+Architecture)

## 🚀 Installation

### Prerequisites

- **Windows 10/11** (64-bit)
- **Python 3.9+** (for backend)
- **Node.js 18+** (for frontend)
- **Ollama** (for local models)
- **Git** (for version control)

### Backend Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-repo/jarvis-v5.git
   cd jarvis-v5
   ```

2. **Set up Python virtual environment:**
   ```bash
   python -m venv venv
   venv\Scripts\activate
   ```

3. **Install backend dependencies:**
   ```bash
   pip install -r backend\requirements.txt
   ```

4. **Install Ollama (for local models):**
   - Download and install from [https://ollama.ai](https://ollama.ai)
   - Start Ollama service:
     ```bash
     ollama serve
     ```

### Frontend Setup

1. **Navigate to frontend directory:**
   ```bash
   cd artifacts\jarvis-ui
   ```

2. **Install frontend dependencies:**
   ```bash
   npm install
   ```

3. **Return to project root:**
   ```bash
   cd ..\..
   ```

## ⚙️ Configuration

### Environment Variables

Create a `.env` file in the project root with your API keys:

```ini
# Cloud API keys
OPENROUTER_API_KEY=your_openrouter_api_key
GEMINI_API_KEY=your_gemini_api_key
MISTRAL_API_KEY=your_mistral_api_key
TOGETHER_API_KEY=your_together_api_key

# Encryption key for API keys (generate with scripts\generate_encryption_key.sh)
ENCRYPTION_KEY=your_encryption_key_here
```

### Model Configuration

Edit `config/models.yaml` to configure available models:

```yaml
models:
  # Local Ollama models
  qwen2.5-coder:7b:
    provider: ollama
    model_name: qwen2.5-coder:7b
    endpoint: http://localhost:11434
    context_window: 32000
    speed_rating: 7
    is_local: true
    is_active: true

  # Cloud API models
  gemini-2.5-flash:
    provider: gemini
    model_name: gemini-1.5-flash-latest
    api_key: ${GEMINI_API_KEY}  # Uses environment variable
    context_window: 1000000
    speed_rating: 4
    is_local: false
    is_active: true
```

### Download Local Models

Run the model download script to install local models:

```bash
scripts\download-models.sh
```

## 🖥️ How to Use the Model Toggle UI

### Launching JARVIS

Run the startup script from the project root:

```bash
start-jarvis.bat
```

This will:
1. Run pre-flight checks
2. Start the backend service on port 8000
3. Start the frontend service on port 5173
4. Open Chrome to the JARVIS Control Plane

### Control Plane Dashboard

The **Dynamic Orchestration Engine** (Control Plane) allows you to:

1. **Assign Models to Roles**: Select models for each of the three roles:
   - **Architect**: Generates execution plans
   - **Arbiter**: Audits plans for security and safety
   - **Judge**: Executes approved plans

2. **View Model Status**: Real-time health monitoring shows:
   - Model availability (healthy/degraded/unhealthy)
   - Response latency
   - Last checked timestamp
   - Local vs Cloud indicators

3. **Apply Presets**: Quickly load pre-configured model combinations:
   - **Default Configuration**: Balanced setup
   - **Coding Focus**: Optimized for coding tasks
   - **Fast Response**: Optimized for speed

4. **Deploy Configuration**: Apply your model assignments to the system

### Deploying Configuration

1. Select models for each role from the dropdown menus
2. View the model details (provider, context window, speed rating, status)
3. Click **"DEPLOY CONFIGURATION"** to apply the changes
4. The system will validate the configuration and apply it
5. A success notification will confirm the deployment

## 🔧 Troubleshooting

### Common Issues and Solutions

#### Ollama Service Not Running
**Error**: `Ollama service is not running (port 11434 not open)`
**Solution**:
1. Start Ollama service:
   ```bash
   ollama serve
   ```
2. Ensure it's running in a separate PowerShell window
3. Verify the port is open:
   ```bash
   netstat -ano | findstr 11434
   ```

#### Port Conflicts
**Error**: `Port 8000 is already in use` or `Port 5173 is already in use`
**Solution**:
1. Identify the process using the port:
   ```bash
   netstat -ano | findstr 8000
   ```
2. Terminate the conflicting process:
   ```bash
   taskkill /PID <PID> /F
   ```
3. Or change the port in the startup script

#### API Key Issues
**Error**: `API key not configured` or `API key format is invalid`
**Solution**:
1. Ensure your `.env` file contains valid API keys
2. Verify the encryption key is set:
   ```bash
   scripts\generate_encryption_key.sh
   ```
3. Check that the encryption key is in your `.env` file

#### Model Not Available
**Error**: `Model qwen2.5-coder:7b not found in Ollama`
**Solution**:
1. Download the model:
   ```bash
   ollama pull qwen2.5-coder:7b
   ```
2. Verify the model is available:
   ```bash
   ollama list
   ```

#### WebSocket Connection Issues
**Error**: `WebSocket not connected` in the frontend
**Solution**:
1. Ensure the backend is running
2. Check the browser console for errors (F12)
3. Refresh the page after both services are running

## 🏗️ Architecture Diagram

```
┌─────────────┐    ┌─────────────────┐    ┌───────────────────────────────┐
│             │    │                 │    │                               │
│   USER      ├───►│   FRONTEND      ├───►│   BACKEND (FastAPI)           │
│             │    │  (React)        │    │                               │
└─────────────┘    └─────────────────┘    └───────────────┬───────────────┘
                                                           │
                                                           ▼
┌───────────────────────────────────────────────────────────────────────────┐
│                                                                           │
│   CONSENSUS ENGINE (Tri-Node Architecture)                                │
│                                                                           │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐  │
│  │             │    │             │    │             │    │             │  │
│  │  ARCHITECT  ├───►│  ARBITER    ├───►│  AUTHORIZER ├───►│   JUDGE     │  │
│  │  (Planner)  │    │  (Auditor)  │    │  (Human)     │    │  (Executor) │  │
│  └─────────────┘    └─────────────┘    └─────────────┘    └──────┬──────┘  │
│                                                                   │         │
└───────────────────────────────────────────────────────────────────┘         │
                                                                             │
                                                                             ▼
┌───────────────────────────────────────────────────────────────────────────┐
│                                                                           │
│   UNIVERSAL GATEWAY                                                       │
│                                                                           │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐  │
│  │             │    │             │    │             │    │             │  │
│  │  OLLAMA     │    │  OPENROUTER │    │   GEMINI    │    │  MISTRAL    │  │
│  │  (Local)    │    │  (Cloud)    │    │  (Cloud)    │    │  (Cloud)    │  │
│  └─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘  │
│                                                                           │
└───────────────────────────────────────────────────────────────────────────┘
```

## 📊 Performance Features

JARVIS V5.0 includes advanced performance optimizations:

- **Connection Pooling**: Reuses HTTP connections to reduce overhead
- **Consensus Caching**: Caches results for identical prompts
- **Parallel Execution**: Runs Architect and Arbiter in parallel
- **Circuit Breakers**: Prevents cascading failures
- **Health Monitoring**: Continuous system health checks
- **Graceful Degradation**: Falls back to local models when cloud APIs fail

## 🛡️ Security Features

- **API Key Encryption**: All API keys are encrypted at rest
- **Input Validation**: Prevents injection attacks
- **Rate Limiting**: Protects against abuse
- **Audit Logging**: Tracks all system events
- **Sensitive Data Detection**: Prevents caching of sensitive information
- **Circuit Breakers**: Isolates failing components

## 📈 Monitoring and Observability

- **Real-time Metrics**: `/api/metrics` endpoint
- **Health Reports**: `/api/health/status` endpoint
- **Structured Logging**: JSON-formatted logs in `logs/` directory
- **Model Status**: Real-time model health monitoring
- **Performance Metrics**: Latency, success rates, cache hit rates

## 📚 Documentation

For more information, see:

- [Performance Optimizations Summary](PERFORMANCE_OPTIMIZATIONS_SUMMARY.md)
- [Performance Optimizations Implementation](PERFORMANCE_OPTIMIZATIONS_IMPLEMENTATION.md)
- [Security Protocol](security/protocol.py)
- [Consensus Engine](core/consensus_v2.py)
- [Model Registry](models/registry.py)

## 📜 License

MIT License - Copyright (c) 2025 JARVIS V5.0 Team
