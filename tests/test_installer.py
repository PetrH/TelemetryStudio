"""Exercise installer routing without installing anything on the test machine."""
import os
from pathlib import Path
import shutil
import subprocess
import tempfile
import unittest

ROOT = Path(__file__).resolve().parents[1]


@unittest.skipIf(os.name == 'nt' or not shutil.which('bash'), 'POSIX installer test')
class InstallerTests(unittest.TestCase):
    def run_case(self, manager, platform='Linux', check=False):
        with tempfile.TemporaryDirectory() as tmp:
            root=Path(tmp); (root/'scripts').mkdir(); (root/'bin').mkdir()
            shutil.copy(ROOT/'scripts/install-deps.sh',root/'scripts/install-deps.sh')
            def executable(name, body):
                file=root/'bin'/name
                file.write_text('#!/bin/bash\n'+body+'\n');file.chmod(0o755)
            # Use only known mock commands in PATH; package managers never run.
            for name in ('dirname','awk'):
                (root/'bin'/name).symlink_to(shutil.which(name))
            executable('uname',f'echo {platform}')
            executable('id', 'echo '+('1000' if platform=='Darwin' else '0'))
            executable('python3','[ -f "$STATE" ] || exit 1; echo "Python 3.12"')
            executable('ffmpeg','[ -f "$STATE" ] || exit 1; printf " V..... prores_ks\\n V..... libvpx-vp9\\n V..... libx264\\n V..... libx265\\n"')
            executable(manager,'echo "$*" >> "$LOG"; if [ "$1" != update ]; then : > "$STATE"; fi')
            env={**os.environ,'PATH':str(root/'bin'),'STATE':str(root/'installed'),'LOG':str(root/'calls')}
            result=subprocess.run([shutil.which('bash'),str(root/'scripts/install-deps.sh')]+(['--check'] if check else []),env=env,text=True,capture_output=True)
            calls=(root/'calls').read_text() if (root/'calls').exists() else ''
            return result,calls

    def test_linux_package_managers(self):
        expected={'apt-get':'install -y python3 ffmpeg','dnf':'install -y python3 ffmpeg','pacman':'-Syu --needed python ffmpeg','zypper':'--non-interactive install python3 ffmpeg'}
        for manager,command in expected.items():
            with self.subTest(manager=manager):
                result,calls=self.run_case(manager)
                self.assertEqual(result.returncode,0,result.stderr)
                self.assertIn(command,calls)
                self.assertIn('Ready.',result.stdout)

    def test_macos_homebrew(self):
        result,calls=self.run_case('brew','Darwin')
        self.assertEqual(result.returncode,0,result.stderr)
        self.assertIn('install python ffmpeg',calls)

    def test_check_never_installs(self):
        result,calls=self.run_case('apt-get',check=True)
        self.assertNotEqual(result.returncode,0)
        self.assertEqual(calls,'')

if __name__=='__main__':unittest.main()
