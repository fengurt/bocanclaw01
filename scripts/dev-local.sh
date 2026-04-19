#!/usr/bin/env bash
# 仅释放本项目的开发端口 → git push → 启动 Vite 并打开浏览器
# 用法：在项目根目录执行  ./scripts/dev-local.sh
# 可选：DEV_PORT=5174 ./scripts/dev-local.sh

set -u

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_ROOT" || exit 1

PORT="${DEV_PORT:-5173}"

echo "[dev-local] 项目目录: ${REPO_ROOT}"
echo "[dev-local] 开发端口: ${PORT}"

if ! command -v lsof >/dev/null 2>&1; then
  echo "[dev-local] 未找到 lsof，无法按端口查杀；请安装 Xcode CLI 工具或跳过此步。" >&2
else
  echo "[dev-local] 查询监听 TCP ${PORT} 的进程…"
  # 仅选取处于 LISTEN 且绑定该端口的 PID，避免误杀仅作为客户端占用该端口的进程
  PIDS="$(lsof -t -iTCP:"${PORT}" -sTCP:LISTEN 2>/dev/null || true)"
  if [ -z "${PIDS}" ]; then
    echo "[dev-local] 端口 ${PORT} 无监听进程。"
  else
    for pid in ${PIDS}; do
      if [ -z "${pid}" ]; then
        continue
      fi
      cmd="$(ps -p "${pid}" -o comm= 2>/dev/null || true)"
      echo "[dev-local] 终止监听 ${PORT} 的 PID ${pid} (${cmd})"
      kill -TERM "${pid}" 2>/dev/null || true
    done
    sleep 1
    PIDS_REMAIN="$(lsof -t -iTCP:"${PORT}" -sTCP:LISTEN 2>/dev/null || true)"
    for pid in ${PIDS_REMAIN}; do
      echo "[dev-local] 强制结束仍占用 ${PORT} 的 PID ${pid}"
      kill -KILL "${pid}" 2>/dev/null || true
    done
  fi
fi

if git rev-parse --git-dir >/dev/null 2>&1; then
  echo "[dev-local] git push …"
  git push || echo "[dev-local] git push 失败（无远端、无网络或未提交变更时属正常）。" >&2
else
  echo "[dev-local] 非 git 仓库，跳过 push。" >&2
fi

if ! command -v npm >/dev/null 2>&1; then
  echo "[dev-local] 未找到 npm。" >&2
  exit 1
fi

echo "[dev-local] 启动 Vite（--open）…"
exec npx vite --open --host localhost --port "${PORT}"
