-- Keep persisted note colors within the six palette slots used by the web app.
ALTER TABLE public.notes
  ADD CONSTRAINT notes_paper_palette_check CHECK (paper BETWEEN 0 AND 5);
