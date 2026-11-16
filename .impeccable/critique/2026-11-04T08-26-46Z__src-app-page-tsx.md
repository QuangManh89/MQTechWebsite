---
target_identity: "file:D:\\1.Project\\MQTechWeb\\src\\app\\page.tsx"
target_fingerprint: "sha256:867e0c0038b94a59451f5ac72c21fe45ba5fc2eae47b6446254728957c08f159"
target_path: "D:\\1.Project\\MQTechWeb\\src\\app\\page.tsx"
timestamp: 2026-11-04T08-26-46Z
slug: src-app-page-tsx
---
# Impeccable Critique: MQTech Homepage (src/app/page.tsx)

**Target**: `src/app/page.tsx`
**Mode**: Persuade
**Platform**: Web (Desktop & Mobile)
**Total Heuristic Score**: 30.5 / 40

## 1. Design-Specificity Verdict
**Rating: Strong local grounding with surface-level copy leaks**
The architecture and domain logic reflect authentic computer repair in Buôn Ma Thuột (explicitly addressing fear of component swapping "luộc đồ", zero device password collection, MX-4 paste and Cat6 networking). However, the H1 headline leaks UI/component terminology ("Rõ Ràng Từng Thẻ"), and the visual structure suffers from alternating dark/light canvas striping.

## 2. Nielsen Heuristics Scoring
| Heuristic | Score (0-4) | Status | Notes |
| :--- | :---: | :---: | :--- |
| Visibility of system status | 3.5 | Good | Live status indicator and clear booking reference codes. |
| Match between system and real world | 3.0 | Good | Real technician vocabulary, but meta-UI words break immersion. |
| User control and freedom | 2.5 | Fair | Autoplay carousel lacks hover pause or pause button (WCAG 2.2.2). |
| Consistency and standards | 2.0 | Needs Work | Border radii mismatch (`rounded-3xl` vs `rounded-[20px]`) and canvas zebra striping. |
| Error prevention | 3.5 | Good | Strict VN phone validation and zero-password policy enforcement. |
| Recognition rather than recall | 3.5 | Good | Service cards auto-select category in intake form via event bridge. |
| Flexibility and efficiency of use | 3.0 | Good | 1-tap clipboard copy for emergency tips; lacks above-the-fold hotline. |
| Aesthetic and minimalist design | 2.0 | Needs Work | Competing CTAs in hero, gradient text antipattern, redundant buttons. |
| Help recognize and recover from errors | 3.5 | Good | Inline accessible field errors and clear submission feedback. |
| Help and documentation | 4.0 | Excellent | High-value technical first-aid guides build immediate trust. |

## 3. Cognitive Load & Emotional Journey
- Extraneous load is elevated due to dark-light-dark background alternation and 3 competing hero CTAs.
- The emotional valley occurs for urgent visitors (students/workers with sudden dead machines) who must search for a direct phone number.

## 4. Priority Issues
1. **Hero Headline Jargon Leak**: Change "Rõ Ràng Từng Thẻ" to customer-focused value ("Minh Bạch Từng Quy Trình" or "Báo Giá Rõ Ràng Trước Khi Sửa").
2. **Missing Above-the-Fold Hotline**: Add clickable Hotline `0943 000 703` directly into Navbar and Hero.
3. **Hero Decision Fatigue**: Prioritize 2 primary CTAs ("Yêu cầu sửa chữa" & "Gọi hotline 0943 000 703") instead of 3 competing links.
4. **WCAG 2.2.2 Carousel Autoplay**: Implement pause on mouse hover and a visible pause/resume toggle.
5. **Canvas Visual Cohesion**: Unify the canvas transitions to eliminate zebra-striping between Dark Hero, Light Knowledge, and Dark Intake.

## 5. Detector Findings (Assessment B)
- `gradient-text` warning in `src/components/home/Hero.tsx` line 69 (`bg-clip-text + bg-gradient`). Replace with solid high-contrast ink.
