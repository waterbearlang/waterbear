import os
import json
import pdb
for root, dirs, files in os.walk("."):
    for filename in files:
        if os.path.splitext(filename)[-1] == ".json":
            f = open(filename)
            j = json.loads(f.read())
            f.close()
            pdb.set_trace()
            blocks = j['blocks']
            for block in blocks:
                for k in block.keys():
                    if k not in ['id','name','help']:
                        block.pop(k)
            f = open(filename,"w")
            f.write(json.dumps(j, indent=4))
            f.close()
