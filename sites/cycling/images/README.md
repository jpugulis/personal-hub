# Photos

Drop numbered JPEGs into the folder for a tour and they appear on that page:

    images/2026-kurzeme/1.jpeg   2.jpeg   3.jpeg  ...

Each one needs a matching thumbnail named `N-t.jpg` — the grid loads the
thumbnail and the lightbox loads the full image. To add new photos, drop the
originals in and re-run the resize step; it writes both sizes.

    python3 - <<'PY'
    import glob, os
    from PIL import Image, ImageOps
    for f in glob.glob('*.jpeg'):
        im = ImageOps.exif_transpose(Image.open(f)).convert('RGB')
        big = im.copy(); big.thumbnail((1600,1600), Image.LANCZOS)
        big.save(f, 'JPEG', quality=82, optimize=True, progressive=True)
        th = im.copy(); th.thumbnail((640,640), Image.LANCZOS)
        th.save(os.path.splitext(f)[0]+'-t.jpg', 'JPEG', quality=78, optimize=True, progressive=True)
    PY

HEIC files must be converted to JPEG first — browsers do not display HEIC.
Any slot whose image is missing removes itself from the page at load time,
so partial sets are fine.
