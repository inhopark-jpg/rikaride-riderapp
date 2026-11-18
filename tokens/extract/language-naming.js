/**
 * language-naming.js — language 토큰 이름 규칙 + 계약 버전 확인 (use_figma 로 실행)
 *
 * 이 파일은 node 로 직접 실행하지 않습니다. 이 파일 전체를 `use_figma` 스크립트 앞에
 * 붙여 넣고, 그 뒤에 토큰·번역 테이블을 만드는 코드를 씁니다.
 * 절차와 저장 형식은 docs/design-system-rule/language-rule.md §9 를 보세요.
 *
 * ⚠️ 이 함수들은 i18n 플러그인의 이름 규칙과 글자 하나까지 같아야 합니다.
 *   플러그인 규칙이 바뀌면 플러그인이 Figma 파일의 contractVersion 을 올리고,
 *   checkContract() 가 이 파일의 CONTRACT_VERSION 과 달라서 멈춥니다.
 *   그때 이 파일의 함수와 CONTRACT_VERSION 을 새 규칙에 맞춰 고칩니다.
 */

var CONTRACT_VERSION = 1;
var PD_NS = "cg_i18n";

// 파일의 계약 버전이 이 사본과 같을 때만 진행한다.
function checkContract() {
  var fileVer = figma.root.getSharedPluginData(PD_NS, "contractVersion");
  if (!fileVer) throw new Error("contractVersion 없음 — i18n 플러그인을 이 파일에서 한 번 실행한 뒤 다시 시도");
  if (fileVer !== String(CONTRACT_VERSION)) {
    throw new Error("계약 버전 불일치 — 파일 " + fileVer + ", language-naming.js " + CONTRACT_VERSION + ". 만들지 말고 보고할 것");
  }
}

// ---- 아래는 i18n 플러그인의 이름 함수 사본 (계약 버전 1) ----

var WARN = "⚠️";

var ID_CHARS = "abcdefghijklmnopqrstuvwxyz0123456789";

function dashClean(value) {
  return String(value == null ? "" : value)
    .replace(/[^0-9A-Za-z\-À-ɏͰ-ϿЀ-ӿ؀-ۿ฀-๿ᄀ-ᇿ぀-ヿ㄰-㆏㐀-䶿一-鿿가-힯豈-﫿]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function splitName(fullName) {
  var i = fullName.lastIndexOf("/");
  if (i < 0) return { group: "", leaf: fullName };
  return { group: fullName.slice(0, i), leaf: fullName.slice(i + 1) };
}

function buildSegment(kind, name) {
  return (kind + "-" + dashClean(name)).replace(/-+$/g, "").toLowerCase();
}

function stripWarn(leaf) {
  return leaf.indexOf(WARN) === 0 ? leaf.replace(/^⚠️\s*/, "") : leaf;
}

function genId(used) {
  var id;
  do {
    id = "";
    for (var i = 0; i < 6; i++) id += ID_CHARS.charAt(Math.floor(Math.random() * ID_CHARS.length));
  } while (used[id]);
  used[id] = true;
  return id;
}

function getGroupPath(node) {
  // Build ancestor chain top-to-bottom (not including PAGE itself).
  var ancestors = [];
  var cur = node.parent;
  while (cur && cur.type !== "PAGE") {
    ancestors.unshift(cur);
    cur = cur.parent;
  }

  var sections = [];
  var topLayerName = node.name; // fallback: text node itself has no containing frame

  for (var i = 0; i < ancestors.length; i++) {
    if (ancestors[i].type === "SECTION") {
      if (sections.length < 3) sections.push(ancestors[i].name);
      // Sections beyond 3 are silently skipped; keep iterating.
    } else {
      // First non-SECTION node encountered top-to-bottom is the top-most layer.
      topLayerName = ancestors[i].name;
      break;
    }
  }

  var parts = [];
  for (var s = 0; s < sections.length; s++) parts.push(buildSegment("section", sections[s]));
  parts.push(buildSegment("layer", topLayerName));
  return parts.join("/");
}
