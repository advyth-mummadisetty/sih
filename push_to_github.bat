@echo off
cd /d "%~dp0"
echo ==========================================
echo Pushing KrishiSetu updates to GitHub...
echo ==========================================
git push origin sebareesh --force
git push origin main --force
echo ==========================================
echo Done! All commits are pushed to GitHub.
echo ==========================================
pause
