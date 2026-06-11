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
  paperLibraryControlsOpen: true,
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
  materialsSidebarWidth: 320,
  materialsSidebarCollapsed: false,
  materialsSidebarResizing: false,
  materialsInsightWidth: 340,
  materialsInsightCollapsed: false,
  materialsInsightResizing: false,
  materialScopePanelOpen: true,
  materialDropdownOpen: null,
  materialAnalysisType: 'overview',
  materialAnalysisDepth: 'root',
  materialCurrentItems: [],
  materialListQuery: '',
  materialCompareGroupMode: 'none',
  materialCompareOnlyUnverified: false,
  materialDeepDiveDimension: null,
  materialDeepDiveAxis: '',
  materialDeepDiveView: 'overview_stats',
  materialSemanticClusters: {},
  materialSemanticClusterRenames: {},
  materialSemanticClusterMergeSelection: [],
  materialOverviewDetailSelection: null,
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
  {value: 'abstract', label: '摘要'},
  {value: 'introduction', label: '引言/研究背景'},
  {value: 'related_work', label: '相关工作'},
  {value: 'method', label: '方法/框架'},
  {value: 'system', label: '系统/实现'},
  {value: 'algorithm', label: '算法/流程'},
  {value: 'experiment', label: '实验设置'},
  {value: 'results', label: '实验结果'},
  {value: 'ablation', label: '消融/分析'},
  {value: 'discussion', label: '讨论'},
  {value: 'limitations', label: '局限性'},
  {value: 'conclusion', label: '结论/未来工作'},
  {value: 'appendix', label: '附录'},
  {value: 'references', label: '参考文献'},
  {value: 'other', label: '其他'},
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

const MATERIAL_ANALYSIS_TYPES = [
  {id: 'overview', index: '1', icon: '览', label: '素材总览', description: '快速查看素材覆盖、证据质量与待处理信号。'},
  {id: 'compare', index: '2', icon: '矩', label: '跨论文对比矩阵', description: '按维度比较不同论文的共同点与差异。'},
  {id: 'gap', index: '3', icon: '空', label: '研究空白分析', description: '定位未报告、证据薄弱和覆盖不足的方向。'},
  {id: 'claim_evidence', index: '4', icon: '证', label: 'Claim-Evidence 分析', description: '检查观点、证据片段和章节来源是否匹配。'},
  {id: 'review_pack', index: '5', icon: '综', label: '综述素材包', description: '组织综述大纲、Related Work 和引用表。'},
  {id: 'design', index: '6', icon: '案', label: '方案设计辅助', description: '从局限、空白和机制差异生成新方案线索。'},
];

const MATERIAL_REVIEW_STATUS_OPTIONS = [
  {value: 'confirm', label: '已确认', defaultChecked: true},
  {value: 'revise', label: '修改后确认', defaultChecked: true},
  {value: 'pending', label: '未审查', defaultChecked: true},
  {value: 'reject', label: '已驳回', defaultChecked: false},
  {value: 'mark_not_reported', label: '应为未报告', defaultChecked: false},
  {value: 'mark_evidence_insufficient', label: '证据不足', defaultChecked: false},
];

const MATERIAL_EVIDENCE_REQUIREMENT_OPTIONS = [
  {value: 'evidence_required', label: '仅包含有证据素材', defaultChecked: true},
  {value: 'include_model_inferred', label: '包含模型推断', defaultChecked: false},
  {value: 'include_evidence_issues', label: '包含证据不足素材', defaultChecked: false},
];

const MATERIAL_SOURCE_OPTIONS = [
  {value: 'arxiv', label: 'arXiv', defaultChecked: true},
  {value: 'acl', label: 'ACL', defaultChecked: true},
  {value: 'neurips', label: 'NeurIPS', defaultChecked: true},
  {value: 'iclr', label: 'ICLR', defaultChecked: true},
  {value: 'icml', label: 'ICML', defaultChecked: true},
  {value: 'other', label: '其他', defaultChecked: true},
];

const MATERIAL_EVIDENCE_STRENGTH_OPTIONS = [
  {value: 'strong', label: '强证据', defaultChecked: true},
  {value: 'medium', label: '中等证据', defaultChecked: true},
  {value: 'weak', label: '弱证据', defaultChecked: false},
];

const MATERIAL_OBJECT_ROLE_OPTIONS = [
  {value: 'core_contribution', label: '核心贡献', defaultChecked: true},
  {value: 'method_component', label: '方法组件', defaultChecked: true},
  {value: 'auxiliary_component', label: '辅助组件', defaultChecked: true},
  {value: 'evaluation_object', label: '评估对象', defaultChecked: true},
  {value: 'discussion_only', label: '仅讨论', defaultChecked: false},
];

const MATERIAL_ANALYSIS_PARAMS = {
  overview: [
    {value: 'coverage', label: '显示维度覆盖'},
    {value: 'risk', label: '突出风险素材'},
    {value: 'recent', label: '优先最近更新'},
  ],
  compare: [
    {value: 'accepted_only', label: '仅对比已接受素材'},
    {value: 'show_gaps', label: '矩阵中显示缺口'},
    {value: 'compact_cells', label: '单元格紧凑显示'},
  ],
  gap: [
    {value: 'not_reported', label: '高频 not_reported'},
    {value: 'evidence_issue', label: '证据不足'},
    {value: 'missing_ablation', label: '缺少消融实验'},
    {value: 'limitations', label: '局限性聚合'},
    {value: 'coverage', label: '维度覆盖不完整'},
  ],
  claim_evidence: [
    {value: 'method_first', label: '优先检查 Method / Results 证据'},
    {value: 'flag_conclusion', label: '标记 Conclusion 支撑不足'},
    {value: 'show_context', label: '显示证据上下文线索'},
  ],
  review_pack: [
    {value: 'outline', label: '综述大纲'},
    {value: 'related_work', label: 'Related Work 素材'},
    {value: 'citation_table', label: '观点-引用表'},
    {value: 'questions', label: '研究问题清单'},
  ],
  design: [
    {value: 'mechanism_gap', label: '机制差异'},
    {value: 'evaluation_gap', label: '评估缺口'},
    {value: 'risk_boundary', label: '边界与风险'},
    {value: 'prototype_plan', label: '方案草案'},
  ],
};

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
const fmt = (s, n=180) => s && s.length > n ? s.slice(0, n) + '…' : (s || '');
const fmtTime = (s) => s ? new Date(s).toLocaleString() : '-';
const normalizeDateParts = (parts) => {
  if (!Array.isArray(parts) || !parts.length || !Number.isFinite(Number(parts[0]))) return '';
  const year = String(Number(parts[0]));
  const month = Number.isFinite(Number(parts[1])) ? String(Number(parts[1])).padStart(2, '0') : '';
  const day = Number.isFinite(Number(parts[2])) ? String(Number(parts[2])).padStart(2, '0') : '';
  return [year, month, day].filter(Boolean).join('-');
};
const normalizePublishedDate = (value) => {
  if (!value) return '';
  if (Array.isArray(value)) return normalizeDateParts(value);
  if (typeof value === 'object') {
    const dateParts = value['date-parts'] || value.date_parts || value.dateParts;
    return normalizeDateParts(Array.isArray(dateParts?.[0]) ? dateParts[0] : dateParts);
  }
  const text = String(value).trim();
  if (!text) return '';
  const match = text.match(/^(\d{4})(?:-(\d{1,2})(?:-(\d{1,2}))?)?/);
  if (!match) return text;
  return [match[1], match[2]?.padStart(2, '0'), match[3]?.padStart(2, '0')].filter(Boolean).join('-');
};
const arxivMonthFromId = (arxivId) => {
  const match = String(arxivId || '').match(/^(\d{2})(\d{2})\./);
  if (!match) return '';
  const yy = Number(match[1]);
  const year = yy < 90 ? 2000 + yy : 1900 + yy;
  return `${year}-${match[2]}`;
};
const paperPublishedDate = (paper) => {
  const meta = paper?.metadata || {};
  const extra = meta.extra || {};
  const raw = [
    extra.published,
    extra.published_date,
    extra.publication_date,
    extra.issued,
    meta.published,
  ].find(Boolean);
  return normalizePublishedDate(raw) || arxivMonthFromId(meta.arxiv_id) || (meta.year ? String(meta.year) : '未知');
};
const fmtDuration = (seconds) => {
  const value = Number(seconds);
  if (!Number.isFinite(value)) return '-';
  if (value < 60) return `${value.toFixed(value < 10 ? 1 : 0)} 秒`;
  return `${Math.floor(value / 60)} 分 ${Math.round(value % 60)} 秒`;
};
const secondsBetweenIso = (start, end) => {
  const startMs = Date.parse(start || '');
  const endMs = Date.parse(end || '');
  if (!Number.isFinite(startMs) || !Number.isFinite(endMs) || endMs <= startMs) return undefined;
  return (endMs - startMs) / 1000;
};
const extractionRunDurationSeconds = (run) => {
  const explicit = [
    run?.duration_seconds,
    run?.elapsed_seconds,
    run?.metadata?.duration_seconds,
    run?.metadata?.elapsed_seconds,
  ].find(value => value !== undefined && value !== null && Number.isFinite(Number(value)));
  if (explicit !== undefined) return Number(explicit);
  const startMs = Date.parse(run?.created_at || '');
  const itemTimes = (run?.items || [])
    .map(item => Date.parse(item.created_at || ''))
    .filter(Number.isFinite);
  if (Number.isFinite(startMs) && itemTimes.length) {
    const elapsed = (Math.max(...itemTimes) - startMs) / 1000;
    if (Number.isFinite(elapsed) && elapsed > 0) return elapsed;
  }
  return secondsBetweenIso(run?.created_at, run?.updated_at);
};
const sourceLabel = (source) => ({
  upload: '本地上传',
  arxiv: 'arXiv',
  doi: 'DOI / Crossref',
  bibtex: 'BibTeX',
  manual: '手动录入'
}[source] || source || '未知来源');

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
  $('objectImportStatus').textContent = '等待导入。';
  $('objectImportModal').hidden = false;
  document.body.classList.add('modal-open');
}

function closeObjectImportModal() {
  $('objectImportModal').hidden = true;
  syncModalLock();
}

function openSimulationRawModal() {
  const raw = state.simulationRawResult || '';
  let display = raw || '暂无原始结果。';
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
    name: String(profile.name || profile.id || `大模型配置 ${index + 1}`).trim(),
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
  if (!profiles.length && cfg.llm) profiles = [normalizeLlmProfile({...cfg.llm, id: 'default', name: '当前配置', active: true})];
  if (!profiles.length) profiles = [normalizeLlmProfile({id: 'default', name: '当前配置', active: true})];
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
      ${profile.id === activeId ? '<b>当前使用</b>' : ''}
      <small>${escapeHtml(profile.openai_model || '未填写模型')}</small>
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
  $('llmProfileEditorTitle').textContent = profile.id === activeId ? `${profile.name}（当前使用）` : profile.name;
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
  toast('配置已保存');
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
    name: `大模型配置 ${next}`,
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
  if (profiles.length <= 1) return toast('至少保留一组大模型配置');
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
  toast('已设为当前使用，保存配置后写入系统');
}

async function testLlmProfile() {
  saveCurrentLlmProfileForm();
  const profile = selectedLlmProfile();
  const resultBox = $('llmTestResult');
  resultBox.className = 'test-result muted';
  resultBox.textContent = '正在测试接口...';
  $('testLlmProfileBtn').disabled = true;
  try {
    const result = await api('/api/config/llm-test', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({profile, prompt: $('llmTestPrompt').value}),
    });
    resultBox.className = 'test-result ok';
    resultBox.textContent = `测试成功，用时 ${result.elapsed_seconds}s：${result.content || '接口已响应'}`;
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
    name: '对象存在性',
    description: '判断论文中是否存在策略经验对象，以及它在论文中的角色。',
    question: 'Does the paper contain strategy experience as a method component, knowledge object, memory object, policy guidance, or reusable lesson? If yes, what role does it play in the paper?',
    output_type: 'structured_object',
    required: true,
    requires_evidence: true,
    allow_inference: true,
    fields: [
      {name: 'exists', type: 'boolean', description: '论文中是否存在策略经验对象。'},
      {name: 'role_in_paper', type: 'enum', values: ['core_contribution', 'method_component', 'auxiliary_component', 'evaluation_object', 'discussion_only', 'not_present'], description: '策略经验在论文中的角色。'},
      {name: 'local_terms', type: 'list', description: '论文中用于表达策略经验的本地术语。'},
      {name: 'judgement_reason', type: 'long_text', description: '判断其属于或不属于策略经验的理由。'},
    ],
  },
  {
    dimension_id: 'strategy_experience_definition',
    name: '策略经验定义',
    description: '抽取论文如何定义、描述或隐含定义策略经验。',
    question: 'How does the paper define, describe, or operationalize strategy experience?',
    output_type: 'claim_with_evidence',
    required: true,
    requires_evidence: true,
    allow_inference: true,
    fields: [
      {name: 'definition_type', type: 'enum', values: ['explicit_definition', 'operational_definition', 'implicit_definition', 'undefined'], description: '定义类型。'},
      {name: 'definition_text', type: 'long_text', description: '策略经验的定义或操作性描述。'},
      {name: 'author_explicit', type: 'boolean', description: '该定义是否为作者明确表述。'},
      {name: 'model_inferred', type: 'boolean', description: '该定义是否包含模型基于上下文的推断。'},
    ],
  },
  {
    dimension_id: 'strategy_experience_source',
    name: '策略经验来源',
    description: '抽取策略经验来自哪些数据、过程或主体。',
    question: 'Where does the strategy experience come from? Identify its source, producer, and collection stage.',
    output_type: 'structured_object',
    required: true,
    requires_evidence: true,
    allow_inference: true,
    fields: [
      {name: 'source_type', type: 'multi_enum', values: ['human_feedback', 'user_preference', 'expert_demonstration', 'agent_trajectory', 'environment_feedback', 'success_case', 'failure_case', 'interaction_log', 'model_self_reflection', 'external_case_base', 'domain_expert_rule', 'not_reported'], description: '策略经验的来源类型。'},
      {name: 'producer', type: 'enum', values: ['human', 'agent', 'environment', 'model', 'expert', 'user', 'hybrid', 'not_reported'], description: '策略经验由谁产生。'},
      {name: 'collection_stage', type: 'enum', values: ['before_task', 'during_task', 'after_task', 'during_training', 'during_inference', 'offline_preprocessing', 'not_reported'], description: '策略经验在什么时候被收集。'},
      {name: 'raw_material', type: 'long_text', description: '策略经验形成前的原始材料，例如轨迹、反馈、案例、日志、示范等。'},
    ],
  },
  {
    dimension_id: 'strategy_experience_extraction_method',
    name: '策略经验抽取方式',
    description: '抽取策略经验如何从原始材料中被形成、总结、学习或构建。',
    question: 'How is strategy experience extracted, summarized, learned, or constructed from raw materials?',
    output_type: 'method_step_list',
    required: true,
    requires_evidence: true,
    allow_inference: true,
    fields: [
      {name: 'method_type', type: 'multi_enum', values: ['manual_annotation', 'rule_based_extraction', 'llm_summarization', 'reflection_generation', 'trajectory_compression', 'failure_attribution', 'success_pattern_mining', 'preference_learning', 'reward_modeling', 'case_abstraction', 'reinforcement_learning', 'supervised_finetuning', 'not_reported'], description: '策略经验抽取或形成的方法类型。'},
      {name: 'input', type: 'long_text', description: '抽取方法的输入。'},
      {name: 'process', type: 'method_step_list', description: '经验抽取的主要过程。'},
      {name: 'output', type: 'long_text', description: '抽取后的策略经验结果。'},
      {name: 'automation_level', type: 'enum', values: ['manual', 'semi_automatic', 'automatic', 'not_reported'], description: '抽取过程的自动化程度。'},
    ],
  },
  {
    dimension_id: 'strategy_experience_representation',
    name: '策略经验表示方式',
    description: '抽取策略经验以什么形式被表达、存储或组织。',
    question: 'How is strategy experience represented, stored, or organized?',
    output_type: 'structured_object',
    required: false,
    requires_evidence: true,
    allow_inference: true,
    fields: [
      {name: 'representation_type', type: 'multi_enum', values: ['natural_language_rule', 'heuristic', 'plan_template', 'action_policy', 'decision_rule', 'case_library', 'trajectory_summary', 'prompt_snippet', 'key_value_memory', 'vector_embedding', 'knowledge_graph', 'model_parameter', 'reward_function', 'not_reported'], description: '策略经验的表示类型。'},
      {name: 'storage_location', type: 'enum', values: ['prompt', 'memory_buffer', 'external_memory', 'case_base', 'database', 'model_parameters', 'policy_network', 'retrieval_index', 'not_reported'], description: '策略经验存储在哪里。'},
      {name: 'organization_method', type: 'long_text', description: '策略经验如何被组织、索引、分类或管理。'},
    ],
  },
  {
    dimension_id: 'strategy_experience_usage',
    name: '策略经验使用方式',
    description: '抽取策略经验如何被用于后续任务、决策、规划或模型优化。',
    question: 'How is strategy experience used to guide future tasks, planning, decision making, generation, or model optimization?',
    output_type: 'structured_object',
    required: true,
    requires_evidence: true,
    allow_inference: true,
    fields: [
      {name: 'usage_type', type: 'multi_enum', values: ['prompt_augmentation', 'retrieval_augmented_generation', 'planning_guidance', 'decision_support', 'action_selection', 'reranking', 'error_avoidance', 'policy_update', 'model_training', 'personalization', 'self_improvement', 'not_reported'], description: '策略经验的使用类型。'},
      {name: 'use_stage', type: 'multi_enum', values: ['before_task', 'during_task', 'after_task', 'training_time', 'inference_time', 'evaluation_time', 'not_reported'], description: '策略经验在什么时候被使用。'},
      {name: 'consumer', type: 'enum', values: ['llm', 'agent', 'planner', 'retriever', 'policy_model', 'reward_model', 'human_user', 'hybrid_system', 'not_reported'], description: '谁使用策略经验。'},
      {name: 'usage_mechanism', type: 'long_text', description: '策略经验具体如何影响行为或输出。'},
    ],
  },
  {
    dimension_id: 'strategy_experience_evaluation',
    name: '策略经验效果验证',
    description: '抽取论文是否验证策略经验有效，以及如何验证。',
    question: 'Does the paper evaluate the contribution or effectiveness of strategy experience? If yes, how?',
    output_type: 'comparison_result',
    required: false,
    requires_evidence: true,
    allow_inference: false,
    fields: [
      {name: 'has_direct_evaluation', type: 'boolean', description: '是否直接验证策略经验的贡献。'},
      {name: 'evaluation_type', type: 'multi_enum', values: ['ablation_study', 'baseline_comparison', 'human_evaluation', 'case_study', 'error_analysis', 'longitudinal_evaluation', 'generalization_test', 'not_reported'], description: '验证方式。'},
      {name: 'baseline', type: 'string', description: '对比基线，例如 without experience、without reflection、without memory。'},
      {name: 'metrics', type: 'list', description: '使用的评价指标。'},
      {name: 'reported_effect', type: 'long_text', description: '论文报告的效果。'},
      {name: 'evidence_strength', type: 'enum', values: ['strong', 'medium', 'weak', 'missing'], description: '证据强度。'},
    ],
  },
  {
    dimension_id: 'strategy_experience_limitations',
    name: '局限与适用条件',
    description: '抽取策略经验的适用边界、局限性和潜在风险。',
    question: 'What are the limitations, applicable conditions, or risks of the strategy experience mechanism?',
    output_type: 'claim_with_evidence',
    required: false,
    requires_evidence: true,
    allow_inference: true,
    fields: [
      {name: 'limitation_type', type: 'multi_enum', values: ['quality_dependency', 'scalability_issue', 'domain_specificity', 'negative_transfer', 'staleness', 'conflict_between_experiences', 'cost_overhead', 'lack_of_evaluation', 'not_reported'], description: '局限类型。'},
      {name: 'limitation_text', type: 'long_text', description: '具体局限或适用条件。'},
      {name: 'source', type: 'enum', values: ['author_stated', 'experiment_implied', 'model_inferred', 'user_note'], description: '局限来源。'},
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
      name: '默认 Prompt',
      content: template.system_prompt,
      created_at: template.created_at || '',
      updated_at: template.updated_at || '',
    });
  }
  if (!profiles.length) {
    profiles.push({
      id: 'prompt_default',
      name: '默认 Prompt',
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
      display_name: template?.name || '策略经验',
      object_type: 'research_object',
      version: template?.version || '1.0.0',
      description: template?.description || '用于从论文中抽取与策略经验相关的信息，包括策略经验的定义、来源、抽取方式、表示方式、使用方式、效果验证和局限性。',
    },
    term_rules: {
      concept_policy: {
        working_definition: '策略经验是指从历史任务、交互轨迹、成功/失败案例、环境反馈、专家示范、用户反馈或模型反思中总结出来，并可用于指导后续任务规划、行动选择、决策优化、错误规避或策略改进的经验性信息。',
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
          '不将普通背景知识视为策略经验，除非论文明确说明其来自历史任务、反馈、案例或交互过程。',
          '不将纯模型参数或训练语料视为策略经验，除非论文明确将其作为可复用策略或经验进行组织和使用。',
          '不将单纯的实验结果视为策略经验，除非实验结果被进一步总结为可指导后续任务的策略、规则或经验。',
          '不将 related work 中提到的策略或经验视为本文的策略经验，除非论文明确复用或构建了该类经验。',
        ],
      },
      decision_criteria: '必须能回答该经验从何而来、被如何抽取或组织、如何指导后续策略/决策，以及论文提供了什么证据。',
    },
    dimensions: dims.length ? dims : JSON.parse(JSON.stringify(STRATEGY_EXPERIENCE_DIMENSIONS)),
    normalization: {
      tags: ['definition', 'storage', 'retrieval', 'update', 'usage', 'evaluation'],
      rules: '同义术语合并到同一标签；保留作者原词作为 raw_value；无法归一化时返回 unknown。',
    },
    evidence_rules: {
      require_quote: true,
      require_section: true,
      require_page: true,
      require_chunk_id: true,
      processing_policy: '允许对原文进行简短概括，但必须保留原文 quote；推断内容必须显式标记为 inferred。',
      evidence_types: ['author_claim', 'definition', 'method_description', 'experiment_result', 'ablation', 'limitation'],
    },
    analysis_views: {
      views: ['对象定义对比', '机制流程对比', '证据强度矩阵', '局限与适用条件'],
      prompt: '比较不同论文中对象的组成、作用阶段、证据类型、适用条件和局限。',
    },
    modeling: template?.modeling || defaultModelingState(template),
    prompts: normalizePromptProfiles(template),
  };
}

function defaultModelingState(template = null) {
  return {
    research_intent: {
      object_name: template?.name || '策略经验',
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
    .replace(/^抽取问题[:：]\s*/i, '')
    .replace(/\s+/g, '')
    .replace(/[，,。.!！?？；;：:、"'“”‘’()（）\[\]【】]/g, '')
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
  if (/definition|定义|identity|元信息/.test(text)) return policy(['abstract','introduction','method','system'], ['discussion','conclusion','other']);
  if (/source|来源|collection|data/.test(text)) return policy(['method','system','algorithm'], ['introduction','experiment','appendix','other']);
  if (/extraction|extract|抽取|summar|learn|学习|构建|方法|步骤|pipeline|algorithm/.test(text)) return policy(['method','algorithm','system'], ['experiment','appendix','other']);
  if (/representation|表示|storage|存储|memory/.test(text)) return policy(['method','system','algorithm'], ['appendix','other']);
  if (/usage|use|使用|planning|decision|应用/.test(text)) return policy(['method','system','algorithm','experiment'], ['discussion','appendix','other']);
  if (/update|更新|adapt|refine|迭代|transfer/.test(text)) return policy(['method','algorithm','system'], ['experiment','discussion','appendix','other']);
  if (/experiment|evaluation|evidence|effect|result|效果|实验|验证/.test(text)) return policy(['experiment','results','ablation'], ['method','discussion','conclusion','other']);
  if (/limitation|局限|risk|failure|future/.test(text)) return policy(['limitations','discussion','conclusion'], ['experiment','results','other']);
  if (/motivation|background|gap|动机|背景/.test(text)) return policy(['abstract','introduction'], ['discussion','related_work','other'], ['references']);
  if (/contribution|claim|innovation|贡献|创新|观点/.test(text)) return policy(['abstract','introduction','method'], ['results','discussion','conclusion','other']);
  return policy(['method','system','algorithm','experiment','results'], ['abstract','introduction','discussion','limitations','conclusion','appendix','other']);
}

function renderSectionPolicyEditor(dim) {
  const holder = $('dimSectionPolicy');
  if (!holder) return;
  const policy = normalizeSectionPolicy(dim?.section_policy, dim);
  const disabled = !dim;
  const groups = [
    ['prefer', '优先章节'],
    ['allow', '可用章节'],
    ['exclude', '排除章节'],
  ];
  const selectedValues = new Set([...policy.prefer, ...policy.allow, ...policy.exclude]);
  holder.innerHTML = groups.map(([key, title]) => `
    <section class="section-policy-column" data-section-policy-column="${key}">
      <div class="section-policy-column-head">
        <h4>${title}</h4>
        <select data-section-policy-select="${key}" ${disabled ? 'disabled' : ''}>
          <option value="">添加章节</option>
          ${SECTION_TYPE_OPTIONS
            .filter(option => !selectedValues.has(option.value))
            .map(option => `<option value="${escapeHtml(option.value)}" title="${escapeHtml(option.value)}">${escapeHtml(option.label)}</option>`)
            .join('')}
        </select>
      </div>
      <div class="section-policy-tags">
        ${policy[key].map(value => {
          const option = SECTION_TYPE_OPTIONS.find(item => item.value === value) || {label: value, value};
          return `
            <span class="section-policy-tag" data-section-policy-tag="${key}" data-value="${escapeHtml(value)}" title="${escapeHtml(value)}">
              <span>${escapeHtml(option.label)}</span>
              <button type="button" data-section-policy-remove="${key}" data-value="${escapeHtml(value)}" aria-label="移除${escapeHtml(option.label)}" ${disabled ? 'disabled' : ''}>&times;</button>
            </span>
          `;
        }).join('') || '<span class="section-policy-empty">未选择</span>'}
      </div>
    </section>
  `).join('');
  holder.querySelectorAll('select[data-section-policy-select]').forEach(select => {
    select.onchange = () => {
      if (!dim || !select.value) return;
      const current = readSectionPolicyEditor(dim);
      current[select.dataset.sectionPolicySelect].push(select.value);
      dim.section_policy = normalizeSectionPolicy(current, dim);
      renderSectionPolicyEditor(dim);
    };
  });
  holder.querySelectorAll('button[data-section-policy-remove]').forEach(button => {
    button.onclick = () => {
      if (!dim) return;
      const current = readSectionPolicyEditor(dim);
      const key = button.dataset.sectionPolicyRemove;
      current[key] = current[key].filter(value => value !== button.dataset.value);
      dim.section_policy = normalizeSectionPolicy(current, dim);
      renderSectionPolicyEditor(dim);
    };
  });
}

function readSectionPolicyEditor(dim) {
  const holder = $('dimSectionPolicy');
  if (!holder) return normalizeSectionPolicy(dim?.section_policy, dim);
  const picked = {prefer: [], allow: [], exclude: []};
  holder.querySelectorAll('[data-section-policy-tag]').forEach(tag => {
    picked[tag.dataset.sectionPolicyTag].push(tag.dataset.value);
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
      name: '导入配置 Prompt',
      content: source.system_prompt,
      created_at: now,
      updated_at: now,
    });
  } else if (source?.prompt && !items.length) {
    items.push({
      id: 'prompt_imported',
      name: '导入配置 Prompt',
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
      name: '导入配置 Prompt',
      content: generated,
      created_at: now,
      updated_at: now,
    });
    cfg.prompts.active_id = 'prompt_imported_default';
  }
}

function objectConfigFromImportedJson(data) {
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    throw new Error('导入内容必须是 JSON 对象');
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
      display_name: obj.display_name || data.display_name || obj.name || '未命名科研对象',
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
      display_name: data.display_name || data.name || '未命名科研对象',
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
  if (!cfg.dimensions.length) throw new Error('导入配置至少需要包含 1 个 dimensions 项');
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
    '<option value="__new__">+新建对象</option>',
    ...state.templates.map(t => `<option value="${escapeHtml(t.id)}">${escapeHtml(t.name)} · v${escapeHtml(t.version)}</option>`)
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
  btn.title = template ? `删除 ${template.name}` : '请先选择一个已保存对象';
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
      <b aria-hidden="true">×</b>
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
  return [example.paper_title, example.section_title, example.chunk_id].filter(Boolean).join(' / ') || '手动样例';
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
      <div class="candidate-example-source">段落来源：${escapeHtml(candidateSourceLabel(example))}</div>
      <p>${escapeHtml(example.text || '')}</p>
      <div class="candidate-example-actions">
        <button type="button" data-mark-example="positive_example">算作${escapeHtml(state.objectConfig.object_definition?.display_name || '该对象')}</button>
        <button type="button" data-mark-example="negative_example">不算</button>
        <button type="button" data-mark-example="boundary_example">不确定</button>
      </div>
      <label>标注理由</label>
      <textarea rows="3" data-example-reason>${escapeHtml(example.reason || '')}</textarea>
    </article>
  `).join('') || '<p class="muted">暂无候选段落。可以选择论文后召回，或载入策略经验示例。</p>';
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
  if (!paper) return toast('请先导入或选择论文');
  const chunks = (paper.chunks || []).slice(0, 5);
  if (!chunks.length) return toast('该论文暂无可用段落');
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
  toast(`已召回 ${examples.length} 个候选段落`);
}

function goPaperUploadFromExamples() {
  closeObjectConfigModal();
  activatePanel('papers');
  $('paperFile')?.focus();
}

function loadStrategyExperienceIntent() {
  setValue('intentObjectName', '策略经验');
  setValue('intentResearchArea', 'LLM Agent');
  setValue('intentObjectType', 'mechanism_or_concept');
  setValue('intentResearchIntent', '研究智能体如何从历史任务、交互轨迹、反馈、失败案例或反思中总结可复用的策略经验，并将其用于后续规划、行动选择和错误规避。');
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
      reason: '从失败轨迹中总结 lesson，并用于未来规划。',
      paper_title: 'Strategy Experience Example',
      section_title: 'Method',
      chunk_id: 'example_positive_001',
    },
    {
      type: 'negative_example',
      text: 'The model achieves 10% improvement over the baseline.',
      reason: '这只是实验结果，没有被总结为可复用策略。',
      paper_title: 'Strategy Experience Example',
      section_title: 'Experiments',
      chunk_id: 'example_negative_001',
    },
    {
      type: 'boundary_example',
      text: 'The system stores previous trajectories in memory.',
      reason: '只保存轨迹，不确定是否用于后续决策。',
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
      '从失败案例、成功案例或交互轨迹中生成 lesson、reflection、rule、policy guidance，并用于后续任务的内容，应视为策略经验。'
    ];
  }
  if (modeling.boundary_examples.negative_examples.length || modeling.boundary_examples.uncertain_examples.length) {
    modeling.boundary_rules.exclude_rules = [
      '仅保存历史轨迹但未说明其被总结、检索、复用或用于后续规划/决策的内容，不应视为策略经验。'
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
  toast('已同步到对象定义');
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
      <b>${escapeHtml(d.name || d.dimension_id || '未命名维度')}</b>
      <span>${escapeHtml(d.dimension_id || '')}</span>
    </button>
  `).join('') || '<p class="muted">暂无维度。</p>';
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
    dimension: '维度',
    prompt: 'Prompt',
    object_definition: '对象定义',
    result: '结果',
  })[value] || value || '模板';
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
  if (!entries.length) return '<p class="muted">暂无记录。</p>';
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
    if (scope) scope.textContent = '未选择维度';
    panel.innerHTML = '<div class="dimension-feedback-empty"><b>暂无维度</b><p>选择或新增维度后显示反馈汇总。</p></div>';
    return;
  }

  const poolWrapper = findCurrentDimensionFeedbackPool(dim);
  const dimLabel = dim.name || dim.dimension_id || '当前维度';
  if (!poolWrapper) {
    if (scope) scope.textContent = `${dimLabel} · 暂无审查反馈`;
    panel.innerHTML = `
      <div class="dimension-feedback-empty">
        <b>暂无反馈记录</b>
        <p>该维度完成审查后，统计会自动汇总到这里。</p>
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
    scope.textContent = `${poolWrapper.dimension_name || dimLabel} · v${poolWrapper.profile_version || state.objectConfig?.object_definition?.version || '-'} · ${total} 条审查`;
  }

  panel.innerHTML = `
    <div class="dimension-feedback-counts">
      <div><b>${escapeHtml(total)}</b><span>审查总数</span></div>
      <div><b>${escapeHtml(pool.confirmed || 0)}</b><span>确认</span></div>
      <div><b>${escapeHtml(pool.revised || 0)}</b><span>修改</span></div>
      <div><b>${escapeHtml(pool.rejected || 0)}</b><span>驳回</span></div>
    </div>
    <div class="dimension-feedback-metrics">
      <div class="good"><span>确认率</span><b>${feedbackPercent(metrics.confirm_rate)}</b></div>
      <div><span>修改率</span><b>${feedbackPercent(metrics.revise_rate)}</b></div>
      <div class="warn"><span>驳回率</span><b>${feedbackPercent(metrics.reject_rate)}</b></div>
      <div class="warn"><span>证据问题</span><b>${feedbackPercent(metrics.evidence_issue_rate)}</b></div>
      <div class="warn"><span>过度推断</span><b>${feedbackPercent(metrics.over_inference_rate)}</b></div>
      <div><span>未报告修正</span><b>${feedbackPercent(metrics.not_reported_correction_rate)}</b></div>
      <div><span>维度错误</span><b>${feedbackPercent(metrics.wrong_dimension_rate)}</b></div>
      <div><span>平均修改幅度</span><b>${escapeHtml(metrics.average_edit_distance || 0)}</b></div>
    </div>
    <div class="dimension-feedback-grid">
      <section>
        <h4>高频错误标签</h4>
        ${renderFeedbackTagRows(tagRows, REVIEW_ERROR_TAGS)}
      </section>
      <section>
        <h4>根因归因</h4>
        ${renderFeedbackTagRows(rootRows, REVIEW_ROOT_CAUSES)}
      </section>
      <section>
        <h4>建议升级位置</h4>
        ${renderFeedbackTagRows(targetRows, REVIEW_SUGGESTED_TARGETS)}
      </section>
    </div>
    <section class="dimension-feedback-block">
      <h4>升级候选</h4>
      <div class="dimension-upgrade-list">
        ${candidates.slice(0, 4).map(item => `
          <article>
            <header>
              <b>${escapeHtml(item.title || '模板升级建议')}</b>
              <span>${escapeHtml(feedbackTargetLevelLabel(item.target_level))} · ${escapeHtml(item.suggested_target || '')}</span>
            </header>
            <p>${escapeHtml(item.recommended_change || item.reason || '')}</p>
            ${item.reason ? `<small>${escapeHtml(item.reason)}</small>` : ''}
          </article>
        `).join('') || '<p class="muted">暂无明显升级候选。</p>'}
      </div>
    </section>
    <details class="dimension-feedback-details">
      <summary>代表性反馈与人工修订</summary>
      <div class="dimension-feedback-case-list">
        ${cases.slice(0, 4).map(item => `
          <article>
            <b>${escapeHtml(reviewStatusLabel(item.review_action))}</b>
            <p>${escapeHtml(item.review_comment || (item.error_tags || []).map(tag => feedbackLookupLabel(tag, REVIEW_ERROR_TAGS)).join('、') || '无补充说明')}</p>
            ${(item.error_tags || []).length ? `<span>${escapeHtml(item.error_tags.map(tag => feedbackLookupLabel(tag, REVIEW_ERROR_TAGS)).join('、'))}</span>` : ''}
          </article>
        `).join('') || '<p class="muted">暂无代表性反馈。</p>'}
        ${edits.slice(0, 3).map(item => `
          <article>
            <b>人工修订</b>
            <p>${escapeHtml(fmt(item.new_answer || item.comment || '', 180))}</p>
            ${item.old_answer ? `<span>原答案：${escapeHtml(fmt(item.old_answer, 120))}</span>` : ''}
          </article>
        `).join('')}
      </div>
    </details>
  `;
}

async function refreshDimensionFeedback() {
  state.reviewFeedback = await api('/api/feedback/dimensions');
  renderCurrentDimensionFeedback();
  toast('维度反馈已刷新');
}

function addObjectDimension() {
  collectObjectConfigFromForm();
  const next = (state.objectConfig.dimensions || []).length + 1;
  state.objectConfig.dimensions.push({
    dimension_id: `dimension_${next}`,
    name: `维度 ${next}`,
    output_type: 'structured_object',
    description: '',
    question: '',
    fields: [],
    retrieval_keywords: [],
    section_policy: normalizeSectionPolicy({}, {dimension_id: `dimension_${next}`, name: `维度 ${next}`}),
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
      $('objectAdvisorStatus').textContent = '点击生成建议后，将根据当前配置给出可应用的修改项。';
    } else if (suggestions.length) {
      $('objectAdvisorStatus').textContent = `本轮生成 ${suggestions.length} 条建议，待处理 ${pending.length} 条。`;
    } else {
      $('objectAdvisorStatus').textContent = '当前没有新的建议。可以继续补充对象定义、正反例或试抽结果后再生成。';
    }
  }
  if (!state.objectAdvisorGeneratedAt) {
    $('objectAdvisorList').innerHTML = '<div class="advisor-empty">建议会围绕对象定义、边界规则、抽取维度、Prompt 和试抽诊断生成。</div>';
    return;
  }
  if (!suggestions.length) {
    $('objectAdvisorList').innerHTML = '<div class="advisor-empty">本轮建议已处理完，或者当前配置暂未发现明显缺口。</div>';
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
          <button type="button" data-advisor-apply="${escapeHtml(item.id)}" ${applied ? 'disabled' : ''}>${applied ? '已应用' : '应用'}</button>
          <button type="button" data-advisor-ignore="${escapeHtml(item.id)}" ${applied ? 'disabled' : ''}>忽略</button>
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
  return cfg?.object_definition?.display_name?.trim() || cfg?.modeling?.research_intent?.object_name?.trim() || '该研究对象';
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
      '对象定义建议',
      '建议补充工作定义',
      `将“${name}”定义清楚，减少抽取时和相邻概念混淆。`,
      '当前已经有对象名称或研究意图，但工作定义为空。建议在定义中明确来源、形成方式、使用作用三个要素。',
      `${name}是指论文中从历史任务、交互轨迹、成功/失败案例、环境反馈、专家示范、用户反馈或模型反思中总结出来，并可用于指导后续规划、行动选择、决策优化、错误规避或策略改进的经验性信息。`,
      {type: 'set_working_definition'}
    ));
  }
  if ((obj.display_name || intent) && !(modeling.boundary_rules.include_rules || []).length) {
    suggestions.push(objectAdvisorSuggestion(
      'definition:include-rule',
      '对象定义建议',
      '建议补充纳入标准',
      '把“什么算该对象”写成可执行规则，后续 Prompt 会更稳定。',
      '纳入标准适合描述对象必须具备的来源、形成过程和使用作用。系统会把这条规则同步到边界规则区。',
      `来自历史任务、交互轨迹、反馈、案例、示范或反思，并被进一步总结为可指导后续规划、决策、生成或行动选择的内容，应视为${name}。`,
      {type: 'append_include_rule'}
    ));
  }
  if ((obj.display_name || intent) && !concept.exclude_rules?.length) {
    suggestions.push(objectAdvisorSuggestion(
      'definition:exclude-rule',
      '对象定义建议',
      '建议补充排除标准',
      '先排除最容易误抽的背景知识、related work 和单纯实验结果。',
      '排除标准会同时写入术语规则和边界规则，帮助后续试抽时收窄边界。',
      `仅作为背景知识、related work 或单纯实验结果出现，且未被总结、检索、复用或影响后续决策的内容，不应直接视为${name}。`,
      {type: 'append_exclude_rule'}
    ));
  }
  if ((obj.display_name || intent) && !cfg.term_rules?.decision_criteria?.trim()) {
    suggestions.push(objectAdvisorSuggestion(
      'definition:observation-signal',
      '对象定义建议',
      '建议补充观察信号',
      '告诉系统在论文中看哪些信号，能提升对象判定的一致性。',
      '观察信号不是抽取结果本身，而是判断某段内容是否属于该研究对象时应优先检查的证据线索。',
      `优先观察论文是否明确交代${name}的来源、形成/抽取过程、表示形式、使用位置、效果验证和适用边界。`,
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
      '边界规则建议',
      '建议从正例总结纳入规则',
      `已有 ${positiveExamples.length} 条正例，可以沉淀成边界规则。`,
      '正例中的共同点应该变成可复用规则，而不是只停留在样例层面。',
      `当论文明确说明某类经验来自任务过程、反馈、案例或反思，并被用于后续规划、行动选择或错误规避时，应纳入${name}。`,
      {type: 'append_include_rule'}
    ));
  }
  if (/历史轨迹|轨迹|trajectory|trace|log|interaction history|history/i.test(boundaryText) && !/仅保存历史轨迹|保存历史轨迹/.test(excludeRuleText)) {
    suggestions.push(objectAdvisorSuggestion(
      'boundary:history-trace-exclusion',
      '边界规则建议',
      '建议新增排除规则',
      '“只保存历史轨迹”容易被误判为策略经验，建议明确排除条件。',
      '如果轨迹没有被进一步总结、检索、复用或影响后续决策，它更像原始材料，而不是已经形成的经验性对象。',
      `仅保存历史轨迹但未说明其被总结、检索、复用或影响后续决策的内容，不应直接视为${name}。`,
      {type: 'append_exclude_rule'}
    ));
  }

  const hasUpdateDimension = dims.some(dim => /更新|迭代|refine|revision|update|improvement/i.test(`${dim.dimension_id} ${dim.name} ${dim.question} ${dim.description}`));
  const updateSignals = /experience refinement|memory update|reflection update|policy update|update|refinement|更新|迭代|修订|优化/.test(lowerCorpus);
  if (!hasUpdateDimension && (updateSignals || /策略经验/.test(name))) {
    suggestions.push(objectAdvisorSuggestion(
      'dimension:update-method',
      '抽取维度建议',
      `建议新增维度：${name}更新方式`,
      '当前配置可能没有覆盖经验如何被更新、修订或迭代。',
      '正例、候选段落或试抽文本中出现 experience refinement、memory update、reflection update 等信号时，建议把“更新方式”作为独立维度。',
      `新增维度：${name}更新方式\n抽取问题：论文是否说明${name}如何被更新、修订、迭代或替换？触发条件、更新来源和更新结果是什么？`,
      {type: 'add_dimension_update'}
    ));
  }

  const missingPromptDims = promptText
    ? dims.filter(dim => dim.name && !promptText.includes(dim.name) && !promptText.includes(dim.dimension_id || ''))
    : dims;
  if (!promptText.trim()) {
    suggestions.push(objectAdvisorSuggestion(
      'prompt:create-active',
      'Prompt 优化建议',
      '建议生成激活 Prompt',
      '当前激活 Prompt 为空，试抽和批量抽取都缺少稳定任务指令。',
      '系统会基于当前对象定义、维度和证据要求重新生成 Prompt，并写入当前激活 Prompt。',
      '重新生成当前激活 Prompt。',
      {type: 'regenerate_prompt'}
    ));
  } else if (missingPromptDims.length) {
    suggestions.push(objectAdvisorSuggestion(
      'prompt:sync-dimensions',
      'Prompt 优化建议',
      '当前 Prompt 未覆盖最新维度',
      `发现 ${missingPromptDims.length} 个维度可能没有写入当前 Prompt。`,
      '当对象定义或维度更新后，旧 Prompt 可能仍按旧模板抽取。建议重新生成或手动补充。',
      `缺失维度：${missingPromptDims.map(dim => dim.name || dim.dimension_id).join('、')}`,
      {type: 'regenerate_prompt'}
    ));
  }
  const evaluationDim = dims.find(dim => /效果|验证|evaluation|experiment/i.test(`${dim.name} ${dim.dimension_id}`));
  if (evaluationDim && !/Experiment|Results|Ablation|实验|结果|消融/i.test(promptText)) {
    suggestions.push(objectAdvisorSuggestion(
      'prompt:evaluation-evidence',
      'Prompt 优化建议',
      '建议强化效果验证证据来源',
      '效果验证维度应优先使用实验、结果和消融证据，避免只引用总结性表述。',
      '这条建议会追加到当前激活 Prompt，提醒模型不要把 Conclusion 中的宽泛 claim 直接当成实验证据。',
      '效果验证维度优先使用 Experiment、Results、Ablation Study 中的证据；不要把 Conclusion 中的总结性表述直接当成实验证据。',
      {type: 'append_prompt_note'}
    ));
  }

  if (
    state.simulationRawResult
    && /实验结果|结果提升|提升|performance|accuracy|score|improvement/i.test(state.simulationRawResult)
    && !/单纯实验结果/.test(excludeRuleText)
  ) {
    suggestions.push(objectAdvisorSuggestion(
      'simulation:broad-boundary',
      '试抽诊断建议',
      '诊断：召回边界偏宽',
      '试抽结果中可能把“实验结果提升”当成了研究对象。',
      '如果模型把单纯性能提升抽成策略经验，说明排除规则还不够强，需要明确“实验结果”和“可复用经验规则”的区别。',
      `不将单纯实验结果视为${name}，除非实验结果被进一步总结为可指导后续任务的规则、lesson 或策略。`,
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
  if (!options.silent) toast(suggestions.length ? `已生成 ${suggestions.length} 条建议` : '当前没有发现新的建议');
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
  if ((cfg.dimensions || []).some(dim => dim.dimension_id === id || dim.name === `${name}更新方式`)) return;
  cfg.dimensions.push({
    dimension_id: id,
    name: `${name}更新方式`,
    output_type: 'structured_object',
    description: `抽取论文是否说明${name}如何被更新、修订、迭代或替换。`,
    question: `论文是否说明${name}如何被更新、修订、迭代或替换？触发条件、更新来源和更新结果是什么？`,
    fields: [
      {name: 'update_trigger', type: 'long_text', description: '触发更新的条件或事件。'},
      {name: 'update_source', type: 'long_text', description: '更新所依据的数据、反馈、案例或反思。'},
      {name: 'update_process', type: 'method_step_list', description: '更新、修订或迭代的过程。'},
      {name: 'updated_output', type: 'long_text', description: '更新后的经验、规则或策略形式。'},
    ],
    retrieval_keywords: ['update', 'refinement', 'reflection update', 'memory update', 'policy update', 'revision', '更新', '迭代', '修订'],
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
  toast('建议已应用');
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
      name: '默认 Prompt',
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
  $('promptPickerLabel').textContent = selected.name || '选择 Prompt';
  $('promptPickerMenu').innerHTML = cfg.prompts.items.map(item => `
    <div class="prompt-picker-item ${item.id === selected.id ? 'selected' : ''} ${item.id === cfg.prompts.active_id ? 'active' : ''}"
      data-prompt-id="${escapeHtml(item.id)}"
      role="option"
      aria-selected="${item.id === selected.id ? 'true' : 'false'}"
      tabindex="0">
      <label class="prompt-picker-active" title="设为激活 Prompt">
        <input type="checkbox" data-prompt-active-id="${escapeHtml(item.id)}" ${item.id === cfg.prompts.active_id ? 'checked' : ''} aria-label="设为激活 Prompt：${escapeHtml(item.name)}" />
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
    <option value="${escapeHtml(item.id)}">${escapeHtml(item.name)}${item.id === cfg.prompts.active_id ? '（激活）' : ''}</option>
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
  toast('已设为当前激活 Prompt');
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
  toast('当前 Prompt 已保存到配置，点击保存配置后写入模板');
}

function saveNewPrompt() {
  collectObjectConfigFromForm();
  const name = window.prompt('请输入新 Prompt 名称');
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
  toast('新 Prompt 已保存并设为激活');
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
    ? '当前测试使用所选 Prompt 的任务设定，但为了避免本地模型上下文过长，模拟只发送当前维度的紧凑抽取指令。'
    : '';
  return [
    '你是严谨的科研论文信息抽取助手。请严格基于用户提供的论文片段，围绕指定科研对象和当前维度抽取结构化信息。',
    activePromptNote,
    '',
    '# 科研对象',
    `- profile_id: ${obj.profile_id || ''}`,
    `- 名称: ${obj.display_name || ''}`,
    `- 类型: ${obj.object_type || ''}`,
    `- 说明: ${obj.description || ''}`,
    concept.working_definition ? `- 工作定义: ${concept.working_definition}` : '',
    '',
    '# 当前测试维度',
    `- dimension_id: ${dim.dimension_id || ''}`,
    `- 名称: ${dim.name || dim.dimension_id || '未指定'}`,
    `- 抽取问题: ${dim.question || dim.description || ''}`,
    `输出类型：${dim.output_type || 'list'}`,
    `字段：${fields.join(', ') || '未指定'}`,
    '',
    '# 证据要求',
    '- 每个非 not_reported 的结果都尽量绑定 quote、section、page 或 chunk_id。',
    '- 区分 author_explicit 与 model_inferred。',
    '- 未报告的信息标记 not_reported=true，不要编造。',
    '',
    '# 输出格式',
    '请只输出合法 JSON，不要输出 Markdown，不要添加额外解释。输出结构如下：',
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
    '测试文本：',
    inputText,
  ].filter(Boolean).join('\n');
}

function insertRandomSimulationSample() {
  const index = Math.floor(Math.random() * SIMULATION_SAMPLE_TEXTS.length);
  $('simulationInput').value = SIMULATION_SAMPLE_TEXTS[index];
  $('simulationStatus').textContent = '已插入预置英文论文样例。';
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
    throw new Error('模型返回内容不是合法 JSON');
  }
}

function formatStructuredValue(value) {
  if (value === null || value === undefined || value === '') return '<span class="muted">未报告</span>';
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') return escapeHtml(value);
  if (Array.isArray(value)) {
    if (!value.length) return '<span class="muted">空列表</span>';
    return `<ul>${value.map(item => `<li>${formatStructuredValue(item)}</li>`).join('')}</ul>`;
  }
  return `<dl class="simulation-kv">${Object.entries(value).map(([key, val]) => `
    <div><dt>${escapeHtml(key)}</dt><dd>${formatStructuredValue(val)}</dd></div>
  `).join('')}</dl>`;
}

function renderEvidenceList(evidence) {
  const items = Array.isArray(evidence) ? evidence : [];
  if (!items.length) return '<p class="muted">未提供证据。</p>';
  return `<div class="simulation-evidence-list">${items.slice(0, 3).map(item => `
    <blockquote>
      ${escapeHtml(item.quote || item.text || '未提供 quote')}
      <cite>${escapeHtml([item.section, item.page ? `page ${item.page}` : '', item.chunk_id].filter(Boolean).join(' · ') || 'source not specified')}</cite>
    </blockquote>
  `).join('')}</div>`;
}

function renderSimulationStructuredResult(content) {
  state.simulationRawResult = content || '';
  $('simulationRawJsonBtn').hidden = !state.simulationRawResult;
  if (!content) {
    $('simulationResult').innerHTML = '模型没有返回内容。';
    return;
  }
  let data;
  try {
    data = parseSimulationJson(content);
  } catch (err) {
    $('simulationResult').innerHTML = `
      <div class="simulation-empty-state">
        <b>无法解析为结构化 JSON</b>
        <p>${escapeHtml(err.message)}。可以点击“原始 JSON”查看模型返回内容。</p>
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
        <span>科研对象</span>
        <b>${escapeHtml(data.research_object || data.object || '-')}</b>
      </div>
      <div>
        <span>是否存在</span>
        <b>${presence.exists === true ? '存在' : presence.exists === false ? '不存在' : '未判断'}</b>
      </div>
      <div>
        <span>角色</span>
        <b>${escapeHtml(presence.role_in_paper || '-')}</b>
      </div>
      <div>
        <span>置信度</span>
        <b>${escapeHtml(presence.confidence || '-')}</b>
      </div>
    </div>
    ${presence.judgement_reason ? `<section class="simulation-result-section"><h4>对象判定</h4><p>${escapeHtml(presence.judgement_reason)}</p>${renderEvidenceList(presence.evidence)}</section>` : ''}
    <section class="simulation-result-section">
      <h4>维度抽取</h4>
      <div class="simulation-dimension-list">
        ${dimensions.map(item => `
          <article class="simulation-dimension-item">
            <div class="simulation-dimension-head">
              <b>${escapeHtml(item.dimension_name || item.dimension_id || '未命名维度')}</b>
              <span>${item.not_reported ? '未报告' : escapeHtml(item.confidence || '已抽取')}</span>
            </div>
            <div class="simulation-answer">${formatStructuredValue(item.answer)}</div>
            ${item.notes ? `<p class="muted">${escapeHtml(item.notes)}</p>` : ''}
            ${renderEvidenceList(item.evidence)}
          </article>
        `).join('') || '<p class="muted">未返回维度抽取结果。</p>'}
      </div>
    </section>
    ${tags.length ? `<section class="simulation-result-section"><h4>自动标签</h4><div class="tag-list">${tags.map(tag => `<span class="term-tag">${escapeHtml(tag)}</span>`).join('')}</div></section>` : ''}
    ${data.summary_for_review ? `<section class="simulation-result-section"><h4>审查摘要</h4><p>${escapeHtml(data.summary_for_review)}</p></section>` : ''}
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
  if (!inputText) return toast('请先输入测试内容');
  const promptProfile = selectedSimulationPromptProfile(state.objectConfig);
  const promptContent = selectedSimulationPromptContent(state.objectConfig);
  if (!promptContent.trim()) return toast('请选择或填写 Prompt');
  if (!state.config) await loadConfig();
  const resultBox = $('simulationResult');
  const status = $('simulationStatus');
  const btn = $('runSimulationBtn');
  state.simulationRawResult = '';
  $('simulationRawJsonBtn').hidden = true;
  resultBox.innerHTML = '<div class="simulation-empty-state">测试中...</div>';
  status.textContent = `正在调用大模型：${promptProfile.name}`;
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
    status.textContent = `完成，用时 ${result.elapsed_seconds}s`;
  } catch (err) {
    state.simulationRawResult = err.message;
    $('simulationRawJsonBtn').hidden = false;
    resultBox.innerHTML = `<div class="simulation-empty-state"><b>测试失败</b><p>${escapeHtml(err.message)}</p></div>`;
    status.textContent = '测试失败';
    toast(err.message);
  } finally {
    btn.disabled = false;
  }
}

function renderObjectHealthCheck(cfg) {
  const checks = [
    {ok: Boolean(cfg.object_definition.profile_id), text: '对象模板 ID 已填写'},
    {ok: Boolean(cfg.object_definition.display_name), text: '显示名称已填写'},
    {ok: (cfg.dimensions || []).length > 0, text: '至少配置 1 个抽取维度'},
    {ok: (cfg.dimensions || []).every(d => d.dimension_id && d.name), text: '每个维度都有 ID 和名称'},
    {ok: (cfg.dimensions || []).some(d => (d.fields || []).length), text: '至少一个维度配置了输出字段'},
    {ok: cfg.evidence_rules.require_quote && cfg.evidence_rules.require_section, text: '证据规则包含原文和章节要求'},
  ];
  $('objectHealthCheck').innerHTML = checks.map(item => `
    <div class="health-item ${item.ok ? 'ok' : 'bad'}">${item.ok ? '通过' : '待补'} · ${escapeHtml(item.text)}</div>
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
    `${index + 1}. ${dim.name || dim.dimension_id}\n   - dimension_id: ${dim.dimension_id}\n   - 抽取问题: ${dim.question || dim.description || ''}`
  )).join('\n');
  return `你是一个严谨的科研文献知识抽取助手。你的任务是基于用户提供的论文内容，围绕指定研究对象进行结构化信息抽取。请严格依据论文原文，不要编造信息。

# 一、研究对象配置

## 研究对象
- 名称：${obj.display_name || ''}
- 类型：${obj.object_type || ''}
- 说明：${obj.description || ''}

## 工作定义
${concept.working_definition || ''}

## 相关术语
${(concept.include_terms || []).map(term => `- ${term}`).join('\n')}

## 排除规则
${(concept.exclude_rules || []).map(rule => `- ${rule}`).join('\n')}

# 二、抽取任务

请先判断论文中是否存在“${obj.display_name || '研究对象'}”这一研究对象。注意：
1. 如果相关内容只出现在 related work 中，且不是本文方法、实验对象或分析对象，不应判定为本文研究对象。
2. 如果论文没有使用配置中的显示名称，但使用了相关术语或功能等价机制，也可以判定为存在。
3. 如果只能根据上下文推断，请明确标记 model_inferred=true。
4. 如果论文未报告某一维度，请返回 not_reported，不要强行补全。

# 三、需要抽取的维度

${dimensions}

# 四、证据要求

- 每个非 not_reported 的抽取结果都必须绑定原文证据。
- 证据需要包含 quote、section、page 或 chunk_id。
- 必须区分作者明确表述 author_explicit 与模型推断 model_inferred。
- 论文未报告的信息必须标记为 not_reported=true。
- 不要把 abstract 中的宽泛 claim 直接当成实验证据。
- 不要把 related work 中其他论文的方法误认为本文方法。

# 五、输出格式

请只输出合法 JSON，不要输出 Markdown，不要添加额外解释。输出结构如下：

{
  "profile_id": "${obj.profile_id || ''}",
  "research_object": "${obj.display_name || ''}",
  "object_presence": {
    "exists": true,
    "role_in_paper": "core_contribution | method_component | auxiliary_component | evaluation_object | discussion_only | not_present",
    "local_terms": ["论文中使用的本地术语"],
    "judgement_reason": "为什么判断存在或不存在该对象",
    "confidence": "high | medium | low",
    "evidence": [{"quote": "原文证据片段", "section": "章节名称", "page": "页码或 null", "chunk_id": "chunk_id 或 null"}]
  },
  "dimension_extractions": [
    {
      "dimension_id": "dimension_id",
      "dimension_name": "维度名称",
      "answer": "string | object | list | not_reported",
      "not_reported": false,
      "author_explicit": true,
      "model_inferred": false,
      "confidence": "high | medium | low",
      "evidence": [{"quote": "原文证据片段", "section": "章节名称", "page": "页码或 null", "chunk_id": "chunk_id 或 null", "evidence_type": "definition | method_description | experiment_result | discussion | other"}],
      "notes": "必要时说明抽取依据、歧义或限制"
    }
  ],
  "auto_tags": ["系统可自动生成的检索标签"],
  "summary_for_review": "给人工审查者看的简短总结，说明主要发现、缺失项和需要重点核验的地方"
}`;
}

function validateObjectTemplateForPublish(template) {
  const issues = [];
  if (!template.id) issues.push('对象模板 ID');
  if (!template.name) issues.push('显示名称');
  if (!(template.dimensions || []).length) issues.push('至少 1 个抽取维度');
  if (!String(template.system_prompt || '').trim()) issues.push('激活 Prompt 内容');
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
    if (issues.length) throw new Error(`发布前请补全：${issues.join('、')}`);
  }
  const saved = await api('/api/templates', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify(template),
  });
  if (!options.silent) toast('对象建模配置已保存');
  await refreshAll();
  renderObjectConfigPanel();
  return saved;
}

async function publishObjectTemplate() {
  await saveResearchObjectConfig({silent: true, requirePublishReady: true, publish: true});
  toast('模板已发布，可在论文管理中发起抽取');
}

async function deleteCurrentObjectTemplate() {
  const select = $('objectTemplateSelect');
  const templateId = select?.value || '';
  const template = state.templates.find(item => item.id === templateId);
  if (!template) return toast('请先选择一个已保存对象');
  const confirmed = confirm(`确定删除“${template.name}”吗？这会从研究对象库移除该对象模板，不会删除已经产生的抽取结果。`);
  if (!confirmed) return;
  await api(`/api/templates/${encodeURIComponent(template.id)}`, {method: 'DELETE'});
  state.objectConfig = defaultResearchObjectConfig(null);
  state.objectDimensionIndex = 0;
  state.objectPromptDirty = false;
  state.selectedPromptProfileId = null;
  state.selectedSimulationPromptId = null;
  resetObjectAdvisorSuggestions();
  toast(`已删除对象：${template.name}`);
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
    status.textContent = `JSON 解析失败：${err.message}`;
    return;
  }
  btn.disabled = true;
  status.className = 'test-result muted';
  status.textContent = '正在导入并保存...';
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
    status.textContent = `已导入并保存：${template.name}`;
    toast('导入配置已保存，并生成激活 Prompt');
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
    <input class="arxivInput" placeholder="例如 2401.12345 或 https://arxiv.org/abs/..." value="${escapeHtml(value)}" />
    <button type="button" aria-label="移除此 arXiv 输入">-</button>
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
    '连接数据源...',
    '下载论文文件...',
    '解析 PDF 正文...',
    '识别章节、图表和参考文献...',
    '写入论文库...'
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

function finishImportProgress(timer, message = '导入完成') {
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
  $('importProgressPercent').textContent = '失败';
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
    status: '解析中',
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
  if (op) return {label: `${op.status || '解析中'} ${Math.round(op.percent || 0)}%`, className: 'pending', parser: p.metadata?.extra?.parser, op};
  const parser = p.metadata?.extra?.parser;
  if (p.metadata?.extra?.review_status === 'verified') return {label: '已校验', className: 'verified', parser};
  if ((p.chunks || []).length) return {label: '待校验', className: 'needs_revision', parser};
  if (p.full_text) return {label: '有正文', className: 'pending', parser};
  return {label: '仅元数据', className: 'needs_revision', parser};
}

function updatePaperOp(paperId, patch) {
  state.paperOps[paperId] = {...(state.paperOps[paperId] || {}), ...patch};
  renderPapers();
}

function removePaperOp(paperId) {
  delete state.paperOps[paperId];
  renderPapers();
}

function startPaperOpProgress(paperId, initialLabel = '解析中') {
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
    updatePaperJob(jobId, {percent: 100, status: '解析完成'});
    finishImportProgress(timer);
    toast('导入完成');
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
  const jobId = addPaperJob(`批量 arXiv 导入（${total} 篇）`, 'arxiv');
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
      const label = `第 ${index + 1}/${total} 篇：正在导入 ${value}`;
      setImportProgressValue(current, label);
      updatePaperJob(jobId, {percent: current, status: `第 ${index + 1}/${total} 篇解析中`});
      const timer = setInterval(() => {
        current = Math.min(cap, current + Math.max(1, Math.round((cap - current) * 0.18)));
        setImportProgressValue(current, label);
        updatePaperJob(jobId, {percent: current, status: `第 ${index + 1}/${total} 篇解析中`});
      }, 850);
      try {
        const paper = await api('/api/papers/import/arxiv', {method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({arxiv_id_or_url: value})});
        importedPapers.push(paper);
      } finally {
        clearInterval(timer);
      }
      const completed = Math.floor(((index + 1) / total) * 100);
      const completedLabel = `已完成 ${index + 1}/${total} 篇`;
      setImportProgressValue(completed, completedLabel);
      updatePaperJob(jobId, {percent: completed, status: completedLabel});
    }
    rememberRecentImports(importedPapers.map(paper => paper.id));
    $('importProgress').classList.add('done');
    toast(`批量导入完成：${total} 篇`);
    state.paperPage = 1;
    await refreshAll();
    setTimeout(() => { $('importProgress').hidden = true; }, 900);
  } catch (err) {
    if (importedPapers.length) rememberRecentImports(importedPapers.map(paper => paper.id));
    $('importProgress').classList.add('error');
    $('importProgressLabel').textContent = err.message;
    $('importProgressPercent').textContent = '失败';
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
  $('recentImportCount').textContent = papers.length ? `${papers.length} 篇` : '暂无记录';
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
  }).join('') || '<p class="muted">完成导入后会在这里显示最近 5 篇论文。</p>';
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

function renderPaperCollectionBadges(paperId) {
  return paperCollectionNames(paperId).map(name => `
    <span class="badge paper-set-badge" title="${escapeHtml(name)}">${escapeHtml(name)}</span>
  `).join('');
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
  const latestRun = runs[0] || null;
  return {
    runCount: runs.length,
    objectCount: templateIds.size,
    itemCount,
    reviewedItemCount: reviewedItems.length,
    latestRun,
    latestRunDurationSeconds: extractionRunDurationSeconds(latestRun),
  };
}

function extractionStatusForPaper(paperId) {
  const stats = extractionStatsForPaper(paperId);
  if (!stats.runCount || !stats.itemCount) return {label: '待抽取', className: 'extraction_todo'};
  if (stats.reviewedItemCount >= stats.itemCount) return {label: '已审查', className: 'extraction_reviewed'};
  return {label: '待审查', className: 'extraction_pending_review'};
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
    const failed = /失败/.test(op.status || '');
    const completed = percent >= 100 && /完成/.test(op.status || '');
    return {
      label: op.status || '解析中',
      detail: '正在更新文件解析结果',
      percent,
      className: failed ? 'failed' : (completed ? 'completed' : 'running'),
    };
  }
  const job = paperActiveExtractionJob(paper.id);
  if (!job) return null;
  const label = {
    queued: '抽取排队中',
    running: '抽取中',
    completed: '抽取完成',
    failed: '抽取失败',
  }[job.status] || '抽取中';
  return {
    label,
    detail: job.message || '正在更新内容抽取结果',
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
        <span>${escapeHtml(task.label || '处理中')}</span>
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
          <span class="badge pending">解析中 ${percent}%</span>
        </div>
        <div class="meta">${escapeHtml(sourceLabel(job.source))} · ${escapeHtml(job.status || '解析中')} · 开始于 ${escapeHtml(job.startedAt)}</div>
        <div class="paper-row-progress">
          <div class="paper-row-progress-bar" style="width: ${percent}%"></div>
        </div>
      </div>
      <div class="paper-actions">
        <button disabled>查看详情</button>
        <button disabled>导出 JSON</button>
        <button disabled>删除</button>
      </div>
      <div class="paper-stats">
        ${listStat('Status', '解析中')}
        ${listStat('Progress', `${percent}%`)}
      </div>
    </div>
  `;
}

function renderPaperRow(p, selectable = false) {
  const status = paperStatus(p);
  const extractionStats = extractionStatsForPaper(p.id);
  const extractionStatus = extractionStatusForPaper(p.id);
  const parser = status.parser ? ` · parser ${status.parser}` : '';
  const checked = state.selectedPaperIds.includes(p.id);
  const taskProgress = renderPaperTaskProgress(paperTaskProgress(p));
  const collectionBadges = renderPaperCollectionBadges(p.id);
  return `
    <div class="paper-row ${selectable ? 'selectable' : ''} ${p.id === state.selectedPaperId ? 'active' : ''}" data-paper-id="${escapeHtml(p.id)}">
      ${selectable ? `
        <label class="paper-row-check" title="选择论文">
          <input type="checkbox" class="paperBatchCheck" value="${escapeHtml(p.id)}" ${checked ? 'checked' : ''} onchange="togglePaperSelection('${escapeHtml(p.id)}', this.checked)" />
        </label>
      ` : ''}
      <div class="paper-row-main">
        <div class="paper-title-line">
          <h3 class="paper-title" title="${escapeHtml(p.metadata.title)}">${escapeHtml(p.metadata.title)}</h3>
          <span class="badge ${status.className}">${status.label}</span>
          <span class="badge ${extractionStatus.className}">${extractionStatus.label}</span>
          ${collectionBadges}
        </div>
        <div class="paper-authors-line">${escapeHtml((p.metadata.authors || []).slice(0, 4).join(', ') || '作者未知')} ${p.metadata.year || ''}</div>
        <div class="paper-meta-line"><span>来源：</span><b>${escapeHtml(sourceLabel(p.source))}${escapeHtml(parser)}</b></div>
        <div class="paper-meta-line">
          <span>发表：</span><b>${escapeHtml(paperPublishedDate(p))}</b>
        </div>
        ${taskProgress}
      </div>
      <div class="paper-actions">
        <button onclick="openPaperDetail('${escapeHtml(p.id)}')">查看详情</button>
        <button ${extractionStats.latestRun ? '' : 'disabled'} onclick="openLatestExtractionResult('${escapeHtml(p.id)}')">查看抽取结果</button>
        <button onclick="exportPaper('${escapeHtml(p.id)}')">导出 JSON</button>
        <button onclick="deletePaper('${escapeHtml(p.id)}')">删除</button>
      </div>
      <div class="paper-stats compact">
        <section class="paper-stat-group">
          <b>文件解析</b>
          <div>
            <span>章节 ${p.sections.length}</span>
            <span>Chunks ${p.chunks.length}</span>
            <span>图表 ${p.figures.length}</span>
          </div>
        </section>
        <section class="paper-stat-group">
          <b>内容抽取</b>
          <div>
            <span>对象 ${extractionStats.objectCount}</span>
            <span>结果 ${extractionStats.itemCount}</span>
            <span>已审 ${extractionStats.reviewedItemCount}</span>
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
  $('paperLibrarySubtitle').textContent = `共 ${total} 篇论文，${setCount} 个集合，${verified} 篇已审核`;
  $('paperCount').textContent = state.paperLibraryTab === 'all'
    ? `当前 ${filteredCount} 篇`
    : `${setCount} 个集合`;
  $('createPaperSetBtn').hidden = state.paperLibraryTab !== 'sets';
}

function renderPaperLibraryControls() {
  const body = $('paperLibraryControlsBody');
  const toggle = $('paperLibraryControlsToggle');
  const icon = $('paperLibraryControlsToggleIcon');
  const open = state.paperLibraryControlsOpen;
  if (body) body.hidden = !open;
  if (toggle) {
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    toggle.title = open ? '收起筛选与批量操作' : '展开筛选与批量操作';
  }
  if (icon) icon.textContent = open ? '⌃' : '⌄';
}

window.togglePaperLibraryControls = function() {
  state.paperLibraryControlsOpen = !state.paperLibraryControlsOpen;
  renderPaperLibraryControls();
};

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
    {value: 'all', label: '全部年份'},
    ...years.map(year => ({value: year, label: year})),
  ], state.paperFilters.year);
  state.paperFilters.paperSet = applySelectOptions($('paperCollectionFilter'), [
    {value: 'all', label: '全部集合'},
    {value: 'none', label: '未加入集合'},
    ...validCustomPaperSets().map(item => ({value: item.id, label: item.name})),
  ], state.paperFilters.paperSet);
  state.paperFilters.parseStatus = applySelectOptions($('paperParseStatusFilter'), [
    {value: 'all', label: '全部解析状态'},
    {value: 'verified', label: '已校验'},
    {value: 'needs_revision', label: '待校验'},
    {value: 'parsed', label: '有正文'},
    {value: 'metadata_only', label: '仅元数据'},
    {value: 'pending', label: '解析中'},
  ], state.paperFilters.parseStatus);
  state.paperFilters.extractionStatus = applySelectOptions($('paperExtractionStatusFilter'), [
    {value: 'all', label: '全部抽取状态'},
    {value: 'extracted', label: '已抽取'},
    {value: 'not_extracted', label: '未抽取'},
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
            <p>${escapeHtml(item.detail || '暂无详情。')}</p>
          </div>
        </div>
        <div class="paper-set-meta-grid">
          ${listStat('论文数', papers.length)}
          ${listStat('已审核', verifiedPaperCount(papers))}
        </div>
        <div class="paper-set-updated"><span>更新时间</span><b>${escapeHtml(fmtTime(item.updated_at || item.created_at))}</b></div>
        <div class="paper-set-card-actions">
          <button type="button" onclick="viewPaperSetPapers('${escapeHtml(item.id)}')">详情</button>
          <button type="button" onclick="deletePaperSet('${escapeHtml(item.id)}')">删除</button>
        </div>
      </article>
    `;
  }).join('') || '<p class="muted">暂无论文集。</p>';
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
  select.title = select.selectedOptions[0]?.textContent || '暂无论文集';
}

function updateLibraryBatchTemplateTitle() {
  const select = $('libraryBatchTemplateSelect');
  if (!select) return;
  select.title = select.selectedOptions[0]?.textContent || '暂无模板';
}

function renderPaperSetBatchActions(papers) {
  const collectionActions = $('paperSetBatchActions');
  const processingActions = $('paperParseExtractActions');
  if (!collectionActions || !processingActions) return;
  const selected = selectedPaperIdsInPapers(papers);
  const busy = state.libraryBatchExtractionBusy;
  collectionActions.hidden = false;
  processingActions.hidden = false;
  $('paperSelectionCount').textContent = selected.length ? `已选 ${selected.length} 篇` : '未选择';
  $('selectAllPaperSetPapersBtn').textContent = selected.length && selected.length === papers.length ? '取消全选' : '全选';
  $('selectAllPaperSetPapersBtn').disabled = !papers.length || busy;
  const paperSets = validCustomPaperSets();
  const moveSelect = $('batchMovePaperSetSelect');
  const moveValue = moveSelect?.value || '';
  applySelectOptions(moveSelect, paperSets.length
    ? paperSets.map(item => ({value: item.id, label: item.name}))
    : [{value: '', label: '暂无论文集'}], moveValue);
  moveSelect.disabled = !paperSets.length || !selected.length || busy;
  $('batchMovePapersBtn').disabled = !paperSets.length || !selected.length || busy;
  const templateSelect = $('libraryBatchTemplateSelect');
  const templateValue = templateSelect?.value || '';
  const readyTemplates = extractionReadyTemplates();
  applySelectOptions(templateSelect, readyTemplates.length
    ? readyTemplates.map(item => ({value: item.id, label: `${item.name} (${item.version})`}))
    : [{value: '', label: '暂无已发布模板'}], templateValue);
  templateSelect.disabled = !readyTemplates.length || !selected.length || busy;
  $('batchRunExtractionBtn').disabled = !readyTemplates.length || !selected.length || busy;
  $('batchRunExtractionBtn').textContent = busy ? '抽取中' : '发起抽取';
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
    || '<p class="muted">暂无符合条件的论文。</p>';

  $('paperPagination').innerHTML = total > PAPER_PAGE_SIZE ? `
    <button ${state.paperPage === 1 ? 'disabled' : ''} onclick="goPaperPage(${state.paperPage - 1})">上一页</button>
    <span class="meta">第 ${state.paperPage} / ${pageCount} 页</span>
    <button ${state.paperPage === pageCount ? 'disabled' : ''} onclick="goPaperPage(${state.paperPage + 1})">下一页</button>
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
    toggle.textContent = state.paperImportCollapsed ? '›' : '‹';
    toggle.title = state.paperImportCollapsed ? '展开导入面板' : '收起导入面板';
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
  renderPaperLibraryControls();

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
  if (!target) return toast('请选择目标论文集');
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
  toast(`已移动 ${ids.length} 篇论文`);
  await refreshAll();
}

async function runLibraryBatchExtraction() {
  const ids = uniqueIds(state.selectedPaperIds);
  const templateId = $('libraryBatchTemplateSelect').value;
  const template = extractionReadyTemplates().find(item => item.id === templateId);
  if (!ids.length) return toast('请先选择论文');
  if (!template) return toast('请选择已发布抽取模板');
  const dims = (template.dimensions || []).map(dim => dim.name || dim.dimension_id || dim.label).filter(Boolean);
  if (!dims.length) return toast('当前模板没有可用维度');
  state.libraryBatchExtractionBusy = true;
  const startedAt = new Date().toISOString();
  ids.forEach((paperId, index) => {
    updateExtractionJob(jobKey(paperId, templateId), {
      status: 'queued',
      percent: Math.max(4, Math.round((index / Math.max(ids.length, 1)) * 10)),
      message: `等待抽取 ${index + 1}/${ids.length} · ${template.name}`,
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
      const timer = startExtractionJobProgress(key, `正在抽取 ${index + 1}/${ids.length} · ${template.name}`);
      try {
        const run = await api('/api/extractions/run', {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({paper_id: paperId, template_id: templateId, dimension_names: dims}),
        });
        state.runs = [run, ...state.runs.filter(item => item.id !== run.id)];
        updateExtractionJob(key, {status: 'completed', percent: 100, message: `${run.items.length} 条结果，${run.errors.length} 个错误`, run});
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
  toast(`批量抽取完成：${completed}/${ids.length} 篇成功`);
  await refreshAll();
}

async function deleteSelectedPapers() {
  const ids = uniqueIds(state.selectedPaperIds);
  if (!ids.length) return;
  if (!confirm(`确定删除选中的 ${ids.length} 篇论文吗？相关抽取记录和素材也会删除。`)) return;
  for (const id of ids) {
    await api(`/api/papers/${id}`, {method: 'DELETE'});
    removePaperOp(id);
    if (state.selectedPaperId === id) {
      state.selectedPaperId = null;
      closePaperDetail();
    }
  }
  state.selectedPaperIds = [];
  toast(`已删除 ${ids.length} 篇论文`);
  await refreshAll();
}

async function reparseSelectedPapers() {
  const ids = uniqueIds(state.selectedPaperIds);
  if (!ids.length) return;
  let success = 0;
  const failures = [];
  toast(`开始重新解析 ${ids.length} 篇论文`);
  for (const id of ids) {
    const timer = startPaperOpProgress(id, '重新解析中');
    try {
      const paper = await api(`/api/papers/${id}/reparse`, {method: 'POST'});
      upsertPaperInState(paper);
      updatePaperOp(id, {percent: 100, status: '解析完成'});
      success += 1;
    } catch (err) {
      failures.push(err.message);
      updatePaperOp(id, {percent: 100, status: '解析失败'});
    } finally {
      clearInterval(timer);
      setTimeout(() => removePaperOp(id), 700);
    }
  }
  state.selectedPaperIds = [];
  await refreshAll();
  toast(failures.length ? `重新解析完成：${success} 篇成功，${failures.length} 篇失败` : `重新解析完成：${success} 篇成功`);
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
  toast(`已导出 ${papers.length} 篇论文和 ${extractionRuns.length} 条抽取结果`);
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
  if (!name) return toast('请先填写论文集名称');
  await createPaperSetRecord(name, detail, []);
  state.paperSetCreateOpen = false;
  setValue('paperSetNameInput', '');
  setValue('paperSetDetailInput', '');
  toast('论文集已创建');
  renderPapers();
}

window.deletePaperSet = async function(id) {
  const paperSet = (state.paperSets || []).find(item => item.id === id);
  if (!paperSet) return;
  if (!confirm(`确定删除论文集「${paperSet.name}」吗？论文文件不会被删除。`)) return;
  await api(`/api/paper-sets/${id}`, {method: 'DELETE'});
  state.paperSets = state.paperSets.filter(item => item.id !== id);
  if (state.paperFilters.paperSet === id) state.paperFilters.paperSet = 'all';
  renderPapers();
  toast('论文集已删除');
};

function renderPaperDetail(p) {
  const meta = p.metadata || {};
  const authors = meta.authors || [];
  const extra = meta.extra || {};
  const published = paperPublishedDate(p);
  const extractionStats = extractionStatsForPaper(p.id);
  const links = [
    linkButton(meta.url, meta.arxiv_id ? 'arXiv 页面' : '来源页面'),
    linkButton(meta.pdf_url, 'PDF'),
    p.file_path ? linkButton(`/api/papers/${p.id}/file`, '本地文件') : ''
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
        <p class="paper-authors">${authors.length ? escapeHtml(authors.join(', ')) : '作者未知'}</p>
        ${links ? `<div class="paper-links">${links}</div>` : ''}
      </header>

      <section class="paper-abstract">
        <h4>Abstract</h4>
        <p>${escapeHtml(meta.abstract || '暂无摘要。')}</p>
      </section>

      <div class="paper-info-grid">
        <section class="paper-info-card">
          <h4>论文信息</h4>
          <dl>
            ${metaRow('Paper ID', escapeHtml(p.id))}
            ${metaRow('DOI', escapeHtml(meta.doi || ''))}
            ${metaRow('Venue', escapeHtml(meta.venue || ''))}
            ${metaRow('Published', escapeHtml(published))}
            ${metaRow('Parser', escapeHtml(extra.parser || ''))}
            ${metaRow('MinerU', extra.mineru_error ? escapeHtml(fmt(extra.mineru_error, 220)) : '')}
            ${metaRow('解析耗时', escapeHtml(fmtDuration(extra.parse_duration_seconds)))}
            ${metaRow('抽取耗时', escapeHtml(fmtDuration(extractionStats.latestRunDurationSeconds)))}
            ${metaRow('Created', escapeHtml((p.created_at || '').slice(0, 19).replace('T', ' ')))}
          </dl>
        </section>

        <section class="paper-info-card">
          <h4>解析概览</h4>
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
          <span class="meta">完整展示 ${sections.length} 个章节</span>
        </div>
        <div class="section-list">
          ${sections.map((s, index) => `
            <details class="section-entry" ${index < 2 ? 'open' : ''}>
              <summary>
                <span>${escapeHtml(s.title || 'Untitled section')}</span>
                <small>page ${s.start_page || '?'}-${s.end_page || '?'}</small>
              </summary>
              <p>${escapeHtml(s.text || '暂无章节文本。')}</p>
            </details>
          `).join('') || '<p class="muted">未识别到章节。</p>'}
        </div>
      </section>

      <section class="paper-content-block">
        <div class="section-heading">
          <h4>Figures & Tables</h4>
          <span class="meta">展示前 ${Math.min(figures.length, 20)} / ${figures.length}</span>
        </div>
        <div class="evidence-list">
          ${figures.slice(0, 20).map(f => `
            <div class="evidence">
              ${f.image_path ? `<img class="evidence-image" src="/api/papers/${p.id}/figures/${f.id}/image" alt="${escapeHtml(f.label || 'Figure/Table')}" loading="lazy" />` : ''}
              <b>${escapeHtml(f.label || 'Figure/Table')}</b>${f.page ? ` · page ${f.page}` : ''}<br>
              ${escapeHtml(fmt(f.caption, 1600) || '暂无标题。')}
            </div>
          `).join('') || '<p class="muted">未识别到图表标题。</p>'}
        </div>
      </section>

      <section class="paper-content-block">
        <div class="section-heading">
          <h4>References</h4>
          <span class="meta">展示前 ${Math.min(references.length, 30)} / ${references.length}</span>
        </div>
        <ol class="reference-list">
          ${references.slice(0, 30).map(r => `<li>${escapeHtml(fmt(r.raw, 600))}</li>`).join('') || '<li class="muted">未识别到参考文献。</li>'}
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
  $('paperModalTitle').textContent = p.metadata?.title || '论文解析详情';
  $('paperModalMeta').textContent = `来源：${sourceLabel(p.source)} · 导入：${fmtTime(p.created_at)} · 解析：${fmtTime(p.updated_at)} · 解析耗时：${fmtDuration(p.metadata?.extra?.parse_duration_seconds)}`;
  $('paperReparseBtn').disabled = Boolean(state.paperOps[p.id]);
  $('paperReparseBtn').textContent = state.paperOps[p.id] ? '重新解析中' : '重新解析';
  $('paperReparseBtn').onclick = () => reparsePaper(p.id);
  $('paperVerifyBtn').disabled = p.metadata?.extra?.review_status === 'verified';
  $('paperVerifyBtn').textContent = p.metadata?.extra?.review_status === 'verified' ? '已校验' : '校验通过';
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
  const timer = startPaperOpProgress(id, '重新解析中');
  if (state.selectedPaperId === id && !$('paperDetailModal').hidden) {
    $('paperReparseBtn').disabled = true;
    $('paperReparseBtn').textContent = '重新解析中';
  }
  toast('正在重新解析论文...');
  try {
    const paper = await api(`/api/papers/${id}/reparse`, {method: 'POST'});
    upsertPaperInState(paper);
    updatePaperOp(id, {percent: 100, status: '解析完成'});
    toast('重新解析完成');
    await refreshAll();
    if (state.selectedPaperId === id && !$('paperDetailModal').hidden) {
      openPaperDetail(id);
    }
  } catch (err) {
    updatePaperOp(id, {percent: 100, status: '解析失败'});
    toast(err.message);
  } finally {
    clearInterval(timer);
    setTimeout(() => removePaperOp(id), 900);
    if (state.selectedPaperId === id && !$('paperDetailModal').hidden) {
      $('paperReparseBtn').disabled = false;
      $('paperReparseBtn').textContent = '重新解析';
    }
  }
};

window.verifyPaper = async function(id) {
  const paper = await api(`/api/papers/${id}/verify`, {method: 'POST'});
  upsertPaperInState(paper);
  toast('论文已标记为已校验');
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
  if (!confirm(`确定删除《${p.metadata?.title || id}》吗？相关抽取记录和素材也会删除。`)) return;
  await api(`/api/papers/${id}`, {method: 'DELETE'});
  removePaperOp(id);
  if (state.selectedPaperId === id) {
    state.selectedPaperId = null;
    closePaperDetail();
  }
  toast('论文已删除');
  await refreshAll();
};

function renderExtractionPanel() {
  const verified = verifiedPapers();
  const selectedTemplateId = $('templateSelect')?.value;
  const verifiedIds = new Set(verified.map(p => p.id));
  state.confirmedExtractPaperIds = state.confirmedExtractPaperIds.filter(id => verifiedIds.has(id));
  state.extractDraftPaperIds = state.extractDraftPaperIds.filter(id => verifiedIds.has(id));
  if (!state.confirmedExtractPaperIds.length) state.extractSelectionMode = 'selecting';
  $('verifiedPaperCount').textContent = verified.length ? `${verified.length} 篇已校验` : '暂无已校验论文';
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
  $('extractPaperSelectionLabel').textContent = isSelecting ? '选择已校验论文' : '已选论文';
  $('confirmExtractPapersBtn').disabled = !isSelecting || !verified.length;
  $('addExtractPapersBtn').disabled = isSelecting || !verified.length;
  $('selectAllVerifiedPapersBtn').hidden = !isSelecting;
  $('clearSelectedPapersBtn').hidden = !isSelecting;
  if (!verified.length) {
    $('extractPaperChecks').innerHTML = '<p class="muted">暂无已校验论文。请先在“论文管理”中打开论文详情并点击“校验通过”。</p>';
    return;
  }
  if (!isSelecting) {
    const selectedPapers = state.confirmedExtractPaperIds.map(id => state.papers.find(p => p.id === id)).filter(Boolean);
    $('extractPaperChecks').innerHTML = selectedPapers.map(p => {
      const latest = latestRunForPaper(p.id, $('templateSelect').value);
      return `<div class="selected-extract-paper">
        <div>
          <b>${escapeHtml(fmt(p.metadata?.title || p.id, 92))}</b>
          <span class="muted">${latest ? `最近抽取 ${fmtTime(latest.created_at)}` : '未抽取'}</span>
        </div>
        <button type="button" class="selected-extract-remove" aria-label="删除已选论文" onclick="removeConfirmedExtractPaper('${escapeHtml(p.id)}')">×</button>
      </div>`;
    }).join('') || '<p class="muted">暂无已确认论文。点击“新增”选择论文后再确定。</p>';
    return;
  }
  $('extractPaperChecks').innerHTML = verified.map(p => {
    const latest = latestRunForPaper(p.id, $('templateSelect').value);
    return `<label>
      <input type="checkbox" class="extractPaperCheck" value="${escapeHtml(p.id)}" ${draft.has(p.id) || confirmed.has(p.id) ? 'checked' : ''} />
      <span>${escapeHtml(fmt(p.metadata?.title || p.id, 92))}</span>
      <span class="muted">${latest ? `最近抽取 ${fmtTime(latest.created_at)}` : '未抽取'}</span>
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
    $('templateSummary').textContent = '暂无已发布抽取模板。请先在“对象建模工作台”中发布模板。';
    return;
  }
  $('templateSummary').innerHTML = `
    <b>${escapeHtml(t.name)}</b>
    <span>${escapeHtml(t.description || '无说明')}</span>
    <span>${(t.dimensions || []).length} 个维度 · 激活 Prompt：${escapeHtml(t.active_prompt_id || '默认')}</span>
  `;
}

function renderDimensionChecks() {
  const readyTemplates = extractionReadyTemplates();
  const t = readyTemplates.find(x => x.id === $('templateSelect').value) || readyTemplates[0];
  $('dimensionChecks').innerHTML = t ? t.dimensions.map(d => `
    <label><input type="checkbox" class="dimCheck" value="${d.name}" checked /> ${escapeHtml(d.label)} <span class="muted">${escapeHtml(d.name)}</span></label>
  `).join('') : '<p class="muted">暂无模板。</p>';
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

function startExtractionJobProgress(key, message = '抽取中') {
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
  $('selectedExtractionCount').textContent = ids.length ? `${ids.length} 篇待处理` : (isSelecting ? '待确认论文' : '请选择论文');
  const papers = ids.map(id => state.papers.find(p => p.id === id)).filter(Boolean);
  $('extractionPaperRuns').innerHTML = papers.map(p => {
    const job = state.extractionJobs[jobKey(p.id, templateId)];
    const run = job?.run || latestRunForPaper(p.id, templateId);
    const status = job?.status || (run ? 'completed' : 'idle');
    const statusText = {
      queued: '等待抽取',
      running: '抽取中',
      completed: '已完成',
      failed: '失败',
      idle: '未抽取',
    }[status] || status;
    const progress = extractionJobProgress(job || {status});
    return `<article class="extraction-paper-card ${escapeHtml(status)}">
      <div class="extraction-paper-main">
        <h3>${escapeHtml(p.metadata?.title || p.id)}</h3>
        <div class="meta">已校验 · ${escapeHtml(sourceLabel(p.source))} · ${run ? `最近运行 ${fmtTime(run.created_at)}` : '暂无运行记录'}</div>
        <div class="extraction-progress-track">
          <div class="extraction-progress-bar" style="width:${progress}%"></div>
        </div>
        <div class="meta">${escapeHtml(statusText)}${job?.message ? ` · ${escapeHtml(job.message)}` : ''}</div>
        ${run?.errors?.length ? `<pre>${escapeHtml(run.errors.slice(0, 3).join('\n'))}</pre>` : ''}
      </div>
      <div class="extraction-paper-actions">
        <button type="button" ${run ? '' : 'disabled'} onclick="openExtractionResult('${escapeHtml(run?.id || '')}')">查看结果</button>
        <button type="button" ${run ? '' : 'disabled'} onclick="selectRunForReview('${escapeHtml(run?.id || '')}')">人机审查</button>
        <button type="button" ${run ? '' : 'disabled'} onclick="window.open('/api/export/run/${escapeHtml(run?.id || '')}', '_blank')">导出</button>
      </div>
    </article>`;
  }).join('') || `<p class="muted">${isSelecting ? '请在左侧勾选论文并点击“确定”。' : '请从左侧选择一篇或多篇已校验论文。'}</p>`;
}

function renderRunList() {
  $('runList').innerHTML = state.runs.map(r => {
    const p = state.papers.find(x => x.id === r.paper_id);
    const t = state.templates.find(x => x.id === r.template_id);
    return `<div class="item">
      <h3>${escapeHtml(p?.metadata.title || r.paper_id)}</h3>
      <div class="meta">${escapeHtml(t?.name || r.template_id)} · run ${r.id} · ${r.status} · items ${r.items.length} · errors ${r.errors.length}</div>
      ${r.errors.length ? `<pre>${escapeHtml(r.errors.join('\n'))}</pre>` : ''}
      <button onclick="openExtractionResult('${r.id}')">查看结果</button>
      <button onclick="selectRunForReview('${r.id}')">审查此结果</button>
      <button onclick="window.open('/api/export/run/${r.id}', '_blank')">导出 JSON</button>
    </div>`;
  }).join('') || '<p class="muted">暂无抽取记录。</p>';
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
  if (!$('extractionResultModal').hidden) closeExtractionResultModal();
  document.querySelector('[data-tab="review"]').click();
  renderReviewPanel();
};

window.openLatestExtractionResult = function(paperId) {
  const run = paperRuns(paperId)[0];
  if (!run) return toast('这篇论文暂无抽取结果');
  openExtractionResult(run.id);
};

window.openExtractionResult = function(id) {
  const run = state.runs.find(r => r.id === id);
  if (!run) return toast('未找到抽取结果');
  state.selectedExtractionRunId = id;
  const paper = state.papers.find(p => p.id === run.paper_id);
  const template = state.templates.find(t => t.id === run.template_id);
  $('extractionResultTitle').textContent = paper?.metadata?.title || run.paper_id;
  $('extractionResultMeta').textContent = `${template?.name || run.template_id} · ${run.status} · ${run.items.length} 条结果 · ${run.errors.length} 个错误 · ${fmtTime(run.created_at)}`;
  $('extractionResultBody').innerHTML = `
    ${run.errors.length ? `<section class="extraction-result-errors"><h3>错误</h3><pre>${escapeHtml(run.errors.join('\n'))}</pre></section>` : ''}
    <section class="extraction-result-grid">
      ${run.items.map(item => `
        <article class="extraction-result-item">
          <header>
            <h3>${escapeHtml(item.dimension_label || item.dimension_name)} <span class="badge ${item.review_status}">${escapeHtml(reviewStatusLabel(item.review_status))}</span></h3>
            <div class="meta">${escapeHtml(item.dimension_name)} · 置信度 ${Number(item.confidence || 0).toFixed(2)}</div>
          </header>
          <h4>${escapeHtml(item.edited_title || item.title || '未命名结果')}</h4>
          <p>${escapeHtml(item.edited_content || item.content || '无内容')}</p>
          ${(item.evidence || []).slice(0, 3).map(ev => `<div class="evidence"><b>${escapeHtml(ev.section_title || 'Unknown')}</b> · page ${ev.page_start || '?'}-${ev.page_end || '?'}<br/>${escapeHtml(ev.quote)}</div>`).join('') || '<p class="muted">无证据绑定。</p>'}
        </article>
      `).join('') || '<p class="muted">暂无抽取条目。</p>'}
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
  if (!paperIds.length) return toast('请先选择论文并点击“确定”');
  if (!templateId) return toast('请选择抽取模板');
  if (!dims.length) return toast('请至少选择一个抽取维度');
  $('runExtractionBtn').disabled = true;
  paperIds.forEach(id => {
    updateExtractionJob(jobKey(id, templateId), {status: 'queued', percent: 8, message: '等待开始'}, false);
  });
  renderExtractionProgressViews();
  let completed = 0;
  for (const paperId of paperIds) {
    const key = jobKey(paperId, templateId);
    const timer = startExtractionJobProgress(key, '正在调用大模型');
    try {
      const run = await api('/api/extractions/run', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({paper_id: paperId, template_id: templateId, dimension_names: dims}),
      });
      state.runs = [run, ...state.runs.filter(item => item.id !== run.id)];
      updateExtractionJob(key, {status: 'completed', percent: 100, message: `${run.items.length} 条结果，${run.errors.length} 个错误`, run}, false);
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
  toast(`抽取任务完成：${completed}/${paperIds.length} 篇成功`);
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
  {value: 'confirm', label: '确认正确', hint: '抽取结果正确，可入库', tone: 'accept'},
  {value: 'revise', label: '修改后接受', hint: '结果部分正确，人工修改后入库', tone: 'accept'},
  {value: 'reject', label: '驳回', hint: '结果错误，不入库', tone: 'reject'},
  {value: 'mark_not_reported', label: '应为未报告', hint: '论文没有报告该信息，模型不应生成', tone: 'warn'},
  {value: 'mark_evidence_insufficient', label: '证据不足', hint: '答案可能对，但证据不够', tone: 'warn'},
  {value: 'mark_over_inferred', label: '过度推断', hint: '模型推断过多', tone: 'warn'},
  {value: 'mark_wrong_dimension', label: '维度归类错误', hint: '抽到了信息，但放错维度', tone: 'warn'},
  {value: 'mark_wrong_object', label: '对象判断错误', hint: '根本不属于当前研究对象', tone: 'reject'},
];

const REVIEW_ERROR_TAGS = [
  {value: 'answer_too_generic', label: '答案过泛'},
  {value: 'answer_too_verbose', label: '答案太长'},
  {value: 'missing_key_information', label: '遗漏关键信息'},
  {value: 'wrong_object_boundary', label: '对象边界错误'},
  {value: 'wrong_dimension', label: '维度错误'},
  {value: 'wrong_section_evidence', label: '证据章节不合适'},
  {value: 'evidence_missing', label: '缺少证据'},
  {value: 'evidence_not_support_answer', label: '证据不支撑答案'},
  {value: 'over_inference', label: '过度推断'},
  {value: 'not_reported_should_be_used', label: '应该标记未报告'},
  {value: 'related_work_misused', label: '误用 related work'},
  {value: 'experiment_result_misused', label: '误把实验结果当机制或经验'},
  {value: 'definition_confused', label: '定义混淆'},
  {value: 'method_step_confused', label: '方法步骤混淆'},
  {value: 'effect_claim_overstated', label: '效果 claim 夸大'},
];

const REVIEW_STATUS_LABELS = {
  pending: '待审查',
  confirm: '确认正确',
  revise: '修改后接受',
  reject: '驳回',
  mark_not_reported: '应为未报告',
  mark_evidence_insufficient: '证据不足',
  mark_over_inferred: '过度推断',
  mark_wrong_dimension: '维度归类错误',
  mark_wrong_object: '对象判断错误',
  confirmed: '已确认',
  needs_revision: '需修改',
  rejected: '已驳回',
};

const REVIEW_ROOT_CAUSES = [
  {value: '', label: '不归因'},
  {value: 'result_error', label: '结果本身错误'},
  {value: 'dimension_definition_unclear', label: '维度定义不清'},
  {value: 'prompt_instruction_unclear', label: 'Prompt 没说清楚'},
  {value: 'object_boundary_unclear', label: '对象边界不清'},
  {value: 'evidence_policy_unclear', label: '证据规则不清'},
];

const REVIEW_SUGGESTED_TARGETS = [
  {value: '', label: '暂不指定'},
  {value: 'dimension.question', label: '维度问题'},
  {value: 'dimension.boundary', label: '维度边界'},
  {value: 'dimension.output_schema', label: '维度输出结构'},
  {value: 'prompt.dimension_instruction', label: 'Prompt 维度说明'},
  {value: 'prompt.evidence_policy', label: 'Prompt 证据规则'},
  {value: 'prompt.not_reported_policy', label: 'Prompt 未报告规则'},
  {value: 'prompt.inference_policy', label: 'Prompt 推断规则'},
  {value: 'object_definition.working_definition', label: '对象工作定义'},
  {value: 'object_definition.inclusion_criteria', label: '对象纳入标准'},
  {value: 'object_definition.exclusion_criteria', label: '对象排除标准'},
  {value: 'object_definition.observation_signals', label: '对象观察信号'},
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
    toggle.textContent = state.reviewSidebarCollapsed ? '›' : '‹';
    toggle.title = state.reviewSidebarCollapsed ? '展开左侧面板' : '收起左侧面板';
  }
}

function reviewDropdownLabel(selectedIds, options, emptyLabel) {
  const names = options.filter(option => selectedIds.includes(option.id)).map(option => option.label);
  if (!names.length) return emptyLabel;
  if (names.length === 1) return names[0];
  return `${names.length} 项已选择`;
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
        <b>${open ? '收起' : '选择'}</b>
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
      templateSelect.innerHTML = '<option value="">暂无可审查对象</option>';
      templateSelect.disabled = true;
    }
    if (paperDropdown) paperDropdown.innerHTML = renderReviewCheckDropdown('paper', [], [], false, '暂无可审查论文');
    if (paperSetDropdown) paperSetDropdown.innerHTML = renderReviewCheckDropdown('paperSet', [], [], false, '暂无可审查论文集合');
    if (summary) summary.textContent = '暂无可审查结果';
    if (scopeBody) scopeBody.hidden = !state.reviewScopePanelOpen;
    if (scopeIcon) scopeIcon.textContent = state.reviewScopePanelOpen ? '收起' : '展开';
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
  if (paperDropdown) paperDropdown.innerHTML = renderReviewCheckDropdown('paper', paperOptions, draftPaperIds, state.reviewPaperDropdownOpen, '请选择论文');
  if (paperSetDropdown) paperSetDropdown.innerHTML = renderReviewCheckDropdown('paperSet', setOptions, draftSetIds, state.reviewPaperSetDropdownOpen, '请选择论文集合');

  const scopedRuns = reviewScopedRuns();
  state.reviewRunId = (scopedRuns.find(run => run.id === state.reviewRunId) || scopedRuns[0])?.id || null;
  if (summary) {
    const appliedPaperCount = reviewSelectedPaperIds(selectedReviewTemplateId()).length;
    const appliedResultCount = scopedRuns.reduce((total, run) => total + reviewableRunItems(run).length, 0);
    const draftPaperCount = reviewDraftSelectedPaperIds(state.reviewDraftTemplateId).length;
    const draftResultCount = reviewDraftScopedRuns().reduce((total, run) => total + reviewableRunItems(run).length, 0);
    summary.textContent = state.reviewDraftDirty
      ? `待应用：${draftPaperCount} 篇论文 · ${draftSetIds.length} 个集合 · ${draftResultCount} 条结果`
      : `${appliedPaperCount} 篇论文 · ${state.reviewSelectedPaperSetIds.length} 个集合 · ${appliedResultCount} 条结果`;
  }
  if (scopeBody) scopeBody.hidden = !state.reviewScopePanelOpen;
  if (scopeIcon) scopeIcon.textContent = state.reviewScopePanelOpen ? '收起' : '展开';

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
  return REVIEW_STATUS_LABELS[status] || status || '待审查';
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
  return /模型推断|model[_ -]?inferred|inference|infer/i.test(item.model_notes || '');
}

function evidenceSourceHint(ev, dimensionLabel = '') {
  const section = String(ev?.section_title || '').toLowerCase();
  if (/related work|background/.test(section)) return {tone: 'warn', text: '相关工作或背景章节，容易误把他人方法当成本论文对象。'};
  if (/conclusion|discussion/.test(section)) return {tone: 'warn', text: '总结性章节，建议核对 Method、Experiment 或 Results 是否有直接支撑。'};
  if (/method|approach|system|framework|implementation|方法/.test(section)) return {tone: 'good', text: `方法章节，适合作为“${dimensionLabel || '当前维度'}”的直接证据。`};
  if (/experiment|result|evaluation|ablation|实验|结果|评估|消融/.test(section)) return {tone: 'good', text: '实验或结果章节，适合验证效果类信息，也可辅助判断方法是否真实使用。'};
  return {tone: 'neutral', text: '请结合上下文判断该证据是否直接支撑模型结果。'};
}

function reviewQualityHint(entry) {
  const item = entry.item;
  const evidence = item.evidence || [];
  if (!evidence.length) {
    return {tone: 'warn', text: '该结果没有绑定证据，建议优先选择“证据不足”或进入修改。'};
  }
  if (itemModelInferred(item)) {
    return {tone: 'warn', text: '该结果包含模型推断，建议重点核验证据是否明确支撑关键机制。'};
  }
  const risky = evidence.find(ev => /related work|conclusion|discussion/i.test(ev.section_title || ''));
  if (risky) return evidenceSourceHint(risky, item.dimension_label || item.dimension_name);
  const method = evidence.find(ev => /method|approach|system|framework|implementation|方法/i.test(ev.section_title || ''));
  if (method) return evidenceSourceHint(method, item.dimension_label || item.dimension_name);
  if (Number(item.confidence || 0) < 0.45) {
    return {tone: 'warn', text: '模型置信度偏低，建议优先核对答案是否过度概括或缺少直接证据。'};
  }
  return {tone: 'neutral', text: '请判断证据是否直接回答抽取问题，并确认答案没有越过论文原文。'};
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
  return {high: '高风险', medium: '中风险', low: '低风险'}[risk] || risk;
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
  if (!dim) return '当前模板未提供更详细的维度定义。';
  const fields = (dim.fields || []).map(field => typeof field === 'string' ? field : (field.name || field.label || JSON.stringify(field)));
  const parsed = splitImportedDescription(dim.description || '');
  const description = combineDimensionText(parsed.description, parsed.question, '抽取问题：');
  const parts = [
    description ? `说明：${description}` : '',
    dim.output_type ? `输出类型：${dim.output_type}` : '',
    dim.required_evidence ? '需要证据：是' : '需要证据：否',
    dim.allow_not_found ? '允许未报告：是' : '允许未报告：否',
    fields.length ? `字段：${fields.join('、')}` : '',
  ].filter(Boolean);
  return parts.join('\n');
}

function renderReviewFilters() {
  const draftFilters = reviewDraftFilters();
  const dimensions = [...new Map(reviewDraftScopedRuns()
    .flatMap(run => reviewableRunItems(run))
    .map(item => [item.dimension_name, item.dimension_label || item.dimension_name])).entries()];
  $('reviewDimensionFilter').innerHTML = '<option value="all">全部维度</option>' + dimensions.map(([id, label]) => `<option value="${escapeHtml(id)}">${escapeHtml(label)}</option>`).join('');
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
    summary.textContent = `待应用：${draftPaperCount} 篇论文 · ${(state.reviewDraftPaperSetIds || []).length} 个集合 · ${draftResultCount} 条结果`;
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
    $('reviewTemplateName').textContent = '人机协同审查';
    $('reviewTemplateMeta').textContent = '暂无抽取结果';
    $('reviewQueueCount').textContent = '0 条';
    $('reviewQueueList').innerHTML = '<p class="muted">暂无审查队列。</p>';
    $('reviewMainPane').innerHTML = '<div class="review-empty">暂无可审查的抽取结果。</div>';
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
      `研究对象：${entry.template?.name || entry.run.template_id}`,
      `维度：${entry.item.dimension_label || entry.item.dimension_name}`,
      `模板 v${entry.template?.version || '-'}`,
      `Prompt ${prompt?.name || prompt?.id || entry.template?.active_prompt_id || '-'}`,
      entry.run.model || '未知模型',
    ].join(' · ');
  } else {
    const run = reviewRun();
    const template = reviewTemplate(run);
    $('reviewTemplateName').textContent = template?.name || run?.template_id || '人机协同审查';
    $('reviewTemplateMeta').textContent = run ? `当前筛选条件下没有待审查条目 · 模板 v${template?.version || '-'}` : '暂无抽取结果';
  }
  $('reviewProgressText').textContent = `${done} / ${total}`;
  $('reviewProgressBar').style.width = `${pct}%`;
  const entries = filteredReviewEntries();
  $('reviewPrevBtn').disabled = !entries.length || state.reviewItemIndex <= 0;
  $('reviewNextBtn').disabled = !entries.length || state.reviewItemIndex >= entries.length - 1;
}

function renderReviewQueue(entries = filteredReviewEntries()) {
  $('reviewQueueCount').textContent = `${entries.length} 条`;
  $('reviewQueueList').innerHTML = entries.map((entry, index) => {
    const item = entry.item;
    const active = index === state.reviewItemIndex;
    return `<button type="button" class="review-queue-card ${active ? 'active' : ''}" onclick="selectReviewItem(${index})">
      <span class="review-queue-top">
        <b>${escapeHtml(item.dimension_label || item.dimension_name)}</b>
        <em class="${entry.risk}">${riskLabel(entry.risk)}</em>
      </span>
      <span class="review-queue-title">${escapeHtml(fmt(item.edited_title || item.title || '未命名结果', 72))}</span>
      <span class="review-queue-paper">${escapeHtml(fmt(entry.paper?.metadata?.title || entry.run.paper_id, 84))}</span>
      <span class="review-queue-tags">
        <i class="${escapeHtml(item.review_status || 'pending')}">${escapeHtml(reviewStatusLabel(item.review_status || 'pending'))}</i>
        <i>confidence ${confidenceText(item.confidence)}</i>
        ${(item.tags || []).slice(0, 2).map(tag => `<i>${escapeHtml(tag)}</i>`).join('')}
      </span>
    </button>`;
  }).join('') || '<div class="review-empty small">没有符合筛选条件的待审查内容。</div>';
}

function renderReviewMain(entry) {
  if (!entry) {
    $('reviewMainPane').innerHTML = '<div class="review-empty">请选择左侧队列中的一条抽取结果。</div>';
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
        <span class="review-dimension-chip">维度：${escapeHtml(item.dimension_label || item.dimension_name)}</span>
        <span class="review-index-chip">第 ${entry.index + 1} 条</span>
      </div>
      <h3>抽取问题</h3>
      <p class="review-question-text">${escapeHtml(question)}</p>
      <details class="review-dimension-detail">
        <summary>查看维度定义</summary>
        <p>${escapeHtml(reviewDimensionDefinition(entry))}</p>
      </details>
    </section>

    <section class="review-focus-card review-result-card">
      <div class="review-card-header-line">
        <h3>模型抽取结果</h3>
        <span class="badge ${escapeHtml(item.review_status || 'pending')}">${escapeHtml(reviewStatusLabel(item.review_status || 'pending'))}</span>
      </div>
      <div class="review-answer lead highlighted">${escapeHtml(item.edited_content || item.content || '无内容')}</div>
      <div class="review-result-meta">
        <span>置信度：<b>${confidenceLevelText(item.confidence)}</b></span>
        <span>证据：<b>${evidenceCount} 条</b></span>
        <span>模型推断：<b>${modelInferred ? '是' : '否'}</b></span>
        <span>状态：<b>${escapeHtml(reviewStatusLabel(item.review_status || 'pending'))}</b></span>
      </div>
      <div class="review-quality-hint ${escapeHtml(qualityHint.tone)}">
        <b>系统提示</b>
        <span>${escapeHtml(qualityHint.text)}</span>
      </div>
    </section>

    <section class="review-action-zone">
      <nav class="review-primary-actions" aria-label="审查操作">
        <button type="button" class="primary good ${item.review_status === 'confirm' ? 'active' : ''}" onclick="saveCurrentReview('confirm')" ${savingAttr}>${state.reviewSaving ? '保存中...' : '确认正确'}</button>
        <button type="button" class="${state.reviewActionMode === 'revise' ? 'active' : ''}" onclick="openReviewMode('revise')" ${savingAttr}>修改</button>
        <button type="button" class="danger ${state.reviewActionMode === 'reject' || item.review_status === 'reject' ? 'active' : ''}" onclick="openReviewMode('reject')" ${savingAttr}>驳回</button>
        <button type="button" class="warn ${state.reviewActionMode === 'evidence' || item.review_status === 'mark_evidence_insufficient' ? 'active' : ''}" onclick="openReviewMode('evidence')" ${savingAttr}>证据不足</button>
        <button type="button" class="${state.reviewActionMode === 'not_reported' || item.review_status === 'mark_not_reported' ? 'active' : ''}" onclick="openReviewMode('not_reported')" ${savingAttr}>应为未报告</button>
        <button type="button" class="ghost" onclick="skipReviewItem()" ${savingAttr}>跳过</button>
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
      <button type="button" onclick="closeReviewMode()" ${savingAttr}>取消</button>
      <button type="button" class="primary" title="${escapeHtml(confirmLabel)}" onclick="saveCurrentReview('${escapeHtml(status)}')" ${savingAttr}>${state.reviewSaving ? '提交中...' : '提交'}</button>
    </div>
  `;
}

function renderReviewSecondaryPanel(entry) {
  if (!state.reviewActionMode || state.reviewActionItemKey !== reviewItemKey(entry)) return '';
  const item = entry.item;
  if (state.reviewActionMode === 'revise') {
    const tags = [
      ['answer_too_generic', '答案过泛'],
      ['missing_key_information', '缺少关键信息'],
      ['missing_usage_mechanism', '缺少使用机制'],
      ['evidence_insufficient', '证据不足'],
      ['wrong_dimension', '维度归类不准'],
      ['other', '其他'],
    ];
    return `
      <section class="review-secondary-panel">
        <h4>修订答案</h4>
        <textarea id="reviewEditContent" class="review-textarea review-edit-compact" rows="4">${escapeHtml(state.reviewDraftContent)}</textarea>
        <div class="review-panel-block">
          <span>修改原因</span>
          <div class="review-panel-tags">${tags.map(([value, label]) => reviewTagButton(value, label)).join('')}</div>
        </div>
        <textarea id="reviewModeNote" class="review-textarea review-note-editor" rows="2" placeholder="补充说明，可选">${escapeHtml(state.reviewDraftNote)}</textarea>
        ${renderReviewPanelActions('保存修改并确认', 'revise')}
      </section>
    `;
  }
  if (state.reviewActionMode === 'reject') {
    const tags = [
      ['wrong_object_boundary', '对象不匹配'],
      ['wrong_dimension', '维度不匹配'],
      ['evidence_not_support_answer', '证据不支持'],
      ['over_inference', '过度推断'],
      ['related_work_misused', '误用 Related Work'],
      ['not_reported_should_be_used', '应为未报告'],
      ['other', '其他'],
    ];
    return `
      <section class="review-secondary-panel">
        <h4>请选择驳回原因</h4>
        <div class="review-panel-tags">${tags.map(([value, label]) => reviewTagButton(value, label)).join('')}</div>
        <textarea id="reviewModeNote" class="review-textarea review-note-editor" rows="2" placeholder="补充说明，可选">${escapeHtml(state.reviewDraftNote)}</textarea>
        ${renderReviewPanelActions('确认驳回', 'reject')}
      </section>
    `;
  }
  if (state.reviewActionMode === 'evidence') {
    const savingAttr = state.reviewSaving ? 'disabled aria-busy="true"' : '';
    const tags = [
      ['evidence_missing', '缺少证据'],
      ['evidence_not_support_answer', '证据不支持答案'],
      ['wrong_section_evidence', '证据章节不合适'],
      ['evidence_too_generic', '证据太泛'],
      ['need_more_context', '需要更多上下文'],
      ['over_inference', '过度推断'],
    ];
    return `
      <section class="review-secondary-panel">
        <h4>证据问题</h4>
        <div class="review-panel-tags">${tags.map(([value, label]) => reviewTagButton(value, label)).join('')}</div>
        <textarea id="reviewModeNote" class="review-textarea review-note-editor" rows="2" placeholder="补充说明，可选">${escapeHtml(state.reviewDraftNote)}</textarea>
        <div class="review-panel-actions">
          <button type="button" onclick="saveCurrentReview('pending')" ${savingAttr}>仅记录证据问题</button>
          <button type="button" onclick="closeReviewMode()" ${savingAttr}>取消</button>
          <button type="button" class="primary" title="确认标记证据不足" onclick="saveCurrentReview('mark_evidence_insufficient')" ${savingAttr}>${state.reviewSaving ? '提交中...' : '提交'}</button>
        </div>
      </section>
    `;
  }
  if (state.reviewActionMode === 'not_reported') {
    const tags = [
      ['not_reported_should_be_used', '论文未报告'],
      ['evidence_insufficient', '证据不足，不能推断'],
      ['over_inference', '模型强行补全'],
    ];
    return `
      <section class="review-secondary-panel compact">
        <h4>确认将该维度标记为 not_reported？</h4>
        <div class="review-panel-tags">${tags.map(([value, label]) => reviewTagButton(value, label)).join('')}</div>
        <textarea id="reviewModeNote" class="review-textarea review-note-editor" rows="2" placeholder="补充说明，可选">${escapeHtml(state.reviewDraftNote)}</textarea>
        ${renderReviewPanelActions('确认并下一条', 'mark_not_reported')}
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
      <header><h3>证据是否支撑模型结果？</h3><span>${(item.evidence || []).length} 条证据</span></header>
      ${(item.evidence || []).map((ev, index) => renderEvidenceCard(ev, entry, index)).join('') || '<p class="muted">无证据绑定。</p>'}
    </section>
    <details class="review-side-details">
      <summary>查看后台反馈沉淀</summary>
      <section class="review-side-section subtle">
        <header><h3>本维度反馈统计</h3><button type="button" onclick="refreshReviewFeedback().catch(err => toast(err.message))">刷新</button></header>
        <div class="review-side-stats">
          <div><span>确认率</span><b>${Math.round((metrics.confirm_rate || 0) * 100)}%</b></div>
          <div><span>修改率</span><b>${Math.round((metrics.revise_rate || 0) * 100)}%</b></div>
          <div><span>驳回率</span><b>${Math.round((metrics.reject_rate || 0) * 100)}%</b></div>
          <div><span>证据问题</span><b>${Math.round((metrics.evidence_issue_rate || 0) * 100)}%</b></div>
        </div>
        <div class="feedback-tag-row">
          ${Object.entries(pool?.feedback_pool?.common_error_tags || {}).slice(0, 5).map(([tag, count]) => `<span>${escapeHtml(tag)} <b>${count}</b></span>`).join('') || '<span>暂无高频错误</span>'}
        </div>
      </section>
      <section class="review-side-section subtle">
        <header><h3>模板升级候选</h3></header>
        ${candidates.slice(0, 2).map(item => `<div class="review-upgrade-card"><b>${escapeHtml(item.target_level)} · ${escapeHtml(item.suggested_target)}</b><p>${escapeHtml(item.recommended_change)}</p></div>`).join('') || '<p class="muted">当前维度暂无明显升级候选。</p>'}
      </section>
      <section class="review-side-section subtle">
        <header><h3>当前记录预览</h3></header>
        <pre class="review-record-preview">${escapeHtml(JSON.stringify(buildReviewPreview(entry), null, 2))}</pre>
      </section>
    </details>
  `;
}

function compactContextSnippet(text, maxChars = 640) {
  const value = String(text || '').trim();
  if (!value || value.length <= maxChars) return value;
  return `${value.slice(0, maxChars).trim()}...`;
}

function normalizeTextWithMap(text) {
  const normalized = [];
  const map = [];
  let lastWasSpace = false;
  String(text || '').split('').forEach((char, index) => {
    if (/\s/.test(char)) {
      if (!lastWasSpace) {
        normalized.push(' ');
        map.push(index);
        lastWasSpace = true;
      }
      return;
    }
    normalized.push(char.toLowerCase());
    map.push(index);
    lastWasSpace = false;
  });
  return {text: normalized.join(''), map};
}

function evidenceRangeInText(text, quote) {
  const value = String(text || '');
  const needle = String(quote || '').trim();
  if (!value || !needle) return null;
  const exactIndex = value.indexOf(needle);
  if (exactIndex >= 0) return {start: exactIndex, end: exactIndex + needle.length};

  const source = normalizeTextWithMap(value);
  const target = normalizeTextWithMap(needle).text.trim();
  if (!target) return null;
  const normalizedIndex = source.text.indexOf(target);
  if (normalizedIndex < 0) return null;
  const lastNormalizedIndex = normalizedIndex + target.length - 1;
  const start = source.map[normalizedIndex];
  const end = source.map[lastNormalizedIndex] + 1;
  if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) return null;
  return {start, end};
}

function mergeEvidenceRanges(ranges) {
  return ranges
    .filter(range => Number.isFinite(range.start) && Number.isFinite(range.end) && range.end > range.start)
    .sort((a, b) => a.start - b.start)
    .reduce((merged, range) => {
      const last = merged[merged.length - 1];
      if (!last || range.start > last.end) merged.push({...range});
      else last.end = Math.max(last.end, range.end);
      return merged;
    }, []);
}

function evidenceQuoteFragments(quote) {
  return String(quote || '')
    .split(/\s*(?:\[\s*(?:\.{3,}|…+)\s*\]|\(\s*(?:\.{3,}|…+)\s*\)|\.{3,}|…+)\s*/g)
    .map(fragment => fragment.trim())
    .filter(fragment => fragment.length >= 4);
}

function evidenceRangesInText(text, quote) {
  const value = String(text || '');
  const needle = String(quote || '').trim();
  const fullRange = evidenceRangeInText(value, needle);
  if (fullRange) return [fullRange];

  const fragments = evidenceQuoteFragments(needle);
  if (fragments.length < 2) return [];
  const source = normalizeTextWithMap(value);
  const ranges = [];
  let searchFrom = 0;
  fragments.forEach(fragment => {
    const target = normalizeTextWithMap(fragment).text.trim();
    if (!target) return;
    const normalizedIndex = source.text.indexOf(target, searchFrom);
    if (normalizedIndex < 0) return;
    const lastNormalizedIndex = normalizedIndex + target.length - 1;
    const start = source.map[normalizedIndex];
    const end = source.map[lastNormalizedIndex] + 1;
    if (Number.isFinite(start) && Number.isFinite(end) && end > start) {
      ranges.push({start, end});
      searchFrom = normalizedIndex + target.length;
    }
  });
  return ranges.length ? mergeEvidenceRanges(ranges) : [];
}

function compactCurrentContext(text, quote) {
  const value = String(text || '').trim();
  const needle = String(quote || '').trim();
  if (!value) return needle;
  if (!needle) return compactContextSnippet(value, 1600);
  const ranges = evidenceRangesInText(value, needle);
  if (!ranges.length) return compactContextSnippet(value, 1600);
  const start = Math.max(0, ranges[0].start - 720);
  const end = Math.min(value.length, ranges[ranges.length - 1].end + 900);
  return `${start > 0 ? '...' : ''}${value.slice(start, end).trim()}${end < value.length ? '...' : ''}`;
}

function renderUnderlinedEvidenceContext(text, quote) {
  const value = String(text || '').trim();
  const needle = String(quote || '').trim();
  if (!needle) return escapeHtml(value);
  const ranges = evidenceRangesInText(value, needle);
  if (!ranges.length) return escapeHtml(value);
  let cursor = 0;
  return ranges.map(range => {
    const before = escapeHtml(value.slice(cursor, range.start));
    const current = `<span class="review-context-evidence">${escapeHtml(value.slice(range.start, range.end))}</span>`;
    cursor = range.end;
    return before + current;
  }).join('') + escapeHtml(value.slice(cursor));
}

function renderEvidenceContextHtml(prev, current, next, ev) {
  const parts = [
    prev ? compactContextSnippet(prev.text) : '',
    compactCurrentContext(current?.text || ev.quote || '', ev.quote || ''),
    next ? compactContextSnippet(next.text) : '',
  ].filter(Boolean);
  return renderUnderlinedEvidenceContext(parts.join('\n\n'), ev.quote || '');
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
      <b>证据 ${index + 1}</b>
      <span>${escapeHtml(ev.section_title || 'Unknown')} · p.${ev.page_start || '?'}</span>
    </header>
    <p class="review-evidence-hint ${escapeHtml(hint.tone)}">${escapeHtml(hint.text)}</p>
    <blockquote>${escapeHtml(ev.quote || '无证据原文')}</blockquote>
    <div class="review-evidence-actions">
      <button type="button" onclick="markEvidenceJudgement(${index}, 'support')">支持答案</button>
      <button type="button" onclick="markEvidenceJudgement(${index}, 'partial')">部分支持</button>
      <button type="button" onclick="markEvidenceJudgement(${index}, 'not_support')">不支持</button>
      <button type="button" onclick="toggleEvidenceContext(${index})">${expanded ? '收起上下文' : '看上下文'}</button>
    </div>
    <div class="review-context-stack ${expanded ? '' : 'collapsed'}">
      <div class="review-context-combined"><p>${renderEvidenceContextHtml(prev, current, next, ev)}</p></div>
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
  toast('正在保存审查结果...');
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
      ? `已记录证据问题，当前条目仍待审查。进度 ${done}/${total}`
      : `审查已保存，进度 ${done}/${total}`;
    toast(message);
  } catch (err) {
    state.reviewSaving = false;
    renderReviewMain(currentReviewEntry());
    toast(`保存失败：${err.message}`);
  }
};

window.reviewItem = async function(runId, itemId, status) {
  await window.saveCurrentReview(status);
};

window.markEvidenceJudgement = function(index, judgement) {
  const entry = currentReviewEntry();
  if (!entry) return;
  if (judgement === 'support') {
    toast(`证据 ${index + 1} 已判断为支持答案，可继续确认结果`);
    return;
  }
  if (judgement === 'partial') {
    window.openReviewMode('evidence', ['evidence_too_generic', 'need_more_context']);
    toast(`证据 ${index + 1} 已标记为部分支持，请确认是否记录证据问题`);
    return;
  }
  window.openReviewMode('evidence', ['evidence_not_support_answer']);
  toast(`证据 ${index + 1} 不支持答案，请确认是否标记为证据不足`);
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

function materialAnalysisConfig() {
  return MATERIAL_ANALYSIS_TYPES.find(item => item.id === state.materialAnalysisType) || MATERIAL_ANALYSIS_TYPES[0];
}

function materialReadyTemplates() {
  const ready = extractionReadyTemplates();
  return ready.length ? ready : (state.templates || []);
}

function materialCurrentTemplate() {
  const selectedId = $('materialObjectSelect')?.value || '';
  const templates = materialReadyTemplates();
  return templates.find(item => item.id === selectedId) || templates[0] || null;
}

function materialTemplateDimensions(template = materialCurrentTemplate()) {
  const dims = (template?.dimensions || []).map(dim => ({
    value: dim.name,
    label: dim.label || dim.name,
    question: dim.question || dim.description || '',
  }));
  if (dims.length) return dims;
  const byName = new Map();
  (state.materials || []).forEach(item => {
    if (!item.dimension_name) return;
    byName.set(item.dimension_name, {
      value: item.dimension_name,
      label: item.dimension_label || item.dimension_name,
      question: '',
    });
  });
  return [...byName.values()].sort((a, b) => a.label.localeCompare(b.label, 'zh-Hans-CN'));
}

function selectedCheckboxValues(selector) {
  return [...document.querySelectorAll(selector)]
    .filter(input => input.checked)
    .map(input => input.value);
}

function materialDropdownLabel(selectedLabels, total) {
  return `${selectedLabels.length} 项`;
}

function renderMaterialDropdownOpenStates() {
  document.querySelectorAll('.materials-multi-select').forEach(container => {
    const id = container.dataset.materialDropdown;
    const open = state.materialDropdownOpen === id;
    container.classList.toggle('open', open);
    const menu = container.querySelector('.materials-multi-menu');
    if (menu) menu.hidden = !open;
  });
}

function refreshMaterialDropdownLabels() {
  document.querySelectorAll('.materials-multi-select').forEach(container => {
    const inputs = [...container.querySelectorAll('input:not(.materialSelectAllCheck)')];
    const checkedInputs = inputs.filter(input => input.checked);
    const labels = checkedInputs
      .map(input => input.dataset.label || input.value);
    const total = inputs.length;
    const label = container.querySelector('[data-material-dropdown-label]');
    if (label) label.textContent = materialDropdownLabel(labels, total);
    const selectAll = container.querySelector('.materialSelectAllCheck');
    if (selectAll) {
      selectAll.checked = Boolean(inputs.length && checkedInputs.length === inputs.length);
      selectAll.indeterminate = Boolean(checkedInputs.length && checkedInputs.length < inputs.length);
    }
  });
}

window.toggleMaterialMultiDropdown = function(id) {
  state.materialDropdownOpen = state.materialDropdownOpen === id ? null : id;
  renderMaterialDropdownOpenStates();
};

window.toggleMaterialMultiSelectAll = function(dropdownId, inputClass, checked) {
  const container = [...document.querySelectorAll('.materials-multi-select')]
    .find(item => item.dataset.materialDropdown === dropdownId);
  if (!container) return;
  container.querySelectorAll(`.${inputClass}`).forEach(input => {
    input.checked = checked;
  });
  refreshMaterialDropdownLabels();
  refreshMaterialDerivedViews(filteredMaterialItems());
};

function renderMaterialMultiSelect(containerId, dropdownId, title, inputClass, options) {
  const container = $(containerId);
  if (!container) return;
  const previous = new Map([...container.querySelectorAll('input')].map(input => [input.value, input.checked]));
  const hasPrevious = previous.size > 0;
  const normalized = options.map(option => {
    const checked = hasPrevious ? previous.get(option.value) !== false : Boolean(option.defaultChecked);
    return {...option, checked};
  });
  const selectedLabels = normalized.filter(option => option.checked).map(option => option.label);
  const allChecked = Boolean(normalized.length && normalized.every(option => option.checked));
  container.innerHTML = `
    <div class="materials-multi-select" data-material-dropdown="${escapeHtml(dropdownId)}">
      <button type="button" class="materials-multi-trigger" onclick="toggleMaterialMultiDropdown('${escapeHtml(dropdownId)}')" title="${escapeHtml(title)}">
        <span>${escapeHtml(title)}</span>
        <b data-material-dropdown-label="${escapeHtml(dropdownId)}">${escapeHtml(materialDropdownLabel(selectedLabels, normalized.length))}</b>
      </button>
      <div class="materials-multi-menu" hidden>
        ${normalized.length ? `
          <label class="materials-check materials-check-all" title="全选/取消全选">
            <input type="checkbox" class="materialSelectAllCheck" ${allChecked ? 'checked' : ''} onchange="toggleMaterialMultiSelectAll('${escapeHtml(dropdownId)}', '${escapeHtml(inputClass)}', this.checked)" />
            <span>全选</span>
          </label>
        ` : ''}
        ${normalized.map(option => `
          <label class="materials-check" title="${escapeHtml(option.label)}">
            <input type="checkbox" class="${escapeHtml(inputClass)}" value="${escapeHtml(option.value)}" data-label="${escapeHtml(option.label)}" ${option.checked ? 'checked' : ''} />
            <span>${escapeHtml(option.label)}</span>
          </label>
        `).join('') || '<div class="materials-empty small">暂无选项。</div>'}
      </div>
    </div>
  `;
  renderMaterialDropdownOpenStates();
}

function renderMaterialDimensionChecks() {
  const dims = materialTemplateDimensions();
  const container = $('materialDimensionChecks');
  const hiddenSelect = $('materialDimension');
  if (hiddenSelect) {
    hiddenSelect.innerHTML = '<option value="">全部维度</option>' + dims.map(dim => `<option value="${escapeHtml(dim.value)}">${escapeHtml(dim.label)}</option>`).join('');
  }
  if (!container) return;
  const previous = new Map([...container.querySelectorAll('input')].map(input => [input.value, input.checked]));
  const hasPrevious = previous.size > 0;
  renderMaterialMultiSelect('materialDimensionChecks', 'dimensions', '分析维度', 'materialDimCheck', dims.map(dim => ({
    value: dim.value,
    label: dim.label,
    defaultChecked: hasPrevious ? previous.get(dim.value) !== false : true,
  })));
}

function selectedMaterialDimensions() {
  const selected = selectedCheckboxValues('.materialDimCheck');
  if (selected.length) return selected;
  return materialTemplateDimensions().map(dim => dim.value);
}

function materialDimensionLabel(value) {
  return materialTemplateDimensions().find(dim => dim.value === value)?.label || value || '-';
}

function materialPaperSetOptions() {
  return [
    {value: 'all', label: '全部论文'},
    ...validCustomPaperSets().map(item => ({value: item.id, label: item.name || item.id})),
  ];
}

function materialScopedPapers() {
  const selectedSetId = $('materialPaperSetSelect')?.value || 'all';
  if (selectedSetId === 'all') return state.papers || [];
  const paperSet = (state.paperSets || []).find(item => item.id === selectedSetId);
  const ids = new Set(paperSet?.paper_ids || []);
  return (state.papers || []).filter(paper => ids.has(paper.id));
}

function materialScopedPaperIds() {
  return new Set(materialScopedPapers().map(paper => paper.id));
}

function paperById(id) {
  return (state.papers || []).find(paper => paper.id === id);
}

function materialSelectedStatuses() {
  return selectedCheckboxValues('.materialReviewStatusCheck');
}

function materialEvidenceRequirements() {
  return new Set(selectedCheckboxValues('.materialEvidenceRequirementCheck'));
}

function selectedMaterialAnalysisParams() {
  return selectedCheckboxValues('.materialParamCheck');
}

function paperSourceBucket(paper) {
  const meta = paper?.metadata || {};
  const extra = meta.extra || {};
  const text = [
    paper?.source,
    meta.venue,
    meta.publisher,
    meta.journal,
    meta.conference,
    extra.venue,
    extra.conference,
    meta.title,
  ].filter(Boolean).join(' ').toLowerCase();
  if (/arxiv/.test(text)) return 'arxiv';
  if (/\bacl\b|association for computational linguistics/.test(text)) return 'acl';
  if (/neurips|nips/.test(text)) return 'neurips';
  if (/\biclr\b/.test(text)) return 'iclr';
  if (/\bicml\b/.test(text)) return 'icml';
  return 'other';
}

function materialEvidenceStrength(item) {
  const score = Number(item.confidence || 0);
  if (score >= 0.75) return 'strong';
  if (score >= 0.45 || (item.evidence || []).length) return 'medium';
  return 'weak';
}

function materialObjectRole(item) {
  const value = item.normalized_value || item.raw || {};
  const text = typeof value === 'string' ? value : JSON.stringify(value || {});
  const roles = MATERIAL_OBJECT_ROLE_OPTIONS.map(option => option.value);
  return roles.find(role => text.includes(role)) || '';
}

function materialMatchesEvidenceRequirements(item) {
  const requirements = materialEvidenceRequirements();
  const evidenceCount = (item.evidence || []).length;
  if (requirements.has('evidence_required') && !evidenceCount) return false;
  if (!requirements.has('include_model_inferred') && itemModelInferred(item)) return false;
  if (!requirements.has('include_evidence_issues') && item.review_status === 'mark_evidence_insufficient') return false;
  return true;
}

function filteredMaterialItems(items = state.materials || []) {
  const paperIds = materialScopedPaperIds();
  const dimensions = new Set(selectedMaterialDimensions());
  const statuses = materialSelectedStatuses();
  const statusSet = new Set(statuses);
  const sourceSet = new Set(selectedCheckboxValues('.materialSourceCheck'));
  const strengthSet = new Set(selectedCheckboxValues('.materialEvidenceStrengthCheck'));
  const roleSet = new Set(selectedCheckboxValues('.materialObjectRoleCheck'));
  const yearStart = Number($('materialYearStart')?.value || '');
  const yearEnd = Number($('materialYearEnd')?.value || '');
  return (items || []).filter(item => {
    const paper = paperById(item.paper_id);
    if (paperIds.size && !paperIds.has(item.paper_id)) return false;
    if (dimensions.size && !dimensions.has(item.dimension_name)) return false;
    if (statusSet.size && !statusSet.has(item.review_status || 'pending')) return false;
    if (!materialMatchesEvidenceRequirements(item)) return false;
    const year = Number(paper?.metadata?.year || 0);
    if (Number.isFinite(yearStart) && yearStart && year && year < yearStart) return false;
    if (Number.isFinite(yearEnd) && yearEnd && year && year > yearEnd) return false;
    if (sourceSet.size && !sourceSet.has(paperSourceBucket(paper))) return false;
    if (strengthSet.size && !strengthSet.has(materialEvidenceStrength(item))) return false;
    const role = materialObjectRole(item);
    if (role && roleSet.size && !roleSet.has(role)) return false;
    return true;
  });
}

function renderMaterialAnalysisNav() {
  const nav = $('materialAnalysisNav');
  if (!nav) return;
  const deepDiveDim = materialDeepDiveDimension();
  const isDeepDive = state.materialAnalysisType === 'compare'
    && state.materialAnalysisDepth === 'deep_dive'
    && deepDiveDim;
  nav.classList.toggle('deep-dive-outer-nav', Boolean(isDeepDive));
  const heading = $('materialAnalysisHeading')?.closest('.materials-section-heading');
  if (heading) heading.hidden = Boolean(isDeepDive);
  if ($('materialAnalysisHeading')) $('materialAnalysisHeading').textContent = '分析类型';
  if ($('materialAnalysisTypeHint')) $('materialAnalysisTypeHint').textContent = `当前：${materialAnalysisConfig().label}`;
  if (isDeepDive) {
    const items = state.materialCurrentItems?.length ? state.materialCurrentItems : filteredMaterialItems();
    nav.innerHTML = renderMaterialDeepDiveSidebarContent(materialDeepDiveContext(deepDiveDim, items));
    return;
  }
  nav.innerHTML = MATERIAL_ANALYSIS_TYPES.map(item => `
    <button type="button" class="materials-analysis-item ${item.id === state.materialAnalysisType ? 'active' : ''}" data-material-analysis="${escapeHtml(item.id)}">
      <span class="materials-analysis-icon">${escapeHtml(item.icon)}</span>
      <span class="materials-analysis-copy">
        <b>${escapeHtml(item.index)}. ${escapeHtml(item.label)}</b>
        <span>${escapeHtml(item.description)}</span>
      </span>
    </button>
  `).join('');
  nav.querySelectorAll('[data-material-analysis]').forEach(button => {
    button.onclick = () => window.setMaterialAnalysisType(button.dataset.materialAnalysis);
  });
}

function renderMaterialsBreadcrumb() {
  const nav = $('materialsBreadcrumb');
  const summary = $('materialsContextSummary');
  if (!nav) return;
  const dim = materialDeepDiveDimension();
  const showDeepDiveTrail = state.materialAnalysisType === 'compare'
    && state.materialAnalysisDepth === 'deep_dive'
    && dim;
  nav.hidden = !showDeepDiveTrail;
  if (summary) summary.hidden = showDeepDiveTrail;
  if (!showDeepDiveTrail) {
    nav.innerHTML = '';
    return;
  }
  const template = materialCurrentTemplate();
  nav.innerHTML = `
    <div class="materials-breadcrumb-row">
      <ol>
        <li><button type="button" onclick="window.setMaterialAnalysisType('overview')">素材管理与分析</button></li>
        <li><button type="button" onclick="returnToMaterialCompareMatrix()">跨论文对比矩阵</button></li>
        <li><span>维度深挖</span></li>
        <li aria-current="page"><b>${escapeHtml(dim.label || dim.value)}</b>${template ? `<small>${escapeHtml(template.name || template.id)}</small>` : ''}</li>
      </ol>
      <div class="materials-breadcrumb-actions">
        <button id="materialDeepDiveReturnBtn" type="button">返回矩阵</button>
        <button id="materialDeepDiveSaveBtn" type="button" class="primary">保存为分析视图</button>
      </div>
    </div>
  `;
  bindMaterialTopActions();
}

function renderMaterialAnalysisParams() {
  const options = MATERIAL_ANALYSIS_PARAMS[state.materialAnalysisType] || [];
  const panel = $('materialAnalysisParams');
  if (!panel) return;
  renderMaterialMultiSelect('materialAnalysisParams', 'analysis_params', '分析参数', 'materialParamCheck', options.map(option => ({
    value: option.value,
    label: option.label,
    defaultChecked: true,
  })));
}

function renderComparePaperChecks() {
  const container = $('comparePaperChecks');
  if (!container) return;
  const papers = materialScopedPapers();
  const previous = new Map([...container.querySelectorAll('input')].map(input => [input.value, input.checked]));
  const hasPrevious = previous.size > 0;
  container.innerHTML = papers.map(paper => {
    const checked = hasPrevious ? previous.get(paper.id) !== false : true;
    const title = paper.metadata?.title || paper.id;
    return `<label class="materials-paper-check" title="${escapeHtml(title)}">
      <input type="checkbox" class="comparePaper" value="${escapeHtml(paper.id)}" ${checked ? 'checked' : ''} />
      <span>${escapeHtml(fmt(title, 96))}</span>
    </label>`;
  }).join('') || '<div class="materials-empty">当前论文集合中暂无论文。</div>';
}

function materialContextSummary(items) {
  const papers = materialScopedPapers();
  const template = materialCurrentTemplate();
  const paperSetLabel = $('materialPaperSetSelect')?.selectedOptions?.[0]?.textContent || '全部论文';
  const evidenceCount = items.filter(item => (item.evidence || []).length).length;
  const coverage = items.length ? Math.round(evidenceCount / items.length * 100) : 0;
  return {
    papers,
    template,
    paperSetLabel,
    reviewedCount: items.filter(item => reviewStatusGroup(item.review_status) === 'accepted').length,
    evidenceCoverage: coverage,
  };
}

function updateMaterialsContext(items = filteredMaterialItems()) {
  const config = materialAnalysisConfig();
  if ($('materialsProjectName')) $('materialsProjectName').textContent = config.label;
  if ($('materialsScopeSummary')) $('materialsScopeSummary').textContent = '默认使用已审查且有证据的素材进行分析，可在顶部数据范围中调整。';
  if ($('materialMainTitle')) $('materialMainTitle').textContent = config.label;
  if ($('materialMainSubtitle')) $('materialMainSubtitle').textContent = config.description;
  if ($('materialResultTitle')) $('materialResultTitle').textContent = config.description;
  if ($('materialAnalysisTypeHint')) $('materialAnalysisTypeHint').textContent = `当前：${config.label}`;
}

function renderMaterialScopePanel() {
  const workbench = document.querySelector('.materials-workbench');
  const topbar = document.querySelector('.materials-topbar');
  const panel = document.querySelector('.materials-scope-panel');
  const body = $('materialsScopeBody');
  const text = $('materialsScopeToggleText');
  const toggle = $('materialsScopeToggleBtn');
  const hideForDeepDive = state.materialAnalysisType === 'compare'
    && state.materialAnalysisDepth === 'deep_dive'
    && materialDeepDiveDimension();
  if (topbar) topbar.hidden = Boolean(hideForDeepDive);
  if (panel) panel.hidden = Boolean(hideForDeepDive);
  if (body) body.hidden = Boolean(hideForDeepDive) || !state.materialScopePanelOpen;
  if (workbench) workbench.classList.toggle('materials-scope-collapsed', Boolean(hideForDeepDive) || !state.materialScopePanelOpen);
  if (panel) panel.classList.toggle('scope-collapsed', !state.materialScopePanelOpen);
  if (text) text.textContent = state.materialScopePanelOpen ? '⌃' : '⌄';
  if (toggle) {
    toggle.setAttribute('aria-expanded', state.materialScopePanelOpen ? 'true' : 'false');
    toggle.title = state.materialScopePanelOpen ? '收起数据范围' : '展开数据范围';
  }
}

window.toggleMaterialScopePanel = function() {
  state.materialScopePanelOpen = !state.materialScopePanelOpen;
  if (!state.materialScopePanelOpen) state.materialDropdownOpen = null;
  renderMaterialScopePanel();
};

function bindMaterialTopActions() {
  if ($('refreshMaterialsBtn')) $('refreshMaterialsBtn').onclick = () => refreshAll().then(() => toast('素材分析数据已刷新')).catch(err => toast(err.message));
  if ($('saveAnalysisViewBtn')) $('saveAnalysisViewBtn').onclick = saveMaterialAnalysisView;
  if ($('exportAnalysisReportBtn')) $('exportAnalysisReportBtn').onclick = exportMaterialReport;
  if ($('generateReviewPackageBtn')) $('generateReviewPackageBtn').onclick = () => generateMaterialArtifact('review_pack');
  if ($('materialDeepDiveReturnBtn')) $('materialDeepDiveReturnBtn').onclick = returnToMaterialCompareMatrix;
  if ($('materialDeepDiveSaveBtn')) $('materialDeepDiveSaveBtn').onclick = saveMaterialDeepDiveView;
}

function renderMaterialTopActions() {
  const actions = $('materialsTopActions');
  if (!actions) return;
  const isDeepDive = state.materialAnalysisType === 'compare'
    && state.materialAnalysisDepth === 'deep_dive'
    && materialDeepDiveDimension();
  actions.hidden = Boolean(isDeepDive);
  actions.innerHTML = isDeepDive ? '' : `
    <button id="refreshMaterialsBtn" type="button">刷新数据</button>
    <button id="saveAnalysisViewBtn" type="button">保存分析视图</button>
    <button id="exportAnalysisReportBtn" type="button">导出报告</button>
    <button id="generateReviewPackageBtn" type="button" class="primary">生成综述素材包</button>
  `;
  bindMaterialTopActions();
}

function renderMaterialResultChrome() {
  const isDeepDive = state.materialAnalysisType === 'compare'
    && state.materialAnalysisDepth === 'deep_dive'
    && materialDeepDiveDimension();
  const mainPane = document.querySelector('.materials-main-pane');
  const outputCard = document.querySelector('.materials-output-card');
  const heading = $('materialResultTitle')?.closest('.materials-section-heading');
  if (mainPane) mainPane.classList.toggle('deep-dive-main-pane', Boolean(isDeepDive));
  if (outputCard) outputCard.classList.toggle('deep-dive-output-card', Boolean(isDeepDive));
  if (heading) {
    heading.hidden = false;
    heading.classList.toggle('deep-dive-hidden-heading', Boolean(isDeepDive));
  }
  if ($('analysisOutput')) $('analysisOutput').classList.toggle('deep-dive-output', Boolean(isDeepDive));
}

function materialItemContent(item) {
  return item?.edited_content || item?.content || '';
}

function materialItemAccepted(item) {
  return reviewStatusGroup(item?.review_status || 'pending') === 'accepted';
}

function materialLooksNotReported(text) {
  return /not[_\s-]?reported|未报告|无直接|没有报告|未提及|not reported/i.test(String(text || ''));
}

function materialEvidenceLabel(item) {
  const ev = (item?.evidence || [])[0];
  if (!ev) return '-';
  const section = ev.section_title || ev.section || 'Evidence';
  const page = ev.page_start || ev.page || ev.page_number || '';
  return page ? `${section} p.${page}` : section;
}

function materialDimensionMatches(dim, pattern) {
  return pattern.test(`${dim.value || ''} ${dim.label || ''}`);
}

function materialItemsForPaperDimension(items, paperId, dimensionName) {
  return (items || []).filter(item => item.paper_id === paperId && item.dimension_name === dimensionName);
}

function materialPrimaryCellItem(items, paperId, dimensionName) {
  return materialItemsForPaperDimension(items, paperId, dimensionName)
    .sort((a, b) => Number(materialItemAccepted(b)) - Number(materialItemAccepted(a)) || Number(b.confidence || 0) - Number(a.confidence || 0))[0] || null;
}

function materialPaperHasDimensionSignal(items, paperId, pattern, predicate = () => true) {
  const dims = materialTemplateDimensions().filter(dim => materialDimensionMatches(dim, pattern)).map(dim => dim.value);
  return (items || []).some(item => item.paper_id === paperId && dims.includes(item.dimension_name) && predicate(item));
}

function materialOverviewStats(items) {
  const papers = materialScopedPapers();
  const acceptedItems = items.filter(materialItemAccepted);
  const evidenceCount = items.reduce((total, item) => total + (item.evidence || []).length, 0);
  const evidenceCoverage = items.length ? Math.round(items.filter(item => (item.evidence || []).length).length / items.length * 100) : 0;
  const objectInstanceCount = new Set(items.map(item => item.paper_id)).size;
  const effectPaperCount = papers.filter(paper => materialPaperHasDimensionSignal(items, paper.id, /(evaluation|effect|experiment|效果|验证|实验|评估)/i, item => {
    const text = materialItemContent(item);
    return materialItemAccepted(item) && !materialLooksNotReported(text);
  })).length;
  const ablationPaperCount = papers.filter(paper => (items || []).some(item =>
    item.paper_id === paper.id && /ablation|消融/i.test(`${materialItemContent(item)} ${(item.evidence || []).map(ev => ev.quote).join(' ')}`)
  )).length;
  const updateDims = materialTemplateDimensions().filter(dim => materialDimensionMatches(dim, /(update|refine|更新|迭代|修订)/i)).map(dim => dim.value);
  const updateMissingCount = updateDims.length
    ? papers.filter(paper => {
        const updateItems = items.filter(item => item.paper_id === paper.id && updateDims.includes(item.dimension_name));
        return !updateItems.length || updateItems.every(item => materialLooksNotReported(materialItemContent(item)));
      }).length
    : papers.filter(paper => !(items || []).some(item => item.paper_id === paper.id && /(update|refine|更新|迭代|修订)/i.test(materialItemContent(item)))).length;
  return [
    ['论文数', papers.length],
    ['对象实例', objectInstanceCount],
    ['已确认素材', acceptedItems.length],
    ['证据片段', evidenceCount],
    ['证据覆盖率', `${evidenceCoverage}%`],
    ['有效果验证论文', effectPaperCount],
    ['有消融实验论文', ablationPaperCount],
    ['未报告更新机制论文', updateMissingCount],
  ];
}

function materialDimensionCoverage(items) {
  const papers = materialScopedPapers();
  const total = Math.max(1, papers.length);
  return materialTemplateDimensions().map(dim => {
    const count = papers.filter(paper => materialItemsForPaperDimension(items, paper.id, dim.value).some(materialItemAccepted)).length;
    return {dimension: dim, rate: Math.round(count / total * 100), count};
  });
}

function filteredMaterialListItems(items) {
  const query = (state.materialListQuery || '').trim().toLowerCase();
  if (!query) return items;
  return items.filter(item => {
    const paper = paperById(item.paper_id);
    const text = [
      paper?.metadata?.title,
      item.dimension_label,
      item.dimension_name,
      item.title,
      materialItemContent(item),
      (item.evidence || []).map(ev => ev.quote).join(' '),
      (item.tags || []).join(' '),
    ].filter(Boolean).join(' ').toLowerCase();
    return text.includes(query);
  });
}

function renderMaterialOverview(items) {
  const template = materialCurrentTemplate();
  const paperSetLabel = $('materialPaperSetSelect')?.selectedOptions?.[0]?.textContent || '全部论文';
  const stats = materialOverviewStats(items);
  const coverage = materialDimensionCoverage(items);
  const listItems = filteredMaterialListItems(items).slice(0, 40);
  $('analysisOutput').classList.remove('muted');
  $('analysisOutput').innerHTML = `
    <section class="materials-overview-page">
      <header class="materials-view-heading">
        <div>
          <h3>素材总览</h3>
          <p>当前集合：${escapeHtml(paperSetLabel)} · 科研对象：${escapeHtml(template?.name || '未选择')}</p>
        </div>
      </header>
      <div class="materials-stat-grid">
        ${stats.map(([label, value]) => `<div><span>${escapeHtml(label)}</span><b>${escapeHtml(value)}</b></div>`).join('')}
      </div>
      <section class="materials-overview-section">
        <div class="materials-section-heading inline">
          <h3>维度覆盖率</h3>
          <span>${coverage.length} 个维度</span>
        </div>
        <div class="materials-coverage-bars">
          ${coverage.map(row => `
            <div class="materials-coverage-row">
              <span>${escapeHtml(row.dimension.label)}</span>
              <div><i style="width:${row.rate}%"></i></div>
              <b>${row.rate}%</b>
            </div>
          `).join('') || '<div class="materials-empty">暂无维度覆盖数据。</div>'}
        </div>
      </section>
      <section class="materials-overview-section">
        <div class="materials-table-head">
          <div>
            <h3>素材列表</h3>
            <p>下方显示当前范围内可检索素材。</p>
          </div>
          <input id="materialTableSearch" value="${escapeHtml(state.materialListQuery)}" placeholder="搜索素材" oninput="updateMaterialListQuery(this.value)" />
        </div>
        <div class="table-wrap materials-table-wrap">
          <table class="materials-table">
            <thead>
              <tr><th>论文</th><th>维度</th><th>抽取内容摘要</th><th>证据</th><th>审查状态</th><th>操作</th></tr>
            </thead>
            <tbody>
              ${listItems.map(item => {
                const paper = paperById(item.paper_id);
                return `<tr>
                  <td>${escapeHtml(fmt(paper?.metadata?.title || item.paper_id, 80))}</td>
                  <td>${escapeHtml(item.dimension_label || materialDimensionLabel(item.dimension_name))}</td>
                  <td>${escapeHtml(fmt(materialItemContent(item) || item.title || '无内容', 120))}</td>
                  <td>${escapeHtml(materialEvidenceLabel(item))}</td>
                  <td><span class="badge ${escapeHtml(item.review_status || 'pending')}">${escapeHtml(reviewStatusLabel(item.review_status || 'pending'))}</span></td>
                  <td><button type="button" onclick="openMaterialItemDetail(${escapeHtml(JSON.stringify(item.id))})">查看</button></td>
                </tr>`;
              }).join('') || '<tr><td colspan="6" class="muted">当前筛选条件下没有匹配素材。</td></tr>'}
            </tbody>
          </table>
        </div>
      </section>
    </section>
  `;
}

window.updateMaterialListQuery = function(value) {
  state.materialListQuery = value || '';
  renderMaterialOverview(state.materialCurrentItems?.length ? state.materialCurrentItems : filteredMaterialItems());
};

function renderMaterialResults(items) {
  const list = $('materialResults');
  if (!list) return;
  list.hidden = state.materialAnalysisDepth === 'deep_dive';
  if (list.hidden) {
    list.innerHTML = '';
    return;
  }
  if (['overview', 'compare'].includes(state.materialAnalysisType)) {
    list.innerHTML = '';
    return;
  }
  const shown = items.slice(0, 30);
  list.innerHTML = shown.map(item => {
    const paper = paperById(item.paper_id);
    const evidence = (item.evidence || []).slice(0, 2);
    return `<article class="materials-result-item">
      <h3>${escapeHtml(item.dimension_label || materialDimensionLabel(item.dimension_name))} · ${escapeHtml(fmt(item.title || paper?.metadata?.title || item.paper_id, 92))}
        <span class="badge ${escapeHtml(item.review_status || 'pending')}">${escapeHtml(reviewStatusLabel(item.review_status || 'pending'))}</span>
      </h3>
      <p>${escapeHtml(fmt(item.edited_content || item.content || '无内容', 520))}</p>
      ${evidence.map(ev => `<div class="evidence">${escapeHtml(fmt(ev.quote, 240))}</div>`).join('')}
      <div class="materials-result-meta">
        <span>${escapeHtml(fmt(paper?.metadata?.title || item.paper_id, 52))}</span>
        <span>${escapeHtml(String(paper?.metadata?.year || '未知年份'))}</span>
        <span>${escapeHtml(sourceLabel(paper?.source))}</span>
        <span>confidence ${escapeHtml(confidenceText(item.confidence))}</span>
      </div>
      ${(item.tags || []).length ? `<div class="materials-result-tags">${(item.tags || []).slice(0, 6).map(tag => `<span>${escapeHtml(tag)}</span>`).join('')}</div>` : ''}
    </article>`;
  }).join('') || '<div class="materials-empty">当前筛选条件下没有匹配素材。</div>';
  if (items.length > shown.length) {
    list.insertAdjacentHTML('beforeend', `<div class="materials-empty">已显示前 ${shown.length} 条，继续缩小筛选条件可查看更聚焦的结果。</div>`);
  }
}

function materialCompareDimensions() {
  const selected = new Set(selectedMaterialDimensions());
  return materialTemplateDimensions().filter(dim => !selected.size || selected.has(dim.value));
}

function materialPaperHasVerifiedEffect(items, paperId) {
  return materialPaperHasDimensionSignal(items, paperId, /(evaluation|effect|experiment|效果|验证|实验|评估)/i, item => {
    const text = materialItemContent(item);
    return materialItemAccepted(item) && !materialLooksNotReported(text);
  });
}

function materialUsageGroupLabel(items, paperId) {
  const usageDim = materialTemplateDimensions().find(dim => materialDimensionMatches(dim, /(usage|use|使用|应用|规划|决策)/i));
  if (!usageDim) return '使用方式未分类';
  const item = materialPrimaryCellItem(items, paperId, usageDim.value);
  const text = materialItemContent(item);
  if (/prompt/i.test(text) || /提示/.test(text)) return 'prompt / 上下文';
  if (/retriev|检索|memory|记忆/i.test(text)) return '检索增强';
  if (/planning|plan|规划/i.test(text)) return '规划决策';
  if (/action|selection|行动|选择/i.test(text)) return '行动选择';
  if (text) return '其他使用方式';
  return '使用方式未报告';
}

function materialSourceGroupLabel(paper) {
  return {
    arxiv: 'arXiv',
    acl: 'ACL',
    neurips: 'NeurIPS',
    iclr: 'ICLR',
    icml: 'ICML',
    other: '其他来源',
  }[paperSourceBucket(paper)] || '其他来源';
}

function materialCompareRows(items) {
  const selectedIds = selectedAnalysisPaperIds();
  const papers = selectedIds.length
    ? selectedIds.map(id => paperById(id)).filter(Boolean)
    : materialScopedPapers();
  const filtered = state.materialCompareOnlyUnverified
    ? papers.filter(paper => !materialPaperHasVerifiedEffect(items, paper.id))
    : papers;
  return filtered;
}

function materialCompareCellSummary(item) {
  if (!item) return '未报告';
  const text = materialItemContent(item);
  if (!text) return '未报告';
  return fmt(text, 96);
}

function renderMaterialCompareMatrixView(items) {
  state.materialAnalysisDepth = 'root';
  const template = materialCurrentTemplate();
  const dims = materialCompareDimensions();
  const rows = materialCompareRows(items);
  $('materialResultTitle').textContent = '跨论文对比矩阵';
  $('materialResultHint').textContent = `当前矩阵包含 ${rows.length} 篇论文、${dims.length} 个维度。`;
  if (state.materialDeepDiveDimension && !dims.some(dim => dim.value === state.materialDeepDiveDimension)) {
    state.materialDeepDiveDimension = null;
  }
  const selectedDiveDimension = state.materialDeepDiveDimension || '';
  const grouped = new Map();
  rows.forEach(paper => {
    const group = state.materialCompareGroupMode === 'source'
      ? materialSourceGroupLabel(paper)
      : state.materialCompareGroupMode === 'usage'
        ? materialUsageGroupLabel(items, paper.id)
        : '';
    if (!grouped.has(group)) grouped.set(group, []);
    grouped.get(group).push(paper);
  });
  const bodyRows = [...grouped.entries()].map(([group, papers]) => `
    ${group ? `<tr class="materials-matrix-group"><td colspan="${dims.length + 2}">${escapeHtml(group)} · ${papers.length} 篇</td></tr>` : ''}
    ${papers.map(paper => `
      <tr>
        <th>
          <span>${escapeHtml(fmt(paper.metadata?.title || paper.id, 92))}</span>
          <small>${escapeHtml(String(paper.metadata?.year || ''))}</small>
        </th>
        <td>${escapeHtml(sourceLabel(paper.source))}</td>
        ${dims.map(dim => {
          const item = materialPrimaryCellItem(items, paper.id, dim.value);
          const selected = dim.value === selectedDiveDimension;
          return `<td class="${selected ? 'selected-dimension' : ''}">
            <button type="button" class="materials-matrix-cell ${item ? '' : 'empty'}" onclick="openMaterialCellDetail(${escapeHtml(JSON.stringify(paper.id))}, ${escapeHtml(JSON.stringify(dim.value))})">
              ${escapeHtml(materialCompareCellSummary(item))}
            </button>
          </td>`;
        }).join('')}
      </tr>
    `).join('')}
  `).join('');
  $('analysisOutput').classList.remove('muted');
  const list = $('materialResults');
  if (list) list.hidden = false;
  $('analysisOutput').innerHTML = `
    <section class="materials-matrix-page">
      <header class="materials-view-heading">
        <div>
          <h3>跨论文对比矩阵：${escapeHtml(template?.name || '研究对象')}</h3>
          <p>行是论文，列是抽取维度，单元格显示审查后的维度结果摘要。</p>
        </div>
        <div class="materials-matrix-actions">
          <button type="button" class="${state.materialCompareGroupMode === 'source' ? 'active' : ''}" onclick="setMaterialCompareGroupMode('source')">按来源分组</button>
          <button type="button" class="${state.materialCompareGroupMode === 'usage' ? 'active' : ''}" onclick="setMaterialCompareGroupMode('usage')">按使用方式分组</button>
          <button type="button" class="${state.materialCompareOnlyUnverified ? 'active' : ''}" onclick="toggleMaterialCompareUnverified()">只看未验证效果</button>
          <button type="button" ${selectedDiveDimension ? '' : 'disabled'} onclick="openMaterialDimensionDeepDive()">维度深挖</button>
          <button type="button" onclick="exportMaterialCompareMatrix()">导出矩阵</button>
        </div>
      </header>
      <div class="table-wrap materials-matrix-wrap">
        <table class="materials-matrix-table">
          <thead>
            <tr>
              <th>论文</th>
              <th>来源</th>
              ${dims.map(dim => `<th class="${dim.value === selectedDiveDimension ? 'selected-dimension' : ''}">
                <button type="button" class="materials-matrix-dim-head ${dim.value === selectedDiveDimension ? 'selected' : ''}" onclick="selectMaterialDeepDiveDimension(${escapeHtml(JSON.stringify(dim.value))})">
                  ${escapeHtml(dim.label)}
                </button>
              </th>`).join('')}
            </tr>
          </thead>
          <tbody>${bodyRows || `<tr><td colspan="${dims.length + 2}" class="muted">当前范围下没有可对比论文。</td></tr>`}</tbody>
        </table>
      </div>
    </section>
  `;
  renderMaterialsBreadcrumb();
  renderMaterialScopePanel();
  renderMaterialTopActions();
  renderMaterialResultChrome();
  renderMaterialAnalysisNav();
  renderMaterialInsights(items);
  renderMaterialExplanations(items);
}

function renderMaterialCompareView(items) {
  const dim = materialDeepDiveDimension();
  if (state.materialAnalysisDepth === 'deep_dive' && dim) {
    renderMaterialDeepDivePage(dim, items);
    return;
  }
  renderMaterialCompareMatrixView(items);
}

window.selectMaterialDeepDiveDimension = function(dimensionName) {
  state.materialDeepDiveDimension = state.materialDeepDiveDimension === dimensionName ? null : dimensionName;
  state.materialDeepDiveAxis = '';
  state.materialDeepDiveView = 'overview_stats';
  renderMaterialCompareMatrixView(state.materialCurrentItems?.length ? state.materialCurrentItems : filteredMaterialItems());
};

window.setMaterialCompareGroupMode = function(mode) {
  state.materialCompareGroupMode = state.materialCompareGroupMode === mode ? 'none' : mode;
  renderMaterialCompareMatrixView(state.materialCurrentItems?.length ? state.materialCurrentItems : filteredMaterialItems());
};

window.toggleMaterialCompareUnverified = function() {
  state.materialCompareOnlyUnverified = !state.materialCompareOnlyUnverified;
  renderMaterialCompareMatrixView(state.materialCurrentItems?.length ? state.materialCurrentItems : filteredMaterialItems());
};

window.exportMaterialCompareMatrix = function() {
  const items = state.materialCurrentItems?.length ? state.materialCurrentItems : filteredMaterialItems();
  const dims = materialCompareDimensions();
  const rows = materialCompareRows(items).map(paper => {
    const row = {paper_id: paper.id, title: paper.metadata?.title || paper.id, year: paper.metadata?.year || '', source: sourceLabel(paper.source)};
    dims.forEach(dim => {
      row[dim.label] = materialCompareCellSummary(materialPrimaryCellItem(items, paper.id, dim.value));
    });
    return row;
  });
  downloadJson(`litmate_compare_matrix_${new Date().toISOString().slice(0, 10)}.json`, {exported_at: new Date().toISOString(), rows});
};

function materialDeepDiveDimension() {
  return materialCompareDimensions().find(dim => dim.value === state.materialDeepDiveDimension) || null;
}

function materialDeepDiveEntries(items, dimensionName) {
  return materialCompareRows(items).map(paper => {
    const item = materialPrimaryCellItem(items, paper.id, dimensionName);
    const content = materialItemContent(item);
    const notReported = !item || !content || materialLooksNotReported(content);
    return {paper, item, content, notReported};
  });
}

function materialDeepDivePercent(count, total) {
  if (!total) return '0%';
  return `${Math.round(count / total * 100)}%`;
}

function materialDeepDiveType(dim) {
  const text = `${dim?.value || ''} ${dim?.label || ''} ${dim?.question || ''} ${(dim?.description || '')}`.toLowerCase();
  const matches = pattern => pattern.test(text);
  if (matches(/limitation|risk|failure|fail|applicable|condition|scope|局限|失败|风险|适用边界|适用条件|边界条件/)) return '局限类维度';
  if (matches(/evidence|claim|support|validation|verify|proof|case evidence|支撑|证据|实验验证|理论证明|案例证据|验证方式/)) return '证据类维度';
  if (matches(/effect|evaluation|experiment result|performance|improvement|ablation|metric|score|效果|实验结果|性能|提升|消融|指标|评估结果/)) return '效果类维度';
  if (matches(/reusable|material|citation|inspiration|review material|literature review|可复用|综述素材|引用点|研究启发|素材/)) return '素材类维度';
  if (matches(/mechanism|usage|use|retrieval|attention|update|trigger|interaction|机制|使用方式|检索机制|注意力机制|更新机制|触发条件|调用方式/)) return '机制类维度';
  if (matches(/process|procedure|pipeline|workflow|step|training|construction|extraction|流程|步骤|过程|训练流程|数据构造|抽取流程|方法步骤/)) return '过程类维度';
  if (matches(/structure|architecture|organization|module|component|schema|representation|storage|memory organization|data structure|结构|架构|组织方式|模块|组成|数据结构|表示|存储/)) return '结构类维度';
  if (matches(/definition|concept|boundary|identity|what is|local term|定义|概念边界|任务定义|经验定义|记忆定义|对象存在|术语/)) return '定义类维度';
  return '素材类维度';
}

function materialDeepDiveClusterRules(type) {
  const common = [
    {name: '未报告或表述不足', pattern: /not[_\s-]?reported|未报告|未提及|没有|无直接|缺少/i, description: '论文没有给出该维度的明确结果，或只能从上下文间接判断。'},
    {name: '其他模式', pattern: /.*/i, description: '当前结果暂未落入高频模式，可作为人工复核和再命名候选。'},
  ];
  const rules = {
    '定义类维度': [
      {name: '显式定义', pattern: /define|definition|concept|称为|定义为|是指|概念/i, description: '论文直接给出对象或概念定义，适合抽取标准定义句。'},
      {name: '操作性定义', pattern: /operational|implement|use as|通过.*表示|以.*形式|构造为/i, description: '定义体现在系统实现、输入输出或操作方式中。'},
      {name: '边界型定义', pattern: /boundary|scope|distinguish|区别|边界|不包括|排除/i, description: '重点说明对象与相邻概念的边界或排除规则。'},
      {name: '术语替代', pattern: /term|called|named|术语|称作|命名|别称/i, description: '论文使用了本地术语或别名，需要统一映射。'},
    ],
    '结构类维度': [
      {name: '层级组织', pattern: /hierarchy|tree|level|layer|层级|树|分层/i, description: '结构以层级、树或多层模块组织。'},
      {name: '模块组成', pattern: /module|component|block|模块|组件|组成|子模块/i, description: '重点是系统或方法由哪些模块组成。'},
      {name: '数据结构', pattern: /schema|graph|table|vector|embedding|memory|数据结构|图|表|向量|嵌入|记忆/i, description: '重点是素材、记忆或中间结果的结构化表示。'},
      {name: '连接关系', pattern: /connect|link|relation|dependency|连接|关系|依赖|交互/i, description: '强调结构单元之间的关系、连接或依赖。'},
    ],
    '过程类维度': [
      {name: '阶段流程', pattern: /stage|phase|pipeline|workflow|阶段|流程|管线/i, description: '结果按阶段、流程或管线展开。'},
      {name: '步骤序列', pattern: /step|procedure|algorithm|步骤|过程|算法/i, description: '结果以可执行步骤或顺序动作呈现。'},
      {name: '训练/构造流程', pattern: /train|training|construct|build|generate|训练|构造|生成|数据构造/i, description: '重点是训练、构造、生成或数据制作过程。'},
      {name: '抽取/筛选流程', pattern: /extract|filter|retrieve|select|抽取|筛选|检索|选择/i, description: '重点是从原始材料到目标素材的抽取或筛选过程。'},
    ],
    '机制类维度': [
      {name: '检索调用机制', pattern: /retriev|search|query|lookup|检索|搜索|查询|调用/i, description: '机制依赖检索、查询或调用外部/内部记忆。'},
      {name: '更新机制', pattern: /update|refresh|revise|learn|更新|刷新|修订|学习/i, description: '重点是状态、记忆或策略如何更新。'},
      {name: '注意力/选择机制', pattern: /attention|select|rank|weight|注意力|选择|排序|权重/i, description: '机制通过注意力、排序或选择控制信息流。'},
      {name: '触发与反馈机制', pattern: /trigger|feedback|condition|signal|触发|反馈|条件|信号/i, description: '机制由特定条件、反馈或信号触发。'},
    ],
    '效果类维度': [
      {name: '性能提升', pattern: /improv|boost|accuracy|score|performance|性能|提升|准确率|分数/i, description: '核心证据是任务分数或质量指标提升。'},
      {name: '效率优化', pattern: /efficient|speed|latency|cost|token|效率|速度|成本|开销|延迟/i, description: '强调推理、训练、检索或标注成本的优化。'},
      {name: '泛化增强', pattern: /generaliz|transfer|robust|cross|泛化|迁移|鲁棒|跨任务/i, description: '结果主张在新任务、新领域或跨模型环境中保持有效。'},
      {name: '消融贡献', pattern: /ablation|without|baseline|component|消融|去除|baseline|组件贡献/i, description: '通过消融或对照解释某组件的贡献。'},
    ],
    '证据类维度': [
      {name: '实验验证', pattern: /experiment|metric|benchmark|实验|指标|基准/i, description: '证据来自实验、指标或 benchmark。'},
      {name: '理论证明', pattern: /proof|theorem|analysis|理论|证明|推导/i, description: '证据来自理论推导、证明或形式化分析。'},
      {name: '案例证据', pattern: /case|example|study|案例|示例|个案/i, description: '证据来自案例、示例或 case study。'},
      {name: 'claim 支撑', pattern: /claim|support|argue|主张|支撑|论证/i, description: '证据用于支撑论文的主张或结论。'},
    ],
    '局限类维度': [
      {name: '数据依赖', pattern: /data|dataset|sample|annotation|数据|样本|标注/i, description: '局限主要来自数据质量、覆盖范围或标注成本。'},
      {name: '泛化不足', pattern: /generaliz|transfer|domain|泛化|迁移|领域/i, description: '方法可能难以迁移到新领域、新任务或新模型。'},
      {name: '失败场景', pattern: /failure|error|noise|hallucination|失败|错误|噪声|幻觉/i, description: '说明方法在什么场景下容易失败。'},
      {name: '适用边界', pattern: /scope|condition|boundary|assumption|适用|边界|条件|假设/i, description: '限制来自适用条件、前提假设或场景边界。'},
    ],
    '素材类维度': [
      {name: '综述素材', pattern: /survey|review|related work|综述|相关工作|背景/i, description: '适合转化为综述段落、背景脉络或研究谱系。'},
      {name: '引用点', pattern: /citation|cite|quote|claim|引用|观点|论据/i, description: '适合提炼为论文引用点或观点-证据对。'},
      {name: '方法设计素材', pattern: /design|method|framework|pipeline|方法|方案|框架|流程/i, description: '可复用于后续方法设计、方案构思或系统搭建。'},
      {name: '研究启发', pattern: /future|inspiration|insight|idea|启发|未来|问题|机会/i, description: '可转化为研究问题、未来方向或方案灵感。'},
    ],
  };
  return [...(rules[type] || []), ...common];
}

function materialDeepDiveClusterEntries(entries, type) {
  const rules = materialDeepDiveClusterRules(type);
  const clusters = new Map();
  entries.forEach(entry => {
    const text = `${entry.content || ''} ${entry.paper?.metadata?.title || ''}`;
    const rule = entry.notReported
      ? rules.find(item => item.name === '未报告或表述不足')
      : (rules.find(item => item.pattern.test(text)) || rules[rules.length - 1]);
    if (!clusters.has(rule.name)) clusters.set(rule.name, {...rule, entries: []});
    clusters.get(rule.name).entries.push(entry);
  });
  return [...clusters.values()].sort((a, b) => b.entries.length - a.entries.length);
}

function materialDeepDiveClusterCacheKey(dim, entries) {
  const ids = entries.map(entry => `${entry.item?.id || entry.paper?.id || ''}:${entry.notReported ? '0' : '1'}`).join('|');
  return `${dim?.value || ''}::${ids}`;
}

function materialDeepDiveEntryPaperIndex(entry, entries) {
  const seen = [];
  entries.forEach(item => {
    const id = item.paper?.id || item.item?.paper_id;
    if (id && !seen.includes(id)) seen.push(id);
  });
  const id = entry.paper?.id || entry.item?.paper_id;
  const index = seen.indexOf(id);
  return index >= 0 ? index + 1 : null;
}

function materialSemanticClusterEntriesPayload(entries) {
  return entries.map(entry => ({
    paper_id: entry.paper?.id || entry.item?.paper_id || '',
    material_id: entry.item?.id || '',
    paper_index: materialDeepDiveEntryPaperIndex(entry, entries),
    paper_title: entry.paper?.metadata?.title || entry.paper?.id || '',
    content: entry.content || materialItemContent(entry.item) || '',
    evidence_quotes: (entry.item?.evidence || []).slice(0, 3).map(ev => ev.quote || '').filter(Boolean),
    not_reported: Boolean(entry.notReported),
  }));
}

function materialLocalSemanticClusters(ctx) {
  return ctx.clusters.map((cluster, index) => ({
    id: `local_${index + 1}`,
    name: cluster.name,
    description: cluster.description,
    keywords: materialClusterKeywords(cluster.entries).slice(0, 3),
    paper_ids: cluster.entries.map(entry => entry.paper?.id || entry.item?.paper_id).filter(Boolean),
    paper_indices: cluster.entries.map(entry => materialDeepDiveEntryPaperIndex(entry, ctx.entries)).filter(Boolean).sort((a, b) => a - b),
    material_ids: cluster.entries.map(entry => entry.item?.id).filter(Boolean),
    entry_count: cluster.entries.length,
    confidence: 0.6,
  }));
}

function materialSemanticClustersForContext(ctx) {
  const key = materialDeepDiveClusterCacheKey(ctx.dim, ctx.entries);
  const cached = state.materialSemanticClusters[key];
  const clusters = cached?.clusters || materialLocalSemanticClusters(ctx);
  return materialApplySemanticClusterAdjustments(key, clusters);
}

function materialClusterKeywords(entries) {
  const stop = new Set(['the','and','for','with','that','this','from','into','paper','method','model','agent','agents','task','任务','论文','方法','模型','经验','定义','用于','通过']);
  const counts = new Map();
  entries.forEach(entry => {
    const text = `${entry.content || ''} ${(entry.item?.evidence || []).map(ev => ev.quote || '').join(' ')}`.toLowerCase();
    (text.match(/[a-z][a-z0-9_-]{2,}|[\u4e00-\u9fff]{2,}/g) || []).forEach(token => {
      if (!stop.has(token) && token.length <= 24) counts.set(token, (counts.get(token) || 0) + 1);
    });
  });
  return [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 3).map(([token]) => token);
}

function materialApplySemanticClusterAdjustments(key, clusters) {
  const renames = state.materialSemanticClusterRenames[key] || {};
  const selected = new Set(state.materialSemanticClusterMergeSelection || []);
  const adjusted = clusters.map(cluster => ({
    ...cluster,
    name: renames[cluster.id] || cluster.name,
    selected: selected.has(cluster.id),
  }));
  const mergeIds = [...selected];
  if (mergeIds.length < 2) return adjusted;
  const mergeSet = new Set(mergeIds);
  const picked = adjusted.filter(cluster => mergeSet.has(cluster.id));
  const merged = {
    id: `merged_${mergeIds.join('_')}`,
    name: picked.map(cluster => cluster.name).join(' / '),
    description: `人工合并 ${picked.length} 个语义相近类别，用于统一综述口径。`,
    keywords: [...new Set(picked.flatMap(cluster => cluster.keywords || []))].slice(0, 3),
    paper_ids: [...new Set(picked.flatMap(cluster => cluster.paper_ids || []))],
    paper_indices: [...new Set(picked.flatMap(cluster => cluster.paper_indices || []))].sort((a, b) => a - b),
    material_ids: [...new Set(picked.flatMap(cluster => cluster.material_ids || []))],
    entry_count: picked.reduce((sum, cluster) => sum + Number(cluster.entry_count || 0), 0),
    confidence: Math.max(...picked.map(cluster => Number(cluster.confidence || 0.6))),
    selected: true,
    merged_from: mergeIds,
  };
  return [merged, ...adjusted.filter(cluster => !mergeSet.has(cluster.id))];
}

async function refreshMaterialSemanticClusters(ctx, options = {}) {
  const key = materialDeepDiveClusterCacheKey(ctx.dim, ctx.entries);
  if (!options.force && state.materialSemanticClusters[key]) return state.materialSemanticClusters[key];
  state.materialSemanticClusters[key] = {loading: true, clusters: materialLocalSemanticClusters(ctx)};
  const payload = {
    dimension_name: ctx.dim.value,
    dimension_label: ctx.dimLabel,
    dimension_type: ctx.type,
    entries: materialSemanticClusterEntriesPayload(ctx.entries),
  };
  try {
    const result = await api('/api/analysis/semantic-clusters', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(payload),
    });
    state.materialSemanticClusters[key] = {...result, loading: false};
  } catch (err) {
    state.materialSemanticClusters[key] = {loading: false, error: err.message, clusters: materialLocalSemanticClusters(ctx)};
    toast(`语义聚类接口不可用，已使用本地聚类：${err.message}`);
  }
  return state.materialSemanticClusters[key];
}

function materialDeepDiveRecommendedAxes(type) {
  const axes = {
    '定义类维度': ['按定义方式分类', '按概念边界分类', '按本地术语分类', '按作者明确性分类', '按证据强度分类'],
    '结构类维度': ['按组成层级分类', '按组织方式分类', '按数据结构分类', '按存储位置分类', '按模块职责分类'],
    '过程类维度': ['按流程阶段分类', '按输入输出分类', '按自动化程度分类', '按训练/运行阶段分类', '按数据构造方式分类'],
    '机制类维度': ['按作用阶段分类', '按触发条件分类', '按信息流分类', '按更新方式分类', '按检索/调用方式分类'],
    '效果类维度': ['按指标分类', '按 baseline 分类', '按效果类型分类', '按 trade-off 分类', '按消融因素分类'],
    '证据类维度': ['按证据类型分类', '按证据强度分类', '按验证方式分类', '按 claim 支撑关系分类', '按案例来源分类'],
    '局限类维度': ['按风险来源分类', '按失败场景分类', '按适用边界分类', '按影响范围分类', '按可修复性分类'],
    '素材类维度': ['按素材用途分类', '按综述位置分类', '按引用价值分类', '按研究启发分类', '按复用方式分类'],
  };
  return axes[type] || axes['素材类维度'];
}

function materialDeepDiveAxisLabel(entry, axis, type) {
  const text = `${entry.content || ''} ${entry.paper?.metadata?.title || ''}`;
  if (entry.notReported) return '未报告';
  if (/定义对象类型/.test(axis)) {
    if (/experience|lesson|经验|教训|策略/i.test(text)) return '经验/教训对象';
    if (/memory|case library|记忆|案例库/i.test(text)) return '记忆对象';
    if (/task|goal|任务|目标/i.test(text)) return '任务对象';
    if (/concept|term|概念|术语/i.test(text)) return '概念对象';
    return '对象类型未明确';
  }
  if (/定义来源/.test(axis)) {
    if (itemModelInferred(entry.item)) return '模型归纳定义';
    if ((entry.item?.evidence || []).length) return '作者原文定义';
    return '来源未绑定证据';
  }
  if (/定义证据来源/.test(axis)) {
    const evidence = entry.item?.evidence || [];
    if (!evidence.length) return '无原文证据';
    const first = evidence[0]?.section_title || evidence[0]?.section || '';
    if (/abstract|introduction|intro|摘要|引言/i.test(first)) return '摘要/引言证据';
    if (/method|approach|方法|系统|框架/i.test(first)) return '方法章节证据';
    if (/experiment|evaluation|实验|评估/i.test(first)) return '实验章节证据';
    return '其他章节证据';
  }
  if (/定义完整性/.test(axis)) {
    const parts = [
      /define|definition|定义|是指|称为/i.test(text),
      /use|function|purpose|用于|功能|作用/i.test(text),
      /boundary|scope|区别|边界|不包括/i.test(text),
      (entry.item?.evidence || []).length > 0,
    ].filter(Boolean).length;
    if (parts >= 3) return '完整定义';
    if (parts >= 2) return '部分完整';
    return '定义要素不足';
  }
  if (/相邻概念关系/.test(axis)) {
    if (/boundary|scope|distinguish|区别|边界|不包括|排除/i.test(text)) return '边界区分关系';
    if (/similar|related|analog|相似|相关|类似/i.test(text)) return '相似/相关关系';
    if (/include|part of|component|包含|组成|属于/i.test(text)) return '包含/组成关系';
    return '关系未明确';
  }
  if (/证据强度/.test(axis)) return {strong: '强证据', medium: '中等证据', weak: '弱证据'}[materialEvidenceStrength(entry.item)] || '未知证据';
  if (/年份/.test(axis)) return String(entry.paper?.metadata?.year || '未知年份');
  if (/来源/.test(axis)) return materialSourceGroupLabel(entry.paper);
  if (/作者明确性/.test(axis)) return itemModelInferred(entry.item) ? '模型推断' : '作者明确表述';
  if (/定义方式|概念边界|本地术语/.test(axis)) {
    if (/boundary|scope|distinguish|区别|边界|不包括|排除/i.test(text)) return '边界/排除式定义';
    if (/operational|implement|通过|以.*形式|构造为/i.test(text)) return '操作性定义';
    if (/called|named|term|称为|命名|术语/i.test(text)) return '本地术语定义';
    return '直接概念定义';
  }
  if (/组成层级|组织方式|模块职责|数据结构|存储位置/.test(axis)) {
    if (/hierarchy|tree|level|layer|层级|分层|树/i.test(text)) return '层级组织';
    if (/graph|table|schema|vector|embedding|图|表|向量|嵌入|数据结构/i.test(text)) return '结构化数据表示';
    if (/store|memory|cache|database|存储|记忆|缓存|数据库/i.test(text)) return '存储/记忆结构';
    if (/module|component|block|模块|组件|单元/i.test(text)) return '模块组成';
    return '结构关系未细分';
  }
  if (/作用阶段|训练\/运行阶段/.test(axis)) {
    if (/pre|before|offline|train|training|预处理|离线|训练/i.test(text)) return '训练/离线阶段';
    if (/during|runtime|online|inference|运行|在线|推理/i.test(text)) return '运行/推理阶段';
    if (/after|post|feedback|evaluation|反馈|评估|后处理/i.test(text)) return '反馈/后处理阶段';
    return '阶段未明确';
  }
  if (/触发条件/.test(axis)) {
    if (/error|failure|uncertain|错误|失败|不确定/i.test(text)) return '错误或不确定性触发';
    if (/user|human|feedback|用户|人工|反馈/i.test(text)) return '用户/人工反馈触发';
    if (/threshold|score|metric|阈值|分数|指标/i.test(text)) return '阈值/指标触发';
    return '常规流程触发';
  }
  if (/信息流/.test(axis)) {
    if (/retrieve|memory|context|检索|记忆|上下文/i.test(text)) return '记忆/上下文注入';
    if (/attention|weight|select|注意力|权重|选择/i.test(text)) return '加权选择';
    if (/feedback|update|反馈|更新/i.test(text)) return '反馈更新闭环';
    return '线性信息流';
  }
  if (/更新方式/.test(axis)) {
    if (/online|continual|dynamic|实时|在线|持续/i.test(text)) return '在线持续更新';
    if (/batch|offline|periodic|批量|离线|周期/i.test(text)) return '离线批量更新';
    if (/manual|human|人工/i.test(text)) return '人工更新';
    return '更新方式未明确';
  }
  if (/检索\/调用方式/.test(axis)) {
    if (/semantic|embedding|vector|语义|嵌入|向量/i.test(text)) return '语义检索';
    if (/keyword|term|关键词|术语/i.test(text)) return '关键词检索';
    if (/tool|api|function|工具|接口|函数/i.test(text)) return '工具/API 调用';
    return '直接上下文调用';
  }
  if (/证据类型|验证方式/.test(axis)) {
    if (/experiment|benchmark|metric|实验|基准|指标/i.test(text)) return '实验/指标证据';
    if (/proof|theorem|theory|理论|证明|推导/i.test(text)) return '理论证明';
    if (/case|example|study|案例|示例/i.test(text)) return '案例证据';
    if (/quote|section|原文|引用/i.test(text)) return '原文引用证据';
    return '证据类型未明确';
  }
  if (/claim 支撑关系/.test(axis)) {
    if (/direct|explicit|直接|明确/i.test(text)) return '直接支撑 claim';
    if (/indirect|suggest|间接|暗示/i.test(text)) return '间接支撑 claim';
    if (/contradict|conflict|反例|冲突/i.test(text)) return '冲突/反例';
    return '支撑关系待复核';
  }
  if (/案例来源/.test(axis)) {
    if (/benchmark|dataset|数据集|基准/i.test(text)) return '基准/数据集案例';
    if (/user|real|deployment|用户|真实|部署/i.test(text)) return '真实场景案例';
    if (/synthetic|simulat|合成|模拟/i.test(text)) return '合成/模拟案例';
    return '论文内部案例';
  }
  if (/风险来源|失败场景|适用边界|影响范围|可修复性/.test(axis)) {
    if (/data|dataset|sample|annotation|数据|样本|标注/i.test(text)) return '数据/样本限制';
    if (/domain|transfer|generaliz|领域|迁移|泛化/i.test(text)) return '领域泛化限制';
    if (/cost|compute|latency|token|成本|算力|延迟/i.test(text)) return '成本/规模限制';
    if (/error|noise|hallucination|错误|噪声|幻觉/i.test(text)) return '错误传播风险';
    if (/fix|mitigat|future|可修复|缓解|未来/i.test(text)) return '可缓解问题';
    return '适用边界未细分';
  }
  if (/素材用途|综述位置|引用价值|研究启发|复用方式/.test(axis)) {
    if (/survey|review|background|综述|背景|相关工作/i.test(text)) return '综述背景素材';
    if (/citation|claim|quote|引用|观点|论据/i.test(text)) return '引用论据素材';
    if (/method|design|framework|方法|方案|框架/i.test(text)) return '方法设计素材';
    if (/future|idea|question|启发|问题|未来/i.test(text)) return '研究启发素材';
    return '通用复用素材';
  }
  if (/任务类型/.test(axis)) {
    if (/math|reason|数学|推理/i.test(text)) return '数学/推理任务';
    if (/agent|planning|tool|智能体|规划|工具/i.test(text)) return '智能体任务';
    if (/chem|protein|bio|medical|化学|蛋白|生物|医疗/i.test(text)) return '科学发现任务';
    return '通用任务';
  }
  if (/流程阶段/.test(axis)) {
    if (/pre|before|offline|预处理|离线/i.test(text)) return '前处理阶段';
    if (/during|runtime|online|运行|在线/i.test(text)) return '运行阶段';
    if (/after|post|feedback|反思|反馈/i.test(text)) return '后处理阶段';
    return '阶段未明确';
  }
  if (/输入输出/.test(axis)) {
    if (/trajectory|trace|轨迹/i.test(text)) return '轨迹输入';
    if (/memory|library|经验库|记忆/i.test(text)) return '记忆/库输出';
    if (/rule|policy|策略|规则/i.test(text)) return '规则/策略输出';
    return '输入输出未明确';
  }
  if (/自动化/.test(axis)) {
    if (/manual|human|人工/i.test(text)) return '人工参与';
    if (/semi|human-in-the-loop|半自动/i.test(text)) return '半自动';
    if (/automatic|agent|自动|智能体/i.test(text)) return '自动化';
    return '自动化程度未明确';
  }
  if (/baseline/i.test(axis)) {
    if (/without|ablation|baseline|对比|消融/i.test(text)) return '有 baseline / 消融';
    return 'baseline 未明确';
  }
  if (/trade.?off|trade-off|权衡/i.test(axis)) {
    if (/cost|overhead|latency|成本|开销|延迟/i.test(text)) return '报告成本权衡';
    return '未报告成本权衡';
  }
  if (/粒度/.test(axis)) {
    if (/system|framework|系统|框架/i.test(text)) return '系统/框架级';
    if (/module|component|模块|组件/i.test(text)) return '模块级';
    if (/step|operation|步骤|操作/i.test(text)) return '步骤级';
    if (/rule|policy|规则|策略/i.test(text)) return '规则级';
    return '粒度未明确';
  }
  if (/功能|效果类型|定义方式/.test(axis)) {
    const cluster = materialDeepDiveClusterEntries([entry], type)[0];
    return cluster?.name || '未分类';
  }
  return '其他分类';
}

function materialDeepDiveGroupByAxis(entries, axis, type) {
  const groups = new Map();
  entries.forEach(entry => {
    const label = materialDeepDiveAxisLabel(entry, axis, type);
    if (!groups.has(label)) groups.set(label, []);
    groups.get(label).push(entry);
  });
  return [...groups.entries()].sort((a, b) => b[1].length - a[1].length);
}

function materialDeepDiveCaseList(entries, dimensionName, limit = 3) {
  return entries.slice(0, limit).map(entry => `
    <li>
      <button type="button" onclick="openMaterialCellDetail(${escapeHtml(JSON.stringify(entry.paper.id))}, ${escapeHtml(JSON.stringify(dimensionName))})">
        ${escapeHtml(fmt(entry.paper.metadata?.title || entry.paper.id, 76))}
      </button>
    </li>
  `).join('') || '<li class="muted">暂无代表论文。</li>';
}

function materialDeepDiveEvidenceSections(entries) {
  const counts = new Map();
  entries.forEach(entry => (entry.item?.evidence || []).forEach(ev => {
    const section = ev.section_title || ev.section || '未标注章节';
    counts.set(section, (counts.get(section) || 0) + 1);
  }));
  return [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5);
}

function renderMaterialDimensionDeepDive(dim, items) {
  const type = materialDeepDiveType(dim);
  const entries = materialDeepDiveEntries(items, dim.value);
  const resultEntries = entries.filter(entry => entry.item);
  const validEntries = entries.filter(entry => !entry.notReported);
  const notReportedCount = entries.filter(entry => entry.notReported).length;
  const evidenceEntries = resultEntries.filter(entry => (entry.item?.evidence || []).length);
  const confirmedEntries = resultEntries.filter(entry => materialItemAccepted(entry.item));
  const inferredEntries = resultEntries.filter(entry => itemModelInferred(entry.item));
  const clusters = materialDeepDiveClusterEntries(entries, type);
  const axes = materialDeepDiveRecommendedAxes(type);
  const axis = state.materialDeepDiveAxis || axes[0] || '按定义方式分类';
  state.materialDeepDiveAxis = axis;
  const axisGroups = materialDeepDiveGroupByAxis(entries, axis, type);
  const weakEntries = resultEntries.filter(entry => materialEvidenceStrength(entry.item) === 'weak' || !(entry.item?.evidence || []).length);
  const evidenceSections = materialDeepDiveEvidenceSections(entries);
  const topClusters = clusters.filter(cluster => cluster.name !== '未报告或表述不足' && cluster.entries.some(entry => !entry.notReported));
  const leadCluster = topClusters[0] || clusters[0];
  const dimLabel = dim.label || dim.value;
  const anomalyTemplates = {
    '定义类维度': ['部分论文没有显式定义该对象。', '概念边界、术语别名和操作性定义可能混在一起。', '需要区分作者明确表述与模型归纳。'],
    '结构类维度': ['结构层级、模块职责和数据结构可能没有分开报告。', '部分结果只描述组件名，缺少连接关系。', '存储位置和组织方式需要进一步核验。'],
    '过程类维度': ['流程步骤可能缺少执行顺序或输入输出。', '训练、构造、抽取和运行阶段容易混在一起。', '部分论文没有给出可复现的过程细节。'],
    '机制类维度': ['机制描述可能停留在功能层，没有说明触发条件。', '信息流、检索调用和更新方式需要拆开核验。', '部分机制缺少失败或边界条件。'],
    '效果类维度': ['多数论文需要区分性能提升、效率优化和消融贡献。', '只报告效果提升时，需要补充成本或 trade-off。', '跨任务泛化和鲁棒性证据可能不足。'],
    '证据类维度': ['claim 与证据的支撑关系需要逐条核验。', '实验验证、理论证明和案例证据应分开统计。', '弱证据或间接证据可能被过度使用。'],
    '局限类维度': ['局限常停留在笼统表述。', '风险来源、失败场景和适用边界需要拆开。', '缺少可验证的失败条件或缓解方式。'],
    '素材类维度': ['需要区分综述素材、引用点、方法设计素材和研究启发。', '部分素材可复用价值不明确。', '引用价值和原文证据位置需要复核。'],
  };
  const anomalies = [
    ...(anomalyTemplates[type] || ['该维度存在跨论文表述不一致。', '部分结果依赖模型推断。', '证据位置和结论支撑关系需要复核。']),
    notReportedCount ? `${notReportedCount} 篇论文在该维度上表现为未报告或弱报告。` : '',
    weakEntries.length ? `${weakEntries.length} 条结果只有弱证据或没有证据。` : '',
  ].filter(Boolean);
  const clusterSentence = leadCluster ? `${dimLabel} 在当前论文中主要呈现为“${leadCluster.name}”，涉及 ${leadCluster.entries.length} 篇论文。` : `${dimLabel} 暂未形成明显主类。`;
  return `
    <section class="deep-dive-section">
      <h3>1. 维度总览</h3>
      <div class="deep-dive-stat-grid">
        ${[
          ['维度名称', dimLabel],
          ['维度类型', type],
          ['涉及论文数', entries.length],
          ['有效结果数', validEntries.length],
          ['not_reported 数', notReportedCount],
          ['证据覆盖率', materialDeepDivePercent(evidenceEntries.length, resultEntries.length)],
          ['人工确认率', materialDeepDivePercent(confirmedEntries.length, resultEntries.length)],
          ['模型推断率', materialDeepDivePercent(inferredEntries.length, resultEntries.length)],
        ].map(([label, value]) => `<div><span>${escapeHtml(label)}</span><b>${escapeHtml(value)}</b></div>`).join('')}
      </div>
    </section>

    <section class="deep-dive-section">
      <h3>2. 结果聚类</h3>
      <div class="deep-dive-clusters">
        ${clusters.map(cluster => `<article>
          <header><b>${escapeHtml(cluster.name)}</b><span>${cluster.entries.length} 篇</span></header>
          <p>${escapeHtml(cluster.description)}</p>
          <ul>${materialDeepDiveCaseList(cluster.entries, dim.value, 3)}</ul>
        </article>`).join('')}
      </div>
    </section>

    <section class="deep-dive-section">
      <h3>3. 多视角分类</h3>
      <div class="deep-dive-axis-bar">
        ${axes.map(item => `<button type="button" class="${item === axis ? 'active' : ''}" onclick="setMaterialDeepDiveAxis(${escapeHtml(JSON.stringify(item))})">${escapeHtml(item)}</button>`).join('')}
      </div>
      <div class="deep-dive-category-grid">
        ${axisGroups.map(([label, group]) => `<article>
          <b>${escapeHtml(label)}</b>
          <span>${group.length} 篇论文</span>
          <ul>${materialDeepDiveCaseList(group, dim.value, 4)}</ul>
        </article>`).join('')}
      </div>
    </section>

    <section class="deep-dive-section">
      <h3>4. 代表性案例</h3>
      <div class="deep-dive-case-grid">
        ${(topClusters.length ? topClusters : clusters).slice(0, 4).map(cluster => {
          const example = cluster.entries.find(entry => !entry.notReported) || cluster.entries[0];
          const quote = (example?.item?.evidence || [])[0]?.quote || example?.content || '';
          return `<article>
            <h4>${escapeHtml(cluster.name)}</h4>
            <p>${escapeHtml(cluster.description)}</p>
            <b>代表论文</b>
            <ul>${materialDeepDiveCaseList(cluster.entries, dim.value, 3)}</ul>
            <b>代表性证据</b>
            <blockquote>${escapeHtml(fmt(quote, 360) || '暂无直接证据。')}</blockquote>
          </article>`;
        }).join('')}
      </div>
    </section>

    <section class="deep-dive-section">
      <h3>5. 证据质量</h3>
      <div class="deep-dive-evidence-grid">
        <article><b>证据来自哪里？</b>${evidenceSections.map(([section, count]) => `<span>${escapeHtml(section)} · ${count}</span>`).join('') || '<span>暂无章节证据</span>'}</article>
        <article><b>直接支撑情况</b><p>${evidenceEntries.length} / ${resultEntries.length || 0} 条结果带有原文证据。</p></article>
        <article><b>弱证据结果</b><p>${weakEntries.length} 条结果缺少证据或置信度较低。</p></article>
        <article><b>模型推断依赖</b><p>${inferredEntries.length} 条结果包含推断信号。</p></article>
      </div>
    </section>

    <section class="deep-dive-section">
      <h3>6. 异常与空白</h3>
      <ul class="deep-dive-list">
        ${anomalies.map(item => `<li>${escapeHtml(item)}</li>`).join('')}
      </ul>
    </section>

    <section class="deep-dive-section">
      <h3>7. 写作 / 方案素材</h3>
      <div class="deep-dive-writing-grid">
        <article><b>可用于综述的归纳句</b><p>${escapeHtml(clusterSentence)}</p></article>
        <article><b>可引用观点</b><p>${escapeHtml(`${dimLabel} 的跨论文差异主要体现在 ${topClusters.slice(0, 3).map(item => item.name).join('、') || '是否报告和证据强弱'}。`)}</p></article>
        <article><b>可支撑的 claim</b><p>${escapeHtml(`当前证据支持将“${dimLabel}”作为比较 ${materialCurrentTemplate()?.name || '科研对象'} 的关键维度。`)}</p></article>
        <article><b>研究空白表述</b><p>${escapeHtml(anomalies[0] || `${dimLabel} 仍缺少一致的报告规范。`)}</p></article>
        <article><b>方案设计启发</b><p>${escapeHtml(`后续方案可围绕“${leadCluster?.name || dimLabel}”建立更明确的输入、输出和验证协议。`)}</p></article>
      </div>
    </section>

    <section class="deep-dive-section">
      <h3>8. 用户自定义分类</h3>
      <div class="deep-dive-custom">
        <label><span>新增分类轴</span><input id="materialDeepDiveCustomAxis" placeholder="例如：按交互阶段 / 按失败类型" /></label>
        <label><span>人工调整记录</span><textarea id="materialDeepDiveCustomNote" rows="5" placeholder="记录重命名类别、合并类别、拆分类别、移动论文或标记分类不合理的决定。"></textarea></label>
        <div>
          <button type="button" onclick="saveMaterialDeepDiveView()">保存为分析视图</button>
          <button type="button" onclick="toast('已标记：当前系统分类需要人工复核')">标记分类不合理</button>
        </div>
      </div>
    </section>
  `;
}

function materialDeepDiveTermStats(entries) {
  const stopWords = new Set(['the', 'and', 'for', 'with', 'that', 'this', 'from', 'into', 'using', 'used', 'based', 'paper', 'method', 'model', 'result', 'results']);
  const counts = new Map();
  entries.forEach(entry => {
    const text = `${entry.content || ''} ${entry.paper?.metadata?.title || ''}`.toLowerCase();
    (text.match(/[a-z][a-z0-9_-]{2,}/g) || [])
      .filter(term => !stopWords.has(term))
      .forEach(term => counts.set(term, (counts.get(term) || 0) + 1));
    ['定义', '结构', '流程', '机制', '效果', '证据', '局限', '素材', '记忆', '经验', '检索', '训练', '消融', '风险'].forEach(term => {
      if (text.includes(term)) counts.set(term, (counts.get(term) || 0) + 1);
    });
  });
  return [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 18);
}

function materialDeepDiveAnalysisViews(type) {
  const general = [
    {id: 'overview_stats', label: '总览统计', hint: '总览'},
    {id: 'semantic_clusters', label: '语义聚类', hint: '聚类'},
    {id: 'representative_results', label: '代表性结果', hint: '样例'},
    {id: 'anomaly_results', label: '异常结果', hint: '复核'},
    {id: 'cross_paper_differences', label: '跨论文差异', hint: '对比'},
    {id: 'research_gaps', label: '研究空白', hint: '问题'},
    {id: 'review_material', label: '综述素材', hint: '写作'},
  ];
  const definition = type === '定义类维度' ? [
    {id: 'definition_explicitness', label: '定义显性程度', axis: '按定义方式分类'},
    {id: 'definition_object_type', label: '定义对象类型', axis: '按定义对象类型分类'},
    {id: 'definition_source', label: '定义来源', axis: '按定义来源分类'},
    {id: 'definition_function', label: '定义功能指向', axis: '按定义功能指向分类'},
    {id: 'definition_granularity', label: '定义粒度', axis: '按定义粒度分类'},
    {id: 'definition_relations', label: '相邻概念关系', axis: '按相邻概念关系分类'},
    {id: 'definition_completeness', label: '定义完整性', axis: '按定义完整性分类'},
    {id: 'definition_evidence_source', label: '定义证据来源', axis: '按定义证据来源分类'},
    {id: 'definition_evolution', label: '定义演化趋势', axis: '按年份分类'},
  ] : [];
  return {general, definition, all: [...general, ...definition]};
}

function materialDeepDiveContext(dim, items) {
  const type = materialDeepDiveType(dim);
  const entries = materialDeepDiveEntries(items, dim.value);
  const resultEntries = entries.filter(entry => entry.item);
  const validEntries = entries.filter(entry => !entry.notReported);
  const notReportedEntries = entries.filter(entry => entry.notReported);
  const evidenceEntries = resultEntries.filter(entry => (entry.item?.evidence || []).length);
  const weakEntries = resultEntries.filter(entry => materialEvidenceStrength(entry.item) === 'weak' || !(entry.item?.evidence || []).length);
  const confirmedEntries = resultEntries.filter(entry => materialItemAccepted(entry.item));
  const inferredEntries = resultEntries.filter(entry => itemModelInferred(entry.item));
  const clusters = materialDeepDiveClusterEntries(entries, type);
  const topClusters = clusters.filter(cluster => cluster.name !== '未报告或表述不足' && cluster.entries.some(entry => !entry.notReported));
  const axes = materialDeepDiveRecommendedAxes(type);
  const axis = state.materialDeepDiveAxis || axes[0] || '按定义方式分类';
  state.materialDeepDiveAxis = axis;
  const axisGroups = materialDeepDiveGroupByAxis(entries, axis, type);
  const evidenceSections = materialDeepDiveEvidenceSections(entries);
  const leadCluster = topClusters[0] || clusters[0];
  const dimLabel = dim.label || dim.value;
  const anomalyTemplates = {
    '定义类维度': ['部分论文没有显式定义该对象。', '概念边界、术语别名和操作性定义可能混在一起。', '需要区分作者明确表述与模型归纳。'],
    '结构类维度': ['结构层级、模块职责和数据结构可能没有分开报告。', '部分结果只描述组件名，缺少连接关系。', '存储位置和组织方式需要进一步核验。'],
    '过程类维度': ['流程步骤可能缺少执行顺序或输入输出。', '训练、构造、抽取和运行阶段容易混在一起。', '部分论文没有给出可复现的过程细节。'],
    '机制类维度': ['机制描述可能停留在功能层，没有说明触发条件。', '信息流、检索调用和更新方式需要拆开核验。', '部分机制缺少失败或边界条件。'],
    '效果类维度': ['多数论文需要区分性能提升、效率优化和消融贡献。', '只报告效果提升时，需要补充成本或 trade-off。', '跨任务泛化和鲁棒性证据可能不足。'],
    '证据类维度': ['claim 与证据的支撑关系需要逐条核验。', '实验验证、理论证明和案例证据应分开统计。', '弱证据或间接证据可能被过度使用。'],
    '局限类维度': ['局限常停留在笼统表述。', '风险来源、失败场景和适用边界需要拆开。', '缺少可验证的失败条件或缓解方式。'],
    '素材类维度': ['需要区分综述素材、引用点、方法设计素材和研究启发。', '部分素材可复用价值不明确。', '引用价值和原文证据位置需要复核。'],
  };
  const anomalies = [
    ...(anomalyTemplates[type] || []),
    notReportedEntries.length ? `${notReportedEntries.length} 篇论文在该维度上表现为未报告或弱报告。` : '',
    weakEntries.length ? `${weakEntries.length} 条结果只有弱证据或没有证据。` : '',
  ].filter(Boolean);
  const views = materialDeepDiveAnalysisViews(type);
  if (!views.all.some(view => view.id === state.materialDeepDiveView)) state.materialDeepDiveView = 'overview_stats';
  return {
    dim,
    dimLabel,
    type,
    entries,
    resultEntries,
    validEntries,
    notReportedEntries,
    evidenceEntries,
    weakEntries,
    confirmedEntries,
    inferredEntries,
    clusters,
    topClusters,
    axes,
    axis,
    axisGroups,
    evidenceSections,
    leadCluster,
    anomalies,
    terms: materialDeepDiveTermStats(validEntries),
    views,
    view: state.materialDeepDiveView || 'overview_stats',
    clusterCacheKey: materialDeepDiveClusterCacheKey(dim, entries),
    clusterSentence: leadCluster
      ? `${dimLabel} 在当前论文中主要呈现为“${leadCluster.name}”，涉及 ${leadCluster.entries.length} 篇论文。`
      : `${dimLabel} 暂未形成明显主类。`,
  };
}

function materialDeepDiveBars(rows, total) {
  return rows.map(([label, count, tone = 'default']) => {
    const width = total ? Math.max(4, Math.round(Number(count || 0) / total * 100)) : 0;
    return `
      <div class="deep-dive-bar-row ${escapeHtml(tone)}">
        <span>${escapeHtml(label)}</span>
        <b><i style="width:${width}%"></i></b>
        <em>${escapeHtml(count)}</em>
      </div>
    `;
  }).join('');
}

function materialDeepDiveEntryList(entries, dimensionName, limit = 8) {
  return entries.slice(0, limit).map(entry => `
    <li>
      <button type="button" onclick="openMaterialCellDetail(${escapeHtml(JSON.stringify(entry.paper.id))}, ${escapeHtml(JSON.stringify(dimensionName))})">
        ${escapeHtml(fmt(entry.paper.metadata?.title || entry.paper.id, 96))}
      </button>
      ${entry.notReported ? '<span>not_reported</span>' : `<small>${escapeHtml(fmt(entry.content || '', 120))}</small>`}
    </li>
  `).join('') || '<li class="muted">暂无匹配论文。</li>';
}

function materialSemanticClusterEntryMap(ctx) {
  const map = new Map();
  ctx.entries.forEach(entry => {
    if (entry.item?.id) map.set(entry.item.id, entry);
  });
  return map;
}

function materialEntriesForSemanticCluster(ctx, cluster) {
  const materialIds = new Set(cluster.material_ids || []);
  const paperIds = new Set(cluster.paper_ids || []);
  const matched = ctx.entries.filter(entry => (entry.item?.id && materialIds.has(entry.item.id)) || paperIds.has(entry.paper?.id));
  return matched.length ? matched : ctx.entries.filter(entry => paperIds.has(entry.paper?.id));
}

function materialSemanticClusterReviewText(ctx, cluster) {
  const papers = (cluster.paper_indices || []).length
    ? `论文 ${cluster.paper_indices.join('、')}`
    : `${cluster.entry_count || 0} 篇论文`;
  const keywords = (cluster.keywords || []).length ? `关键词包括 ${cluster.keywords.join('、')}` : '关键词尚不稳定';
  return `【${cluster.name}】${cluster.description} ${keywords}。可在综述中将其作为一类${ctx.type === '定义类维度' ? '经验定义' : '维度表述'}来讨论，涉及${papers}。`;
}

function renderMaterialSemanticClusterCards(ctx) {
  const key = ctx.clusterCacheKey;
  const cached = state.materialSemanticClusters[key];
  const clusters = materialSemanticClustersForContext(ctx);
  const selectedCount = clusters.filter(cluster => cluster.selected).length;
  return `
    <section class="deep-dive-section semantic-cluster-section">
      <div class="deep-dive-section-heading">
        <div>
          <h3>语义聚类</h3>
          <p>${ctx.type === '定义类维度' ? '按定义语义将不同论文中的经验定义聚成若干类型，可人工重命名、合并并生成综述素材。' : '按当前维度的语义相近性聚合结果。'}</p>
        </div>
        <div class="semantic-cluster-actions">
          <button type="button" onclick="refreshCurrentMaterialSemanticClusters(true)">重新聚类</button>
          <button type="button" ${selectedCount >= 2 ? '' : 'disabled'} onclick="mergeSelectedMaterialSemanticClusters()">合并所选</button>
          <button type="button" onclick="clearMaterialSemanticClusterSelection()">清空选择</button>
        </div>
      </div>
      ${cached?.loading ? '<p class="muted">正在生成智能语义聚类...</p>' : ''}
      ${cached?.error ? `<p class="muted">后端聚类暂不可用，已展示本地兜底结果：${escapeHtml(cached.error)}</p>` : ''}
      <div class="semantic-cluster-grid">
        ${clusters.map(cluster => `
          <article class="semantic-cluster-card ${cluster.selected ? 'selected' : ''}">
            <header>
              <label>
                <input type="checkbox" ${cluster.selected ? 'checked' : ''} onchange="toggleMaterialSemanticClusterSelection(${escapeHtml(JSON.stringify(cluster.id))})" />
                <span>${escapeHtml(cluster.name)}</span>
              </label>
              <div>
                <button type="button" onclick="openMaterialSemanticClusterDetail(${escapeHtml(JSON.stringify(cluster.id))})">查看详情</button>
                <button type="button" onclick="openMaterialSemanticClusterMaterial(${escapeHtml(JSON.stringify(cluster.id))})">生成素材</button>
              </div>
            </header>
            <small>${escapeHtml(cluster.entry_count || cluster.paper_ids?.length || 0)} 篇论文</small>
            <p>${escapeHtml(cluster.description)}</p>
            <div class="semantic-cluster-keywords">
              ${(cluster.keywords || []).slice(0, 3).map(keyword => `<span>${escapeHtml(keyword)}</span>`).join('') || '<span>待提炼</span>'}
            </div>
            <div class="semantic-cluster-paper-ids">
              ${(cluster.paper_indices || []).slice(0, 12).map(index => `<b>P${escapeHtml(index)}</b>`).join('') || '<b>-</b>'}
            </div>
            <footer>
              <input value="${escapeHtml(cluster.name)}" onchange="renameMaterialSemanticCluster(${escapeHtml(JSON.stringify(cluster.id))}, this.value)" aria-label="重命名类别" />
            </footer>
          </article>
        `).join('') || '<p class="muted">当前维度暂无可聚类结果。</p>'}
      </div>
    </section>
  `;
}

function currentMaterialSemanticCluster(clusterId) {
  const dim = materialDeepDiveDimension();
  if (!dim) return null;
  const items = state.materialCurrentItems?.length ? state.materialCurrentItems : filteredMaterialItems();
  const ctx = materialDeepDiveContext(dim, items);
  const clusters = materialSemanticClustersForContext(ctx);
  const cluster = clusters.find(item => item.id === clusterId);
  return cluster ? {ctx, cluster} : null;
}

window.refreshCurrentMaterialSemanticClusters = async function(force = false) {
  const dim = materialDeepDiveDimension();
  if (!dim) return;
  const items = state.materialCurrentItems?.length ? state.materialCurrentItems : filteredMaterialItems();
  const ctx = materialDeepDiveContext(dim, items);
  await refreshMaterialSemanticClusters(ctx, {force});
  renderMaterialDeepDivePage(dim, items);
};

window.renameMaterialSemanticCluster = function(clusterId, value) {
  const dim = materialDeepDiveDimension();
  if (!dim) return;
  const items = state.materialCurrentItems?.length ? state.materialCurrentItems : filteredMaterialItems();
  const ctx = materialDeepDiveContext(dim, items);
  const key = ctx.clusterCacheKey;
  state.materialSemanticClusterRenames[key] = state.materialSemanticClusterRenames[key] || {};
  state.materialSemanticClusterRenames[key][clusterId] = (value || '').trim() || '未命名类别';
  renderMaterialDeepDivePage(dim, items);
};

window.toggleMaterialSemanticClusterSelection = function(clusterId) {
  const selected = new Set(state.materialSemanticClusterMergeSelection || []);
  selected.has(clusterId) ? selected.delete(clusterId) : selected.add(clusterId);
  state.materialSemanticClusterMergeSelection = [...selected];
  const dim = materialDeepDiveDimension();
  if (dim) renderMaterialDeepDivePage(dim, state.materialCurrentItems?.length ? state.materialCurrentItems : filteredMaterialItems());
};

window.clearMaterialSemanticClusterSelection = function() {
  state.materialSemanticClusterMergeSelection = [];
  const dim = materialDeepDiveDimension();
  if (dim) renderMaterialDeepDivePage(dim, state.materialCurrentItems?.length ? state.materialCurrentItems : filteredMaterialItems());
};

window.mergeSelectedMaterialSemanticClusters = function() {
  const dim = materialDeepDiveDimension();
  if (!dim) return;
  const items = state.materialCurrentItems?.length ? state.materialCurrentItems : filteredMaterialItems();
  const ctx = materialDeepDiveContext(dim, items);
  const selectedCount = materialSemanticClustersForContext(ctx).filter(cluster => cluster.selected).length;
  if (selectedCount < 2) return toast('请至少选择两个类别');
  renderMaterialDeepDivePage(dim, items);
  toast('已在当前视图中合并所选类别');
};

window.openMaterialSemanticClusterDetail = function(clusterId) {
  const found = currentMaterialSemanticCluster(clusterId);
  if (!found) return toast('未找到类别详情');
  const {ctx, cluster} = found;
  const entries = materialEntriesForSemanticCluster(ctx, cluster);
  state.materialOverviewDetailSelection = null;
  $('materialCellTitle').textContent = cluster.name;
  $('materialCellMeta').textContent = `${ctx.dimLabel} · ${entries.length} 篇论文 · 置信度 ${Math.round(Number(cluster.confidence || 0) * 100)}%`;
  $('materialCellBody').innerHTML = `
    <section class="semantic-cluster-detail">
      <p>${escapeHtml(cluster.description)}</p>
      <div class="semantic-cluster-keywords">${(cluster.keywords || []).map(keyword => `<span>${escapeHtml(keyword)}</span>`).join('')}</div>
    </section>
    ${materialDeepDiveOverviewDetailHtml(entries, ctx.dim.value)}
  `;
  $('materialCellAddBtn').hidden = true;
  $('materialCellModal').hidden = false;
  document.body.classList.add('modal-open');
};

window.openMaterialSemanticClusterMaterial = function(clusterId) {
  const found = currentMaterialSemanticCluster(clusterId);
  if (!found) return toast('未找到类别素材');
  const {ctx, cluster} = found;
  const entries = materialEntriesForSemanticCluster(ctx, cluster);
  const examples = entries.slice(0, 3).map((entry, index) => {
    const paperIndex = materialDeepDiveEntryPaperIndex(entry, ctx.entries) || index + 1;
    return `P${paperIndex}: ${fmt(entry.content || materialItemContent(entry.item) || '', 180)}`;
  }).join('\n');
  const material = `${materialSemanticClusterReviewText(ctx, cluster)}\n\n可引用样例：\n${examples || '暂无可引用样例。'}\n\n写作提示：可先说明该类别如何界定经验，再对比其与其他类别在来源、表示和使用方式上的差异。`;
  $('materialCellTitle').textContent = `${cluster.name} · 综述素材`;
  $('materialCellMeta').textContent = `${ctx.dimLabel} · 可编辑草稿`;
  $('materialCellBody').innerHTML = `
    <section class="semantic-material-editor">
      <label>
        <span>生成后的综述素材</span>
        <textarea rows="14">${escapeHtml(material)}</textarea>
      </label>
    </section>
  `;
  $('materialCellAddBtn').hidden = false;
  $('materialCellAddBtn').onclick = () => toast('已保留在当前弹窗中，可继续编辑后复制到写作区');
  $('materialCellModal').hidden = false;
  document.body.classList.add('modal-open');
};

function materialDeepDiveBarRows(rows, total, options = {}) {
  return rows.map(([label, value, tone = 'default', key = '']) => {
    const numeric = Number(value || 0);
    const width = options.percentValues ? numeric : (total ? Math.round(numeric / total * 100) : 0);
    const display = options.percentValues ? `${numeric}%` : numeric;
    const openAttr = key ? ` onclick="openMaterialDeepDiveOverviewDetails(${escapeHtml(JSON.stringify(key))}, ${escapeHtml(JSON.stringify(label))})"` : '';
    return `
      <button type="button" class="deep-dive-overview-bar ${escapeHtml(tone)}"${openAttr}>
        <b>${escapeHtml(label)}</b>
        <span><i style="width:${Math.max(4, Math.min(100, width))}%"></i></span>
        <em>${escapeHtml(display)}</em>
      </button>
    `;
  }).join('');
}

function materialDefinitionOverviewStats(ctx) {
  const valid = ctx.validEntries;
  const textOf = entry => `${entry.content || ''} ${entry.paper?.metadata?.title || ''}`;
  const explicitEntries = valid.filter(entry => /define|definition|concept|称为|定义为|是指|概念/i.test(textOf(entry)));
  const operationalEntries = valid.filter(entry => /operational|implement|use as|通过.*表示|以.*形式|构造为|用于|使用|流程|方法/i.test(textOf(entry)));
  const boundaryEntries = valid.filter(entry => /boundary|scope|distinguish|区别|边界|不包括|排除/i.test(textOf(entry)));
  const categorizedEntries = new Set([...explicitEntries, ...operationalEntries, ...boundaryEntries]);
  const implicitEntries = valid.filter(entry => !categorizedEntries.has(entry));
  const denominator = Math.max(1, ctx.entries.length);
  const formEntries = [...new Set([...explicitEntries, ...operationalEntries])];
  const useEntries = valid.filter(entry => /use|function|purpose|用于|功能|作用|support|guide|帮助|服务于/i.test(textOf(entry)));
  const directEntries = ctx.evidenceEntries.filter(entry => materialEvidenceStrength(entry.item) === 'strong');
  const sourcePercent = Math.round(ctx.evidenceEntries.length / Math.max(1, ctx.resultEntries.length) * 100);
  const formPercent = Math.round(formEntries.length / denominator * 100);
  const usePercent = Math.round(useEntries.length / denominator * 100);
  const directPercent = Math.round(directEntries.length / Math.max(1, ctx.resultEntries.length) * 100);
  return {
    explicitRows: [
      ['显式定义', explicitEntries.length, 'default', 'explicit'],
      ['操作性定义', operationalEntries.length, 'default', 'operational'],
      ['隐含定义', implicitEntries.length, 'default', 'implicit'],
      ['未定义', ctx.notReportedEntries.length, 'warn', 'undefined'],
    ],
    completenessRows: [
      ['说明来源', sourcePercent, 'default', 'source'],
      ['说明形式', formPercent, 'default', 'form'],
      ['说明用途', usePercent, 'default', 'use'],
      ['直接验证', directPercent, directPercent < 50 ? 'danger' : 'default', 'direct'],
    ],
    detailGroups: {
      explicit: explicitEntries,
      operational: operationalEntries,
      implicit: implicitEntries,
      undefined: ctx.notReportedEntries,
      source: ctx.evidenceEntries,
      form: formEntries,
      use: useEntries,
      direct: directEntries,
    },
    explicitEntries,
    operationalEntries,
    implicitCount: implicitEntries.length,
    sourcePercent,
    formPercent,
    usePercent,
    directPercent,
  };
}

function renderDefinitionOverviewConclusion(ctx, stats) {
  const explicitRate = Math.round(stats.explicitEntries.length / Math.max(1, ctx.entries.length) * 100);
  const dominant = stats.operationalEntries.length >= stats.explicitEntries.length ? '操作性描述' : '显式定义';
  const evidenceText = stats.sourcePercent >= 70 ? '证据来源覆盖较好' : '证据来源仍需补齐';
  const validationText = stats.directPercent >= 50 ? '直接验证相对充分' : '直接验证不足';
  return `
    <article class="deep-dive-overview-conclusion">
      <h3>初步分析结论</h3>
      <p>当前“${escapeHtml(ctx.dimLabel)}”在 ${ctx.entries.length} 篇论文中有 ${ctx.validEntries.length} 篇形成有效结果，显式定义约占 ${explicitRate}%。整体更偏向${escapeHtml(dominant)}，需要继续区分作者直接定义、方法流程中的操作性定义，以及由上下文归纳出的隐含定义。</p>
      <p>定义完整性方面，${escapeHtml(evidenceText)}，说明形式覆盖率为 ${stats.formPercent}%，说明用途覆盖率为 ${stats.usePercent}%，但${escapeHtml(validationText)}。后续综述中建议把“是否给出严格定义”和“是否通过流程/证据间接界定”分开写。</p>
      <div class="deep-dive-overview-tags">
        <span>${stats.implicitCount || ctx.notReportedEntries.length ? '隐含/未报告定义需复核' : '定义报告较完整'}</span>
        <span>${stats.explicitEntries.length < stats.operationalEntries.length ? '操作性定义占优' : '显式定义占优'}</span>
        <span>${escapeHtml(evidenceText)}</span>
      </div>
    </article>
  `;
}

function renderMaterialDeepDiveOverview(ctx) {
  const statCards = [
    ['维度名称', ctx.dimLabel],
    ['维度类型', ctx.type],
    ['涉及论文数', ctx.entries.length],
    ['有效结果数', ctx.validEntries.length],
    ['未报告数', ctx.notReportedEntries.length],
    ['证据覆盖率', materialDeepDivePercent(ctx.evidenceEntries.length, ctx.resultEntries.length)],
    ['人工确认率', materialDeepDivePercent(ctx.confirmedEntries.length, ctx.resultEntries.length)],
    ['模型推断率', materialDeepDivePercent(ctx.inferredEntries.length, ctx.resultEntries.length)],
  ];
  if (ctx.type !== '定义类维度') {
    return `
      <section class="deep-dive-overview">
        <div class="deep-dive-overview-stats">
          ${statCards.map(([label, value]) => `<article><b>${escapeHtml(value)}</b><span>${escapeHtml(label)}</span></article>`).join('')}
        </div>
        <div class="deep-dive-question-grid">
          ${[
            ['哪些论文报告了这个维度？', `${ctx.validEntries.length} / ${ctx.entries.length} 篇论文有有效结果。`],
            ['哪些论文没有报告？', `${ctx.notReportedEntries.length} 篇论文为 not_reported 或弱报告。`],
            ['哪些说法最典型？', ctx.leadCluster ? `当前主类是“${ctx.leadCluster.name}”。` : '暂未形成稳定主类。'],
            ['哪些结果适合作为综述素材？', ctx.clusterSentence],
          ].map(([question, answer]) => `<article><b>${escapeHtml(question)}</b><p>${escapeHtml(answer)}</p></article>`).join('')}
        </div>
      </section>
    `;
  }
  const definitionStats = materialDefinitionOverviewStats(ctx);
  return `
    <section class="deep-dive-overview definition">
      <div class="deep-dive-overview-stats">
        ${statCards.map(([label, value]) => `<article><b>${escapeHtml(value)}</b><span>${escapeHtml(label)}</span></article>`).join('')}
      </div>
      <div class="deep-dive-definition-overview">
        <div class="deep-dive-definition-bars">
          <section>
            <h3>定义显性程度分布</h3>
            ${materialDeepDiveBarRows(definitionStats.explicitRows, Math.max(1, ctx.entries.length))}
          </section>
          <section>
            <h3>定义完整性</h3>
            ${materialDeepDiveBarRows(definitionStats.completenessRows, 100, {percentValues: true})}
          </section>
        </div>
        ${renderDefinitionOverviewConclusion(ctx, definitionStats)}
      </div>
    </section>
  `;
}

function renderMaterialDeepDiveSidebarContent(ctx) {
  const navButton = view => `
    <button type="button" class="deep-dive-nav-item ${ctx.view === view.id ? 'active' : ''}" onclick="setMaterialDeepDiveView(${escapeHtml(JSON.stringify(view.id))})">
      <span>${escapeHtml(view.label)}</span>
      ${view.hint ? `<em>${escapeHtml(view.hint)}</em>` : ''}
    </button>
  `;
  return `
    <section>
      <h4>维度深挖</h4>
      <p>${escapeHtml(ctx.dimLabel)}</p>
      <dl>
        <div><dt>维度类型</dt><dd>${escapeHtml(ctx.type)}</dd></div>
        <div><dt>纳入论文</dt><dd>${ctx.entries.length} 篇</dd></div>
        <div><dt>有效结果</dt><dd>${ctx.validEntries.length} 条</dd></div>
      </dl>
    </section>
    <section>
      <h4>分析视图</h4>
      <div class="deep-dive-nav-list">${ctx.views.general.map(navButton).join('')}</div>
    </section>
    ${ctx.views.definition.length ? `
      <section>
        <h4>定义类分析视角</h4>
        <div class="deep-dive-nav-list">${ctx.views.definition.map(navButton).join('')}</div>
      </section>
    ` : ''}
    <section>
      <h4>分类视角</h4>
      <div class="deep-dive-axis-bar compact">
        ${ctx.axes.map(item => `<button type="button" class="${item === ctx.axis ? 'active' : ''}" onclick="setMaterialDeepDiveAxis(${escapeHtml(JSON.stringify(item))})">${escapeHtml(item)}</button>`).join('')}
      </div>
    </section>
  `;
}

function renderMaterialDeepDiveNav(ctx) {
  return `<aside class="deep-dive-nav-panel">${renderMaterialDeepDiveSidebarContent(ctx)}</aside>`;
}

function renderMaterialDeepDivePerspective(ctx, title, axis, description) {
  const groups = materialDeepDiveGroupByAxis(ctx.entries, axis, ctx.type);
  return `
    <section class="deep-dive-section">
      <div class="deep-dive-category-grid">
        ${groups.map(([label, group]) => `<article>
          <b>${escapeHtml(label)}</b>
          <span>${group.length} 篇论文</span>
          <ul>${materialDeepDiveCaseList(group, ctx.dim.value, 4)}</ul>
        </article>`).join('')}
      </div>
    </section>
  `;
}

function renderMaterialDeepDiveMain(ctx) {
  const viewDef = ctx.views.all.find(item => item.id === ctx.view) || ctx.views.general[0];
  if (viewDef.axis) {
    return renderMaterialDeepDivePerspective(ctx, viewDef.label, viewDef.axis, `围绕“${ctx.dimLabel}”检查${viewDef.label}，用于统一不同论文对该定义类维度的报告方式。`);
  }
  if (ctx.view === 'overview_stats') {
    return renderMaterialDeepDiveOverview(ctx);
  }
  if (ctx.view === 'result_coverage') {
    return `
      <section class="deep-dive-section">
        <h3>结果覆盖率</h3>
        <div class="deep-dive-stat-grid">
          ${[
            ['纳入论文', ctx.entries.length],
            ['有效结果', ctx.validEntries.length],
            ['not_reported', ctx.notReportedEntries.length],
            ['覆盖率', materialDeepDivePercent(ctx.validEntries.length, ctx.entries.length)],
          ].map(([label, value]) => `<div><span>${escapeHtml(label)}</span><b>${escapeHtml(value)}</b></div>`).join('')}
        </div>
        <div class="deep-dive-bar-list">${materialDeepDiveBars([['已报告', ctx.validEntries.length], ['未报告', ctx.notReportedEntries.length, 'warn']], ctx.entries.length)}</div>
        <ul class="deep-dive-entry-list">${materialDeepDiveEntryList(ctx.validEntries, ctx.dim.value, 10)}</ul>
      </section>
    `;
  }
  if (ctx.view === 'not_reported') {
    return `
      <section class="deep-dive-section">
        <h3>not_reported 分布</h3>
        <p>用于定位没有报告该维度、只有间接描述或证据不足的论文。</p>
        <ul class="deep-dive-entry-list">${materialDeepDiveEntryList(ctx.notReportedEntries, ctx.dim.value, 12)}</ul>
      </section>
    `;
  }
  if (ctx.view === 'evidence_coverage') {
    return `
      <section class="deep-dive-section">
        <h3>证据覆盖率</h3>
        <div class="deep-dive-evidence-grid">
          <article><b>原文证据覆盖</b><p>${ctx.evidenceEntries.length} / ${ctx.resultEntries.length || 0} 条结果绑定证据。</p></article>
          <article><b>弱证据结果</b><p>${ctx.weakEntries.length} 条结果需要复核。</p></article>
          <article><b>人工确认结果</b><p>${ctx.confirmedEntries.length} 条结果已通过审查。</p></article>
          <article><b>模型推断结果</b><p>${ctx.inferredEntries.length} 条结果含推断信号。</p></article>
        </div>
        <div class="deep-dive-evidence-grid">
          <article><b>高频证据章节</b>${ctx.evidenceSections.map(([section, count]) => `<span>${escapeHtml(section)} · ${count}</span>`).join('') || '<span>暂无章节证据</span>'}</article>
        </div>
      </section>
    `;
  }
  if (ctx.view === 'top_terms') {
    return `
      <section class="deep-dive-section">
        <h3>高频术语</h3>
        <div class="deep-dive-term-cloud">${ctx.terms.map(([term, count]) => `<span>${escapeHtml(term)}<b>${count}</b></span>`).join('') || '<p class="muted">暂无可统计术语。</p>'}</div>
      </section>
    `;
  }
  if (ctx.view === 'semantic_clusters') {
    return renderMaterialSemanticClusterCards(ctx);
  }
  if (ctx.view === 'representative_results') {
    return `
      <section class="deep-dive-section">
        <h3>代表性结果</h3>
        <div class="deep-dive-case-grid">
          ${(ctx.topClusters.length ? ctx.topClusters : ctx.clusters).slice(0, 5).map(cluster => {
            const example = cluster.entries.find(entry => !entry.notReported) || cluster.entries[0];
            const quote = (example?.item?.evidence || [])[0]?.quote || example?.content || '';
            return `<article>
              <h4>${escapeHtml(cluster.name)}</h4>
              <p>${escapeHtml(cluster.description)}</p>
              <ul>${materialDeepDiveCaseList(cluster.entries, ctx.dim.value, 3)}</ul>
              <blockquote>${escapeHtml(fmt(quote, 320) || '暂无直接证据。')}</blockquote>
            </article>`;
          }).join('')}
        </div>
      </section>
    `;
  }
  if (ctx.view === 'anomaly_results' || ctx.view === 'research_gaps') {
    return `
      <section class="deep-dive-section">
        <h3>${ctx.view === 'research_gaps' ? '研究空白' : '异常结果'}</h3>
        <ul class="deep-dive-list">${ctx.anomalies.map(item => `<li>${escapeHtml(item)}</li>`).join('')}</ul>
      </section>
    `;
  }
  if (ctx.view === 'cross_paper_differences') {
    return `
      <section class="deep-dive-section">
        <h3>跨论文差异</h3>
        <p>当前按“${escapeHtml(ctx.axis)}”展示差异，可在左侧切换分类视角。</p>
        <div class="deep-dive-category-grid">
          ${ctx.axisGroups.map(([label, group]) => `<article>
            <b>${escapeHtml(label)}</b>
            <span>${group.length} 篇论文</span>
            <ul>${materialDeepDiveCaseList(group, ctx.dim.value, 4)}</ul>
          </article>`).join('')}
        </div>
      </section>
    `;
  }
  if (ctx.view === 'review_material') {
    return `
      <section class="deep-dive-section">
        <h3>综述素材</h3>
        <div class="deep-dive-writing-grid">
          <article><b>可用于综述的归纳句</b><p>${escapeHtml(ctx.clusterSentence)}</p></article>
          <article><b>可引用观点</b><p>${escapeHtml(`${ctx.dimLabel} 的跨论文差异主要体现在 ${ctx.topClusters.slice(0, 3).map(item => item.name).join('、') || '是否报告和证据强弱'}。`)}</p></article>
          <article><b>可支撑的 claim</b><p>${escapeHtml(`当前证据支持将“${ctx.dimLabel}”作为比较 ${materialCurrentTemplate()?.name || '科研对象'} 的关键维度。`)}</p></article>
          <article><b>研究空白表述</b><p>${escapeHtml(ctx.anomalies[0] || `${ctx.dimLabel} 仍缺少一致的报告规范。`)}</p></article>
        </div>
      </section>
    `;
  }
  return renderMaterialDeepDiveOverview(ctx);
}

function renderMaterialDeepDiveInsightContent(ctx) {
  return `
    <section>
      <h4>洞察建议</h4>
      <p>${escapeHtml(ctx.clusterSentence)}</p>
    </section>
    <section>
      <h4>下一步</h4>
      <ul>
        <li>优先复核 ${ctx.weakEntries.length} 条弱证据结果。</li>
        <li>检查 ${ctx.notReportedEntries.length} 篇未报告论文是否应补充为 not_reported。</li>
        <li>将“${escapeHtml(ctx.axis)}”下的主类结果整理为综述段落。</li>
      </ul>
    </section>
    <section>
      <h4>人工调整</h4>
      <label><span>新增分类轴</span><input id="materialDeepDiveCustomAxis" placeholder="例如：按交互阶段 / 按失败类型" /></label>
      <label><span>调整记录</span><textarea id="materialDeepDiveCustomNote" rows="5" placeholder="记录重命名、合并、拆分或移动论文的决定。"></textarea></label>
      <button type="button" onclick="saveMaterialDeepDiveView()">保存为分析视图</button>
    </section>
  `;
}

function renderMaterialDeepDiveAside(ctx) {
  return `<aside class="deep-dive-suggestion-panel">${renderMaterialDeepDiveInsightContent(ctx)}</aside>`;
}

function renderMaterialDimensionDeepDiveLayout(dim, items) {
  const ctx = materialDeepDiveContext(dim, items);
  return `<div class="deep-dive-main-panel">${renderMaterialDeepDiveMain(ctx)}</div>`;
}

function renderMaterialDeepDivePage(dim, items) {
  state.materialAnalysisDepth = 'deep_dive';
  const ctx = materialDeepDiveContext(dim, items);
  if (ctx.view === 'semantic_clusters' && !state.materialSemanticClusters[ctx.clusterCacheKey]?.loading && !state.materialSemanticClusters[ctx.clusterCacheKey]) {
    refreshMaterialSemanticClusters(ctx).then(() => {
      if (state.materialAnalysisDepth === 'deep_dive' && state.materialDeepDiveView === 'semantic_clusters' && state.materialDeepDiveDimension === dim.value) {
        renderMaterialDeepDivePage(dim, items);
      }
    });
  }
  $('analysisOutput').classList.remove('muted');
  const list = $('materialResults');
  if (list) {
    list.hidden = true;
    list.innerHTML = '';
  }
  const template = materialCurrentTemplate();
  const rows = materialCompareRows(items);
  const type = materialDeepDiveType(dim);
  $('materialResultTitle').textContent = `维度深挖：${dim.label || dim.value}`;
  $('materialResultHint').textContent = `${template?.name || '科研对象'} · ${rows.length} 篇论文 · ${type}`;
  $('analysisOutput').innerHTML = `<div class="material-deep-dive-body"><div class="deep-dive-main-panel">${renderMaterialDeepDiveMain(ctx)}</div></div>`;
  $('analysisOutput').scrollTop = 0;
  renderMaterialsBreadcrumb();
  renderMaterialScopePanel();
  renderMaterialTopActions();
  renderMaterialResultChrome();
  renderMaterialAnalysisNav();
  renderMaterialInsights(items);
  renderMaterialExplanations(items);
}

window.setMaterialDeepDiveAxis = function(axis) {
  state.materialDeepDiveAxis = axis;
  const dim = materialDeepDiveDimension();
  if (!dim) return;
  const items = state.materialCurrentItems?.length ? state.materialCurrentItems : filteredMaterialItems();
  renderMaterialDeepDivePage(dim, items);
};

window.setMaterialDeepDiveView = function(view) {
  state.materialDeepDiveView = view || 'overview_stats';
  const dim = materialDeepDiveDimension();
  if (!dim) return;
  const items = state.materialCurrentItems?.length ? state.materialCurrentItems : filteredMaterialItems();
  renderMaterialDeepDivePage(dim, items);
};

window.openMaterialDimensionDeepDive = function() {
  const dim = materialDeepDiveDimension();
  if (!dim) {
    toast('请先在对比矩阵中选择一个维度列');
    return;
  }
  const items = state.materialCurrentItems?.length ? state.materialCurrentItems : filteredMaterialItems();
  renderMaterialDeepDivePage(dim, items);
};

window.returnToMaterialCompareMatrix = function() {
  state.materialAnalysisDepth = 'root';
  renderMaterialCompareMatrixView(state.materialCurrentItems?.length ? state.materialCurrentItems : filteredMaterialItems());
};

window.saveMaterialDeepDiveView = function() {
  const dim = materialDeepDiveDimension();
  if (!dim) return;
  const saved = JSON.parse(localStorage.getItem('litmate_material_deep_dive_views') || '[]');
  saved.unshift({
    saved_at: new Date().toISOString(),
    template_id: materialCurrentTemplate()?.id || '',
    dimension_name: dim.value,
    dimension_label: dim.label || dim.value,
    view: state.materialDeepDiveView || 'overview_stats',
    axis: state.materialDeepDiveAxis || '',
    custom_axis: $('materialDeepDiveCustomAxis')?.value || '',
    note: $('materialDeepDiveCustomNote')?.value || '',
  });
  localStorage.setItem('litmate_material_deep_dive_views', JSON.stringify(saved.slice(0, 50)));
  toast('维度深挖视图已保存');
};

function materialDetailItemsHtml(items) {
  return items.map(item => `
    <article class="material-detail-item">
      <header>
        <b>${escapeHtml(item.dimension_label || materialDimensionLabel(item.dimension_name))}</b>
        <span class="badge ${escapeHtml(item.review_status || 'pending')}">${escapeHtml(reviewStatusLabel(item.review_status || 'pending'))}</span>
      </header>
      <section>
        <h4>完整抽取结果</h4>
        <p>${escapeHtml(materialItemContent(item) || item.title || '无内容')}</p>
      </section>
      <section>
        <h4>原文证据</h4>
        ${(item.evidence || []).map(ev => `
          <blockquote>
            ${escapeHtml(ev.quote || '无证据原文')}
            <span>${escapeHtml(ev.section_title || ev.section || 'Evidence')}${ev.page_start || ev.page ? ` · p.${escapeHtml(ev.page_start || ev.page)}` : ''}</span>
          </blockquote>
        `).join('') || '<p class="muted">暂无证据绑定。</p>'}
      </section>
      <section>
        <h4>人工审查记录</h4>
        <div class="material-detail-meta">
          <span>状态：${escapeHtml(reviewStatusLabel(item.review_status || 'pending'))}</span>
          <span>置信度：${escapeHtml(confidenceText(item.confidence))}</span>
          ${(item.tags || []).slice(0, 6).map(tag => `<span>${escapeHtml(tag)}</span>`).join('')}
        </div>
        ${item.user_note ? `<p>${escapeHtml(item.user_note)}</p>` : '<p class="muted">暂无人工备注。</p>'}
      </section>
      <section>
        <h4>相关笔记</h4>
        <p class="muted">暂无相关笔记。</p>
      </section>
    </article>
  `).join('') || '<p class="muted">当前单元格暂无抽取结果。</p>';
}

function openMaterialDetailModal(title, meta, items) {
  $('materialCellTitle').textContent = title;
  $('materialCellMeta').textContent = meta;
  $('materialCellBody').innerHTML = materialDetailItemsHtml(items);
  $('materialCellAddBtn').hidden = false;
  $('materialCellAddBtn').onclick = () => {
    toast('已加入综述素材候选');
  };
  $('materialCellModal').hidden = false;
  document.body.classList.add('modal-open');
}

function materialDeepDiveOverviewInlineDetailHtml(selection) {
  if (!selection?.paperId || !selection?.dimensionName) {
    return `
      <aside class="deep-dive-inline-detail empty">
        <h3>详情</h3>
        <p>点击左侧任一条的“查看详情”，这里会显示该论文在当前维度下的完整抽取结果和证据。</p>
      </aside>
    `;
  }
  const items = materialItemsForPaperDimension(state.materialCurrentItems?.length ? state.materialCurrentItems : filteredMaterialItems(), selection.paperId, selection.dimensionName);
  const paper = paperById(selection.paperId);
  return `
    <aside class="deep-dive-inline-detail">
      <header>
        <div>
          <h3>详情</h3>
          <p>${escapeHtml(fmt(paper?.metadata?.title || selection.paperId, 90))}</p>
        </div>
        <button type="button" onclick="toggleMaterialDeepDiveInlineDetail(${escapeHtml(JSON.stringify(selection.paperId))}, ${escapeHtml(JSON.stringify(selection.dimensionName))})">关闭</button>
      </header>
      <div>${materialDetailItemsHtml(items)}</div>
    </aside>
  `;
}

function materialDeepDiveOverviewDetailHtml(entries, dimensionName) {
  const selection = state.materialOverviewDetailSelection;
  const list = entries.map((entry, index) => {
    const paper = entry.paper;
    const item = entry.item;
    const evidence = (item?.evidence || []).slice(0, 2);
    const content = entry.notReported
      ? '该论文未报告该维度，或当前结果被识别为 not_reported。'
      : (entry.content || materialItemContent(item) || '暂无内容');
    const selected = selection?.paperId === paper?.id && selection?.dimensionName === dimensionName;
    return `
      <article class="material-detail-item deep-dive-detail-entry ${selected ? 'selected' : ''}">
        <header>
          <b>${index + 1}. ${escapeHtml(fmt(paper?.metadata?.title || paper?.id || '未知论文', 96))}</b>
          <span class="badge ${escapeHtml(item?.review_status || 'pending')}">${entry.notReported ? 'not_reported' : escapeHtml(reviewStatusLabel(item?.review_status || 'pending'))}</span>
        </header>
        <section>
          <h4>具体内容</h4>
          <p>${escapeHtml(content)}</p>
        </section>
        <section>
          <h4>原文证据</h4>
          ${evidence.map(ev => `
            <blockquote>
              ${escapeHtml(ev.quote || '无证据原文')}
              <span>${escapeHtml(ev.section_title || ev.section || 'Evidence')}${ev.page_start || ev.page ? ` · p.${escapeHtml(ev.page_start || ev.page)}` : ''}</span>
            </blockquote>
          `).join('') || '<p class="muted">暂无证据绑定。</p>'}
        </section>
        <button type="button" onclick="toggleMaterialDeepDiveInlineDetail(${escapeHtml(JSON.stringify(paper?.id || ''))}, ${escapeHtml(JSON.stringify(dimensionName))})">${selected ? '关闭详情' : '查看详情'}</button>
      </article>
    `;
  }).join('') || '<p class="muted">当前分类下暂无具体内容。</p>';
  return `
    <div class="deep-dive-overview-detail-layout ${selection ? 'has-detail' : ''}">
      <div class="deep-dive-overview-detail-list">${list}</div>
      ${materialDeepDiveOverviewInlineDetailHtml(selection)}
    </div>
  `;
}

window.openMaterialDeepDiveOverviewDetails = function(key, label) {
  const dim = materialDeepDiveDimension();
  if (!dim) return;
  const items = state.materialCurrentItems?.length ? state.materialCurrentItems : filteredMaterialItems();
  const ctx = materialDeepDiveContext(dim, items);
  if (ctx.type !== '定义类维度') return;
  const stats = materialDefinitionOverviewStats(ctx);
  const entries = stats.detailGroups[key] || [];
  state.materialOverviewDetailSelection = null;
  state.materialOverviewDetailKey = key;
  state.materialOverviewDetailLabel = label;
  $('materialCellTitle').textContent = `${label}明细`;
  $('materialCellMeta').textContent = `${ctx.dimLabel} · ${entries.length} 条`;
  $('materialCellBody').innerHTML = materialDeepDiveOverviewDetailHtml(entries, dim.value);
  $('materialCellAddBtn').hidden = true;
  $('materialCellModal').hidden = false;
  document.body.classList.add('modal-open');
};

window.toggleMaterialDeepDiveInlineDetail = function(paperId, dimensionName) {
  const current = state.materialOverviewDetailSelection;
  state.materialOverviewDetailSelection = current?.paperId === paperId && current?.dimensionName === dimensionName
    ? null
    : {paperId, dimensionName};
  const dim = materialDeepDiveDimension();
  if (!dim) return;
  const items = state.materialCurrentItems?.length ? state.materialCurrentItems : filteredMaterialItems();
  const ctx = materialDeepDiveContext(dim, items);
  const stats = materialDefinitionOverviewStats(ctx);
  const key = state.materialOverviewDetailKey;
  const entries = stats.detailGroups[key] || [];
  $('materialCellBody').innerHTML = materialDeepDiveOverviewDetailHtml(entries, dim.value);
};

window.openMaterialItemDetail = function(itemId) {
  const item = (state.materials || []).find(entry => entry.id === itemId);
  if (!item) return toast('未找到素材详情');
  const paper = paperById(item.paper_id);
  openMaterialDetailModal(
    item.dimension_label || materialDimensionLabel(item.dimension_name),
    paper?.metadata?.title || item.paper_id,
    [item],
  );
};

window.openMaterialCellDetail = function(paperId, dimensionName) {
  const items = materialItemsForPaperDimension(state.materialCurrentItems?.length ? state.materialCurrentItems : filteredMaterialItems(), paperId, dimensionName);
  const paper = paperById(paperId);
  openMaterialDetailModal(
    materialDimensionLabel(dimensionName),
    paper?.metadata?.title || paperId,
    items,
  );
};

window.closeMaterialCellModal = function() {
  $('materialCellModal').hidden = true;
  state.materialOverviewDetailSelection = null;
  syncModalLock();
};

function renderMaterialInsights(items) {
  const panel = $('materialInsightPanel');
  if (!panel) return;
  const deepDiveDim = materialDeepDiveDimension();
  const isDeepDive = state.materialAnalysisType === 'compare'
    && state.materialAnalysisDepth === 'deep_dive'
    && deepDiveDim;
  if ($('materialInsightHeading')) $('materialInsightHeading').textContent = isDeepDive ? '维度深挖洞察' : '洞察建议';
  if ($('materialInsightHint')) $('materialInsightHint').textContent = isDeepDive ? '跟随当前深挖视图更新' : '从当前分析范围自动总结';
  if ($('materialExplanationCard')) $('materialExplanationCard').hidden = Boolean(isDeepDive);
  if ($('materialGenerateCard')) $('materialGenerateCard').hidden = Boolean(isDeepDive);
  panel.classList.toggle('deep-dive-insight-list', Boolean(isDeepDive));
  if (isDeepDive) {
    panel.innerHTML = renderMaterialDeepDiveInsightContent(materialDeepDiveContext(deepDiveDim, items));
    return;
  }
  const dimensions = selectedMaterialDimensions();
  const missingDims = dimensions.filter(dim => !items.some(item => item.dimension_name === dim));
  const evidenceIssues = items.filter(item => item.review_status === 'mark_evidence_insufficient' || !(item.evidence || []).length).length;
  const inferredCount = items.filter(item => itemModelInferred(item)).length;
  const suggestions = [
    missingDims.length ? {
      title: '优先检查维度覆盖缺口',
      text: `${missingDims.slice(0, 3).map(materialDimensionLabel).join('、')} 当前没有可用素材，适合作为空白分析或补抽候选。`,
    } : {
      title: '维度覆盖较完整',
      text: '当前筛选范围下，各已选维度至少有一条素材，可直接进入对比或综述组织。',
    },
    evidenceIssues ? {
      title: '证据质量需要核验',
      text: `${evidenceIssues} 条素材存在无证据或证据不足风险，生成综述前建议先回到人机审查确认。`,
    } : {
      title: '证据过滤较严格',
      text: '当前结果主要来自有证据素材，适合生成引用表和 Related Work 草稿。',
    },
    inferredCount ? {
      title: '模型推断信号',
      text: `${inferredCount} 条素材包含推断成分，建议在写作材料中标注为“待核验观点”。`,
    } : {
      title: '推断素材已收紧',
      text: '当前范围基本不含模型推断，适合做事实性对比矩阵。',
    },
  ];
  panel.innerHTML = suggestions.map(item => `<article class="materials-insight-item"><b>${escapeHtml(item.title)}</b><p>${escapeHtml(item.text)}</p></article>`).join('');
}

function renderMaterialExplanations(items) {
  const panel = $('materialExplanationPanel');
  if (!panel) return;
  if (state.materialAnalysisType === 'compare' && state.materialAnalysisDepth === 'deep_dive' && materialDeepDiveDimension()) {
    panel.innerHTML = '';
    return;
  }
  const config = materialAnalysisConfig();
  const statuses = materialSelectedStatuses().map(reviewStatusLabel).join('、') || '全部状态';
  const dims = selectedMaterialDimensions().map(materialDimensionLabel).join('、') || '全部维度';
  panel.innerHTML = [
    {title: '分析视角', text: `${config.label}：${config.description}`},
    {title: '数据范围', text: `当前纳入 ${materialScopedPapers().length} 篇论文、${items.length} 条素材。`},
    {title: '过滤规则', text: `状态：${statuses}；维度：${fmt(dims, 80)}。默认会优先保留有证据、已审查的素材。`},
  ].map(item => `<article class="materials-explain-item"><b>${escapeHtml(item.title)}</b><p>${escapeHtml(item.text)}</p></article>`).join('');
}

function refreshMaterialDerivedViews(items = filteredMaterialItems()) {
  state.materialCurrentItems = items;
  updateMaterialsContext(items);
  if (state.materialAnalysisType === 'compare') renderMaterialCompareView(items);
  else renderMaterialOverview(items);
  renderMaterialResults(items);
  renderMaterialInsights(items);
  renderMaterialExplanations(items);
}

function renderMaterialsPanel() {
  const paperSetValue = $('materialPaperSetSelect')?.value || (validCustomPaperSets()[0]?.id || 'all');
  const templateValue = $('materialObjectSelect')?.value || materialReadyTemplates()[0]?.id || '';
  applySelectOptions($('materialPaperSetSelect'), materialPaperSetOptions(), paperSetValue);
  const templateOptions = materialReadyTemplates().map(template => ({value: template.id, label: template.name || template.id}));
  applySelectOptions($('materialObjectSelect'), templateOptions.length ? templateOptions : [{value: '', label: '暂无对象模板'}], templateValue);
  renderMaterialAnalysisNav();
  renderMaterialAnalysisParams();
  renderMaterialMultiSelect('materialReviewStatusChecks', 'review_status', '审查状态', 'materialReviewStatusCheck', MATERIAL_REVIEW_STATUS_OPTIONS);
  renderMaterialMultiSelect('materialEvidenceRequirementChecks', 'evidence_requirements', '证据要求', 'materialEvidenceRequirementCheck', MATERIAL_EVIDENCE_REQUIREMENT_OPTIONS);
  renderMaterialMultiSelect('materialSourceChecks', 'paper_sources', '论文来源', 'materialSourceCheck', MATERIAL_SOURCE_OPTIONS);
  renderMaterialMultiSelect('materialEvidenceStrengthChecks', 'evidence_strength', '证据强度', 'materialEvidenceStrengthCheck', MATERIAL_EVIDENCE_STRENGTH_OPTIONS);
  renderMaterialMultiSelect('materialObjectRoleChecks', 'object_roles', '对象角色', 'materialObjectRoleCheck', MATERIAL_OBJECT_ROLE_OPTIONS);
  renderMaterialDimensionChecks();
  renderComparePaperChecks();
  renderMaterialScopePanel();
  renderMaterialTopActions();
  renderMaterialResultChrome();
  renderMaterialsLayout();
  refreshMaterialDerivedViews(filteredMaterialItems());
}

async function searchMaterials() {
  const params = new URLSearchParams();
  const query = $('materialQuery')?.value?.trim() || '';
  if (query) params.set('q', query);
  const data = await api('/api/materials/search?' + params.toString());
  const items = filteredMaterialItems(data.items || []);
  refreshMaterialDerivedViews(items);
  $('materialResultHint').textContent = `已按当前条件检索到 ${items.length} 条素材。`;
  toast(`已更新分析范围：${items.length} 条素材`);
}

async function comparePapers() {
  window.setMaterialAnalysisType('compare', {silent: true});
  const ids = selectedAnalysisPaperIds();
  if (!ids.length) { toast('请至少选择一篇论文'); return; }
  const items = filteredMaterialItems();
  state.materialCurrentItems = items;
  renderMaterialCompareMatrixView(items);
  $('materialResultHint').textContent = `对比矩阵已生成：${ids.length} 篇论文，${materialCompareDimensions().length} 个维度。`;
}

async function gapAnalysis() {
  window.setMaterialAnalysisType('gap', {silent: true});
  const ids = selectedAnalysisPaperIds();
  const template = materialCurrentTemplate();
  const params = new URLSearchParams({template_id: template?.id || 'tmpl_experience_v2'});
  if (ids.length) params.set('paper_ids', ids.join(','));
  const data = await api('/api/analysis/gaps?' + params.toString());
  const selectedDims = new Set(selectedMaterialDimensions());
  const filterByDim = item => !selectedDims.size || selectedDims.has(item.dimension);
  const missing = (data.missing_dimension_items || []).filter(filterByDim);
  const low = (data.low_confidence_items || []).filter(filterByDim);
  const noEvidence = (data.items_without_evidence || []).filter(filterByDim);
  const rejected = (data.rejected_items || []).filter(filterByDim);
  $('analysisOutput').classList.remove('muted');
  $('analysisOutput').innerHTML = `
    <div class="materials-overview-grid">
      <div><span>论文</span><b>${data.paper_count || ids.length}</b></div>
      <div><span>缺失维度</span><b>${missing.length}</b></div>
      <div><span>低置信</span><b>${low.length}</b></div>
      <div><span>无证据</span><b>${noEvidence.length}</b></div>
    </div>
    <div class="materials-gap-columns">
      ${renderMaterialGapColumn('维度缺失', missing)}
      ${renderMaterialGapColumn('低置信素材', low)}
      ${renderMaterialGapColumn('无证据素材', noEvidence)}
      ${renderMaterialGapColumn('已驳回素材', rejected)}
    </div>
  `;
  $('materialResultHint').textContent = `空白分析已生成：${ids.length || materialScopedPapers().length} 篇论文。`;
}

function renderMaterialGapColumn(title, items) {
  return `<section class="materials-gap-column">
    <h4>${escapeHtml(title)}</h4>
    ${items.slice(0, 8).map(item => `<div><b>${escapeHtml(materialDimensionLabel(item.dimension))}</b><span>${escapeHtml(fmt(item.title || item.paper_id, 72))}</span></div>`).join('') || '<p class="muted">暂无明显信号。</p>'}
  </section>`;
}

function selectedAnalysisPaperIds() {
  const checked = [...document.querySelectorAll('.comparePaper:checked')].map(input => input.value);
  if (checked.length) return checked;
  return [...materialScopedPaperIds()];
}

function clampMaterialsSidebarWidth(width) {
  return Math.min(560, Math.max(280, Number(width) || 320));
}

function clampMaterialsInsightWidth(width) {
  return Math.min(520, Math.max(300, Number(width) || 340));
}

function renderMaterialsLayout() {
  const layout = $('materialsLayout');
  if (!layout) return;
  const workbench = document.querySelector('.materials-workbench');
  state.materialsSidebarWidth = clampMaterialsSidebarWidth(state.materialsSidebarWidth);
  state.materialsInsightWidth = clampMaterialsInsightWidth(state.materialsInsightWidth);
  layout.style.setProperty('--materials-sidebar-width', `${state.materialsSidebarWidth}px`);
  layout.style.setProperty('--materials-insight-width', `${state.materialsInsightWidth}px`);
  if (workbench) workbench.style.setProperty('--materials-sidebar-width', `${state.materialsSidebarWidth}px`);
  if (workbench) workbench.style.setProperty('--materials-insight-width', `${state.materialsInsightWidth}px`);
  layout.classList.toggle('materials-sidebar-collapsed', Boolean(state.materialsSidebarCollapsed));
  layout.classList.toggle('materials-insight-collapsed', Boolean(state.materialsInsightCollapsed));
  if (workbench) workbench.classList.toggle('materials-sidebar-collapsed', Boolean(state.materialsSidebarCollapsed));
  if (workbench) workbench.classList.toggle('materials-insight-collapsed', Boolean(state.materialsInsightCollapsed));
  const toggle = $('materialsSidebarToggleBtn');
  if (toggle) {
    toggle.textContent = state.materialsSidebarCollapsed ? '›' : '‹';
    toggle.title = state.materialsSidebarCollapsed ? '展开左侧面板' : '收起左侧面板';
  }
  const insightToggle = $('materialsInsightToggleBtn');
  if (insightToggle) {
    insightToggle.textContent = state.materialsInsightCollapsed ? '‹' : '›';
    insightToggle.title = state.materialsInsightCollapsed ? '展开右侧面板' : '收起右侧面板';
  }
}

window.toggleMaterialsSidebar = function() {
  state.materialsSidebarCollapsed = !state.materialsSidebarCollapsed;
  renderMaterialsLayout();
};

window.toggleMaterialsInsightPane = function() {
  state.materialsInsightCollapsed = !state.materialsInsightCollapsed;
  renderMaterialsLayout();
};

function startMaterialsSidebarResize(event) {
  if (state.materialsSidebarCollapsed) return;
  event.preventDefault();
  const startX = event.clientX;
  const startWidth = state.materialsSidebarWidth;
  state.materialsSidebarResizing = true;
  document.body.classList.add('materials-sidebar-resizing');
  const move = (moveEvent) => {
    if (!state.materialsSidebarResizing) return;
    state.materialsSidebarWidth = clampMaterialsSidebarWidth(startWidth + moveEvent.clientX - startX);
    renderMaterialsLayout();
  };
  const stop = () => {
    state.materialsSidebarResizing = false;
    document.body.classList.remove('materials-sidebar-resizing');
    window.removeEventListener('pointermove', move);
    window.removeEventListener('pointerup', stop);
    window.removeEventListener('pointercancel', stop);
  };
  window.addEventListener('pointermove', move);
  window.addEventListener('pointerup', stop);
  window.addEventListener('pointercancel', stop);
}

function startMaterialsInsightResize(event) {
  if (state.materialsInsightCollapsed) return;
  event.preventDefault();
  const startX = event.clientX;
  const startWidth = state.materialsInsightWidth;
  state.materialsInsightResizing = true;
  document.body.classList.add('materials-sidebar-resizing');
  const move = (moveEvent) => {
    if (!state.materialsInsightResizing) return;
    state.materialsInsightWidth = clampMaterialsInsightWidth(startWidth - (moveEvent.clientX - startX));
    renderMaterialsLayout();
  };
  const stop = () => {
    state.materialsInsightResizing = false;
    document.body.classList.remove('materials-sidebar-resizing');
    window.removeEventListener('pointermove', move);
    window.removeEventListener('pointerup', stop);
    window.removeEventListener('pointercancel', stop);
  };
  window.addEventListener('pointermove', move);
  window.addEventListener('pointerup', stop);
  window.addEventListener('pointercancel', stop);
}

window.setMaterialAnalysisType = function(type, options = {}) {
  if (!MATERIAL_ANALYSIS_TYPES.some(item => item.id === type)) return;
  const changed = state.materialAnalysisType !== type;
  state.materialAnalysisType = type;
  if (changed || type !== 'compare') {
    state.materialAnalysisDepth = 'root';
  }
  if (type !== 'compare') {
    state.materialDeepDiveDimension = null;
    state.materialDeepDiveAxis = '';
    state.materialDeepDiveView = 'overview_stats';
  }
  renderMaterialAnalysisNav();
  renderMaterialAnalysisParams();
  renderMaterialsBreadcrumb();
  renderMaterialScopePanel();
  renderMaterialTopActions();
  renderMaterialResultChrome();
  refreshMaterialDerivedViews(state.materialCurrentItems?.length ? state.materialCurrentItems : filteredMaterialItems());
  if (!options.silent) toast(`已切换到：${materialAnalysisConfig().label}`);
};

function currentMaterialReportPayload() {
  const items = state.materialCurrentItems?.length ? state.materialCurrentItems : filteredMaterialItems();
  const template = materialCurrentTemplate();
  return {
    exported_at: new Date().toISOString(),
    analysis_type: state.materialAnalysisType,
    paper_set: $('materialPaperSetSelect')?.selectedOptions?.[0]?.textContent || '全部论文',
    template_id: template?.id || '',
    template_name: template?.name || '',
    template_version: template?.version || '',
    paper_ids: selectedAnalysisPaperIds(),
    dimensions: selectedMaterialDimensions(),
    review_statuses: materialSelectedStatuses(),
    evidence_requirements: [...materialEvidenceRequirements()],
    analysis_params: selectedMaterialAnalysisParams(),
    item_count: items.length,
    items,
  };
}

function downloadJson(filename, payload) {
  const blob = new Blob([JSON.stringify(payload, null, 2)], {type: 'application/json'});
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function saveMaterialAnalysisView() {
  const payload = currentMaterialReportPayload();
  localStorage.setItem('litmate_material_analysis_view', JSON.stringify(payload));
  toast('分析视图已保存到本地浏览器');
}

function exportMaterialReport() {
  downloadJson(`litmate_material_analysis_${new Date().toISOString().slice(0, 10)}.json`, currentMaterialReportPayload());
  toast('已导出当前分析报告');
}

function materialCitationRows(items) {
  return items.slice(0, 18).map(item => {
    const paper = paperById(item.paper_id);
    const evidence = (item.evidence || [])[0];
    return {
      paper: paper?.metadata?.title || item.paper_id,
      year: paper?.metadata?.year || '',
      dimension: item.dimension_label || materialDimensionLabel(item.dimension_name),
      claim: item.edited_content || item.content || '',
      evidence: evidence?.quote || '',
      section: evidence?.section_title || '',
    };
  });
}

function generateMaterialArtifact(kind = 'outline') {
  const items = state.materialCurrentItems?.length ? state.materialCurrentItems : filteredMaterialItems();
  window.setMaterialAnalysisType(kind === 'plan' ? 'design' : kind === 'question' ? 'gap' : 'review_pack', {silent: true});
  const rows = materialCitationRows(items);
  if (kind === 'citation') {
    $('analysisOutput').classList.remove('muted');
    $('analysisOutput').innerHTML = `
      <div class="table-wrap">
        <table>
          <thead><tr><th>观点</th><th>论文</th><th>维度</th><th>证据</th><th>章节</th></tr></thead>
          <tbody>${rows.map(row => `<tr>
            <td>${escapeHtml(fmt(row.claim, 260))}</td>
            <td>${escapeHtml(fmt(row.paper, 120))}</td>
            <td>${escapeHtml(row.dimension)}</td>
            <td>${escapeHtml(fmt(row.evidence, 260))}</td>
            <td>${escapeHtml(row.section || '-')}</td>
          </tr>`).join('')}</tbody>
        </table>
      </div>
    `;
  } else {
    const grouped = new Map();
    rows.forEach(row => {
      if (!grouped.has(row.dimension)) grouped.set(row.dimension, []);
      grouped.get(row.dimension).push(row);
    });
    const title = {
      outline: '综述大纲',
      question: '研究问题清单',
      plan: '新方案草案',
      review_pack: '综述素材包',
    }[kind] || '科研素材';
    const sections = [...grouped.entries()].map(([dim, dimRows], index) => `
      <section class="materials-artifact-section">
        <h4>${index + 1}. ${escapeHtml(dim)}</h4>
        ${dimRows.slice(0, 4).map(row => `<p><b>${escapeHtml(fmt(row.paper, 80))}</b>：${escapeHtml(fmt(row.claim, 280))}</p>`).join('')}
      </section>
    `).join('');
    $('analysisOutput').classList.remove('muted');
    $('analysisOutput').innerHTML = `
      <article class="materials-artifact">
        <h3>${escapeHtml(title)}</h3>
        <p class="muted">基于当前 ${items.length} 条素材生成，可继续人工整理为写作段落或方案备忘。</p>
        ${sections || '<p class="muted">当前筛选范围没有可生成的素材。</p>'}
      </article>
    `;
  }
  $('materialResultHint').textContent = `已生成：${kind === 'citation' ? '观点-引用表' : '科研素材草稿'}。`;
}

function evidenceGraphTypeLabel(type) {
  return {
    paper: '论文',
    material: '抽取结果',
    dimension: '维度',
    evidence: '证据',
  }[type] || type || '节点';
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
    paper: {x: 110, label: '论文'},
    material: {x: 400, label: '抽取结果'},
    dimension: {x: 700, label: '维度'},
    evidence: {x: 990, label: '证据'},
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
    <text class="evidence-svg-layer-label" x="${col.x}" y="32">${escapeHtml(col.label)} · ${layout.layers[type]?.length || 0}</text>
  `).join('');
  const nodes = Object.values(layout.layers)
    .flat()
    .map(node => evidenceGraphNodeShape(node, layout.positions.get(node.id)))
    .join('');
  const omittedNotes = [
    visible.omitted_visible_evidence_count ? `另有 ${visible.omitted_visible_evidence_count} 个证据节点保留在“原始数据”中。` : '',
    visible.omitted_server_evidence_count ? `接口本次省略 ${visible.omitted_server_evidence_count} 个证据节点。` : '',
  ].filter(Boolean).join(' ');
  const omitted = omittedNotes ? `
    <div class="evidence-graph-note">为保持浏览器流畅，图中最多展开 ${EVIDENCE_GRAPH_MAX_EVIDENCE_NODES} 个证据节点。${escapeHtml(omittedNotes)}</div>
  ` : '';
  return `
    ${omitted}
    <svg class="evidence-graph-svg" viewBox="0 0 ${layout.width} ${layout.height}" width="${layout.width}" height="${layout.height}" role="img" aria-label="证据图">
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
          <h3>证据图</h3>
          <p>使用轻量分层图展示 ${paperIds.length} 篇论文的抽取结果证据网络，适合较多节点时快速浏览。</p>
        </div>
        <div class="evidence-graph-actions">
          <button type="button" onclick="fitEvidenceGraph()">适配视图</button>
          <button type="button" onclick="toggleEvidenceGraphRaw()">原始数据</button>
        </div>
      </header>
      <div class="evidence-graph-stats">
        <span>节点 <b>${(data.nodes || []).length}</b></span>
        <span>边 <b>${(data.links || []).length}</b></span>
        <span>论文 <b>${counts.paper || 0}</b></span>
        <span>抽取结果 <b>${counts.material || 0}</b></span>
        <span>证据 <b>${counts.evidence || 0}</b></span>
      </div>
      <div class="evidence-graph-legend">
        <span><i class="paper"></i>论文</span>
        <span><i class="material"></i>抽取结果</span>
        <span><i class="dimension"></i>维度</span>
        <span><i class="evidence"></i>证据</span>
      </div>
      <div id="evidenceGraphCanvas" class="evidence-graph-canvas">
        <div class="graph-loading">正在生成证据图...</div>
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
      toast(`${evidenceGraphTypeLabel(node.type)}：${node.label || node.id}`);
    };
  });
}

function renderEvidenceGraphVisualization(data) {
  const canvas = $('evidenceGraphCanvas');
  if (!canvas) return;
  if (!(data.nodes || []).length) {
    renderEvidenceGraphFallback('没有可视化节点。请确认所选论文已有抽取结果和证据。');
    return;
  }
  canvas.innerHTML = renderEvidenceGraphSvg(data);
  bindEvidenceGraphNodeEvents(data);
}

async function evidenceGraph() {
  window.setMaterialAnalysisType('claim_evidence', {silent: true});
  const ids = selectedAnalysisPaperIds();
  if (!ids.length) { toast('请至少选择一篇论文'); return; }
  const data = await api('/api/analysis/evidence-graph?paper_ids=' + encodeURIComponent(ids.join(',')) + '&max_evidence_nodes=180');
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
    toast('证据图尚未生成');
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
  $('materialCellClose').onclick = window.closeMaterialCellModal;
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
  $('paperLibraryControlsToggle').onclick = window.togglePaperLibraryControls;
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
      else if (el.dataset.closeModal === 'materialCellModal') closeMaterialCellModal();
      else if (el.dataset.closeModal === 'objectConfigModal') closeObjectConfigModal();
      else if (el.dataset.closeModal === 'configModal') closeConfigModal();
      else closePaperDetail();
    };
  });
  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return;
    if (state.materialDropdownOpen) {
      state.materialDropdownOpen = null;
      renderMaterialDropdownOpenStates();
    } else if (!$('promptPickerMenu')?.hidden) closePromptPicker();
    else if (!$('objectImportModal').hidden) closeObjectImportModal();
    else if (!$('simulationRawModal').hidden) closeSimulationRawModal();
    else if (!$('extractionResultModal').hidden) closeExtractionResultModal();
    else if (!$('materialCellModal').hidden) closeMaterialCellModal();
    else if (!$('promptPreviewModal').hidden) closePromptPreviewModal();
    else if (!$('paperDetailModal').hidden) closePaperDetail();
    else if (!$('objectConfigModal').hidden) closeObjectConfigModal();
    else if (!$('configModal').hidden) closeConfigModal();
  });
  document.addEventListener('click', (event) => {
    if ($('materialsScopeBody') && !$('materialsScopeBody').contains(event.target) && state.materialDropdownOpen) {
      state.materialDropdownOpen = null;
      renderMaterialDropdownOpenStates();
    }
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
    if (!ids.length) return toast('请至少选择一篇已校验论文');
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
    if (!file) return toast('请选择文件');
    const form = new FormData(); form.append('file', file);
    await runPaperImport('正在上传并解析...', file.name, 'upload', () => api('/api/papers/upload', {method:'POST', body: form}));
  };
  $('arxivBtn').onclick = async () => {
    const values = getArxivValues(); if (!values.length) return toast('请输入 arXiv ID');
    if (values.length > 1) {
      await runArxivBatchImport(values);
      return;
    }
    const title = values.length === 1 ? values[0] : `批量 arXiv 导入（${values.length} 篇）`;
    await runPaperImport('正在从 arXiv 导入...', title, 'arxiv', () => api('/api/papers/import/arxiv', {method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({arxiv_id_or_url: values[0]})}));
  };
  $('doiBtn').onclick = async () => {
    const v = $('doiInput').value.trim(); if (!v) return toast('请输入 DOI');
    await runPaperImport('正在从 DOI 导入...', v, 'doi', () => api('/api/papers/import/doi', {method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({doi: v, try_download_pdf: $('doiPdf').checked})}));
  };
  $('bibtexBtn').onclick = async () => {
    const v = $('bibtexInput').value.trim(); if (!v) return toast('请输入 BibTeX');
    await runPaperImport('正在导入 BibTeX...', 'BibTeX 元数据', 'bibtex', () => api('/api/papers/import/bibtex', {method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({bibtex_text: v})}));
  };
  $('runExtractionBtn').onclick = runSelectedExtractions;
  $('materialsScopeToggleBtn').onclick = window.toggleMaterialScopePanel;
  $('materialsSidebarToggleBtn').onpointerdown = (event) => event.stopPropagation();
  $('materialsSidebarToggleBtn').onclick = window.toggleMaterialsSidebar;
  $('materialsSidebarResizeHandle').onpointerdown = startMaterialsSidebarResize;
  $('materialsInsightToggleBtn').onpointerdown = (event) => event.stopPropagation();
  $('materialsInsightToggleBtn').onclick = window.toggleMaterialsInsightPane;
  $('materialsInsightResizeHandle').onpointerdown = startMaterialsInsightResize;
  $('materialPaperSetSelect').onchange = () => {
    renderComparePaperChecks();
    refreshMaterialDerivedViews(filteredMaterialItems());
  };
  $('materialObjectSelect').onchange = () => {
    renderMaterialDimensionChecks();
    renderComparePaperChecks();
    refreshMaterialDerivedViews(filteredMaterialItems());
  };
  const materialFilterSelector = '.materialDimCheck, .materialReviewStatusCheck, .materialEvidenceRequirementCheck, .materialSourceCheck, .materialEvidenceStrengthCheck, .materialObjectRoleCheck, .materialParamCheck, #materialYearStart, #materialYearEnd';
  const handleMaterialFilterChange = (event) => {
    if (event.target.matches(materialFilterSelector)) {
      refreshMaterialDropdownLabels();
      refreshMaterialDerivedViews(filteredMaterialItems());
    }
  };
  $('materialsScopeBody').addEventListener('change', handleMaterialFilterChange);
  $('materialsLayout').addEventListener('change', handleMaterialFilterChange);
  bindMaterialTopActions();
  $('materialGenerateOutlineBtn').onclick = () => generateMaterialArtifact('outline');
  $('materialGenerateCitationBtn').onclick = () => generateMaterialArtifact('citation');
  $('materialGenerateQuestionBtn').onclick = () => generateMaterialArtifact('question');
  $('materialGeneratePlanBtn').onclick = () => generateMaterialArtifact('plan');
  $('searchMaterialsBtn').onclick = searchMaterials;
  if ($('compareBtn')) $('compareBtn').onclick = comparePapers;
  if ($('gapBtn')) $('gapBtn').onclick = gapAnalysis;
  if ($('graphBtn')) $('graphBtn').onclick = evidenceGraph;
}

setupTabs(); bindEvents(); refreshAll().catch(err => toast(err.message));
