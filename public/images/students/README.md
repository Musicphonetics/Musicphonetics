# Student / teaching photos — image slots

Drop real student & teaching photos here, then list them in
`components/sections/StudentGallery.tsx` (the `STUDENT_IMAGES` array).
Until the array has entries, the "Inside our lessons" section renders NOTHING
(no placeholder, no "coming soon").

## Convention
- Filename: `lesson-01.webp` … `lesson-12.webp` (WebP preferred; JPG/PNG also fine)
- Recommended size: **1200 × 1600** (portrait 3:4), ≤ 300 KB each
- Always provide descriptive `alt` text when you add the array entry
  (e.g. "Student practising guitar during a home lesson in Gurugram").

## How to add (example)
In `components/sections/StudentGallery.tsx`:

```ts
export const STUDENT_IMAGES: GalleryImage[] = [
  { src: "/images/students/lesson-01.webp", alt: "…", width: 1200, height: 1600 },
  // …up to lesson-12
];
```

## Where it appears
- Homepage: "Inside our lessons" section (between Life at Musicphonetics and Reviews).
- The hero can also take an optional student image later (see components/sections/HeroConcierge.tsx).

## Faculty photos
`/public/images/faculty/` holds teacher headshots. Add real teachers in
`components/sections/FacultyProfiles.tsx` (`FACULTY` array) — photo path
`/images/faculty/<name>.webp`, recommended **1200 × 900** (4:3). Empty = renders nothing.
