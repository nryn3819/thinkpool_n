from pathlib import Path
import json, sys
folder = Path(__file__).resolve().parent
root = folder.parent.parent
changes = json.loads((folder / "changes.json").read_text())
planned = {}
for change in reversed(changes):
    path = root / change["file"]
    data = planned.get(path, path.read_bytes())
    old = change["after"].encode()
    new = change["before"].encode()
    if data.count(old) != 1:
        raise SystemExit("복원 중단: 이후 폰트 변경 내용을 먼저 확인해야 합니다: " + change["file"])
    planned[path] = data.replace(old, new, 1)
if "--check" in sys.argv:
    print("이번 폰트 변경만 복원 가능: " + str(len(planned)) + "개 파일")
else:
    for path, data in planned.items():
        path.write_bytes(data)
    print("폰트 설정을 변경 전으로 복원했습니다. 다른 작업 내용은 유지됩니다.")
