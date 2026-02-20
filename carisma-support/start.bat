@echo off
REM ============================================================================
REM CARISMA SUPPORT SYSTEM LAUNCHER
REM ============================================================================
REM Purpose: One-click startup for Windows agents
REM Action: Git pull latest + open Claude Code terminal
REM ============================================================================

setlocal enabledelayedexpansion

cls
echo.
echo ============================================================================
echo  CARISMA SUPPORT SYSTEM — LAUNCHER
echo ============================================================================
echo.

REM Check if we're in the right directory
if not exist "CLAUDE.md" (
    color 0C
    echo ERROR: This script must run from the carisma-support root directory
    echo.
    echo Expected: C:\path\to\carisma-support\start.bat
    echo Current: %cd%
    echo.
    pause
    exit /b 1
)

REM ============================================================================
REM STEP 1: GIT PULL (Get latest version)
REM ============================================================================

echo [1/3] Pulling latest version from GitHub...
echo.

git pull origin main
if !errorlevel! neq 0 (
    color 0C
    echo.
    echo ⚠️  Git pull failed. Check your internet connection.
    echo.
    echo Troubleshooting:
    echo   - Is GitHub Desktop running?
    echo   - Do you have internet connection?
    echo   - Are your GitHub credentials valid?
    echo.
    pause
    exit /b 1
)

color 0A
echo ✅ Git pull complete
echo.

REM ============================================================================
REM STEP 2: VERIFY SYSTEM INTEGRITY
REM ============================================================================

echo [2/3] Verifying system files...
echo.

setlocal enabledelayedexpansion
set "missing=0"

if not exist "CLAUDE.md" (
    echo ❌ Missing: CLAUDE.md
    set "missing=1"
)
if not exist "SKILL_INVENTORY.md" (
    echo ❌ Missing: SKILL_INVENTORY.md
    set "missing=1"
)
if not exist "skills\" (
    echo ❌ Missing: skills/ folder
    set "missing=1"
)
if not exist "knowledge\" (
    echo ❌ Missing: knowledge/ folder
    set "missing=1"
)
if not exist "locations\" (
    echo ❌ Missing: locations/ folder
    set "missing=1"
)

if !missing! equ 0 (
    color 0A
    echo ✅ All system files present
) else (
    color 0E
    echo ⚠️  Some files are missing. Try git pull again.
)
echo.

REM ============================================================================
REM STEP 3: OPEN CLAUDE CODE
REM ============================================================================

echo [3/3] Opening Claude Code...
echo.
echo Tip: Start with /onboard for the 5-minute walkthrough
echo      Then use intake format: CHANNEL / CUSTOMER / CONTEXT / [conversation]
echo.

claude code

color 0F
echo.
echo System closed. See you next session!
echo.
pause
