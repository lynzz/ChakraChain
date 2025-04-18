# ChakraChain DApp

一个使用现代技术栈构建的 DApp 项目，包含前端和智能合约。

## 技术栈

### 前端
- React
- TypeScript
- Vite
- Chakra UI
- Wagmi
- Viem
- TanStack Query

### 智能合约
- Solidity
- Hardhat (TypeScript 配置)
- OpenZeppelin
- TypeScript

## 项目结构

```
chakra-chain/
├── packages/
│   ├── frontend/          # React 前端应用
│   └── contracts/         # Solidity 智能合约
│       ├── contracts/     # Solidity 合约文件
│       ├── scripts/       # 部署脚本 (TypeScript)
│       ├── test/          # 测试文件 (TypeScript)
│       ├── hardhat.config.ts  # Hardhat 配置 (TypeScript)
│       └── tsconfig.json  # TypeScript 配置
├── pnpm-workspace.yaml    # pnpm workspace 配置
└── package.json          # 根目录配置
```

## 开始使用

1. 安装依赖：

```bash
pnpm install
```

2. 编译智能合约：

```bash
pnpm compile
```

3. 运行测试：

```bash
pnpm test
```

4. 启动开发服务器：

```bash
pnpm dev
```

5. 部署合约：

```bash
pnpm deploy
```

## 功能特点

- 使用 pnpm workspace 管理多包项目
- 现代化的前端开发体验
- 完整的智能合约开发环境 (TypeScript)
- 支持多链（Mainnet 和 Sepolia）
- 美观的 UI 设计
- TypeScript 支持

## 要求

- Node.js 16+
- pnpm
- MetaMask 或其他 Web3 钱包 