import json, sys, os, hashlib
from fontTools.ttLib import TTFont
from fontTools import subset
SRC='SmileySans-Oblique.ttf'; OUT='/home/user/luxreal/public/fonts/smiley'
cps=sorted(TTFont(SRC).getBestCmap().keys())
# priority shard: every character used in the site copy, plus basic Latin
d=json.load(open('/home/user/luxreal/messages/zh.json'))
used=set()
def walk(o):
    if isinstance(o,dict): [walk(v) for v in o.values()]
    elif isinstance(o,list): [walk(v) for v in o]
    else: used.update(ord(c) for c in str(o))
walk(d); used.update(range(0x20,0x7f))
first=[c for c in cps if c in used]
rest=[c for c in cps if c not in used]
shards=[first]+[rest[i:i+900] for i in range(0,len(rest),900)]
def rng(cs):
    out=[];s=p=cs[0]
    for c in cs[1:]:
        if c==p+1: p=c; continue
        out.append((s,p)); s=p=c
    out.append((s,p))
    return ','.join(f'U+{a:x}' if a==b else f'U+{a:x}-{b:x}' for a,b in out)
css=[]
for i,sh in enumerate(shards):
    opts=subset.Options(); opts.flavor='woff2'; opts.layout_features=['*']
    f=TTFont(SRC); s=subset.Subsetter(opts); s.populate(unicodes=sh); s.subset(f)
    # OFL: the subset is a modified version, so it must not carry the Reserved Font Names
    for rec in f['name'].names:
        if rec.nameID in (1, 3, 4, 6, 16, 17, 21, 22):
            rec.string = {1:'Aholo Display',4:'Aholo Display Regular',6:'AholoDisplay-Regular',16:'Aholo Display',17:'Regular',3:'AholoDisplay-Regular',21:'Aholo Display',22:'Regular'}[rec.nameID]
    tmp=f'{OUT}/tmp.woff2'; f.flavor='woff2'; f.save(tmp)
    h=hashlib.md5(open(tmp,'rb').read()).hexdigest()[:12]
    name=f'AholoDisplay.{h}.{i}.woff2'; os.replace(tmp,f'{OUT}/{name}')
    css.append(f"@font-face{{font-family:'Aholo Display';font-style:normal;font-weight:400;font-display:swap;src:url('{name}') format('woff2');unicode-range:{rng(sh)}}}")
open(f'{OUT}/AholoDisplay.min.css','w').write('\n'.join(css)+'\n')
print(len(shards), len(first))
