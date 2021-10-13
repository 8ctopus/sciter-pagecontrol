mkdir bin\win-x32

cd bin\win-x32

REM sciter 4.4.8.12
curl -LO https://github.com/c-smile/sciter-js-sdk/raw/b73c9cb6b6501908a1ed2f46e333b86a1cae9482/bin/windows/x32/scapp.exe
curl -LO https://github.com/c-smile/sciter-js-sdk/raw/b73c9cb6b6501908a1ed2f46e333b86a1cae9482/bin/windows/x32/inspector.exe
curl -LO https://github.com/c-smile/sciter-js-sdk/raw/b73c9cb6b6501908a1ed2f46e333b86a1cae9482/bin/windows/x32/sciter.dll

cd ..

REM sciter package manager 0.1.6
curl -LO https://github.com/8ctopus/sciter-package-manager/releases/download/0.1.6/spm.phar

pause
