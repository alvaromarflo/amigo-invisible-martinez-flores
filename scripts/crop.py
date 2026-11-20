import cv2,os
from PIL import Image, ImageDraw
from files import *
Z=2.3
det={}
import re,subprocess
# face boxes (x,y,w,h) in original px
B={'lourdes':(522-125,540-125,250,250),'alejo':(772,545,145,145),'matias':(447,272,326,326),'pepe':(518,198,448,448),
'belen':(47,189,347,347),'jose-maria':(247,189,403,403),'cesar':(456,396,159,159),'mari-carmen':(655-85,560-85,170,170),
'victor':(360,252,239,239),'paula':(263,309,448,448),'mario':(301,249,348,348),'julio':(242,286,297,297),'ines':(266,291,388,388),
'jose-luis':(258,258,406,406),'carmen':(563,336,298,298),'lola':(180,214,165,165),'alvaro':(248,192,289,289),
'joana':(296,532,256,256),'gael':(390-150,418-150,300,300),'elias':(738-108,835-108,216,216)}
SRCK=dict(SRC); SRCK['cesar']=SRCK['mari-carmen']=SRCK['pareja']; SRCK['elias']=SRCK['lourdes']
def crop(k,box,z=Z,cx=None,cy=None):
    im=Image.open(A+SRCK[k]).convert('RGB'); W,H=im.size
    x,y,w,h=box; cx=cx if cx is not None else x+w/2; cy=cy if cy is not None else y+h/2
    s=min(z*w,W,H)
    l=min(max(cx-s/2,0),W-s); t=min(max(cy-s/2,0),H-s)
    return im.crop((int(l),int(t),int(l+s),int(t+s))).resize((800,800),Image.LANCZOS),s/w
os.makedirs('out',exist_ok=True)
ZZ={'cesar':2.1}
for k,b in B.items():
    c,r=crop(k,b,ZZ.get(k,Z)); c.save(f'out/{k}.png'); print(k,round(r,2))
# couple
im=Image.open(A+SRCK['pareja']).convert('RGB')
cx,cy=(536+655)/2,(476+560)/2+200
s=720; c=im.crop((int(cx-s/2),int(cy-s/2),int(cx+s/2),int(cy+s/2))).resize((800,800),Image.LANCZOS); c.save('out/mari-carmen-y-cesar.png')
names=sorted(f[:-4] for f in os.listdir('out'))
S=Image.new('RGB',(5*410,4*410),'white')
for i,n in enumerate(names):
    t=Image.open(f'out/{n}.png').resize((400,400)); S.paste(t,((i%5)*410,(i//5)*410)); ImageDraw.Draw(S).text(((i%5)*410+5,(i//5)*410+5),n,fill='red')
S.save('sheet.jpg')
