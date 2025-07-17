import PyInstaller.__main__
import os

# Get the current directory
current_dir = os.path.dirname(os.path.abspath(__file__))

# Run PyInstaller
PyInstaller.__main__.run([
    'roofing_app.spec',
    '--clean',
])

print("Build completed. Check the 'dist' folder for your executable.")
