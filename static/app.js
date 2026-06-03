const state = {
  papers: [],
  paperSets: [],
  templates: [],
  runs: [],
  materials: [],
  reviewFeedback: null,
  config: null,
  selectedLlmProfileId: null,
  objectConfig: null,
  objectDimensionIndex: 0,
  paperJobs: [],
  paperOps: {},
  paperPage: 1,
  paperLibraryTab: 'all',
  paperFilters: {query: '', year: 'all', paperSet: 'all', parseStatus: 'all', extractionStatus: 'all'},
  recentImportPaperIds: [],
  libraryBatchExtractionBusy: false,
  paperSetCreateOpen: false,
  paperImportWidth: 360,
  paperImportCollapsed: false,
  paperImportResizing: false,
  selectedPaperIds: [],
  selectedPaperId: null,
  objectPromptDirty: false,
  selectedPromptProfileId: null,
  selectedSimulationPromptId: null,
  simulationRawResult: '',
  extractDraftPaperIds: [],
  confirmedExtractPaperIds: [],
  extractSelectionMode: 'selecting',
  extractionJobs: {},
  selectedExtractionRunId: null,
  candidateExampleIndex: 0,
  objectAdvisorSuggestions: [],
  objectAdvisorIgnored: {},
  objectAdvisorExpanded: {},
  objectAdvisorGeneratedAt: null,
  reviewRunId: null,
  reviewTemplateId: null,
  reviewSelectedPaperIds: [],
  reviewSelectedPaperSetIds: [],
  reviewScopePanelOpen: true,
  reviewDraftDirty: false,
  reviewDraftTemplateId: null,
  reviewDraftPaperIds: [],
  reviewDraftPaperSetIds: [],
  reviewDraftFilters: null,
  reviewPaperDropdownOpen: false,
  reviewPaperSetDropdownOpen: false,
  reviewSidebarWidth: 300,
  reviewSidebarCollapsed: false,
  reviewSidebarResizing: false,
  reviewItemIndex: 0,
  reviewFilters: {dimension: 'all', status: 'all', risk: 'all', query: ''},
  reviewActionMode: null,
  reviewActionTags: [],
  reviewActionItemKey: null,
  reviewDraftContent: '',
  reviewDraftNote: '',
  reviewExpandedEvidence: {},
  reviewSaving: false,
  reviewScrollTimer: null,
  evidenceGraphData: null
};
const PAPER_PAGE_SIZE = 6;
const EVIDENCE_GRAPH_MAX_EVIDENCE_NODES = 120;
const SECTION_TYPE_OPTIONS = [
  {value: 'abstract', label: '鎽樿'},
  {value: 'introduction', label: '寮曡█/鐮旂┒鑳屾櫙'},
  {value: 'related_work', label: '鐩稿叧宸ヤ綔'},
  {value: 'method', label: '鏂规硶/妗嗘灦'},
  {value: 'system', label: '绯荤粺/瀹炵幇'},
  {value: 'algorithm', label: '绠楁硶/娴佺▼'},
  {value: 'experiment', label: '瀹為獙璁剧疆'},
  {value: 'results', label: '瀹為獙缁撴灉'},
  {value: 'ablation', label: '娑堣瀺/鍒嗘瀽'},
  {value: 'discussion', label: '璁ㄨ'},
  {value: 'limitations', label: '灞€闄愭€?},
  {value: 'conclusion', label: '缁撹/鏈潵宸ヤ綔'},
  {value: 'appendix', label: '闄勫綍'},
  {value: 'references', label: '鍙傝€冩枃鐚?},
  {value: 'other', label: '鍏朵粬'},
];
const SIMULATION_SAMPLE_TEXTS = [
  `Title: Reflective Memory Policies for Long-Horizon Scientific Agents

Abstract
We introduce Reflective Memory Policies (RMP), a mechanism that stores task-level lessons from failed and successful literature-search episodes and reuses them during later planning. Unlike standard retrieval memory, RMP converts trajectories into compact policy notes such as "verify benchmark names before comparing scores" and "query method abbreviations together with dataset aliases." The agent retrieves these notes before each planning step and appends the top-ranked notes to its planning prompt.

Method
After each search episode, the agent writes a reflection that identifies the decision point, observed outcome, and recommended future action. A verifier keeps only reflections supported by the trajectory log. Reflections are embedded, clustered, and merged into reusable policy notes. During inference, the planner retrieves policy notes using the current subgoal and the last failed action as queries. The retrieved notes guide query decomposition, source selection, and answer verification.

Experiments
On 420 multi-paper question answering tasks, RMP improves exact match from 51.8 to 58.6 compared with the same agent without reflective memory. An ablation that disables policy-note retrieval drops performance to 53.1. Manual inspection shows that most gains come from avoiding repeated search failures and checking evidence before final answers.

Limitations
RMP depends on the quality of the reflection verifier. In domains with sparse trajectory logs, the policy notes can become generic and less useful.`,
  `Title: Dataset Cards as Reusable Experimental Objects in Biomedical NLP

Abstract
This paper studies dataset cards as research objects that summarize provenance, annotation rules, intended use, and known risks for biomedical NLP benchmarks. We propose a structured card schema and evaluate whether card-guided model selection improves reproducibility across clinical relation extraction studies.

Method
Each dataset card contains four dimensions: collection source, annotation protocol, population coverage, and evaluation constraints. The card is created from the original dataset paper, annotation guideline, and release metadata. A curator records direct evidence for each field and marks missing information as not reported. Downstream users retrieve card fields when deciding whether a benchmark is suitable for a target clinical setting.

Experiments
We construct cards for 18 biomedical relation extraction datasets. In a controlled study, researchers using the cards identify dataset mismatch risks 34 percent more often than researchers using only abstracts. The largest gains appear for population coverage and label-definition mismatch.

Limitations
Some older datasets do not report patient demographics or annotation adjudication details, which limits the completeness of the cards.`,
  `Title: Failure-Aware Planning Heuristics for Tool-Using Language Models

Abstract
We present Failure-Aware Planning Heuristics, a set of rules extracted from unsuccessful tool-use traces and used to improve future tool selection. The heuristic object is not a learned parameter; it is a structured collection of natural-language rules linked to evidence from previous failures.

Method
The system collects traces where the model calls a wrong tool, omits a required argument, or ignores an error message. A summarizer converts each trace into a candidate heuristic. A human reviewer confirms whether the heuristic is specific, actionable, and supported by the trace. Confirmed heuristics are stored in a small case library and retrieved when the current task resembles a previous failure pattern.

Experiments
On a benchmark of 250 API-use tasks, adding the heuristic library raises task success from 62.4 to 70.2. Removing human review introduces noisy heuristics and reduces success to 65.0. Error analysis suggests that the method is most effective for avoiding repeated argument-format mistakes.

Limitations
The approach can overfit to frequent failure patterns and may not help when the tool environment changes substantially.`
];

const $ = (id) => document.getElementById(id);
const api = async (url, opts = {}) => {
  const res = await fetch(url, opts);
  if (!res.ok) {
    let msg = await res.text();
    try { msg = JSON.parse(msg).detail || msg; } catch (_) {}
    throw new Error(msg);
  }
  return res.json();
};
const toast = (msg) => {
  const el = $('toast');
  el.textContent = msg;
  el.classList.add('show');
  setTimeout(() => el.classList.remove('show'), 3500);
};
const escapeHtml = (s) => String(s ?? '').replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const fmt = (s, n=180) => s && s.length > n ? s.slice(0, n) + '鈥? : (s || '');
const fmtTime = (s) => s ? new Date(s).toLocaleString() : '-';
const fmtDuration = (seconds) => {
  const value = Number(seconds);
  if (!Number.isFinite(value)) return '-';
  if (value < 60) return `${value.toFixed(value < 10 ? 1 : 0)} 绉抈;
  return `${Math.floor(value / 60)} 鍒?${Math.round(value % 60)} 绉抈;
};
const sourceLabel = (source) => ({
  upload: '鏈湴涓婁紶',
  arxiv: 'arXiv',
  doi: 'DOI / Crossref',
  bibtex: 'BibTeX',
  manual: '鎵嬪姩褰曞叆'
}[source] || source || '鏈煡鏉ユ簮');

function paperMetric(label, value) {
  return `<div class="paper-metric"><span>${label}</span><b>${value}</b></div>`;
}

function listStat(label, value) {
  return `<div class="paper-stat"><span>${label}</span><b>${value}</b></div>`;
}

function metaRow(label, value) {
  return value ? `<div class="metadata-row"><dt>${label}</dt><dd>${value}</dd></div>` : '';
}

function linkButton(href, label) {
  return href ? `<a class="paper-link" href="${escapeHtml(href)}" target="_blank" rel="noreferrer">${label}</a>` : '';
}

async function refreshAll() {
  [state.papers, state.paperSets, state.templates, state.runs, state.materials, state.reviewFeedback] = await Promise.all([
    api('/api/papers'), api('/api/paper-sets'), api('/api/templates'), api('/api/extractions'), api('/api/materials'), api('/api/feedback/dimensions')
  ]);
  renderPapers(); renderObjectConfigPanel(); renderExtractionPanel(); renderReviewPanel(); renderMaterialsPanel();
}

function upsertPaperInState(paper) {
  const index = state.papers.findIndex(item => item.id === paper.id);
  if (index >= 0) state.papers[index] = paper;
  else state.papers.unshift(paper);
}

function activatePanel(id) {
  document.querySelectorAll('.tab').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.tab === id);
  });
  document.querySelectorAll('.panel').forEach(panel => {
    panel.classList.toggle('active', panel.id === id);
  });
}

function setupTabs() {
  document.querySelectorAll('.tab').forEach(btn => {
    btn.onclick = () => {
      activatePanel(btn.dataset.tab);
    };
  });
}

async function openConfigModal() {
  $('configModal').hidden = false;
  document.body.classList.add('modal-open');
  await loadConfig();
}

function closeConfigModal() {
  $('configModal').hidden = true;
  syncModalLock();
}

function openObjectConfigModal() {
  renderObjectConfigPanel();
  $('objectConfigModal').hidden = false;
  document.body.classList.add('modal-open');
}

function closeObjectConfigModal() {
  $('objectConfigModal').hidden = true;
  syncModalLock();
}

function openObjectImportModal() {
  $('objectImportJson').value = '';
  $('objectImportStatus').className = 'test-result muted';
  $('objectImportStatus').textContent = '绛夊緟瀵煎叆銆?;
  $('objectImportModal').hidden = false;
  document.body.classList.add('modal-open');
}

function closeObjectImportModal() {
  $('objectImportModal').hidden = true;
  syncModalLock();
}

function openSimulationRawModal() {
  const raw = state.simulationRawResult || '';
  let display = raw || '鏆傛棤鍘熷缁撴灉銆?;
  try {
    display = JSON.stringify(parseSimulationJson(raw), null, 2);
  } catch (_) {}
  $('simulationRawModalText').textContent = display;
  $('simulationRawModal').hidden = false;
  document.body.classList.add('modal-open');
}

function closeSimulationRawModal() {
  $('simulationRawModal').hidden = true;
  syncModalLock();
}

function syncModalLock() {
  const hasOpenModal = [...document.querySelectorAll('.modal')].some(modal => !modal.hidden);
  document.body.classList.toggle('modal-open', hasOpenModal);
}

async function loadConfig() {
  state.config = await api('/api/config');
  renderConfig();
}

function setChecked(id, value) {
  $(id).checked = Boolean(value);
}

function setValue(id, value) {
  $(id).value = value ?? '';
}

function numberValue(id) {
  const value = Number($(id).value);
  return Number.isFinite(value) ? value : 0;
}

function normalizeLlmProfile(profile = {}, index = 0) {
  return {
    id: String(profile.id || `llm_${index + 1}`).trim(),
    name: String(profile.name || profile.id || `澶фā鍨嬮厤缃?${index + 1}`).trim(),
    active: Boolean(profile.active),
    openai_api_key: profile.openai_api_key || 'EMPTY',
    openai_api_base: profile.openai_api_base || '',
    openai_model: profile.openai_model || '',
    llm_temperature: Number(profile.llm_temperature ?? 0.7),
    llm_timeout_seconds: Number(profile.llm_timeout_seconds ?? 120),
    llm_max_tokens: Number(profile.llm_max_tokens ?? 8192),
    llm_top_p: Number(profile.llm_top_p ?? 0.8),
    llm_presence_penalty: Number(profile.llm_presence_penalty ?? 1.5),
    llm_top_k: Number(profile.llm_top_k ?? 20),
    llm_enable_thinking: Boolean(profile.llm_enable_thinking),
    llm_stream: profile.llm_stream !== false,
  };
}

function getLlmProfiles() {
  const cfg = state.config || {};
  let profiles = (cfg.llm_profiles || []).map((item, index) => normalizeLlmProfile(item, index));
  if (!profiles.length && cfg.llm) profiles = [normalizeLlmProfile({...cfg.llm, id: 'default', name: '褰撳墠閰嶇疆', active: true})];
  if (!profiles.length) profiles = [normalizeLlmProfile({id: 'default', name: '褰撳墠閰嶇疆', active: true})];
  return profiles;
}

function selectedLlmProfile() {
  const profiles = getLlmProfiles();
  return profiles.find(item => item.id === state.selectedLlmProfileId) || profiles.find(item => item.active) || profiles[0];
}

function saveCurrentLlmProfileForm() {
  if (!state.config || !$('cfgLlmProfileId')) return;
  const profiles = getLlmProfiles();
  const profile = profiles.find(item => item.id === state.selectedLlmProfileId) || profiles[0];
  if (!profile) return;
  const oldId = profile.id;
  const nextId = $('cfgLlmProfileId').value.trim() || oldId || 'default';
  profile.id = nextId;
  profile.name = $('cfgLlmProfileName').value.trim() || nextId;
  profile.openai_api_key = $('cfgOpenaiKey').value.trim() || 'EMPTY';
  profile.openai_api_base = $('cfgOpenaiBase').value.trim();
  profile.openai_model = $('cfgOpenaiModel').value.trim();
  profile.llm_temperature = numberValue('cfgLlmTemperature');
  profile.llm_timeout_seconds = numberValue('cfgLlmTimeout');
  profile.llm_max_tokens = numberValue('cfgLlmMaxTokens');
  profile.llm_top_p = numberValue('cfgLlmTopP');
  profile.llm_presence_penalty = numberValue('cfgLlmPresencePenalty');
  profile.llm_top_k = numberValue('cfgLlmTopK');
  profile.llm_enable_thinking = $('cfgLlmEnableThinking').checked;
  profile.llm_stream = $('cfgLlmStream').checked;
  if (state.selectedLlmProfileId === oldId) state.selectedLlmProfileId = nextId;
  if (state.config.active_llm_profile_id === oldId) state.config.active_llm_profile_id = nextId;
  state.config.llm_profiles = profiles;
}

function renderLlmProfiles() {
  const profiles = getLlmProfiles();
  if (!state.selectedLlmProfileId || !profiles.some(item => item.id === state.selectedLlmProfileId)) {
    state.selectedLlmProfileId = (profiles.find(item => item.active) || profiles[0]).id;
  }
  const activeId = state.config?.active_llm_profile_id || profiles.find(item => item.active)?.id || profiles[0].id;
  $('llmProfileList').innerHTML = profiles.map(profile => `
    <button class="llm-profile-item ${profile.id === state.selectedLlmProfileId ? 'active' : ''}" type="button" data-profile-id="${escapeHtml(profile.id)}">
      <span>${escapeHtml(profile.name || profile.id)}</span>
      ${profile.id === activeId ? '<b>褰撳墠浣跨敤</b>' : ''}
      <small>${escapeHtml(profile.openai_model || '鏈～鍐欐ā鍨?)}</small>
    </button>
  `).join('');
  document.querySelectorAll('.llm-profile-item').forEach(btn => {
    btn.onclick = () => {
      saveCurrentLlmProfileForm();
      state.selectedLlmProfileId = btn.dataset.profileId;
      renderLlmProfiles();
    };
  });
  renderSelectedLlmProfileForm();
}

function renderSelectedLlmProfileForm() {
  const profile = selectedLlmProfile();
  const activeId = state.config?.active_llm_profile_id || profile.id;
  $('llmProfileEditorTitle').textContent = profile.id === activeId ? `${profile.name}锛堝綋鍓嶄娇鐢級` : profile.name;
  setValue('cfgLlmProfileId', profile.id);
  setValue('cfgLlmProfileName', profile.name);
  setValue('cfgOpenaiKey', profile.openai_api_key);
  setValue('cfgOpenaiBase', profile.openai_api_base);
  setValue('cfgOpenaiModel', profile.openai_model);
  setValue('cfgLlmMaxTokens', profile.llm_max_tokens);
  setValue('cfgLlmTimeout', profile.llm_timeout_seconds);
  setValue('cfgLlmTemperature', profile.llm_temperature);
  setValue('cfgLlmTopP', profile.llm_top_p);
  setValue('cfgLlmPresencePenalty', profile.llm_presence_penalty);
  setValue('cfgLlmTopK', profile.llm_top_k);
  setChecked('cfgLlmStream', profile.llm_stream);
  setChecked('cfgLlmEnableThinking', profile.llm_enable_thinking);
  $('activateLlmProfileBtn').disabled = profile.id === activeId;
  $('removeLlmProfileBtn').disabled = getLlmProfiles().length <= 1;
}

function renderConfig() {
  const cfg = state.config;
  if (!cfg) return;
  const paper = cfg.paper_parsing;
  setValue('cfgParserProvider', paper.provider);
  setChecked('cfgMineruEnabled', paper.mineru_enabled);
  setValue('cfgMineruCommand', paper.mineru_command);
  setValue('cfgMineruBackend', paper.mineru_backend);
  setValue('cfgMineruTimeout', paper.mineru_timeout_seconds);
  setChecked('cfgMineruOnlineEnabled', paper.mineru_online_enabled);
  setValue('cfgMineruOnlineBase', paper.mineru_online_base_url);
  setValue('cfgMineruOnlineToken', '');
  setValue('cfgMineruOnlineModel', paper.mineru_online_model_version);
  setValue('cfgMineruOnlineLang', paper.mineru_online_language);
  setValue('cfgMineruOnlineTimeout', paper.mineru_online_timeout_seconds);
  setValue('cfgMineruOnlinePoll', paper.mineru_online_poll_interval_seconds);

  state.selectedLlmProfileId = cfg.active_llm_profile_id || cfg.llm_profiles?.find(item => item.active)?.id || state.selectedLlmProfileId;
  renderLlmProfiles();
}

function collectConfig() {
  saveCurrentLlmProfileForm();
  const profiles = getLlmProfiles();
  const activeId = state.config?.active_llm_profile_id || profiles.find(item => item.active)?.id || profiles[0].id;
  profiles.forEach(profile => { profile.active = profile.id === activeId; });
  const activeProfile = profiles.find(item => item.id === activeId) || profiles[0];
  const currentExperience = state.config?.experience || {
    extraction_top_k_chunks: 8,
    max_chunk_chars: 3200,
    chunk_overlap_chars: 400,
  };
  return {
    paper_parsing: {
      provider: $('cfgParserProvider').value,
      mineru_enabled: $('cfgMineruEnabled').checked,
      mineru_command: $('cfgMineruCommand').value.trim() || 'mineru',
      mineru_backend: $('cfgMineruBackend').value.trim() || 'pipeline',
      mineru_timeout_seconds: numberValue('cfgMineruTimeout'),
      mineru_online_enabled: $('cfgMineruOnlineEnabled').checked,
      mineru_online_base_url: $('cfgMineruOnlineBase').value.trim() || 'https://mineru.net',
      mineru_online_token: $('cfgMineruOnlineToken').value.trim() || null,
      mineru_online_model_version: $('cfgMineruOnlineModel').value.trim() || 'vlm',
      mineru_online_language: $('cfgMineruOnlineLang').value.trim() || 'en',
      mineru_online_timeout_seconds: numberValue('cfgMineruOnlineTimeout'),
      mineru_online_poll_interval_seconds: numberValue('cfgMineruOnlinePoll'),
    },
    experience: currentExperience,
    llm: activeProfile,
    llm_profiles: profiles,
    active_llm_profile_id: activeId,
  };
}

async function saveConfig() {
  state.config = await api('/api/config', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify(collectConfig()),
  });
  renderConfig();
  toast('閰嶇疆宸蹭繚瀛?);
}

function addLlmProfile() {
  saveCurrentLlmProfileForm();
  const profiles = getLlmProfiles();
  let next = profiles.length + 1;
  let id = `llm_${next}`;
  while (profiles.some(item => item.id === id)) {
    next += 1;
    id = `llm_${next}`;
  }
  profiles.push(normalizeLlmProfile({
    id,
    name: `澶фā鍨嬮厤缃?${next}`,
    openai_api_key: 'EMPTY',
    openai_api_base: '',
    openai_model: '',
  }, next - 1));
  state.config.llm_profiles = profiles;
  state.selectedLlmProfileId = id;
  renderLlmProfiles();
}

function removeLlmProfile() {
  saveCurrentLlmProfileForm();
  const profiles = getLlmProfiles();
  if (profiles.length <= 1) return toast('鑷冲皯淇濈暀涓€缁勫ぇ妯″瀷閰嶇疆');
  const removeId = state.selectedLlmProfileId;
  const nextProfiles = profiles.filter(item => item.id !== removeId);
  if (state.config.active_llm_profile_id === removeId) {
    state.config.active_llm_profile_id = nextProfiles[0].id;
    nextProfiles[0].active = true;
  }
  state.config.llm_profiles = nextProfiles;
  state.selectedLlmProfileId = nextProfiles[0].id;
  renderLlmProfiles();
}

function activateLlmProfile() {
  saveCurrentLlmProfileForm();
  const profiles = getLlmProfiles();
  const selected = selectedLlmProfile();
  state.config.active_llm_profile_id = selected.id;
  profiles.forEach(item => { item.active = item.id === selected.id; });
  state.config.llm_profiles = profiles;
  renderLlmProfiles();
  toast('宸茶涓哄綋鍓嶄娇鐢紝淇濆瓨閰嶇疆鍚庡啓鍏ョ郴缁?);
}

async function testLlmProfile() {
  saveCurrentLlmProfileForm();
  const profile = selectedLlmProfile();
  const resultBox = $('llmTestResult');
  resultBox.className = 'test-result muted';
  resultBox.textContent = '姝ｅ湪娴嬭瘯鎺ュ彛...';
  $('testLlmProfileBtn').disabled = true;
  try {
    const result = await api('/api/config/llm-test', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({profile, prompt: $('llmTestPrompt').value}),
    });
    resultBox.className = 'test-result ok';
    resultBox.textContent = `娴嬭瘯鎴愬姛锛岀敤鏃?${result.elapsed_seconds}s锛?{result.content || '鎺ュ彛宸插搷搴?}`;
  } catch (err) {
    resultBox.className = 'test-result bad';
    resultBox.textContent = err.message;
  } finally {
    $('testLlmProfileBtn').disabled = false;
  }
}

const lines = (text) => String(text || '').split('\n').map(x => x.trim()).filter(Boolean);
const joinLines = (items) => (items || []).join('\n');
const STRATEGY_EXPERIENCE_DIMENSIONS = [
  {
    dimension_id: 'object_presence',
    name: '瀵硅薄瀛樺湪鎬?,
    description: '鍒ゆ柇璁烘枃涓槸鍚﹀瓨鍦ㄧ瓥鐣ョ粡楠屽璞★紝浠ュ強瀹冨湪璁烘枃涓殑瑙掕壊銆?,
    question: 'Does the paper contain strategy experience as a method component, knowledge object, memory object, policy guidance, or reusable lesson? If yes, what role does it play in the paper?',
    output_type: 'structured_object',
    required: true,
    requires_evidence: true,
    allow_inference: true,
    fields: [
      {name: 'exists', type: 'boolean', description: '璁烘枃涓槸鍚﹀瓨鍦ㄧ瓥鐣ョ粡楠屽璞°€?},
      {name: 'role_in_paper', type: 'enum', values: ['core_contribution', 'method_component', 'auxiliary_component', 'evaluation_object', 'discussion_only', 'not_present'], description: '绛栫暐缁忛獙鍦ㄨ鏂囦腑鐨勮鑹层€?},
      {name: 'local_terms', type: 'list', description: '璁烘枃涓敤浜庤〃杈剧瓥鐣ョ粡楠岀殑鏈湴鏈銆?},
      {name: 'judgement_reason', type: 'long_text', description: '鍒ゆ柇鍏跺睘浜庢垨涓嶅睘浜庣瓥鐣ョ粡楠岀殑鐞嗙敱銆?},
    ],
  },
  {
    dimension_id: 'strategy_experience_definition',
    name: '绛栫暐缁忛獙瀹氫箟',
    description: '鎶藉彇璁烘枃濡備綍瀹氫箟銆佹弿杩版垨闅愬惈瀹氫箟绛栫暐缁忛獙銆?,
    question: 'How does the paper define, describe, or operationalize strategy experience?',
    output_type: 'claim_with_evidence',
    required: true,
    requires_evidence: true,
    allow_inference: true,
    fields: [
      {name: 'definition_type', type: 'enum', values: ['explicit_definition', 'operational_definition', 'implicit_definition', 'undefined'], description: '瀹氫箟绫诲瀷銆?},
      {name: 'definition_text', type: 'long_text', description: '绛栫暐缁忛獙鐨勫畾涔夋垨鎿嶄綔鎬ф弿杩般€?},
      {name: 'author_explicit', type: 'boolean', description: '璇ュ畾涔夋槸鍚︿负浣滆€呮槑纭〃杩般€?},
      {name: 'model_inferred', type: 'boolean', description: '璇ュ畾涔夋槸鍚﹀寘鍚ā鍨嬪熀浜庝笂涓嬫枃鐨勬帹鏂€?},
    ],
  },
  {
    dimension_id: 'strategy_experience_source',
    name: '绛栫暐缁忛獙鏉ユ簮',
    description: '鎶藉彇绛栫暐缁忛獙鏉ヨ嚜鍝簺鏁版嵁銆佽繃绋嬫垨涓讳綋銆?,
    question: 'Where does the strategy experience come from? Identify its source, producer, and collection stage.',
    output_type: 'structured_object',
    required: true,
    requires_evidence: true,
    allow_inference: true,
    fields: [
      {name: 'source_type', type: 'multi_enum', values: ['human_feedback', 'user_preference', 'expert_demonstration', 'agent_trajectory', 'environment_feedback', 'success_case', 'failure_case', 'interaction_log', 'model_self_reflection', 'external_case_base', 'domain_expert_rule', 'not_reported'], description: '绛栫暐缁忛獙鐨勬潵婧愮被鍨嬨€?},
      {name: 'producer', type: 'enum', values: ['human', 'agent', 'environment', 'model', 'expert', 'user', 'hybrid', 'not_reported'], description: '绛栫暐缁忛獙鐢辫皝浜х敓銆?},
      {name: 'collection_stage', type: 'enum', values: ['before_task', 'during_task', 'after_task', 'during_training', 'during_inference', 'offline_preprocessing', 'not_reported'], description: '绛栫暐缁忛獙鍦ㄤ粈涔堟椂鍊欒鏀堕泦銆?},
      {name: 'raw_material', type: 'long_text', description: '绛栫暐缁忛獙褰㈡垚鍓嶇殑鍘熷鏉愭枡锛屼緥濡傝建杩广€佸弽棣堛€佹渚嬨€佹棩蹇椼€佺ず鑼冪瓑銆?},
    ],
  },
  {
    dimension_id: 'strategy_experience_extraction_method',
    name: '绛栫暐缁忛獙鎶藉彇鏂瑰紡',
    description: '鎶藉彇绛栫暐缁忛獙濡備綍浠庡師濮嬫潗鏂欎腑琚舰鎴愩€佹€荤粨銆佸涔犳垨鏋勫缓銆?,
    question: 'How is strategy experience extracted, summarized, learned, or constructed from raw materials?',
    output_type: 'method_step_list',
    required: true,
    requires_evidence: true,
    allow_inference: true,
    fields: [
      {name: 'method_type', type: 'multi_enum', values: ['manual_annotation', 'rule_based_extraction', 'llm_summarization', 'reflection_generation', 'trajectory_compression', 'failure_attribution', 'success_pattern_mining', 'preference_learning', 'reward_modeling', 'case_abstraction', 'reinforcement_learning', 'supervised_finetuning', 'not_reported'], description: '绛栫暐缁忛獙鎶藉彇鎴栧舰鎴愮殑鏂规硶绫诲瀷銆?},
      {name: 'input', type: 'long_text', description: '鎶藉彇鏂规硶鐨勮緭鍏ャ€?},
      {name: 'process', type: 'method_step_list', description: '缁忛獙鎶藉彇鐨勪富瑕佽繃绋嬨€?},
      {name: 'output', type: 'long_text', description: '鎶藉彇鍚庣殑绛栫暐缁忛獙缁撴灉銆?},
      {name: 'automation_level', type: 'enum', values: ['manual', 'semi_automatic', 'automatic', 'not_reported'], description: '鎶藉彇杩囩▼鐨勮嚜鍔ㄥ寲绋嬪害銆?},
    ],
  },
  {
    dimension_id: 'strategy_experience_representation',
    name: '绛栫暐缁忛獙琛ㄧず鏂瑰紡',
    description: '鎶藉彇绛栫暐缁忛獙浠ヤ粈涔堝舰寮忚琛ㄨ揪銆佸瓨鍌ㄦ垨缁勭粐銆?,
    question: 'How is strategy experience represented, stored, or organized?',
    output_type: 'structured_object',
    required: false,
    requires_evidence: true,
    allow_inference: true,
    fields: [
      {name: 'representation_type', type: 'multi_enum', values: ['natural_language_rule', 'heuristic', 'plan_template', 'action_policy', 'decision_rule', 'case_library', 'trajectory_summary', 'prompt_snippet', 'key_value_memory', 'vector_embedding', 'knowledge_graph', 'model_parameter', 'reward_function', 'not_reported'], description: '绛栫暐缁忛獙鐨勮〃绀虹被鍨嬨€?},
      {name: 'storage_location', type: 'enum', values: ['prompt', 'memory_buffer', 'external_memory', 'case_base', 'database', 'model_parameters', 'policy_network', 'retrieval_index', 'not_reported'], description: '绛栫暐缁忛獙瀛樺偍鍦ㄥ摢閲屻€?},
      {name: 'organization_method', type: 'long_text', description: '绛栫暐缁忛獙濡備綍琚粍缁囥€佺储寮曘€佸垎绫绘垨绠＄悊銆?},
    ],
  },
  {
    dimension_id: 'strategy_experience_usage',
    name: '绛栫暐缁忛獙浣跨敤鏂瑰紡',
    description: '鎶藉彇绛栫暐缁忛獙濡備綍琚敤浜庡悗缁换鍔°€佸喅绛栥€佽鍒掓垨妯″瀷浼樺寲銆?,
    question: 'How is strategy experience used to guide future tasks, planning, decision making, generation, or model optimization?',
    output_type: 'structured_object',
    required: true,
    requires_evidence: true,
    allow_inference: true,
    fields: [
      {name: 'usage_type', type: 'multi_enum', values: ['prompt_augmentation', 'retrieval_augmented_generation', 'planning_guidance', 'decision_support', 'action_selection', 'reranking', 'error_avoidance', 'policy_update', 'model_training', 'personalization', 'self_improvement', 'not_reported'], description: '绛栫暐缁忛獙鐨勪娇鐢ㄧ被鍨嬨€?},
      {name: 'use_stage', type: 'multi_enum', values: ['before_task', 'during_task', 'after_task', 'training_time', 'inference_time', 'evaluation_time', 'not_reported'], description: '绛栫暐缁忛獙鍦ㄤ粈涔堟椂鍊欒浣跨敤銆?},
      {name: 'consumer', type: 'enum', values: ['llm', 'agent', 'planner', 'retriever', 'policy_model', 'reward_model', 'human_user', 'hybrid_system', 'not_reported'], description: '璋佷娇鐢ㄧ瓥鐣ョ粡楠屻€?},
      {name: 'usage_mechanism', type: 'long_text', description: '绛栫暐缁忛獙鍏蜂綋濡備綍褰卞搷琛屼负鎴栬緭鍑恒€?},
    ],
  },
  {
    dimension_id: 'strategy_experience_evaluation',
    name: '绛栫暐缁忛獙鏁堟灉楠岃瘉',
    description: '鎶藉彇璁烘枃鏄惁楠岃瘉绛栫暐缁忛獙鏈夋晥锛屼互鍙婂浣曢獙璇併€?,
    question: 'Does the paper evaluate the contribution or effectiveness of strategy experience? If yes, how?',
    output_type: 'comparison_result',
    required: false,
    requires_evidence: true,
    allow_inference: false,
    fields: [
      {name: 'has_direct_evaluation', type: 'boolean', description: '鏄惁鐩存帴楠岃瘉绛栫暐缁忛獙鐨勮础鐚€?},
      {name: 'evaluation_type', type: 'multi_enum', values: ['ablation_study', 'baseline_comparison', 'human_evaluation', 'case_study', 'error_analysis', 'longitudinal_evaluation', 'generalization_test', 'not_reported'], description: '楠岃瘉鏂瑰紡銆?},
      {name: 'baseline', type: 'string', description: '瀵规瘮鍩虹嚎锛屼緥濡?without experience銆亀ithout reflection銆亀ithout memory銆?},
      {name: 'metrics', type: 'list', description: '浣跨敤鐨勮瘎浠锋寚鏍囥€?},
      {name: 'reported_effect', type: 'long_text', description: '璁烘枃鎶ュ憡鐨勬晥鏋溿€?},
      {name: 'evidence_strength', type: 'enum', values: ['strong', 'medium', 'weak', 'missing'], description: '璇佹嵁寮哄害銆?},
    ],
  },
  {
    dimension_id: 'strategy_experience_limitations',
    name: '灞€闄愪笌閫傜敤鏉′欢',
    description: '鎶藉彇绛栫暐缁忛獙鐨勯€傜敤杈圭晫銆佸眬闄愭€у拰娼滃湪椋庨櫓銆?,
    question: 'What are the limitations, applicable conditions, or risks of the strategy experience mechanism?',
    output_type: 'claim_with_evidence',
    required: false,
    requires_evidence: true,
    allow_inference: true,
    fields: [
      {name: 'limitation_type', type: 'multi_enum', values: ['quality_dependency', 'scalability_issue', 'domain_specificity', 'negative_transfer', 'staleness', 'conflict_between_experiences', 'cost_overhead', 'lack_of_evaluation', 'not_reported'], description: '灞€闄愮被鍨嬨€?},
      {name: 'limitation_text', type: 'long_text', description: '鍏蜂綋灞€闄愭垨閫傜敤鏉′欢銆?},
      {name: 'source', type: 'enum', values: ['author_stated', 'experiment_implied', 'model_inferred', 'user_note'], description: '灞€闄愭潵婧愩€?},
    ],
  },
];

function promptIdFromName(name) {
  return `prompt_${String(name || 'default').trim().toLowerCase().replace(/[^a-z0-9\u4e00-\u9fa5]+/g, '_').replace(/^_+|_+$/g, '') || 'default'}_${Date.now().toString(36)}`;
}

function configIdFromName(name) {
  return String(name || 'research_object').trim().toLowerCase().replace(/[^a-z0-9\u4e00-\u9fa5]+/g, '_').replace(/^_+|_+$/g, '') || 'research_object';
}

function normalizePromptProfiles(template) {
  const rawProfiles = Array.isArray(template?.prompt_profiles) ? template.prompt_profiles : [];
  const profiles = rawProfiles.map((item, index) => ({
    id: item.id || `prompt_${index + 1}`,
    name: item.name || `Prompt ${index + 1}`,
    content: item.content || '',
    created_at: item.created_at || template?.created_at || '',
    updated_at: item.updated_at || template?.updated_at || '',
  })).filter(item => item.id && item.name);
  if (!profiles.length && template?.system_prompt) {
    profiles.push({
      id: 'prompt_default',
      name: '榛樿 Prompt',
      content: template.system_prompt,
      created_at: template.created_at || '',
      updated_at: template.updated_at || '',
    });
  }
  if (!profiles.length) {
    profiles.push({
      id: 'prompt_default',
      name: '榛樿 Prompt',
      content: '',
      created_at: '',
      updated_at: '',
    });
  }
  const activeId = profiles.some(item => item.id === template?.active_prompt_id)
    ? template.active_prompt_id
    : profiles[0].id;
  return {active_id: activeId, items: profiles};
}

function defaultResearchObjectConfig(template = null) {
  const dims = (template?.dimensions || []).map(d => ({
    dimension_id: d.name,
    name: d.label,
    output_type: d.output_type || 'list',
    description: d.description || '',
    question: d.description || '',
    fields: (d.fields || []).map(field => typeof field === 'string' ? {name: field, type: 'string', description: ''} : field),
    retrieval_keywords: d.retrieval_keywords || [],
    section_policy: normalizeSectionPolicy(d.section_policy, d),
    required: true,
    requires_evidence: d.required_evidence !== false,
    allow_inference: true,
    allow_not_found: d.allow_not_found !== false,
  }));
  return {
    object_definition: {
      profile_id: template?.id || 'strategy_experience_v1',
      display_name: template?.name || '绛栫暐缁忛獙',
      object_type: 'research_object',
      version: template?.version || '1.0.0',
      description: template?.description || '鐢ㄤ簬浠庤鏂囦腑鎶藉彇涓庣瓥鐣ョ粡楠岀浉鍏崇殑淇℃伅锛屽寘鎷瓥鐣ョ粡楠岀殑瀹氫箟銆佹潵婧愩€佹娊鍙栨柟寮忋€佽〃绀烘柟寮忋€佷娇鐢ㄦ柟寮忋€佹晥鏋滈獙璇佸拰灞€闄愭€с€?,
    },
    term_rules: {
      concept_policy: {
        working_definition: '绛栫暐缁忛獙鏄寚浠庡巻鍙蹭换鍔°€佷氦浜掕建杩广€佹垚鍔?澶辫触妗堜緥銆佺幆澧冨弽棣堛€佷笓瀹剁ず鑼冦€佺敤鎴峰弽棣堟垨妯″瀷鍙嶆€濅腑鎬荤粨鍑烘潵锛屽苟鍙敤浜庢寚瀵煎悗缁换鍔¤鍒掋€佽鍔ㄩ€夋嫨銆佸喅绛栦紭鍖栥€侀敊璇閬挎垨绛栫暐鏀硅繘鐨勭粡楠屾€т俊鎭€?,
        include_terms: [
          'strategy',
          'policy',
          'experience',
          'lesson',
          'reflection',
          'heuristic',
          'rule',
          'case',
          'trajectory',
          'demonstration',
          'feedback',
          'preference',
          'plan',
          'procedure',
          'decision rule',
          'action strategy',
          'policy experience',
          'strategic knowledge',
        ],
        exclude_rules: [
          '涓嶅皢鏅€氳儗鏅煡璇嗚涓虹瓥鐣ョ粡楠岋紝闄ら潪璁烘枃鏄庣‘璇存槑鍏舵潵鑷巻鍙蹭换鍔°€佸弽棣堛€佹渚嬫垨浜や簰杩囩▼銆?,
          '涓嶅皢绾ā鍨嬪弬鏁版垨璁粌璇枡瑙嗕负绛栫暐缁忛獙锛岄櫎闈炶鏂囨槑纭皢鍏朵綔涓哄彲澶嶇敤绛栫暐鎴栫粡楠岃繘琛岀粍缁囧拰浣跨敤銆?,
          '涓嶅皢鍗曠函鐨勫疄楠岀粨鏋滆涓虹瓥鐣ョ粡楠岋紝闄ら潪瀹為獙缁撴灉琚繘涓€姝ユ€荤粨涓哄彲鎸囧鍚庣画浠诲姟鐨勭瓥鐣ャ€佽鍒欐垨缁忛獙銆?,
          '涓嶅皢 related work 涓彁鍒扮殑绛栫暐鎴栫粡楠岃涓烘湰鏂囩殑绛栫暐缁忛獙锛岄櫎闈炶鏂囨槑纭鐢ㄦ垨鏋勫缓浜嗚绫荤粡楠屻€?,
        ],
      },
      decision_criteria: '蹇呴』鑳藉洖绛旇缁忛獙浠庝綍鑰屾潵銆佽濡備綍鎶藉彇鎴栫粍缁囥€佸浣曟寚瀵煎悗缁瓥鐣?鍐崇瓥锛屼互鍙婅鏂囨彁渚涗簡浠€涔堣瘉鎹€?,
    },
    dimensions: dims.length ? dims : JSON.parse(JSON.stringify(STRATEGY_EXPERIENCE_DIMENSIONS)),
    normalization: {
      tags: ['definition', 'storage', 'retrieval', 'update', 'usage', 'evaluation'],
      rules: '鍚屼箟鏈鍚堝苟鍒板悓涓€鏍囩锛涗繚鐣欎綔鑰呭師璇嶄綔涓?raw_value锛涙棤娉曞綊涓€鍖栨椂杩斿洖 unknown銆?,
    },
    evidence_rules: {
      require_quote: true,
      require_section: true,
      require_page: true,
      require_chunk_id: true,
      processing_policy: '鍏佽瀵瑰師鏂囪繘琛岀畝鐭鎷紝浣嗗繀椤讳繚鐣欏師鏂?quote锛涙帹鏂唴瀹瑰繀椤绘樉寮忔爣璁颁负 inferred銆?,
      evidence_types: ['author_claim', 'definition', 'method_description', 'experiment_result', 'ablation', 'limitation'],
    },
    analysis_views: {
      views: ['瀵硅薄瀹氫箟瀵规瘮', '鏈哄埗娴佺▼瀵规瘮', '璇佹嵁寮哄害鐭╅樀', '灞€闄愪笌閫傜敤鏉′欢'],
      prompt: '姣旇緝涓嶅悓璁烘枃涓璞＄殑缁勬垚銆佷綔鐢ㄩ樁娈点€佽瘉鎹被鍨嬨€侀€傜敤鏉′欢鍜屽眬闄愩€?,
    },
    modeling: template?.modeling || defaultModelingState(template),
    prompts: normalizePromptProfiles(template),
  };
}

function defaultModelingState(template = null) {
  return {
    research_intent: {
      object_name: template?.name || '绛栫暐缁忛獙',
      research_area: '',
      object_type: 'mechanism_or_concept',
      research_intent: template?.description || '',
      expected_usage: ['literature_review', 'method_design'],
    },
    boundary_examples: {
      positive_examples: [],
      negative_examples: [],
      uncertain_examples: [],
    },
    boundary_rules: {
      include_rules: [],
      exclude_rules: [],
    },
  };
}

function ensureModelingState(cfg = state.objectConfig) {
  if (!cfg.modeling) cfg.modeling = defaultModelingState();
  if (!cfg.modeling.research_intent) cfg.modeling.research_intent = defaultModelingState().research_intent;
  if (!cfg.modeling.boundary_examples) cfg.modeling.boundary_examples = defaultModelingState().boundary_examples;
  if (!cfg.modeling.boundary_rules) cfg.modeling.boundary_rules = defaultModelingState().boundary_rules;
  ['positive_examples', 'negative_examples', 'uncertain_examples'].forEach(key => {
    if (!Array.isArray(cfg.modeling.boundary_examples[key])) cfg.modeling.boundary_examples[key] = [];
  });
  ['include_rules', 'exclude_rules'].forEach(key => {
    if (!Array.isArray(cfg.modeling.boundary_rules[key])) cfg.modeling.boundary_rules[key] = [];
  });
  return cfg.modeling;
}

function splitImportedDescription(text) {
  const raw = String(text || '');
  const marker = '\nQuestion:';
  const markerIndex = raw.indexOf(marker);
  if (markerIndex < 0) return {description: raw.trim(), question: raw.trim()};
  const description = raw.slice(0, markerIndex).trim();
  const question = raw.slice(markerIndex + marker.length).trim();
  return {description, question: question || description};
}

function comparableDimensionText(text) {
  return String(text || '')
    .replace(/^Question:\s*/i, '')
    .replace(/^鎶藉彇闂[:锛歖\s*/i, '')
    .replace(/\s+/g, '')
    .replace(/[锛?銆?!锛?锛燂紱;锛?銆?'鈥溾€濃€樷€?)锛堬級\[\]銆愩€慮/g, '')
    .toLowerCase();
}

function sameDimensionText(left, right) {
  const a = comparableDimensionText(left);
  const b = comparableDimensionText(right);
  return Boolean(a && b && a === b);
}

function combineDimensionText(description, question, questionPrefix = 'Question: ') {
  const desc = String(description || '').trim();
  const q = String(question || '').trim();
  if (!desc) return q;
  if (!q || sameDimensionText(desc, q)) return desc;
  return [desc, `${questionPrefix}${q}`].join('\n');
}

function importedArray(value) {
  if (Array.isArray(value)) return value.filter(item => item !== null && item !== undefined);
  if (typeof value === 'string') return lines(value);
  return [];
}

function sectionPolicyValues(values) {
  const allowed = new Set(SECTION_TYPE_OPTIONS.map(item => item.value));
  return importedArray(values).map(String).filter(value => allowed.has(value));
}

function normalizeSectionPolicy(policy = {}, dim = null) {
  const fallback = defaultSectionPolicyForDimension(dim);
  const raw = policy && typeof policy === 'object' ? policy : {};
  const exclude = new Set([...sectionPolicyValues(raw.exclude || fallback.exclude), 'references']);
  const prefer = sectionPolicyValues(raw.prefer || fallback.prefer).filter(value => !exclude.has(value));
  const allow = sectionPolicyValues(raw.allow || fallback.allow).filter(value => !exclude.has(value) && !prefer.includes(value));
  return {prefer, allow, exclude: SECTION_TYPE_OPTIONS.map(item => item.value).filter(value => exclude.has(value))};
}

function defaultSectionPolicyForDimension(dim = {}) {
  const text = `${dim.dimension_id || dim.name || ''} ${dim.label || ''} ${dim.description || ''} ${dim.question || ''}`.toLowerCase();
  const policy = (prefer, allow, exclude = ['references', 'related_work']) => ({prefer, allow, exclude});
  if (/definition|瀹氫箟|identity|鍏冧俊鎭?.test(text)) return policy(['abstract','introduction','method','system'], ['discussion','conclusion','other']);
  if (/source|鏉ユ簮|collection|data/.test(text)) return policy(['method','system','algorithm'], ['introduction','experiment','appendix','other']);
  if (/extraction|extract|鎶藉彇|summar|learn|瀛︿範|鏋勫缓|鏂规硶|姝ラ|pipeline|algorithm/.test(text)) return policy(['method','algorithm','system'], ['experiment','appendix','other']);
  if (/representation|琛ㄧず|storage|瀛樺偍|memory/.test(text)) return policy(['method','system','algorithm'], ['appendix','other']);
  if (/usage|use|浣跨敤|planning|decision|搴旂敤/.test(text)) return policy(['method','system','algorithm','experiment'], ['discussion','appendix','other']);
  if (/update|鏇存柊|adapt|refine|杩唬|transfer/.test(text)) return policy(['method','algorithm','system'], ['experiment','discussion','appendix','other']);
  if (/experiment|evaluation|evidence|effect|result|鏁堟灉|瀹為獙|楠岃瘉/.test(text)) return policy(['experiment','results','ablation'], ['method','discussion','conclusion','other']);
  if (/limitation|灞€闄恷risk|failure|future/.test(text)) return policy(['limitations','discussion','conclusion'], ['experiment','results','other']);
  if (/motivation|background|gap|鍔ㄦ満|鑳屾櫙/.test(text)) return policy(['abstract','introduction'], ['discussion','related_work','other'], ['references']);
  if (/contribution|claim|innovation|璐＄尞|鍒涙柊|瑙傜偣/.test(text)) return policy(['abstract','introduction','method'], ['results','discussion','conclusion','other']);
  return policy(['method','system','algorithm','experiment','results'], ['abstract','introduction','discussion','limitations','conclusion','appendix','other']);
}

function renderSectionPolicyEditor(dim) {
  const holder = $('dimSectionPolicy');
  if (!holder) return;
  const policy = normalizeSectionPolicy(dim?.section_policy, dim);
  const disabled = !dim;
  const groups = [
    ['prefer', '浼樺厛绔犺妭'],
    ['allow', '鍙敤绔犺妭'],
    ['exclude', '鎺掗櫎绔犺妭'],
  ];
  holder.innerHTML = groups.map(([key, title]) => `
    <section class="section-policy-column">
      <h4>${title}</h4>
      ${SECTION_TYPE_OPTIONS.map(option => `
        <label class="section-policy-option" title="${escapeHtml(option.value)}">
          <input type="checkbox" data-section-policy="${key}" value="${escapeHtml(option.value)}" ${policy[key].includes(option.value) ? 'checked' : ''} ${disabled ? 'disabled' : ''} />
          <span>${escapeHtml(option.label)}</span>
          <small>${escapeHtml(option.value)}</small>
        </label>
      `).join('')}
    </section>
  `).join('');
}

function readSectionPolicyEditor(dim) {
  const holder = $('dimSectionPolicy');
  if (!holder) return normalizeSectionPolicy(dim?.section_policy, dim);
  const picked = {prefer: [], allow: [], exclude: []};
  holder.querySelectorAll('input[data-section-policy]:checked').forEach(input => {
    picked[input.dataset.sectionPolicy].push(input.value);
  });
  return normalizeSectionPolicy(picked, dim);
}

function normalizeImportedFields(fields) {
  return importedArray(fields).map(field => {
    if (typeof field === 'string') return {name: field, type: 'string', description: ''};
    return {
      name: field.name || field.id || field.key || '',
      type: field.type || field.output_type || 'string',
      values: Array.isArray(field.values) ? field.values : undefined,
      description: field.description || field.label || '',
    };
  }).filter(field => field.name);
}

function normalizeImportedDimension(dim, index) {
  if (typeof dim === 'string') {
    return {
      dimension_id: configIdFromName(dim),
      name: dim,
      output_type: 'list',
      description: '',
      question: '',
      fields: [],
      retrieval_keywords: [],
      section_policy: normalizeSectionPolicy({}, {dimension_id: configIdFromName(dim), name: dim}),
      required: true,
      requires_evidence: true,
      allow_inference: true,
      allow_not_found: true,
    };
  }
  const parsed = splitImportedDescription(dim.description || '');
  const dimensionId = dim.dimension_id || dim.id || (dim.label ? dim.name : '') || `dimension_${index + 1}`;
  const displayName = dim.dimension_name || dim.label || dim.title || (dim.dimension_id ? dim.name : '') || dimensionId;
  return {
    dimension_id: String(dimensionId).trim(),
    name: String(displayName).trim(),
    output_type: dim.output_type || dim.type || 'list',
    description: dim.description_text || parsed.description || dim.summary || '',
    question: dim.question || parsed.question || parsed.description || '',
    fields: normalizeImportedFields(dim.fields || dim.schema || dim.output_fields),
    retrieval_keywords: importedArray(dim.retrieval_keywords || dim.keywords || dim.search_terms),
    section_policy: normalizeSectionPolicy(dim.section_policy || dim.section_types || {}, {
      dimension_id: String(dimensionId).trim(),
      name: String(displayName).trim(),
      description: dim.description_text || parsed.description || dim.summary || '',
      question: dim.question || parsed.question || parsed.description || '',
    }),
    required: dim.required !== false,
    requires_evidence: dim.requires_evidence ?? dim.required_evidence ?? true,
    allow_inference: dim.allow_inference ?? true,
    allow_not_found: dim.allow_not_found ?? true,
  };
}

function normalizeImportedPrompts(source) {
  const now = new Date().toISOString();
  let rawItems = [];
  let activeId = '';
  if (Array.isArray(source?.prompt_profiles)) {
    rawItems = source.prompt_profiles;
    activeId = source.active_prompt_id || '';
  } else if (Array.isArray(source?.prompts?.items)) {
    rawItems = source.prompts.items;
    activeId = source.prompts.active_id || source.active_prompt_id || '';
  } else if (Array.isArray(source?.prompts)) {
    rawItems = source.prompts;
    activeId = source.active_prompt_id || '';
  }
  const items = rawItems.map((item, index) => ({
    id: item.id || promptIdFromName(item.name || `Prompt ${index + 1}`),
    name: item.name || `Prompt ${index + 1}`,
    content: item.content || item.prompt || item.system_prompt || '',
    created_at: item.created_at || now,
    updated_at: item.updated_at || now,
  })).filter(item => item.id && item.name);
  if (source?.system_prompt && !items.some(item => item.content === source.system_prompt)) {
    items.unshift({
      id: 'prompt_imported_system',
      name: '瀵煎叆閰嶇疆 Prompt',
      content: source.system_prompt,
      created_at: now,
      updated_at: now,
    });
  } else if (source?.prompt && !items.length) {
    items.push({
      id: 'prompt_imported',
      name: '瀵煎叆閰嶇疆 Prompt',
      content: source.prompt,
      created_at: now,
      updated_at: now,
    });
  }
  const resolvedActiveId = items.some(item => item.id === activeId)
    ? activeId
    : (items.find(item => item.active)?.id || items[0]?.id || '');
  return {active_id: resolvedActiveId, items};
}

function ensureImportedPromptContent(cfg) {
  ensurePromptManagerState(cfg);
  const now = new Date().toISOString();
  const generated = buildObjectSystemPrompt(cfg);
  const active = activePromptProfile(cfg);
  if (active && !active.content?.trim()) {
    active.content = generated;
    active.updated_at = now;
    return;
  }
  if (!active) {
    cfg.prompts.items.push({
      id: 'prompt_imported_default',
      name: '瀵煎叆閰嶇疆 Prompt',
      content: generated,
      created_at: now,
      updated_at: now,
    });
    cfg.prompts.active_id = 'prompt_imported_default';
  }
}

function objectConfigFromImportedJson(data) {
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    throw new Error('瀵煎叆鍐呭蹇呴』鏄?JSON 瀵硅薄');
  }
  const looksLikeTemplate = data.id && data.name && Array.isArray(data.dimensions);
  const looksLikeInternal = data.object_definition && (data.object_definition.profile_id || data.term_rules || data.prompts?.items);
  let cfg;
  if (looksLikeTemplate) {
    cfg = defaultResearchObjectConfig(data);
  } else if (looksLikeInternal) {
    cfg = defaultResearchObjectConfig(null);
    const obj = data.object_definition || {};
    cfg.object_definition = {
      profile_id: obj.profile_id || data.profile_id || obj.id || configIdFromName(obj.display_name || obj.name || 'research_object'),
      display_name: obj.display_name || data.display_name || obj.name || '鏈懡鍚嶇鐮斿璞?,
      object_type: obj.object_type || data.object_type || 'research_object',
      version: obj.version || data.version || '1.0.0',
      description: obj.description || data.description || '',
    };
    cfg.term_rules = data.term_rules || cfg.term_rules;
    cfg.dimensions = importedArray(data.dimensions).map(normalizeImportedDimension);
    cfg.prompts = normalizeImportedPrompts(data);
    cfg.normalization = data.normalization || cfg.normalization;
    cfg.evidence_rules = data.evidence_rules || cfg.evidence_rules;
    cfg.analysis_views = data.analysis_views || cfg.analysis_views;
    cfg.modeling = data.modeling || cfg.modeling;
  } else {
    cfg = defaultResearchObjectConfig(null);
    const concept = data.object_definition || {};
    cfg.object_definition = {
      profile_id: data.profile_id || data.id || configIdFromName(data.display_name || data.name || 'research_object'),
      display_name: data.display_name || data.name || '鏈懡鍚嶇鐮斿璞?,
      object_type: data.object_type || 'research_object',
      version: data.version || '1.0.0',
      description: data.description || '',
    };
    cfg.term_rules = {
      concept_policy: {
        working_definition: concept.working_definition || data.working_definition || '',
        include_terms: importedArray(concept.related_terms || concept.include_terms || data.related_terms || data.include_terms),
        exclude_rules: importedArray(concept.exclusion_notes || concept.exclude_rules || data.exclusion_notes || data.exclude_rules),
      },
      decision_criteria: data.decision_criteria || concept.decision_criteria || '',
    };
    cfg.dimensions = importedArray(data.dimensions).map(normalizeImportedDimension);
    cfg.prompts = normalizeImportedPrompts(data);
    cfg.normalization = data.normalization || cfg.normalization;
    cfg.evidence_rules = data.evidence_rules || cfg.evidence_rules;
    cfg.analysis_views = data.analysis_views || cfg.analysis_views;
    cfg.modeling = data.modeling || cfg.modeling;
  }
  if (!cfg.object_definition.profile_id) cfg.object_definition.profile_id = configIdFromName(cfg.object_definition.display_name);
  if (!cfg.object_definition.version) cfg.object_definition.version = '1.0.0';
  if (!cfg.object_definition.object_type) cfg.object_definition.object_type = 'research_object';
  if (!cfg.dimensions.length) throw new Error('瀵煎叆閰嶇疆鑷冲皯闇€瑕佸寘鍚?1 涓?dimensions 椤?);
  if (data.system_prompt) {
    ensurePromptManagerState(cfg);
    const active = activePromptProfile(cfg);
    if (active && !active.content?.trim()) active.content = data.system_prompt;
  }
  ensureImportedPromptContent(cfg);
  return cfg;
}

function renderObjectConfigPanel() {
  if (!$('objectTemplateSelect')) return;
  $('objectTemplateSelect').innerHTML = [
    '<option value="__new__">+鏂板缓瀵硅薄</option>',
    ...state.templates.map(t => `<option value="${escapeHtml(t.id)}">${escapeHtml(t.name)} 路 v${escapeHtml(t.version)}</option>`)
  ].join('');
  if (!state.objectConfig) {
    state.objectConfig = defaultResearchObjectConfig(null);
    state.objectDimensionIndex = 0;
  }
  const id = state.objectConfig.object_definition.profile_id;
  $('objectTemplateSelect').value = state.templates.some(t => t.id === id) ? id : '__new__';
  updateObjectDeleteButton();
  renderObjectConfigForm();
}

function extractionReadyTemplates() {
  return state.templates.filter(template => template.modeling?.publish_state !== 'draft');
}

function updateObjectDeleteButton() {
  const btn = $('deleteObjectTemplateBtn');
  const select = $('objectTemplateSelect');
  if (!btn || !select) return;
  const selectedId = select.value;
  const template = state.templates.find(item => item.id === selectedId);
  btn.disabled = !template;
  btn.title = template ? `鍒犻櫎 ${template.name}` : '璇峰厛閫夋嫨涓€涓凡淇濆瓨瀵硅薄';
}

function resetObjectAdvisorSuggestions() {
  state.objectAdvisorSuggestions = [];
  state.objectAdvisorIgnored = {};
  state.objectAdvisorExpanded = {};
  state.objectAdvisorGeneratedAt = null;
}

function handleObjectTemplateChange() {
  const value = $('objectTemplateSelect').value;
  resetObjectAdvisorSuggestions();
  if (value === '__new__') {
    state.objectConfig = defaultResearchObjectConfig(null);
    state.objectDimensionIndex = 0;
    state.objectPromptDirty = false;
    state.selectedPromptProfileId = null;
  } else {
    const template = state.templates.find(t => t.id === value);
    state.objectConfig = defaultResearchObjectConfig(template);
    state.objectDimensionIndex = 0;
    state.objectPromptDirty = false;
    state.selectedPromptProfileId = null;
  }
  updateObjectDeleteButton();
  renderObjectConfigForm();
}

function currentObjectDimension() {
  const dims = state.objectConfig?.dimensions || [];
  if (!dims.length) return null;
  if (state.objectDimensionIndex >= dims.length) state.objectDimensionIndex = dims.length - 1;
  if (state.objectDimensionIndex < 0) state.objectDimensionIndex = 0;
  return dims[state.objectDimensionIndex];
}

function collectObjectConfigFromForm() {
  if (!state.objectConfig) return;
  collectModelingFromForm();
  saveCurrentDimensionForm();
  const existingTerms = state.objectConfig.term_rules?.concept_policy?.include_terms || [];
  state.objectConfig.object_definition = {
    profile_id: $('objId').value.trim(),
    display_name: $('objName').value.trim(),
    object_type: $('objType').value,
    version: $('objVersion').value.trim(),
    description: $('objPurpose').value.trim(),
  };
  state.objectConfig.term_rules = {
    concept_policy: {
      working_definition: $('termDefinition').value.trim(),
      include_terms: existingTerms,
      exclude_rules: lines($('termExcludes').value),
    },
    decision_criteria: $('termCriteria').value.trim(),
  };
}

function collectModelingFromForm() {
  if (!state.objectConfig || !$('intentObjectName')) return;
  const modeling = ensureModelingState();
  modeling.research_intent = {
    object_name: $('intentObjectName').value.trim(),
    research_area: $('intentResearchArea').value.trim(),
    object_type: $('intentObjectType').value,
    research_intent: $('intentResearchIntent').value.trim(),
    expected_usage: [...document.querySelectorAll('.intentUsage:checked')].map(input => input.value),
  };
  modeling.boundary_rules = {
    include_rules: lines($('includeBoundaryRules')?.value || ''),
    exclude_rules: lines($('excludeBoundaryRules')?.value || ''),
  };
}

function renderObjectConfigForm() {
  const cfg = state.objectConfig;
  if (!cfg) return;
  const obj = cfg.object_definition;
  setValue('objId', obj.profile_id);
  setValue('objName', obj.display_name);
  setValue('objType', obj.object_type || 'mechanism');
  setValue('objVersion', obj.version);
  setValue('objPurpose', obj.description);
  renderObjectOverviewStats(cfg);

  const terms = cfg.term_rules || {};
  const conceptPolicy = terms.concept_policy || {};
  setValue('termDefinition', conceptPolicy.working_definition);
  renderTermIncludeTags();
  setValue('termExcludes', joinLines(conceptPolicy.exclude_rules));
  setValue('termCriteria', terms.decision_criteria);
  renderModelingForm();

  renderObjectDimensionList();
  renderCurrentDimensionForm();
  renderObjectPreview();
}

function renderModelingForm() {
  const modeling = ensureModelingState();
  const intent = modeling.research_intent;
  setValue('intentObjectName', intent.object_name || state.objectConfig.object_definition?.display_name || '');
  setValue('intentResearchArea', intent.research_area || '');
  setValue('intentObjectType', intent.object_type || 'mechanism_or_concept');
  setValue('intentResearchIntent', intent.research_intent || '');
  document.querySelectorAll('.intentUsage').forEach(input => {
    input.checked = (intent.expected_usage || []).includes(input.value);
  });
  setValue('includeBoundaryRules', joinLines(modeling.boundary_rules.include_rules));
  setValue('excludeBoundaryRules', joinLines(modeling.boundary_rules.exclude_rules));
  renderExamplePaperSelect();
  renderCandidateExamples();
}

function renderTermIncludeTags() {
  const terms = state.objectConfig?.term_rules?.concept_policy?.include_terms || [];
  $('termIncludeTags').innerHTML = terms.map((term, index) => `
    <button class="term-tag" type="button" data-term-index="${index}">
      <span>${escapeHtml(term)}</span>
      <b aria-hidden="true">脳</b>
    </button>
  `).join('');
  document.querySelectorAll('.term-tag').forEach(tag => {
    tag.onclick = () => {
      const idx = Number(tag.dataset.termIndex);
      const list = state.objectConfig.term_rules.concept_policy.include_terms;
      list.splice(idx, 1);
      renderTermIncludeTags();
      renderObjectPreview();
    };
  });
}

function addTermInclude() {
  collectObjectConfigFromForm();
  const value = $('termIncludeInput').value.trim();
  if (!value) return;
  const list = state.objectConfig.term_rules.concept_policy.include_terms;
  if (!list.some(item => item.toLowerCase() === value.toLowerCase())) {
    list.push(value);
  }
  $('termIncludeInput').value = '';
  renderTermIncludeTags();
  renderObjectPreview();
}

function renderExamplePaperSelect() {
  if (!$('examplePaperSelect')) return;
  const selected = $('examplePaperSelect').value;
  $('examplePaperSelect').innerHTML = state.papers.map(p => `
    <option value="${escapeHtml(p.id)}">${escapeHtml(fmt(p.metadata?.title || p.id, 90))}</option>
  `).join('');
  if (selected && state.papers.some(p => p.id === selected)) $('examplePaperSelect').value = selected;
}

function candidateSourceLabel(example) {
  return [example.paper_title, example.section_title, example.chunk_id].filter(Boolean).join(' / ') || '鎵嬪姩鏍蜂緥';
}

function renderCandidateExamples() {
  if (!$('candidateExampleList')) return;
  const modeling = ensureModelingState();
  const examples = [
    ...modeling.boundary_examples.positive_examples.map(item => ({...item, type: 'positive_example'})),
    ...modeling.boundary_examples.negative_examples.map(item => ({...item, type: 'negative_example'})),
    ...modeling.boundary_examples.uncertain_examples.map(item => ({...item, type: 'boundary_example'})),
  ];
  $('candidateExampleList').innerHTML = examples.map((example, index) => `
    <article class="candidate-example-card ${escapeHtml(example.type)}" data-example-index="${index}">
      <div class="candidate-example-source">娈佃惤鏉ユ簮锛?{escapeHtml(candidateSourceLabel(example))}</div>
      <p>${escapeHtml(example.text || '')}</p>
      <div class="candidate-example-actions">
        <button type="button" data-mark-example="positive_example">绠椾綔${escapeHtml(state.objectConfig.object_definition?.display_name || '璇ュ璞?)}</button>
        <button type="button" data-mark-example="negative_example">涓嶇畻</button>
        <button type="button" data-mark-example="boundary_example">涓嶇‘瀹?/button>
      </div>
      <label>鏍囨敞鐞嗙敱</label>
      <textarea rows="3" data-example-reason>${escapeHtml(example.reason || '')}</textarea>
    </article>
  `).join('') || '<p class="muted">鏆傛棤鍊欓€夋钀姐€傚彲浠ラ€夋嫨璁烘枃鍚庡彫鍥烇紝鎴栬浇鍏ョ瓥鐣ョ粡楠岀ず渚嬨€?/p>';
  document.querySelectorAll('.candidate-example-card').forEach(card => {
    const index = Number(card.dataset.exampleIndex);
    card.querySelectorAll('[data-mark-example]').forEach(btn => {
      btn.onclick = () => markBoundaryExample(index, btn.dataset.markExample);
    });
    card.querySelector('[data-example-reason]').oninput = event => updateBoundaryExampleReason(index, event.target.value);
  });
}

function allBoundaryExamples() {
  const modeling = ensureModelingState();
  return [
    ...modeling.boundary_examples.positive_examples.map(item => ({...item, type: 'positive_example'})),
    ...modeling.boundary_examples.negative_examples.map(item => ({...item, type: 'negative_example'})),
    ...modeling.boundary_examples.uncertain_examples.map(item => ({...item, type: 'boundary_example'})),
  ];
}

function replaceBoundaryExamples(examples) {
  const modeling = ensureModelingState();
  modeling.boundary_examples.positive_examples = examples.filter(item => item.type === 'positive_example').map(({type, ...rest}) => rest);
  modeling.boundary_examples.negative_examples = examples.filter(item => item.type === 'negative_example').map(({type, ...rest}) => rest);
  modeling.boundary_examples.uncertain_examples = examples.filter(item => item.type === 'boundary_example').map(({type, ...rest}) => rest);
}

function markBoundaryExample(index, type) {
  const examples = allBoundaryExamples();
  if (!examples[index]) return;
  examples[index].type = type;
  replaceBoundaryExamples(examples);
  updateBoundaryRulesFromExamples();
  renderCandidateExamples();
  renderObjectPreview();
}

function updateBoundaryExampleReason(index, reason) {
  const examples = allBoundaryExamples();
  if (!examples[index]) return;
  examples[index].reason = reason;
  replaceBoundaryExamples(examples);
  renderObjectPreview();
}

function loadCandidateExamplesFromPaper() {
  const paper = state.papers.find(p => p.id === $('examplePaperSelect').value) || state.papers[0];
  if (!paper) return toast('璇峰厛瀵煎叆鎴栭€夋嫨璁烘枃');
  const chunks = (paper.chunks || []).slice(0, 5);
  if (!chunks.length) return toast('璇ヨ鏂囨殏鏃犲彲鐢ㄦ钀?);
  const examples = chunks.map(chunk => ({
    type: 'boundary_example',
    text: fmt(chunk.text, 700),
    reason: '',
    paper_id: paper.id,
    paper_title: paper.metadata?.title || paper.id,
    section_title: chunk.section_title || 'Unknown',
    chunk_id: chunk.id,
  }));
  replaceBoundaryExamples([...allBoundaryExamples(), ...examples]);
  renderCandidateExamples();
  renderObjectPreview();
  toast(`宸插彫鍥?${examples.length} 涓€欓€夋钀絗);
}

function goPaperUploadFromExamples() {
  closeObjectConfigModal();
  activatePanel('papers');
  $('paperFile')?.focus();
}

function loadStrategyExperienceIntent() {
  setValue('intentObjectName', '绛栫暐缁忛獙');
  setValue('intentResearchArea', 'LLM Agent');
  setValue('intentObjectType', 'mechanism_or_concept');
  setValue('intentResearchIntent', '鐮旂┒鏅鸿兘浣撳浣曚粠鍘嗗彶浠诲姟銆佷氦浜掕建杩广€佸弽棣堛€佸け璐ユ渚嬫垨鍙嶆€濅腑鎬荤粨鍙鐢ㄧ殑绛栫暐缁忛獙锛屽苟灏嗗叾鐢ㄤ簬鍚庣画瑙勫垝銆佽鍔ㄩ€夋嫨鍜岄敊璇閬裤€?);
  document.querySelectorAll('.intentUsage').forEach(input => {
    input.checked = ['literature_review', 'method_design', 'comparative_analysis'].includes(input.value);
  });
  applyIntentToDefinition();
}

function loadStrategyExperienceExamples() {
  replaceBoundaryExamples([
    {
      type: 'positive_example',
      text: 'The agent reflects on failed trajectories and stores lessons to guide future planning.',
      reason: '浠庡け璐ヨ建杩逛腑鎬荤粨 lesson锛屽苟鐢ㄤ簬鏈潵瑙勫垝銆?,
      paper_title: 'Strategy Experience Example',
      section_title: 'Method',
      chunk_id: 'example_positive_001',
    },
    {
      type: 'negative_example',
      text: 'The model achieves 10% improvement over the baseline.',
      reason: '杩欏彧鏄疄楠岀粨鏋滐紝娌℃湁琚€荤粨涓哄彲澶嶇敤绛栫暐銆?,
      paper_title: 'Strategy Experience Example',
      section_title: 'Experiments',
      chunk_id: 'example_negative_001',
    },
    {
      type: 'boundary_example',
      text: 'The system stores previous trajectories in memory.',
      reason: '鍙繚瀛樿建杩癸紝涓嶇‘瀹氭槸鍚︾敤浜庡悗缁喅绛栥€?,
      paper_title: 'Strategy Experience Example',
      section_title: 'System',
      chunk_id: 'example_boundary_001',
    },
  ]);
  updateBoundaryRulesFromExamples();
  renderCandidateExamples();
  renderObjectPreview();
}

function updateBoundaryRulesFromExamples() {
  const modeling = ensureModelingState();
  if (modeling.boundary_examples.positive_examples.length) {
    modeling.boundary_rules.include_rules = [
      '浠庡け璐ユ渚嬨€佹垚鍔熸渚嬫垨浜や簰杞ㄨ抗涓敓鎴?lesson銆乺eflection銆乺ule銆乸olicy guidance锛屽苟鐢ㄤ簬鍚庣画浠诲姟鐨勫唴瀹癸紝搴旇涓虹瓥鐣ョ粡楠屻€?
    ];
  }
  if (modeling.boundary_examples.negative_examples.length || modeling.boundary_examples.uncertain_examples.length) {
    modeling.boundary_rules.exclude_rules = [
      '浠呬繚瀛樺巻鍙茶建杩逛絾鏈鏄庡叾琚€荤粨銆佹绱€佸鐢ㄦ垨鐢ㄤ簬鍚庣画瑙勫垝/鍐崇瓥鐨勫唴瀹癸紝涓嶅簲瑙嗕负绛栫暐缁忛獙銆?
    ];
  }
  setValue('includeBoundaryRules', joinLines(modeling.boundary_rules.include_rules));
  setValue('excludeBoundaryRules', joinLines(modeling.boundary_rules.exclude_rules));
}

function applyIntentToDefinition() {
  collectModelingFromForm();
  const intent = ensureModelingState().research_intent;
  if (intent.object_name) {
    setValue('objName', intent.object_name);
  }
  if (intent.object_type) setValue('objType', objectTypeFromIntent(intent.object_type));
  if (intent.research_intent) setValue('objPurpose', intent.research_intent);
  collectObjectConfigFromForm();
  renderObjectConfigForm();
  toast('宸插悓姝ュ埌瀵硅薄瀹氫箟');
}

function objectTypeFromIntent(type) {
  return ({
    mechanism_or_concept: 'mechanism',
    concept: 'research_object',
    evaluation_object: 'benchmark',
    component: 'other',
  })[type] || type || 'research_object';
}

function renderObjectDimensionList() {
  const dims = state.objectConfig?.dimensions || [];
  $('objectDimensionList').innerHTML = dims.map((d, index) => `
    <button class="dimension-list-item ${index === state.objectDimensionIndex ? 'active' : ''}" data-dimension-index="${index}">
      <b>${escapeHtml(d.name || d.dimension_id || '鏈懡鍚嶇淮搴?)}</b>
      <span>${escapeHtml(d.dimension_id || '')}</span>
    </button>
  `).join('') || '<p class="muted">鏆傛棤缁村害銆?/p>';
  document.querySelectorAll('.dimension-list-item').forEach(btn => {
    btn.onclick = () => {
      saveCurrentDimensionForm();
      state.objectDimensionIndex = Number(btn.dataset.dimensionIndex);
      renderObjectDimensionList();
      renderCurrentDimensionForm();
      renderObjectPreview();
    };
  });
}

function renderCurrentDimensionForm() {
  const dim = currentObjectDimension();
  const disabled = !dim;
  ['dimId','dimName','dimDescription','dimQuestion','dimOutputType','dimKeywords'].forEach(id => $(id).disabled = disabled);
  $('removeDimensionBtn').disabled = disabled;
  if (!dim) {
    setValue('dimId', '');
    setValue('dimName', '');
    setValue('dimDescription', '');
    setValue('dimQuestion', '');
    setValue('dimOutputType', 'list');
    setValue('dimKeywords', '');
    renderSectionPolicyEditor(null);
    renderCurrentDimensionFeedback();
    return;
  }
  setValue('dimId', dim.dimension_id);
  setValue('dimName', dim.name);
  setValue('dimDescription', dim.description);
  setValue('dimQuestion', dim.question);
  setValue('dimOutputType', dim.output_type || 'list');
  setValue('dimKeywords', joinLines(dim.retrieval_keywords));
  setChecked('dimRequired', dim.required);
  setChecked('dimRequiredEvidence', dim.requires_evidence);
  setChecked('dimAllowInference', dim.allow_inference);
  renderSectionPolicyEditor(dim);
  renderCurrentDimensionFeedback();
}

function saveCurrentDimensionForm() {
  const dim = currentObjectDimension();
  if (!dim || !$('dimId')) return;
  dim.dimension_id = $('dimId').value.trim();
  dim.name = $('dimName').value.trim();
  dim.description = $('dimDescription').value.trim();
  dim.question = $('dimQuestion').value.trim();
  dim.output_type = $('dimOutputType').value;
  dim.retrieval_keywords = lines($('dimKeywords').value);
  dim.section_policy = readSectionPolicyEditor(dim);
  dim.required = $('dimRequired').checked;
  dim.requires_evidence = $('dimRequiredEvidence').checked;
  dim.allow_inference = $('dimAllowInference').checked;
}

function feedbackPercent(value) {
  const n = Number(value);
  return `${Math.round((Number.isFinite(n) ? n : 0) * 100)}%`;
}

function feedbackCountEntries(obj, limit = 6) {
  return Object.entries(obj || {})
    .filter(([key, count]) => key && Number(count) > 0)
    .sort((a, b) => Number(b[1]) - Number(a[1]))
    .slice(0, limit);
}

function feedbackLookupLabel(value, options) {
  const item = (options || []).find(option => option.value === value);
  return item?.label || value || '';
}

function feedbackTargetLevelLabel(value) {
  return ({
    dimension: '缁村害',
    prompt: 'Prompt',
    object_definition: '瀵硅薄瀹氫箟',
    result: '缁撴灉',
  })[value] || value || '妯℃澘';
}

function findCurrentDimensionFeedbackPool(dim = currentObjectDimension()) {
  if (!dim) return null;
  const profile = state.objectConfig?.object_definition || {};
  const profileId = profile.profile_id || '';
  const version = profile.version || '';
  const dimensionKeys = new Set([dim.dimension_id, dim.name].filter(Boolean));
  const pools = (state.reviewFeedback?.dimension_pools || []).filter(pool => {
    if (profileId && pool.profile_id !== profileId) return false;
    return dimensionKeys.has(pool.dimension_id) || dimensionKeys.has(pool.dimension_name);
  });
  return pools.find(pool => pool.profile_version === version && pool.dimension_id === dim.dimension_id)
    || pools.find(pool => pool.dimension_id === dim.dimension_id)
    || pools.find(pool => pool.profile_version === version)
    || pools[0]
    || null;
}

function renderFeedbackTagRows(entries, options = []) {
  if (!entries.length) return '<p class="muted">鏆傛棤璁板綍銆?/p>';
  return `<div class="feedback-tag-row compact">${entries.map(([key, count]) => `
    <span title="${escapeHtml(key)}">${escapeHtml(feedbackLookupLabel(key, options))} <b>${escapeHtml(count)}</b></span>
  `).join('')}</div>`;
}

function renderCurrentDimensionFeedback() {
  const panel = $('dimensionFeedbackPanel');
  if (!panel) return;
  const scope = $('dimensionFeedbackScope');
  const dim = currentObjectDimension();
  if (!dim) {
    if (scope) scope.textContent = '鏈€夋嫨缁村害';
    panel.innerHTML = '<div class="dimension-feedback-empty"><b>鏆傛棤缁村害</b><p>閫夋嫨鎴栨柊澧炵淮搴﹀悗鏄剧ず鍙嶉姹囨€汇€?/p></div>';
    return;
  }

  const poolWrapper = findCurrentDimensionFeedbackPool(dim);
  const dimLabel = dim.name || dim.dimension_id || '褰撳墠缁村害';
  if (!poolWrapper) {
    if (scope) scope.textContent = `${dimLabel} 路 鏆傛棤瀹℃煡鍙嶉`;
    panel.innerHTML = `
      <div class="dimension-feedback-empty">
        <b>鏆傛棤鍙嶉璁板綍</b>
        <p>璇ョ淮搴﹀畬鎴愬鏌ュ悗锛岀粺璁′細鑷姩姹囨€诲埌杩欓噷銆?/p>
      </div>
    `;
    return;
  }

  const pool = poolWrapper.feedback_pool || {};
  const metrics = pool.metrics || {};
  const total = pool.total_reviews || 0;
  const candidates = pool.upgrade_candidates || [];
  const cases = pool.representative_cases || [];
  const edits = pool.common_user_edits || [];
  const tagRows = feedbackCountEntries(pool.common_error_tags, 8);
  const rootRows = feedbackCountEntries(pool.common_root_causes, 6);
  const targetRows = feedbackCountEntries(pool.common_suggested_targets, 6);

  if (scope) {
    scope.textContent = `${poolWrapper.dimension_name || dimLabel} 路 v${poolWrapper.profile_version || state.objectConfig?.object_definition?.version || '-'} 路 ${total} 鏉″鏌;
  }

  panel.innerHTML = `
    <div class="dimension-feedback-counts">
      <div><b>${escapeHtml(total)}</b><span>瀹℃煡鎬绘暟</span></div>
      <div><b>${escapeHtml(pool.confirmed || 0)}</b><span>纭</span></div>
      <div><b>${escapeHtml(pool.revised || 0)}</b><span>淇敼</span></div>
      <div><b>${escapeHtml(pool.rejected || 0)}</b><span>椹冲洖</span></div>
    </div>
    <div class="dimension-feedback-metrics">
      <div class="good"><span>纭鐜?/span><b>${feedbackPercent(metrics.confirm_rate)}</b></div>
      <div><span>淇敼鐜?/span><b>${feedbackPercent(metrics.revise_rate)}</b></div>
      <div class="warn"><span>椹冲洖鐜?/span><b>${feedbackPercent(metrics.reject_rate)}</b></div>
      <div class="warn"><span>璇佹嵁闂</span><b>${feedbackPercent(metrics.evidence_issue_rate)}</b></div>
      <div class="warn"><span>杩囧害鎺ㄦ柇</span><b>${feedbackPercent(metrics.over_inference_rate)}</b></div>
      <div><span>鏈姤鍛婁慨姝?/span><b>${feedbackPercent(metrics.not_reported_correction_rate)}</b></div>
      <div><span>缁村害閿欒</span><b>${feedbackPercent(metrics.wrong_dimension_rate)}</b></div>
      <div><span>骞冲潎淇敼骞呭害</span><b>${escapeHtml(metrics.average_edit_distance || 0)}</b></div>
    </div>
    <div class="dimension-feedback-grid">
      <section>
        <h4>楂橀閿欒鏍囩</h4>
        ${renderFeedbackTagRows(tagRows, REVIEW_ERROR_TAGS)}
      </section>
      <section>
        <h4>鏍瑰洜褰掑洜</h4>
        ${renderFeedbackTagRows(rootRows, REVIEW_ROOT_CAUSES)}
      </section>
      <section>
        <h4>寤鸿鍗囩骇浣嶇疆</h4>
        ${renderFeedbackTagRows(targetRows, REVIEW_SUGGESTED_TARGETS)}
      </section>
    </div>
    <section class="dimension-feedback-block">
      <h4>鍗囩骇鍊欓€?/h4>
      <div class="dimension-upgrade-list">
        ${candidates.slice(0, 4).map(item => `
          <article>
            <header>
              <b>${escapeHtml(item.title || '妯℃澘鍗囩骇寤鸿')}</b>
              <span>${escapeHtml(feedbackTargetLevelLabel(item.target_level))} 路 ${escapeHtml(item.suggested_target || '')}</span>
            </header>
            <p>${escapeHtml(item.recommended_change || item.reason || '')}</p>
            ${item.reason ? `<small>${escapeHtml(item.reason)}</small>` : ''}
          </article>
        `).join('') || '<p class="muted">鏆傛棤鏄庢樉鍗囩骇鍊欓€夈€?/p>'}
      </div>
    </section>
    <details class="dimension-feedback-details">
      <summary>浠ｈ〃鎬у弽棣堜笌浜哄伐淇</summary>
      <div class="dimension-feedback-case-list">
        ${cases.slice(0, 4).map(item => `
          <article>
            <b>${escapeHtml(reviewStatusLabel(item.review_action))}</b>
            <p>${escapeHtml(item.review_comment || (item.error_tags || []).map(tag => feedbackLookupLabel(tag, REVIEW_ERROR_TAGS)).join('銆?) || '鏃犺ˉ鍏呰鏄?)}</p>
            ${(item.error_tags || []).length ? `<span>${escapeHtml(item.error_tags.map(tag => feedbackLookupLabel(tag, REVIEW_ERROR_TAGS)).join('銆?))}</span>` : ''}
          </article>
        `).join('') || '<p class="muted">鏆傛棤浠ｈ〃鎬у弽棣堛€?/p>'}
        ${edits.slice(0, 3).map(item => `
          <article>
            <b>浜哄伐淇</b>
            <p>${escapeHtml(fmt(item.new_answer || item.comment || '', 180))}</p>
            ${item.old_answer ? `<span>鍘熺瓟妗堬細${escapeHtml(fmt(item.old_answer, 120))}</span>` : ''}
          </article>
        `).join('')}
      </div>
    </details>
  `;
}

async function refreshDimensionFeedback() {
  state.reviewFeedback = await api('/api/feedback/dimensions');
  renderCurrentDimensionFeedback();
  toast('缁村害鍙嶉宸插埛鏂?);
}

function addObjectDimension() {
  collectObjectConfigFromForm();
  const next = (state.objectConfig.dimensions || []).length + 1;
  state.objectConfig.dimensions.push({
    dimension_id: `dimension_${next}`,
    name: `缁村害 ${next}`,
    output_type: 'structured_object',
    description: '',
    question: '',
    fields: [],
    retrieval_keywords: [],
    section_policy: normalizeSectionPolicy({}, {dimension_id: `dimension_${next}`, name: `缁村害 ${next}`}),
    required: false,
    requires_evidence: true,
    allow_inference: true,
  });
  state.objectDimensionIndex = state.objectConfig.dimensions.length - 1;
  renderObjectConfigForm();
}

function removeObjectDimension() {
  if (!state.objectConfig?.dimensions?.length) return;
  state.objectConfig.dimensions.splice(state.objectDimensionIndex, 1);
  state.objectDimensionIndex = Math.max(0, state.objectDimensionIndex - 1);
  renderObjectConfigForm();
}

function renderObjectPreview() {
  collectObjectConfigFromForm();
  const cfg = state.objectConfig;
  ensurePromptManagerState(cfg);
  $('objectConfigJson').textContent = JSON.stringify(buildManagedConfigPreview(cfg), null, 2);
  renderPromptManager();
  renderObjectWorkbenchStatus(cfg);
  renderObjectAdvisor(cfg);
}

function renderObjectWorkbenchStatus(cfg) {
  const obj = cfg.object_definition || {};
  const activePrompt = activePromptProfile(cfg);
  renderObjectOverviewStats(cfg);
  $('publishCheckName').textContent = obj.display_name || '-';
  $('publishCheckDimensions').textContent = String((cfg.dimensions || []).length);
  $('publishCheckPrompt').textContent = activePrompt?.name || '-';
}

function renderObjectOverviewStats(cfg = state.objectConfig) {
  if (!cfg || !$('objectSummaryName')) return;
  const obj = cfg.object_definition || {};
  const dims = Array.isArray(cfg.dimensions) ? cfg.dimensions : [];
  const modeling = ensureModelingState(cfg);
  const examples = [
    ...(modeling.boundary_examples.positive_examples || []),
    ...(modeling.boundary_examples.negative_examples || []),
  ];
  const prompts = Array.isArray(cfg.prompts?.items) ? cfg.prompts.items : [];
  $('objectSummaryName').textContent = obj.display_name || '-';
  $('objectSummaryDimensions').textContent = `${dims.length}/${dims.length}`;
  $('objectSummaryExamples').textContent = String(examples.length);
  $('objectSummaryPrompts').textContent = String(prompts.length);
}

function renderObjectAdvisor(cfg) {
  if (!$('objectAdvisorList')) return;
  const suggestions = state.objectAdvisorSuggestions || [];
  const pending = suggestions.filter(item => item.status !== 'applied');
  if ($('objectAdvisorStatus')) {
    if (!state.objectAdvisorGeneratedAt) {
      $('objectAdvisorStatus').textContent = '鐐瑰嚮鐢熸垚寤鸿鍚庯紝灏嗘牴鎹綋鍓嶉厤缃粰鍑哄彲搴旂敤鐨勪慨鏀归」銆?;
    } else if (suggestions.length) {
      $('objectAdvisorStatus').textContent = `鏈疆鐢熸垚 ${suggestions.length} 鏉″缓璁紝寰呭鐞?${pending.length} 鏉°€俙;
    } else {
      $('objectAdvisorStatus').textContent = '褰撳墠娌℃湁鏂扮殑寤鸿銆傚彲浠ョ户缁ˉ鍏呭璞″畾涔夈€佹鍙嶄緥鎴栬瘯鎶界粨鏋滃悗鍐嶇敓鎴愩€?;
    }
  }
  if (!state.objectAdvisorGeneratedAt) {
    $('objectAdvisorList').innerHTML = '<div class="advisor-empty">寤鸿浼氬洿缁曞璞″畾涔夈€佽竟鐣岃鍒欍€佹娊鍙栫淮搴︺€丳rompt 鍜岃瘯鎶借瘖鏂敓鎴愩€?/div>';
    return;
  }
  if (!suggestions.length) {
    $('objectAdvisorList').innerHTML = '<div class="advisor-empty">鏈疆寤鸿宸插鐞嗗畬锛屾垨鑰呭綋鍓嶉厤缃殏鏈彂鐜版槑鏄剧己鍙ｃ€?/div>';
    return;
  }
  $('objectAdvisorList').innerHTML = suggestions.map(item => {
    const expanded = Boolean(state.objectAdvisorExpanded[item.id]);
    const applied = item.status === 'applied';
    return `
      <article class="advisor-item ${applied ? 'applied' : ''}">
        <button class="advisor-item-main" type="button" data-advisor-toggle="${escapeHtml(item.id)}" aria-expanded="${expanded ? 'true' : 'false'}">
          <span class="advisor-type">${escapeHtml(item.typeLabel)}</span>
          <b>${escapeHtml(item.title)}</b>
          <p>${escapeHtml(item.summary)}</p>
        </button>
        ${expanded ? `
          <div class="advisor-detail">
            <p>${escapeHtml(item.detail)}</p>
            ${item.proposed ? `<div class="advisor-proposed">${escapeHtml(item.proposed)}</div>` : ''}
          </div>
        ` : ''}
        <div class="advisor-actions">
          <button type="button" data-advisor-apply="${escapeHtml(item.id)}" ${applied ? 'disabled' : ''}>${applied ? '宸插簲鐢? : '搴旂敤'}</button>
          <button type="button" data-advisor-ignore="${escapeHtml(item.id)}" ${applied ? 'disabled' : ''}>蹇界暐</button>
        </div>
      </article>
    `;
  }).join('');
  document.querySelectorAll('[data-advisor-toggle]').forEach(btn => {
    btn.onclick = () => toggleObjectAdvisorSuggestion(btn.dataset.advisorToggle);
  });
  document.querySelectorAll('[data-advisor-apply]').forEach(btn => {
    btn.onclick = () => applyObjectAdvisorSuggestion(btn.dataset.advisorApply);
  });
  document.querySelectorAll('[data-advisor-ignore]').forEach(btn => {
    btn.onclick = () => ignoreObjectAdvisorSuggestion(btn.dataset.advisorIgnore);
  });
}

function ensureObjectConceptPolicy(cfg = state.objectConfig) {
  if (!cfg.term_rules) cfg.term_rules = {};
  if (!cfg.term_rules.concept_policy) cfg.term_rules.concept_policy = {};
  const concept = cfg.term_rules.concept_policy;
  if (!Array.isArray(concept.include_terms)) concept.include_terms = [];
  if (!Array.isArray(concept.exclude_rules)) concept.exclude_rules = [];
  if (!cfg.term_rules.decision_criteria) cfg.term_rules.decision_criteria = '';
  return concept;
}

function objectAdvisorName(cfg = state.objectConfig) {
  return cfg?.object_definition?.display_name?.trim() || cfg?.modeling?.research_intent?.object_name?.trim() || '璇ョ爺绌跺璞?;
}

function appendUniqueLine(items, line) {
  const next = String(line || '').trim();
  if (!next) return items || [];
  const existing = items || [];
  return existing.some(item => item.trim() === next) ? existing : [...existing, next];
}

function mergeParagraph(existing, addition) {
  const base = String(existing || '').trim();
  const next = String(addition || '').trim();
  if (!next) return base;
  if (!base) return next;
  return base.includes(next) ? base : `${base}\n${next}`;
}

function objectAdvisorSuggestion(id, typeLabel, title, summary, detail, proposed, action) {
  return {id, typeLabel, title, summary, detail, proposed, action, status: 'pending'};
}

function objectAdvisorCorpusText(cfg) {
  const modeling = ensureModelingState(cfg);
  const examples = [
    ...(modeling.boundary_examples.positive_examples || []),
    ...(modeling.boundary_examples.negative_examples || []),
    ...(modeling.boundary_examples.uncertain_examples || []),
  ].map(item => `${item.text || ''}\n${item.reason || ''}`).join('\n');
  return [
    cfg.object_definition?.description || '',
    cfg.term_rules?.concept_policy?.working_definition || '',
    $('simulationInput')?.value || '',
    state.simulationRawResult || '',
    examples,
  ].join('\n');
}

function buildObjectAdvisorSuggestions(cfg = state.objectConfig) {
  if (!cfg) return [];
  const obj = cfg.object_definition || {};
  const modeling = ensureModelingState(cfg);
  const concept = ensureObjectConceptPolicy(cfg);
  ensurePromptManagerState(cfg);
  const name = objectAdvisorName(cfg);
  const intent = modeling.research_intent?.research_intent || obj.description || '';
  const dims = Array.isArray(cfg.dimensions) ? cfg.dimensions : [];
  const activePrompt = activePromptProfile(cfg);
  const promptText = activePrompt?.content?.trim() || '';
  const corpusText = objectAdvisorCorpusText(cfg);
  const lowerCorpus = corpusText.toLowerCase();
  const suggestions = [];

  if ((obj.display_name || intent) && !concept.working_definition?.trim()) {
    suggestions.push(objectAdvisorSuggestion(
      'definition:working-definition',
      '瀵硅薄瀹氫箟寤鸿',
      '寤鸿琛ュ厖宸ヤ綔瀹氫箟',
      `灏嗏€?{name}鈥濆畾涔夋竻妤氾紝鍑忓皯鎶藉彇鏃跺拰鐩搁偦姒傚康娣锋穯銆俙,
      '褰撳墠宸茬粡鏈夊璞″悕绉版垨鐮旂┒鎰忓浘锛屼絾宸ヤ綔瀹氫箟涓虹┖銆傚缓璁湪瀹氫箟涓槑纭潵婧愩€佸舰鎴愭柟寮忋€佷娇鐢ㄤ綔鐢ㄤ笁涓绱犮€?,
      `${name}鏄寚璁烘枃涓粠鍘嗗彶浠诲姟銆佷氦浜掕建杩广€佹垚鍔?澶辫触妗堜緥銆佺幆澧冨弽棣堛€佷笓瀹剁ず鑼冦€佺敤鎴峰弽棣堟垨妯″瀷鍙嶆€濅腑鎬荤粨鍑烘潵锛屽苟鍙敤浜庢寚瀵煎悗缁鍒掋€佽鍔ㄩ€夋嫨銆佸喅绛栦紭鍖栥€侀敊璇閬挎垨绛栫暐鏀硅繘鐨勭粡楠屾€т俊鎭€俙,
      {type: 'set_working_definition'}
    ));
  }
  if ((obj.display_name || intent) && !(modeling.boundary_rules.include_rules || []).length) {
    suggestions.push(objectAdvisorSuggestion(
      'definition:include-rule',
      '瀵硅薄瀹氫箟寤鸿',
      '寤鸿琛ュ厖绾冲叆鏍囧噯',
      '鎶娾€滀粈涔堢畻璇ュ璞♀€濆啓鎴愬彲鎵ц瑙勫垯锛屽悗缁?Prompt 浼氭洿绋冲畾銆?,
      '绾冲叆鏍囧噯閫傚悎鎻忚堪瀵硅薄蹇呴』鍏峰鐨勬潵婧愩€佸舰鎴愯繃绋嬪拰浣跨敤浣滅敤銆傜郴缁熶細鎶婅繖鏉¤鍒欏悓姝ュ埌杈圭晫瑙勫垯鍖恒€?,
      `鏉ヨ嚜鍘嗗彶浠诲姟銆佷氦浜掕建杩广€佸弽棣堛€佹渚嬨€佺ず鑼冩垨鍙嶆€濓紝骞惰杩涗竴姝ユ€荤粨涓哄彲鎸囧鍚庣画瑙勫垝銆佸喅绛栥€佺敓鎴愭垨琛屽姩閫夋嫨鐨勫唴瀹癸紝搴旇涓?{name}銆俙,
      {type: 'append_include_rule'}
    ));
  }
  if ((obj.display_name || intent) && !concept.exclude_rules?.length) {
    suggestions.push(objectAdvisorSuggestion(
      'definition:exclude-rule',
      '瀵硅薄瀹氫箟寤鸿',
      '寤鸿琛ュ厖鎺掗櫎鏍囧噯',
      '鍏堟帓闄ゆ渶瀹规槗璇娊鐨勮儗鏅煡璇嗐€乺elated work 鍜屽崟绾疄楠岀粨鏋溿€?,
      '鎺掗櫎鏍囧噯浼氬悓鏃跺啓鍏ユ湳璇鍒欏拰杈圭晫瑙勫垯锛屽府鍔╁悗缁瘯鎶芥椂鏀剁獎杈圭晫銆?,
      `浠呬綔涓鸿儗鏅煡璇嗐€乺elated work 鎴栧崟绾疄楠岀粨鏋滃嚭鐜帮紝涓旀湭琚€荤粨銆佹绱€佸鐢ㄦ垨褰卞搷鍚庣画鍐崇瓥鐨勫唴瀹癸紝涓嶅簲鐩存帴瑙嗕负${name}銆俙,
      {type: 'append_exclude_rule'}
    ));
  }
  if ((obj.display_name || intent) && !cfg.term_rules?.decision_criteria?.trim()) {
    suggestions.push(objectAdvisorSuggestion(
      'definition:observation-signal',
      '瀵硅薄瀹氫箟寤鸿',
      '寤鸿琛ュ厖瑙傚療淇″彿',
      '鍛婅瘔绯荤粺鍦ㄨ鏂囦腑鐪嬪摢浜涗俊鍙凤紝鑳芥彁鍗囧璞″垽瀹氱殑涓€鑷存€с€?,
      '瑙傚療淇″彿涓嶆槸鎶藉彇缁撴灉鏈韩锛岃€屾槸鍒ゆ柇鏌愭鍐呭鏄惁灞炰簬璇ョ爺绌跺璞℃椂搴斾紭鍏堟鏌ョ殑璇佹嵁绾跨储銆?,
      `浼樺厛瑙傚療璁烘枃鏄惁鏄庣‘浜や唬${name}鐨勬潵婧愩€佸舰鎴?鎶藉彇杩囩▼銆佽〃绀哄舰寮忋€佷娇鐢ㄤ綅缃€佹晥鏋滈獙璇佸拰閫傜敤杈圭晫銆俙,
      {type: 'set_decision_criteria'}
    ));
  }

  const allExamples = allBoundaryExamples();
  const positiveExamples = allExamples.filter(item => item.type === 'positive_example');
  const negativeOrUncertain = allExamples.filter(item => item.type !== 'positive_example');
  const boundaryText = negativeOrUncertain.map(item => `${item.text || ''}\n${item.reason || ''}`).join('\n');
  const excludeRuleText = [
    ...(concept.exclude_rules || []),
    ...(modeling.boundary_rules.exclude_rules || []),
  ].join('\n');
  if (positiveExamples.length && !(modeling.boundary_rules.include_rules || []).length) {
    suggestions.push(objectAdvisorSuggestion(
      'boundary:positive-summary',
      '杈圭晫瑙勫垯寤鸿',
      '寤鸿浠庢渚嬫€荤粨绾冲叆瑙勫垯',
      `宸叉湁 ${positiveExamples.length} 鏉℃渚嬶紝鍙互娌夋穩鎴愯竟鐣岃鍒欍€俙,
      '姝ｄ緥涓殑鍏卞悓鐐瑰簲璇ュ彉鎴愬彲澶嶇敤瑙勫垯锛岃€屼笉鏄彧鍋滅暀鍦ㄦ牱渚嬪眰闈€?,
      `褰撹鏂囨槑纭鏄庢煇绫荤粡楠屾潵鑷换鍔¤繃绋嬨€佸弽棣堛€佹渚嬫垨鍙嶆€濓紝骞惰鐢ㄤ簬鍚庣画瑙勫垝銆佽鍔ㄩ€夋嫨鎴栭敊璇閬挎椂锛屽簲绾冲叆${name}銆俙,
      {type: 'append_include_rule'}
    ));
  }
  if (/鍘嗗彶杞ㄨ抗|杞ㄨ抗|trajectory|trace|log|interaction history|history/i.test(boundaryText) && !/浠呬繚瀛樺巻鍙茶建杩箌淇濆瓨鍘嗗彶杞ㄨ抗/.test(excludeRuleText)) {
    suggestions.push(objectAdvisorSuggestion(
      'boundary:history-trace-exclusion',
      '杈圭晫瑙勫垯寤鸿',
      '寤鸿鏂板鎺掗櫎瑙勫垯',
      '鈥滃彧淇濆瓨鍘嗗彶杞ㄨ抗鈥濆鏄撹璇垽涓虹瓥鐣ョ粡楠岋紝寤鸿鏄庣‘鎺掗櫎鏉′欢銆?,
      '濡傛灉杞ㄨ抗娌℃湁琚繘涓€姝ユ€荤粨銆佹绱€佸鐢ㄦ垨褰卞搷鍚庣画鍐崇瓥锛屽畠鏇村儚鍘熷鏉愭枡锛岃€屼笉鏄凡缁忓舰鎴愮殑缁忛獙鎬у璞°€?,
      `浠呬繚瀛樺巻鍙茶建杩逛絾鏈鏄庡叾琚€荤粨銆佹绱€佸鐢ㄦ垨褰卞搷鍚庣画鍐崇瓥鐨勫唴瀹癸紝涓嶅簲鐩存帴瑙嗕负${name}銆俙,
      {type: 'append_exclude_rule'}
    ));
  }

  const hasUpdateDimension = dims.some(dim => /鏇存柊|杩唬|refine|revision|update|improvement/i.test(`${dim.dimension_id} ${dim.name} ${dim.question} ${dim.description}`));
  const updateSignals = /experience refinement|memory update|reflection update|policy update|update|refinement|鏇存柊|杩唬|淇|浼樺寲/.test(lowerCorpus);
  if (!hasUpdateDimension && (updateSignals || /绛栫暐缁忛獙/.test(name))) {
    suggestions.push(objectAdvisorSuggestion(
      'dimension:update-method',
      '鎶藉彇缁村害寤鸿',
      `寤鸿鏂板缁村害锛?{name}鏇存柊鏂瑰紡`,
      '褰撳墠閰嶇疆鍙兘娌℃湁瑕嗙洊缁忛獙濡備綍琚洿鏂般€佷慨璁㈡垨杩唬銆?,
      '姝ｄ緥銆佸€欓€夋钀芥垨璇曟娊鏂囨湰涓嚭鐜?experience refinement銆乵emory update銆乺eflection update 绛変俊鍙锋椂锛屽缓璁妸鈥滄洿鏂版柟寮忊€濅綔涓虹嫭绔嬬淮搴︺€?,
      `鏂板缁村害锛?{name}鏇存柊鏂瑰紡\n鎶藉彇闂锛氳鏂囨槸鍚﹁鏄?{name}濡備綍琚洿鏂般€佷慨璁€佽凯浠ｆ垨鏇挎崲锛熻Е鍙戞潯浠躲€佹洿鏂版潵婧愬拰鏇存柊缁撴灉鏄粈涔堬紵`,
      {type: 'add_dimension_update'}
    ));
  }

  const missingPromptDims = promptText
    ? dims.filter(dim => dim.name && !promptText.includes(dim.name) && !promptText.includes(dim.dimension_id || ''))
    : dims;
  if (!promptText.trim()) {
    suggestions.push(objectAdvisorSuggestion(
      'prompt:create-active',
      'Prompt 浼樺寲寤鸿',
      '寤鸿鐢熸垚婵€娲?Prompt',
      '褰撳墠婵€娲?Prompt 涓虹┖锛岃瘯鎶藉拰鎵归噺鎶藉彇閮界己灏戠ǔ瀹氫换鍔℃寚浠ゃ€?,
      '绯荤粺浼氬熀浜庡綋鍓嶅璞″畾涔夈€佺淮搴﹀拰璇佹嵁瑕佹眰閲嶆柊鐢熸垚 Prompt锛屽苟鍐欏叆褰撳墠婵€娲?Prompt銆?,
      '閲嶆柊鐢熸垚褰撳墠婵€娲?Prompt銆?,
      {type: 'regenerate_prompt'}
    ));
  } else if (missingPromptDims.length) {
    suggestions.push(objectAdvisorSuggestion(
      'prompt:sync-dimensions',
      'Prompt 浼樺寲寤鸿',
      '褰撳墠 Prompt 鏈鐩栨渶鏂扮淮搴?,
      `鍙戠幇 ${missingPromptDims.length} 涓淮搴﹀彲鑳芥病鏈夊啓鍏ュ綋鍓?Prompt銆俙,
      '褰撳璞″畾涔夋垨缁村害鏇存柊鍚庯紝鏃?Prompt 鍙兘浠嶆寜鏃фā鏉挎娊鍙栥€傚缓璁噸鏂扮敓鎴愭垨鎵嬪姩琛ュ厖銆?,
      `缂哄け缁村害锛?{missingPromptDims.map(dim => dim.name || dim.dimension_id).join('銆?)}`,
      {type: 'regenerate_prompt'}
    ));
  }
  const evaluationDim = dims.find(dim => /鏁堟灉|楠岃瘉|evaluation|experiment/i.test(`${dim.name} ${dim.dimension_id}`));
  if (evaluationDim && !/Experiment|Results|Ablation|瀹為獙|缁撴灉|娑堣瀺/i.test(promptText)) {
    suggestions.push(objectAdvisorSuggestion(
      'prompt:evaluation-evidence',
      'Prompt 浼樺寲寤鸿',
      '寤鸿寮哄寲鏁堟灉楠岃瘉璇佹嵁鏉ユ簮',
      '鏁堟灉楠岃瘉缁村害搴斾紭鍏堜娇鐢ㄥ疄楠屻€佺粨鏋滃拰娑堣瀺璇佹嵁锛岄伩鍏嶅彧寮曠敤鎬荤粨鎬ц〃杩般€?,
      '杩欐潯寤鸿浼氳拷鍔犲埌褰撳墠婵€娲?Prompt锛屾彁閱掓ā鍨嬩笉瑕佹妸 Conclusion 涓殑瀹芥硾 claim 鐩存帴褰撴垚瀹為獙璇佹嵁銆?,
      '鏁堟灉楠岃瘉缁村害浼樺厛浣跨敤 Experiment銆丷esults銆丄blation Study 涓殑璇佹嵁锛涗笉瑕佹妸 Conclusion 涓殑鎬荤粨鎬ц〃杩扮洿鎺ュ綋鎴愬疄楠岃瘉鎹€?,
      {type: 'append_prompt_note'}
    ));
  }

  if (
    state.simulationRawResult
    && /瀹為獙缁撴灉|缁撴灉鎻愬崌|鎻愬崌|performance|accuracy|score|improvement/i.test(state.simulationRawResult)
    && !/鍗曠函瀹為獙缁撴灉/.test(excludeRuleText)
  ) {
    suggestions.push(objectAdvisorSuggestion(
      'simulation:broad-boundary',
      '璇曟娊璇婃柇寤鸿',
      '璇婃柇锛氬彫鍥炶竟鐣屽亸瀹?,
      '璇曟娊缁撴灉涓彲鑳芥妸鈥滃疄楠岀粨鏋滄彁鍗団€濆綋鎴愪簡鐮旂┒瀵硅薄銆?,
      '濡傛灉妯″瀷鎶婂崟绾€ц兘鎻愬崌鎶芥垚绛栫暐缁忛獙锛岃鏄庢帓闄よ鍒欒繕涓嶅寮猴紝闇€瑕佹槑纭€滃疄楠岀粨鏋溾€濆拰鈥滃彲澶嶇敤缁忛獙瑙勫垯鈥濈殑鍖哄埆銆?,
      `涓嶅皢鍗曠函瀹為獙缁撴灉瑙嗕负${name}锛岄櫎闈炲疄楠岀粨鏋滆杩涗竴姝ユ€荤粨涓哄彲鎸囧鍚庣画浠诲姟鐨勮鍒欍€乴esson 鎴栫瓥鐣ャ€俙,
      {type: 'append_exclude_rule'}
    ));
  }

  return suggestions.filter(item => !state.objectAdvisorIgnored[item.id]);
}

function generateObjectAdvisorSuggestions(options = {}) {
  collectObjectConfigFromForm();
  const suggestions = buildObjectAdvisorSuggestions(state.objectConfig);
  state.objectAdvisorSuggestions = suggestions;
  state.objectAdvisorGeneratedAt = new Date().toISOString();
  renderObjectAdvisor(state.objectConfig);
  if (!options.silent) toast(suggestions.length ? `宸茬敓鎴?${suggestions.length} 鏉″缓璁甡 : '褰撳墠娌℃湁鍙戠幇鏂扮殑寤鸿');
}

function toggleObjectAdvisorSuggestion(id) {
  state.objectAdvisorExpanded[id] = !state.objectAdvisorExpanded[id];
  renderObjectAdvisor(state.objectConfig);
}

function ignoreObjectAdvisorSuggestion(id) {
  state.objectAdvisorIgnored[id] = true;
  state.objectAdvisorSuggestions = (state.objectAdvisorSuggestions || []).filter(item => item.id !== id);
  renderObjectAdvisor(state.objectConfig);
}

function addUpdateDimensionSuggestion(cfg) {
  const name = objectAdvisorName(cfg);
  const id = configIdFromName(`${name}_update_method`);
  if ((cfg.dimensions || []).some(dim => dim.dimension_id === id || dim.name === `${name}鏇存柊鏂瑰紡`)) return;
  cfg.dimensions.push({
    dimension_id: id,
    name: `${name}鏇存柊鏂瑰紡`,
    output_type: 'structured_object',
    description: `鎶藉彇璁烘枃鏄惁璇存槑${name}濡備綍琚洿鏂般€佷慨璁€佽凯浠ｆ垨鏇挎崲銆俙,
    question: `璁烘枃鏄惁璇存槑${name}濡備綍琚洿鏂般€佷慨璁€佽凯浠ｆ垨鏇挎崲锛熻Е鍙戞潯浠躲€佹洿鏂版潵婧愬拰鏇存柊缁撴灉鏄粈涔堬紵`,
    fields: [
      {name: 'update_trigger', type: 'long_text', description: '瑙﹀彂鏇存柊鐨勬潯浠舵垨浜嬩欢銆?},
      {name: 'update_source', type: 'long_text', description: '鏇存柊鎵€渚濇嵁鐨勬暟鎹€佸弽棣堛€佹渚嬫垨鍙嶆€濄€?},
      {name: 'update_process', type: 'method_step_list', description: '鏇存柊銆佷慨璁㈡垨杩唬鐨勮繃绋嬨€?},
      {name: 'updated_output', type: 'long_text', description: '鏇存柊鍚庣殑缁忛獙銆佽鍒欐垨绛栫暐褰㈠紡銆?},
    ],
    retrieval_keywords: ['update', 'refinement', 'reflection update', 'memory update', 'policy update', 'revision', '鏇存柊', '杩唬', '淇'],
    section_policy: normalizeSectionPolicy({}, {dimension_id: id, name: `${name}更新方式`, description: 'update refinement memory update'}),
    required: false,
    requires_evidence: true,
    allow_inference: true,
  });
  state.objectDimensionIndex = cfg.dimensions.length - 1;
}

function applyObjectAdvisorSuggestion(id) {
  const suggestion = (state.objectAdvisorSuggestions || []).find(item => item.id === id);
  if (!suggestion || suggestion.status === 'applied') return;
  collectObjectConfigFromForm();
  const cfg = state.objectConfig;
  const concept = ensureObjectConceptPolicy(cfg);
  const modeling = ensureModelingState(cfg);
  const proposed = suggestion.proposed || '';
  switch (suggestion.action?.type) {
    case 'set_working_definition':
      concept.working_definition = concept.working_definition?.trim()
        ? mergeParagraph(concept.working_definition, proposed)
        : proposed;
      break;
    case 'append_include_rule':
      modeling.boundary_rules.include_rules = appendUniqueLine(modeling.boundary_rules.include_rules, proposed);
      break;
    case 'append_exclude_rule':
      concept.exclude_rules = appendUniqueLine(concept.exclude_rules, proposed);
      modeling.boundary_rules.exclude_rules = appendUniqueLine(modeling.boundary_rules.exclude_rules, proposed);
      break;
    case 'set_decision_criteria':
      cfg.term_rules.decision_criteria = mergeParagraph(cfg.term_rules.decision_criteria, proposed);
      break;
    case 'add_dimension_update':
      addUpdateDimensionSuggestion(cfg);
      break;
    case 'regenerate_prompt': {
      ensurePromptManagerState(cfg);
      const active = activePromptProfile(cfg);
      active.content = buildObjectSystemPrompt(cfg);
      active.updated_at = new Date().toISOString();
      state.selectedPromptProfileId = active.id;
      state.selectedSimulationPromptId = active.id;
      state.objectPromptDirty = false;
      break;
    }
    case 'append_prompt_note': {
      ensurePromptManagerState(cfg);
      const active = activePromptProfile(cfg);
      active.content = mergeParagraph(active.content || buildObjectSystemPrompt(cfg), proposed);
      active.updated_at = new Date().toISOString();
      state.objectPromptDirty = false;
      break;
    }
  }
  suggestion.status = 'applied';
  renderObjectConfigForm();
  toast('寤鸿宸插簲鐢?);
}

function openPromptPreviewModal() {
  collectObjectConfigFromForm();
  $('promptPreviewModalText').textContent = currentObjectPrompt();
  $('promptPreviewModal').hidden = false;
  document.body.classList.add('modal-open');
}

function closePromptPreviewModal() {
  $('promptPreviewModal').hidden = true;
  syncModalLock();
}

function buildObjectPromptPreview(cfg) {
  const prompt = activePromptProfile(cfg);
  return prompt?.content?.trim() || buildObjectSystemPrompt(cfg);
}

function ensurePromptManagerState(cfg) {
  if (!cfg.prompts) cfg.prompts = {active_id: '', items: []};
  if (!Array.isArray(cfg.prompts.items)) cfg.prompts.items = [];
  if (!cfg.prompts.items.length) {
    cfg.prompts.items.push({
      id: 'prompt_default',
      name: '榛樿 Prompt',
      content: '',
      created_at: '',
      updated_at: '',
    });
  }
  if (!cfg.prompts.items.some(item => item.id === cfg.prompts.active_id)) {
    cfg.prompts.active_id = cfg.prompts.items[0].id;
  }
  if (!state.selectedPromptProfileId || !cfg.prompts.items.some(item => item.id === state.selectedPromptProfileId)) {
    state.selectedPromptProfileId = cfg.prompts.active_id;
  }
}

function selectedPromptProfile(cfg = state.objectConfig) {
  ensurePromptManagerState(cfg);
  return cfg.prompts.items.find(item => item.id === state.selectedPromptProfileId) || cfg.prompts.items[0];
}

function activePromptProfile(cfg = state.objectConfig) {
  ensurePromptManagerState(cfg);
  return cfg.prompts.items.find(item => item.id === cfg.prompts.active_id) || cfg.prompts.items[0];
}

function renderPromptManager() {
  const cfg = state.objectConfig;
  if (!$('promptProfilePicker') || !cfg) return;
  ensurePromptManagerState(cfg);
  const selected = selectedPromptProfile(cfg);
  $('promptPickerLabel').textContent = selected.name || '閫夋嫨 Prompt';
  $('promptPickerMenu').innerHTML = cfg.prompts.items.map(item => `
    <div class="prompt-picker-item ${item.id === selected.id ? 'selected' : ''} ${item.id === cfg.prompts.active_id ? 'active' : ''}"
      data-prompt-id="${escapeHtml(item.id)}"
      role="option"
      aria-selected="${item.id === selected.id ? 'true' : 'false'}"
      tabindex="0">
      <label class="prompt-picker-active" title="璁句负婵€娲?Prompt">
        <input type="checkbox" data-prompt-active-id="${escapeHtml(item.id)}" ${item.id === cfg.prompts.active_id ? 'checked' : ''} aria-label="璁句负婵€娲?Prompt锛?{escapeHtml(item.name)}" />
      </label>
      <span class="prompt-picker-name">${escapeHtml(item.name)}</span>
    </div>
  `).join('');
  $('promptPickerMenu').querySelectorAll('.prompt-picker-item').forEach(item => {
    item.onclick = (event) => {
      if (event.target.closest('.prompt-picker-active')) return;
      selectPromptProfile(item.dataset.promptId);
      closePromptPicker();
    };
    item.onkeydown = (event) => {
      if (event.key !== 'Enter' && event.key !== ' ') return;
      event.preventDefault();
      selectPromptProfile(item.dataset.promptId);
      closePromptPicker();
    };
  });
  $('promptPickerMenu').querySelectorAll('[data-prompt-active-id]').forEach(input => {
    input.onchange = () => setSelectedPromptActive(input.dataset.promptActiveId);
  });
  if (!state.objectPromptDirty) {
    setValue('objectPromptPreview', selected.content || buildObjectSystemPrompt(cfg));
  }
  renderSimulationPromptSelect();
}

function openPromptPicker() {
  $('promptPickerMenu').hidden = false;
  $('promptPickerToggle').setAttribute('aria-expanded', 'true');
}

function closePromptPicker() {
  if (!$('promptPickerMenu')) return;
  $('promptPickerMenu').hidden = true;
  $('promptPickerToggle').setAttribute('aria-expanded', 'false');
}

function togglePromptPicker(event) {
  event.stopPropagation();
  if ($('promptPickerMenu').hidden) openPromptPicker();
  else closePromptPicker();
}

function renderSimulationPromptSelect() {
  const cfg = state.objectConfig;
  if (!$('simulationPromptSelect') || !cfg) return;
  ensurePromptManagerState(cfg);
  if (!state.selectedSimulationPromptId || !cfg.prompts.items.some(item => item.id === state.selectedSimulationPromptId)) {
    state.selectedSimulationPromptId = cfg.prompts.active_id;
  }
  $('simulationPromptSelect').innerHTML = cfg.prompts.items.map(item => `
    <option value="${escapeHtml(item.id)}">${escapeHtml(item.name)}${item.id === cfg.prompts.active_id ? '锛堟縺娲伙級' : ''}</option>
  `).join('');
  $('simulationPromptSelect').value = state.selectedSimulationPromptId;
}

function selectedSimulationPromptProfile(cfg = state.objectConfig) {
  ensurePromptManagerState(cfg);
  return cfg.prompts.items.find(item => item.id === state.selectedSimulationPromptId)
    || activePromptProfile(cfg)
    || cfg.prompts.items[0];
}

function selectedSimulationPromptContent(cfg = state.objectConfig) {
  const selected = selectedSimulationPromptProfile(cfg);
  if ($('objectPromptPreview') && state.objectPromptDirty && selected.id === state.selectedPromptProfileId) {
    return $('objectPromptPreview').value.trim() || buildObjectSystemPrompt(cfg);
  }
  return selected.content?.trim() || buildObjectSystemPrompt(cfg);
}

function selectSimulationPrompt() {
  state.selectedSimulationPromptId = $('simulationPromptSelect').value;
}

function selectPromptProfile(promptId) {
  saveSelectedPromptDraft();
  if (!state.objectConfig?.prompts?.items?.some(item => item.id === promptId)) return;
  state.selectedPromptProfileId = promptId;
  state.objectPromptDirty = false;
  renderPromptManager();
}

function setSelectedPromptActive(promptId) {
  const cfg = state.objectConfig;
  saveSelectedPromptDraft();
  if (!cfg?.prompts?.items?.some(item => item.id === promptId)) return;
  cfg.prompts.active_id = promptId;
  state.selectedPromptProfileId = promptId;
  state.selectedSimulationPromptId = promptId;
  state.objectPromptDirty = false;
  renderPromptManager();
  renderObjectPreview();
  toast('宸茶涓哄綋鍓嶆縺娲?Prompt');
}

function saveSelectedPromptDraft() {
  const cfg = state.objectConfig;
  if (!cfg || !$('objectPromptPreview')) return;
  const selected = selectedPromptProfile(cfg);
  selected.content = $('objectPromptPreview').value.trim();
  selected.updated_at = new Date().toISOString();
}

function saveCurrentPrompt() {
  collectObjectConfigFromForm();
  saveSelectedPromptDraft();
  state.objectPromptDirty = false;
  renderObjectPreview();
  toast('褰撳墠 Prompt 宸蹭繚瀛樺埌閰嶇疆锛岀偣鍑讳繚瀛橀厤缃悗鍐欏叆妯℃澘');
}

function saveNewPrompt() {
  collectObjectConfigFromForm();
  const name = window.prompt('璇疯緭鍏ユ柊 Prompt 鍚嶇О');
  if (!name || !name.trim()) return;
  const now = new Date().toISOString();
  const newPrompt = {
    id: promptIdFromName(name),
    name: name.trim(),
    content: $('objectPromptPreview').value.trim() || buildObjectSystemPrompt(state.objectConfig),
    created_at: now,
    updated_at: now,
  };
  ensurePromptManagerState(state.objectConfig);
  state.objectConfig.prompts.items.push(newPrompt);
  state.objectConfig.prompts.active_id = newPrompt.id;
  state.selectedPromptProfileId = newPrompt.id;
  state.selectedSimulationPromptId = newPrompt.id;
  state.objectPromptDirty = false;
  renderObjectPreview();
  toast('鏂?Prompt 宸蹭繚瀛樺苟璁句负婵€娲?);
}

function currentObjectPrompt() {
  const active = activePromptProfile(state.objectConfig);
  if ($('objectPromptPreview') && state.objectPromptDirty && active.id === state.selectedPromptProfileId) {
    return $('objectPromptPreview').value.trim();
  }
  return active.content?.trim() || buildObjectSystemPrompt(state.objectConfig);
}

function buildSimulationPrompt(cfg, inputText, promptContent) {
  const obj = cfg.object_definition || {};
  const concept = cfg.term_rules?.concept_policy || {};
  const dim = currentObjectDimension() || cfg.dimensions[0] || {};
  const fields = (dim.fields || []).map(field => typeof field === 'string' ? field : field.name).filter(Boolean);
  const activePromptNote = promptContent?.trim()
    ? '褰撳墠娴嬭瘯浣跨敤鎵€閫?Prompt 鐨勪换鍔¤瀹氾紝浣嗕负浜嗛伩鍏嶆湰鍦版ā鍨嬩笂涓嬫枃杩囬暱锛屾ā鎷熷彧鍙戦€佸綋鍓嶇淮搴︾殑绱у噾鎶藉彇鎸囦护銆?
    : '';
  return [
    '浣犳槸涓ヨ皑鐨勭鐮旇鏂囦俊鎭娊鍙栧姪鎵嬨€傝涓ユ牸鍩轰簬鐢ㄦ埛鎻愪緵鐨勮鏂囩墖娈碉紝鍥寸粫鎸囧畾绉戠爺瀵硅薄鍜屽綋鍓嶇淮搴︽娊鍙栫粨鏋勫寲淇℃伅銆?,
    activePromptNote,
    '',
    '# 绉戠爺瀵硅薄',
    `- profile_id: ${obj.profile_id || ''}`,
    `- 鍚嶇О: ${obj.display_name || ''}`,
    `- 绫诲瀷: ${obj.object_type || ''}`,
    `- 璇存槑: ${obj.description || ''}`,
    concept.working_definition ? `- 宸ヤ綔瀹氫箟: ${concept.working_definition}` : '',
    '',
    '# 褰撳墠娴嬭瘯缁村害',
    `- dimension_id: ${dim.dimension_id || ''}`,
    `- 鍚嶇О: ${dim.name || dim.dimension_id || '鏈寚瀹?}`,
    `- 鎶藉彇闂: ${dim.question || dim.description || ''}`,
    `杈撳嚭绫诲瀷锛?{dim.output_type || 'list'}`,
    `瀛楁锛?{fields.join(', ') || '鏈寚瀹?}`,
    '',
    '# 璇佹嵁瑕佹眰',
    '- 姣忎釜闈?not_reported 鐨勭粨鏋滈兘灏介噺缁戝畾 quote銆乻ection銆乸age 鎴?chunk_id銆?,
    '- 鍖哄垎 author_explicit 涓?model_inferred銆?,
    '- 鏈姤鍛婄殑淇℃伅鏍囪 not_reported=true锛屼笉瑕佺紪閫犮€?,
    '',
    '# 杈撳嚭鏍煎紡',
    '璇峰彧杈撳嚭鍚堟硶 JSON锛屼笉瑕佽緭鍑?Markdown锛屼笉瑕佹坊鍔犻澶栬В閲娿€傝緭鍑虹粨鏋勫涓嬶細',
    JSON.stringify({
      profile_id: obj.profile_id || '',
      research_object: obj.display_name || '',
      object_presence: {
        exists: true,
        role_in_paper: 'core_contribution | method_component | auxiliary_component | evaluation_object | discussion_only | not_present',
        local_terms: [],
        judgement_reason: '',
        confidence: 'high | medium | low',
        evidence: [{quote: '', section: '', page: null, chunk_id: null}],
      },
      dimension_extractions: [{
        dimension_id: dim.dimension_id || '',
        dimension_name: dim.name || '',
        answer: fields.length ? Object.fromEntries(fields.map(name => [name, ''])) : '',
        not_reported: false,
        author_explicit: true,
        model_inferred: false,
        confidence: 'high | medium | low',
        evidence: [{quote: '', section: '', page: null, chunk_id: null, evidence_type: 'definition | method_description | experiment_result | discussion | other'}],
        notes: '',
      }],
      auto_tags: [],
      summary_for_review: '',
    }, null, 2),
    '',
    '娴嬭瘯鏂囨湰锛?,
    inputText,
  ].filter(Boolean).join('\n');
}

function insertRandomSimulationSample() {
  const index = Math.floor(Math.random() * SIMULATION_SAMPLE_TEXTS.length);
  $('simulationInput').value = SIMULATION_SAMPLE_TEXTS[index];
  $('simulationStatus').textContent = '宸叉彃鍏ラ缃嫳鏂囪鏂囨牱渚嬨€?;
}

function stripJsonFence(text) {
  let raw = String(text || '').trim();
  if (raw.startsWith('```')) {
    raw = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
  }
  return raw;
}

function parseSimulationJson(text) {
  const raw = stripJsonFence(text);
  try {
    return JSON.parse(raw);
  } catch (_) {
    const start = raw.indexOf('{');
    const end = raw.lastIndexOf('}');
    if (start >= 0 && end > start) return JSON.parse(raw.slice(start, end + 1));
    throw new Error('妯″瀷杩斿洖鍐呭涓嶆槸鍚堟硶 JSON');
  }
}

function formatStructuredValue(value) {
  if (value === null || value === undefined || value === '') return '<span class="muted">鏈姤鍛?/span>';
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') return escapeHtml(value);
  if (Array.isArray(value)) {
    if (!value.length) return '<span class="muted">绌哄垪琛?/span>';
    return `<ul>${value.map(item => `<li>${formatStructuredValue(item)}</li>`).join('')}</ul>`;
  }
  return `<dl class="simulation-kv">${Object.entries(value).map(([key, val]) => `
    <div><dt>${escapeHtml(key)}</dt><dd>${formatStructuredValue(val)}</dd></div>
  `).join('')}</dl>`;
}

function renderEvidenceList(evidence) {
  const items = Array.isArray(evidence) ? evidence : [];
  if (!items.length) return '<p class="muted">鏈彁渚涜瘉鎹€?/p>';
  return `<div class="simulation-evidence-list">${items.slice(0, 3).map(item => `
    <blockquote>
      ${escapeHtml(item.quote || item.text || '鏈彁渚?quote')}
      <cite>${escapeHtml([item.section, item.page ? `page ${item.page}` : '', item.chunk_id].filter(Boolean).join(' 路 ') || 'source not specified')}</cite>
    </blockquote>
  `).join('')}</div>`;
}

function renderSimulationStructuredResult(content) {
  state.simulationRawResult = content || '';
  $('simulationRawJsonBtn').hidden = !state.simulationRawResult;
  if (!content) {
    $('simulationResult').innerHTML = '妯″瀷娌℃湁杩斿洖鍐呭銆?;
    return;
  }
  let data;
  try {
    data = parseSimulationJson(content);
  } catch (err) {
    $('simulationResult').innerHTML = `
      <div class="simulation-empty-state">
        <b>鏃犳硶瑙ｆ瀽涓虹粨鏋勫寲 JSON</b>
        <p>${escapeHtml(err.message)}銆傚彲浠ョ偣鍑烩€滃師濮?JSON鈥濇煡鐪嬫ā鍨嬭繑鍥炲唴瀹广€?/p>
        <pre>${escapeHtml(fmt(content, 1200))}</pre>
      </div>
    `;
    return;
  }
  const presence = data.object_presence || {};
  const dimensions = Array.isArray(data.dimension_extractions) ? data.dimension_extractions : [];
  const tags = Array.isArray(data.auto_tags) ? data.auto_tags : [];
  $('simulationResult').innerHTML = `
    <div class="simulation-summary-grid">
      <div>
        <span>绉戠爺瀵硅薄</span>
        <b>${escapeHtml(data.research_object || data.object || '-')}</b>
      </div>
      <div>
        <span>鏄惁瀛樺湪</span>
        <b>${presence.exists === true ? '瀛樺湪' : presence.exists === false ? '涓嶅瓨鍦? : '鏈垽鏂?}</b>
      </div>
      <div>
        <span>瑙掕壊</span>
        <b>${escapeHtml(presence.role_in_paper || '-')}</b>
      </div>
      <div>
        <span>缃俊搴?/span>
        <b>${escapeHtml(presence.confidence || '-')}</b>
      </div>
    </div>
    ${presence.judgement_reason ? `<section class="simulation-result-section"><h4>瀵硅薄鍒ゅ畾</h4><p>${escapeHtml(presence.judgement_reason)}</p>${renderEvidenceList(presence.evidence)}</section>` : ''}
    <section class="simulation-result-section">
      <h4>缁村害鎶藉彇</h4>
      <div class="simulation-dimension-list">
        ${dimensions.map(item => `
          <article class="simulation-dimension-item">
            <div class="simulation-dimension-head">
              <b>${escapeHtml(item.dimension_name || item.dimension_id || '鏈懡鍚嶇淮搴?)}</b>
              <span>${item.not_reported ? '鏈姤鍛? : escapeHtml(item.confidence || '宸叉娊鍙?)}</span>
            </div>
            <div class="simulation-answer">${formatStructuredValue(item.answer)}</div>
            ${item.notes ? `<p class="muted">${escapeHtml(item.notes)}</p>` : ''}
            ${renderEvidenceList(item.evidence)}
          </article>
        `).join('') || '<p class="muted">鏈繑鍥炵淮搴︽娊鍙栫粨鏋溿€?/p>'}
      </div>
    </section>
    ${tags.length ? `<section class="simulation-result-section"><h4>鑷姩鏍囩</h4><div class="tag-list">${tags.map(tag => `<span class="term-tag">${escapeHtml(tag)}</span>`).join('')}</div></section>` : ''}
    ${data.summary_for_review ? `<section class="simulation-result-section"><h4>瀹℃煡鎽樿</h4><p>${escapeHtml(data.summary_for_review)}</p></section>` : ''}
  `;
}

function buildManagedConfigPreview(cfg) {
  ensurePromptManagerState(cfg);
  const obj = cfg.object_definition || {};
  const concept = cfg.term_rules?.concept_policy || {};
  return {
    profile_id: obj.profile_id,
    display_name: obj.display_name,
    object_type: obj.object_type,
    description: obj.description,
    object_definition: {
      working_definition: concept.working_definition || '',
      related_terms: concept.include_terms || [],
      exclusion_notes: concept.exclude_rules || [],
    },
    dimensions: (cfg.dimensions || []).map(dim => ({
      dimension_id: dim.dimension_id,
      name: dim.name,
      question: dim.question || dim.description || '',
      output_type: dim.output_type || 'list',
      fields: (dim.fields || []).map(field => typeof field === 'string' ? field : field.name).filter(Boolean),
      section_policy: normalizeSectionPolicy(dim.section_policy, dim),
    })),
    system_defaults: {
      evidence_required: cfg.evidence_rules?.require_quote !== false,
      allow_not_reported: true,
      distinguish_author_claim_and_model_inference: true,
      auto_generate_tags: true,
      auto_generate_basic_comparison_view: true,
    },
    prompts: cfg.prompts.items.map(item => ({
      id: item.id,
      name: item.name,
      active: item.id === cfg.prompts.active_id,
      updated_at: item.updated_at || null,
    })),
    active_prompt_id: cfg.prompts.active_id,
    modeling: cfg.modeling || defaultModelingState(),
  };
}

async function runObjectSimulation() {
  collectObjectConfigFromForm();
  const inputText = $('simulationInput').value.trim();
  if (!inputText) return toast('璇峰厛杈撳叆娴嬭瘯鍐呭');
  const promptProfile = selectedSimulationPromptProfile(state.objectConfig);
  const promptContent = selectedSimulationPromptContent(state.objectConfig);
  if (!promptContent.trim()) return toast('璇烽€夋嫨鎴栧～鍐?Prompt');
  if (!state.config) await loadConfig();
  const resultBox = $('simulationResult');
  const status = $('simulationStatus');
  const btn = $('runSimulationBtn');
  state.simulationRawResult = '';
  $('simulationRawJsonBtn').hidden = true;
  resultBox.innerHTML = '<div class="simulation-empty-state">娴嬭瘯涓?..</div>';
  status.textContent = `姝ｅ湪璋冪敤澶фā鍨嬶細${promptProfile.name}`;
  btn.disabled = true;
  try {
    const result = await api('/api/config/llm-test', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        profile: selectedLlmProfile(),
        prompt: buildSimulationPrompt(state.objectConfig, inputText, promptContent),
        max_tokens: 1024,
      }),
    });
    renderSimulationStructuredResult(result.content || '');
    generateObjectAdvisorSuggestions({silent: true});
    status.textContent = `瀹屾垚锛岀敤鏃?${result.elapsed_seconds}s`;
  } catch (err) {
    state.simulationRawResult = err.message;
    $('simulationRawJsonBtn').hidden = false;
    resultBox.innerHTML = `<div class="simulation-empty-state"><b>娴嬭瘯澶辫触</b><p>${escapeHtml(err.message)}</p></div>`;
    status.textContent = '娴嬭瘯澶辫触';
    toast(err.message);
  } finally {
    btn.disabled = false;
  }
}

function renderObjectHealthCheck(cfg) {
  const checks = [
    {ok: Boolean(cfg.object_definition.profile_id), text: '瀵硅薄妯℃澘 ID 宸插～鍐?},
    {ok: Boolean(cfg.object_definition.display_name), text: '鏄剧ず鍚嶇О宸插～鍐?},
    {ok: (cfg.dimensions || []).length > 0, text: '鑷冲皯閰嶇疆 1 涓娊鍙栫淮搴?},
    {ok: (cfg.dimensions || []).every(d => d.dimension_id && d.name), text: '姣忎釜缁村害閮芥湁 ID 鍜屽悕绉?},
    {ok: (cfg.dimensions || []).some(d => (d.fields || []).length), text: '鑷冲皯涓€涓淮搴﹂厤缃簡杈撳嚭瀛楁'},
    {ok: cfg.evidence_rules.require_quote && cfg.evidence_rules.require_section, text: '璇佹嵁瑙勫垯鍖呭惈鍘熸枃鍜岀珷鑺傝姹?},
  ];
  $('objectHealthCheck').innerHTML = checks.map(item => `
    <div class="health-item ${item.ok ? 'ok' : 'bad'}">${item.ok ? '閫氳繃' : '寰呰ˉ'} 路 ${escapeHtml(item.text)}</div>
  `).join('');
}

function objectConfigToTemplate(cfg, options = {}) {
  ensurePromptManagerState(cfg);
  ensureModelingState(cfg);
  const activePrompt = activePromptProfile(cfg);
  const now = new Date().toISOString();
  const modeling = {
    ...(cfg.modeling || defaultModelingState()),
    publish_state: options.publish ? 'published' : 'draft',
    draft_saved_at: now,
  };
  if (options.publish) modeling.published_at = now;
  return {
    id: cfg.object_definition.profile_id,
    name: cfg.object_definition.display_name,
    description: cfg.object_definition.description,
    version: cfg.object_definition.version,
    system_prompt: activePrompt?.content?.trim() || buildObjectSystemPrompt(cfg),
    prompt_profiles: cfg.prompts.items.map(item => ({
      id: item.id,
      name: item.name,
      content: item.content || '',
      created_at: item.created_at || new Date().toISOString(),
      updated_at: item.updated_at || now,
    })),
    active_prompt_id: cfg.prompts.active_id,
    modeling,
    dimensions: (cfg.dimensions || []).map(d => ({
      name: d.dimension_id,
      label: d.name,
      description: combineDimensionText(d.description, d.question),
      output_type: d.output_type || 'list',
      required_evidence: d.requires_evidence !== false,
      allow_not_found: d.required !== true,
      fields: (d.fields || []).map(field => typeof field === 'string' ? field : field.name).filter(Boolean),
      examples: [],
      negative_examples: cfg.term_rules.concept_policy.exclude_rules || [],
      retrieval_keywords: d.retrieval_keywords || [],
      section_policy: normalizeSectionPolicy(d.section_policy, d),
    })),
  };
}

function buildObjectSystemPrompt(cfg) {
  const obj = cfg.object_definition || {};
  const concept = cfg.term_rules?.concept_policy || {};
  const dimensions = (cfg.dimensions || []).map((dim, index) => (
    `${index + 1}. ${dim.name || dim.dimension_id}\n   - dimension_id: ${dim.dimension_id}\n   - 鎶藉彇闂: ${dim.question || dim.description || ''}`
  )).join('\n');
  return `浣犳槸涓€涓弗璋ㄧ殑绉戠爺鏂囩尞鐭ヨ瘑鎶藉彇鍔╂墜銆備綘鐨勪换鍔℃槸鍩轰簬鐢ㄦ埛鎻愪緵鐨勮鏂囧唴瀹癸紝鍥寸粫鎸囧畾鐮旂┒瀵硅薄杩涜缁撴瀯鍖栦俊鎭娊鍙栥€傝涓ユ牸渚濇嵁璁烘枃鍘熸枃锛屼笉瑕佺紪閫犱俊鎭€?
# 涓€銆佺爺绌跺璞￠厤缃?
## 鐮旂┒瀵硅薄
- 鍚嶇О锛?{obj.display_name || ''}
- 绫诲瀷锛?{obj.object_type || ''}
- 璇存槑锛?{obj.description || ''}

## 宸ヤ綔瀹氫箟
${concept.working_definition || ''}

## 鐩稿叧鏈
${(concept.include_terms || []).map(term => `- ${term}`).join('\n')}

## 鎺掗櫎瑙勫垯
${(concept.exclude_rules || []).map(rule => `- ${rule}`).join('\n')}

# 浜屻€佹娊鍙栦换鍔?
璇峰厛鍒ゆ柇璁烘枃涓槸鍚﹀瓨鍦ㄢ€?{obj.display_name || '鐮旂┒瀵硅薄'}鈥濊繖涓€鐮旂┒瀵硅薄銆傛敞鎰忥細
1. 濡傛灉鐩稿叧鍐呭鍙嚭鐜板湪 related work 涓紝涓斾笉鏄湰鏂囨柟娉曘€佸疄楠屽璞℃垨鍒嗘瀽瀵硅薄锛屼笉搴斿垽瀹氫负鏈枃鐮旂┒瀵硅薄銆?2. 濡傛灉璁烘枃娌℃湁浣跨敤閰嶇疆涓殑鏄剧ず鍚嶇О锛屼絾浣跨敤浜嗙浉鍏虫湳璇垨鍔熻兘绛変环鏈哄埗锛屼篃鍙互鍒ゅ畾涓哄瓨鍦ㄣ€?3. 濡傛灉鍙兘鏍规嵁涓婁笅鏂囨帹鏂紝璇锋槑纭爣璁?model_inferred=true銆?4. 濡傛灉璁烘枃鏈姤鍛婃煇涓€缁村害锛岃杩斿洖 not_reported锛屼笉瑕佸己琛岃ˉ鍏ㄣ€?
# 涓夈€侀渶瑕佹娊鍙栫殑缁村害

${dimensions}

# 鍥涖€佽瘉鎹姹?
- 姣忎釜闈?not_reported 鐨勬娊鍙栫粨鏋滈兘蹇呴』缁戝畾鍘熸枃璇佹嵁銆?- 璇佹嵁闇€瑕佸寘鍚?quote銆乻ection銆乸age 鎴?chunk_id銆?- 蹇呴』鍖哄垎浣滆€呮槑纭〃杩?author_explicit 涓庢ā鍨嬫帹鏂?model_inferred銆?- 璁烘枃鏈姤鍛婄殑淇℃伅蹇呴』鏍囪涓?not_reported=true銆?- 涓嶈鎶?abstract 涓殑瀹芥硾 claim 鐩存帴褰撴垚瀹為獙璇佹嵁銆?- 涓嶈鎶?related work 涓叾浠栬鏂囩殑鏂规硶璇涓烘湰鏂囨柟娉曘€?
# 浜斻€佽緭鍑烘牸寮?
璇峰彧杈撳嚭鍚堟硶 JSON锛屼笉瑕佽緭鍑?Markdown锛屼笉瑕佹坊鍔犻澶栬В閲娿€傝緭鍑虹粨鏋勫涓嬶細

{
  "profile_id": "${obj.profile_id || ''}",
  "research_object": "${obj.display_name || ''}",
  "object_presence": {
    "exists": true,
    "role_in_paper": "core_contribution | method_component | auxiliary_component | evaluation_object | discussion_only | not_present",
    "local_terms": ["璁烘枃涓娇鐢ㄧ殑鏈湴鏈"],
    "judgement_reason": "涓轰粈涔堝垽鏂瓨鍦ㄦ垨涓嶅瓨鍦ㄨ瀵硅薄",
    "confidence": "high | medium | low",
    "evidence": [{"quote": "鍘熸枃璇佹嵁鐗囨", "section": "绔犺妭鍚嶇О", "page": "椤电爜鎴?null", "chunk_id": "chunk_id 鎴?null"}]
  },
  "dimension_extractions": [
    {
      "dimension_id": "dimension_id",
      "dimension_name": "缁村害鍚嶇О",
      "answer": "string | object | list | not_reported",
      "not_reported": false,
      "author_explicit": true,
      "model_inferred": false,
      "confidence": "high | medium | low",
      "evidence": [{"quote": "鍘熸枃璇佹嵁鐗囨", "section": "绔犺妭鍚嶇О", "page": "椤电爜鎴?null", "chunk_id": "chunk_id 鎴?null", "evidence_type": "definition | method_description | experiment_result | discussion | other"}],
      "notes": "蹇呰鏃惰鏄庢娊鍙栦緷鎹€佹涔夋垨闄愬埗"
    }
  ],
  "auto_tags": ["绯荤粺鍙嚜鍔ㄧ敓鎴愮殑妫€绱㈡爣绛?],
  "summary_for_review": "缁欎汉宸ュ鏌ヨ€呯湅鐨勭畝鐭€荤粨锛岃鏄庝富瑕佸彂鐜般€佺己澶遍」鍜岄渶瑕侀噸鐐规牳楠岀殑鍦版柟"
}`;
}

function validateObjectTemplateForPublish(template) {
  const issues = [];
  if (!template.id) issues.push('瀵硅薄妯℃澘 ID');
  if (!template.name) issues.push('鏄剧ず鍚嶇О');
  if (!(template.dimensions || []).length) issues.push('鑷冲皯 1 涓娊鍙栫淮搴?);
  if (!String(template.system_prompt || '').trim()) issues.push('婵€娲?Prompt 鍐呭');
  return issues;
}

async function saveResearchObjectConfig(options = {}) {
  collectObjectConfigFromForm();
  if (state.objectPromptDirty && $('objectPromptPreview')?.value.trim()) {
    saveSelectedPromptDraft();
    state.objectPromptDirty = false;
  }
  const template = objectConfigToTemplate(state.objectConfig, {publish: Boolean(options.publish)});
  if (options.requirePublishReady) {
    const issues = validateObjectTemplateForPublish(template);
    if (issues.length) throw new Error(`鍙戝竷鍓嶈琛ュ叏锛?{issues.join('銆?)}`);
  }
  const saved = await api('/api/templates', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify(template),
  });
  if (!options.silent) toast('瀵硅薄寤烘ā閰嶇疆宸蹭繚瀛?);
  await refreshAll();
  renderObjectConfigPanel();
  return saved;
}

async function publishObjectTemplate() {
  await saveResearchObjectConfig({silent: true, requirePublishReady: true, publish: true});
  toast('妯℃澘宸插彂甯冿紝鍙湪璁烘枃绠＄悊涓彂璧锋娊鍙?);
}

async function deleteCurrentObjectTemplate() {
  const select = $('objectTemplateSelect');
  const templateId = select?.value || '';
  const template = state.templates.find(item => item.id === templateId);
  if (!template) return toast('璇峰厛閫夋嫨涓€涓凡淇濆瓨瀵硅薄');
  const confirmed = confirm(`纭畾鍒犻櫎鈥?{template.name}鈥濆悧锛熻繖浼氫粠鐮旂┒瀵硅薄搴撶Щ闄よ瀵硅薄妯℃澘锛屼笉浼氬垹闄ゅ凡缁忎骇鐢熺殑鎶藉彇缁撴灉銆俙);
  if (!confirmed) return;
  await api(`/api/templates/${encodeURIComponent(template.id)}`, {method: 'DELETE'});
  state.objectConfig = defaultResearchObjectConfig(null);
  state.objectDimensionIndex = 0;
  state.objectPromptDirty = false;
  state.selectedPromptProfileId = null;
  state.selectedSimulationPromptId = null;
  resetObjectAdvisorSuggestions();
  toast(`宸插垹闄ゅ璞★細${template.name}`);
  await refreshAll();
  renderObjectConfigPanel();
}

async function importResearchObjectConfig() {
  const status = $('objectImportStatus');
  const btn = $('objectImportApplyBtn');
  let imported;
  try {
    imported = JSON.parse($('objectImportJson').value.trim());
  } catch (err) {
    status.className = 'test-result bad';
    status.textContent = `JSON 瑙ｆ瀽澶辫触锛?{err.message}`;
    return;
  }
  btn.disabled = true;
  status.className = 'test-result muted';
  status.textContent = '姝ｅ湪瀵煎叆骞朵繚瀛?..';
  try {
    state.objectConfig = objectConfigFromImportedJson(imported);
    state.objectDimensionIndex = 0;
    state.objectPromptDirty = false;
    state.selectedPromptProfileId = state.objectConfig.prompts.active_id;
    state.selectedSimulationPromptId = state.objectConfig.prompts.active_id;
    resetObjectAdvisorSuggestions();
    $('objectTemplateSelect').value = '__new__';
    renderObjectConfigForm();
    const template = objectConfigToTemplate(state.objectConfig, {publish: false});
    await api('/api/templates', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(template),
    });
    status.className = 'test-result ok';
    status.textContent = `宸插鍏ュ苟淇濆瓨锛?{template.name}`;
    toast('瀵煎叆閰嶇疆宸蹭繚瀛橈紝骞剁敓鎴愭縺娲?Prompt');
    closeObjectImportModal();
    await refreshAll();
    openObjectConfigModal();
  } catch (err) {
    status.className = 'test-result bad';
    status.textContent = err.message;
    toast(err.message);
  } finally {
    btn.disabled = false;
  }
}

function updateImportMode() {
  const mode = $('importMode').value;
  document.querySelectorAll('.import-panel').forEach(panel => {
    panel.classList.toggle('active', panel.dataset.importMode === mode);
  });
}

function addArxivInput(value = '') {
  const row = document.createElement('div');
  row.className = 'multi-input-row';
  row.innerHTML = `
    <input class="arxivInput" placeholder="渚嬪 2401.12345 鎴?https://arxiv.org/abs/..." value="${escapeHtml(value)}" />
    <button type="button" aria-label="绉婚櫎姝?arXiv 杈撳叆">-</button>
  `;
  row.querySelector('button').onclick = () => row.remove();
  $('arxivInputs').appendChild(row);
}

function getArxivValues() {
  return [...document.querySelectorAll('.arxivInput')]
    .map(input => input.value.trim())
    .filter(Boolean);
}

function setImportBusy(isBusy) {
  document.querySelectorAll('.import-card button, .import-card input, .import-card textarea, #importMode').forEach(el => {
    el.disabled = isBusy;
  });
}

function startImportProgress(initialLabel, onProgress) {
  const progress = $('importProgress');
  const label = $('importProgressLabel');
  const percent = $('importProgressPercent');
  const bar = $('importProgressBar');
  const stages = [
    '杩炴帴鏁版嵁婧?..',
    '涓嬭浇璁烘枃鏂囦欢...',
    '瑙ｆ瀽 PDF 姝ｆ枃...',
    '璇嗗埆绔犺妭銆佸浘琛ㄥ拰鍙傝€冩枃鐚?..',
    '鍐欏叆璁烘枃搴?..'
  ];
  let value = 6;
  let stageIndex = 0;
  setImportBusy(true);
  progress.hidden = false;
  progress.classList.remove('error', 'done');
  label.textContent = initialLabel;
  percent.textContent = `${value}%`;
  bar.style.width = `${value}%`;
  onProgress?.(value, initialLabel);

  const timer = setInterval(() => {
    value = Math.min(92, value + Math.max(1, Math.round((94 - value) * 0.16)));
    if (value > 18 && stageIndex < stages.length - 1) stageIndex += 1;
    label.textContent = stages[stageIndex];
    percent.textContent = `${value}%`;
    bar.style.width = `${value}%`;
    onProgress?.(value, stages[stageIndex]);
  }, 850);

  return timer;
}

function finishImportProgress(timer, message = '瀵煎叆瀹屾垚') {
  clearInterval(timer);
  $('importProgress').classList.add('done');
  $('importProgressLabel').textContent = message;
  $('importProgressPercent').textContent = '100%';
  $('importProgressBar').style.width = '100%';
  setImportBusy(false);
  setTimeout(() => { $('importProgress').hidden = true; }, 900);
}

function failImportProgress(timer, message) {
  clearInterval(timer);
  $('importProgress').classList.add('error');
  $('importProgressLabel').textContent = message;
  $('importProgressPercent').textContent = '澶辫触';
  setImportBusy(false);
}

function setImportProgressValue(percent, label) {
  const value = Math.max(0, Math.min(100, Math.round(percent)));
  $('importProgress').hidden = false;
  $('importProgressLabel').textContent = label;
  $('importProgressPercent').textContent = `${value}%`;
  $('importProgressBar').style.width = `${value}%`;
}

function addPaperJob(title, source) {
  const job = {
    id: `job_${Date.now()}_${Math.random().toString(16).slice(2)}`,
    title,
    source,
    status: '瑙ｆ瀽涓?,
    percent: 0,
    startedAt: new Date().toLocaleTimeString()
  };
  state.paperJobs.unshift(job);
  renderPapers();
  return job.id;
}

function updatePaperJob(jobId, patch) {
  const job = state.paperJobs.find(item => item.id === jobId);
  if (!job) return;
  Object.assign(job, patch);
  renderPapers();
}

function removePaperJob(jobId) {
  state.paperJobs = state.paperJobs.filter(job => job.id !== jobId);
  renderPapers();
}

function paperStatus(p) {
  const op = state.paperOps[p.id];
  if (op) return {label: `${op.status || '瑙ｆ瀽涓?} ${Math.round(op.percent || 0)}%`, className: 'pending', parser: p.metadata?.extra?.parser, op};
  const parser = p.metadata?.extra?.parser;
  if (p.metadata?.extra?.review_status === 'verified') return {label: '宸叉牎楠?, className: 'verified', parser};
  if ((p.chunks || []).length) return {label: '寰呮牎楠?, className: 'needs_revision', parser};
  if (p.full_text) return {label: '鏈夋鏂?, className: 'pending', parser};
  return {label: '浠呭厓鏁版嵁', className: 'needs_revision', parser};
}

function updatePaperOp(paperId, patch) {
  state.paperOps[paperId] = {...(state.paperOps[paperId] || {}), ...patch};
  renderPapers();
}

function removePaperOp(paperId) {
  delete state.paperOps[paperId];
  renderPapers();
}

function startPaperOpProgress(paperId, initialLabel = '瑙ｆ瀽涓?) {
  let value = 6;
  updatePaperOp(paperId, {percent: value, status: initialLabel});
  return setInterval(() => {
    value = Math.min(92, value + Math.max(1, Math.round((94 - value) * 0.16)));
    updatePaperOp(paperId, {percent: value, status: initialLabel});
  }, 850);
}

async function runPaperImport(label, pendingTitle, source, action) {
  const jobId = addPaperJob(pendingTitle, source);
  const timer = startImportProgress(label, (percent, status) => {
    updatePaperJob(jobId, {percent, status});
  });
  try {
    const result = await action();
    const papers = Array.isArray(result) ? result : (result?.id ? [result] : []);
    rememberRecentImports(papers.map(paper => paper.id));
    updatePaperJob(jobId, {percent: 100, status: '瑙ｆ瀽瀹屾垚'});
    finishImportProgress(timer);
    toast('瀵煎叆瀹屾垚');
    state.paperPage = 1;
    await refreshAll();
  } catch (err) {
    failImportProgress(timer, err.message);
    toast(err.message);
  } finally {
    removePaperJob(jobId);
  }
}

async function runArxivBatchImport(values) {
  const total = values.length;
  const jobId = addPaperJob(`鎵归噺 arXiv 瀵煎叆锛?{total} 绡囷級`, 'arxiv');
  const importedPapers = [];
  setImportBusy(true);
  $('importProgress').hidden = false;
  $('importProgress').classList.remove('error', 'done');
  try {
    for (let index = 0; index < values.length; index += 1) {
      const value = values[index];
      const start = Math.floor((index / total) * 100);
      const cap = Math.floor(((index + 0.85) / total) * 100);
      let current = start;
      const label = `绗?${index + 1}/${total} 绡囷細姝ｅ湪瀵煎叆 ${value}`;
      setImportProgressValue(current, label);
      updatePaperJob(jobId, {percent: current, status: `绗?${index + 1}/${total} 绡囪В鏋愪腑`});
      const timer = setInterval(() => {
        current = Math.min(cap, current + Math.max(1, Math.round((cap - current) * 0.18)));
        setImportProgressValue(current, label);
        updatePaperJob(jobId, {percent: current, status: `绗?${index + 1}/${total} 绡囪В鏋愪腑`});
      }, 850);
      try {
        const paper = await api('/api/papers/import/arxiv', {method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({arxiv_id_or_url: value})});
        importedPapers.push(paper);
      } finally {
        clearInterval(timer);
      }
      const completed = Math.floor(((index + 1) / total) * 100);
      const completedLabel = `宸插畬鎴?${index + 1}/${total} 绡嘸;
      setImportProgressValue(completed, completedLabel);
      updatePaperJob(jobId, {percent: completed, status: completedLabel});
    }
    rememberRecentImports(importedPapers.map(paper => paper.id));
    $('importProgress').classList.add('done');
    toast(`鎵归噺瀵煎叆瀹屾垚锛?{total} 绡嘸);
    state.paperPage = 1;
    await refreshAll();
    setTimeout(() => { $('importProgress').hidden = true; }, 900);
  } catch (err) {
    if (importedPapers.length) rememberRecentImports(importedPapers.map(paper => paper.id));
    $('importProgress').classList.add('error');
    $('importProgressLabel').textContent = err.message;
    $('importProgressPercent').textContent = '澶辫触';
    toast(err.message);
  } finally {
    setImportBusy(false);
    removePaperJob(jobId);
  }
}

function validCustomPaperSets() {
  return state.paperSets || [];
}

function uniqueIds(ids) {
  return [...new Set((ids || []).filter(Boolean))];
}

async function savePaperSetRecord(paperSet, paperIds) {
  const updated = await api(`/api/paper-sets/${paperSet.id}`, {
    method: 'PUT',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({
      name: paperSet.name,
      detail: paperSet.detail || '',
      paper_ids: uniqueIds(paperIds),
    }),
  });
  const index = state.paperSets.findIndex(item => item.id === paperSet.id);
  if (index >= 0) state.paperSets[index] = updated;
  return updated;
}

async function createPaperSetRecord(name, detail = '', paperIds = []) {
  const paperSet = await api('/api/paper-sets', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({name, detail, paper_ids: uniqueIds(paperIds)}),
  });
  state.paperSets.unshift(paperSet);
  return paperSet;
}

function rememberRecentImports(paperIds) {
  const ids = uniqueIds(paperIds);
  if (!ids.length) return;
  state.recentImportPaperIds = uniqueIds([...ids, ...state.recentImportPaperIds]).slice(0, 5);
  renderRecentImports();
}

function recentImportPapers() {
  const byId = new Map(state.papers.map(paper => [paper.id, paper]));
  const remembered = state.recentImportPaperIds.map(id => byId.get(id)).filter(Boolean);
  if (remembered.length) return remembered.slice(0, 5);
  return [...state.papers]
    .sort((a, b) => String(b.created_at || '').localeCompare(String(a.created_at || '')))
    .slice(0, 5);
}

function renderRecentImports() {
  const list = $('recentImportList');
  if (!list) return;
  const papers = recentImportPapers();
  $('recentImportCount').textContent = papers.length ? `${papers.length} 绡嘸 : '鏆傛棤璁板綍';
  list.innerHTML = papers.map(paper => {
    const status = paperStatus(paper);
    return `
      <article class="recent-import-item">
        <div>
          <b title="${escapeHtml(paper.metadata?.title || paper.id)}">${escapeHtml(fmt(paper.metadata?.title || paper.id, 58))}</b>
          <span>${escapeHtml(fmtTime(paper.created_at))}</span>
        </div>
        <button type="button" onclick="openPaperDetail('${escapeHtml(paper.id)}')">${escapeHtml(status.label)}</button>
      </article>
    `;
  }).join('') || '<p class="muted">瀹屾垚瀵煎叆鍚庝細鍦ㄨ繖閲屾樉绀烘渶杩?5 绡囪鏂囥€?/p>';
}

function latestPaperTime() {
  const times = state.papers
    .map(paper => paper.updated_at || paper.created_at)
    .filter(Boolean)
    .sort();
  return times[times.length - 1] || '';
}

function paperSetPapers(paperSet) {
  if (!paperSet) return [];
  const ids = new Set(paperSet.paper_ids || []);
  return state.papers.filter(paper => ids.has(paper.id));
}

function verifiedPaperCount(papers) {
  return (papers || []).filter(paper => paper.metadata?.extra?.review_status === 'verified').length;
}

function paperCollectionNames(paperId) {
  return validCustomPaperSets()
    .filter(item => (item.paper_ids || []).includes(paperId))
    .map(item => item.name);
}

function paperParseFilterKey(paper) {
  if (state.paperOps[paper.id]) return 'pending';
  if (paper.metadata?.extra?.review_status === 'verified') return 'verified';
  if ((paper.chunks || []).length) return 'needs_revision';
  if (paper.full_text) return 'parsed';
  return 'metadata_only';
}

function paperRuns(paperId, templateId = '') {
  return state.runs
    .filter(run => run.paper_id === paperId && (!templateId || run.template_id === templateId))
    .sort((a, b) => String(b.created_at || '').localeCompare(String(a.created_at || '')));
}

function paperHasExtraction(paperId) {
  return paperRuns(paperId).length > 0;
}

function extractionStatsForPaper(paperId) {
  const runs = paperRuns(paperId);
  const templateIds = new Set(runs.map(run => run.template_id).filter(Boolean));
  const itemCount = runs.reduce((total, run) => total + (run.items?.length || 0), 0);
  const reviewableItems = runs.flatMap(run => run.items || []);
  const reviewedItems = reviewableItems.filter(item => (item.review_status || 'pending') !== 'pending');
  return {
    runCount: runs.length,
    objectCount: templateIds.size,
    itemCount,
    reviewedItemCount: reviewedItems.length,
    latestRun: runs[0] || null,
  };
}

function extractionStatusForPaper(paperId) {
  const stats = extractionStatsForPaper(paperId);
  if (!stats.runCount || !stats.itemCount) return {label: '寰呮娊鍙?, className: 'extraction_todo'};
  if (stats.reviewedItemCount >= stats.itemCount) return {label: '宸插鏌?, className: 'extraction_reviewed'};
  return {label: '寰呭鏌?, className: 'extraction_pending_review'};
}

function extractionJobProgress(job) {
  const explicit = Number(job?.percent);
  if (Number.isFinite(explicit)) return Math.max(0, Math.min(100, Math.round(explicit)));
  if (job?.status === 'completed' || job?.status === 'failed') return 100;
  if (job?.status === 'running') return 68;
  if (job?.status === 'queued') return 12;
  return 0;
}

function paperActiveExtractionJob(paperId) {
  const prefix = `${paperId}::`;
  const priority = {running: 4, queued: 3, failed: 2, completed: 1};
  return Object.entries(state.extractionJobs || {})
    .filter(([key]) => key.startsWith(prefix))
    .map(([key, job]) => ({key, ...job}))
    .sort((a, b) => {
      const score = (priority[b.status] || 0) - (priority[a.status] || 0);
      if (score) return score;
      return String(b.updatedAt || b.startedAt || '').localeCompare(String(a.updatedAt || a.startedAt || ''));
    })[0] || null;
}

function paperTaskProgress(paper) {
  const op = state.paperOps[paper.id];
  if (op) {
    const percent = Math.max(0, Math.min(100, Math.round(op.percent || 0)));
    const failed = /澶辫触/.test(op.status || '');
    const completed = percent >= 100 && /瀹屾垚/.test(op.status || '');
    return {
      label: op.status || '瑙ｆ瀽涓?,
      detail: '姝ｅ湪鏇存柊鏂囦欢瑙ｆ瀽缁撴灉',
      percent,
      className: failed ? 'failed' : (completed ? 'completed' : 'running'),
    };
  }
  const job = paperActiveExtractionJob(paper.id);
  if (!job) return null;
  const label = {
    queued: '鎶藉彇鎺掗槦涓?,
    running: '鎶藉彇涓?,
    completed: '鎶藉彇瀹屾垚',
    failed: '鎶藉彇澶辫触',
  }[job.status] || '鎶藉彇涓?;
  return {
    label,
    detail: job.message || '姝ｅ湪鏇存柊鍐呭鎶藉彇缁撴灉',
    percent: extractionJobProgress(job),
    className: job.status || 'running',
  };
}

function renderPaperTaskProgress(task) {
  if (!task) return '';
  const percent = Math.max(0, Math.min(100, Math.round(task.percent || 0)));
  return `
    <div class="paper-row-task ${escapeHtml(task.className || 'running')}">
      <div class="paper-row-task-head">
        <span>${escapeHtml(task.label || '澶勭悊涓?)}</span>
        <b>${percent}%</b>
      </div>
      <div class="paper-row-progress">
        <div class="paper-row-progress-bar" style="width: ${percent}%"></div>
      </div>
      ${task.detail ? `<div class="paper-row-task-detail" title="${escapeHtml(task.detail)}">${escapeHtml(task.detail)}</div>` : ''}
    </div>
  `;
}

function paperSearchText(paper) {
  const meta = paper.metadata || {};
  return [
    paper.id,
    meta.title,
    (meta.authors || []).join(' '),
    meta.abstract,
    meta.doi,
    meta.arxiv_id,
    meta.venue,
    meta.year,
    paperCollectionNames(paper.id).join(' '),
    paper.full_text ? paper.full_text.slice(0, 60000) : '',
  ].filter(Boolean).join('\n').toLowerCase();
}

function filteredLibraryPapers() {
  const filters = state.paperFilters;
  const assigned = new Set(validCustomPaperSets().flatMap(item => item.paper_ids || []));
  const targetSet = validCustomPaperSets().find(item => item.id === filters.paperSet);
  const targetIds = new Set(targetSet?.paper_ids || []);
  const query = (filters.query || '').trim().toLowerCase();
  return state.papers.filter(paper => {
    if (query && !paperSearchText(paper).includes(query)) return false;
    if (filters.year !== 'all' && String(paper.metadata?.year || '') !== filters.year) return false;
    if (filters.paperSet === 'none' && assigned.has(paper.id)) return false;
    if (filters.paperSet !== 'all' && filters.paperSet !== 'none' && !targetIds.has(paper.id)) return false;
    if (filters.parseStatus !== 'all' && paperParseFilterKey(paper) !== filters.parseStatus) return false;
    if (filters.extractionStatus === 'extracted' && !paperHasExtraction(paper.id)) return false;
    if (filters.extractionStatus === 'not_extracted' && paperHasExtraction(paper.id)) return false;
    return true;
  });
}

function renderPaperJobRow(job) {
  const percent = Math.max(0, Math.min(100, Math.round(job.percent || 0)));
  return `
    <div class="paper-row pending-row">
      <div class="paper-row-main">
        <div class="paper-title-line">
          <h3 class="paper-title" title="${escapeHtml(job.title)}">${escapeHtml(job.title)}</h3>
          <span class="badge pending">瑙ｆ瀽涓?${percent}%</span>
        </div>
        <div class="meta">${escapeHtml(sourceLabel(job.source))} 路 ${escapeHtml(job.status || '瑙ｆ瀽涓?)} 路 寮€濮嬩簬 ${escapeHtml(job.startedAt)}</div>
        <div class="paper-row-progress">
          <div class="paper-row-progress-bar" style="width: ${percent}%"></div>
        </div>
      </div>
      <div class="paper-actions">
        <button disabled>鏌ョ湅璇︽儏</button>
        <button disabled>瀵煎嚭 JSON</button>
        <button disabled>鍒犻櫎</button>
      </div>
      <div class="paper-stats">
        ${listStat('Status', '瑙ｆ瀽涓?)}
        ${listStat('Progress', `${percent}%`)}
      </div>
    </div>
  `;
}

function renderPaperRow(p, selectable = false) {
  const status = paperStatus(p);
  const extractionStats = extractionStatsForPaper(p.id);
  const extractionStatus = extractionStatusForPaper(p.id);
  const parser = status.parser ? ` 路 parser ${status.parser}` : '';
  const checked = state.selectedPaperIds.includes(p.id);
  const taskProgress = renderPaperTaskProgress(paperTaskProgress(p));
  return `
    <div class="paper-row ${selectable ? 'selectable' : ''} ${p.id === state.selectedPaperId ? 'active' : ''}" data-paper-id="${escapeHtml(p.id)}">
      ${selectable ? `
        <label class="paper-row-check" title="閫夋嫨璁烘枃">
          <input type="checkbox" class="paperBatchCheck" value="${escapeHtml(p.id)}" ${checked ? 'checked' : ''} onchange="togglePaperSelection('${escapeHtml(p.id)}', this.checked)" />
        </label>
      ` : ''}
      <div class="paper-row-main">
        <div class="paper-title-line">
          <h3 class="paper-title" title="${escapeHtml(p.metadata.title)}">${escapeHtml(p.metadata.title)}</h3>
          <span class="badge ${status.className}">${status.label}</span>
          <span class="badge ${extractionStatus.className}">${extractionStatus.label}</span>
        </div>
        <div class="paper-authors-line">${escapeHtml((p.metadata.authors || []).slice(0, 4).join(', ') || '浣滆€呮湭鐭?)} ${p.metadata.year || ''}</div>
        <div class="paper-meta-line"><span>鏉ユ簮锛?/span><b>${escapeHtml(sourceLabel(p.source))}${escapeHtml(parser)}</b></div>
        <div class="paper-meta-line">
          <span>瀵煎叆锛?/span><b>${escapeHtml(fmtTime(p.created_at))}</b>
          <span> 路 瑙ｆ瀽锛?/span><b>${escapeHtml(fmtTime(p.updated_at))}</b>
          <span> 路 鑰楁椂锛?/span><b>${escapeHtml(fmtDuration(p.metadata?.extra?.parse_duration_seconds))}</b>
        </div>
        ${taskProgress}
      </div>
      <div class="paper-actions">
        <button onclick="openPaperDetail('${escapeHtml(p.id)}')">鏌ョ湅璇︽儏</button>
        <button ${extractionStats.latestRun ? '' : 'disabled'} onclick="openLatestExtractionResult('${escapeHtml(p.id)}')">鏌ョ湅鎶藉彇缁撴灉</button>
        <button onclick="exportPaper('${escapeHtml(p.id)}')">瀵煎嚭 JSON</button>
        <button onclick="deletePaper('${escapeHtml(p.id)}')">鍒犻櫎</button>
      </div>
      <div class="paper-stats compact">
        <section class="paper-stat-group">
          <b>鏂囦欢瑙ｆ瀽</b>
          <div>
            <span>绔犺妭 ${p.sections.length}</span>
            <span>Chunks ${p.chunks.length}</span>
            <span>鍥捐〃 ${p.figures.length}</span>
          </div>
        </section>
        <section class="paper-stat-group">
          <b>鍐呭鎶藉彇</b>
          <div>
            <span>瀵硅薄 ${extractionStats.objectCount}</span>
            <span>缁撴灉 ${extractionStats.itemCount}</span>
            <span>宸插 ${extractionStats.reviewedItemCount}</span>
          </div>
        </section>
      </div>
    </div>
  `;
}

function renderPaperSetCreatePanel() {
  const panel = $('paperSetCreatePanel');
  if (!panel) return;
  panel.hidden = state.paperLibraryTab !== 'sets' || !state.paperSetCreateOpen;
}

function renderPaperLibraryHeader(filteredCount = state.papers.length) {
  const total = state.papers.length;
  const setCount = validCustomPaperSets().length;
  const verified = verifiedPaperCount(state.papers);
  $('paperLibraryTitle').textContent = '璁烘枃搴?;
  $('paperLibrarySubtitle').textContent = `鍏?${total} 绡囪鏂囷紝${setCount} 涓泦鍚堬紝${verified} 绡囧凡瀹℃牳`;
  $('paperCount').textContent = state.paperLibraryTab === 'all'
    ? `褰撳墠 ${filteredCount} 绡嘸
    : `${setCount} 涓泦鍚坄;
  $('createPaperSetBtn').hidden = state.paperLibraryTab !== 'sets';
}

function renderPaperLibraryTabs() {
  document.querySelectorAll('[data-paper-library-tab]').forEach(button => {
    button.classList.toggle('active', button.dataset.paperLibraryTab === state.paperLibraryTab);
  });
}

function applySelectOptions(select, options, value) {
  if (!select) return value;
  select.innerHTML = options.map(option => `
    <option value="${escapeHtml(option.value)}" title="${escapeHtml(option.label)}">${escapeHtml(option.label)}</option>
  `).join('');
  const values = new Set(options.map(option => option.value));
  const nextValue = values.has(value) ? value : (options[0]?.value || '');
  select.value = nextValue;
  select.title = select.selectedOptions[0]?.textContent || '';
  return nextValue;
}

function renderPaperLibraryFilters() {
  const panel = $('paperLibraryFilters');
  if (!panel) return;
  panel.hidden = state.paperLibraryTab !== 'all';
  if (panel.hidden) return;
  const years = [...new Set(state.papers.map(paper => paper.metadata?.year).filter(Boolean).map(String))]
    .sort((a, b) => b.localeCompare(a));
  const queryInput = $('paperSearchInput');
  if (queryInput && document.activeElement !== queryInput) queryInput.value = state.paperFilters.query || '';
  state.paperFilters.year = applySelectOptions($('paperYearFilter'), [
    {value: 'all', label: '鍏ㄩ儴骞翠唤'},
    ...years.map(year => ({value: year, label: year})),
  ], state.paperFilters.year);
  state.paperFilters.paperSet = applySelectOptions($('paperCollectionFilter'), [
    {value: 'all', label: '鍏ㄩ儴闆嗗悎'},
    {value: 'none', label: '鏈姞鍏ラ泦鍚?},
    ...validCustomPaperSets().map(item => ({value: item.id, label: item.name})),
  ], state.paperFilters.paperSet);
  state.paperFilters.parseStatus = applySelectOptions($('paperParseStatusFilter'), [
    {value: 'all', label: '鍏ㄩ儴瑙ｆ瀽鐘舵€?},
    {value: 'verified', label: '宸叉牎楠?},
    {value: 'needs_revision', label: '寰呮牎楠?},
    {value: 'parsed', label: '鏈夋鏂?},
    {value: 'metadata_only', label: '浠呭厓鏁版嵁'},
    {value: 'pending', label: '瑙ｆ瀽涓?},
  ], state.paperFilters.parseStatus);
  state.paperFilters.extractionStatus = applySelectOptions($('paperExtractionStatusFilter'), [
    {value: 'all', label: '鍏ㄩ儴鎶藉彇鐘舵€?},
    {value: 'extracted', label: '宸叉娊鍙?},
    {value: 'not_extracted', label: '鏈娊鍙?},
  ], state.paperFilters.extractionStatus);
}

function paperFiltersAreDefault() {
  const filters = state.paperFilters;
  return !filters.query
    && filters.year === 'all'
    && filters.paperSet === 'all'
    && filters.parseStatus === 'all'
    && filters.extractionStatus === 'all';
}

function renderPaperSetCards() {
  const list = $('paperList');
  const cards = validCustomPaperSets();
  $('paperLibraryToolbar').hidden = true;
  $('paperSetBatchActions').hidden = true;
  $('paperParseExtractActions').hidden = true;
  $('paperLibraryFilters').hidden = true;
  const managePanel = $('paperSetManagePanel');
  if (managePanel) {
    managePanel.hidden = true;
    managePanel.innerHTML = '';
  }
  renderPaperSetCreatePanel();
  list.className = 'paper-set-grid';
  list.innerHTML = cards.map(item => {
    const papers = paperSetPapers(item);
    return `
      <article class="paper-set-card">
        <div class="paper-set-card-main">
          <div class="paper-set-folder" aria-hidden="true"><span></span></div>
          <div>
            <h3>${escapeHtml(item.name)}</h3>
            <p>${escapeHtml(item.detail || '鏆傛棤璇︽儏銆?)}</p>
          </div>
        </div>
        <div class="paper-set-meta-grid">
          ${listStat('璁烘枃鏁?, papers.length)}
          ${listStat('宸插鏍?, verifiedPaperCount(papers))}
        </div>
        <div class="paper-set-updated"><span>鏇存柊鏃堕棿</span><b>${escapeHtml(fmtTime(item.updated_at || item.created_at))}</b></div>
        <div class="paper-set-card-actions">
          <button type="button" onclick="viewPaperSetPapers('${escapeHtml(item.id)}')">璇︽儏</button>
          <button type="button" onclick="deletePaperSet('${escapeHtml(item.id)}')">鍒犻櫎</button>
        </div>
      </article>
    `;
  }).join('') || '<p class="muted">鏆傛棤璁烘枃闆嗐€?/p>';
  $('paperPagination').innerHTML = '';
}

function selectedPaperIdsInPapers(papers) {
  const available = new Set((papers || []).map(paper => paper.id));
  state.selectedPaperIds = state.selectedPaperIds.filter(id => available.has(id));
  return state.selectedPaperIds;
}

function updateBatchMoveTargetTitle() {
  const select = $('batchMovePaperSetSelect');
  if (!select) return;
  select.title = select.selectedOptions[0]?.textContent || '鏆傛棤璁烘枃闆?;
}

function updateLibraryBatchTemplateTitle() {
  const select = $('libraryBatchTemplateSelect');
  if (!select) return;
  select.title = select.selectedOptions[0]?.textContent || '鏆傛棤妯℃澘';
}

function renderPaperSetBatchActions(papers) {
  const collectionActions = $('paperSetBatchActions');
  const processingActions = $('paperParseExtractActions');
  if (!collectionActions || !processingActions) return;
  const selected = selectedPaperIdsInPapers(papers);
  const busy = state.libraryBatchExtractionBusy;
  collectionActions.hidden = false;
  processingActions.hidden = false;
  $('paperSelectionCount').textContent = selected.length ? `宸查€?${selected.length} 绡嘸 : '鏈€夋嫨';
  $('selectAllPaperSetPapersBtn').textContent = selected.length && selected.length === papers.length ? '鍙栨秷鍏ㄩ€? : '鍏ㄩ€?;
  $('selectAllPaperSetPapersBtn').disabled = !papers.length || busy;
  const paperSets = validCustomPaperSets();
  const moveSelect = $('batchMovePaperSetSelect');
  const moveValue = moveSelect?.value || '';
  applySelectOptions(moveSelect, paperSets.length
    ? paperSets.map(item => ({value: item.id, label: item.name}))
    : [{value: '', label: '鏆傛棤璁烘枃闆?}], moveValue);
  moveSelect.disabled = !paperSets.length || !selected.length || busy;
  $('batchMovePapersBtn').disabled = !paperSets.length || !selected.length || busy;
  const templateSelect = $('libraryBatchTemplateSelect');
  const templateValue = templateSelect?.value || '';
  const readyTemplates = extractionReadyTemplates();
  applySelectOptions(templateSelect, readyTemplates.length
    ? readyTemplates.map(item => ({value: item.id, label: `${item.name} (${item.version})`}))
    : [{value: '', label: '鏆傛棤宸插彂甯冩ā鏉?}], templateValue);
  templateSelect.disabled = !readyTemplates.length || !selected.length || busy;
  $('batchRunExtractionBtn').disabled = !readyTemplates.length || !selected.length || busy;
  $('batchRunExtractionBtn').textContent = busy ? '鎶藉彇涓? : '鍙戣捣鎶藉彇';
  $('batchDeletePapersBtn').disabled = !selected.length || busy;
  $('batchReparsePapersBtn').disabled = !selected.length || busy;
  $('batchExportPapersBtn').disabled = !selected.length || busy;
  updateBatchMoveTargetTitle();
  updateLibraryBatchTemplateTitle();
}

function renderPaperLibraryAll() {
  const list = $('paperList');
  $('paperLibraryToolbar').hidden = false;
  renderPaperLibraryFilters();
  const papers = filteredLibraryPapers();
  const includeJobs = paperFiltersAreDefault();
  const items = [
    ...(includeJobs ? state.paperJobs.map(job => ({type: 'job', job})) : []),
    ...papers.map(paper => ({type: 'paper', paper}))
  ];
  const total = items.length;
  const pageCount = Math.max(1, Math.ceil(total / PAPER_PAGE_SIZE));
  if (state.paperPage > pageCount) state.paperPage = pageCount;
  if (state.paperPage < 1) state.paperPage = 1;
  renderPaperSetCreatePanel();
  const managePanel = $('paperSetManagePanel');
  if (managePanel) {
    managePanel.hidden = true;
    managePanel.innerHTML = '';
  }

  list.className = 'paper-table';
  const start = (state.paperPage - 1) * PAPER_PAGE_SIZE;
  const pageItems = items.slice(start, start + PAPER_PAGE_SIZE);
  list.innerHTML = pageItems.map(item => item.type === 'job' ? renderPaperJobRow(item.job) : renderPaperRow(item.paper, true)).join('')
    || '<p class="muted">鏆傛棤绗﹀悎鏉′欢鐨勮鏂囥€?/p>';

  $('paperPagination').innerHTML = total > PAPER_PAGE_SIZE ? `
    <button ${state.paperPage === 1 ? 'disabled' : ''} onclick="goPaperPage(${state.paperPage - 1})">涓婁竴椤?/button>
    <span class="meta">绗?${state.paperPage} / ${pageCount} 椤?/span>
    <button ${state.paperPage === pageCount ? 'disabled' : ''} onclick="goPaperPage(${state.paperPage + 1})">涓嬩竴椤?/button>
  ` : '';
  renderPaperSetBatchActions(papers);
  return papers.length;
}

function clampPaperImportWidth(width) {
  return Math.min(520, Math.max(280, Number(width) || 360));
}

function renderPaperImportLayout() {
  const layout = $('paperHomeLayout');
  if (!layout) return;
  state.paperImportWidth = clampPaperImportWidth(state.paperImportWidth);
  layout.style.setProperty('--paper-import-width', `${state.paperImportWidth}px`);
  layout.classList.toggle('paper-import-collapsed', Boolean(state.paperImportCollapsed));
  const toggle = $('paperImportToggleBtn');
  if (toggle) {
    toggle.textContent = state.paperImportCollapsed ? '鈥? : '鈥?;
    toggle.title = state.paperImportCollapsed ? '灞曞紑瀵煎叆闈㈡澘' : '鏀惰捣瀵煎叆闈㈡澘';
  }
}

window.togglePaperImportPane = function() {
  state.paperImportCollapsed = !state.paperImportCollapsed;
  renderPaperImportLayout();
};

function startPaperImportResize(event) {
  if (state.paperImportCollapsed) return;
  event.preventDefault();
  const startX = event.clientX;
  const startWidth = state.paperImportWidth;
  state.paperImportResizing = true;
  document.body.classList.add('paper-sidebar-resizing');
  const move = (moveEvent) => {
    if (!state.paperImportResizing) return;
    state.paperImportWidth = clampPaperImportWidth(startWidth + moveEvent.clientX - startX);
    renderPaperImportLayout();
  };
  const stop = () => {
    state.paperImportResizing = false;
    document.body.classList.remove('paper-sidebar-resizing');
    window.removeEventListener('pointermove', move);
    window.removeEventListener('pointerup', stop);
    window.removeEventListener('pointercancel', stop);
  };
  window.addEventListener('pointermove', move);
  window.addEventListener('pointerup', stop);
  window.addEventListener('pointercancel', stop);
};

function renderPapers() {
  renderPaperImportLayout();
  renderRecentImports();
  renderPaperLibraryTabs();
  let filteredCount = state.papers.length;
  if (state.paperLibraryTab === 'sets') {
    renderPaperSetCards();
  } else {
    filteredCount = renderPaperLibraryAll();
  }
  renderPaperLibraryHeader(filteredCount);

  if (state.selectedPaperId && !state.papers.some(p => p.id === state.selectedPaperId)) {
    state.selectedPaperId = null;
    closePaperDetail();
  }
}

window.goPaperPage = function(page) {
  state.paperPage = page;
  renderPapers();
};

window.viewPaperSetPapers = function(id) {
  state.paperLibraryTab = 'all';
  state.paperFilters.paperSet = id;
  state.paperPage = 1;
  state.paperSetCreateOpen = false;
  state.selectedPaperIds = [];
  renderPapers();
};

function updatePaperFiltersFromInputs() {
  state.paperFilters = {
    query: $('paperSearchInput')?.value.trim() || '',
    year: $('paperYearFilter')?.value || 'all',
    paperSet: $('paperCollectionFilter')?.value || 'all',
    parseStatus: $('paperParseStatusFilter')?.value || 'all',
    extractionStatus: $('paperExtractionStatusFilter')?.value || 'all',
  };
  state.paperPage = 1;
  renderPapers();
}

window.togglePaperSelection = function(id, checked) {
  const selected = new Set(state.selectedPaperIds);
  if (checked) selected.add(id);
  else selected.delete(id);
  state.selectedPaperIds = [...selected];
  renderPaperSetBatchActions(filteredLibraryPapers());
};

function toggleSelectAllPaperSetPapers() {
  const papers = filteredLibraryPapers();
  const selected = selectedPaperIdsInPapers(papers);
  state.selectedPaperIds = selected.length === papers.length ? [] : papers.map(paper => paper.id);
  renderPapers();
}

function selectedPaperObjects() {
  const selected = new Set(state.selectedPaperIds);
  return state.papers.filter(paper => selected.has(paper.id));
}

async function moveSelectedPapersToSet() {
  const targetId = $('batchMovePaperSetSelect').value;
  const ids = uniqueIds(state.selectedPaperIds);
  if (!targetId || !ids.length) return;
  const target = state.paperSets.find(item => item.id === targetId);
  if (!target) return toast('璇烽€夋嫨鐩爣璁烘枃闆?);
  for (const paperSet of validCustomPaperSets()) {
    if (paperSet.id === target.id) {
      await savePaperSetRecord(paperSet, [...(paperSet.paper_ids || []), ...ids]);
    } else {
      const nextIds = (paperSet.paper_ids || []).filter(id => !ids.includes(id));
      if (nextIds.length !== (paperSet.paper_ids || []).length) {
        await savePaperSetRecord(paperSet, nextIds);
      }
    }
  }
  state.selectedPaperIds = [];
  toast(`宸茬Щ鍔?${ids.length} 绡囪鏂嘸);
  await refreshAll();
}

async function runLibraryBatchExtraction() {
  const ids = uniqueIds(state.selectedPaperIds);
  const templateId = $('libraryBatchTemplateSelect').value;
  const template = extractionReadyTemplates().find(item => item.id === templateId);
  if (!ids.length) return toast('璇峰厛閫夋嫨璁烘枃');
  if (!template) return toast('璇烽€夋嫨宸插彂甯冩娊鍙栨ā鏉?);
  const dims = (template.dimensions || []).map(dim => dim.name || dim.dimension_id || dim.label).filter(Boolean);
  if (!dims.length) return toast('褰撳墠妯℃澘娌℃湁鍙敤缁村害');
  state.libraryBatchExtractionBusy = true;
  const startedAt = new Date().toISOString();
  ids.forEach((paperId, index) => {
    updateExtractionJob(jobKey(paperId, templateId), {
      status: 'queued',
      percent: Math.max(4, Math.round((index / Math.max(ids.length, 1)) * 10)),
      message: `绛夊緟鎶藉彇 ${index + 1}/${ids.length} 路 ${template.name}`,
      startedAt,
      templateName: template.name,
    }, false);
  });
  renderExtractionProgressViews();
  let completed = 0;
  try {
    for (let index = 0; index < ids.length; index += 1) {
      const paperId = ids[index];
      const key = jobKey(paperId, templateId);
      const timer = startExtractionJobProgress(key, `姝ｅ湪鎶藉彇 ${index + 1}/${ids.length} 路 ${template.name}`);
      try {
        const run = await api('/api/extractions/run', {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({paper_id: paperId, template_id: templateId, dimension_names: dims}),
        });
        state.runs = [run, ...state.runs.filter(item => item.id !== run.id)];
        updateExtractionJob(key, {status: 'completed', percent: 100, message: `${run.items.length} 鏉＄粨鏋滐紝${run.errors.length} 涓敊璇痐, run});
        completed += 1;
      } catch (err) {
        updateExtractionJob(key, {status: 'failed', percent: 100, message: err.message});
      } finally {
        clearInterval(timer);
      }
    }
  } finally {
    state.libraryBatchExtractionBusy = false;
  }
  state.selectedPaperIds = [];
  toast(`鎵归噺鎶藉彇瀹屾垚锛?{completed}/${ids.length} 绡囨垚鍔焋);
  await refreshAll();
}

async function deleteSelectedPapers() {
  const ids = uniqueIds(state.selectedPaperIds);
  if (!ids.length) return;
  if (!confirm(`纭畾鍒犻櫎閫変腑鐨?${ids.length} 绡囪鏂囧悧锛熺浉鍏虫娊鍙栬褰曞拰绱犳潗涔熶細鍒犻櫎銆俙)) return;
  for (const id of ids) {
    await api(`/api/papers/${id}`, {method: 'DELETE'});
    removePaperOp(id);
    if (state.selectedPaperId === id) {
      state.selectedPaperId = null;
      closePaperDetail();
    }
  }
  state.selectedPaperIds = [];
  toast(`宸插垹闄?${ids.length} 绡囪鏂嘸);
  await refreshAll();
}

async function reparseSelectedPapers() {
  const ids = uniqueIds(state.selectedPaperIds);
  if (!ids.length) return;
  let success = 0;
  const failures = [];
  toast(`寮€濮嬮噸鏂拌В鏋?${ids.length} 绡囪鏂嘸);
  for (const id of ids) {
    const timer = startPaperOpProgress(id, '閲嶆柊瑙ｆ瀽涓?);
    try {
      const paper = await api(`/api/papers/${id}/reparse`, {method: 'POST'});
      upsertPaperInState(paper);
      updatePaperOp(id, {percent: 100, status: '瑙ｆ瀽瀹屾垚'});
      success += 1;
    } catch (err) {
      failures.push(err.message);
      updatePaperOp(id, {percent: 100, status: '瑙ｆ瀽澶辫触'});
    } finally {
      clearInterval(timer);
      setTimeout(() => removePaperOp(id), 700);
    }
  }
  state.selectedPaperIds = [];
  await refreshAll();
  toast(failures.length ? `閲嶆柊瑙ｆ瀽瀹屾垚锛?{success} 绡囨垚鍔燂紝${failures.length} 绡囧け璐 : `閲嶆柊瑙ｆ瀽瀹屾垚锛?{success} 绡囨垚鍔焋);
}

function exportSelectedPapers() {
  const papers = selectedPaperObjects();
  if (!papers.length) return;
  const selected = new Set(papers.map(paper => paper.id));
  const extractionRuns = state.runs.filter(run => selected.has(run.paper_id));
  const templateIds = new Set(extractionRuns.map(run => run.template_id).filter(Boolean));
  const payload = {
    exported_at: new Date().toISOString(),
    paper_count: papers.length,
    extraction_run_count: extractionRuns.length,
    papers,
    extraction_runs: extractionRuns,
    templates: state.templates.filter(template => templateIds.has(template.id)),
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], {type: 'application/json'});
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `litmate_papers_${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
  toast(`宸插鍑?${papers.length} 绡囪鏂囧拰 ${extractionRuns.length} 鏉℃娊鍙栫粨鏋渀);
}

function togglePaperSetCreate(open = !state.paperSetCreateOpen) {
  state.paperSetCreateOpen = open;
  if (!open) {
    setValue('paperSetNameInput', '');
    setValue('paperSetDetailInput', '');
  }
  renderPapers();
}

async function createPaperSet() {
  const name = $('paperSetNameInput').value.trim();
  const detail = $('paperSetDetailInput').value.trim();
  if (!name) return toast('璇峰厛濉啓璁烘枃闆嗗悕绉?);
  await createPaperSetRecord(name, detail, []);
  state.paperSetCreateOpen = false;
  setValue('paperSetNameInput', '');
  setValue('paperSetDetailInput', '');
  toast('璁烘枃闆嗗凡鍒涘缓');
  renderPapers();
}

window.deletePaperSet = async function(id) {
  const paperSet = (state.paperSets || []).find(item => item.id === id);
  if (!paperSet) return;
  if (!confirm(`纭畾鍒犻櫎璁烘枃闆嗐€?{paperSet.name}銆嶅悧锛熻鏂囨枃浠朵笉浼氳鍒犻櫎銆俙)) return;
  await api(`/api/paper-sets/${id}`, {method: 'DELETE'});
  state.paperSets = state.paperSets.filter(item => item.id !== id);
  if (state.paperFilters.paperSet === id) state.paperFilters.paperSet = 'all';
  renderPapers();
  toast('璁烘枃闆嗗凡鍒犻櫎');
};

function renderPaperDetail(p) {
  const meta = p.metadata || {};
  const authors = meta.authors || [];
  const extra = meta.extra || {};
  const published = extra.published ? String(extra.published).slice(0, 10) : '';
  const links = [
    linkButton(meta.url, meta.arxiv_id ? 'arXiv 椤甸潰' : '鏉ユ簮椤甸潰'),
    linkButton(meta.pdf_url, 'PDF'),
    p.file_path ? linkButton(`/api/papers/${p.id}/file`, '鏈湴鏂囦欢') : ''
  ].filter(Boolean).join('');
  const sections = p.sections || [];
  const figures = p.figures || [];
  const references = p.references || [];
  return `
    <article class="paper-record">
      <header class="paper-record-header">
        <div class="paper-kicker">
          <span>${escapeHtml(sourceLabel(p.source))}</span>
          ${meta.arxiv_id ? `<span>arXiv:${escapeHtml(meta.arxiv_id)}</span>` : ''}
          ${meta.year ? `<span>${meta.year}</span>` : ''}
        </div>
        <h3>${escapeHtml(meta.title || 'Untitled')}</h3>
        <p class="paper-authors">${authors.length ? escapeHtml(authors.join(', ')) : '浣滆€呮湭鐭?}</p>
        ${links ? `<div class="paper-links">${links}</div>` : ''}
      </header>

      <section class="paper-abstract">
        <h4>Abstract</h4>
        <p>${escapeHtml(meta.abstract || '鏆傛棤鎽樿銆?)}</p>
      </section>

      <div class="paper-info-grid">
        <section class="paper-info-card">
          <h4>璁烘枃淇℃伅</h4>
          <dl>
            ${metaRow('Paper ID', escapeHtml(p.id))}
            ${metaRow('DOI', escapeHtml(meta.doi || ''))}
            ${metaRow('Venue', escapeHtml(meta.venue || ''))}
            ${metaRow('Published', escapeHtml(published))}
            ${metaRow('Parser', escapeHtml(extra.parser || ''))}
            ${metaRow('MinerU', extra.mineru_error ? escapeHtml(fmt(extra.mineru_error, 220)) : '')}
            ${metaRow('瑙ｆ瀽鑰楁椂', escapeHtml(fmtDuration(extra.parse_duration_seconds)))}
            ${metaRow('Created', escapeHtml((p.created_at || '').slice(0, 19).replace('T', ' ')))}
          </dl>
        </section>

        <section class="paper-info-card">
          <h4>瑙ｆ瀽姒傝</h4>
          <div class="paper-metrics">
            ${paperMetric('Sections', sections.length)}
            ${paperMetric('Chunks', (p.chunks || []).length)}
            ${paperMetric('Figures / Tables', figures.length)}
            ${paperMetric('References', references.length)}
          </div>
        </section>
      </div>

      <section class="paper-content-block">
        <div class="section-heading">
          <h4>Sections</h4>
          <span class="meta">瀹屾暣灞曠ず ${sections.length} 涓珷鑺?/span>
        </div>
        <div class="section-list">
          ${sections.map((s, index) => `
            <details class="section-entry" ${index < 2 ? 'open' : ''}>
              <summary>
                <span>${escapeHtml(s.title || 'Untitled section')}</span>
                <small>page ${s.start_page || '?'}-${s.end_page || '?'}</small>
              </summary>
              <p>${escapeHtml(s.text || '鏆傛棤绔犺妭鏂囨湰銆?)}</p>
            </details>
          `).join('') || '<p class="muted">鏈瘑鍒埌绔犺妭銆?/p>'}
        </div>
      </section>

      <section class="paper-content-block">
        <div class="section-heading">
          <h4>Figures & Tables</h4>
          <span class="meta">灞曠ず鍓?${Math.min(figures.length, 20)} / ${figures.length}</span>
        </div>
        <div class="evidence-list">
          ${figures.slice(0, 20).map(f => `
            <div class="evidence">
              ${f.image_path ? `<img class="evidence-image" src="/api/papers/${p.id}/figures/${f.id}/image" alt="${escapeHtml(f.label || 'Figure/Table')}" loading="lazy" />` : ''}
              <b>${escapeHtml(f.label || 'Figure/Table')}</b>${f.page ? ` 路 page ${f.page}` : ''}<br>
              ${escapeHtml(fmt(f.caption, 1600) || '鏆傛棤鏍囬銆?)}
            </div>
          `).join('') || '<p class="muted">鏈瘑鍒埌鍥捐〃鏍囬銆?/p>'}
        </div>
      </section>

      <section class="paper-content-block">
        <div class="section-heading">
          <h4>References</h4>
          <span class="meta">灞曠ず鍓?${Math.min(references.length, 30)} / ${references.length}</span>
        </div>
        <ol class="reference-list">
          ${references.slice(0, 30).map(r => `<li>${escapeHtml(fmt(r.raw, 600))}</li>`).join('') || '<li class="muted">鏈瘑鍒埌鍙傝€冩枃鐚€?/li>'}
        </ol>
      </section>
    </article>
  `;
}

window.openPaperDetail = function(id) {
  const p = state.papers.find(x => x.id === id);
  if (!p) return;
  state.selectedPaperId = id;
  document.querySelectorAll('.paper-row').forEach(item => {
    item.classList.toggle('active', item.dataset.paperId === id);
  });
  $('paperModalTitle').textContent = p.metadata?.title || '璁烘枃瑙ｆ瀽璇︽儏';
  $('paperModalMeta').textContent = `鏉ユ簮锛?{sourceLabel(p.source)} 路 瀵煎叆锛?{fmtTime(p.created_at)} 路 瑙ｆ瀽锛?{fmtTime(p.updated_at)} 路 瑙ｆ瀽鑰楁椂锛?{fmtDuration(p.metadata?.extra?.parse_duration_seconds)}`;
  $('paperReparseBtn').disabled = Boolean(state.paperOps[p.id]);
  $('paperReparseBtn').textContent = state.paperOps[p.id] ? '閲嶆柊瑙ｆ瀽涓? : '閲嶆柊瑙ｆ瀽';
  $('paperReparseBtn').onclick = () => reparsePaper(p.id);
  $('paperVerifyBtn').disabled = p.metadata?.extra?.review_status === 'verified';
  $('paperVerifyBtn').textContent = p.metadata?.extra?.review_status === 'verified' ? '宸叉牎楠? : '鏍￠獙閫氳繃';
  $('paperVerifyBtn').onclick = () => verifyPaper(p.id);
  $('paperDetail').innerHTML = renderPaperDetail(p);

  const fileUrl = p.file_path && p.file_path.toLowerCase().endsWith('.pdf') ? `/api/papers/${p.id}/file` : '';
  $('paperPdfFrame').hidden = !fileUrl;
  $('paperPdfEmpty').hidden = Boolean(fileUrl);
  $('paperPdfOpen').hidden = !fileUrl;
  if (fileUrl) {
    $('paperPdfFrame').src = `${fileUrl}#toolbar=1&view=FitH`;
    $('paperPdfOpen').href = fileUrl;
  } else {
    $('paperPdfFrame').src = 'about:blank';
    $('paperPdfOpen').href = '#';
  }

  $('paperDetailModal').hidden = false;
  document.body.classList.add('modal-open');
};

window.showPaperDetail = window.openPaperDetail;

function closePaperDetail() {
  $('paperDetailModal').hidden = true;
  $('paperPdfFrame').src = 'about:blank';
  syncModalLock();
}

window.closePaperDetail = closePaperDetail;

window.reparsePaper = async function(id) {
  const p = state.papers.find(x => x.id === id);
  if (!p) return;
  const timer = startPaperOpProgress(id, '閲嶆柊瑙ｆ瀽涓?);
  if (state.selectedPaperId === id && !$('paperDetailModal').hidden) {
    $('paperReparseBtn').disabled = true;
    $('paperReparseBtn').textContent = '閲嶆柊瑙ｆ瀽涓?;
  }
  toast('姝ｅ湪閲嶆柊瑙ｆ瀽璁烘枃...');
  try {
    const paper = await api(`/api/papers/${id}/reparse`, {method: 'POST'});
    upsertPaperInState(paper);
    updatePaperOp(id, {percent: 100, status: '瑙ｆ瀽瀹屾垚'});
    toast('閲嶆柊瑙ｆ瀽瀹屾垚');
    await refreshAll();
    if (state.selectedPaperId === id && !$('paperDetailModal').hidden) {
      openPaperDetail(id);
    }
  } catch (err) {
    updatePaperOp(id, {percent: 100, status: '瑙ｆ瀽澶辫触'});
    toast(err.message);
  } finally {
    clearInterval(timer);
    setTimeout(() => removePaperOp(id), 900);
    if (state.selectedPaperId === id && !$('paperDetailModal').hidden) {
      $('paperReparseBtn').disabled = false;
      $('paperReparseBtn').textContent = '閲嶆柊瑙ｆ瀽';
    }
  }
};

window.verifyPaper = async function(id) {
  const paper = await api(`/api/papers/${id}/verify`, {method: 'POST'});
  upsertPaperInState(paper);
  toast('璁烘枃宸叉爣璁颁负宸叉牎楠?);
  renderPapers();
  renderExtractionPanel();
  openPaperDetail(id);
};

window.exportPaper = function(id) {
  window.open(`/api/export/paper/${id}`, '_blank');
};

window.deletePaper = async function(id) {
  const p = state.papers.find(x => x.id === id);
  if (!p) return;
  if (!confirm(`纭畾鍒犻櫎銆?{p.metadata?.title || id}銆嬪悧锛熺浉鍏虫娊鍙栬褰曞拰绱犳潗涔熶細鍒犻櫎銆俙)) return;
  await api(`/api/papers/${id}`, {method: 'DELETE'});
  removePaperOp(id);
  if (state.selectedPaperId === id) {
    state.selectedPaperId = null;
    closePaperDetail();
  }
  toast('璁烘枃宸插垹闄?);
  await refreshAll();
};

function renderExtractionPanel() {
  const verified = verifiedPapers();
  const selectedTemplateId = $('templateSelect')?.value;
  const verifiedIds = new Set(verified.map(p => p.id));
  state.confirmedExtractPaperIds = state.confirmedExtractPaperIds.filter(id => verifiedIds.has(id));
  state.extractDraftPaperIds = state.extractDraftPaperIds.filter(id => verifiedIds.has(id));
  if (!state.confirmedExtractPaperIds.length) state.extractSelectionMode = 'selecting';
  $('verifiedPaperCount').textContent = verified.length ? `${verified.length} 绡囧凡鏍￠獙` : '鏆傛棤宸叉牎楠岃鏂?;
  const readyTemplates = extractionReadyTemplates();
  $('templateSelect').innerHTML = readyTemplates.map(t => `<option value="${t.id}">${escapeHtml(t.name)} (${t.version})</option>`).join('');
  if (selectedTemplateId && readyTemplates.some(t => t.id === selectedTemplateId)) {
    $('templateSelect').value = selectedTemplateId;
  }
  renderExtractPaperChecks();
  renderTemplateSummary();
  renderRunList();
  renderDimensionChecks();
  renderExtractionPaperRuns();
}

function verifiedPapers() {
  return state.papers.filter(p => p.metadata?.extra?.review_status === 'verified');
}

function draftExtractPaperIds() {
  return [...document.querySelectorAll('.extractPaperCheck:checked')].map(input => input.value);
}

function selectedExtractPaperIds() {
  return state.confirmedExtractPaperIds;
}

function setExtractionSelectionMode(mode) {
  state.extractSelectionMode = mode;
  renderExtractPaperChecks();
  renderExtractionPaperRuns();
}

function removeConfirmedExtractPaper(id) {
  state.confirmedExtractPaperIds = state.confirmedExtractPaperIds.filter(item => item !== id);
  state.extractDraftPaperIds = state.extractDraftPaperIds.filter(item => item !== id);
  if (!state.confirmedExtractPaperIds.length) state.extractSelectionMode = 'selecting';
  renderExtractPaperChecks();
  renderExtractionPaperRuns();
}
window.removeConfirmedExtractPaper = removeConfirmedExtractPaper;

function renderExtractPaperChecks() {
  const confirmed = new Set(state.confirmedExtractPaperIds);
  const draft = new Set(state.extractDraftPaperIds.length ? state.extractDraftPaperIds : state.confirmedExtractPaperIds);
  const verified = verifiedPapers();
  const isSelecting = state.extractSelectionMode !== 'confirmed';
  $('extractPaperSelectionLabel').textContent = isSelecting ? '閫夋嫨宸叉牎楠岃鏂? : '宸查€夎鏂?;
  $('confirmExtractPapersBtn').disabled = !isSelecting || !verified.length;
  $('addExtractPapersBtn').disabled = isSelecting || !verified.length;
  $('selectAllVerifiedPapersBtn').hidden = !isSelecting;
  $('clearSelectedPapersBtn').hidden = !isSelecting;
  if (!verified.length) {
    $('extractPaperChecks').innerHTML = '<p class="muted">鏆傛棤宸叉牎楠岃鏂囥€傝鍏堝湪鈥滆鏂囩鐞嗏€濅腑鎵撳紑璁烘枃璇︽儏骞剁偣鍑烩€滄牎楠岄€氳繃鈥濄€?/p>';
    return;
  }
  if (!isSelecting) {
    const selectedPapers = state.confirmedExtractPaperIds.map(id => state.papers.find(p => p.id === id)).filter(Boolean);
    $('extractPaperChecks').innerHTML = selectedPapers.map(p => {
      const latest = latestRunForPaper(p.id, $('templateSelect').value);
      return `<div class="selected-extract-paper">
        <div>
          <b>${escapeHtml(fmt(p.metadata?.title || p.id, 92))}</b>
          <span class="muted">${latest ? `鏈€杩戞娊鍙?${fmtTime(latest.created_at)}` : '鏈娊鍙?}</span>
        </div>
        <button type="button" class="selected-extract-remove" aria-label="鍒犻櫎宸查€夎鏂? onclick="removeConfirmedExtractPaper('${escapeHtml(p.id)}')">脳</button>
      </div>`;
    }).join('') || '<p class="muted">鏆傛棤宸茬‘璁よ鏂囥€傜偣鍑烩€滄柊澧炩€濋€夋嫨璁烘枃鍚庡啀纭畾銆?/p>';
    return;
  }
  $('extractPaperChecks').innerHTML = verified.map(p => {
    const latest = latestRunForPaper(p.id, $('templateSelect').value);
    return `<label>
      <input type="checkbox" class="extractPaperCheck" value="${escapeHtml(p.id)}" ${draft.has(p.id) || confirmed.has(p.id) ? 'checked' : ''} />
      <span>${escapeHtml(fmt(p.metadata?.title || p.id, 92))}</span>
      <span class="muted">${latest ? `鏈€杩戞娊鍙?${fmtTime(latest.created_at)}` : '鏈娊鍙?}</span>
    </label>`;
  }).join('');
  document.querySelectorAll('.extractPaperCheck').forEach(input => {
    input.onchange = () => {
      state.extractDraftPaperIds = draftExtractPaperIds();
    };
  });
}

function renderTemplateSummary() {
  const readyTemplates = extractionReadyTemplates();
  const t = readyTemplates.find(x => x.id === $('templateSelect').value) || readyTemplates[0];
  if (!t) {
    $('templateSummary').textContent = '鏆傛棤宸插彂甯冩娊鍙栨ā鏉裤€傝鍏堝湪鈥滃璞″缓妯″伐浣滃彴鈥濅腑鍙戝竷妯℃澘銆?;
    return;
  }
  $('templateSummary').innerHTML = `
    <b>${escapeHtml(t.name)}</b>
    <span>${escapeHtml(t.description || '鏃犺鏄?)}</span>
    <span>${(t.dimensions || []).length} 涓淮搴?路 婵€娲?Prompt锛?{escapeHtml(t.active_prompt_id || '榛樿')}</span>
  `;
}

function renderDimensionChecks() {
  const readyTemplates = extractionReadyTemplates();
  const t = readyTemplates.find(x => x.id === $('templateSelect').value) || readyTemplates[0];
  $('dimensionChecks').innerHTML = t ? t.dimensions.map(d => `
    <label><input type="checkbox" class="dimCheck" value="${d.name}" checked /> ${escapeHtml(d.label)} <span class="muted">${escapeHtml(d.name)}</span></label>
  `).join('') : '<p class="muted">鏆傛棤妯℃澘銆?/p>';
}

function latestRunForPaper(paperId, templateId = '') {
  return paperRuns(paperId, templateId)[0] || null;
}

function jobKey(paperId, templateId) {
  return `${paperId}::${templateId}`;
}

function renderExtractionProgressViews() {
  renderPapers();
  renderExtractionPaperRuns();
}

function updateExtractionJob(key, patch, shouldRender = true) {
  state.extractionJobs[key] = {
    ...(state.extractionJobs[key] || {}),
    ...patch,
    updatedAt: new Date().toISOString(),
  };
  if (shouldRender) renderExtractionProgressViews();
}

function startExtractionJobProgress(key, message = '鎶藉彇涓?) {
  let value = 12;
  updateExtractionJob(key, {status: 'running', percent: value, message});
  return setInterval(() => {
    if (state.extractionJobs[key]?.status !== 'running') return;
    value = Math.min(92, value + Math.max(1, Math.round((94 - value) * 0.14)));
    updateExtractionJob(key, {status: 'running', percent: value, message});
  }, 900);
}

function renderExtractionPaperRuns() {
  const ids = selectedExtractPaperIds();
  const templateId = $('templateSelect')?.value || '';
  const isSelecting = state.extractSelectionMode !== 'confirmed';
  $('selectedExtractionCount').textContent = ids.length ? `${ids.length} 绡囧緟澶勭悊` : (isSelecting ? '寰呯‘璁よ鏂? : '璇烽€夋嫨璁烘枃');
  const papers = ids.map(id => state.papers.find(p => p.id === id)).filter(Boolean);
  $('extractionPaperRuns').innerHTML = papers.map(p => {
    const job = state.extractionJobs[jobKey(p.id, templateId)];
    const run = job?.run || latestRunForPaper(p.id, templateId);
    const status = job?.status || (run ? 'completed' : 'idle');
    const statusText = {
      queued: '绛夊緟鎶藉彇',
      running: '鎶藉彇涓?,
      completed: '宸插畬鎴?,
      failed: '澶辫触',
      idle: '鏈娊鍙?,
    }[status] || status;
    const progress = extractionJobProgress(job || {status});
    return `<article class="extraction-paper-card ${escapeHtml(status)}">
      <div class="extraction-paper-main">
        <h3>${escapeHtml(p.metadata?.title || p.id)}</h3>
        <div class="meta">宸叉牎楠?路 ${escapeHtml(sourceLabel(p.source))} 路 ${run ? `鏈€杩戣繍琛?${fmtTime(run.created_at)}` : '鏆傛棤杩愯璁板綍'}</div>
        <div class="extraction-progress-track">
          <div class="extraction-progress-bar" style="width:${progress}%"></div>
        </div>
        <div class="meta">${escapeHtml(statusText)}${job?.message ? ` 路 ${escapeHtml(job.message)}` : ''}</div>
        ${run?.errors?.length ? `<pre>${escapeHtml(run.errors.slice(0, 3).join('\n'))}</pre>` : ''}
      </div>
      <div class="extraction-paper-actions">
        <button type="button" ${run ? '' : 'disabled'} onclick="openExtractionResult('${escapeHtml(run?.id || '')}')">鏌ョ湅缁撴灉</button>
        <button type="button" ${run ? '' : 'disabled'} onclick="selectRunForReview('${escapeHtml(run?.id || '')}')">浜烘満瀹℃煡</button>
        <button type="button" ${run ? '' : 'disabled'} onclick="window.open('/api/export/run/${escapeHtml(run?.id || '')}', '_blank')">瀵煎嚭</button>
      </div>
    </article>`;
  }).join('') || `<p class="muted">${isSelecting ? '璇峰湪宸︿晶鍕鹃€夎鏂囧苟鐐瑰嚮鈥滅‘瀹氣€濄€? : '璇蜂粠宸︿晶閫夋嫨涓€绡囨垨澶氱瘒宸叉牎楠岃鏂囥€?}</p>`;
}

function renderRunList() {
  $('runList').innerHTML = state.runs.map(r => {
    const p = state.papers.find(x => x.id === r.paper_id);
    const t = state.templates.find(x => x.id === r.template_id);
    return `<div class="item">
      <h3>${escapeHtml(p?.metadata.title || r.paper_id)}</h3>
      <div class="meta">${escapeHtml(t?.name || r.template_id)} 路 run ${r.id} 路 ${r.status} 路 items ${r.items.length} 路 errors ${r.errors.length}</div>
      ${r.errors.length ? `<pre>${escapeHtml(r.errors.join('\n'))}</pre>` : ''}
      <button onclick="openExtractionResult('${r.id}')">鏌ョ湅缁撴灉</button>
      <button onclick="selectRunForReview('${r.id}')">瀹℃煡姝ょ粨鏋?/button>
      <button onclick="window.open('/api/export/run/${r.id}', '_blank')">瀵煎嚭 JSON</button>
    </div>`;
  }).join('') || '<p class="muted">鏆傛棤鎶藉彇璁板綍銆?/p>';
}

window.selectRunForReview = function(id) {
  if (!id) return;
  const run = reviewableRuns().find(item => item.id === id) || state.runs.find(item => item.id === id);
  state.reviewRunId = id;
  state.reviewTemplateId = run?.template_id || null;
  state.reviewSelectedPaperIds = run?.paper_id ? [run.paper_id] : [];
  state.reviewSelectedPaperSetIds = [];
  state.reviewDraftDirty = false;
  syncReviewDraftFromApplied(true);
  state.reviewItemIndex = 0;
  resetReviewActionMode();
  document.querySelector('[data-tab="review"]').click();
  renderReviewPanel();
};

window.openLatestExtractionResult = function(paperId) {
  const run = paperRuns(paperId)[0];
  if (!run) return toast('杩欑瘒璁烘枃鏆傛棤鎶藉彇缁撴灉');
  openExtractionResult(run.id);
};

window.openExtractionResult = function(id) {
  const run = state.runs.find(r => r.id === id);
  if (!run) return toast('鏈壘鍒版娊鍙栫粨鏋?);
  state.selectedExtractionRunId = id;
  const paper = state.papers.find(p => p.id === run.paper_id);
  const template = state.templates.find(t => t.id === run.template_id);
  $('extractionResultTitle').textContent = paper?.metadata?.title || run.paper_id;
  $('extractionResultMeta').textContent = `${template?.name || run.template_id} 路 ${run.status} 路 ${run.items.length} 鏉＄粨鏋?路 ${run.errors.length} 涓敊璇?路 ${fmtTime(run.created_at)}`;
  $('extractionResultBody').innerHTML = `
    ${run.errors.length ? `<section class="extraction-result-errors"><h3>閿欒</h3><pre>${escapeHtml(run.errors.join('\n'))}</pre></section>` : ''}
    <section class="extraction-result-grid">
      ${run.items.map(item => `
        <article class="extraction-result-item">
          <header>
            <h3>${escapeHtml(item.dimension_label || item.dimension_name)} <span class="badge ${item.review_status}">${escapeHtml(reviewStatusLabel(item.review_status))}</span></h3>
            <div class="meta">${escapeHtml(item.dimension_name)} 路 缃俊搴?${Number(item.confidence || 0).toFixed(2)}</div>
          </header>
          <h4>${escapeHtml(item.edited_title || item.title || '鏈懡鍚嶇粨鏋?)}</h4>
          <p>${escapeHtml(item.edited_content || item.content || '鏃犲唴瀹?)}</p>
          ${(item.evidence || []).slice(0, 3).map(ev => `<div class="evidence"><b>${escapeHtml(ev.section_title || 'Unknown')}</b> 路 page ${ev.page_start || '?'}-${ev.page_end || '?'}<br/>${escapeHtml(ev.quote)}</div>`).join('') || '<p class="muted">鏃犺瘉鎹粦瀹氥€?/p>'}
        </article>
      `).join('') || '<p class="muted">鏆傛棤鎶藉彇鏉＄洰銆?/p>'}
    </section>
  `;
  $('extractionResultReviewBtn').onclick = () => selectRunForReview(id);
  $('extractionResultExportBtn').onclick = () => window.open(`/api/export/run/${id}`, '_blank');
  $('extractionResultModal').hidden = false;
  document.body.classList.add('modal-open');
};

function closeExtractionResultModal() {
  $('extractionResultModal').hidden = true;
  syncModalLock();
}

async function runSelectedExtractions() {
  const paperIds = selectedExtractPaperIds();
  const templateId = $('templateSelect').value;
  const dims = [...document.querySelectorAll('.dimCheck:checked')].map(x => x.value);
  if (!paperIds.length) return toast('璇峰厛閫夋嫨璁烘枃骞剁偣鍑烩€滅‘瀹氣€?);
  if (!templateId) return toast('璇烽€夋嫨鎶藉彇妯℃澘');
  if (!dims.length) return toast('璇疯嚦灏戦€夋嫨涓€涓娊鍙栫淮搴?);
  $('runExtractionBtn').disabled = true;
  paperIds.forEach(id => {
    updateExtractionJob(jobKey(id, templateId), {status: 'queued', percent: 8, message: '绛夊緟寮€濮?}, false);
  });
  renderExtractionProgressViews();
  let completed = 0;
  for (const paperId of paperIds) {
    const key = jobKey(paperId, templateId);
    const timer = startExtractionJobProgress(key, '姝ｅ湪璋冪敤澶фā鍨?);
    try {
      const run = await api('/api/extractions/run', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({paper_id: paperId, template_id: templateId, dimension_names: dims}),
      });
      state.runs = [run, ...state.runs.filter(item => item.id !== run.id)];
      updateExtractionJob(key, {status: 'completed', percent: 100, message: `${run.items.length} 鏉＄粨鏋滐紝${run.errors.length} 涓敊璇痐, run}, false);
      completed += 1;
    } catch (err) {
      updateExtractionJob(key, {status: 'failed', percent: 100, message: err.message}, false);
    } finally {
      clearInterval(timer);
    }
    renderRunList();
    renderExtractionProgressViews();
  }
  $('runExtractionBtn').disabled = false;
  toast(`鎶藉彇浠诲姟瀹屾垚锛?{completed}/${paperIds.length} 绡囨垚鍔焋);
  await refreshAll();
  paperIds.forEach(id => {
    const key = jobKey(id, templateId);
    const latest = latestRunForPaper(id, templateId);
    if (latest && state.extractionJobs[key]?.status === 'completed') {
      updateExtractionJob(key, {run: latest}, false);
    }
  });
  renderExtractionProgressViews();
}

const REVIEW_ACTIONS = [
  {value: 'confirm', label: '纭姝ｇ‘', hint: '鎶藉彇缁撴灉姝ｇ‘锛屽彲鍏ュ簱', tone: 'accept'},
  {value: 'revise', label: '淇敼鍚庢帴鍙?, hint: '缁撴灉閮ㄥ垎姝ｇ‘锛屼汉宸ヤ慨鏀瑰悗鍏ュ簱', tone: 'accept'},
  {value: 'reject', label: '椹冲洖', hint: '缁撴灉閿欒锛屼笉鍏ュ簱', tone: 'reject'},
  {value: 'mark_not_reported', label: '搴斾负鏈姤鍛?, hint: '璁烘枃娌℃湁鎶ュ憡璇ヤ俊鎭紝妯″瀷涓嶅簲鐢熸垚', tone: 'warn'},
  {value: 'mark_evidence_insufficient', label: '璇佹嵁涓嶈冻', hint: '绛旀鍙兘瀵癸紝浣嗚瘉鎹笉澶?, tone: 'warn'},
  {value: 'mark_over_inferred', label: '杩囧害鎺ㄦ柇', hint: '妯″瀷鎺ㄦ柇杩囧', tone: 'warn'},
  {value: 'mark_wrong_dimension', label: '缁村害褰掔被閿欒', hint: '鎶藉埌浜嗕俊鎭紝浣嗘斁閿欑淮搴?, tone: 'warn'},
  {value: 'mark_wrong_object', label: '瀵硅薄鍒ゆ柇閿欒', hint: '鏍规湰涓嶅睘浜庡綋鍓嶇爺绌跺璞?, tone: 'reject'},
];

const REVIEW_ERROR_TAGS = [
  {value: 'answer_too_generic', label: '绛旀杩囨硾'},
  {value: 'answer_too_verbose', label: '绛旀澶暱'},
  {value: 'missing_key_information', label: '閬楁紡鍏抽敭淇℃伅'},
  {value: 'wrong_object_boundary', label: '瀵硅薄杈圭晫閿欒'},
  {value: 'wrong_dimension', label: '缁村害閿欒'},
  {value: 'wrong_section_evidence', label: '璇佹嵁绔犺妭涓嶅悎閫?},
  {value: 'evidence_missing', label: '缂哄皯璇佹嵁'},
  {value: 'evidence_not_support_answer', label: '璇佹嵁涓嶆敮鎾戠瓟妗?},
  {value: 'over_inference', label: '杩囧害鎺ㄦ柇'},
  {value: 'not_reported_should_be_used', label: '搴旇鏍囪鏈姤鍛?},
  {value: 'related_work_misused', label: '璇敤 related work'},
  {value: 'experiment_result_misused', label: '璇妸瀹為獙缁撴灉褰撴満鍒舵垨缁忛獙'},
  {value: 'definition_confused', label: '瀹氫箟娣锋穯'},
  {value: 'method_step_confused', label: '鏂规硶姝ラ娣锋穯'},
  {value: 'effect_claim_overstated', label: '鏁堟灉 claim 澶稿ぇ'},
];

const REVIEW_STATUS_LABELS = {
  pending: '寰呭鏌?,
  confirm: '纭姝ｇ‘',
  revise: '淇敼鍚庢帴鍙?,
  reject: '椹冲洖',
  mark_not_reported: '搴斾负鏈姤鍛?,
  mark_evidence_insufficient: '璇佹嵁涓嶈冻',
  mark_over_inferred: '杩囧害鎺ㄦ柇',
  mark_wrong_dimension: '缁村害褰掔被閿欒',
  mark_wrong_object: '瀵硅薄鍒ゆ柇閿欒',
  confirmed: '宸茬‘璁?,
  needs_revision: '闇€淇敼',
  rejected: '宸查┏鍥?,
};

const REVIEW_ROOT_CAUSES = [
  {value: '', label: '涓嶅綊鍥?},
  {value: 'result_error', label: '缁撴灉鏈韩閿欒'},
  {value: 'dimension_definition_unclear', label: '缁村害瀹氫箟涓嶆竻'},
  {value: 'prompt_instruction_unclear', label: 'Prompt 娌¤娓呮'},
  {value: 'object_boundary_unclear', label: '瀵硅薄杈圭晫涓嶆竻'},
  {value: 'evidence_policy_unclear', label: '璇佹嵁瑙勫垯涓嶆竻'},
];

const REVIEW_SUGGESTED_TARGETS = [
  {value: '', label: '鏆備笉鎸囧畾'},
  {value: 'dimension.question', label: '缁村害闂'},
  {value: 'dimension.boundary', label: '缁村害杈圭晫'},
  {value: 'dimension.output_schema', label: '缁村害杈撳嚭缁撴瀯'},
  {value: 'prompt.dimension_instruction', label: 'Prompt 缁村害璇存槑'},
  {value: 'prompt.evidence_policy', label: 'Prompt 璇佹嵁瑙勫垯'},
  {value: 'prompt.not_reported_policy', label: 'Prompt 鏈姤鍛婅鍒?},
  {value: 'prompt.inference_policy', label: 'Prompt 鎺ㄦ柇瑙勫垯'},
  {value: 'object_definition.working_definition', label: '瀵硅薄宸ヤ綔瀹氫箟'},
  {value: 'object_definition.inclusion_criteria', label: '瀵硅薄绾冲叆鏍囧噯'},
  {value: 'object_definition.exclusion_criteria', label: '瀵硅薄鎺掗櫎鏍囧噯'},
  {value: 'object_definition.observation_signals', label: '瀵硅薄瑙傚療淇″彿'},
];

function reviewableRunItems(run) {
  return (run?.items || []).filter(item => item && (
    item.dimension_name ||
    item.dimension_label ||
    item.title ||
    item.content ||
    item.edited_content ||
    item.normalized_value
  ));
}

function reviewableRuns() {
  return [...(state.runs || [])]
    .filter(run => reviewableRunItems(run).length > 0)
    .sort((a, b) => {
      const timeA = Date.parse(a.created_at || a.updated_at || '') || 0;
      const timeB = Date.parse(b.created_at || b.updated_at || '') || 0;
      return (timeB - timeA) || String(b.id || '').localeCompare(String(a.id || ''));
    });
}

function latestReviewRunsByPaper(templateId) {
  const runs = reviewableRuns().filter(run => !templateId || run.template_id === templateId);
  const byPaper = new Map();
  runs.forEach(run => {
    if (!byPaper.has(run.paper_id)) byPaper.set(run.paper_id, run);
  });
  return [...byPaper.values()];
}

function reviewPaperIdsFromSets(setIds, validPaperIds = null) {
  const allowed = validPaperIds ? new Set(validPaperIds) : null;
  const ids = [];
  (state.paperSets || []).forEach(paperSet => {
    if (!setIds.includes(paperSet.id)) return;
    (paperSet.paper_ids || []).forEach(paperId => {
      if (!allowed || allowed.has(paperId)) ids.push(paperId);
    });
  });
  return uniqueIds(ids);
}

function reviewSelectedPaperIds(templateId) {
  const validPaperIds = latestReviewRunsByPaper(templateId).map(run => run.paper_id);
  const selectedPapers = uniqueIds(state.reviewSelectedPaperIds).filter(id => validPaperIds.includes(id));
  const selectedFromSets = reviewPaperIdsFromSets(state.reviewSelectedPaperSetIds || [], validPaperIds);
  return uniqueIds([...selectedPapers, ...selectedFromSets]);
}

function selectedReviewTemplateId() {
  if (state.reviewTemplateId) return state.reviewTemplateId;
  const current = reviewableRuns().find(run => run.id === state.reviewRunId);
  return current?.template_id || reviewableRuns()[0]?.template_id || '';
}

function reviewDraftFilters() {
  return state.reviewDraftFilters || {...state.reviewFilters};
}

function syncReviewDraftFromApplied(force = false) {
  if (!force && state.reviewDraftDirty) return;
  state.reviewDraftTemplateId = selectedReviewTemplateId();
  state.reviewDraftPaperIds = [...(state.reviewSelectedPaperIds || [])];
  state.reviewDraftPaperSetIds = [...(state.reviewSelectedPaperSetIds || [])];
  state.reviewDraftFilters = {...state.reviewFilters};
}

function reviewDraftSelectedPaperIds(templateId = state.reviewDraftTemplateId) {
  const validPaperIds = latestReviewRunsByPaper(templateId).map(run => run.paper_id);
  const selectedPapers = uniqueIds(state.reviewDraftPaperIds).filter(id => validPaperIds.includes(id));
  const selectedFromSets = reviewPaperIdsFromSets(state.reviewDraftPaperSetIds || [], validPaperIds);
  return uniqueIds([...selectedPapers, ...selectedFromSets]);
}

function reviewDraftScopedRuns() {
  const templateId = state.reviewDraftTemplateId || selectedReviewTemplateId();
  const paperIds = new Set(reviewDraftSelectedPaperIds(templateId));
  if (!templateId || !paperIds.size) return [];
  return latestReviewRunsByPaper(templateId).filter(run => paperIds.has(run.paper_id));
}

function reviewScopedRuns() {
  const templateId = selectedReviewTemplateId();
  const paperIds = new Set(reviewSelectedPaperIds(templateId));
  if (!templateId || !paperIds.size) return [];
  const scoped = latestReviewRunsByPaper(templateId).filter(run => paperIds.has(run.paper_id));
  const current = reviewableRuns().find(run => run.id === state.reviewRunId);
  if (current && current.template_id === templateId && paperIds.has(current.paper_id)) {
    const currentIndex = scoped.findIndex(run => run.paper_id === current.paper_id);
    if (currentIndex >= 0) scoped[currentIndex] = current;
    else scoped.unshift(current);
  }
  return scoped;
}

function selectReviewRunForSelection(templateId, paperIds = []) {
  const ids = Array.isArray(paperIds) ? paperIds : [paperIds].filter(Boolean);
  const runs = latestReviewRunsByPaper(templateId);
  if (!runs.length) return null;
  if (ids.length) {
    const paperRun = runs.find(run => ids.includes(run.paper_id));
    if (paperRun) return paperRun;
  }
  return runs[0] || null;
}

function clampReviewSidebarWidth(width) {
  return Math.min(520, Math.max(260, Number(width) || 300));
}

function renderReviewSidebarLayout() {
  const layout = $('reviewLayout');
  if (!layout) return;
  state.reviewSidebarWidth = clampReviewSidebarWidth(state.reviewSidebarWidth);
  layout.style.setProperty('--review-sidebar-width', `${state.reviewSidebarWidth}px`);
  layout.classList.toggle('review-sidebar-collapsed', Boolean(state.reviewSidebarCollapsed));
  const toggle = $('reviewSidebarToggleBtn');
  if (toggle) {
    toggle.textContent = state.reviewSidebarCollapsed ? '鈥? : '鈥?;
    toggle.title = state.reviewSidebarCollapsed ? '灞曞紑宸︿晶闈㈡澘' : '鏀惰捣宸︿晶闈㈡澘';
  }
}

function reviewDropdownLabel(selectedIds, options, emptyLabel) {
  const names = options.filter(option => selectedIds.includes(option.id)).map(option => option.label);
  if (!names.length) return emptyLabel;
  if (names.length === 1) return names[0];
  return `${names.length} 椤瑰凡閫夋嫨`;
}

function renderReviewCheckDropdown(kind, options, selectedIds, open, emptyLabel) {
  const toggleFn = kind === 'paper' ? 'toggleReviewPaperDropdown' : 'toggleReviewPaperSetDropdown';
  const changeFn = kind === 'paper' ? 'toggleReviewDraftPaper' : 'toggleReviewDraftPaperSet';
  const label = reviewDropdownLabel(selectedIds, options, emptyLabel);
  const menu = open ? `
    <div class="review-check-menu">
      ${options.map(option => {
        const checked = selectedIds.includes(option.id);
        return `
          <label class="review-check-option" title="${escapeHtml(option.label)}">
            <input type="checkbox" ${checked ? 'checked' : ''} onchange="${changeFn}(${escapeHtml(JSON.stringify(option.id))}, this.checked)" />
            <span>${escapeHtml(fmt(option.label, 42))}</span>
          </label>
        `;
      }).join('') || `<div class="review-check-empty">${escapeHtml(emptyLabel)}</div>`}
    </div>
  ` : '';
  return `
    <div class="review-check-dropdown ${open ? 'open' : ''}">
      <button type="button" class="review-check-trigger" onclick="${toggleFn}()" title="${escapeHtml(label)}">
        <span>${escapeHtml(fmt(label, 36))}</span>
        <b>${open ? '鏀惰捣' : '閫夋嫨'}</b>
      </button>
      ${menu}
    </div>
  `;
}

function renderReviewPanel() {
  renderReviewSidebarLayout();
  const runs = reviewableRuns();
  const templateSelect = $('reviewTemplateSelect');
  const paperDropdown = $('reviewPaperDropdown');
  const paperSetDropdown = $('reviewPaperSetDropdown');
  const summary = $('reviewSelectionSummary');
  const scopeBody = $('reviewScopeBody');
  const scopeIcon = $('reviewScopeToggleIcon');
  syncReviewDraftFromApplied();

  if (!runs.length) {
    state.reviewRunId = null;
    state.reviewTemplateId = null;
    state.reviewSelectedPaperIds = [];
    state.reviewSelectedPaperSetIds = [];
    if (templateSelect) {
      templateSelect.innerHTML = '<option value="">鏆傛棤鍙鏌ュ璞?/option>';
      templateSelect.disabled = true;
    }
    if (paperDropdown) paperDropdown.innerHTML = renderReviewCheckDropdown('paper', [], [], false, '鏆傛棤鍙鏌ヨ鏂?);
    if (paperSetDropdown) paperSetDropdown.innerHTML = renderReviewCheckDropdown('paperSet', [], [], false, '鏆傛棤鍙鏌ヨ鏂囬泦鍚?);
    if (summary) summary.textContent = '鏆傛棤鍙鏌ョ粨鏋?;
    if (scopeBody) scopeBody.hidden = !state.reviewScopePanelOpen;
    if (scopeIcon) scopeIcon.textContent = state.reviewScopePanelOpen ? '鏀惰捣' : '灞曞紑';
    renderReviewFilters();
    renderReviewWorkbench();
    return;
  }

  const templateIds = uniqueIds(runs.map(run => run.template_id));
  let validRun = runs.find(run => run.id === state.reviewRunId) || runs[0];
  const hadAppliedScope = Boolean(state.reviewTemplateId || state.reviewSelectedPaperIds.length || state.reviewSelectedPaperSetIds.length);
  state.reviewTemplateId = templateIds.includes(state.reviewTemplateId) ? state.reviewTemplateId : validRun.template_id;
  const appliedPaperRuns = latestReviewRunsByPaper(state.reviewTemplateId);
  const appliedValidPaperIds = appliedPaperRuns.map(run => run.paper_id);
  const appliedSetOptions = validCustomPaperSets().filter(paperSet =>
    (paperSet.paper_ids || []).some(paperId => appliedValidPaperIds.includes(paperId))
  );
  state.reviewSelectedPaperIds = uniqueIds(state.reviewSelectedPaperIds).filter(id => appliedValidPaperIds.includes(id));
  state.reviewSelectedPaperSetIds = uniqueIds(state.reviewSelectedPaperSetIds).filter(id => appliedSetOptions.some(item => item.id === id));
  if (!hadAppliedScope && !state.reviewSelectedPaperIds.length && !state.reviewSelectedPaperSetIds.length) {
    const fallbackRun = validRun.template_id === state.reviewTemplateId ? validRun : appliedPaperRuns[0];
    state.reviewSelectedPaperIds = fallbackRun?.paper_id ? [fallbackRun.paper_id] : [];
  }
  if (!templateIds.includes(state.reviewDraftTemplateId)) state.reviewDraftTemplateId = state.reviewTemplateId || validRun.template_id;
  if (templateSelect) {
    templateSelect.disabled = false;
    templateSelect.innerHTML = templateIds.map(templateId => {
      const template = state.templates.find(item => item.id === templateId);
      const label = template?.name || templateId;
      return `<option value="${escapeHtml(templateId)}" title="${escapeHtml(label)}">${escapeHtml(fmt(label, 22))}</option>`;
    }).join('');
    templateSelect.value = state.reviewDraftTemplateId;
  }

  const paperRuns = latestReviewRunsByPaper(state.reviewDraftTemplateId);
  const validPaperIds = paperRuns.map(run => run.paper_id);
  const paperSetOptions = validCustomPaperSets().filter(paperSet =>
    (paperSet.paper_ids || []).some(paperId => validPaperIds.includes(paperId))
  );
  let draftSetIds = uniqueIds(state.reviewDraftPaperSetIds).filter(id => paperSetOptions.some(item => item.id === id));
  let draftPaperIds = uniqueIds(state.reviewDraftPaperIds).filter(id => validPaperIds.includes(id));
  if (!state.reviewDraftDirty && !draftPaperIds.length && !draftSetIds.length && validRun?.paper_id && validRun.template_id === state.reviewDraftTemplateId) draftPaperIds = [validRun.paper_id];
  if (!state.reviewDraftDirty && !draftPaperIds.length && !draftSetIds.length && paperRuns[0]) draftPaperIds = [paperRuns[0].paper_id];
  state.reviewDraftPaperIds = draftPaperIds;
  state.reviewDraftPaperSetIds = draftSetIds;

  const paperOptions = paperRuns.map(run => {
    const paper = state.papers.find(item => item.id === run.paper_id);
    return {id: run.paper_id, label: paper?.metadata?.title || run.paper_id};
  });
  const setOptions = paperSetOptions.map(item => ({id: item.id, label: item.name}));
  if (paperDropdown) paperDropdown.innerHTML = renderReviewCheckDropdown('paper', paperOptions, draftPaperIds, state.reviewPaperDropdownOpen, '璇烽€夋嫨璁烘枃');
  if (paperSetDropdown) paperSetDropdown.innerHTML = renderReviewCheckDropdown('paperSet', setOptions, draftSetIds, state.reviewPaperSetDropdownOpen, '璇烽€夋嫨璁烘枃闆嗗悎');

  const scopedRuns = reviewScopedRuns();
  state.reviewRunId = (scopedRuns.find(run => run.id === state.reviewRunId) || scopedRuns[0])?.id || null;
  if (summary) {
    const appliedPaperCount = reviewSelectedPaperIds(selectedReviewTemplateId()).length;
    const appliedResultCount = scopedRuns.reduce((total, run) => total + reviewableRunItems(run).length, 0);
    const draftPaperCount = reviewDraftSelectedPaperIds(state.reviewDraftTemplateId).length;
    const draftResultCount = reviewDraftScopedRuns().reduce((total, run) => total + reviewableRunItems(run).length, 0);
    summary.textContent = state.reviewDraftDirty
      ? `寰呭簲鐢細${draftPaperCount} 绡囪鏂?路 ${draftSetIds.length} 涓泦鍚?路 ${draftResultCount} 鏉＄粨鏋渀
      : `${appliedPaperCount} 绡囪鏂?路 ${state.reviewSelectedPaperSetIds.length} 涓泦鍚?路 ${appliedResultCount} 鏉＄粨鏋渀;
  }
  if (scopeBody) scopeBody.hidden = !state.reviewScopePanelOpen;
  if (scopeIcon) scopeIcon.textContent = state.reviewScopePanelOpen ? '鏀惰捣' : '灞曞紑';

  renderReviewFilters();
  renderReviewWorkbench();
}

function confidenceClass(value) {
  const score = Number(value || 0);
  if (score >= 0.75) return 'high';
  if (score >= 0.45) return 'medium';
  return 'low';
}

function confidenceText(value) {
  const score = Number(value || 0);
  return Number.isFinite(score) ? score.toFixed(2) : '-';
}

function confidenceLevelText(value) {
  const cls = confidenceClass(value);
  return {high: 'high', medium: 'medium', low: 'low'}[cls] || '-';
}

function reviewStatusLabel(status) {
  return REVIEW_STATUS_LABELS[status] || status || '寰呭鏌?;
}

function reviewStatusGroup(status) {
  if (['confirm', 'revise', 'confirmed', 'needs_revision'].includes(status)) return 'accepted';
  if (status && status !== 'pending') return 'issues';
  return 'pending';
}

function reviewItemKey(entry) {
  return entry ? `${entry.run.id}:${entry.item.id}` : '';
}

function resetReviewActionMode() {
  state.reviewActionMode = null;
  state.reviewActionTags = [];
  state.reviewActionItemKey = null;
  state.reviewDraftContent = '';
  state.reviewDraftNote = '';
}

function deepBooleanFlag(value, key) {
  if (value === null || value === undefined) return false;
  if (Array.isArray(value)) return value.some(item => deepBooleanFlag(item, key));
  if (typeof value !== 'object') return false;
  if (value[key] === true) return true;
  return Object.values(value).some(item => deepBooleanFlag(item, key));
}

function itemModelInferred(item) {
  if (deepBooleanFlag(item.normalized_value, 'model_inferred')) return true;
  return /妯″瀷鎺ㄦ柇|model[_ -]?inferred|inference|infer/i.test(item.model_notes || '');
}

function evidenceSourceHint(ev, dimensionLabel = '') {
  const section = String(ev?.section_title || '').toLowerCase();
  if (/related work|background/.test(section)) return {tone: 'warn', text: '鐩稿叧宸ヤ綔鎴栬儗鏅珷鑺傦紝瀹规槗璇妸浠栦汉鏂规硶褰撴垚鏈鏂囧璞°€?};
  if (/conclusion|discussion/.test(section)) return {tone: 'warn', text: '鎬荤粨鎬х珷鑺傦紝寤鸿鏍稿 Method銆丒xperiment 鎴?Results 鏄惁鏈夌洿鎺ユ敮鎾戙€?};
  if (/method|approach|system|framework|implementation|鏂规硶/.test(section)) return {tone: 'good', text: `鏂规硶绔犺妭锛岄€傚悎浣滀负鈥?{dimensionLabel || '褰撳墠缁村害'}鈥濈殑鐩存帴璇佹嵁銆俙};
  if (/experiment|result|evaluation|ablation|瀹為獙|缁撴灉|璇勪及|娑堣瀺/.test(section)) return {tone: 'good', text: '瀹為獙鎴栫粨鏋滅珷鑺傦紝閫傚悎楠岃瘉鏁堟灉绫讳俊鎭紝涔熷彲杈呭姪鍒ゆ柇鏂规硶鏄惁鐪熷疄浣跨敤銆?};
  return {tone: 'neutral', text: '璇风粨鍚堜笂涓嬫枃鍒ゆ柇璇ヨ瘉鎹槸鍚︾洿鎺ユ敮鎾戞ā鍨嬬粨鏋溿€?};
}

function reviewQualityHint(entry) {
  const item = entry.item;
  const evidence = item.evidence || [];
  if (!evidence.length) {
    return {tone: 'warn', text: '璇ョ粨鏋滄病鏈夌粦瀹氳瘉鎹紝寤鸿浼樺厛閫夋嫨鈥滆瘉鎹笉瓒斥€濇垨杩涘叆淇敼銆?};
  }
  if (itemModelInferred(item)) {
    return {tone: 'warn', text: '璇ョ粨鏋滃寘鍚ā鍨嬫帹鏂紝寤鸿閲嶇偣鏍搁獙璇佹嵁鏄惁鏄庣‘鏀拺鍏抽敭鏈哄埗銆?};
  }
  const risky = evidence.find(ev => /related work|conclusion|discussion/i.test(ev.section_title || ''));
  if (risky) return evidenceSourceHint(risky, item.dimension_label || item.dimension_name);
  const method = evidence.find(ev => /method|approach|system|framework|implementation|鏂规硶/i.test(ev.section_title || ''));
  if (method) return evidenceSourceHint(method, item.dimension_label || item.dimension_name);
  if (Number(item.confidence || 0) < 0.45) {
    return {tone: 'warn', text: '妯″瀷缃俊搴﹀亸浣庯紝寤鸿浼樺厛鏍稿绛旀鏄惁杩囧害姒傛嫭鎴栫己灏戠洿鎺ヨ瘉鎹€?};
  }
  return {tone: 'neutral', text: '璇峰垽鏂瘉鎹槸鍚︾洿鎺ュ洖绛旀娊鍙栭棶棰橈紝骞剁‘璁ょ瓟妗堟病鏈夎秺杩囪鏂囧師鏂囥€?};
}

function reviewRun() {
  const runs = reviewScopedRuns();
  return runs.find(r => r.id === state.reviewRunId) || runs[0];
}

function reviewTemplate(run = reviewRun()) {
  return state.templates.find(t => t.id === run?.template_id);
}

function reviewPaper(run = reviewRun()) {
  return state.papers.find(p => p.id === run?.paper_id);
}

function activePromptForTemplate(template) {
  if (!template) return null;
  return (template.prompt_profiles || []).find(p => p.id === template.active_prompt_id) || (template.prompt_profiles || [])[0] || null;
}

function reviewRisk(entry) {
  const item = entry.item;
  const evidence = item.evidence || [];
  const riskySection = evidence.some(ev => /related work|conclusion/i.test(ev.section_title || ''));
  const status = item.review_status;
  if (!evidence.length || Number(item.confidence || 0) < 0.45 || riskySection || ['reject', 'mark_wrong_object', 'mark_wrong_dimension'].includes(status)) return 'high';
  if (Number(item.confidence || 0) < 0.75 || ['mark_evidence_insufficient', 'mark_over_inferred', 'mark_not_reported'].includes(status)) return 'medium';
  return 'low';
}

function riskLabel(risk) {
  return {high: '楂橀闄?, medium: '涓闄?, low: '浣庨闄?}[risk] || risk;
}

function reviewQueueItems() {
  const entries = [];
  reviewScopedRuns().forEach(run => {
    const paper = reviewPaper(run);
    const template = reviewTemplate(run);
    reviewableRunItems(run).forEach((item, itemIndex) => {
      entries.push({run, paper, template, item, index: entries.length, itemIndex, risk: reviewRisk({item})});
    });
  });
  return entries;
}

function filteredReviewEntries() {
  const filters = state.reviewFilters;
  const query = (filters.query || '').trim().toLowerCase();
  return reviewQueueItems().filter(entry => {
    const item = entry.item;
    const status = item.review_status || 'pending';
    if (filters.dimension !== 'all' && item.dimension_name !== filters.dimension) return false;
    if (filters.risk !== 'all' && entry.risk !== filters.risk) return false;
    if (filters.status !== 'all') {
      if (filters.status === 'accepted' && reviewStatusGroup(status) !== 'accepted') return false;
      else if (filters.status === 'issues' && reviewStatusGroup(status) !== 'issues') return false;
      else if (!['accepted', 'issues'].includes(filters.status)) {
        const aliases = {
          confirm: ['confirm', 'confirmed'],
          revise: ['revise', 'needs_revision'],
          reject: ['reject', 'rejected'],
        }[filters.status] || [filters.status];
        if (!aliases.includes(status)) return false;
      }
    }
    if (!query) return true;
    return [
      entry.paper?.metadata?.title,
      item.dimension_label,
      item.dimension_name,
      item.title,
      item.content,
      item.edited_content,
      ...(item.tags || []),
    ].join(' ').toLowerCase().includes(query);
  }).sort((a, b) => {
    const statusOrder = {pending: 0, issues: 1, accepted: 2};
    const riskOrder = {high: 0, medium: 1, low: 2};
    return (statusOrder[reviewStatusGroup(a.item.review_status)] - statusOrder[reviewStatusGroup(b.item.review_status)])
      || (riskOrder[a.risk] - riskOrder[b.risk])
      || (a.index - b.index);
  });
}

function currentReviewEntry() {
  const entries = filteredReviewEntries();
  if (!entries.length) return null;
  state.reviewItemIndex = Math.min(Math.max(state.reviewItemIndex, 0), entries.length - 1);
  return entries[state.reviewItemIndex];
}

function reviewDimensionQuestion(entry) {
  const dim = (entry.template?.dimensions || []).find(d => d.name === entry.item.dimension_name);
  if (!dim) return entry.item.dimension_label || entry.item.dimension_name;
  const parsed = splitImportedDescription(dim.description || '');
  return combineDimensionText(parsed.description, parsed.question, '') || dim.label || entry.item.dimension_label || entry.item.dimension_name;
}

function reviewDimensionDefinition(entry) {
  const dim = (entry.template?.dimensions || []).find(d => d.name === entry.item.dimension_name);
  if (!dim) return '褰撳墠妯℃澘鏈彁渚涙洿璇︾粏鐨勭淮搴﹀畾涔夈€?;
  const fields = (dim.fields || []).map(field => typeof field === 'string' ? field : (field.name || field.label || JSON.stringify(field)));
  const parsed = splitImportedDescription(dim.description || '');
  const description = combineDimensionText(parsed.description, parsed.question, '鎶藉彇闂锛?);
  const parts = [
    description ? `璇存槑锛?{description}` : '',
    dim.output_type ? `杈撳嚭绫诲瀷锛?{dim.output_type}` : '',
    dim.required_evidence ? '闇€瑕佽瘉鎹細鏄? : '闇€瑕佽瘉鎹細鍚?,
    dim.allow_not_found ? '鍏佽鏈姤鍛婏細鏄? : '鍏佽鏈姤鍛婏細鍚?,
    fields.length ? `瀛楁锛?{fields.join('銆?)}` : '',
  ].filter(Boolean);
  return parts.join('\n');
}

function renderReviewFilters() {
  const draftFilters = reviewDraftFilters();
  const dimensions = [...new Map(reviewDraftScopedRuns()
    .flatMap(run => reviewableRunItems(run))
    .map(item => [item.dimension_name, item.dimension_label || item.dimension_name])).entries()];
  $('reviewDimensionFilter').innerHTML = '<option value="all">鍏ㄩ儴缁村害</option>' + dimensions.map(([id, label]) => `<option value="${escapeHtml(id)}">${escapeHtml(label)}</option>`).join('');
  const dimensionValue = dimensions.some(([id]) => id === draftFilters.dimension) ? draftFilters.dimension : 'all';
  state.reviewDraftFilters = {...draftFilters, dimension: dimensionValue};
  $('reviewDimensionFilter').value = dimensionValue;
  $('reviewStatusFilter').value = draftFilters.status || 'all';
  $('reviewRiskFilter').value = draftFilters.risk || 'all';
  $('reviewSearchInput').value = draftFilters.query || '';
}

function updateReviewDraftFiltersFromInputs() {
  state.reviewDraftFilters = {
    dimension: $('reviewDimensionFilter').value,
    status: $('reviewStatusFilter').value,
    risk: $('reviewRiskFilter').value,
    query: $('reviewSearchInput').value,
  };
  state.reviewDraftDirty = true;
  const summary = $('reviewSelectionSummary');
  if (summary) {
    const draftRuns = reviewDraftScopedRuns();
    const draftPaperCount = reviewDraftSelectedPaperIds(state.reviewDraftTemplateId).length;
    const draftResultCount = draftRuns.reduce((total, run) => total + reviewableRunItems(run).length, 0);
    summary.textContent = `寰呭簲鐢細${draftPaperCount} 绡囪鏂?路 ${(state.reviewDraftPaperSetIds || []).length} 涓泦鍚?路 ${draftResultCount} 鏉＄粨鏋渀;
  }
}

function applyReviewScopeFromDraft() {
  const run = selectReviewRunForSelection(state.reviewDraftTemplateId, reviewDraftSelectedPaperIds(state.reviewDraftTemplateId));
  state.reviewTemplateId = state.reviewDraftTemplateId || run?.template_id || null;
  state.reviewSelectedPaperIds = uniqueIds(state.reviewDraftPaperIds);
  state.reviewSelectedPaperSetIds = uniqueIds(state.reviewDraftPaperSetIds);
  state.reviewFilters = {...reviewDraftFilters()};
  state.reviewRunId = run?.id || null;
  state.reviewItemIndex = 0;
  resetReviewActionMode();
  state.reviewDraftDirty = false;
  state.reviewPaperDropdownOpen = false;
  state.reviewPaperSetDropdownOpen = false;
  syncReviewDraftFromApplied(true);
  renderReviewPanel();
}

function renderReviewWorkbench() {
  const run = reviewRun();
  const template = reviewTemplate(run);
  const prompt = activePromptForTemplate(template);
  if (!run) {
    $('reviewTemplateName').textContent = '浜烘満鍗忓悓瀹℃煡';
    $('reviewTemplateMeta').textContent = '鏆傛棤鎶藉彇缁撴灉';
    $('reviewQueueCount').textContent = '0 鏉?;
    $('reviewQueueList').innerHTML = '<p class="muted">鏆傛棤瀹℃煡闃熷垪銆?/p>';
    $('reviewMainPane').innerHTML = '<div class="review-empty">鏆傛棤鍙鏌ョ殑鎶藉彇缁撴灉銆?/div>';
    $('reviewEvidencePane').innerHTML = '';
    renderReviewTopbar();
    return;
  }
  const entries = filteredReviewEntries();
  state.reviewItemIndex = Math.min(Math.max(state.reviewItemIndex, 0), Math.max(entries.length - 1, 0));
  const entry = entries[state.reviewItemIndex];
  if (state.reviewActionItemKey && state.reviewActionItemKey !== reviewItemKey(entry)) resetReviewActionMode();
  renderReviewTopbar(entry, prompt);
  renderReviewQueue(entries);
  renderReviewMain(entry);
  renderReviewEvidence(entry);
}

function renderReviewTopbar(entry = null, prompt = null) {
  const items = reviewQueueItems();
  const done = items.filter(entry => (entry.item.review_status || 'pending') !== 'pending').length;
  const total = items.length;
  const pct = total ? Math.round(done / total * 100) : 0;
  if (entry) {
    const title = entry.paper?.metadata?.title || entry.run.paper_id;
    $('reviewTemplateName').textContent = fmt(title, 72);
    $('reviewTemplateMeta').textContent = [
      `鐮旂┒瀵硅薄锛?{entry.template?.name || entry.run.template_id}`,
      `缁村害锛?{entry.item.dimension_label || entry.item.dimension_name}`,
      `妯℃澘 v${entry.template?.version || '-'}`,
      `Prompt ${prompt?.name || prompt?.id || entry.template?.active_prompt_id || '-'}`,
      entry.run.model || '鏈煡妯″瀷',
    ].join(' 路 ');
  } else {
    const run = reviewRun();
    const template = reviewTemplate(run);
    $('reviewTemplateName').textContent = template?.name || run?.template_id || '浜烘満鍗忓悓瀹℃煡';
    $('reviewTemplateMeta').textContent = run ? `褰撳墠绛涢€夋潯浠朵笅娌℃湁寰呭鏌ユ潯鐩?路 妯℃澘 v${template?.version || '-'}` : '鏆傛棤鎶藉彇缁撴灉';
  }
  $('reviewProgressText').textContent = `${done} / ${total}`;
  $('reviewProgressBar').style.width = `${pct}%`;
  const entries = filteredReviewEntries();
  $('reviewPrevBtn').disabled = !entries.length || state.reviewItemIndex <= 0;
  $('reviewNextBtn').disabled = !entries.length || state.reviewItemIndex >= entries.length - 1;
}

function renderReviewQueue(entries = filteredReviewEntries()) {
  $('reviewQueueCount').textContent = `${entries.length} 鏉;
  $('reviewQueueList').innerHTML = entries.map((entry, index) => {
    const item = entry.item;
    const active = index === state.reviewItemIndex;
    return `<button type="button" class="review-queue-card ${active ? 'active' : ''}" onclick="selectReviewItem(${index})">
      <span class="review-queue-top">
        <b>${escapeHtml(item.dimension_label || item.dimension_name)}</b>
        <em class="${entry.risk}">${riskLabel(entry.risk)}</em>
      </span>
      <span class="review-queue-title">${escapeHtml(fmt(item.edited_title || item.title || '鏈懡鍚嶇粨鏋?, 72))}</span>
      <span class="review-queue-paper">${escapeHtml(fmt(entry.paper?.metadata?.title || entry.run.paper_id, 84))}</span>
      <span class="review-queue-tags">
        <i class="${escapeHtml(item.review_status || 'pending')}">${escapeHtml(reviewStatusLabel(item.review_status || 'pending'))}</i>
        <i>confidence ${confidenceText(item.confidence)}</i>
        ${(item.tags || []).slice(0, 2).map(tag => `<i>${escapeHtml(tag)}</i>`).join('')}
      </span>
    </button>`;
  }).join('') || '<div class="review-empty small">娌℃湁绗﹀悎绛涢€夋潯浠剁殑寰呭鏌ュ唴瀹广€?/div>';
}

function renderReviewMain(entry) {
  if (!entry) {
    $('reviewMainPane').innerHTML = '<div class="review-empty">璇烽€夋嫨宸︿晶闃熷垪涓殑涓€鏉℃娊鍙栫粨鏋溿€?/div>';
    return;
  }
  const item = entry.item;
  const savingAttr = state.reviewSaving ? 'disabled aria-busy="true"' : '';
  const question = reviewDimensionQuestion(entry);
  const qualityHint = reviewQualityHint(entry);
  const modelInferred = itemModelInferred(item);
  const evidenceCount = (item.evidence || []).length;
  $('reviewMainPane').innerHTML = `
    <section class="review-focus-card review-question-card">
      <div class="review-card-header-line">
        <span class="review-dimension-chip">缁村害锛?{escapeHtml(item.dimension_label || item.dimension_name)}</span>
        <span class="review-index-chip">绗?${entry.index + 1} 鏉?/span>
      </div>
      <h3>鎶藉彇闂</h3>
      <p class="review-question-text">${escapeHtml(question)}</p>
      <details class="review-dimension-detail">
        <summary>鏌ョ湅缁村害瀹氫箟</summary>
        <p>${escapeHtml(reviewDimensionDefinition(entry))}</p>
      </details>
    </section>

    <section class="review-focus-card review-result-card">
      <div class="review-card-header-line">
        <h3>妯″瀷鎶藉彇缁撴灉</h3>
        <span class="badge ${escapeHtml(item.review_status || 'pending')}">${escapeHtml(reviewStatusLabel(item.review_status || 'pending'))}</span>
      </div>
      <div class="review-answer lead">${escapeHtml(item.edited_content || item.content || '鏃犲唴瀹?)}</div>
      <div class="review-result-meta">
        <span>缃俊搴︼細<b>${confidenceLevelText(item.confidence)}</b></span>
        <span>璇佹嵁锛?b>${evidenceCount} 鏉?/b></span>
        <span>妯″瀷鎺ㄦ柇锛?b>${modelInferred ? '鏄? : '鍚?}</b></span>
        <span>鐘舵€侊細<b>${escapeHtml(reviewStatusLabel(item.review_status || 'pending'))}</b></span>
      </div>
      <div class="review-quality-hint ${escapeHtml(qualityHint.tone)}">
        <b>绯荤粺鎻愮ず</b>
        <span>${escapeHtml(qualityHint.text)}</span>
      </div>
    </section>

    <section class="review-action-zone">
      <nav class="review-primary-actions" aria-label="瀹℃煡鎿嶄綔">
        <button type="button" class="primary good ${item.review_status === 'confirm' ? 'active' : ''}" onclick="saveCurrentReview('confirm')" ${savingAttr}>${state.reviewSaving ? '淇濆瓨涓?..' : '纭姝ｇ‘'}</button>
        <button type="button" class="${state.reviewActionMode === 'revise' ? 'active' : ''}" onclick="openReviewMode('revise')" ${savingAttr}>淇敼</button>
        <button type="button" class="danger ${state.reviewActionMode === 'reject' || item.review_status === 'reject' ? 'active' : ''}" onclick="openReviewMode('reject')" ${savingAttr}>椹冲洖</button>
        <button type="button" class="warn ${state.reviewActionMode === 'evidence' || item.review_status === 'mark_evidence_insufficient' ? 'active' : ''}" onclick="openReviewMode('evidence')" ${savingAttr}>璇佹嵁涓嶈冻</button>
        <button type="button" class="${state.reviewActionMode === 'not_reported' || item.review_status === 'mark_not_reported' ? 'active' : ''}" onclick="openReviewMode('not_reported')" ${savingAttr}>搴斾负鏈姤鍛?/button>
        <button type="button" class="ghost" onclick="skipReviewItem()" ${savingAttr}>璺宠繃</button>
      </nav>
      ${renderReviewSecondaryPanel(entry)}
    </section>
  `;
}

function reviewTagButton(value, label) {
  const checked = state.reviewActionTags.includes(value);
  return `<button type="button" class="review-panel-tag ${checked ? 'active' : ''}" onclick="toggleReviewModeTag('${escapeHtml(value)}')">${escapeHtml(label)}</button>`;
}

function renderReviewPanelActions(confirmLabel, status) {
  const savingAttr = state.reviewSaving ? 'disabled aria-busy="true"' : '';
  return `
    <div class="review-panel-actions">
      <button type="button" onclick="closeReviewMode()" ${savingAttr}>鍙栨秷</button>
      <button type="button" class="primary" title="${escapeHtml(confirmLabel)}" onclick="saveCurrentReview('${escapeHtml(status)}')" ${savingAttr}>${state.reviewSaving ? '鎻愪氦涓?..' : '鎻愪氦'}</button>
    </div>
  `;
}

function renderReviewSecondaryPanel(entry) {
  if (!state.reviewActionMode || state.reviewActionItemKey !== reviewItemKey(entry)) return '';
  const item = entry.item;
  if (state.reviewActionMode === 'revise') {
    const tags = [
      ['answer_too_generic', '绛旀杩囨硾'],
      ['missing_key_information', '缂哄皯鍏抽敭淇℃伅'],
      ['missing_usage_mechanism', '缂哄皯浣跨敤鏈哄埗'],
      ['evidence_insufficient', '璇佹嵁涓嶈冻'],
      ['wrong_dimension', '缁村害褰掔被涓嶅噯'],
      ['other', '鍏朵粬'],
    ];
    return `
      <section class="review-secondary-panel">
        <h4>淇绛旀</h4>
        <textarea id="reviewEditContent" class="review-textarea review-edit-compact" rows="4">${escapeHtml(state.reviewDraftContent)}</textarea>
        <div class="review-panel-block">
          <span>淇敼鍘熷洜</span>
          <div class="review-panel-tags">${tags.map(([value, label]) => reviewTagButton(value, label)).join('')}</div>
        </div>
        <textarea id="reviewModeNote" class="review-textarea review-note-editor" rows="2" placeholder="琛ュ厖璇存槑锛屽彲閫?>${escapeHtml(state.reviewDraftNote)}</textarea>
        ${renderReviewPanelActions('淇濆瓨淇敼骞剁‘璁?, 'revise')}
      </section>
    `;
  }
  if (state.reviewActionMode === 'reject') {
    const tags = [
      ['wrong_object_boundary', '瀵硅薄涓嶅尮閰?],
      ['wrong_dimension', '缁村害涓嶅尮閰?],
      ['evidence_not_support_answer', '璇佹嵁涓嶆敮鎸?],
      ['over_inference', '杩囧害鎺ㄦ柇'],
      ['related_work_misused', '璇敤 Related Work'],
      ['not_reported_should_be_used', '搴斾负鏈姤鍛?],
      ['other', '鍏朵粬'],
    ];
    return `
      <section class="review-secondary-panel">
        <h4>璇烽€夋嫨椹冲洖鍘熷洜</h4>
        <div class="review-panel-tags">${tags.map(([value, label]) => reviewTagButton(value, label)).join('')}</div>
        <textarea id="reviewModeNote" class="review-textarea review-note-editor" rows="2" placeholder="琛ュ厖璇存槑锛屽彲閫?>${escapeHtml(state.reviewDraftNote)}</textarea>
        ${renderReviewPanelActions('纭椹冲洖', 'reject')}
      </section>
    `;
  }
  if (state.reviewActionMode === 'evidence') {
    const savingAttr = state.reviewSaving ? 'disabled aria-busy="true"' : '';
    const tags = [
      ['evidence_missing', '缂哄皯璇佹嵁'],
      ['evidence_not_support_answer', '璇佹嵁涓嶆敮鎸佺瓟妗?],
      ['wrong_section_evidence', '璇佹嵁绔犺妭涓嶅悎閫?],
      ['evidence_too_generic', '璇佹嵁澶硾'],
      ['need_more_context', '闇€瑕佹洿澶氫笂涓嬫枃'],
      ['over_inference', '杩囧害鎺ㄦ柇'],
    ];
    return `
      <section class="review-secondary-panel">
        <h4>璇佹嵁闂</h4>
        <div class="review-panel-tags">${tags.map(([value, label]) => reviewTagButton(value, label)).join('')}</div>
        <textarea id="reviewModeNote" class="review-textarea review-note-editor" rows="2" placeholder="琛ュ厖璇存槑锛屽彲閫?>${escapeHtml(state.reviewDraftNote)}</textarea>
        <div class="review-panel-actions">
          <button type="button" onclick="saveCurrentReview('pending')" ${savingAttr}>浠呰褰曡瘉鎹棶棰?/button>
          <button type="button" onclick="closeReviewMode()" ${savingAttr}>鍙栨秷</button>
          <button type="button" class="primary" title="纭鏍囪璇佹嵁涓嶈冻" onclick="saveCurrentReview('mark_evidence_insufficient')" ${savingAttr}>${state.reviewSaving ? '鎻愪氦涓?..' : '鎻愪氦'}</button>
        </div>
      </section>
    `;
  }
  if (state.reviewActionMode === 'not_reported') {
    const tags = [
      ['not_reported_should_be_used', '璁烘枃鏈姤鍛?],
      ['evidence_insufficient', '璇佹嵁涓嶈冻锛屼笉鑳芥帹鏂?],
      ['over_inference', '妯″瀷寮鸿琛ュ叏'],
    ];
    return `
      <section class="review-secondary-panel compact">
        <h4>纭灏嗚缁村害鏍囪涓?not_reported锛?/h4>
        <div class="review-panel-tags">${tags.map(([value, label]) => reviewTagButton(value, label)).join('')}</div>
        <textarea id="reviewModeNote" class="review-textarea review-note-editor" rows="2" placeholder="琛ュ厖璇存槑锛屽彲閫?>${escapeHtml(state.reviewDraftNote)}</textarea>
        ${renderReviewPanelActions('纭骞朵笅涓€鏉?, 'mark_not_reported')}
      </section>
    `;
  }
  return '';
}

function renderReviewEvidence(entry) {
  if (!entry) {
    $('reviewEvidencePane').innerHTML = '';
    return;
  }
  const item = entry.item;
  const pool = findFeedbackPool(entry);
  const metrics = pool?.feedback_pool?.metrics || {};
  const candidates = pool?.feedback_pool?.upgrade_candidates || [];
  $('reviewEvidencePane').innerHTML = `
    <section class="review-side-section">
      <header><h3>璇佹嵁鏄惁鏀拺妯″瀷缁撴灉锛?/h3><span>${(item.evidence || []).length} 鏉¤瘉鎹?/span></header>
      ${(item.evidence || []).map((ev, index) => renderEvidenceCard(ev, entry, index)).join('') || '<p class="muted">鏃犺瘉鎹粦瀹氥€?/p>'}
    </section>
    <details class="review-side-details">
      <summary>鏌ョ湅鍚庡彴鍙嶉娌夋穩</summary>
      <section class="review-side-section subtle">
        <header><h3>鏈淮搴﹀弽棣堢粺璁?/h3><button type="button" onclick="refreshReviewFeedback().catch(err => toast(err.message))">鍒锋柊</button></header>
        <div class="review-side-stats">
          <div><span>纭鐜?/span><b>${Math.round((metrics.confirm_rate || 0) * 100)}%</b></div>
          <div><span>淇敼鐜?/span><b>${Math.round((metrics.revise_rate || 0) * 100)}%</b></div>
          <div><span>椹冲洖鐜?/span><b>${Math.round((metrics.reject_rate || 0) * 100)}%</b></div>
          <div><span>璇佹嵁闂</span><b>${Math.round((metrics.evidence_issue_rate || 0) * 100)}%</b></div>
        </div>
        <div class="feedback-tag-row">
          ${Object.entries(pool?.feedback_pool?.common_error_tags || {}).slice(0, 5).map(([tag, count]) => `<span>${escapeHtml(tag)} <b>${count}</b></span>`).join('') || '<span>鏆傛棤楂橀閿欒</span>'}
        </div>
      </section>
      <section class="review-side-section subtle">
        <header><h3>妯℃澘鍗囩骇鍊欓€?/h3></header>
        ${candidates.slice(0, 2).map(item => `<div class="review-upgrade-card"><b>${escapeHtml(item.target_level)} 路 ${escapeHtml(item.suggested_target)}</b><p>${escapeHtml(item.recommended_change)}</p></div>`).join('') || '<p class="muted">褰撳墠缁村害鏆傛棤鏄庢樉鍗囩骇鍊欓€夈€?/p>'}
      </section>
      <section class="review-side-section subtle">
        <header><h3>褰撳墠璁板綍棰勮</h3></header>
        <pre class="review-record-preview">${escapeHtml(JSON.stringify(buildReviewPreview(entry), null, 2))}</pre>
      </section>
    </details>
  `;
}

function renderEvidenceCard(ev, entry, index) {
  const paper = entry.paper;
  const chunks = paper?.chunks || [];
  const chunkIndex = chunks.findIndex(chunk => chunk.id === ev.chunk_id);
  const prev = chunkIndex > 0 ? chunks[chunkIndex - 1] : null;
  const current = chunkIndex >= 0 ? chunks[chunkIndex] : null;
  const next = chunkIndex >= 0 && chunkIndex < chunks.length - 1 ? chunks[chunkIndex + 1] : null;
  const risky = /related work|conclusion/i.test(ev.section_title || '');
  const hint = evidenceSourceHint(ev, entry.item.dimension_label || entry.item.dimension_name);
  const contextKey = `${reviewItemKey(entry)}:${index}`;
  const expanded = Boolean(state.reviewExpandedEvidence[contextKey]);
  return `<article class="review-evidence-card ${risky ? 'risky' : ''}">
    <header>
      <b>璇佹嵁 ${index + 1}</b>
      <span>${escapeHtml(ev.section_title || 'Unknown')} 路 p.${ev.page_start || '?'}</span>
    </header>
    <p class="review-evidence-hint ${escapeHtml(hint.tone)}">${escapeHtml(hint.text)}</p>
    <blockquote>${escapeHtml(ev.quote || '鏃犺瘉鎹師鏂?)}</blockquote>
    <div class="review-evidence-actions">
      <button type="button" onclick="markEvidenceJudgement(${index}, 'support')">鏀寔绛旀</button>
      <button type="button" onclick="markEvidenceJudgement(${index}, 'partial')">閮ㄥ垎鏀寔</button>
      <button type="button" onclick="markEvidenceJudgement(${index}, 'not_support')">涓嶆敮鎸?/button>
      <button type="button" onclick="toggleEvidenceContext(${index})">${expanded ? '鏀惰捣涓婁笅鏂? : '鐪嬩笂涓嬫枃'}</button>
    </div>
    <div class="review-context-stack ${expanded ? '' : 'collapsed'}">
      ${prev ? `<div><b>涓婁竴娈?/b><p>${escapeHtml(fmt(prev.text, 320))}</p></div>` : ''}
      <div class="current"><b>褰撳墠娈?/b><p>${escapeHtml(fmt(current?.text || ev.quote || '', 420))}</p></div>
      ${next ? `<div><b>涓嬩竴娈?/b><p>${escapeHtml(fmt(next.text, 320))}</p></div>` : ''}
    </div>
  </article>`;
}

function findFeedbackPool(entry) {
  return (state.reviewFeedback?.dimension_pools || []).find(pool =>
    pool.profile_id === entry.run.template_id && pool.dimension_id === entry.item.dimension_name
  );
}

function buildReviewPreview(entry) {
  const item = entry.item;
  return {
    paper_id: entry.run.paper_id,
    profile_id: entry.run.template_id,
    profile_version: entry.template?.version || '',
    dimension_id: item.dimension_name,
    extraction_id: entry.run.id,
    result_id: item.id,
    prompt_id: entry.template?.active_prompt_id || '',
    model_name: entry.run.model,
    review_action: item.review_status,
    review_comment: item.user_note || '',
    error_tags: item.tags || [],
    root_cause: item.review_root_cause || '',
    suggested_target: item.review_suggested_target || '',
  };
}

function renderReviewActionButtons(runId, item) {
  return REVIEW_ACTIONS.map(action => `
    <button
      type="button"
      class="review-action-btn ${escapeHtml(action.tone)} ${item.review_status === action.value ? 'active' : ''}"
      title="${escapeHtml(action.hint)}"
      onclick="reviewItem('${escapeHtml(runId)}', '${escapeHtml(item.id)}', '${escapeHtml(action.value)}')"
    >
      <span>${escapeHtml(action.label)}</span>
      <small>${escapeHtml(action.hint)}</small>
    </button>
  `).join('');
}

function renderReviewErrorTags(item) {
  const selected = new Set(item.tags || []);
  return REVIEW_ERROR_TAGS.map(tag => `
    <label class="review-error-tag ${selected.has(tag.value) ? 'checked' : ''}">
      <input type="checkbox" class="reviewErrorTag" value="${escapeHtml(tag.value)}" ${selected.has(tag.value) ? 'checked' : ''} />
      <span>${escapeHtml(tag.label)}</span>
    </label>
  `).join('');
}

function renderReviewSelectOptions(options, selectedValue) {
  return options.map(item => `<option value="${escapeHtml(item.value)}" ${item.value === (selectedValue || '') ? 'selected' : ''}>${escapeHtml(item.label)}</option>`).join('');
}

async function refreshReviewFeedback() {
  state.reviewFeedback = await api('/api/feedback/dimensions');
  renderReviewWorkbench();
  renderCurrentDimensionFeedback();
}

window.selectReviewItem = function(index) {
  state.reviewItemIndex = index;
  resetReviewActionMode();
  renderReviewWorkbench();
};

window.toggleReviewScopePanel = function() {
  state.reviewScopePanelOpen = !state.reviewScopePanelOpen;
  renderReviewPanel();
};

window.collapseReviewSidebar = function() {
  state.reviewSidebarCollapsed = true;
  state.reviewPaperDropdownOpen = false;
  state.reviewPaperSetDropdownOpen = false;
  renderReviewSidebarLayout();
};

window.expandReviewSidebar = function() {
  state.reviewSidebarCollapsed = false;
  renderReviewSidebarLayout();
};

window.toggleReviewSidebar = function() {
  state.reviewSidebarCollapsed = !state.reviewSidebarCollapsed;
  state.reviewPaperDropdownOpen = false;
  state.reviewPaperSetDropdownOpen = false;
  renderReviewSidebarLayout();
};

function startReviewSidebarResize(event) {
  if (state.reviewSidebarCollapsed) return;
  event.preventDefault();
  const startX = event.clientX;
  const startWidth = state.reviewSidebarWidth;
  state.reviewSidebarResizing = true;
  document.body.classList.add('review-sidebar-resizing');
  const move = (moveEvent) => {
    if (!state.reviewSidebarResizing) return;
    state.reviewSidebarWidth = clampReviewSidebarWidth(startWidth + moveEvent.clientX - startX);
    renderReviewSidebarLayout();
  };
  const stop = () => {
    state.reviewSidebarResizing = false;
    document.body.classList.remove('review-sidebar-resizing');
    window.removeEventListener('pointermove', move);
    window.removeEventListener('pointerup', stop);
    window.removeEventListener('pointercancel', stop);
  };
  window.addEventListener('pointermove', move);
  window.addEventListener('pointerup', stop);
  window.addEventListener('pointercancel', stop);
};

window.toggleReviewPaperDropdown = function() {
  state.reviewPaperDropdownOpen = !state.reviewPaperDropdownOpen;
  state.reviewPaperSetDropdownOpen = false;
  renderReviewPanel();
};

window.toggleReviewPaperSetDropdown = function() {
  state.reviewPaperSetDropdownOpen = !state.reviewPaperSetDropdownOpen;
  state.reviewPaperDropdownOpen = false;
  renderReviewPanel();
};

window.toggleReviewDraftPaper = function(paperId, checked) {
  const selected = new Set(state.reviewDraftPaperIds || []);
  if (checked) selected.add(paperId);
  else selected.delete(paperId);
  state.reviewDraftPaperIds = [...selected];
  state.reviewDraftDirty = true;
  state.reviewPaperDropdownOpen = false;
  renderReviewPanel();
};

window.toggleReviewDraftPaperSet = function(paperSetId, checked) {
  const selected = new Set(state.reviewDraftPaperSetIds || []);
  if (checked) selected.add(paperSetId);
  else selected.delete(paperSetId);
  state.reviewDraftPaperSetIds = [...selected];
  state.reviewDraftDirty = true;
  state.reviewPaperSetDropdownOpen = false;
  renderReviewPanel();
};

function setReviewItemIndex(index) {
  const entries = filteredReviewEntries();
  if (!entries.length) return;
  state.reviewItemIndex = Math.min(Math.max(index, 0), entries.length - 1);
  resetReviewActionMode();
  renderReviewWorkbench();
}

window.moveReviewItem = function(direction) {
  setReviewItemIndex(state.reviewItemIndex + direction);
};

window.openReviewMode = function(mode, tags = []) {
  const entry = currentReviewEntry();
  if (!entry) return;
  state.reviewActionMode = mode;
  state.reviewActionTags = tags;
  state.reviewActionItemKey = reviewItemKey(entry);
  state.reviewDraftContent = entry.item.edited_content || entry.item.content || '';
  state.reviewDraftNote = entry.item.user_note || '';
  renderReviewMain(entry);
};

window.closeReviewMode = function() {
  resetReviewActionMode();
  renderReviewMain(currentReviewEntry());
};

window.toggleReviewModeTag = function(tag) {
  if ($('reviewEditContent')) state.reviewDraftContent = $('reviewEditContent').value;
  if ($('reviewModeNote')) state.reviewDraftNote = $('reviewModeNote').value;
  const selected = new Set(state.reviewActionTags || []);
  if (selected.has(tag)) selected.delete(tag);
  else selected.add(tag);
  state.reviewActionTags = [...selected];
  renderReviewMain(currentReviewEntry());
};

window.skipReviewItem = function() {
  resetReviewActionMode();
  setReviewItemIndex(state.reviewItemIndex + 1);
};

function inferReviewRootCause(status, tags = []) {
  const tagSet = new Set(tags);
  if (tagSet.has('wrong_object_boundary')) return 'object_boundary_unclear';
  if (tagSet.has('wrong_dimension')) return 'dimension_definition_unclear';
  if (tagSet.has('over_inference')) return 'prompt_instruction_unclear';
  if (
    status === 'mark_evidence_insufficient'
    || tagSet.has('evidence_not_support_answer')
    || tagSet.has('wrong_section_evidence')
    || tagSet.has('evidence_missing')
    || tagSet.has('evidence_too_generic')
    || tagSet.has('need_more_context')
  ) return 'evidence_policy_unclear';
  if (status === 'mark_not_reported' || tagSet.has('not_reported_should_be_used')) return 'prompt_instruction_unclear';
  if (status === 'revise' && (tagSet.has('answer_too_generic') || tagSet.has('missing_key_information') || tagSet.has('missing_usage_mechanism'))) return 'dimension_definition_unclear';
  if (status === 'confirm') return null;
  return 'result_error';
}

function inferReviewTarget(status, tags = []) {
  const tagSet = new Set(tags);
  if (tagSet.has('wrong_object_boundary')) return 'object_definition.exclusion_criteria';
  if (tagSet.has('wrong_dimension')) return 'dimension.question';
  if (
    tagSet.has('evidence_not_support_answer')
    || tagSet.has('wrong_section_evidence')
    || tagSet.has('evidence_missing')
    || tagSet.has('evidence_too_generic')
    || tagSet.has('need_more_context')
    || status === 'mark_evidence_insufficient'
  ) return 'prompt.evidence_policy';
  if (tagSet.has('over_inference')) return 'prompt.inference_policy';
  if (tagSet.has('not_reported_should_be_used') || status === 'mark_not_reported') return 'prompt.not_reported_policy';
  if (tagSet.has('answer_too_generic') || tagSet.has('missing_key_information') || tagSet.has('missing_usage_mechanism')) return 'dimension.question';
  return null;
}

function reviewModeNote() {
  return $('reviewModeNote')?.value || '';
}

function reviewEditedContentForStatus(entry, status) {
  if (status === 'mark_not_reported') return 'not_reported';
  if (state.reviewActionMode === 'revise') return $('reviewEditContent') ? $('reviewEditContent').value : (state.reviewDraftContent || entry.item.content || '');
  return entry.item.edited_content || entry.item.content || '';
}

window.saveCurrentReview = async function(status) {
  if (state.reviewSaving) return;
  const entry = currentReviewEntry();
  if (!entry) return;
  const tags = state.reviewActionMode ? state.reviewActionTags : [];
  const userNote = reviewModeNote() || entry.item.user_note || '';
  const editedContent = reviewEditedContentForStatus(entry, status);
  const payload = {
    status,
    edited_title: entry.item.edited_title || entry.item.title || entry.item.dimension_label || entry.item.dimension_name,
    edited_content: editedContent,
    user_note: userNote,
    tags,
    root_cause: inferReviewRootCause(status, tags),
    suggested_target: inferReviewTarget(status, tags),
  };
  state.reviewSaving = true;
  renderReviewMain(entry);
  toast('姝ｅ湪淇濆瓨瀹℃煡缁撴灉...');
  try {
    const updatedRun = await api(`/api/extractions/${entry.run.id}/items/${entry.item.id}/review`, {
      method: 'PUT',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify(payload),
    });
    state.runs = state.runs.map(run => run.id === updatedRun.id ? updatedRun : run);
    try {
      state.reviewFeedback = await api('/api/feedback/dimensions');
    } catch (_) {}
    resetReviewActionMode();
    state.reviewSaving = false;
    renderReviewPanel();
    const total = updatedRun.items.length;
    const done = updatedRun.items.filter(item => (item.review_status || 'pending') !== 'pending').length;
    const message = status === 'pending'
      ? `宸茶褰曡瘉鎹棶棰橈紝褰撳墠鏉＄洰浠嶅緟瀹℃煡銆傝繘搴?${done}/${total}`
      : `瀹℃煡宸蹭繚瀛橈紝杩涘害 ${done}/${total}`;
    toast(message);
  } catch (err) {
    state.reviewSaving = false;
    renderReviewMain(currentReviewEntry());
    toast(`淇濆瓨澶辫触锛?{err.message}`);
  }
};

window.reviewItem = async function(runId, itemId, status) {
  await window.saveCurrentReview(status);
};

window.markEvidenceJudgement = function(index, judgement) {
  const entry = currentReviewEntry();
  if (!entry) return;
  if (judgement === 'support') {
    toast(`璇佹嵁 ${index + 1} 宸插垽鏂负鏀寔绛旀锛屽彲缁х画纭缁撴灉`);
    return;
  }
  if (judgement === 'partial') {
    window.openReviewMode('evidence', ['evidence_too_generic', 'need_more_context']);
    toast(`璇佹嵁 ${index + 1} 宸叉爣璁颁负閮ㄥ垎鏀寔锛岃纭鏄惁璁板綍璇佹嵁闂`);
    return;
  }
  window.openReviewMode('evidence', ['evidence_not_support_answer']);
  toast(`璇佹嵁 ${index + 1} 涓嶆敮鎸佺瓟妗堬紝璇风‘璁ゆ槸鍚︽爣璁颁负璇佹嵁涓嶈冻`);
};

window.toggleEvidenceContext = function(index) {
  const entry = currentReviewEntry();
  if (!entry) return;
  const key = `${reviewItemKey(entry)}:${index}`;
  state.reviewExpandedEvidence[key] = !state.reviewExpandedEvidence[key];
  renderReviewEvidence(entry);
};

async function exportReviewRecords() {
  const run = reviewRun();
  const params = new URLSearchParams();
  if (run?.template_id) params.set('profile_id', run.template_id);
  const records = await api('/api/reviews' + (params.toString() ? `?${params}` : ''));
  const blob = new Blob([JSON.stringify({exported_at: new Date().toISOString(), records}, null, 2)], {type: 'application/json'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `review-records-${run?.template_id || 'all'}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

function renderMaterialsPanel() {
  const dims = [...new Set(state.materials.map(m => m.dimension_name))].sort();
  $('materialDimension').innerHTML = '<option value="">鍏ㄩ儴缁村害</option>' + dims.map(d => `<option value="${d}">${d}</option>`).join('');
  $('comparePaperChecks').innerHTML = state.papers.map(p => `<label><input type="checkbox" class="comparePaper" value="${p.id}" /> ${escapeHtml(fmt(p.metadata.title, 90))}</label>`).join('') || '<p class="muted">鏆傛棤璁烘枃銆?/p>';
}

async function searchMaterials() {
  const params = new URLSearchParams();
  if ($('materialQuery').value) params.set('q', $('materialQuery').value);
  if ($('materialDimension').value) params.set('dimension_name', $('materialDimension').value);
  if ($('materialStatus').value) params.set('status', $('materialStatus').value);
  const data = await api('/api/materials/search?' + params.toString());
  $('materialResults').innerHTML = data.items.map(m => `
    <div class="item">
      <h3>${escapeHtml(m.dimension_label)} 路 ${escapeHtml(m.title)} <span class="badge ${m.review_status}">${escapeHtml(reviewStatusLabel(m.review_status))}</span></h3>
      <p>${escapeHtml(fmt(m.content, 700))}</p>
      ${(m.evidence || []).slice(0, 2).map(e => `<div class="evidence">${escapeHtml(fmt(e.quote, 260))}</div>`).join('')}
      <div class="meta">paper ${m.paper_id} 路 tags ${(m.tags || []).join(', ')}</div>
    </div>`).join('') || '<p class="muted">娌℃湁鍖归厤绱犳潗銆?/p>';
}

async function comparePapers() {
  const ids = selectedAnalysisPaperIds();
  if (!ids.length) { toast('璇疯嚦灏戦€夋嫨涓€绡囪鏂?); return; }
  const data = await api('/api/analysis/compare?paper_ids=' + encodeURIComponent(ids.join(',')) + '&template_id=tmpl_experience_v2');
  const cols = ['title', 'year', ...data.dimensions];
  $('analysisOutput').innerHTML = `<div class="table-wrap"><table><thead><tr>${cols.map(c => `<th>${escapeHtml(c)}</th>`).join('')}</tr></thead><tbody>${data.matrix.map(row => `<tr>${cols.map(c => `<td>${escapeHtml(fmt(row[c], 600))}</td>`).join('')}</tr>`).join('')}</tbody></table></div><h4>缂哄彛</h4><pre>${escapeHtml(JSON.stringify(data.gaps, null, 2))}</pre>`;
}

async function gapAnalysis() {
  const data = await api('/api/analysis/gaps?template_id=tmpl_experience_v2');
  $('analysisOutput').innerHTML = `<pre>${escapeHtml(JSON.stringify(data, null, 2))}</pre>`;
}

function selectedAnalysisPaperIds() {
  return [...document.querySelectorAll('.comparePaper:checked')].map(x => x.value);
}

function evidenceGraphTypeLabel(type) {
  return {
    paper: '璁烘枃',
    material: '鎶藉彇缁撴灉',
    dimension: '缁村害',
    evidence: '璇佹嵁',
  }[type] || type || '鑺傜偣';
}

function evidenceGraphNodeCounts(data) {
  return (data.nodes || []).reduce((counts, node) => {
    const key = node.type || 'unknown';
    counts[key] = (counts[key] || 0) + 1;
    return counts;
  }, {});
}

function truncateGraphLabel(label, limit = 24) {
  const text = String(label || '').replace(/\s+/g, ' ').trim();
  return text.length > limit ? `${text.slice(0, limit - 1)}...` : text;
}

function visibleEvidenceGraphData(data) {
  const nodes = data.nodes || [];
  const evidenceNodes = nodes.filter(node => node.type === 'evidence');
  const keptEvidenceIds = new Set(evidenceNodes.slice(0, EVIDENCE_GRAPH_MAX_EVIDENCE_NODES).map(node => node.id));
  const visibleNodes = nodes.filter(node => node.type !== 'evidence' || keptEvidenceIds.has(node.id));
  const visibleIds = new Set(visibleNodes.map(node => node.id));
  return {
    nodes: visibleNodes,
    links: (data.links || []).filter(link => visibleIds.has(link.source) && visibleIds.has(link.target)),
    omitted_visible_evidence_count: Math.max(0, evidenceNodes.length - keptEvidenceIds.size),
    omitted_server_evidence_count: Math.max(0, Number(data.omitted_evidence_count || 0)),
  };
}

function evidenceGraphLayerOrder(type) {
  return {paper: 0, material: 1, dimension: 2, evidence: 3}[type] ?? 4;
}

function evidenceGraphLayout(data) {
  const layerTypes = ['paper', 'material', 'dimension', 'evidence'];
  const layers = Object.fromEntries(layerTypes.map(type => [type, []]));
  const other = [];
  (data.nodes || []).forEach(node => {
    if (layers[node.type]) layers[node.type].push(node);
    else other.push(node);
  });
  if (other.length) layers.evidence.push(...other);
  const maxLayerSize = Math.max(1, ...Object.values(layers).map(items => items.length));
  const width = 1120;
  const height = Math.max(560, maxLayerSize * 38 + 120);
  const columns = {
    paper: {x: 110, label: '璁烘枃'},
    material: {x: 400, label: '鎶藉彇缁撴灉'},
    dimension: {x: 700, label: '缁村害'},
    evidence: {x: 990, label: '璇佹嵁'},
  };
  const positions = new Map();
  Object.entries(layers).forEach(([type, items]) => {
    const sorted = [...items].sort((a, b) => {
      const order = evidenceGraphLayerOrder(a.type) - evidenceGraphLayerOrder(b.type);
      if (order) return order;
      return String(a.label || a.id).localeCompare(String(b.label || b.id), 'zh-Hans-CN');
    });
    const top = 84;
    const available = Math.max(1, height - 150);
    sorted.forEach((node, index) => {
      const y = sorted.length <= 1 ? Math.round(height / 2) : Math.round(top + index * (available / (sorted.length - 1)));
      positions.set(node.id, {x: columns[type]?.x || columns.evidence.x, y, type});
    });
    layers[type] = sorted;
  });
  return {width, height, layers, positions, columns};
}

function evidenceGraphNodeShape(node, position) {
  const label = truncateGraphLabel(node.label || node.id, node.type === 'evidence' ? 18 : 24);
  const fullLabel = escapeHtml(node.label || node.id);
  const safeId = escapeHtml(node.id);
  if (node.type === 'evidence') {
    return `
      <g class="evidence-svg-node evidence-node-${escapeHtml(node.type || 'unknown')}" data-graph-node="${safeId}" transform="translate(${position.x},${position.y})">
        <title>${fullLabel}</title>
        <circle r="12"></circle>
        <text x="18" y="4">${escapeHtml(label)}</text>
      </g>
    `;
  }
  const width = node.type === 'paper' ? 170 : node.type === 'dimension' ? 150 : 180;
  const height = 34;
  return `
    <g class="evidence-svg-node evidence-node-${escapeHtml(node.type || 'unknown')}" data-graph-node="${safeId}" transform="translate(${position.x},${position.y})">
      <title>${fullLabel}</title>
      <rect x="${-width / 2}" y="${-height / 2}" width="${width}" height="${height}" rx="8"></rect>
      <text y="4">${escapeHtml(label)}</text>
    </g>
  `;
}

function renderEvidenceGraphSvg(data) {
  const visible = visibleEvidenceGraphData(data);
  const layout = evidenceGraphLayout(visible);
  const edgePaths = (visible.links || []).map(link => {
    const source = layout.positions.get(link.source);
    const target = layout.positions.get(link.target);
    if (!source || !target) return '';
    const startX = source.x + 86;
    const endX = target.x - (target.type === 'evidence' ? 16 : 86);
    const midX = Math.round((startX + endX) / 2);
    return `<path class="evidence-svg-edge evidence-edge-${escapeHtml(link.type || 'unknown')}" d="M ${startX} ${source.y} C ${midX} ${source.y}, ${midX} ${target.y}, ${endX} ${target.y}"><title>${escapeHtml(link.type || '')}</title></path>`;
  }).join('');
  const layerLabels = Object.entries(layout.columns).map(([type, col]) => `
    <text class="evidence-svg-layer-label" x="${col.x}" y="32">${escapeHtml(col.label)} 路 ${layout.layers[type]?.length || 0}</text>
  `).join('');
  const nodes = Object.values(layout.layers)
    .flat()
    .map(node => evidenceGraphNodeShape(node, layout.positions.get(node.id)))
    .join('');
  const omittedNotes = [
    visible.omitted_visible_evidence_count ? `鍙︽湁 ${visible.omitted_visible_evidence_count} 涓瘉鎹妭鐐逛繚鐣欏湪鈥滃師濮嬫暟鎹€濅腑銆俙 : '',
    visible.omitted_server_evidence_count ? `鎺ュ彛鏈鐪佺暐 ${visible.omitted_server_evidence_count} 涓瘉鎹妭鐐广€俙 : '',
  ].filter(Boolean).join(' ');
  const omitted = omittedNotes ? `
    <div class="evidence-graph-note">涓轰繚鎸佹祻瑙堝櫒娴佺晠锛屽浘涓渶澶氬睍寮€ ${EVIDENCE_GRAPH_MAX_EVIDENCE_NODES} 涓瘉鎹妭鐐广€?{escapeHtml(omittedNotes)}</div>
  ` : '';
  return `
    ${omitted}
    <svg class="evidence-graph-svg" viewBox="0 0 ${layout.width} ${layout.height}" width="${layout.width}" height="${layout.height}" role="img" aria-label="璇佹嵁鍥?>
      <defs>
        <marker id="evidenceGraphArrow" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
          <path d="M 0 0 L 8 4 L 0 8 z"></path>
        </marker>
      </defs>
      ${layerLabels}
      <g class="evidence-svg-edges">${edgePaths}</g>
      <g class="evidence-svg-nodes">${nodes}</g>
    </svg>
  `;
}

function renderEvidenceGraphShell(data, paperIds) {
  const counts = evidenceGraphNodeCounts(data);
  state.evidenceGraphData = data;
  $('analysisOutput').classList.remove('muted');
  $('analysisOutput').innerHTML = `
    <section class="evidence-graph-panel">
      <header class="evidence-graph-header">
        <div>
          <h3>璇佹嵁鍥?/h3>
          <p>浣跨敤杞婚噺鍒嗗眰鍥惧睍绀?${paperIds.length} 绡囪鏂囩殑鎶藉彇缁撴灉璇佹嵁缃戠粶锛岄€傚悎杈冨鑺傜偣鏃跺揩閫熸祻瑙堛€?/p>
        </div>
        <div class="evidence-graph-actions">
          <button type="button" onclick="fitEvidenceGraph()">閫傞厤瑙嗗浘</button>
          <button type="button" onclick="toggleEvidenceGraphRaw()">鍘熷鏁版嵁</button>
        </div>
      </header>
      <div class="evidence-graph-stats">
        <span>鑺傜偣 <b>${(data.nodes || []).length}</b></span>
        <span>杈?<b>${(data.links || []).length}</b></span>
        <span>璁烘枃 <b>${counts.paper || 0}</b></span>
        <span>鎶藉彇缁撴灉 <b>${counts.material || 0}</b></span>
        <span>璇佹嵁 <b>${counts.evidence || 0}</b></span>
      </div>
      <div class="evidence-graph-legend">
        <span><i class="paper"></i>璁烘枃</span>
        <span><i class="material"></i>鎶藉彇缁撴灉</span>
        <span><i class="dimension"></i>缁村害</span>
        <span><i class="evidence"></i>璇佹嵁</span>
      </div>
      <div id="evidenceGraphCanvas" class="evidence-graph-canvas">
        <div class="graph-loading">姝ｅ湪鐢熸垚璇佹嵁鍥?..</div>
      </div>
      <pre id="evidenceGraphRaw" class="evidence-graph-raw" hidden></pre>
    </section>
  `;
}

function renderEvidenceGraphFallback(message) {
  const canvas = $('evidenceGraphCanvas');
  if (!canvas) return;
  canvas.innerHTML = `<div class="graph-empty">${escapeHtml(message)}</div>`;
}

function bindEvidenceGraphNodeEvents(data) {
  const byId = new Map((data.nodes || []).map(node => [node.id, node]));
  document.querySelectorAll('[data-graph-node]').forEach(nodeEl => {
    nodeEl.onclick = () => {
      const node = byId.get(nodeEl.dataset.graphNode);
      if (!node) return;
      toast(`${evidenceGraphTypeLabel(node.type)}锛?{node.label || node.id}`);
    };
  });
}

function renderEvidenceGraphVisualization(data) {
  const canvas = $('evidenceGraphCanvas');
  if (!canvas) return;
  if (!(data.nodes || []).length) {
    renderEvidenceGraphFallback('娌℃湁鍙鍖栬妭鐐广€傝纭鎵€閫夎鏂囧凡鏈夋娊鍙栫粨鏋滃拰璇佹嵁銆?);
    return;
  }
  canvas.innerHTML = renderEvidenceGraphSvg(data);
  bindEvidenceGraphNodeEvents(data);
}

async function evidenceGraph() {
  const ids = selectedAnalysisPaperIds();
  if (!ids.length) { toast('璇疯嚦灏戦€夋嫨涓€绡囪鏂?); return; }
  const data = await api('/api/analysis/evidence-graph?paper_ids=' + encodeURIComponent(ids.join(',')));
  renderEvidenceGraphShell(data, ids);
  renderEvidenceGraphVisualization(data);
}

window.toggleEvidenceGraphRaw = function() {
  const raw = $('evidenceGraphRaw');
  if (!raw) return;
  if (!raw.textContent && state.evidenceGraphData) {
    raw.textContent = JSON.stringify(state.evidenceGraphData, null, 2);
  }
  raw.hidden = !raw.hidden;
};

window.fitEvidenceGraph = function() {
  const canvas = $('evidenceGraphCanvas');
  if (!canvas) {
    toast('璇佹嵁鍥惧皻鏈敓鎴?);
    return;
  }
  canvas.scrollTo({left: 0, top: 0, behavior: 'smooth'});
};

async function bindEvents() {
  $('refreshBtn').onclick = refreshAll;
  $('objectConfigBtn').onclick = openObjectConfigModal;
  $('configBtn').onclick = openConfigModal;
  $('objectConfigClose').onclick = closeObjectConfigModal;
  $('configClose').onclick = closeConfigModal;
  $('reloadConfigBtn').onclick = loadConfig;
  $('saveConfigBtn').onclick = saveConfig;
  $('addLlmProfileBtn').onclick = addLlmProfile;
  $('removeLlmProfileBtn').onclick = removeLlmProfile;
  $('activateLlmProfileBtn').onclick = activateLlmProfile;
  $('testLlmProfileBtn').onclick = testLlmProfile;
  ['cfgLlmProfileId','cfgLlmProfileName','cfgOpenaiKey','cfgOpenaiBase','cfgOpenaiModel','cfgLlmMaxTokens','cfgLlmTimeout','cfgLlmTemperature','cfgLlmTopP','cfgLlmPresencePenalty','cfgLlmTopK','cfgLlmStream','cfgLlmEnableThinking'].forEach(id => {
    $(id).addEventListener('input', () => {
      saveCurrentLlmProfileForm();
      renderLlmProfiles();
    });
  });
  $('objectTemplateSelect').onchange = handleObjectTemplateChange;
  $('saveObjectConfigBtn').onclick = () => saveResearchObjectConfig().catch(err => toast(err.message));
  $('publishObjectTemplateBtn').onclick = () => publishObjectTemplate().catch(err => toast(err.message));
  $('publishObjectTemplateInlineBtn').onclick = () => publishObjectTemplate().catch(err => toast(err.message));
  $('deleteObjectTemplateBtn').onclick = () => deleteCurrentObjectTemplate().catch(err => toast(err.message));
  $('generateObjectAdviceBtn').onclick = () => generateObjectAdvisorSuggestions();
  $('applyIntentToDefinitionBtn').onclick = applyIntentToDefinition;
  $('loadStrategyExperienceIntentBtn').onclick = loadStrategyExperienceIntent;
  $('goPaperUploadFromExamplesBtn').onclick = goPaperUploadFromExamples;
  $('loadCandidateExamplesBtn').onclick = loadCandidateExamplesFromPaper;
  $('loadStrategyExperienceExamplesBtn').onclick = loadStrategyExperienceExamples;
  $('importObjectConfigBtn').onclick = openObjectImportModal;
  $('objectImportApplyBtn').onclick = importResearchObjectConfig;
  $('objectImportClose').onclick = closeObjectImportModal;
  $('promptPreviewClose').onclick = closePromptPreviewModal;
  $('randomSimulationSampleBtn').onclick = insertRandomSimulationSample;
  $('simulationRawJsonBtn').onclick = openSimulationRawModal;
  $('simulationRawClose').onclick = closeSimulationRawModal;
  $('extractionResultClose').onclick = closeExtractionResultModal;
  document.querySelectorAll('[data-paper-library-tab]').forEach(button => {
    button.onclick = () => {
      state.paperLibraryTab = button.dataset.paperLibraryTab;
      state.paperPage = 1;
      state.selectedPaperIds = [];
      renderPapers();
    };
  });
  $('paperSearchInput').addEventListener('input', updatePaperFiltersFromInputs);
  ['paperYearFilter', 'paperCollectionFilter', 'paperParseStatusFilter', 'paperExtractionStatusFilter'].forEach(id => {
    $(id).onchange = updatePaperFiltersFromInputs;
  });
  $('paperImportToggleBtn').onpointerdown = (event) => event.stopPropagation();
  $('paperImportToggleBtn').onclick = window.togglePaperImportPane;
  $('paperImportResizeHandle').onpointerdown = startPaperImportResize;
  $('createPaperSetBtn').onclick = () => togglePaperSetCreate(true);
  $('confirmCreatePaperSetBtn').onclick = () => createPaperSet().catch(err => toast(err.message));
  $('cancelCreatePaperSetBtn').onclick = () => togglePaperSetCreate(false);
  $('selectAllPaperSetPapersBtn').onclick = toggleSelectAllPaperSetPapers;
  $('batchMovePaperSetSelect').onchange = updateBatchMoveTargetTitle;
  $('batchMovePapersBtn').onclick = () => moveSelectedPapersToSet().catch(err => toast(err.message));
  $('libraryBatchTemplateSelect').onchange = updateLibraryBatchTemplateTitle;
  $('batchRunExtractionBtn').onclick = () => runLibraryBatchExtraction().catch(err => toast(err.message));
  $('batchDeletePapersBtn').onclick = () => deleteSelectedPapers().catch(err => toast(err.message));
  $('batchReparsePapersBtn').onclick = () => reparseSelectedPapers().catch(err => toast(err.message));
  $('batchExportPapersBtn').onclick = exportSelectedPapers;
  $('paperSetNameInput').addEventListener('keydown', (event) => {
    if (event.key === 'Enter') createPaperSet().catch(err => toast(err.message));
  });
  $('promptPickerToggle').onclick = togglePromptPicker;
  $('saveCurrentPromptBtn').onclick = saveCurrentPrompt;
  $('saveNewPromptBtn').onclick = saveNewPrompt;
  $('simulationPromptSelect').onchange = selectSimulationPrompt;
  $('objectPromptPreview').addEventListener('input', () => {
    state.objectPromptDirty = true;
  });
  $('runSimulationBtn').onclick = runObjectSimulation;
  $('addDimensionBtn').onclick = addObjectDimension;
  $('removeDimensionBtn').onclick = removeObjectDimension;
  $('refreshDimensionFeedbackBtn').onclick = () => refreshDimensionFeedback().catch(err => toast(err.message));
  $('addTermIncludeBtn').onclick = addTermInclude;
  $('termIncludeInput').addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      addTermInclude();
    }
  });
  document.querySelectorAll('.object-tab').forEach(btn => {
    btn.onclick = () => {
      collectObjectConfigFromForm();
      document.querySelectorAll('.object-tab').forEach(item => item.classList.remove('active'));
      document.querySelectorAll('.object-tab-panel').forEach(item => item.classList.remove('active'));
      btn.classList.add('active');
      $(btn.dataset.objectTab).classList.add('active');
      renderObjectPreview();
    };
  });
  document.querySelectorAll('#object-config input, #object-config textarea, #object-config select').forEach(el => {
    el.addEventListener('input', () => {
      if (['objectPromptPreview', 'simulationInput', 'simulationPromptSelect'].includes(el.id)) return;
      if (!state.objectConfig) return;
      collectObjectConfigFromForm();
      renderObjectDimensionList();
      renderObjectPreview();
      renderObjectOverviewStats(state.objectConfig);
      renderCurrentDimensionFeedback();
    });
  });
  $('importMode').onchange = updateImportMode;
  updateImportMode();
  $('addArxivInput').onclick = () => addArxivInput();
  $('paperModalClose').onclick = closePaperDetail;
  document.querySelectorAll('[data-close-modal]').forEach(el => {
    el.onclick = () => {
      if (el.dataset.closeModal === 'promptPreviewModal') closePromptPreviewModal();
      else if (el.dataset.closeModal === 'objectImportModal') closeObjectImportModal();
      else if (el.dataset.closeModal === 'simulationRawModal') closeSimulationRawModal();
      else if (el.dataset.closeModal === 'extractionResultModal') closeExtractionResultModal();
      else if (el.dataset.closeModal === 'objectConfigModal') closeObjectConfigModal();
      else if (el.dataset.closeModal === 'configModal') closeConfigModal();
      else closePaperDetail();
    };
  });
  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return;
    if (!$('promptPickerMenu')?.hidden) closePromptPicker();
    else if (!$('objectImportModal').hidden) closeObjectImportModal();
    else if (!$('simulationRawModal').hidden) closeSimulationRawModal();
    else if (!$('extractionResultModal').hidden) closeExtractionResultModal();
    else if (!$('promptPreviewModal').hidden) closePromptPreviewModal();
    else if (!$('paperDetailModal').hidden) closePaperDetail();
    else if (!$('objectConfigModal').hidden) closeObjectConfigModal();
    else if (!$('configModal').hidden) closeConfigModal();
  });
  document.addEventListener('click', (event) => {
    if (!$('promptProfilePicker') || $('promptProfilePicker').contains(event.target)) return;
    closePromptPicker();
  });
  $('templateSelect').onchange = () => {
    renderTemplateSummary();
    renderDimensionChecks();
    renderExtractPaperChecks();
    renderExtractionPaperRuns();
  };
  $('confirmExtractPapersBtn').onclick = () => {
    const ids = draftExtractPaperIds();
    if (!ids.length) return toast('璇疯嚦灏戦€夋嫨涓€绡囧凡鏍￠獙璁烘枃');
    state.confirmedExtractPaperIds = ids;
    state.extractDraftPaperIds = ids;
    setExtractionSelectionMode('confirmed');
  };
  $('addExtractPapersBtn').onclick = () => {
    state.extractDraftPaperIds = [...state.confirmedExtractPaperIds];
    setExtractionSelectionMode('selecting');
  };
  $('selectAllVerifiedPapersBtn').onclick = () => {
    document.querySelectorAll('.extractPaperCheck').forEach(input => input.checked = true);
    state.extractDraftPaperIds = draftExtractPaperIds();
  };
  $('clearSelectedPapersBtn').onclick = () => {
    document.querySelectorAll('.extractPaperCheck').forEach(input => input.checked = false);
    state.extractDraftPaperIds = [];
  };
  $('reviewScopeToggleBtn').onclick = window.toggleReviewScopePanel;
  $('applyReviewScopeBtn').onclick = applyReviewScopeFromDraft;
  $('reviewSidebarToggleBtn').onpointerdown = (event) => event.stopPropagation();
  $('reviewSidebarToggleBtn').onclick = window.toggleReviewSidebar;
  $('reviewSidebarResizeHandle').onpointerdown = startReviewSidebarResize;
  $('reviewTemplateSelect').onchange = () => {
    const templateId = $('reviewTemplateSelect').value || '';
    const run = selectReviewRunForSelection(templateId);
    state.reviewDraftTemplateId = templateId;
    state.reviewDraftPaperIds = run?.paper_id ? [run.paper_id] : [];
    state.reviewDraftPaperSetIds = [];
    state.reviewDraftFilters = {...reviewDraftFilters(), dimension: 'all'};
    state.reviewDraftDirty = true;
    state.reviewPaperDropdownOpen = false;
    state.reviewPaperSetDropdownOpen = false;
    renderReviewPanel();
  };
  ['reviewDimensionFilter', 'reviewStatusFilter', 'reviewRiskFilter'].forEach(id => {
    $(id).onchange = updateReviewDraftFiltersFromInputs;
  });
  $('reviewSearchInput').addEventListener('input', updateReviewDraftFiltersFromInputs);
  $('reviewPrevBtn').onclick = () => setReviewItemIndex(state.reviewItemIndex - 1);
  $('reviewNextBtn').onclick = () => setReviewItemIndex(state.reviewItemIndex + 1);
  $('exportReviewRecordsBtn').onclick = () => exportReviewRecords().catch(err => toast(err.message));
  $('uploadBtn').onclick = async () => {
    const file = $('paperFile').files[0];
    if (!file) return toast('璇烽€夋嫨鏂囦欢');
    const form = new FormData(); form.append('file', file);
    await runPaperImport('姝ｅ湪涓婁紶骞惰В鏋?..', file.name, 'upload', () => api('/api/papers/upload', {method:'POST', body: form}));
  };
  $('arxivBtn').onclick = async () => {
    const values = getArxivValues(); if (!values.length) return toast('璇疯緭鍏?arXiv ID');
    if (values.length > 1) {
      await runArxivBatchImport(values);
      return;
    }
    const title = values.length === 1 ? values[0] : `鎵归噺 arXiv 瀵煎叆锛?{values.length} 绡囷級`;
    await runPaperImport('姝ｅ湪浠?arXiv 瀵煎叆...', title, 'arxiv', () => api('/api/papers/import/arxiv', {method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({arxiv_id_or_url: values[0]})}));
  };
  $('doiBtn').onclick = async () => {
    const v = $('doiInput').value.trim(); if (!v) return toast('璇疯緭鍏?DOI');
    await runPaperImport('姝ｅ湪浠?DOI 瀵煎叆...', v, 'doi', () => api('/api/papers/import/doi', {method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({doi: v, try_download_pdf: $('doiPdf').checked})}));
  };
  $('bibtexBtn').onclick = async () => {
    const v = $('bibtexInput').value.trim(); if (!v) return toast('璇疯緭鍏?BibTeX');
    await runPaperImport('姝ｅ湪瀵煎叆 BibTeX...', 'BibTeX 鍏冩暟鎹?, 'bibtex', () => api('/api/papers/import/bibtex', {method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({bibtex_text: v})}));
  };
  $('runExtractionBtn').onclick = runSelectedExtractions;
  $('searchMaterialsBtn').onclick = searchMaterials;
  $('compareBtn').onclick = comparePapers;
  $('gapBtn').onclick = gapAnalysis;
  $('graphBtn').onclick = evidenceGraph;
}

setupTabs(); bindEvents(); refreshAll().catch(err => toast(err.message));
