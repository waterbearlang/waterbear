import subprocess, sys, os, re
import pdb
sys.path += os.getenv("PATH").split(";")
p = subprocess.Popen(["diff","before.json","after.json"],stdout=subprocess.PIPE)
out = p.stdout.readlines()
p.stdout.close()


op = -1
lineno1 = -1
lineno2 = -2
lineno3 = -3


CHE_RE = re.compile(r"^(?P<fLineNo1>\d+)(,(?P<fLineNo2>\d+))?(?P<op>[acd])(?P<sLineNo1>\d+)(,(?P<sLineNo2>\d+))?$")
KEY_RE = re.compile(r"[\"'](?P<key>.+)[\"']\w*:")

FIRST = 1
SECOND = -1
mode = SECOND

first_dict = {}
second_dict = {}
fCount = 0
sCount = 0
for line in out:
    if mode == SECOND and sCount == 0:
        match = CHE_RE.match(line)
        if match:
            d = match.groupdict()
            fLineno1 = int(d.get("fLineNo1"))
            fLineno2 = d.get("fLineNo2")
            fLineno2 = int(fLineno2 if fLineno2 else fLineno1)
            sLineno1 = int(d.get("sLineNo1"))
            sLineno2 = d.get("sLineNo2")
            sLineno2 = int(sLineno2 if sLineno2 else sLineno1)
            
            op       = d.get("op")
            mode = FIRST
            fCount = 0 if op == "a" else (fLineno2 - fLineno1 + 1)
            sCount = 0 if op == "d" else (sLineno2 - sLineno1 + 1)
    
    elif mode == FIRST and fCount == 0:
        mode = SECOND
    elif mode == FIRST:
        match = KEY_RE.search(line)
        if match:
            key = match.groupdict()['key']
            ind = first_dict.get(fLineno1, {})            
            s = ind.get(op, set())
            s.add(key)
            ind[op] = s
            first_dict[fLineno1] = ind
        fCount -=1
        
    elif mode == SECOND:
        match = KEY_RE.search(line)
        if match:
            key = match.groupdict()['key']
            ind = second_dict.get(sLineno1, {})            
            s = ind.get(op, set())
            s.add(key)
            ind[op] = s
            second_dict[sLineno1] = ind
        sCount -=1

file1 = open("before.json")
lines = file1.readlines()
file1.close()

previous = []
bCount = 0

mark_dict = {}
for i in range(len(lines)):
    line = lines[i]
    if re.search("\w*{\w*", line):
        previous.append(i)
        bCount +=1
    elif re.search("\w*}\w*", line):
        previous.pop()
        bCount -=1        
    elif i in first_dict:
        #pdb.set_trace()
        md = mark_dict.get(previous[-1], {})
        for op, val in first_dict[i].iteritems():
            if "scriptId" in val:
                md[op] = md.get(op, set()).union(set(["scriptId"]))
            else:
                md[op] = md.get(op, set()).union(val)
        mark_dict[previous[-1]] = md

file1 = open("before.json.diff","w")
for i in range(len(lines)):
    line = lines[i]
    file1.write(line)
    if i in mark_dict:
        w = re.match("(\s*)\S",line)
        w = w.group(1) if w else ""
        for op,s in mark_dict[i].iteritems():
            file1.write('%s    "diff_%s": %s,\n' %(w, op, str(list(s))))
file1.close()
        

file2 = open("after.json")
lines = file2.readlines()
file2.close()

previous = []
bCount = 0

mark_dict = {}
for i in range(len(lines)):
    line = lines[i]
    if re.search("\w*{\w*", line):
        previous.append(i)
        bCount +=1
    elif re.search("\w*}\w*", line):
        previous.pop()
        bCount -=1        
    elif i in second_dict:
        #pdb.set_trace()
        md = mark_dict.get(previous[-1], {})
        
        for op, val in second_dict[i].iteritems():
            if "scriptId" in val:
                md[op] = md.get(op, set()).union(set(["scriptId"]))
            else:
                md[op] = md.get(op, set()).union(val)
        mark_dict[previous[-1]] = md

file2 = open("after.json.diff","w")
for i in range(len(lines)):
    line = lines[i]
    file2.write(line)
    if i in mark_dict:
        w = re.match("(\s*)\S",line)
        w = w.group(1) if w else ""
        for op,s in mark_dict[i].iteritems():
            file2.write('%s    "diff_%s": %s,\n' %(w, op, str(list(s))))
file2.close()        
            
                
                
        
        
