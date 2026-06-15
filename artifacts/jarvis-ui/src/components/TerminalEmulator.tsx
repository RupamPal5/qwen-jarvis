"use client";
import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import {
  motion, AnimatePresence, useAnimation
} from "framer-motion";
import {
  Terminal, Maximize2, Minimize2, X, ChevronRight, ChevronLeft, ChevronUp, ChevronDown, Search, Filter, Settings, Bell, BellOff, Cpu, MemoryStick, HardDrive, Network, Wifi, WifiOff, Shield, Lock, Unlock, Key, Fingerprint, Eye, EyeOff, Activity, Zap, AlertTriangle, AlertCircle, CheckCircle, Info, HelpCircle, Clock, Calendar, User, Users, Folder, FolderOpen, FileText, FileCode, FileJson, FileImage, FileArchive, Download, Upload, Trash2, Edit, Save, Copy, Clipboard, Scissors, Play, Pause, StopCircle, SkipForward, SkipBack, RotateCcw, GitBranch, GitCommit, GitPullRequest, Database, Server, Cloud, CloudOff, CloudUpload, CloudDownload, Rocket, Flame, Snowflake, Sun, Moon, Star, Heart, ThumbsUp, ThumbsDown, Award, Trophy, Target, Flag, MapPin, Navigation, Compass, Globe, Satellite, Radio, Signal, Volume2, VolumeX, Mic, MicOff, Camera, CameraOff, Video, VideoOff, Phone, Mail, AtSign, Hash, Binary, Code, Code2, Braces, Command, Layers, Box, Package, Grid, List, Table, Columns, Rows, AlignLeft, AlignCenter, AlignRight, Bold, Italic, Underline, Strikethrough, Type, Heading, Sparkles, Wand2, Crown, Gem, Diamond, Feather, Anchor, Briefcase, Coffee, CupSoda, Pizza, Beer, Wine, Carrot, Apple, Banana, Grape, Cherry, Dog, Cat, Bird, Fish, Bug, Snail, Turtle, Rabbit, Panda, Shrimp, Worm
} from "lucide-react";

// ============================================================================
// TYPE DEFINITIONS - TERMINAL ARCHITECTURE
// ============================================================================

type FileType = "file" | "directory" | "symlink" | "executable" | "hidden";
type Permission = "r" | "w" | "x" | "-";
type ThemeMode = "cyberpunk" | "matrix" | "stark" | "monokai" | "dracula";

interface FileSystemNode {
  name: string;
  type: FileType;
  content?: string;
  children?: Record<string, FileSystemNode>;
  permissions: string;
  owner: string;
  group: string;
  size: number;
  modifiedAt: Date;
  createdAt: Date;
  isHidden?: boolean;
}

interface TerminalLine {
  id: string;
  type: "input" | "output" | "error" | "success" | "info" | "warning" | "ascii" | "system";
  content: string;
  timestamp: Date;
  command?: string;
  path?: string;
  color?: string;
  isTyping?: boolean;
}

interface CommandDefinition {
  name: string;
  description: string;
  usage: string;
  category: "system" | "navigation" | "file" | "network" | "ai" | "fun" | "admin";
  execute: (args: string[], context: TerminalContext) => Promise<string | string[]>;
  aliases?: string[];
}

interface TerminalContext {
  currentPath: string;
  vfs: FileSystemNode;
  environment: Record<string, string>;
  history: string[];
  user: string;
  hostname: string;
}

interface TerminalConfig {
  theme: ThemeMode;
  fontSize: number;
  fontFamily: string;
  cursorBlink: boolean;
  scrollbackBuffer: number;
  soundEffects: boolean;
  matrixRain: boolean;
  bootSequence: boolean;
}

// ============================================================================
// VIRTUAL FILE SYSTEM (VFS) - THE BRAIN OF THE TERMINAL
// ============================================================================

const INITIAL_VFS: FileSystemNode = {
  name: "/",
  type: "directory",
  permissions: "drwxr-xr-x",
  owner: "root",
  group: "root",
  size: 4096,
  modifiedAt: new Date(),
  createdAt: new Date(),
  children: {
    "home": {
      name: "home",
      type: "directory",
      permissions: "drwxr-xr-x",
      owner: "root",
      group: "root",
      size: 4096,
      modifiedAt: new Date(),
      createdAt: new Date(),
      children: {
        "architect": {
          name: "architect",
          type: "directory",
          permissions: "drwxr-xr-x",
          owner: "architect",
          group: "architect",
          size: 4096,
          modifiedAt: new Date(),
          createdAt: new Date(),
          children: {
            "documents": {
              name: "documents",
              type: "directory",
              permissions: "drwxr-xr-x",
              owner: "architect",
              group: "architect",
              size: 4096,
              modifiedAt: new Date(),
              createdAt: new Date(),
              children: {
                "jarvis_blueprints.md": {
                  name: "jarvis_blueprints.md",
                  type: "file",
                  permissions: "-rw-r--r--",
                  owner: "architect",
                  group: "architect",
                  size: 15420,
                  modifiedAt: new Date(),
                  createdAt: new Date(),
                  content: "# JARVIS V5.0 Blueprints\n\nPhase 1-12 Complete.\nGod Protocol Active.\nSovereign AI Architecture.\n\n- Neural Core: ONLINE\n- Council of Three: ACTIVE\n- 6-Layer Containment: SECURE\n- Merkle Audit: VALID",
                },
                "stark_industries_contract.pdf": {
                  name: "stark_industries_contract.pdf",
                  type: "file",
                  permissions: "-rw-------",
                  owner: "architect",
                  group: "architect",
                  size: 2450000,
                  modifiedAt: new Date(),
                  createdAt: new Date(),
                  content: "[ENCRYPTED PDF DOCUMENT - ACCESS RESTRICTED]",
                },
              },
            },
            "projects": {
              name: "projects",
              type: "directory",
              permissions: "drwxr-xr-x",
              owner: "architect",
              group: "architect",
              size: 4096,
              modifiedAt: new Date(),
              createdAt: new Date(),
              children: {
                "jarvis_sovereign": {
                  name: "jarvis_sovereign",
                  type: "directory",
                  permissions: "drwxr-xr-x",
                  owner: "architect",
                  group: "architect",
                  size: 4096,
                  modifiedAt: new Date(),
                  createdAt: new Date(),
                  children: {
                    "core": {
                      name: "core",
                      type: "directory",
                      permissions: "drwxr-xr-x",
                      owner: "architect",
                      group: "architect",
                      size: 4096,
                      modifiedAt: new Date(),
                      createdAt: new Date(),
                      children: {
                        "neural_net.py": {
                          name: "neural_net.py",
                          type: "executable",
                          permissions: "-rwxr-xr-x",
                          owner: "architect",
                          group: "architect",
                          size: 45000,
                          modifiedAt: new Date(),
                          createdAt: new Date(),
                          content: "import torch\nimport transformers\n\nclass JARVISCore:\n    def __init__(self):\n        self.model = 'qwen2.5:7b'\n        self.context = 32768\n        self.sovereign = True\n\n    def think(self, prompt):\n        return self.model.generate(prompt)",
                        },
                        "self_heal.py": {
                          name: "self_heal.py",
                          type: "executable",
                          permissions: "-rwxr-xr-x",
                          owner: "architect",
                          group: "architect",
                          size: 12000,
                          modifiedAt: new Date(),
                          createdAt: new Date(),
                          content: "# Self-Healing Protocol\n# Automatically detects and fixes runtime errors",
                        },
                      },
                    },
                    "ui_renders": {
                      name: "ui_renders",
                      type: "directory",
                      permissions: "drwxr-xr-x",
                      owner: "architect",
                      group: "architect",
                      size: 4096,
                      modifiedAt: new Date(),
                      createdAt: new Date(),
                      children: {
                        "custom_chart.html": {
                          name: "custom_chart.html",
                          type: "file",
                          permissions: "-rw-r--r--",
                          owner: "architect",
                          group: "architect",
                          size: 8500,
                          modifiedAt: new Date(),
                          createdAt: new Date(),
                          content: "<html><body><h1>Bitcoin Chart</h1></body></html>",
                        },
                      },
                    },
                  },
                },
              },
            },
            ".config": {
              name: ".config",
              type: "directory",
              permissions: "drwx------",
              owner: "architect",
              group: "architect",
              size: 4096,
              modifiedAt: new Date(),
              createdAt: new Date(),
              isHidden: true,
              children: {
                "jarvis.json": {
                  name: "jarvis.json",
                  type: "file",
                  permissions: "-rw-------",
                  owner: "architect",
                  group: "architect",
                  size: 2048,
                  modifiedAt: new Date(),
                  createdAt: new Date(),
                  content: '{\n  "sovereign": true,\n  "god_protocol": "ACTIVE",\n  "kill_switch": "YUBIKEY"\n}',
                },
              },
            },
            ".bash_history": {
              name: ".bash_history",
              type: "file",
              permissions: "-rw-------",
              owner: "architect",
              group: "architect",
              size: 1024,
              modifiedAt: new Date(),
              createdAt: new Date(),
              isHidden: true,
              content: "ls -la\ncd projects\npython core/neural_net.py\nsudo jarvis activate",
            },
          },
        },
      },
    },
    "etc": {
      name: "etc",
      type: "directory",
      permissions: "drwxr-xr-x",
      owner: "root",
      group: "root",
      size: 4096,
      modifiedAt: new Date(),
      createdAt: new Date(),
      children: {
        "passwd": {
          name: "passwd",
          type: "file",
          permissions: "-rw-r--r--",
          owner: "root",
          group: "root",
          size: 1024,
          modifiedAt: new Date(),
          createdAt: new Date(),
          content: "root:x:0:0:root:/root:/bin/bash\narchitect:x:1000:1000:Architect:/home/architect:/bin/zsh",
        },
        "hosts": {
          name: "hosts",
          type: "file",
          permissions: "-rw-r--r--",
          owner: "root",
          group: "root",
          size: 512,
          modifiedAt: new Date(),
          createdAt: new Date(),
          content: "127.0.0.1 localhost\n192.168.1.100 jarvis-local",
        },
      },
    },
    "var": {
      name: "var",
      type: "directory",
      permissions: "drwxr-xr-x",
      owner: "root",
      group: "root",
      size: 4096,
      modifiedAt: new Date(),
      createdAt: new Date(),
      children: {
        "log": {
          name: "log",
          type: "directory",
          permissions: "drwxr-xr-x",
          owner: "root",
          group: "adm",
          size: 4096,
          modifiedAt: new Date(),
          createdAt: new Date(),
          children: {
            "syslog": {
              name: "syslog",
              type: "file",
              permissions: "-rw-r-----",
              owner: "root",
              group: "adm",
              size: 50000,
              modifiedAt: new Date(),
              createdAt: new Date(),
              content: "[INFO] System boot complete.\n[INFO] JARVIS Core initialized.\n[WARN] High memory usage detected.",
            },
          },
        },
      },
    },
    "bin": {
      name: "bin",
      type: "directory",
      permissions: "drwxr-xr-x",
      owner: "root",
      group: "root",
      size: 4096,
      modifiedAt: new Date(),
      createdAt: new Date(),
      children: {
        "bash": { name: "bash", type: "executable", permissions: "-rwxr-xr-x", owner: "root", group: "root", size: 1000000, modifiedAt: new Date(), createdAt: new Date() },
        "ls": { name: "ls", type: "executable", permissions: "-rwxr-xr-x", owner: "root", group: "root", size: 100000, modifiedAt: new Date(), createdAt: new Date() },
        "cat": { name: "cat", type: "executable", permissions: "-rwxr-xr-x", owner: "root", group: "root", size: 50000, modifiedAt: new Date(), createdAt: new Date() },
      },
    },
  },
};

// ============================================================================
// ASCII ART BANNERS
// ============================================================================

const ASCII_BANNERS = {
  jarvis: `
   ██████╗ ██╗ ██████╗ ██████╗     ███████╗██╗   ██╗███████╗████████╗███████╗███╗   ███╗
  ██╔════╝ ██║██╔════╝██╔═══██╗    ██╔════╝██╗ ██╔╝██╔════╝╚══██╔══╝██╔════╝████╗ ████║
  ██║  ███╗██║██║     ██║   ██║    ███████╗ ████╔╝ ███████╗   ██║   █████╗  ██╔████╔██║
  ██║   ██║██║██║     ██║   ██║    ╚════██║  ╚██╔╝  ╚════██║   ██║   ██╔══╝  ██║██╔╝██║
  ╚██████╔╝██║██████╗╚██████╔╝    ███████║   ██║   ███████║   ██║   ███████╗██║ ╚═╝ ██║
   ╚═════╝ ╚═╝ ═════╝ ╚═════╝     ╚══════╝   ╚═╝   ╚══════╝   ╚═╝   ╚══════╝╚═╝     ╚═╝
  V5.0 // GOD PROTOCOL // SOVEREIGN AI ARCHITECTURE
  `,
  stark: `
   ███████╗ ██████╗ ███╗   ██╗    ███████╗██╗   ██╗███████╗████████╗███████╗███╗   ███╗
   ██╔════╝██╔═══██╗████╗  ██║    ██╔════╝╚██╗ ██╝██╔════╝╚══██╔══╝██╔════╝████╗ ████║
   ███████╗██║   ██║██╔██╗ ██║    ███████╗ ╚████╔╝ ███████╗   ██║   █████╗  ██╔████╔██║
   ╚════██║██║   ██║██║██╗██║    ╚════██║  ╚██╔╝  ╚════██║   ██║   ██╔══╝  ██║╚██╔╝██║
   ███████║╚██████╔╝██║ ╚████║    ███████║   ██║   ███████║   ██║   ███████╗██║ ╚═╝ ██║
   ╚══════╝ ╚═════╝ ╚═╝  ╚═══╝    ╚══════╝   ╚═╝   ╚══════╝   ═╝   ╚══════╝╚═╝     ╚═╝
  INDUSTRIES // CLASSIFIED // LEVEL 10 CLEARANCE REQUIRED
  `,
  matrix: `
   01001000 01100101 01101100 01101100 01101111 00100000 01010111 01101111 01110010 01101100 01100100
   01010111 01100101 01101100 01100011 01101111 01101101 01100101 00100000 01010100 01101111 00100000
   01010100 01101000 01100101 00100000 01001111 01101110 01100101 00100000 01010100 01110010 01110101
   01100101 00100000 01001111 01101110 01101100 01111001 00100000 01000011 01101000 01100001 01110010
   01100001 01100011 01110100 01100101 01110010 00100000 01001111 01100110 00100000 01010100 01101000
   01100101 00100000 01001101 01100001 01110100 01110010 01101001 01111000 00101110 00101110 00101110
  `,
};

// ============================================================================
// COMMAND REGISTRY - THE GOD PROTOCOL ENGINE
// ============================================================================

const COMMANDS: Record<string, CommandDefinition> = {
  help: {
    name: "help",
    description: "Display available commands and documentation",
    usage: "help [command]",
    category: "system",
    execute: async (args, ctx) => {
      if (args.length > 0) {
        const cmd = COMMANDS[args[0]];
        if (cmd) {
          return [
            `Command: ${cmd.name}`,
            `Description: ${cmd.description}`,
            `Usage: ${cmd.usage}`,
            `Category: ${cmd.category}`,
          ];
        }
        return `Command '${args[0]}' not found. Type 'help' for a list of commands.`;
      }
      
      const categories = ["system", "navigation", "file", "network", "ai", "fun", "admin"];
      let output = ["AVAILABLE COMMANDS:", ""];
      
      categories.forEach(cat => {
        output.push(`[${cat.toUpperCase()}]`);
        Object.values(COMMANDS)
          .filter(c => c.category === cat)
          .forEach(c => {
            output.push(`  ${c.name.padEnd(15)} - ${c.description}`);
          });
        output.push("");
      });
      
      output.push("Type 'help <command>' for detailed usage.");
      return output;
    },
  },
  clear: {
    name: "clear",
    description: "Clear the terminal screen",
    usage: "clear",
    category: "system",
    execute: async () => "CLEAR_SCREEN",
  },
  ls: {
    name: "ls",
    description: "List directory contents",
    usage: "ls [-la] [directory]",
    category: "file",
    execute: async (args, ctx) => {
      const showAll = args.includes("-a") || args.includes("-la") || args.includes("-al");
      const longFormat = args.includes("-l") || args.includes("-la") || args.includes("-al");
      
      const targetPath = args.find(a => !a.startsWith("-")) || ctx.currentPath;
      const node = resolvePath(ctx.vfs, targetPath);
      
      if (!node || node.type !== "directory") {
        return `ls: cannot access '${targetPath}': No such file or directory`;
      }
      
      const entries = Object.values(node.children || {});
      const filtered = showAll ? entries : entries.filter(e => !e.isHidden);
      
      if (longFormat) {
        return filtered.map(e => {
          const date = e.modifiedAt.toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
          return `${e.permissions} ${e.owner.padEnd(10)} ${e.group.padEnd(10)} ${String(e.size).padStart(8)} ${date} ${e.name}`;
        });
      }
      
      return filtered.map(e => e.name).join("  ");
    },
  },
  cd: {
    name: "cd",
    description: "Change the current directory",
    usage: "cd [directory]",
    category: "navigation",
    execute: async (args, ctx) => {
      const target = args[0] || "/home/architect";
      if (target === "..") {
        const parts = ctx.currentPath.split("/").filter(Boolean);
        parts.pop();
        return { type: "PATH_CHANGE", path: "/" + parts.join("/") };
      }
      if (target === "~" || target === "/home/architect") {
        return { type: "PATH_CHANGE", path: "/home/architect" };
      }
      if (target === "/") {
        return { type: "PATH_CHANGE", path: "/" };
      }
      
      const newPath = ctx.currentPath === "/" ? `/${target}` : `${ctx.currentPath}/${target}`;
      const node = resolvePath(ctx.vfs, newPath);
      
      if (!node) return `cd: no such file or directory: ${target}`;
      if (node.type !== "directory") return `cd: not a directory: ${target}`;
      
      return { type: "PATH_CHANGE", path: newPath };
    },
  },
  pwd: {
    name: "pwd",
    description: "Print working directory",
    usage: "pwd",
    category: "navigation",
    execute: async (args, ctx) => ctx.currentPath,
  },
  cat: {
    name: "cat",
    description: "Concatenate and print file contents",
    usage: "cat [file]",
    category: "file",
    execute: async (args, ctx) => {
      if (args.length === 0) return "cat: missing file operand";
      const target = args[0];
      const fullPath = ctx.currentPath === "/" ? `/${target}` : `${ctx.currentPath}/${target}`;
      const node = resolvePath(ctx.vfs, fullPath);
      
      if (!node) return `cat: ${target}: No such file or directory`;
      if (node.type === "directory") return `cat: ${target}: Is a directory`;
      
      return node.content || "[Empty file]";
    },
  },
  echo: {
    name: "echo",
    description: "Display a line of text",
    usage: "echo [text]",
    category: "system",
    execute: async (args) => args.join(" "),
  },
  whoami: {
    name: "whoami",
    description: "Print effective userid",
    usage: "whoami",
    category: "system",
    execute: async (args, ctx) => ctx.user,
  },
  date: {
    name: "date",
    description: "Print the system date and time",
    usage: "date",
    category: "system",
    execute: async () => new Date().toString(),
  },
  neofetch: {
    name: "neofetch",
    description: "Display system information with ASCII art",
    usage: "neofetch",
    category: "fun",
    execute: async (args, ctx) => {
      const art = `
        .--.         ${ctx.user}@${ctx.hostname}
       |o_o |        -------------------
       |:_/ |        OS: JARVIS OS 5.0 (God Protocol)
      //   \\ \\       Host: Stark Industries Mainframe
     (|     | )      Kernel: Linux 6.6.114.1-microsoft-standard-WSL2
    /'\\_   _/\`\\     Uptime: 14 days, 7 hours, 42 mins
    \\___)=(___/     Shell: zsh 5.9
                    Terminal: God Terminal v1.0
                    CPU: 12th Gen Intel i5-12450HX (12) @ 4.400GHz
                    GPU: NVIDIA GeForce RTX 4060
                    Memory: 6200MiB / 16384MiB
      `;
      return art;
    },
  },
  jarvis: {
    name: "jarvis",
    description: "Interact with the JARVIS AI Core",
    usage: "jarvis [status|activate|think <prompt>]",
    category: "ai",
    execute: async (args) => {
      if (args[0] === "status") {
        return [
          "JARVIS CORE STATUS:",
          "  Neural Engine: ONLINE",
          "  Council of Three: ACTIVE",
          "  6-Layer Containment: SECURE",
          "  Merkle Audit: VALID",
          "  Sovereign Mode: ENABLED",
          "  God Protocol: ACTIVE",
        ];
      }
      if (args[0] === "activate") {
        return "Biometric scan confirmed. Welcome back, Architect. All systems operational.";
      }
      if (args[0] === "think") {
        const prompt = args.slice(1).join(" ");
        return `Processing: "${prompt}"...\nCouncil of Three debating...\nVerdict: Request acknowledged. Executing via local neural net.`;
      }
      return "Usage: jarvis [status|activate|think <prompt>]";
    },
  },
  hack: {
    name: "hack",
    description: "Initiate cinematic hacking sequence",
    usage: "hack [target]",
    category: "fun",
    execute: async (args) => {
      const target = args[0] || "mainframe";
      return [
        `Initiating hack on ${target}...`,
        "Bypassing firewall...",
        "Injecting SQL payload...",
        "Escalating privileges...",
        "Access granted. Root shell obtained.",
        "Downloading encrypted data...",
        "Covering tracks...",
        "Done. Connection terminated.",
      ];
    },
  },
  sudo: {
    name: "sudo",
    description: "Execute a command as superuser",
    usage: "sudo [command]",
    category: "admin",
    execute: async (args, ctx) => {
      if (args.length === 0) return "sudo: missing command";
      const cmd = args[0];
      if (COMMANDS[cmd]) {
        const result = await COMMANDS[cmd].execute(args.slice(1), { ...ctx, user: "root" });
        return Array.isArray(result) ? result.map(r => `[root] ${r}`) : `[root] ${result}`;
      }
      return `sudo: ${cmd}: command not found`;
    },
  },
  exit: {
    name: "exit",
    description: "Exit the terminal session",
    usage: "exit",
    category: "system",
    execute: async () => "SESSION_TERMINATED",
  },
  history: {
    name: "history",
    description: "Display command history",
    usage: "history",
    category: "system",
    execute: async (args, ctx) => {
      return ctx.history.map((cmd, i) => `  ${i + 1}  ${cmd}`).join("\n");
    },
  },
  uname: {
    name: "uname",
    description: "Print system information",
    usage: "uname [-a]",
    category: "system",
    execute: async (args) => {
      if (args.includes("-a")) {
        return "Linux jarvis-mainframe 6.6.114.1-microsoft-standard-WSL2 #1 SMP x86_64 GNU/Linux";
      }
      return "Linux";
    },
  },
  uptime: {
    name: "uptime",
    description: "Tell how long the system has been running",
    usage: "uptime",
    category: "system",
    execute: async () => " 14:42:11 up 14 days,  7:42,  1 user,  load average: 0.42, 0.38, 0.35",
  },
  df: {
    name: "df",
    description: "Report file system disk space usage",
    usage: "df [-h]",
    category: "system",
    execute: async (args) => {
      if (args.includes("-h")) {
        return [
          "Filesystem      Size  Used Avail Use% Mounted on",
          "/dev/sda1       1.0T  420G  580G  42% /",
          "tmpfs           7.8G     0  7.8G   0% /dev/shm",
          "/dev/sda2       500G  120G  380G  24% /home",
        ];
      }
      return "Use 'df -h' for human-readable output.";
    },
  },
  free: {
    name: "free",
    description: "Display amount of free and used memory",
    usage: "free [-h]",
    category: "system",
    execute: async (args) => {
      if (args.includes("-h")) {
        return [
          "              total        used        free      shared  buff/cache   available",
          "Mem:           15Gi       6.2Gi       4.1Gi       200Mi       5.2Gi       8.8Gi",
          "Swap:         4.0Gi          0B       4.0Gi",
        ];
      }
      return "Use 'free -h' for human-readable output.";
    },
  },
  ping: {
    name: "ping",
    description: "Send ICMP ECHO_REQUEST to network hosts",
    usage: "ping [host]",
    category: "network",
    execute: async (args) => {
      const host = args[0] || "localhost";
      return [
        `PING ${host} (127.0.0.1) 56(84) bytes of data.`,
        `64 bytes from ${host}: icmp_seq=1 ttl=64 time=0.042 ms`,
        `64 bytes from ${host}: icmp_seq=2 ttl=64 time=0.038 ms`,
        `64 bytes from ${host}: icmp_seq=3 ttl=64 time=0.041 ms`,
        ``,
        `--- ${host} ping statistics ---`,
        `3 packets transmitted, 3 received, 0% packet loss, time 2003ms`,
        `rtt min/avg/max/mdev = 0.038/0.040/0.042/0.001 ms`,
      ];
    },
  },
  ifconfig: {
    name: "ifconfig",
    description: "Configure a network interface",
    usage: "ifconfig",
    category: "network",
    execute: async () => [
      "eth0: flags=4163<UP,BROADCAST,RUNNING,MULTICAST>  mtu 1500",
      "        inet 192.168.1.100  netmask 255.255.255.0  broadcast 192.168.1.255",
      "        inet6 fe80::1  prefixlen 64  scopeid 0x20<link>",
      "        ether 00:11:22:33:44:55  txqueuelen 1000  (Ethernet)",
      "        RX packets 1420582  bytes 1240582140 (1.1 GiB)",
      "        TX packets 840210  bytes 140210420 (133.7 MiB)",
      "",
      "lo: flags=73<UP,LOOPBACK,RUNNING>  mtu 65536",
      "        inet 127.0.0.1  netmask 255.0.0.0",
      "        loop  txqueuelen 1000  (Local Loopback)",
    ],
  },
  ssh: {
    name: "ssh",
    description: "OpenSSH remote login client",
    usage: "ssh [user@]hostname",
    category: "network",
    execute: async (args) => {
      const target = args[0] || "root@localhost";
      return [
        `The authenticity of host '${target}' can't be established.`,
        "ED25519 key fingerprint is SHA256:randomfingerprint.",
        "This key is not known by any other names.",
        "Are you sure you want to continue connecting (yes/no)? yes",
        "Warning: Permanently added 'localhost' (ED25519) to the list of known hosts.",
        `Welcome to Ubuntu 22.04.3 LTS (GNU/Linux 6.6.114.1-microsoft-standard-WSL2 x86_64)`,
        "",
        "Last login: Thu Jun 11 15:42:11 2026 from 192.168.1.100",
      ];
    },
  },
  curl: {
    name: "curl",
    description: "Transfer a URL",
    usage: "curl [url]",
    category: "network",
    execute: async (args) => {
      const url = args[0] || "https://api.stark.industries/status";
      return [
        "  % Total    % Received % Xferd  Average Speed   Time    Time     Time  Current",
        "                                 Dload  Upload   Total   Spent    Left  Speed",
        "100   124  100   124    0     0   1240      0 --:--:-- --:--:-- --:--:--  1252",
        `{ "status": "operational", "sovereign": true, "god_protocol": "ACTIVE" }`,
      ];
    },
  },
  git: {
    name: "git",
    description: "Distributed version control system",
    usage: "git [status|log|branch]",
    category: "system",
    execute: async (args) => {
      if (args[0] === "status") {
        return [
          "On branch main",
          "Your branch is up to date with 'origin/main'.",
          "",
          "Changes not staged for commit:",
          "  modified:   core/neural_net.py",
          "  modified:   ui_renders/custom_chart.html",
          "",
          "Untracked files:",
          "  core/self_heal.py",
        ];
      }
      if (args[0] === "log") {
        return [
          "commit a1b2c3d4e5f6g7h8i9j0 (HEAD -> main, origin/main)",
          "Author: Architect <rupam@stark.ind>",
          "Date:   Thu Jun 11 15:42:11 2026 +0000",
          "",
          "    feat: activate God Protocol Phase 12",
          "",
          "commit 0j9i8h7g6f5e4d3c2b1a",
          "Author: Architect <rupam@stark.ind>",
          "Date:   Wed Jun 10 12:30:00 2026 +0000",
          "",
          "    fix: resolve WebSocket hydration mismatch",
        ];
      }
      if (args[0] === "branch") {
        return [
          "* main",
          "  dev",
          "  feature/council-of-three",
          "  feature/quantum-bridge",
        ];
      }
      return "Usage: git [status|log|branch]";
    },
  },
  python: {
    name: "python",
    description: "Python 3 interpreter",
    usage: "python [file]",
    category: "system",
    execute: async (args) => {
      if (args.length === 0) {
        return [
          "Python 3.11.4 (main, Jun  7 2023, 10:13:09) [GCC 11.4.0] on linux",
          'Type "help", "copyright", "credits" or "license" for more information.',
          ">>> [Interactive mode simulated. Type 'exit()' to quit.]",
        ];
      }
      const file = args[0];
      return `Running ${file}...\n[Script executed successfully. Output suppressed for security.]`;
    },
  },
  node: {
    name: "node",
    description: "Node.js runtime environment",
    usage: "node [file]",
    category: "system",
    execute: async (args) => {
      if (args.length === 0) {
        return [
          "Welcome to Node.js v20.11.1.",
          'Type ".help" for more information.',
          "> [Interactive mode simulated. Type '.exit' to quit.]",
        ];
      }
      return `Executing ${args[0]} with Node.js...`;
    },
  },
  npm: {
    name: "npm",
    description: "Node package manager",
    usage: "npm [install|run|list]",
    category: "system",
    execute: async (args) => {
      if (args[0] === "list") {
        return [
          "jarvis-ui@5.0.0 /home/architect/projects/jarvis_sovereign",
          "├── @react-three/fiber@8.15.19",
          "├── @react-three/drei@9.105.4",
          "├── framer-motion@11.2.10",
          "├── lucide-react@0.379.0",
          "├── next@14.2.3",
          "├── react@18.3.1",
          "├── recharts@2.12.7",
          "├── three@0.164.1",
          "└── zustand@4.5.2",
        ];
      }
      return `npm ${args.join(" ")} executed successfully.`;
    },
  },
  docker: {
    name: "docker",
    description: "Docker container management",
    usage: "docker [ps|images|logs]",
    category: "system",
    execute: async (args) => {
      if (args[0] === "ps") {
        return [
          "CONTAINER ID   IMAGE          STATUS          PORTS                    NAMES",
          "a1b2c3d4e5f6   ollama/qwen    Up 14 days      0.0.0.0:11434->11434/tcp jarvis-brain",
          "f6e5d4c3b2a1   redis:alpine   Up 14 days      0.0.0.0:6379->6379/tcp   jarvis-cache",
          "1a2b3c4d5e6f   postgres:15    Up 14 days      0.0.0.0:5432->5432/tcp   jarvis-memory",
        ];
      }
      return `docker ${args.join(" ")} executed.`;
    },
  },
  systemctl: {
    name: "systemctl",
    description: "Control the systemd system and service manager",
    usage: "systemctl [status|start|stop] [service]",
    category: "admin",
    execute: async (args) => {
      if (args[0] === "status") {
        const service = args[1] || "jarvis-api";
        return [
          `● ${service}.service - JARVIS API Server`,
          `     Loaded: loaded (/etc/systemd/system/${service}.service; enabled; preset: enabled)`,
          `     Active: active (running) since Thu 2026-06-11 09:41:43 UTC; 14 days ago`,
          `   Main PID: 805 (python)`,
          `      Tasks: 12 (limit: 19123)`,
          `     Memory: 245.2M`,
          `        CPU: 12min 42.100s`,
          `     CGroup: /system.slice/${service}.service`,
          `             └─805 /home/rupam/jarvis_sovereign/venv/bin/python api_server.py`,
        ];
      }
      return `${args.join(" ")} executed.`;
    },
  },
  top: {
    name: "top",
    description: "Display Linux processes",
    usage: "top",
    category: "system",
    execute: async () => [
      "top - 15:42:11 up 14 days,  7:42,  1 user,  load average: 0.42, 0.38, 0.35",
      "Tasks: 247 total,   1 running, 246 sleeping,   0 stopped,   0 zombie",
      "%Cpu(s):  2.3 us,  1.1 sy,  0.0 ni, 96.4 id,  0.2 wa,  0.0 hi,  0.0 si,  0.0 st",
      "MiB Mem :  16384.0 total,   4100.0 free,   6200.0 used,   6084.0 buff/cache",
      "MiB Swap:   4096.0 total,   4096.0 free,      0.0 used.   8800.0 avail Mem",
      "",
      "    PID USER      PR  NI    VIRT    RES    SHR S  %CPU  %MEM     TIME+ COMMAND",
      "    805 root      20   0  450000 245000  45000 S   2.3   1.5  12:42.10 python",
      "   1240 architect 20   0  850000 120000  85000 S   1.2   0.7   5:30.20 node",
      "   3421 root      20   0  120000  45000  12000 S   0.5   0.3   2:15.40 ollama",
    ],
  },
  htop: {
    name: "htop",
    description: "Interactive process viewer",
    usage: "htop",
    category: "system",
    execute: async () => "[htop interactive mode simulated. Use 'top' for text output.]",
  },
  vim: {
    name: "vim",
    description: "Vi IMproved text editor",
    usage: "vim [file]",
    category: "file",
    execute: async (args) => {
      if (args.length === 0) return "Usage: vim [file]";
      return `[vim opened ${args[0]}. Type ':wq' to save and exit, ':q!' to quit without saving.]`;
    },
  },
  nano: {
    name: "nano",
    description: "Nano's ANOther editor, inspired by Pico",
    usage: "nano [file]",
    category: "file",
    execute: async (args) => {
      if (args.length === 0) return "Usage: nano [file]";
      return `[nano opened ${args[0]}. Press Ctrl+X to exit.]`;
    },
  },
  rm: {
    name: "rm",
    description: "Remove files or directories",
    usage: "rm [-rf] [file]",
    category: "file",
    execute: async (args) => {
      if (args.length === 0) return "rm: missing operand";
      if (args.includes("-rf") && args.includes("/")) return "rm: it is dangerous to operate recursively on '/'";
      return `removed '${args.filter(a => !a.startsWith("-")).join(" ")}'`;
    },
  },
  mkdir: {
    name: "mkdir",
    description: "Make directories",
    usage: "mkdir [directory]",
    category: "file",
    execute: async (args) => {
      if (args.length === 0) return "mkdir: missing operand";
      return `created directory '${args[0]}'`;
    },
  },
  touch: {
    name: "touch",
    description: "Change file timestamps",
    usage: "touch [file]",
    category: "file",
    execute: async (args) => {
      if (args.length === 0) return "touch: missing file operand";
      return `created file '${args[0]}'`;
    },
  },
  cp: {
    name: "cp",
    description: "Copy files and directories",
    usage: "cp [source] [destination]",
    category: "file",
    execute: async (args) => {
      if (args.length < 2) return "cp: missing destination file operand";
      return `copied '${args[0]}' to '${args[1]}'`;
    },
  },
  mv: {
    name: "mv",
    description: "Move (rename) files",
    usage: "mv [source] [destination]",
    category: "file",
    execute: async (args) => {
      if (args.length < 2) return "mv: missing destination file operand";
      return `moved '${args[0]}' to '${args[1]}'`;
    },
  },
  find: {
    name: "find",
    description: "Search for files in a directory hierarchy",
    usage: "find [path] -name [pattern]",
    category: "file",
    execute: async (args) => {
      return [
        "/home/architect/projects/jarvis_sovereign/core/neural_net.py",
        "/home/architect/projects/jarvis_sovereign/core/self_heal.py",
        "/home/architect/projects/jarvis_sovereign/ui_renders/custom_chart.html",
        "/home/architect/documents/jarvis_blueprints.md",
      ];
    },
  },
  grep: {
    name: "grep",
    description: "Print lines that match patterns",
    usage: "grep [pattern] [file]",
    category: "file",
    execute: async (args) => {
      if (args.length < 2) return "Usage: grep [pattern] [file]";
      return `${args[1]}:1:import torch  # Matched pattern: ${args[0]}`;
    },
  },
  awk: {
    name: "awk",
    description: "Pattern scanning and text processing language",
    usage: "awk [program] [file]",
    category: "file",
    execute: async () => "awk processing simulated.",
  },
  sed: {
    name: "sed",
    description: "Stream editor for filtering and transforming text",
    usage: "sed [script] [file]",
    category: "file",
    execute: async () => "sed processing simulated.",
  },
  tar: {
    name: "tar",
    description: "An archiving utility",
    usage: "tar [options] [file]",
    category: "file",
    execute: async (args) => `tar: ${args.join(" ")} executed. Archive created.`,
  },
  zip: {
    name: "zip",
    description: "Package and compress (archive) files",
    usage: "zip [options] [file]",
    category: "file",
    execute: async (args) => `adding: ${args[0]} (deflated 65%)`,
  },
  unzip: {
    name: "unzip",
    description: "List, test and extract compressed files",
    usage: "unzip [file]",
    category: "file",
    execute: async (args) => `Archive:  ${args[0]}\n  inflating: extracted_file.txt`,
  },
  chmod: {
    name: "chmod",
    description: "Change file mode bits",
    usage: "chmod [mode] [file]",
    category: "admin",
    execute: async (args) => {
      if (args.length < 2) return "chmod: missing operand";
      return `mode of '${args[1]}' changed to ${args[0]}`;
    },
  },
  chown: {
    name: "chown",
    description: "Change file owner and group",
    usage: "chown [owner] [file]",
    category: "admin",
    execute: async (args) => {
      if (args.length < 2) return "chown: missing operand";
      return `changed ownership of '${args[1]}' to ${args[0]}`;
    },
  },
  passwd: {
    name: "passwd",
    description: "Change user password",
    usage: "passwd",
    category: "admin",
    execute: async () => [
      "Changing password for architect.",
      "Current password: ",
      "New password: ",
      "Retype new password: ",
      "passwd: password updated successfully",
    ],
  },
  useradd: {
    name: "useradd",
    description: "Create a new user or update default new user information",
    usage: "useradd [username]",
    category: "admin",
    execute: async (args) => {
      if (args.length === 0) return "useradd: missing username";
      return `user '${args[0]}' created successfully.`;
    },
  },
  kill: {
    name: "kill",
    description: "Send a signal to a process",
    usage: "kill [pid]",
    category: "admin",
    execute: async (args) => {
      if (args.length === 0) return "kill: usage: kill [-s sigspec | -n signum | -sigspec] pid | jobspec ...";
      return `process ${args[0]} terminated.`;
    },
  },
  ps: {
    name: "ps",
    description: "Report a snapshot of the current processes",
    usage: "ps aux",
    category: "system",
    execute: async (args) => {
      if (args.includes("aux")) {
        return [
          "USER         PID %CPU %MEM    VSZ   RSS TTY      STAT START   TIME COMMAND",
          "root           1  0.0  0.1 169344 12456 ?        Ss   Jun11   0:05 /sbin/init",
          "root         805  2.3  1.5 450000 245000 ?       Sl   Jun11  12:42 python api_server.py",
          "architect   1240  1.2  0.7 850000 120000 ?       Sl   Jun11   5:30 node dev",
          "root        3421  0.5  0.3 120000  45000 ?       Sl   Jun11   2:15 ollama serve",
        ];
      }
      return "Use 'ps aux' for full process list.";
    },
  },
  env: {
    name: "env",
    description: "Print environment variables",
    usage: "env",
    category: "system",
    execute: async (args, ctx) => {
      return [
        `USER=${ctx.user}`,
        `HOSTNAME=${ctx.hostname}`,
        `HOME=/home/${ctx.user}`,
        `SHELL=/bin/zsh`,
        `PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin`,
        `JARVIS_VERSION=5.0`,
        `GOD_PROTOCOL=ACTIVE`,
        `SOVEREIGN=true`,
      ];
    },
  },
  export: {
    name: "export",
    description: "Set export attribute for shell variables",
    usage: "export [name=[value]]",
    category: "system",
    execute: async (args) => {
      if (args.length === 0) return "export: usage: export [name[=value] ...]";
      return `exported ${args[0]}`;
    },
  },
  alias: {
    name: "alias",
    description: "Define or display aliases",
    usage: "alias [name[=value]]",
    category: "system",
    execute: async (args) => {
      if (args.length === 0) {
        return [
          "alias ll='ls -la'",
          "alias ..='cd ..'",
          "alias cls='clear'",
          "alias jarvis='jarvis status'",
        ];
      }
      return `alias ${args[0]} defined.`;
    },
  },
  source: {
    name: "source",
    description: "Execute commands from a file in the current shell",
    usage: "source [file]",
    category: "system",
    execute: async (args) => {
      if (args.length === 0) return "source: filename argument required";
      return `sourced ${args[0]}`;
    },
  },
  man: {
    name: "man",
    description: "An interface to the system reference manuals",
    usage: "man [command]",
    category: "system",
    execute: async (args) => {
      if (args.length === 0) return "What manual page do you want?";
      const cmd = COMMANDS[args[0]];
      if (cmd) {
        return [
          `${cmd.name.toUpperCase()}(1)                    User Commands                    ${cmd.name.toUpperCase()}(1)`,
          "",
          "NAME",
          `       ${cmd.name} - ${cmd.description}`,
          "",
          "SYNOPSIS",
          `       ${cmd.usage}`,
          "",
          "DESCRIPTION",
          `       This is a simulated manual page for the '${cmd.name}' command.`,
          `       Category: ${cmd.category}`,
          "",
          "JARVIS OS 5.0                  June 2026                     GOD PROTOCOL",
        ];
      }
      return `No manual entry for ${args[0]}`;
    },
  },
  info: {
    name: "info",
    description: "Read Info documents",
    usage: "info [command]",
    category: "system",
    execute: async (args) => `info page for ${args[0] || 'system'} simulated.`,
  },
  apropos: {
    name: "apropos",
    description: "Search the manual page names and descriptions",
    usage: "apropos [keyword]",
    category: "system",
    execute: async (args) => {
      if (args.length === 0) return "apropos: nothing appropriate";
      const matches = Object.values(COMMANDS).filter(c => 
        c.name.includes(args[0]) || c.description.toLowerCase().includes(args[0].toLowerCase())
      );
      return matches.map(c => `${c.name} - ${c.description}`).join("\n") || "No matches found.";
    },
  },
  which: {
    name: "which",
    description: "Locate a command",
    usage: "which [command]",
    category: "system",
    execute: async (args) => {
      if (args.length === 0) return "which: missing argument";
      if (COMMANDS[args[0]]) return `/usr/bin/${args[0]}`;
      return `which: no ${args[0]} in (/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin)`;
    },
  },
  type: {
    name: "type",
    description: "Display information about command type",
    usage: "type [command]",
    category: "system",
    execute: async (args) => {
      if (args.length === 0) return "type: missing argument";
      if (COMMANDS[args[0]]) return `${args[0]} is a shell builtin`;
      return `bash: type: ${args[0]}: not found`;
    },
  },
  hash: {
    name: "hash",
    description: "Remember or display program locations",
    usage: "hash",
    category: "system",
    execute: async () => [
      "hits    command",
      "   1    /usr/bin/ls",
      "   3    /usr/bin/cat",
      "  12    /usr/bin/jarvis",
    ],
  },
  compgen: {
    name: "compgen",
    description: "Display possible completions",
    usage: "compgen [word]",
    category: "system",
    execute: async (args) => {
      const word = args[0] || "";
      return Object.keys(COMMANDS).filter(c => c.startsWith(word)).join("\n");
    },
  },
  complete: {
    name: "complete",
    description: "Specify how arguments are to be completed",
    usage: "complete [command]",
    category: "system",
    execute: async () => "completion rules set.",
  },
  shopt: {
    name: "shopt",
    description: "Set and unset shell options",
    usage: "shopt",
    category: "system",
    execute: async () => [
      "autocd          \toff",
      "cdable_vars     \toff",
      "cdspell         \toff",
      "checkhash       \toff",
      "checkjobs       \toff",
      "checkwinsize    \ton",
      "cmdhist         \ton",
      "compat31        \toff",
      "direxpand       \toff",
      "dirspell        \toff",
      "dotglob         \toff",
      "execfail        \toff",
      "expand_aliases  \ton",
      "extdebug        \toff",
      "extglob         \ton",
      "extquote        \ton",
      "failglob        \toff",
      "force_fignore   \ton",
      "globasciiranges \ton",
      "globstar        \toff",
      "globdots        \toff",
      "gnu_errfmt      \toff",
      "histappend      \ton",
      "histreedit      \toff",
      "histverify      \toff",
      "hostcomplete    \toff",
      "huponexit       \toff",
      "interactive_comments \ton",
      "lastpipe        \toff",
      "lithist         \toff",
      "login_shell     \ton",
      "mailwarn        \toff",
      "no_empty_cmd_completion \toff",
      "nocaseglob      \toff",
      "nocasematch     \toff",
      "nullglob        \toff",
      "progcomp        \ton",
      "promptvars      \ton",
      "restricted_shell \toff",
      "shift_verbose   \toff",
      "sigchld_trap    \toff",
      "sourcepath      \ton",
      "xpg_echo        \toff",
    ],
  },
  set: {
    name: "set",
    description: "Set or unset values of shell options and positional parameters",
    usage: "set",
    category: "system",
    execute: async () => "shell options configured.",
  },
  unset: {
    name: "unset",
    description: "Unset values and attributes of shell variables and functions",
    usage: "unset [name]",
    category: "system",
    execute: async (args) => {
      if (args.length === 0) return "unset: usage: unset [-f] [-v] [-n] [name ...]";
      return `${args[0]} unset.`;
    },
  },
  readonly: {
    name: "readonly",
    description: "Mark shell variables as unchangeable",
    usage: "readonly [name]",
    category: "system",
    execute: async (args) => {
      if (args.length === 0) return "readonly: usage: readonly [-a] [-f] [name[=value] ...]";
      return `${args[0]} marked as readonly.`;
    },
  },
  declare: {
    name: "declare",
    description: "Declare variables and give them attributes",
    usage: "declare [name]",
    category: "system",
    execute: async (args) => {
      if (args.length === 0) return "declare: usage: declare [-aAfFgiIlnrtux] [-p] [name[=value] ...]";
      return `${args[0]} declared.`;
    },
  },
  local: {
    name: "local",
    description: "Define local variables",
    usage: "local [name]",
    category: "system",
    execute: async (args) => {
      if (args.length === 0) return "local: can only be used in a function";
      return `${args[0]} defined as local.`;
    },
  },
  function: {
    name: "function",
    description: "Define shell functions",
    usage: "function name { commands; }",
    category: "system",
    execute: async (args) => {
      if (args.length === 0) return "function: usage: function name { commands; }";
      return `function ${args[0]} defined.`;
    },
  },
  eval: {
    name: "eval",
    description: "Construct and execute shell command",
    usage: "eval [command]",
    category: "system",
    execute: async (args) => {
      if (args.length === 0) return "eval: usage: eval [arg ...]";
      return `evaluated: ${args.join(" ")}`;
    },
  },
  exec: {
    name: "exec",
    description: "Execute a command",
    usage: "exec [command]",
    category: "system",
    execute: async (args) => {
      if (args.length === 0) return "exec: usage: exec [-cl] [-a name] [command [arguments]]";
      return `executing: ${args.join(" ")}`;
    },
  },
  shift: {
    name: "shift",
    description: "Shift positional parameters",
    usage: "shift [n]",
    category: "system",
    execute: async () => "positional parameters shifted.",
  },
  read: {
    name: "read",
    description: "Read a line from standard input",
    usage: "read [name]",
    category: "system",
    execute: async (args) => {
      if (args.length === 0) return "read: usage: read [-ers] [-a array] [-d delim] [-i text] [-n nchars] [-N nchars] [-p prompt] [-t timeout] [-u fd] [name ...]";
      return `reading input for ${args[0]}...`;
    },
  },
  printf: {
    name: "printf",
    description: "Write formatted output",
    usage: "printf [format] [arguments]",
    category: "system",
    execute: async (args) => {
      if (args.length === 0) return "printf: usage: printf [-v var] format [arguments]";
      return args.join(" ");
    },
  },
  test: {
    name: "test",
    description: "Evaluate conditional expression",
    usage: "test [expression]",
    category: "system",
    execute: async (args) => {
      if (args.length === 0) return "test: usage: test [expression]";
      return "expression evaluated to true.";
    },
  },
  "[": {
    name: "[",
    description: "Evaluate conditional expression (synonym for test)",
    usage: "[ expression ]",
    category: "system",
    execute: async (args) => {
      if (args.length === 0) return "[: missing `]'";
      return "expression evaluated to true.";
    },
  },
  "[[": {
    name: "[[",
    description: "Evaluate conditional expression (extended test)",
    usage: "[[ expression ]]",
    category: "system",
    execute: async (args) => {
      if (args.length === 0) return "[[: missing `]]'";
      return "expression evaluated to true.";
    },
  },
  "if": {
    name: "if",
    description: "Execute commands based on conditional",
    usage: "if commands; then commands; [elif commands; then commands;]... [else commands;] fi",
    category: "system",
    execute: async () => "if statement simulated.",
  },
  "then": {
    name: "then",
    description: "Part of if statement",
    usage: "then",
    category: "system",
    execute: async () => "then clause executed.",
  },
  "else": {
    name: "else",
    description: "Part of if statement",
    usage: "else",
    category: "system",
    execute: async () => "else clause executed.",
  },
  "elif": {
    name: "elif",
    description: "Part of if statement",
    usage: "elif",
    category: "system",
    execute: async () => "elif clause executed.",
  },
  "fi": {
    name: "fi",
    description: "End of if statement",
    usage: "fi",
    category: "system",
    execute: async () => "if statement closed.",
  },
  "for": {
    name: "for",
    description: "Execute commands for each member in a list",
    usage: "for name [in words]; do commands; done",
    category: "system",
    execute: async () => "for loop simulated.",
  },
  "while": {
    name: "while",
    description: "Execute commands as long as a test succeeds",
    usage: "while commands; do commands; done",
    category: "system",
    execute: async () => "while loop simulated.",
  },
  "until": {
    name: "until",
    description: "Execute commands as long as a test fails",
    usage: "until commands; do commands; done",
    category: "system",
    execute: async () => "until loop simulated.",
  },
  "do": {
    name: "do",
    description: "Part of for/while/until loop",
    usage: "do",
    category: "system",
    execute: async () => "loop body started.",
  },
  "done": {
    name: "done",
    description: "End of for/while/until loop",
    usage: "done",
    category: "system",
    execute: async () => "loop completed.",
  },
  "case": {
    name: "case",
    description: "Execute commands based on pattern matching",
    usage: "case word in [pattern [ | pattern ]...) commands;;]... esac",
    category: "system",
    execute: async () => "case statement simulated.",
  },
  "esac": {
    name: "esac",
    description: "End of case statement",
    usage: "esac",
    category: "system",
    execute: async () => "case statement closed.",
  },
  "select": {
    name: "select",
    description: "Select words from a list and execute commands",
    usage: "select name [in words]; do commands; done",
    category: "system",
    execute: async () => "select menu simulated.",
  },
  "in": {
    name: "in",
    description: "Part of for/select statement",
    usage: "in",
    category: "system",
    execute: async () => "in clause processed.",
  },
  "time": {
    name: "time",
    description: "Report time consumed by pipeline execution",
    usage: "time pipeline",
    category: "system",
    execute: async (args) => {
      if (args.length === 0) return "time: usage: time pipeline";
      return `\nreal\t0m0.042s\nuser\t0m0.015s\nsys\t0m0.008s`;
    },
  },
  "coproc": {
    name: "coproc",
    description: "Create a coprocess",
    usage: "coproc [name] command",
    category: "system",
    execute: async () => "coprocess created.",
  },
  "return": {
    name: "return",
    description: "Return from a shell function",
    usage: "return [n]",
    category: "system",
    execute: async () => "returned from function.",
  },
  "break": {
    name: "break",
    description: "Exit for, while, or until loop",
    usage: "break [n]",
    category: "system",
    execute: async () => "loop broken.",
  },
  "continue": {
    name: "continue",
    description: "Resume for, while, or until loop",
    usage: "continue [n]",
    category: "system",
    execute: async () => "loop continued.",
  },
  "trap": {
    name: "trap",
    description: "Trap signals and events",
    usage: "trap [-lp] [[arg] signal_spec ...]",
    category: "system",
    execute: async () => "trap set for SIGINT.",
  },
  "wait": {
    name: "wait",
    description: "Wait for job completion and return exit status",
    usage: "wait [id]",
    category: "system",
    execute: async () => "waiting for process...",
  },
  "suspend": {
    name: "suspend",
    description: "Suspend shell execution",
    usage: "suspend [-f]",
    category: "system",
    execute: async () => "shell suspended. (Simulated)",
  },
  "logout": {
    name: "logout",
    description: "Exit a login shell",
    usage: "logout",
    category: "system",
    execute: async () => "SESSION_TERMINATED",
  },
  "times": {
    name: "times",
    description: "Print the accumulated user and system times",
    usage: "times",
    category: "system",
    execute: async () => "0m0.015s 0m0.008s\n0m0.000s 0m0.000s",
  },
  "kill": {
    name: "kill",
    description: "Send a signal to a job",
    usage: "kill [-s sigspec | -n signum | -sigspec] [pid | jobspec] ...",
    category: "system",
    execute: async (args) => {
      if (args.length === 0) return "kill: usage: kill [-s sigspec | -n signum | -sigspec] pid | jobspec ...";
      return `signal sent to ${args[0]}`;
    },
  },
  "builtin": {
    name: "builtin",
    description: "Run shell builtins",
    usage: "builtin [shell-builtin [arg ...]]",
    category: "system",
    execute: async (args) => {
      if (args.length === 0) return "builtin: usage: builtin [shell-builtin [arg ...]]";
      return `builtin ${args[0]} executed.`;
    },
  },
  "command": {
    name: "command",
    description: "Execute a simple command",
    usage: "command [-pVv] command [arg ...]",
    category: "system",
    execute: async (args) => {
      if (args.length === 0) return "command: usage: command [-pVv] command [arg ...]";
      return `command ${args[0]} executed.`;
    },
  },
  "enable": {
    name: "enable",
    description: "Enable and disable shell builtins",
    usage: "enable [-a] [-dnps] [-f filename] [name ...]",
    category: "system",
    execute: async () => "builtins enabled.",
  },
  "help": {
    name: "help",
    description: "Display information about builtin commands",
    usage: "help [-dms] [pattern ...]",
    category: "system",
    execute: async (args) => {
      if (args.length === 0) return "help: usage: help [-dms] [pattern ...]";
      return `help for ${args[0]} displayed.`;
    },
  },
  "let": {
    name: "let",
    description: "Evaluate arithmetic expressions",
    usage: "let arg [arg ...]",
    category: "system",
    execute: async (args) => {
      if (args.length === 0) return "let: usage: let arg [arg ...]";
      try {
        // Safe eval for simple math
        const result = Function('"use strict";return (' + args.join(" ") + ')')();
        return String(result);
      } catch {
        return "let: arithmetic expression error";
      }
    },
  },
  "mapfile": {
    name: "mapfile",
    description: "Read lines from the standard input into an indexed array",
    usage: "mapfile [-d delim] [-n count] [-O origin] [-s count] [-t] [-u fd] [-C callback] [-c quantum] [array]",
    category: "system",
    execute: async () => "lines mapped to array.",
  },
  "readarray": {
    name: "readarray",
    description: "Read lines from the standard input into an indexed array (synonym for mapfile)",
    usage: "readarray [options] [array]",
    category: "system",
    execute: async () => "lines read into array.",
  },
  "caller": {
    name: "caller",
    description: "Return the context of the current subroutine call",
    usage: "caller [expr]",
    category: "system",
    execute: async () => "0 main terminal_emulator.tsx",
  },
  "dirs": {
    name: "dirs",
    description: "Display list of remembered directories",
    usage: "dirs [-clpv] [+N] [-N]",
    category: "navigation",
    execute: async () => "/home/architect/projects/jarvis_sovereign",
  },
  "popd": {
    name: "popd",
    description: "Remove directories from stack",
    usage: "popd [-n] [+N | -N]",
    category: "navigation",
    execute: async () => "directory popped from stack.",
  },
  "pushd": {
    name: "pushd",
    description: "Add directories to stack",
    usage: "pushd [-n] [+N | -N | dir]",
    category: "navigation",
    execute: async (args) => {
      if (args.length === 0) return "pushd: usage: pushd [-n] [+N | -N | dir]";
      return `directory stack: /home/architect ${args[0]}`;
    },
  },
  "shopt": {
    name: "shopt",
    description: "Set and unset shell options",
    usage: "shopt [-pqsu] [-o] [optname ...]",
    category: "system",
    execute: async () => "shell options configured.",
  },
  "bind": {
    name: "bind",
    description: "Set Readline key bindings and variables",
    usage: "bind [-lpsvPSVX] [-m keymap] [-f filename] [-q name] [-u name] [-r keyseq] [-x keyseq:shell-command] [keyseq:readline-function or readline-command]",
    category: "system",
    execute: async () => "key bindings set.",
  },
  "fc": {
    name: "fc",
    description: "Display or execute commands from the history list",
    usage: "fc [-e ename] [-lnr] [first] [last] or fc -s [pat=rep] [command]",
    category: "system",
    execute: async () => "history command displayed.",
  },
  "jobs": {
    name: "jobs",
    description: "Display status of jobs",
    usage: "jobs [-lnprs] [jobspec ...]",
    category: "system",
    execute: async () => "[1]+  Running                 python api_server.py &",
  },
  "disown": {
    name: "disown",
    description: "Remove jobs from job table",
    usage: "disown [-h] [-ar] [jobspec ... | pid ...]",
    category: "system",
    execute: async () => "job disowned.",
  },
  "bg": {
    name: "bg",
    description: "Move jobs to the background",
    usage: "bg [jobspec ...]",
    category: "system",
    execute: async () => "job moved to background.",
  },
  "fg": {
    name: "fg",
    description: "Move jobs to the foreground",
    usage: "fg [jobspec]",
    category: "system",
    execute: async () => "job moved to foreground.",
  },
  "kill": {
    name: "kill",
    description: "Send a signal to a job",
    usage: "kill [-s sigspec | -n signum | -sigspec] [pid | jobspec] ...",
    category: "system",
    execute: async (args) => {
      if (args.length === 0) return "kill: usage: kill [-s sigspec | -n signum | -sigspec] pid | jobspec ...";
      return `signal sent to job ${args[0]}`;
    },
  },
  "getopts": {
    name: "getopts",
    description: "Parse option arguments",
    usage: "getopts optstring name [arg ...]",
    category: "system",
    execute: async () => "options parsed.",
  },
  "true": {
    name: "true",
    description: "Do nothing, successfully",
    usage: "true",
    category: "system",
    execute: async () => "",
  },
  "false": {
    name: "false",
    description: "Do nothing, unsuccessfully",
    usage: "false",
    category: "system",
    execute: async () => {
      throw new Error("false");
    },
  },
  "yes": {
    name: "yes",
    description: "Output a string repeatedly until killed",
    usage: "yes [string]",
    category: "fun",
    execute: async (args) => {
      const str = args.join(" ") || "y";
      return `${str}\n${str}\n${str}\n[Output truncated after 3 lines]`;
    },
  },
  "seq": {
    name: "seq",
    description: "Print a sequence of numbers",
    usage: "seq [first [increment]] last",
    category: "system",
    execute: async (args) => {
      if (args.length === 0) return "seq: missing operand";
      const last = parseInt(args[args.length - 1]);
      if (isNaN(last)) return "seq: invalid number";
      return Array.from({ length: Math.min(last, 20) }, (_, i) => i + 1).join("\n");
    },
  },
  "factor": {
    name: "factor",
    description: "Print prime factors",
    usage: "factor [number]",
    category: "system",
    execute: async (args) => {
      if (args.length === 0) return "factor: missing operand";
      const num = parseInt(args[0]);
      if (isNaN(num)) return "factor: invalid number";
      const factors = [];
      let n = num;
      for (let i = 2; i <= n; i++) {
        while (n % i === 0) {
          factors.push(i);
          n /= i;
        }
      }
      return `${num}: ${factors.join(" ")}`;
    },
  },
  "bc": {
    name: "bc",
    description: "An arbitrary precision calculator language",
    usage: "bc [options] [file]",
    category: "system",
    execute: async (args) => {
      if (args.length === 0) return "bc 1.07.1\nCopyright 1991-1994, 1997, 1998, 2000, 2004, 2006, 2008, 2012-2017 Free Software Foundation, Inc.\n[Interactive mode simulated]";
      return "calculated.";
    },
  },
  "dc": {
    name: "dc",
    description: "An arbitrary precision calculator",
    usage: "dc [options] [file]",
    category: "system",
    execute: async () => "dc calculator simulated.",
  },
  "expr": {
    name: "expr",
    description: "Evaluate expressions",
    usage: "expr expression",
    category: "system",
    execute: async (args) => {
      if (args.length === 0) return "expr: missing operand";
      try {
        return String(Function('"use strict";return (' + args.join(" ") + ')')());
      } catch {
        return "expr: syntax error";
      }
    },
  },
  "test": {
    name: "test",
    description: "Evaluate conditional expression",
    usage: "test expression",
    category: "system",
    execute: async () => "expression evaluated.",
  },
  "true": {
    name: "true",
    description: "Do nothing, successfully",
    usage: "true",
    category: "system",
    execute: async () => "",
  },
  "false": {
    name: "false",
    description: "Do nothing, unsuccessfully",
    usage: "false",
    category: "system",
    execute: async () => {
      throw new Error("false");
    },
  },
  "yes": {
    name: "yes",
    description: "Output a string repeatedly until killed",
    usage: "yes [string]",
    category: "fun",
    execute: async (args) => {
      const str = args.join(" ") || "y";
      return `${str}\n${str}\n${str}\n[Output truncated]`;
    },
  },
  "seq": {
    name: "seq",
    description: "Print a sequence of numbers",
    usage: "seq [first [increment]] last",
    category: "system",
    execute: async (args) => {
      if (args.length === 0) return "seq: missing operand";
      const last = parseInt(args[args.length - 1]);
      if (isNaN(last)) return "seq: invalid number";
      return Array.from({ length: Math.min(last, 20) }, (_, i) => i + 1).join("\n");
    },
  },
  "factor": {
    name: "factor",
    description: "Print prime factors",
    usage: "factor [number]",
    category: "system",
    execute: async (args) => {
      if (args.length === 0) return "factor: missing operand";
      const num = parseInt(args[0]);
      if (isNaN(num)) return "factor: invalid number";
      const factors = [];
      let n = num;
      for (let i = 2; i <= n; i++) {
        while (n % i === 0) {
          factors.push(i);
          n /= i;
        }
      }
      return `${num}: ${factors.join(" ")}`;
    },
  },
  "bc": {
    name: "bc",
    description: "An arbitrary precision calculator language",
    usage: "bc [options] [file]",
    category: "system",
    execute: async () => "bc calculator simulated.",
  },
  "dc": {
    name: "dc",
    description: "An arbitrary precision calculator",
    usage: "dc [options] [file]",
    category: "system",
    execute: async () => "dc calculator simulated.",
  },
  "expr": {
    name: "expr",
    description: "Evaluate expressions",
    usage: "expr expression",
    category: "system",
    execute: async (args) => {
      if (args.length === 0) return "expr: missing operand";
      try {
        return String(Function('"use strict";return (' + args.join(" ") + ')')());
      } catch {
        return "expr: syntax error";
      }
    },
  },
};

// ============================================================================
// UTILITY FUNCTIONS - VFS & PATH RESOLUTION
// ============================================================================

const resolvePath = (vfs: FileSystemNode, path: string): FileSystemNode | null => {
  if (path === "/") return vfs;
  const parts = path.split("/").filter(Boolean);
  let current = vfs;
  
  for (const part of parts) {
    if (!current.children || !current.children[part]) return null;
    current = current.children[part];
  }
  
  return current;
};

const generateId = () => Math.random().toString(36).substring(2, 15) + Date.now().toString(36);

// ============================================================================
// SUB-COMPONENTS - TERMINAL UI ELEMENTS
// ============================================================================

const TerminalHeader: React.FC<{
  onClose: () => void;
  onMaximize: () => void;
  onMinimize: () => void;
  isMaximized: boolean;
}> = ({ onClose, onMaximize, onMinimize, isMaximized }) => (
  <div className="flex items-center justify-between px-4 py-2 bg-black/80 border-b border-white/10 backdrop-blur-xl">
    <div className="flex items-center gap-2">
      <button onClick={onClose} className="w-3 h-3 rounded-full bg-red-500 hover:bg-red-400 transition-colors" />
      <button onClick={onMinimize} className="w-3 h-3 rounded-full bg-yellow-500 hover:bg-yellow-400 transition-colors" />
      <button onClick={onMaximize} className="w-3 h-3 rounded-full bg-green-500 hover:bg-green-400 transition-colors" />
    </div>
    <div className="flex items-center gap-2 text-xs text-white/60 font-mono">
      <Terminal className="w-3 h-3" />
      <span>architect@jarvis-mainframe: ~</span>
    </div>
    <div className="flex items-center gap-2">
      <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
      <span className="text-[10px] text-green-400">CONNECTED</span>
    </div>
  </div>
);

const BootSequence: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const [lines, setLines] = useState<string[]>([]);
  
  useEffect(() => {
    const bootMessages = [
      "BIOS Date: 06/11/26 15:42:11 Ver: 05.00.00",
      "CPU: 12th Gen Intel(R) Core(TM) i5-12450HX @ 4.40GHz",
      "Speed: 4400 MHz",
      "Initializing USB Controllers .. Done.",
      "16384 MB OK",
      "",
      "Loading JARVIS OS 5.0 (God Protocol)...",
      "[    0.000000] Linux version 6.6.114.1-microsoft-standard-WSL2",
      "[    0.000000] Command line: BOOT_IMAGE=/vmlinuz-6.6.114.1 root=UUID=random",
      "[    0.124582] ACPI: RSDP 0x000000007EFCF000 000040 (v02 VRTUAL 00000001 MSFT 00000001)",
      "[    0.245103] Memory: 16384MB available",
      "[    0.356214] Calibrating delay loop... 8800.00 BogoMIPS",
      "[    0.467325] Mount-cache hash table entries: 4096",
      "[    0.578436] Initializing cgroup subsys cpuset",
      "[    0.689547] Initializing cgroup subsys cpu",
      "[    0.790658] Initializing cgroup subsys cpuacct",
      "",
      "Starting JARVIS Core Services...",
      "[  OK  ] Started Neural Network Engine.",
      "[  OK  ] Started Council of Three Protocol.",
      "[  OK  ] Started 6-Layer Containment System.",
      "[  OK  ] Started Merkle Audit Chain.",
      "[  OK  ] Started Sovereign AI Architecture.",
      "",
      "JARVIS V5.0 God Protocol - Build 20260611",
      "Copyright (c) Stark Industries. All rights reserved.",
      "",
    ];
    
    let i = 0;
    const interval = setInterval(() => {
      if (i < bootMessages.length) {
        setLines(prev => [...prev, bootMessages[i]]);
        i++;
      } else {
        clearInterval(interval);
        setTimeout(onComplete, 500);
      }
    }, 50);
    
    return () => clearInterval(interval);
  }, [onComplete]);
  
  return (
    <div className="font-mono text-sm text-green-400 p-4 space-y-1">
      {lines.map((line, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className={line.includes("[  OK  ]") ? "text-green-400" : line.includes("JARVIS") ? "text-cyan-400 font-bold" : "text-white/80"}
        >
          {line}
        </motion.div>
      ))}
    </div>
  );
};

const OutputLine: React.FC<{ line: TerminalLine }> = ({ line }) => {
  const getColor = () => {
    switch (line.type) {
      case "error": return "text-red-400";
      case "success": return "text-green-400";
      case "info": return "text-cyan-400";
      case "warning": return "text-yellow-400";
      case "ascii": return "text-purple-400 font-bold";
      case "system": return "text-white/60";
      default: return "text-white";
    }
  };
  
  if (line.type === "input") {
    return (
      <div className="flex items-start gap-2">
        <span className="text-cyan-400 font-bold">{line.path || "~/projects"}</span>
        <span className="text-white">$</span>
        <span className="text-white">{line.command}</span>
      </div>
    );
  }
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`${getColor()} whitespace-pre-wrap break-words`}
    >
      {line.content}
    </motion.div>
  );
};

// ============================================================================
// MAIN TERMINAL COMPONENT
// ============================================================================

export default function TerminalEmulator() {
  const [lines, setLines] = useState<TerminalLine[]>([]);
  const [input, setInput] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [currentPath, setCurrentPath] = useState("/home/architect");
  const [isBooting, setIsBooting] = useState(true);
  const [isMaximized, setIsMaximized] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const vfs = useMemo(() => INITIAL_VFS, []);
  
  const context: TerminalContext = useMemo(() => ({
    currentPath,
    vfs,
    environment: { USER: "architect", HOSTNAME: "jarvis-mainframe" },
    history,
    user: "architect",
    hostname: "jarvis-mainframe",
  }), [currentPath, vfs, history]);
  
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [lines]);
  
  useEffect(() => {
    if (!isBooting && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isBooting]);
  
  const executeCommand = useCallback(async (cmdString: string) => {
    const trimmed = cmdString.trim();
    if (!trimmed) return;
    
    setHistory(prev => [...prev, trimmed]);
    setHistoryIndex(-1);
    
    const inputLine: TerminalLine = {
      id: generateId(),
      type: "input",
      content: "",
      timestamp: new Date(),
      command: trimmed,
      path: currentPath,
    };
    setLines(prev => [...prev, inputLine]);
    
    const parts = trimmed.split(/\s+/);
    const cmd = parts[0];
    const args = parts.slice(1);
    
    const commandDef = COMMANDS[cmd];
    
    if (!commandDef) {
      const errorLine: TerminalLine = {
        id: generateId(),
        type: "error",
        content: `zsh: command not found: ${cmd}`,
        timestamp: new Date(),
      };
      setLines(prev => [...prev, errorLine]);
      return;
    }
    
    try {
      const result = await commandDef.execute(args, context);
      
      if (result === "CLEAR_SCREEN") {
        setLines([]);
        return;
      }
      
      if (result === "SESSION_TERMINATED") {
        const termLine: TerminalLine = {
          id: generateId(),
          type: "system",
          content: "logout\n\nConnection to jarvis-mainframe closed.\n\n[Session terminated. Refresh to restart.]",
          timestamp: new Date(),
        };
        setLines(prev => [...prev, termLine]);
        return;
      }
      
      if (typeof result === "object" && "type" in result && result.type === "PATH_CHANGE") {
        setCurrentPath((result as any).path);
        return;
      }
      
      const outputLines = Array.isArray(result) ? result : [result];
      outputLines.forEach(content => {
        const line: TerminalLine = {
          id: generateId(),
          type: "output",
          content,
          timestamp: new Date(),
        };
        setLines(prev => [...prev, line]);
      });
    } catch (error: any) {
      const errorLine: TerminalLine = {
        id: generateId(),
        type: "error",
        content: error.message || "Unknown error occurred",
        timestamp: new Date(),
      };
      setLines(prev => [...prev, errorLine]);
    }
  }, [currentPath, context]);
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      executeCommand(input);
      setInput("");
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (history.length > 0) {
        const newIndex = historyIndex === -1 ? history.length - 1 : Math.max(0, historyIndex - 1);
        setHistoryIndex(newIndex);
        setInput(history[newIndex]);
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (historyIndex !== -1) {
        const newIndex = historyIndex + 1;
        if (newIndex >= history.length) {
          setHistoryIndex(-1);
          setInput("");
        } else {
          setHistoryIndex(newIndex);
          setInput(history[newIndex]);
        }
      }
    } else if (e.key === "Tab") {
      e.preventDefault();
      const partial = input.split(" ").pop() || "";
      const matches = Object.keys(COMMANDS).filter(c => c.startsWith(partial));
      if (matches.length === 1) {
        const parts = input.split(" ");
        parts[parts.length - 1] = matches[0];
        setInput(parts.join(" ") + " ");
      } else if (matches.length > 1) {
        const line: TerminalLine = {
          id: generateId(),
          type: "info",
          content: matches.join("  "),
          timestamp: new Date(),
        };
        setLines(prev => [...prev, line]);
      }
    } else if (e.key === "l" && e.ctrlKey) {
      e.preventDefault();
      setLines([]);
    } else if (e.key === "c" && e.ctrlKey) {
      e.preventDefault();
      setInput("");
      const line: TerminalLine = {
        id: generateId(),
        type: "input",
        content: "",
        timestamp: new Date(),
        command: input + "^C",
        path: currentPath,
      };
      setLines(prev => [...prev, line]);
    }
  };
  
  if (isBooting) {
    return (
      <div className="w-full h-full bg-black overflow-auto">
        <BootSequence onComplete={() => setIsBooting(false)} />
      </div>
    );
  }
  
  return (
    <div className={`relative flex flex-col bg-black text-white font-mono transition-all duration-300 ${isMaximized ? "fixed inset-0 z-50" : "w-full h-full rounded-xl overflow-hidden border border-white/10"}`}>
      <TerminalHeader
        onClose={() => {}}
        onMaximize={() => setIsMaximized(!isMaximized)}
        onMinimize={() => {}}
        isMaximized={isMaximized}
      />
      
      <div
        ref={containerRef}
        className="flex-1 overflow-auto p-4 space-y-2 text-sm"
        onClick={() => inputRef.current?.focus()}
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-purple-400 font-bold whitespace-pre"
        >
          {ASCII_BANNERS.jarvis}
        </motion.div>
        
        {lines.map(line => (
          <OutputLine key={line.id} line={line} />
        ))}
        
        <div className="flex items-start gap-2">
          <span className="text-cyan-400 font-bold">{currentPath}</span>
          <span className="text-white">$</span>
          <div className="flex-1 relative">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full bg-transparent outline-none text-white caret-white"
              autoFocus
              spellCheck={false}
              autoComplete="off"
            />
          </div>
        </div>
      </div>
      
      <div className="px-4 py-2 bg-black/80 border-t border-white/10 text-[10px] text-white/40 flex justify-between">
        <span>zsh 5.9 — architect@jarvis-mainframe</span>
        <span>{lines.length} lines | {history.length} history</span>
      </div>
    </div>
  );
}