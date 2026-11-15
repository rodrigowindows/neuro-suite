# Publishing and Public Links Checklist (PUB-10 / v1.3)

Operational instructions for the project lead responsible for external delivery of CrewVitals to the evaluation board (NASA Space Apps / review panel).

This checklist defines the sequential steps required to ensure open and unrestricted public access (zero login, zero password, zero signup or permission request) to all solution artifacts, in both English (international evaluation standard) and Portuguese.

---

## Step 1: Production Deployment on Lovable with Public Access

- Owner: Project Lead (Lincon).
- Done criterion: Application built and published on the Lovable dashboard with active public status, returning HTTP status 200 on expected URLs:
  - `https://neuro-suite.lovable.app/demo?lang=en` (English cockpit)
  - `https://neuro-suite.lovable.app/demo?lang=pt` (Portuguese cockpit)
  - `https://neuro-suite.lovable.app/demo` (Automatic language detection based on browser preferences)

### Procedure
1. Open the Lovable project console (`https://lovable.dev`).
2. In the top-right menu, click "Publish" (or "Deploy to Production").
3. Ensure the project visibility is set to "Public".
4. Verify the published URL:
   - Expected URL: `https://neuro-suite.lovable.app/demo`
   - If the generated URL differs (for example: `https://neuro-suite-<identifier>.lovable.app/demo`), record the exact URL immediately to update presentation links in `docs/apresentacao/` and the table in `docs/publicacao/LINKS.md`.

---

## Step 2: Incognito Window and Mobile Network Testing (Zero Redirect and Bilingual Parity)

- Owner: Project Lead / Technical Reviewer.
- Done criterion:
  - Both `<URL>/demo?lang=en` and `<URL>/demo?lang=pt` load directly into the telemetry cockpit without redirecting to `/auth` or `/login`, requiring no credentials or permissions, across desktop incognito windows and mobile devices on 4G/5G outside the local Wi-Fi.
  - The `/demo` route without `?lang=` query parameter respects browser locale: loads in English for English/international browser locales, and loads in Portuguese for Portuguese browser locales.
  - The language selector in the top navigation bar (EN | PT) toggles the interface language instantly without page reloads and without resetting demonstration state.

### Procedure
1. Desktop Incognito Test with Explicit Query Parameter:
   - Open a fresh incognito/private browsing window in Google Chrome (`Ctrl+Shift+N` or `Cmd+Shift+N`) or Firefox (`Ctrl+Shift+P`).
   - Navigate to: `https://neuro-suite.lovable.app/demo?lang=en`.
   - Verify that the cockpit loads directly in English ("Crew Health Telemetry Terminal", "Fit for Shift" / "Caution" / "Fatigue", "Blinks/min", "Sleep") with simulated telemetry data.
   - Navigate to: `https://neuro-suite.lovable.app/demo?lang=pt`.
   - Verify that the cockpit loads in Portuguese ("Terminal de Telemetria de Saúde da Tripulação", "Apto para o Turno", etc.).
   - Check the address bar to ensure no redirect to `/auth` or `/login` occurred.
2. Language Selector Test:
   - In the top navigation bar of `/demo`, click between EN and PT.
   - Confirm UI labels switch immediately without a full page refresh and maintain the current demo scenario step.
3. Automatic Browser Locale Detection Test (without `?lang=`):
   - In an incognito window set to English locale, navigate to `https://neuro-suite.lovable.app/demo`.
   - Confirm the default displayed language is English (EN).
   - In a browser set to Portuguese locale, confirm the default displayed language is Portuguese (PT).
4. Mobile Network Test (Cellular 4G/5G):
   - On a mobile device disconnected from local Wi-Fi (pure 4G/5G cellular data), open an incognito mobile browser tab.
   - Navigate to `https://neuro-suite.lovable.app/demo?lang=en` and `https://neuro-suite.lovable.app/demo?lang=pt`.
   - Verify that visual telemetry widgets, readiness status badges, and tab navigation render properly without corporate firewall blocks or authentication prompts.

---

## Step 3: Public Hosting of Bilingual Presentation Decks (PDF and PPTX)

- Owner: Project Lead.
- Done criterion: Presentation files `CrewVitals-Demo-EN.pdf` / `CrewVitals-Demo-EN.pptx` (primary version for the international review board) and `CrewVitals-Demo-PT.pdf` / `CrewVitals-Demo-PT.pptx` (reference version in Portuguese) hosted with open public access ("anyone with the link can view/download") with zero login or permission barriers. Verified in an incognito window.

### Hosting Options and Configuration

#### Option A: GitHub Releases or Public Repository (Recommended)
- Remote repository: `https://github.com/rodrigowindows/neuro-suite`
- Procedure:
  1. On GitHub, navigate to "Releases" > "Draft a new release".
  2. Set tag to `v1.3-banca` and release title to `CrewVitals v1.3 — Bilingual Presentation & Demo`.
  3. Upload the following files:
     - `docs/apresentacao/CrewVitals-Demo-EN.pdf`
     - `docs/apresentacao/CrewVitals-Demo-EN.pptx`
     - `docs/apresentacao/CrewVitals-Demo-PT.pdf`
     - `docs/apresentacao/CrewVitals-Demo-PT.pptx`
  4. Click "Publish release".
  5. Copy direct download links for each file.
  6. Alternatively, on the public `main` branch, use direct raw or blob download links from the public repository.

#### Option B: Google Drive
- Procedure:
  1. Upload PDF and PPTX files (EN and PT) to a Google Drive folder.
  2. Right-click each file > "Share" > "Share".
  3. Under "General access", switch from "Restricted" to "Anyone with the link".
  4. Ensure permission is set to "Viewer".
  5. Click "Copy link".
  6. Open an incognito window and test the link to confirm it opens without prompting for a Google account login.

#### Option C: Microsoft OneDrive
- Procedure:
  1. Upload files to OneDrive.
  2. Select file > click "Share".
  3. In link settings, choose "Anyone with the link can view" (no login required, editing disabled).
  4. Click "Copy".
  5. Validate link in an incognito window.

#### Option D: Dropbox
- Procedure:
  1. Upload files to Dropbox.
  2. Hover over file > "Share" > "Create link".
  3. Set permissions to "Anyone with this link can view".
  4. Copy link and validate in an incognito window.

---

## Step 4: Hosting 30-Second Demonstration Videos on YouTube

- Owner: Project Lead / Presenter.
- Done criterion:
  - English video (primary submission): recorded following the 30-second English script (`docs/apresentacao/ROTEIRO-VIDEO-30S.en.md` or equivalent), published on YouTube as "Unlisted", playing without age gates or login prompts in an incognito window.
  - Portuguese video (supporting version): recorded following the Portuguese script (`docs/apresentacao/ROTEIRO-VIDEO-30S.pt.md` or `ROTEIRO-VIDEO-30S.md`), published as "Unlisted".

### Procedure
1. Sign in to YouTube Studio (`https://studio.youtube.com`).
2. In the top-right corner, click "Create" > "Upload videos".
3. Select the recorded video file (maximum duration: 30 seconds).
4. Basic details:
   - English Video:
     - Title: `CrewVitals — Crew Health Telemetry & Mission Readiness Platform (Demo 30s)`
     - Description: `Public demonstration of the CrewVitals cockpit telemetry with simulated data for NASA Space Apps evaluation board.`
   - Portuguese Video:
     - Title: `CrewVitals — Plataforma de Telemetria e Prontidão de Missão (Demo 30s)`
     - Description: `Demonstração operacional sem login do cockpit CrewVitals com dados simulados para a banca examinadora.`
   - Audience: Select "No, it's not made for kids" and disable age restriction.
5. In "Visibility":
   - Select "Unlisted".
   - CAUTION: NEVER select "Private", as it blocks access without email invitations.
6. Complete upload and copy the generated URL (`https://youtu.be/<VIDEO_ID>`).
7. Validation test:
   - Open an incognito browser window and paste the YouTube link.
   - Confirm video plays immediately without requiring Google authentication.

---

## Step 5: Credential Sanitization and Privacy Pre-Flight Audit

- Owner: Project Lead / Security Reviewer.
- Done criterion: No API keys, passwords, personal emails, or sensitive internal telemetry visible across decks, videos, commits, or public URLs.

### Verification Procedure
1. Visual Inspection of Decks (EN and PT):
   - Open PDF and PPTX decks in both languages.
   - Verify slides contain only operational names (e.g., Lincon, Rodrigo) and mission roles, with zero personal email addresses.
   - Confirm explicit presence of simulated data notices ("DEMO: simulated data" / "DEMO: dados simulados"), predictive alert demonstration labels, and Decision Support System (DSS) classification.
2. Visual Inspection of Video Recordings:
   - Watch the 30-second videos in full-screen mode.
   - Confirm the browser shows clean tabs (no personal email inboxes, corporate dashboards, or passwords visible).
   - Confirm bookmarks bar, history, and OS system notifications were not captured.
3. Repository and Key Audit:
   - Reference `docs/seguranca/CHECKLIST-MANUAL.md` to confirm exposed Gemini API keys were revoked in provider consoles.
   - Verify `Feedbacks/` directory remains git-ignored:
     ```bash
     git check-ignore -v "Feedbacks/"
     ```
   - Confirm absence of `AIza`, `sk-`, and plaintext passwords in tracked files:
     ```bash
     git grep -n -i "AIza" -- . ":!Feedbacks"
     git grep -n -i "password\s*=\|senha\s*=" -- src docs supabase
     ```
   - Expected result: zero plaintext keys or credentials.

---

## Step 6: NASA Space Apps / Evaluation Board Submission Templates

- Owner: Project Lead.
- Done criterion: Structured 3-to-5-line submission text blocks ready for copying directly into official submission forms (English for international judges, Portuguese for local/regional review).

### Submission Template in English (International Board - Primary)

```text
Project: CrewVitals - Decision Support System (DSS) for crew cognitive fatigue monitoring and mission operational readiness telemetry.
Interactive Demo (no login required): https://neuro-suite.lovable.app/demo?lang=en (100% simulated data for testing and demonstration).
Presentation Deck (PDF): <FILL IN> | Slide Deck (PPTX): <FILL IN>
Demonstration Video (30s): <FILL IN>
Note: CrewVitals is an operational Decision Support System and does not replace medical evaluation. Predictive alerts are demonstration scenarios, not validated clinical predictions.
```

### Submission Template in Portuguese (Local / Regional Board)

```text
Projeto: CrewVitals — Sistema de Suporte à Decisão (DSS) para monitoramento de fadiga cognitiva e telemetria de prontidão operacional da tripulação.
Demonstração Interativa (sem login): https://neuro-suite.lovable.app/demo?lang=pt (dados 100% simulados para homologação e demonstração de interface).
Deck de Apresentação (PDF): <FILL IN> | Deck Editável (PPTX): <FILL IN>
Vídeo de Demonstração (30s): <FILL IN>
Nota: O CrewVitals é um Sistema de Suporte à Decisão operacional e não substitui avaliação médica. Alertas preditivos constituem cenários demonstrativos, não previsões clínicas validadas.
```

---

## Step 7: Contingency Plan (Plan B)

- Owner: Project Lead.
- Done criterion: If the interactive web demo URL encounters network or infrastructure issues during evaluation, public links to the 7-slide decks and 30-second videos fulfill all technical evaluation requirements.

### Contingency Actions
1. Artifact Redundancy:
   - Decks and videos must be mirrored across two separate storage locations (e.g., GitHub Releases and public Google Drive).
   - If a reviewer reports difficulty loading `https://neuro-suite.lovable.app/demo`, provide the unlisted YouTube video or PDF deck link immediately.
2. Alternative Execution:
   - In case of Lovable service interruption, the application can be built and run locally or reviewed via verified demo video recordings.
3. Sign-off:
   - Fill in all fields in `docs/publicacao/LINKS.md` upon completing incognito validation tests.
