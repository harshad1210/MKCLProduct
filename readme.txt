Version: 1.7.0
Date: 29-12-2025

Enhancements & Changes:
1. Global Pagination & Search:
   - Implemented standard 6-items-per-page pagination across all Admin tables (Products, Users, Documents).
   - Added real-time Search functionality for filtering data in all tables.

2. Document Upload Constraints & Fixes:
   - Enforced strict MIME type limits:
     - Product Presentation: Corrected to allow PPT, PPTX, and PDF.
     - Product Proposal / Draft Agreement: DOC, DOCX.
     - Product Website/Demo: URL only.
   - Fixed "Refresh on Upload" issue: Tables now auto-update immediately after successful upload without page reload.

3. Stability:
   - Fixed "Invalid end tag" (500 Error) in User Management page (restored missing script setup).
   - Improved UI Helper text for upload restrictions.

4. UI Improvements:
   - Added specific "Allowed types" helper text under file inputs.
   - Enhanced Product Detail View with tabular Search/Pagination.
