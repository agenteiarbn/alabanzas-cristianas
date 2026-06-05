// Generates a ProPresenter 6 (.pro6) XML file from song lyrics.
// .pro6 is importable by ProPresenter 6 and 7 (File > Import > ProPresenter 6 Document).

function uuid(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === "x" ? r : (r & 0x3) | 0x8).toString(16).toUpperCase();
  });
}

function xmlEsc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// XML escape including non-ASCII as numeric references (keeps output pure ASCII).
function xmlEscFull(s: string): string {
  let r = "";
  for (const ch of s) {
    const code = ch.charCodeAt(0);
    if (ch === "&") { r += "&amp;"; continue; }
    if (ch === "<") { r += "&lt;";  continue; }
    if (ch === ">") { r += "&gt;";  continue; }
    if (ch === '"') { r += "&quot;"; continue; }
    if (code > 127) { r += `&#x${code.toString(16)};`; continue; }
    r += ch;
  }
  return r;
}

// ── RTF (Mac / cross-platform) ──────────────────────────────────────────────

function rtfEsc(text: string): string {
  let out = "";
  for (const ch of text) {
    if (ch === "\\") { out += "\\\\"; continue; }
    if (ch === "{")  { out += "\\{";  continue; }
    if (ch === "}")  { out += "\\}";  continue; }
    if (ch === "\n") { out += "\\\n"; continue; }
    const code = ch.charCodeAt(0);
    if (code >= 0x80 && code <= 0xff) {
      out += "\\'" + code.toString(16).padStart(2, "0");
      continue;
    }
    if (code > 0xff) { out += `\\u${code}?`; continue; }
    out += ch;
  }
  return out;
}

function makeRTF(text: string): string {
  const body = rtfEsc(text.trim());
  return (
    "{\\rtf1\\ansi\\ansicpg1252" +
    "{\\fonttbl{\\f0\\fnil\\fcharset0 Arial;}}" +
    "{\\colortbl;\\red255\\green255\\blue255;\\red255\\green255\\blue255;}" +
    "\\pard\\sl288\\slmult1\\pardirnatural\\qc\\partightenfactor0\n\n" +
    "\\f0\\b\\fs96\\cf2 " +
    body +
    "}"
  );
}

// ── WinFlowData (Windows XAML FlowDocument, UTF-16 LE) ──────────────────────
// PP7 on Windows reads WinFlowData instead of RTFData.
// XAML rules: <LineBreak/> must be between <Run> elements, never inside one.
// Encoding: UTF-8 (btoa of pure-ASCII XAML, since non-ASCII is escaped).

function makeWinFlow(text: string): string {
  const runs = text
    .trim()
    .split("\n")
    .map((line) => `<Run Foreground="#FFFFFFFF" FontWeight="Bold">${xmlEscFull(line)}</Run>`)
    .join("<LineBreak/>");

  const xaml =
    `<FlowDocument xmlns="http://schemas.microsoft.com/winfx/2006/xaml/presentation"` +
    ` FontFamily="Arial" FontSize="80" TextAlignment="Center">` +
    `<Paragraph>${runs}</Paragraph>` +
    `</FlowDocument>`;

  return btoa(xaml);
}

// ── Section parser ───────────────────────────────────────────────────────────

function parseSections(lyrics: string): { name: string; text: string }[] {
  const blocks = lyrics
    .split(/\n[ \t]*\n/)
    .map((b) => b.trim())
    .filter(Boolean);

  const labelRe =
    /^(coro|estribillo|verso\s*\d*|estrofa\s*\d*|puente|pre[- ]?coro|intro|outro|bridge|chorus|verse\s*\d*|pre[- ]?chorus)\s*[:.\-]?\s*/i;

  return blocks.map((block, i) => {
    const m = block.match(labelRe);
    if (m) {
      const raw = m[1].trim();
      const name = raw.charAt(0).toUpperCase() + raw.slice(1).toLowerCase();
      return { name, text: block.slice(m[0].length).trim() };
    }
    return { name: `Diapositiva ${i + 1}`, text: block };
  });
}

// ── Main export ──────────────────────────────────────────────────────────────

export function generatePro6(
  title: string,
  artist: string,
  lyrics: string
): string {
  const docId = uuid();
  const W = 1920;
  const H = 1080;
  const sections = parseSections(lyrics);

  const groups = sections
    .map((sec, idx) => {
      const rtfB64     = btoa(makeRTF(sec.text));
      const winFlowB64 = makeWinFlow(sec.text);
      const gId = uuid();
      const sId = uuid();
      const eId = uuid();

      return `    <RVSlideGrouping name="${xmlEsc(sec.name)}" uuid="${gId}" color="0 0 0 1" serialization-array-index="${idx}">
      <array rvXMLIvarName="slides">
        <RVDisplaySlide backgroundColor="0 0 0 1" enabled="1" highlightColor="" hotKey="" label="" notes="" slideType="1" sort_index="0" UUID="${sId}" drawingBackgroundColor="0" chordChartPath="" serialization-array-index="0">
          <array rvXMLIvarName="cues"/>
          <array rvXMLIvarName="displayElements">
            <RVTextElement displayDelay="0" displayName="Default" UUID="${eId}" typeID="0" fromTemplate="0" bezelRadius="0" drawingFill="0" drawingShadow="0" drawingStroke="0" fillColor="0 0 0 0" rotation="0" source="" adjustsHeightToFit="0" verticalAlignment="1" RTFData="${rtfB64}" WinFlowData="${winFlowB64}" revealType="0" serialization-array-index="0">
              <_-RVRect3D-_-position>0 0 0 ${W} ${H}</_-RVRect3D-_-position>
            </RVTextElement>
          </array>
        </RVDisplaySlide>
      </array>
    </RVSlideGrouping>`;
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<RVPresentationDocument CCLIArtistCredits="${xmlEsc(artist)}" CCLICopyrightYear="" CCLIDisplay="0" CCLILicenseNumber="" CCLIPublisher="" CCLISongTitle="${xmlEsc(title)}" category="Song" chordChartPath="" docType="0" drawingBackgroundColor="0" height="${H}" lastDateUsed="${new Date().toISOString()}" loopSlides="0" notes="" primaryTargetScreen="0" selectedArrangement="" usedCount="0" uuid="${docId}" versionNumber="600" width="${W}" xmlns:RVPresentationDocument="http://www.renewedvision.com/">
  <RVTimeline OS="0" duration="0" loop="0" playBackRate="1" selectedMediaTrackIndex="0" timeStamp="0">
    <array rvXMLIvarName="timeCues"/>
    <array rvXMLIvarName="mediaTracks"/>
  </RVTimeline>
  <array rvXMLIvarName="groups">
${groups}
  </array>
</RVPresentationDocument>`;
}
