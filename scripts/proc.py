import os, io, json, base64
from PIL import Image
import pillow_heif
pillow_heif.register_heif_opener()

PUB = "public"
GAL = os.path.join(PUB, "gallery")
out = {"gallery": {}, "logos": {}}

def blur_uri(im, w=16):
    im = im.convert("RGB")
    ratio = im.height / im.width
    small = im.resize((w, max(1, round(w*ratio))))
    buf = io.BytesIO(); small.save(buf, "JPEG", quality=50)
    return "data:image/jpeg;base64," + base64.b64encode(buf.getvalue()).decode()

def optimize(path, max_edge=1600, q=82):
    im = Image.open(path)
    im = im.convert("RGB")
    w, h = im.size
    scale = min(1.0, max_edge / max(w, h))
    if scale < 1.0:
        im = im.resize((round(w*scale), round(h*scale)), Image.LANCZOS)
    return im

# 1) Convert HEIC 08-extra -> proper jpg 08-stage.jpg, remove the heic
heic = os.path.join(GAL, "08-extra.jpg")
im8 = optimize(heic)
im8.save(os.path.join(GAL, "08-stage.jpg"), "JPEG", quality=82, optimize=True)
os.remove(heic)
print("converted 08 ->", im8.size)

# 2) Optimize all gallery jpgs in place (web-friendly), collect metadata
renames = {"08-stage.jpg": "08-stage.jpg"}
for fn in sorted(os.listdir(GAL)):
    if not fn.lower().endswith((".jpg", ".jpeg")):
        continue
    p = os.path.join(GAL, fn)
    im = optimize(p)
    im.save(p, "JPEG", quality=82, optimize=True)
    out["gallery"][fn] = {"w": im.width, "h": im.height, "blur": blur_uri(im)}
    print("opt", fn, im.size, f"{os.path.getsize(p)//1024}KB")

# 3) Key out near-solid bg of wordmark logos -> transparent PNGs
def key_out(path, dst, bg_is_dark, tol=42):
    im = Image.open(path).convert("RGBA")
    px = im.load()
    # sample corner color
    cr, cg, cb, _ = px[2, 2]
    W, H = im.size
    for y in range(H):
        for x in range(W):
            r, g, b, a = px[x, y]
            if abs(r-cr) <= tol and abs(g-cg) <= tol and abs(b-cb) <= tol:
                px[x, y] = (r, g, b, 0)
    bbox = im.getbbox()
    if bbox:
        im = im.crop(bbox)
    im.save(dst, "PNG", optimize=True)
    return im

ld = key_out(os.path.join(PUB, "Logo main.png"), os.path.join(PUB, "logo-wordmark-dark.png"), False)
ll = key_out(os.path.join(PUB, "Logo for light.png"), os.path.join(PUB, "logo-wordmark-light.png"), True)
out["logos"]["dark"] = {"w": ld.width, "h": ld.height}
out["logos"]["light"] = {"w": ll.width, "h": ll.height}
print("logo dark", ld.size, "logo light", ll.size)

# 4) Favicon set from the navy seal (Icon for light) - looks like an app icon
seal = Image.open(os.path.join(PUB, "Icon for light.png")).convert("RGB")
# square crop center
s = min(seal.size); seal = seal.crop(((seal.width-s)//2,(seal.height-s)//2,(seal.width+s)//2,(seal.height+s)//2))
seal.resize((512,512), Image.LANCZOS).save(os.path.join("app","icon.png"), "PNG")
seal.resize((180,180), Image.LANCZOS).save(os.path.join("app","apple-icon.png"), "PNG")
seal.resize((32,32), Image.LANCZOS).save(os.path.join("app","favicon.ico"), sizes=[(16,16),(32,32),(48,48)])
print("favicons written")

json.dump(out, open("/tmp/claude-0/-home-user-Musicphonetics/4022d228-72f3-55b6-88f0-f4a2db6f976e/scratchpad/media.json","w"), indent=0)
print("DONE")
