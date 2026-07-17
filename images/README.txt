MASCOT IMAGE — ONE FILE TO ADD
==============================

1. Open facebook.com/rosalieandfriends, click the profile picture,
   and save the full-size photo.
2. Save it in this folder as exactly:  mascot.jpg

That single file feeds everything automatically:
  - Navbar logo mark (all pages, circular crop)
  - Browser tab favicon (all pages)
  - "Our Story" photo on about.html

Until mascot.jpg exists, the navbar logo falls back to
mascot-placeholder.svg (a terracotta paw print) and the About page
falls back to a stock photo, so nothing looks broken in the meantime.
The favicon simply starts working once mascot.jpg is added.

A square-ish photo works best; the CSS center-crops it to a circle in
the navbar. If the Facebook image is a PNG, either re-save it as JPG
or update the three "images/mascot.jpg" references to mascot.png.

ALSO WORTH REPLACING EVENTUALLY
-------------------------------
All dog photos currently come from placedog.net (placeholder service).
Swap each card's src for a real photo when the roster is real, e.g.:
  <img src="images/dogs/willow.jpg" ... />
