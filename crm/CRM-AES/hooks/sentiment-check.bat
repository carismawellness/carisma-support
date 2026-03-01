@echo off
REM ============================================================================
REM NEGATIVE SENTIMENT DETECTION HOOK (Post-Tool)
REM ============================================================================
REM Purpose: Scans incoming customer message for anger/upset signals
REM Trigger: After customer message is received/pasted into intake
REM Action: WARNS agent and suggests activating complaint-handler skill
REM ============================================================================

setlocal enabledelayedexpansion

REM Get the message content from stdin
set "message="
for /f "delims=" %%A in ('more') do (
    set "message=!message!%%A "
)

REM Convert to uppercase for case-insensitive matching
setlocal enabledelayedexpansion
for /l %%A in (65,1,90) do (
    for /f %%B in ('echo prompt $H ^| cmd') do set "BS=%%B"
    for /f %%C in ('copy /Z "%~f0" nul') do set "QUOTES=%%C"
)

REM ============================================================================
REM ANGER & FRUSTRATION INDICATORS
REM ============================================================================

set "anger_signals=disgusted|ridiculous|unacceptable|never again|refund|demand|terrible|awful|complaint|disappointed|shocked|furious|outraged|infuriated|absolutely unacceptable|I want a refund|This is unacceptable|I'm very upset|extremely disappointed|completely dissatisfied"

set "anger_found=0"
set "anger_phrase="

for %%P in (%anger_signals%) do (
    echo !message! | findstr /I /C:"%%P" >nul
    if !errorlevel! equ 0 (
        set "anger_found=1"
        set "anger_phrase=%%P"
        goto anger_detected
    )
)

:anger_detected
if !anger_found! equ 1 (
    echo.
    echo 🔴 NEGATIVE SENTIMENT DETECTED: "!anger_phrase!"
    echo.
    echo This customer is upset or angry.
    echo.
    echo RECOMMENDED ACTION:
    echo   1. Invoke [complaint-handler] skill
    echo   2. Follow: Absorb → Validate → Own → Resolve → Restore
    echo   3. Sign off with "With care, Sarah" (not "Peacefully, Sarah")
    echo.
    echo Remember: Service Recovery Paradox — handled well, upset customers become MORE loyal.
    echo.
    exit /b 1
)

REM ============================================================================
REM MILD FRUSTRATION INDICATORS
REM ============================================================================

set "mild_frustration=disappointed|concerned|frustrated|worried|hesitant|uncertain|not sure|problem|issue|trouble|difficulty|concerned about"

set "frustration_found=0"
set "frustration_phrase="

for %%P in (%mild_frustration%) do (
    echo !message! | findstr /I /C:"%%P" >nul
    if !errorlevel! equ 0 (
        set "frustration_found=1"
        set "frustration_phrase=%%P"
        goto frustration_detected
    )
)

:frustration_detected
if !frustration_found! equ 1 (
    echo.
    echo ⚠️  MILD FRUSTRATION DETECTED: "!frustration_phrase!"
    echo.
    echo Customer may be concerned or hesitant. Consider:
    echo   - Extra empathy in your response
    echo   - Clear explanations (no jargon)
    echo   - [objection-buster] skill if price/timing related
    echo   - [complaint-handler] skill if service issue
    echo.
)

REM ============================================================================
REM SUMMARY
REM ============================================================================

if !anger_found! equ 0 if !frustration_found! equ 0 (
    echo ✅ Sentiment check: Neutral or positive — proceed normally
    exit /b 0
)

exit /b 0
