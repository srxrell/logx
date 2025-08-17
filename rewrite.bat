@echo off
SETLOCAL

REM ======== СТАРЫЕ ДАННЫЕ ========
set OLD_NAME=Miral Abbastada
set OLD_EMAIL=abbastadam@gmail.com

REM ======== НОВЫЕ ДАННЫЕ ========
set NEW_NAME=Serell Vorne
set NEW_EMAIL=serrelvorne@gmail.com

REM ======== Переписываем историю коммитов ========
git filter-branch --env-filter "if [ \"$GIT_COMMITTER_EMAIL\" = \"%OLD_EMAIL%\" ]; then export GIT_COMMITTER_NAME='%NEW_NAME%'; export GIT_COMMITTER_EMAIL='%NEW_EMAIL%'; fi; if [ \"$GIT_AUTHOR_EMAIL\" = '%OLD_EMAIL%' ]; then export GIT_AUTHOR_NAME='%NEW_NAME%'; export GIT_AUTHOR_EMAIL='%NEW_EMAIL%'; fi" -- --all

REM ======== Форс-пушим на GitHub ========
git push --force --tags origin main

ENDLOCAL
echo.
echo История коммитов успешно переписана на нового пользователя!
pause
