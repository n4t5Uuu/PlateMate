# Plate Versioning

## What it is

The core feature that makes PlateMate different from a generic PM tool. In architecture, deliverables are called **plates** — technical drawings, renders, or presentation sheets. Plates go through multiple rounds of revision before final submission.

PlateMate tracks this as structured version history, not just a file upload list.

## Version Model

Each version of a plate is a record in `tbl_versions` with:
- Upload (the actual file or image)
- Version number (auto-incremented)
- Submission date
- Status (draft / submitted / approved / rejected)
- Associated revision notes
- Annotation pins

## Annotations

Annotations are pin-based — a reviewer can drop a pin anywhere on the plate image and attach a comment. Think of it like leaving a sticky note directly on a drawing.

Stored in `tbl_version_annotations`:
- `x`, `y` — position as percentage of image dimensions (so it scales with the viewport)
- `comment` — the annotation text
- `author_id` — who left it
- `resolved` — whether the feedback has been addressed

## Revision Notes

Separate from annotations — revision notes are structured feedback on a whole version, not a specific spot. Stored in `tbl_version_revision_notes`:
- `note` — the feedback text
- `author_id`
- `category` — (optional) type of feedback (structural, material, layout, etc.)

## Version Flow

```
New plate upload
  ↓
Version 1 created (status: draft)
  ↓
Submit for review → status: submitted
  ↓
Reviewer leaves annotations + revision notes
  ↓
Designer uploads revised plate → Version 2
  ↓
Annotations from V1 can be compared / resolved
  ↓
Repeat until: status: approved
```

## Implementation Status

The DB tables exist (`tbl_versions`, `tbl_version_annotations`, `tbl_version_revision_notes`) but the UI for versioning has not been built yet. This is a future milestone after the core project management features are working.

## Design Considerations

- Version numbers should be immutable once created
- Annotations must be tied to a specific version (not a project), since the feedback is about that specific state of the drawing
- Side-by-side version comparison is a planned UI feature
- The file storage layer (Supabase Storage buckets) needs to be set up when building this
