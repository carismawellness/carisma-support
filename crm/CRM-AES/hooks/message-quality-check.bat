@echo off
REM ============================================================================
REM MESSAGE QUALITY CHECK HOOK (Post-Tool)
REM ============================================================================
REM Purpose: Scans Claude's drafted message for AI-tells and off-brand phrases
REM Trigger: After Claude generates a customer-facing message
REM Action: WARNS agent (does not block) if issues found
REM ============================================================================

setlocal enabledelayedexpansion

REM Get the message content from stdin (Claude passes generated message)
set "message="
for /f "delims=" %%A in ('more') do (
    set "message=!message!%%A "
)

REM Convert to uppercase for case-insensitive matching
for %%A in (a b c d e f g h i j k l m n o p q r s t u v w x y z) do (
    set "message=!message:%%A=%%A!"
)

REM ============================================================================
REM LAYER 1: AI-TELL PHRASES (Sound robotic/non-human)
REM ============================================================================

set "ai_tells=Certainly!|I'd be happy to|Of course!|Absolutely!|Feel free to|Please don't hesitate|As an AI|I hope this helps|Great question!|I understand that|Thank you for reaching out|I'm delighted|I'm thrilled|With pleasure|My pleasure"

set "ai_found=0"
set "ai_phrase="

for %%P in (%ai_tells%) do (
    echo !message! | findstr /I /C:"%%P" >nul
    if !errorlevel! equ 0 (
        set "ai_found=1"
        set "ai_phrase=%%P"
        goto ai_detected
    )
)

:ai_detected
if !ai_found! equ 1 (
    echo.
    echo ⚠️  AI-TELL DETECTED: "!ai_phrase!"
    echo.
    echo This phrase sounds robotic. Replace with something more natural:
    echo   ❌ "Certainly!" or "Of course!" or "I'd be happy to"
    echo   ✅ "Got it" or "Let me help" or "Perfect, here's what..."
    echo.
)

REM ============================================================================
REM LAYER 2: OFF-BRAND PHRASES (Violate Carisma voice)
REM ============================================================================

set "off_brand=Pamper yourself|Treat yourself|Hurry|Limited time|Don't miss out|Book now!|Amazing|Fantastic|Awesome|Feel free|Last chance|Perfect for your holiday|Fun spa day|Best spa|Myofascial|Lymphatic drainage|Incredibly|Best deal|Flash sale|Grab yours|Act fast"

set "brand_found=0"
set "brand_phrase="

for %%P in (%off_brand%) do (
    echo !message! | findstr /I /C:"%%P" >nul
    if !errorlevel! equ 0 (
        set "brand_found=1"
        set "brand_phrase=%%P"
        goto brand_detected
    )
)

:brand_detected
if !brand_found! equ 1 (
    echo.
    echo ⚠️  OFF-BRAND PHRASE DETECTED: "!brand_phrase!"
    echo.
    echo This doesn't match Carisma's voice. Replace with something more aligned:
    echo   ❌ "Pamper yourself" / "Treat yourself" / "Book now!"
    echo   ✅ "Take a moment for yourself" / "A gift of time. Whenever you're ready."
    echo.
)

REM ============================================================================
REM SUMMARY
REM ============================================================================

if !ai_found! equ 0 if !brand_found! equ 0 (
    echo ✅ Message passed quality check - good to send!
    exit /b 0
) else (
    echo Review message before sending. Consider the flags above.
    exit /b 0
)
