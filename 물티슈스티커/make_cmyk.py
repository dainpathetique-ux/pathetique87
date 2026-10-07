import sys, io, base64, zlib, re
sys.argv=['x']
import pikepdf, cairosvg
from PIL import Image, ImageCms
import build as B
from build import shape_path, BLEED, SAFE, H, P

# ---------- ICC ----------
SRGB=ImageCms.createProfile('sRGB'); CMYKP=ImageCms.getOpenProfile('icc/default_cmyk.icc')
T_RGB2CMYK=ImageCms.buildTransform(SRGB,CMYKP,'RGB','CMYK',renderingIntent=0)   # perceptual
T_CMYK2RGB=ImageCms.buildTransform(CMYKP,SRGB,'CMYK','RGB',renderingIntent=1)
def icc_rgb2cmyk(rgb):   # rgb 0-1 floats -> cmyk 0-1
    im=Image.new('RGB',(1,1),tuple(round(v*255) for v in rgb)); c=ImageCms.applyTransform(im,T_RGB2CMYK).getpixel((0,0)); return tuple(v/255 for v in c)
def proof_hex(cmyk100):
    im=Image.new('CMYK',(1,1),tuple(round(v*2.55) for v in cmyk100)); r=ImageCms.applyTransform(im,T_CMYK2RGB).getpixel((0,0)); return '#%02X%02X%02X'%r

# ---------- designer CMYK palette (percent) keyed by source hex ----------
PALETTE={
 B.BG_HEX:(75,40,100,40),   # deep green
 B.ORANGE:(10,35,95,0),     # orange (logo ring)
 B.TAG:(7,2,13,0),          # near-white sage (tagline)
 B.SAGE2:(27,11,39,0),      # sage (English / rule)
 B.WHITE:(0,0,0,0),
 '#FF00FF':(0,100,0,0),     # cut line
 '#00AEEF':(100,0,0,0),     # work/bleed line
 '#00A651':(100,0,100,0),   # safe line
}
def hex2rgb(h): return tuple(int(h[i:i+2],16)/255 for i in (1,3,5))
PAL_RGB={hex2rgb(k):tuple(v/100 for v in cv) for k,cv in PALETTE.items()}
def map_color(rgb):
    for k,v in PAL_RGB.items():
        if max(abs(a-b) for a,b in zip(k,rgb))<0.004: return v
    print('  (unmapped colour, ICC-converted)',rgb); return icc_rgb2cmyk(rgb)

# ---------- 1. build RGB layered PDF (same as make_ai.py) ----------
m=BLEED; vb=f"{-m} {-m} {90+2*m} {H+2*m}"; Wmm=90+2*m; Hmm=H+2*m
def wrap(inner): return f'<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="{Wmm}mm" height="{Hmm}mm" viewBox="{vb}">{inner}</svg>'
layers=[('디자인',B.build(P,guides=False)),
        ('안전선(참고)',wrap(f'<path d="{shape_path(-SAFE)}" fill="none" stroke="#00A651" stroke-width="0.0882" stroke-dasharray="1,0.7"/>')),
        ('작업선',wrap(f'<path d="{shape_path(BLEED)}" fill="none" stroke="#00AEEF" stroke-width="0.0882"/>')),
        ('칼선(재단선)',wrap(f'<path d="{shape_path(0)}" fill="none" stroke="#FF00FF" stroke-width="0.0882"/>'))]
out=pikepdf.new(); first=None; xobjs=pikepdf.Dictionary(); ocgs=[]; content=b''; page=None
for i,(name,svg) in enumerate(layers):
    pdfb=cairosvg.svg2pdf(bytestring=svg.encode()); src=pikepdf.open(io.BytesIO(pdfb))
    if page is None:
        mb=src.pages[0].MediaBox; page=out.add_blank_page(page_size=(float(mb[2]),float(mb[3])))
        page.Resources.Properties=pikepdf.Dictionary()
    fx=out.copy_foreign(src.pages[0].as_form_xobject())
    ocg=out.make_indirect(pikepdf.Dictionary(Type=pikepdf.Name.OCG, Name=pikepdf.String(name))); ocgs.append(ocg)
    page.Resources.Properties[f'/oc{i}']=ocg; xobjs[f'/Fx{i}']=fx
    content+=f'/OC /oc{i} BDC q /Fx{i} Do Q EMC\n'.encode()
page.Resources.XObject=xobjs; page.Contents=out.make_stream(content)
out.Root.OCProperties=pikepdf.Dictionary(OCGs=pikepdf.Array(ocgs),
    D=pikepdf.Dictionary(Order=pikepdf.Array(ocgs), ON=pikepdf.Array([o for o in ocgs if '안전선' not in str(o.Name)]),
                         OFF=pikepdf.Array([o for o in ocgs if '안전선' in str(o.Name)]), BaseState=pikepdf.Name.ON))

# ---------- 2. vectors: rg/RG -> k/K ----------
def convert_stream(obj):
    new=[]; changed=False
    for operands,op in pikepdf.parse_content_stream(obj):
        o=str(op)
        if o in ('rg','RG') and len(operands)==3:
            c=map_color(tuple(float(x) for x in operands))
            new.append(pikepdf.ContentStreamInstruction([pikepdf.Object.parse(f'{v:.4f}'.encode()) for v in c], pikepdf.Operator('k' if o=='rg' else 'K'))); changed=True
        elif o in ('g','G') and len(operands)==1:
            gval=float(operands[0]); c=map_color((gval,gval,gval))
            new.append(pikepdf.ContentStreamInstruction([pikepdf.Object.parse(f'{v:.4f}'.encode()) for v in c], pikepdf.Operator('k' if o=='g' else 'K'))); changed=True
        else: new.append(pikepdf.ContentStreamInstruction(operands,op))
    if changed:
        data=pikepdf.unparse_content_stream(new)
        if isinstance(obj,pikepdf.Page): obj.Contents=out.make_stream(data)
        else: obj.write(data)
def convert_images(res):
    if res is None or '/XObject' not in res: return
    for k,v in res.XObject.items():
        st=v.get('/Subtype')
        if st=='/Form':
            convert_stream(v); convert_images(v.get('/Resources'))
        elif st=='/Image' and v.get('/ColorSpace')!='/DeviceCMYK':
            pil=pikepdf.PdfImage(v).as_pil_image().convert('RGB')
            cm=ImageCms.applyTransform(pil,T_RGB2CMYK)
            v.write(zlib.compress(cm.tobytes()), filter=pikepdf.Name.FlateDecode)
            v.ColorSpace=pikepdf.Name.DeviceCMYK; v.BitsPerComponent=8
            if '/Decode' in v: del v['/Decode']
            print('  image',k,cm.size,'-> DeviceCMYK (SMask kept:', '/SMask' in v,')')
convert_stream(page); convert_images(page.Resources)
out.docinfo['/Title']='ON글터 물티슈 스티커 90x50 (CMYK)'
out.save('ON글터_물티슈스티커_칼선포함_CMYK.ai'); out.save('ON글터_물티슈스티커_칼선포함_CMYK.pdf')

# ---------- 3. verify: no RGB operators / colourspaces remain ----------
chk=pikepdf.open('ON글터_물티슈스티커_칼선포함_CMYK.pdf'); bad=[]
def scan(obj,res):
    for operands,op in pikepdf.parse_content_stream(obj):
        if str(op) in ('rg','RG','g','G','cs','CS','sc','scn','SC','SCN'): bad.append(str(op))
    if res and '/XObject' in res:
        for k,v in res.XObject.items():
            if v.get('/Subtype')=='/Form': scan(v,v.get('/Resources'))
            elif v.get('/Subtype')=='/Image' and v.ColorSpace!='/DeviceCMYK': bad.append(f'image {k} {v.ColorSpace}')
scan(chk.pages[0],chk.pages[0].Resources); print('non-CMYK leftovers:',bad or 'none')

# ---------- 4. soft-proof PNG (CMYK -> sRGB through the same profile) ----------
for attr in ('BG_HEX','ORANGE','TAG','SAGE2','WHITE'):
    setattr(B,attr,proof_hex(PALETTE[getattr(B,attr)]))
def proof_img(datauri):
    im=Image.open(io.BytesIO(base64.b64decode(datauri.split(',',1)[1]))).convert('RGBA'); a=im.getchannel('A')
    rgb=ImageCms.applyTransform(ImageCms.applyTransform(im.convert('RGB'),T_RGB2CMYK),T_CMYK2RGB); rgb.putalpha(a)
    b=io.BytesIO(); rgb.save(b,'PNG'); return 'data:image/png;base64,'+base64.b64encode(b.getvalue()).decode()
B.SYM=proof_img(B.SYM); B.WORD=proof_img(B.WORD)
svg=B.build(P,guides=False); cairosvg.svg2png(bytestring=svg.encode(), write_to='proof_cmyk.png', dpi=96*20/3.7795)
print('palette (CMYK %) -> proof sRGB:'); [print(f'  {k}: {v} -> {proof_hex(v)}') for k,v in PALETTE.items()]
