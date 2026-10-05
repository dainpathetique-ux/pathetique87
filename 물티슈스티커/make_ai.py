import cairosvg, pikepdf, sys
sys.argv=["x"]; import build as B
from build import shape_path, BLEED, SAFE, H, P
m=BLEED; vb=f"{-m} {-m} {90+2*m} {H+2*m}"; Wmm=90+2*m; Hmm=H+2*m
def wrap(inner): return f'<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="{Wmm}mm" height="{Hmm}mm" viewBox="{vb}">{inner}</svg>'
design=B.build(P,guides=False)
cut  = wrap(f'<path d="{shape_path(0)}" fill="none" stroke="#FF00FF" stroke-width="0.0882"/>')      # 0.25pt magenta
bleed= wrap(f'<path d="{shape_path(BLEED)}" fill="none" stroke="#00AEEF" stroke-width="0.0882"/>')
safe = wrap(f'<path d="{shape_path(-SAFE)}" fill="none" stroke="#00A651" stroke-width="0.0882" stroke-dasharray="1,0.7"/>')
layers=[('디자인',design),('안전선(참고)',safe),('작업선',bleed),('칼선(재단선)',cut)]
pdfs=[]
for name,svg in layers:
    fn=f'layer_{len(pdfs)}.pdf'; cairosvg.svg2pdf(bytestring=svg.encode(), write_to=fn); pdfs.append((name,fn))
out=pikepdf.new()
base=pikepdf.open(pdfs[0][1]); mb=base.pages[0].MediaBox
page=out.add_blank_page(page_size=(float(mb[2]),float(mb[3])))
xobjs=pikepdf.Dictionary(); ocgs=[]; content=b''
for i,(name,fn) in enumerate(pdfs):
    src=pikepdf.open(fn); fx=out.copy_foreign(src.pages[0].as_form_xobject())
    ocg=out.make_indirect(pikepdf.Dictionary(Type=pikepdf.Name.OCG, Name=pikepdf.String(name)))
    ocgs.append(ocg); page.Resources.Properties = page.Resources.get('/Properties', pikepdf.Dictionary())
    page.Resources.Properties[f'/oc{i}']=ocg
    xobjs[f'/Fx{i}']=fx
    content+=f'/OC /oc{i} BDC q /Fx{i} Do Q EMC\n'.encode()
page.Resources.XObject=xobjs
page.Contents=out.make_stream(content)
out.Root.OCProperties=pikepdf.Dictionary(OCGs=pikepdf.Array(ocgs), D=pikepdf.Dictionary(Order=pikepdf.Array(ocgs), ON=pikepdf.Array([o for o in ocgs if '안전선' not in str(o.Name)]), OFF=pikepdf.Array([o for o in ocgs if '안전선' in str(o.Name)]), BaseState=pikepdf.Name.ON))
out.docinfo['/Title']='ON글터 물티슈 스티커 90x50'; out.docinfo['/Creator']='Adobe Illustrator compatible PDF'
out.save('ON글터_물티슈스티커_칼선포함.ai'); out.save('ON글터_물티슈스티커_칼선포함.pdf')
print('page pt',float(mb[2]),float(mb[3]),'-> mm',float(mb[2])/72*25.4,float(mb[3])/72*25.4)
