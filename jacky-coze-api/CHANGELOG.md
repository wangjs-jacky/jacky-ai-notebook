# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.0.0] - 2025-01-XX

### Added
- 🎉 Initial release
- ✨ High-level wrapper for Coze API
- 🔄 Built-in conversation management
- 📡 Lifecycle events support (onStart, onMessage, onComplete, onError, onUsage)
- 💬 Streaming message support
- 🎯 Full TypeScript support with type definitions
- 🔌 Dual module support (CommonJS and ES Module)
- 📝 Complete documentation in English and Chinese
- 🚀 Simple and intuitive API
- 🔄 Multi-turn conversation support
- 📖 Comprehensive examples

### Features
- `createCozeAgent()` - Main factory function
- `chat()` - Send messages with optional lifecycle hooks
- `reset()` - Reset conversation state
- `getHistory()` - Get conversation history
- Configuration options: debug, autoSaveHistory, baseURL
- Type exports: CozeAgent, CozeAgentConfig, LifecycleEvents, ChatResult, ConversationManager

### Documentation
- README.md - English documentation
- README.zh.md - Chinese documentation
- QUICK_START.md - Quick start guide (Chinese)
- PUBLISH.md - Publishing guide
- Examples in `src/examples/demo.ts`

---

## Version History

### Versioning Strategy

This project follows [Semantic Versioning](https://semver.org/):

- **MAJOR** version for incompatible API changes
- **MINOR** version for backwards-compatible new features
- **PATCH** version for backwards-compatible bug fixes

### Future Plans

- [ ] Add unit tests
- [ ] Add integration tests
- [ ] Support for more Coze API features
- [ ] Add retry logic for failed requests
- [ ] Add rate limiting support
- [ ] Add conversation export/import
- [ ] Add plugin system
- [ ] Performance optimizations

---

For more details about each release, see the [GitHub Releases](https://github.com/wangjs-jacky/jacky-ai-notebook/releases) page.

