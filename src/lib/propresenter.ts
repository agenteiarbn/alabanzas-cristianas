// Generates a ProPresenter 6 (.pro6) XML file from song lyrics.
// Pro6 is XML-based and importable by both ProPresenter 6 and 7.

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

// Escape text for RTF: handle special chars + encode non-ASCII as \uN?
function rtfEsc(text: string): string {
  let out = "";
  for (const ch of text) {
    if (ch === "\\") { out += "\\\\"; continue; }
    if (ch === "{")  { out += "\\{";  continue; }
    if (ch === "}")  { out += "\\}";  continue; }
    if (ch === "\n") { out += "\\line "; continue; }
    const code = ch.charCodeAt(0);
    if (code > 127) { out += `\\u${code}?`; continue; }
    out += ch;
  }
  return out;
}

// Build RTF string for a block of text (white, centered, Arial 64pt)
function makeRTF(text: string): string {
  const body = rtfEsc(text.trim());
  // \fs128 = 64pt (RTF uses half-points)
  return (
    "{\\rtf1\\ansi\\deff0" +
    "{\\fonttbl{\\f0 Arial;}}" +
    "{\\colortbl;\\red255\\green255\\blue255;}" +
    "\\pard\\qc\\f0\\fs128\\cf1 " +
    body +
    "}"
  );
}

function base64(str: string): string {
  // str must be ASCII-safe (rtfEsc guarantees that)
  return btoa(str);
}

// Split lyrics into named sections based on blank lines
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
      const rtfB64 = base64(makeRTF(sec.text));
      const gId = uuid();
      const sId = uuid();
      const eId = uuid();

      return `    <RVSlideGrouping name="${xmlEsc(sec.name)}" uuid="${gId}" color="0 0 0 1" serialization-array-index="${idx}">
      <array rvXMLIvarName="slides">
        <RVDisplaySlide backgroundColor="0 0 0 1" enabled="1" highlightColor="" hotKey="" label="" notes="" slideType="1" sort_index="0" UUID="${sId}" drawingBackgroundColor="0" chordChartPath="" serialization-array-index="0">
          <array rvXMLIvarName="cues"/>
          <array rvXMLIvarName="displayElements">
            <RVTextElement displayDelay="0" displayName="Default" UUID="${eId}" typeID="0" fromTemplate="0" bezelRadius="0" drawingFill="0" drawingShadow="1" drawingStroke="0" fillColor="1 1 1 0" rotation="0" source="" adjustsHeightToFit="1" verticalAlignment="1" RTFData="${rtfB64}" revealType="0" serialization-array-index="0">
              <_-RVRect3D-_-position>0 0 0 ${W} ${H}</_-RVRect3D-_-position>
            </RVTextElement>
          </array>
        </RVDisplaySlide>
      </array>
    </RVSlideGrouping>`;
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<RVPresentationDocument
  CCLIArtistCredits="${xmlEsc(artist)}"
  CCLICopyrightYear=""
  CCLIDisplay="0"
  CCLILicenseNumber=""
  CCLIPublisher=""
  CCLISongTitle="${xmlEsc(title)}"
  category="Song"
  chordChartPath=""
  docType="0"
  drawingBackgroundColor="0"
  height="${H}"
  lastDateUsed="${new Date().toISOString()}"
  loopSlides="0"
  notes=""
  primaryTargetScreen="0"
  selectedArrangement=""
  usedCount="0"
  uuid="${docId}"
  versionNumber="600"
  width="${W}"
  xmlns:RVPresentationDocument="http://www.renewedvision.com/"
>
  <RVTimeline OS="0" duration="0" loop="0" playBackRate="1" selectedMediaTrackIndex="0" timeStamp="0">
    <array rvXMLIvarName="timeCues"/>
    <array rvXMLIvarName="mediaTracks"/>
  </RVTimeline>
  <array rvXMLIvarName="groups">
${groups}
  </array>
</RVPresentationDocument>`;
}
