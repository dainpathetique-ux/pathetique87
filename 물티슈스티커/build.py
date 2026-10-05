import math, base64, io, sys, json
from PIL import Image
import numpy as np
from fontTools.ttLib import TTFont
from fontTools.pens.svgPathPen import SVGPathPen
import qrcode, cairosvg

IMG='src/'
BG=(57,91,17); BG_HEX='#395B11'; SAGE='#9BAC86'; WHITE='#FFFFFF'; ORANGE='#E1AB43'
# ---------------- geometry (mm) : body 81x50, tab circle R13 centred (77,25) ----------------
W_BODY, H, R_CORNER, TAB_R, TAB_CX, FILLET = 81.0, 50.0, 4.0, 13.0, 77.0, 2.5
def shape_path(off):
    """outline offset by `off` mm (negative = inset). returns svg path d"""
    x0,y0,x1,y1 = -off,-off,W_BODY+off,H+off
    rc = R_CORNER+off; R=TAB_R+off; rf=max(FILLET-off,0.15); cy=H/2
    # fillet circle centre: x = x1+rf ; tangent to tab circle externally
    dx = (x1+rf)-TAB_CX
    dy = math.sqrt((R+rf)**2 - dx**2)
    fy_top = cy-dy            # fillet centre y (top)
    t1 = (x1, fy_top)         # tangent point on right edge (top)
    # tangent point on tab circle
    ux,uy = dx/(R+rf), -dy/(R+rf)
    t2 = (TAB_CX+R*ux, cy+R*uy)
    t3 = (TAB_CX+R*ux, cy-R*uy)
    t4 = (x1, cy+dy)
    d  = f"M{x0+rc},{y0} L{x1-rc},{y0} A{rc},{rc} 0 0 1 {x1},{y0+rc} "
    d += f"L{t1[0]},{t1[1]} A{rf},{rf} 0 0 0 {t2[0]},{t2[1]} "
    d += f"A{R},{R} 0 0 1 {t3[0]},{t3[1]} A{rf},{rf} 0 0 0 {t4[0]},{t4[1]} "
    d += f"L{x1},{y1-rc} A{rc},{rc} 0 0 1 {x1-rc},{y1} L{x0+rc},{y1} A{rc},{rc} 0 0 1 {x0},{y1-rc} "
    d += f"L{x0},{y0+rc} A{rc},{rc} 0 0 1 {x0+rc},{y0} Z"
    return d
BLEED=1.8; SAFE=1.8

# ---------------- raster cut-outs from the green logo ----------------
def cutout(box, pad=6):
    im=np.array(Image.open(IMG+'3.jpg').convert('RGB')).astype(float)
    x0,y0,x1,y1=box; sub=im[y0-pad:y1+pad+1, x0-pad:x1+pad+1]
    bg=np.array(BG,float)
    dist=np.abs(sub-bg).sum(2)
    a=np.clip((dist-12)/70,0,1)
    rgb=np.where(a[...,None]>0, bg+(sub-bg)/np.maximum(a[...,None],1e-3), bg)
    rgb=np.clip(rgb,0,255)
    out=np.dstack([rgb, a*255]).astype(np.uint8)
    img=Image.fromarray(out,'RGBA'); b=io.BytesIO(); img.save(b,'PNG'); 
    return 'data:image/png;base64,'+base64.b64encode(b.getvalue()).decode(), img.size
SYM, SYM_SZ = cutout((614,318,1154,858))
WORD, WORD_SZ = cutout((369,904,1394,1205))

# ---------------- text -> outlines ----------------
_fonts={}
def font(path):
    if path not in _fonts:
        f=TTFont(path); _fonts[path]=(f,f.getGlyphSet(),f.getBestCmap(),f['head'].unitsPerEm,f['hmtx'])
    return _fonts[path]
F_ROUND='fonts/nanum/usr/share/fonts/truetype/nanum/NanumSquareRoundB.ttf'
F_ROUNDR='fonts/nanum/usr/share/fonts/truetype/nanum/NanumSquareRoundR.ttf'
F_BOLD='fonts/nkr700.ttf'; F_LIGHT='fonts/nkr350.ttf'; F_MED='fonts/nkr500.ttf'; F_XB='fonts/nkr800.ttf'; F_BLK='fonts/nkr900.ttf'
TAG='#EAF0E0'; SAGE2='#BFCDAB'
def text_width(s, fp, em):
    f,gs,cmap,upm,hmtx=font(fp); return sum(hmtx[cmap.get(ord(c),'.notdef')][0] for c in s)/upm*em
def text_path(s, fp, em, x, y, fill, anchor='start', tracking=0.0):
    f,gs,cmap,upm,hmtx=font(fp); sc=em/upm
    w=text_width(s,fp,em)+tracking*(len(s)-1)
    if anchor=='end': x-=w
    elif anchor=='middle': x-=w/2
    parts=[]; adv=0
    for c in s:
        gn=cmap.get(ord(c),'.notdef'); pen=SVGPathPen(gs); gs[gn].draw(pen); d=pen.getCommands()
        if d: parts.append(f'<path transform="translate({adv:.3f},0)" d="{d}"/>')
        adv+=hmtx[gn][0]+tracking/sc
    return f'<g fill="{fill}" transform="translate({x:.3f},{y:.3f}) scale({sc:.6f},{-sc:.6f})">'+''.join(parts)+'</g>', w

# ---------------- icons (Material Design, Apache-2.0), 24-unit box ----------------
ICON_CALL="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"
ICON_PIN="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"
ICON_CHAT="M12 3C6.5 3 2 6.6 2 11c0 2.6 1.6 4.9 4 6.4-.2 1.2-.8 2.6-1.4 3.4 1.9-.3 3.8-1.2 5-2.1.8.2 1.6.3 2.4.3 5.5 0 10-3.6 10-8S17.5 3 12 3z"
def icon(d,x,y,size,fill):
    s=size/24; return f'<path fill="{fill}" transform="translate({x},{y}) scale({s:.4f})" d="{d}"/>'

# ---------------- QR ----------------
def qr_svg(url, x, y, size, fill):
    q=qrcode.QRCode(error_correction=qrcode.constants.ERROR_CORRECT_Q, border=0); q.add_data(url); q.make(fit=True)
    m=q.get_matrix(); n=len(m); ms=size/n
    d=''.join(f'M{x+j*ms:.3f},{y+i*ms:.3f}h{ms:.3f}v{ms:.3f}h-{ms:.3f}z' for i in range(n) for j in range(n) if m[i][j])
    return f'<path fill="{fill}" d="{d}"/>', n

def build(P, guides=True, scale_px=15):
    L=[]  # design layer
    # background (bleed)
    L.append(f'<path id="bg" fill="{BG_HEX}" d="{shape_path(BLEED)}"/>')
    # symbol & wordmark
    sw=P['sym_h']*SYM_SZ[0]/SYM_SZ[1]
    L.append(f'<image x="{P["sym_x"]}" y="{P["sym_y"]}" width="{sw:.3f}" height="{P["sym_h"]}" href="{SYM}"/>')
    wh=P['word_w']*WORD_SZ[1]/WORD_SZ[0]
    L.append(f'<image x="{P["word_x"]}" y="{P["word_y"]}" width="{P["word_w"]}" height="{wh:.3f}" href="{WORD}"/>')
    # tagline + rule + english
    t,w=text_path('영어 국어 학원',F_ROUND,P['tag_em'],P['word_x']+0.4,P['tag_y'],TAG,tracking=0.3); L.append(t)
    ry=P['tag_y']-P['tag_em']*0.33
    L.append(f'<line x1="{P["word_x"]+0.4+w+2.2:.3f}" y1="{ry:.3f}" x2="{P["rule_x2"]}" y2="{ry:.3f}" stroke="{SAGE2}" stroke-width="0.4" stroke-linecap="round"/>')
    t,_=text_path('English & Korean Academy',F_MED,P['eng_em'],P['word_x']+0.5,P['eng_y'],SAGE2); L.append(t)
    # course pills
    px=P['pill_x']; py=P['pill_y']; ph=P['pill_h']; pad=P['pill_pad']
    for label in P['pills']:
        tw=text_width(label,F_BOLD,P['pill_em'])
        L.append(f'<rect x="{px:.3f}" y="{py:.3f}" width="{tw+2*pad:.3f}" height="{ph}" rx="{ph/2}" fill="{ORANGE}"/>')
        t,_=text_path(label,F_BOLD,P['pill_em'],px+pad,py+ph/2+P['pill_em']*0.36,BG_HEX); L.append(t)
        px+=tw+2*pad+P['pill_gap']
    # contact block
    L.append(icon(ICON_CALL,P['c_x'],P['ph_y']-P['ph_em']*0.78,P['ph_em']*0.8,ORANGE))
    t,w=text_path('0507-1362-0003',F_XB,P['ph_em'],P['c_x']+P['ph_em']*1.05,P['ph_y'],WHITE,tracking=0.0); L.append(t)
    L.append(icon(ICON_PIN,P['c_x']+0.1,P['loc_y']-P['loc_em']*0.86,P['loc_em']*0.95,ORANGE))
    t,w2=text_path('SK · 땅스부대찌개 건물 3층',F_BOLD,P['loc_em'],P['c_x']+P['ph_em']*1.05,P['loc_y'],WHITE); L.append(t)
    # QR box with integrated label
    qw=P['qr_w']; qx=P['qr_x']; qy=P['qr_y']; qq=P['qr_quiet']; inner=qw-2*qq
    qh=qq+inner+P['lab_gap']+P['lab_em']*0.95+qq*0.8
    L.append(f'<rect x="{qx}" y="{qy}" width="{qw}" height="{qh:.3f}" rx="1.3" fill="{WHITE}"/>')
    q,n=qr_svg('https://m.site.naver.com/2hV5o',qx+qq,qy+qq,inner,BG_HEX); L.append(q)
    t,_=text_path('카카오톡 상담',F_BOLD,P['lab_em'],qx+qw/2,qy+qq+inner+P['lab_gap']+P['lab_em']*0.78,BG_HEX,anchor='middle',tracking=0.05); L.append(t)
    design='<g id="design">'+''.join(L)+'</g>'
    G=''
    if guides:
        G=(f'<g id="guides" fill="none">'
           f'<path d="{shape_path(BLEED)}" stroke="#1E9BDC" stroke-width="0.25"/>'
           f'<path d="{shape_path(0)}" stroke="#E6007E" stroke-width="0.25"/>'
           f'<path d="{shape_path(-SAFE)}" stroke="#FFFFFF" stroke-width="0.15" stroke-dasharray="1,0.7" opacity="0.7"/></g>')
    m=6 if guides else BLEED  # margin
    vb=f"{-m} {-m} {90+2*m} {H+2*m}"
    svg=(f'<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="{90+2*m}mm" height="{H+2*m}mm" viewBox="{vb}">'
         + (f'<rect x="{-m}" y="{-m}" width="{90+2*m}" height="{H+2*m}" fill="#EFEFEF"/>' if guides else '')
         + design + G + '</svg>')
    svg=svg.replace('href=','xlink:href=')
    return svg

P=dict(sym_x=4.3, sym_y=3.0, sym_h=20.5,
       word_x=28.0, word_y=4.8, word_w=34.0,
       tag_em=3.8, tag_y=20.0, rule_x2=75.5, eng_em=2.4, eng_y=23.5,
       pills=['초등 논술','중고등 내신·수능 대비'], pill_x=5.0, pill_y=25.9, pill_h=3.6, pill_pad=1.7, pill_gap=1.6, pill_em=2.45,
       c_x=5.0, ph_em=4.9, ph_y=37.3, loc_em=3.6, loc_y=44.6,
       qr_w=16.4, qr_x=60.5, qr_y=29.5, qr_quiet=1.0, lab_em=2.2, lab_gap=0.3)
if __name__=='__main__':
    out=sys.argv[1] if len(sys.argv)>1 else 'preview'
    svg=build(P,guides=True); open(f'{out}_guides.svg','w').write(svg)
    cairosvg.svg2png(bytestring=svg.encode(), write_to=f'{out}_guides.png', dpi=96*20/3.7795)
    svg2=build(P,guides=False); open(f'{out}_clean.svg','w').write(svg2)
    cairosvg.svg2png(bytestring=svg2.encode(), write_to=f'{out}_clean.png', dpi=96*20/3.7795)
    print('done')
