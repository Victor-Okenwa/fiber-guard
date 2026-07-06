# Changelog

All notable changes to the FiberGuard VS Code extension are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project follows [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Added `CHANGELOG.md` to track extension release history and user-facing updates.

## [0.0.1] - 2026-07-06

### Added
- Initial VS Code extension scaffold with Activity Bar integration and `Node Explorer` tree view.
- Core commands: `Health Details`, `Can I Pay?`, `Diagnose Payment`, `View All Payments`, and `Refresh`.
- Configurable `fiberguard.nodeUrl` setting for Fiber JSON-RPC endpoint selection.
- Shared diagnostics integration via `@fiberguard/diagnostics` and `@fiberguard/fiber-rpc`.
- Output channel diagnostics formatting and copy helpers for channel/peer metadata.
- Development and packaging scripts for local build, test, and marketplace packaging.

[Unreleased]: https://github.com/Victor-Okenwa/fiber-guard/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/Victor-Okenwa/fiber-guard/releases/tag/v0.1.0
