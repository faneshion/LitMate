const state = {
  papers: [],
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
  reviewItemIndex: 0,
  reviewFilters: {dimension: 'all', status: 'all', risk: 'all', query: ''},
  reviewScrollTimer: null
};
const PAPER_PAGE_SIZE = 6;
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
const fmt = (s, n=180) => s && s.length > n ? s.slice(0, n) + '…' : (s || '');
const fmtTime = (s) => s ? new Date(s).toLocaleString() : '-';
const fmtDuration = (seconds) => {
  const value = Number(seconds);
  if (!Number.isFinite(value)) return '-';
  if (value < 60) return `${value.toFixed(value < 10 ? 1 : 0)} 秒`;
  return `${Math.floor(value / 60)} 分 ${Math.round(value % 60)} 秒`;
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
  [state.papers, state.templates, state.runs, state.materials, state.reviewFeedback] = await Promise.all([
    api('/api/papers'), api('/api/templates'), api('/api/extractions'), api('/api/materials'), api('/api/feedback/dimensions')
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

function importedArray(value) {
  if (Array.isArray(value)) return value.filter(item => item !== null && item !== undefined);
  if (typeof value === 'string') return lines(value);
  return [];
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
  renderObjectConfigForm();
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
  dim.required = $('dimRequired').checked;
  dim.requires_evidence = $('dimRequiredEvidence').checked;
  dim.allow_inference = $('dimAllowInference').checked;
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

function objectConfigToTemplate(cfg) {
  ensurePromptManagerState(cfg);
  ensureModelingState(cfg);
  const activePrompt = activePromptProfile(cfg);
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
      updated_at: item.updated_at || new Date().toISOString(),
    })),
    active_prompt_id: cfg.prompts.active_id,
    modeling: cfg.modeling || defaultModelingState(),
    dimensions: (cfg.dimensions || []).map(d => ({
      name: d.dimension_id,
      label: d.name,
      description: [d.description, d.question ? `Question: ${d.question}` : ''].filter(Boolean).join('\n'),
      output_type: d.output_type || 'list',
      required_evidence: d.requires_evidence !== false,
      allow_not_found: d.required !== true,
      fields: (d.fields || []).map(field => typeof field === 'string' ? field : field.name).filter(Boolean),
      examples: [],
      negative_examples: cfg.term_rules.concept_policy.exclude_rules || [],
      retrieval_keywords: d.retrieval_keywords || [],
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

async function saveResearchObjectConfig() {
  collectObjectConfigFromForm();
  if (state.objectPromptDirty && $('objectPromptPreview')?.value.trim()) {
    saveSelectedPromptDraft();
    state.objectPromptDirty = false;
  }
  const template = objectConfigToTemplate(state.objectConfig);
  await api('/api/templates', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify(template),
  });
  toast('对象建模配置已保存');
  await refreshAll();
  openObjectConfigModal();
}

async function publishObjectTemplate() {
  await saveResearchObjectConfig();
  toast('模板已发布，可在科研对象抽取中使用');
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
    const template = objectConfigToTemplate(state.objectConfig);
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
    updatePaperOp(paperId, {percent: value, status: '解析中'});
  }, 850);
}

async function runPaperImport(label, pendingTitle, source, action) {
  const jobId = addPaperJob(pendingTitle, source);
  const timer = startImportProgress(label, (percent, status) => {
    updatePaperJob(jobId, {percent, status});
  });
  try {
    await action();
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
        await api('/api/papers/import/arxiv', {method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({arxiv_id_or_url: value})});
      } finally {
        clearInterval(timer);
      }
      const completed = Math.floor(((index + 1) / total) * 100);
      const completedLabel = `已完成 ${index + 1}/${total} 篇`;
      setImportProgressValue(completed, completedLabel);
      updatePaperJob(jobId, {percent: completed, status: completedLabel});
    }
    $('importProgress').classList.add('done');
    toast(`批量导入完成：${total} 篇`);
    state.paperPage = 1;
    await refreshAll();
    setTimeout(() => { $('importProgress').hidden = true; }, 900);
  } catch (err) {
    $('importProgress').classList.add('error');
    $('importProgressLabel').textContent = err.message;
    $('importProgressPercent').textContent = '失败';
    toast(err.message);
  } finally {
    setImportBusy(false);
    removePaperJob(jobId);
  }
}

function renderPapers() {
  const list = $('paperList');
  const items = [
    ...state.paperJobs.map(job => ({type: 'job', job})),
    ...state.papers.map(paper => ({type: 'paper', paper}))
  ];
  const total = items.length;
  const pageCount = Math.max(1, Math.ceil(total / PAPER_PAGE_SIZE));
  if (state.paperPage > pageCount) state.paperPage = pageCount;
  if (state.paperPage < 1) state.paperPage = 1;

  $('paperCount').textContent = total ? `${state.papers.length} 篇论文` : '';

  const start = (state.paperPage - 1) * PAPER_PAGE_SIZE;
  const pageItems = items.slice(start, start + PAPER_PAGE_SIZE);
  list.innerHTML = pageItems.map(item => {
    if (item.type === 'job') {
      const percent = Math.max(0, Math.min(100, Math.round(item.job.percent || 0)));
      return `
        <div class="paper-row pending-row">
          <div class="paper-row-main">
            <div class="paper-title-line">
              <h3 class="paper-title" title="${escapeHtml(item.job.title)}">${escapeHtml(item.job.title)}</h3>
              <span class="badge pending">解析中 ${percent}%</span>
            </div>
            <div class="meta">${escapeHtml(sourceLabel(item.job.source))} · ${escapeHtml(item.job.status || '解析中')} · 开始于 ${escapeHtml(item.job.startedAt)}</div>
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
    const p = item.paper;
    const status = paperStatus(p);
    const parser = status.parser ? ` · parser ${status.parser}` : '';
    const opProgress = status.op ? `
      <div class="paper-row-progress">
        <div class="paper-row-progress-bar" style="width: ${Math.max(0, Math.min(100, Math.round(status.op.percent || 0)))}%"></div>
      </div>
    ` : '';
    return `
      <div class="paper-row ${p.id === state.selectedPaperId ? 'active' : ''}" data-paper-id="${escapeHtml(p.id)}">
        <div class="paper-row-main">
          <div class="paper-title-line">
            <h3 class="paper-title" title="${escapeHtml(p.metadata.title)}">${escapeHtml(p.metadata.title)}</h3>
            <span class="badge ${status.className}">${status.label}</span>
          </div>
          <div class="paper-authors-line">${escapeHtml((p.metadata.authors || []).slice(0, 4).join(', ') || '作者未知')} ${p.metadata.year || ''}</div>
          <div class="paper-meta-line"><span>来源：</span><b>${escapeHtml(sourceLabel(p.source))}${escapeHtml(parser)}</b></div>
          <div class="paper-meta-line">
            <span>导入：</span><b>${escapeHtml(fmtTime(p.created_at))}</b>
            <span> · 解析：</span><b>${escapeHtml(fmtTime(p.updated_at))}</b>
            <span> · 耗时：</span><b>${escapeHtml(fmtDuration(p.metadata?.extra?.parse_duration_seconds))}</b>
          </div>
          ${opProgress}
        </div>
        <div class="paper-actions">
          <button onclick="openPaperDetail('${p.id}')">查看详情</button>
          <button onclick="exportPaper('${p.id}')">导出 JSON</button>
          <button onclick="deletePaper('${p.id}')">删除</button>
        </div>
        <div class="paper-stats">
          ${listStat('Sections', p.sections.length)}
          ${listStat('Chunks', p.chunks.length)}
          ${listStat('Figures', p.figures.length)}
          ${listStat('Refs', p.references.length)}
        </div>
      </div>
    `;
  }).join('') || '<p class="muted">暂无论文。</p>';

  $('paperPagination').innerHTML = total > PAPER_PAGE_SIZE ? `
    <button ${state.paperPage === 1 ? 'disabled' : ''} onclick="goPaperPage(${state.paperPage - 1})">上一页</button>
    <span class="meta">第 ${state.paperPage} / ${pageCount} 页</span>
    <button ${state.paperPage === pageCount ? 'disabled' : ''} onclick="goPaperPage(${state.paperPage + 1})">下一页</button>
  ` : '';

  if (state.selectedPaperId && !state.papers.some(p => p.id === state.selectedPaperId)) {
    state.selectedPaperId = null;
    closePaperDetail();
  }
}

window.goPaperPage = function(page) {
  state.paperPage = page;
  renderPapers();
};

function renderPaperDetail(p) {
  const meta = p.metadata || {};
  const authors = meta.authors || [];
  const extra = meta.extra || {};
  const published = extra.published ? String(extra.published).slice(0, 10) : '';
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
  $('paperReparseBtn').textContent = state.paperOps[p.id] ? '重新抽取中' : '重新抽取';
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
  const timer = startPaperOpProgress(id, '重新抽取中');
  if (state.selectedPaperId === id && !$('paperDetailModal').hidden) {
    $('paperReparseBtn').disabled = true;
    $('paperReparseBtn').textContent = '重新抽取中';
  }
  toast('正在重新抽取论文解析结果...');
  try {
    const paper = await api(`/api/papers/${id}/reparse`, {method: 'POST'});
    upsertPaperInState(paper);
    updatePaperOp(id, {percent: 100, status: '解析完成'});
    toast('重新抽取完成');
    await refreshAll();
    if (state.selectedPaperId === id && !$('paperDetailModal').hidden) {
      openPaperDetail(id);
    }
  } catch (err) {
    toast(err.message);
  } finally {
    clearInterval(timer);
    removePaperOp(id);
    if (state.selectedPaperId === id && !$('paperDetailModal').hidden) {
      $('paperReparseBtn').disabled = false;
      $('paperReparseBtn').textContent = '重新抽取';
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
  $('templateSelect').innerHTML = state.templates.map(t => `<option value="${t.id}">${escapeHtml(t.name)} (${t.version})</option>`).join('');
  if (selectedTemplateId && state.templates.some(t => t.id === selectedTemplateId)) {
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
  const t = state.templates.find(x => x.id === $('templateSelect').value) || state.templates[0];
  if (!t) {
    $('templateSummary').textContent = '暂无抽取模板。请先在“对象建模工作台”中保存或发布模板。';
    return;
  }
  $('templateSummary').innerHTML = `
    <b>${escapeHtml(t.name)}</b>
    <span>${escapeHtml(t.description || '无说明')}</span>
    <span>${(t.dimensions || []).length} 个维度 · 激活 Prompt：${escapeHtml(t.active_prompt_id || '默认')}</span>
  `;
}

function renderDimensionChecks() {
  const t = state.templates.find(x => x.id === $('templateSelect').value) || state.templates[0];
  $('dimensionChecks').innerHTML = t ? t.dimensions.map(d => `
    <label><input type="checkbox" class="dimCheck" value="${d.name}" checked /> ${escapeHtml(d.label)} <span class="muted">${escapeHtml(d.name)}</span></label>
  `).join('') : '<p class="muted">暂无模板。</p>';
}

function latestRunForPaper(paperId, templateId = '') {
  return state.runs.find(r => r.paper_id === paperId && (!templateId || r.template_id === templateId));
}

function jobKey(paperId, templateId) {
  return `${paperId}::${templateId}`;
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
    const progress = status === 'completed' ? 100 : status === 'running' ? 68 : status === 'queued' ? 18 : status === 'failed' ? 100 : 0;
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
  state.reviewRunId = id;
  state.reviewItemIndex = 0;
  document.querySelector('[data-tab="review"]').click();
  renderReviewPanel();
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
    state.extractionJobs[jobKey(id, templateId)] = {status: 'queued', message: '等待开始'};
  });
  renderExtractionPaperRuns();
  let completed = 0;
  for (const paperId of paperIds) {
    const key = jobKey(paperId, templateId);
    state.extractionJobs[key] = {status: 'running', message: '正在调用大模型'};
    renderExtractionPaperRuns();
    try {
      const run = await api('/api/extractions/run', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({paper_id: paperId, template_id: templateId, dimension_names: dims}),
      });
      state.runs = [run, ...state.runs.filter(item => item.id !== run.id)];
      state.extractionJobs[key] = {status: 'completed', message: `${run.items.length} 条结果，${run.errors.length} 个错误`, run};
      completed += 1;
    } catch (err) {
      state.extractionJobs[key] = {status: 'failed', message: err.message};
    }
    renderRunList();
    renderExtractionPaperRuns();
  }
  $('runExtractionBtn').disabled = false;
  toast(`抽取任务完成：${completed}/${paperIds.length} 篇成功`);
  await refreshAll();
  paperIds.forEach(id => {
    const key = jobKey(id, templateId);
    const latest = latestRunForPaper(id, templateId);
    if (latest && state.extractionJobs[key]?.status === 'completed') {
      state.extractionJobs[key].run = latest;
    }
  });
  renderExtractionPaperRuns();
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

function renderReviewPanel() {
  const selectedRunId = state.reviewRunId || $('reviewRunSelect')?.value;
  $('reviewRunSelect').innerHTML = state.runs.map(r => {
    const p = state.papers.find(x => x.id === r.paper_id);
    const t = state.templates.find(x => x.id === r.template_id);
    return `<option value="${escapeHtml(r.id)}">${escapeHtml(fmt(t?.name || r.template_id, 28))} · ${escapeHtml(fmt(p?.metadata.title || r.paper_id, 52))}</option>`;
  }).join('');
  const validRun = state.runs.find(r => r.id === selectedRunId) || state.runs[0];
  state.reviewRunId = validRun?.id || null;
  if (validRun) $('reviewRunSelect').value = validRun.id;
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

function reviewStatusLabel(status) {
  return REVIEW_STATUS_LABELS[status] || status || '待审查';
}

function reviewStatusGroup(status) {
  if (['confirm', 'revise', 'confirmed', 'needs_revision'].includes(status)) return 'accepted';
  if (status && status !== 'pending') return 'issues';
  return 'pending';
}

function reviewRun() {
  return state.runs.find(r => r.id === state.reviewRunId) || state.runs[0];
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
  const run = reviewRun();
  if (!run) return [];
  const paper = reviewPaper(run);
  const template = reviewTemplate(run);
  return (run.items || []).map((item, index) => ({run, paper, template, item, index, risk: reviewRisk({item})}));
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
  return dim?.description || dim?.label || entry.item.dimension_label || entry.item.dimension_name;
}

function renderReviewFilters() {
  const run = reviewRun();
  const dimensions = [...new Map((run?.items || []).map(item => [item.dimension_name, item.dimension_label || item.dimension_name])).entries()];
  $('reviewDimensionFilter').innerHTML = '<option value="all">全部维度</option>' + dimensions.map(([id, label]) => `<option value="${escapeHtml(id)}">${escapeHtml(label)}</option>`).join('');
  const dimensionValue = dimensions.some(([id]) => id === state.reviewFilters.dimension) ? state.reviewFilters.dimension : 'all';
  state.reviewFilters.dimension = dimensionValue;
  $('reviewDimensionFilter').value = dimensionValue;
  $('reviewStatusFilter').value = state.reviewFilters.status || 'all';
  $('reviewRiskFilter').value = state.reviewFilters.risk || 'all';
  $('reviewSearchInput').value = state.reviewFilters.query || '';
}

function updateReviewFiltersFromInputs() {
  state.reviewFilters = {
    dimension: $('reviewDimensionFilter').value,
    status: $('reviewStatusFilter').value,
    risk: $('reviewRiskFilter').value,
    query: $('reviewSearchInput').value,
  };
  state.reviewItemIndex = 0;
  renderReviewWorkbench();
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
  $('reviewTemplateName').textContent = template?.name || run.template_id;
  $('reviewTemplateMeta').textContent = `模板 v${template?.version || '-'} · Prompt ${prompt?.name || prompt?.id || run.template_id} · ${run.model || '未知模型'}`;
  const entries = filteredReviewEntries();
  state.reviewItemIndex = Math.min(Math.max(state.reviewItemIndex, 0), Math.max(entries.length - 1, 0));
  renderReviewTopbar();
  renderReviewQueue(entries);
  const entry = entries[state.reviewItemIndex];
  renderReviewMain(entry);
  renderReviewEvidence(entry);
}

function renderReviewTopbar() {
  const items = reviewQueueItems();
  const done = items.filter(entry => (entry.item.review_status || 'pending') !== 'pending').length;
  const total = items.length;
  const pct = total ? Math.round(done / total * 100) : 0;
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
  $('reviewMainPane').innerHTML = `
    <section class="review-main-header">
      <div>
        <span class="kicker">维度结果 ${entry.index + 1}</span>
        <h3>${escapeHtml(item.dimension_label || item.dimension_name)}</h3>
        <p>${escapeHtml(entry.paper?.metadata?.title || entry.run.paper_id)}</p>
      </div>
      <div class="review-header-signals">
        <span class="review-confidence ${confidenceClass(item.confidence)}"><span>confidence</span><b>${confidenceText(item.confidence)}</b></span>
        <span class="badge ${escapeHtml(item.review_status || 'pending')}">${escapeHtml(reviewStatusLabel(item.review_status || 'pending'))}</span>
      </div>
    </section>
    <section class="review-mini-metrics">
      <div><span>研究对象</span><b>${escapeHtml(entry.template?.name || entry.run.template_id)}</b></div>
      <div><span>维度 ID</span><b>${escapeHtml(item.dimension_name)}</b></div>
      <div><span>证据</span><b>${(item.evidence || []).length} 条</b></div>
      <div><span>风险</span><b>${riskLabel(entry.risk)}</b></div>
    </section>
    <section class="review-section">
      <h4>抽取问题</h4>
      <p class="review-question">${escapeHtml(reviewDimensionQuestion(entry))}</p>
    </section>
    <section class="review-section">
      <h4>模型抽取结果</h4>
      <div class="review-answer">${escapeHtml(item.content || '无内容')}</div>
    </section>
    <section class="review-section">
      <h4>人工修订</h4>
      <label class="review-field">
        <span>标题</span>
        <input id="reviewTitleInput" class="review-input" value="${escapeHtml(item.edited_title || item.title)}" />
      </label>
      <label class="review-field review-field-full">
        <span>内容</span>
        <textarea id="reviewContentInput" class="review-textarea review-content-editor" rows="5">${escapeHtml(item.edited_content || item.content)}</textarea>
      </label>
      <div class="review-inline-actions">
        <button type="button" onclick="fillReviewContent('model')">使用模型答案</button>
        <button type="button" onclick="fillReviewContent('not_reported')">填入 not_reported</button>
        <button type="button" onclick="fillReviewContent('clear')">清空</button>
      </div>
    </section>
    <section class="review-section review-feedback-panel">
      <div>
        <h4>错误标签</h4>
        <div class="review-error-tags">${renderReviewErrorTags(item)}</div>
      </div>
      <div class="review-attribution-grid">
        <label class="review-field">
          <span>根因归属</span>
          <select id="reviewRootCauseSelect" class="review-input">${renderReviewSelectOptions(REVIEW_ROOT_CAUSES, item.review_root_cause)}</select>
        </label>
        <label class="review-field">
          <span>建议升级位置</span>
          <select id="reviewTargetSelect" class="review-input">${renderReviewSelectOptions(REVIEW_SUGGESTED_TARGETS, item.review_suggested_target)}</select>
        </label>
      </div>
      <label class="review-field review-field-full">
        <span>审查评论</span>
        <textarea id="reviewNoteInput" class="review-textarea review-note-editor" rows="2" placeholder="写下判断依据、修改原因或模板升级线索">${escapeHtml(item.user_note || '')}</textarea>
      </label>
      <div class="review-action-grid">${renderReviewActionButtons(entry.run.id, item)}</div>
    </section>
  `;
  document.querySelectorAll('.reviewErrorTag').forEach(input => {
    input.onchange = () => input.closest('.review-error-tag')?.classList.toggle('checked', input.checked);
  });
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
      <header><h3>证据与上下文</h3><span>${(item.evidence || []).length} 条证据</span></header>
      ${(item.evidence || []).map((ev, index) => renderEvidenceCard(ev, entry, index)).join('') || '<p class="muted">无证据绑定。</p>'}
    </section>
    <section class="review-side-section">
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
    <section class="review-side-section">
      <header><h3>模板升级候选</h3></header>
      ${candidates.slice(0, 3).map(item => `<div class="review-upgrade-card"><b>${escapeHtml(item.target_level)} · ${escapeHtml(item.suggested_target)}</b><p>${escapeHtml(item.recommended_change)}</p></div>`).join('') || '<p class="muted">当前维度暂无明显升级候选。</p>'}
    </section>
    <section class="review-side-section">
      <header><h3>当前记录预览</h3></header>
      <pre class="review-record-preview">${escapeHtml(JSON.stringify(buildReviewPreview(entry), null, 2))}</pre>
    </section>
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
  return `<article class="review-evidence-card ${risky ? 'risky' : ''}">
    <header>
      <b>证据 ${index + 1}</b>
      <span>${escapeHtml(ev.section_title || 'Unknown')} · p.${ev.page_start || '?'}</span>
    </header>
    <blockquote>${escapeHtml(ev.quote || '无证据原文')}</blockquote>
    <div class="review-context-stack">
      ${prev ? `<div><b>上一段</b><p>${escapeHtml(fmt(prev.text, 320))}</p></div>` : ''}
      <div class="current"><b>当前段</b><p>${escapeHtml(fmt(current?.text || ev.quote || '', 420))}</p></div>
      ${next ? `<div><b>下一段</b><p>${escapeHtml(fmt(next.text, 320))}</p></div>` : ''}
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
}

window.selectReviewItem = function(index) {
  state.reviewItemIndex = index;
  renderReviewWorkbench();
};

function setReviewItemIndex(index) {
  const entries = filteredReviewEntries();
  if (!entries.length) return;
  state.reviewItemIndex = Math.min(Math.max(index, 0), entries.length - 1);
  renderReviewWorkbench();
}

window.moveReviewItem = function(direction) {
  setReviewItemIndex(state.reviewItemIndex + direction);
};

window.fillReviewContent = function(mode) {
  const entry = currentReviewEntry();
  if (!entry) return;
  if (mode === 'model') $('reviewContentInput').value = entry.item.content || '';
  if (mode === 'not_reported') $('reviewContentInput').value = 'not_reported';
  if (mode === 'clear') $('reviewContentInput').value = '';
};

window.reviewItem = async function(runId, itemId, status) {
  const payload = {
    status,
    edited_title: $('reviewTitleInput').value,
    edited_content: $('reviewContentInput').value,
    user_note: $('reviewNoteInput').value,
    tags: [...document.querySelectorAll('.reviewErrorTag:checked')].map(x => x.value),
    root_cause: $('reviewRootCauseSelect').value || null,
    suggested_target: $('reviewTargetSelect').value || null,
  };
  await api(`/api/extractions/${runId}/items/${itemId}/review`, {
    method: 'PUT', headers: {'Content-Type':'application/json'}, body: JSON.stringify(payload)
  });
  toast('审查状态已保存，并同步到反馈池');
  const previousRunId = state.reviewRunId;
  await refreshAll();
  state.reviewRunId = previousRunId;
  if ($('reviewRunSelect')) $('reviewRunSelect').value = previousRunId;
  renderReviewWorkbench();
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
  $('materialDimension').innerHTML = '<option value="">全部维度</option>' + dims.map(d => `<option value="${d}">${d}</option>`).join('');
  $('comparePaperChecks').innerHTML = state.papers.map(p => `<label><input type="checkbox" class="comparePaper" value="${p.id}" /> ${escapeHtml(fmt(p.metadata.title, 90))}</label>`).join('') || '<p class="muted">暂无论文。</p>';
}

async function searchMaterials() {
  const params = new URLSearchParams();
  if ($('materialQuery').value) params.set('q', $('materialQuery').value);
  if ($('materialDimension').value) params.set('dimension_name', $('materialDimension').value);
  if ($('materialStatus').value) params.set('status', $('materialStatus').value);
  const data = await api('/api/materials/search?' + params.toString());
  $('materialResults').innerHTML = data.items.map(m => `
    <div class="item">
      <h3>${escapeHtml(m.dimension_label)} · ${escapeHtml(m.title)} <span class="badge ${m.review_status}">${escapeHtml(reviewStatusLabel(m.review_status))}</span></h3>
      <p>${escapeHtml(fmt(m.content, 700))}</p>
      ${(m.evidence || []).slice(0, 2).map(e => `<div class="evidence">${escapeHtml(fmt(e.quote, 260))}</div>`).join('')}
      <div class="meta">paper ${m.paper_id} · tags ${(m.tags || []).join(', ')}</div>
    </div>`).join('') || '<p class="muted">没有匹配素材。</p>';
}

async function comparePapers() {
  const ids = [...document.querySelectorAll('.comparePaper:checked')].map(x => x.value);
  if (!ids.length) { toast('请至少选择一篇论文'); return; }
  const data = await api('/api/analysis/compare?paper_ids=' + encodeURIComponent(ids.join(',')) + '&template_id=tmpl_experience_v2');
  const cols = ['title', 'year', ...data.dimensions];
  $('analysisOutput').innerHTML = `<div class="table-wrap"><table><thead><tr>${cols.map(c => `<th>${escapeHtml(c)}</th>`).join('')}</tr></thead><tbody>${data.matrix.map(row => `<tr>${cols.map(c => `<td>${escapeHtml(fmt(row[c], 600))}</td>`).join('')}</tr>`).join('')}</tbody></table></div><h4>缺口</h4><pre>${escapeHtml(JSON.stringify(data.gaps, null, 2))}</pre>`;
}

async function gapAnalysis() {
  const data = await api('/api/analysis/gaps?template_id=tmpl_experience_v2');
  $('analysisOutput').innerHTML = `<pre>${escapeHtml(JSON.stringify(data, null, 2))}</pre>`;
}

async function evidenceGraph() {
  const data = await api('/api/analysis/evidence-graph');
  $('analysisOutput').innerHTML = `<p>当前证据图包含 ${data.nodes.length} 个节点、${data.links.length} 条边。可将下面 JSON 接入 D3/Cytoscape 可视化。</p><pre>${escapeHtml(JSON.stringify(data, null, 2))}</pre>`;
}

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
  $('saveObjectConfigBtn').onclick = saveResearchObjectConfig;
  $('publishObjectTemplateBtn').onclick = publishObjectTemplate;
  $('publishObjectTemplateInlineBtn').onclick = publishObjectTemplate;
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
  $('reviewRunSelect').onchange = () => {
    state.reviewRunId = $('reviewRunSelect').value || null;
    state.reviewItemIndex = 0;
    renderReviewPanel();
  };
  ['reviewDimensionFilter', 'reviewStatusFilter', 'reviewRiskFilter'].forEach(id => {
    $(id).onchange = updateReviewFiltersFromInputs;
  });
  $('reviewSearchInput').addEventListener('input', updateReviewFiltersFromInputs);
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
    await runPaperImport('正在从 arXiv 导入...', title, 'arxiv', async () => {
      for (const value of values) {
        await api('/api/papers/import/arxiv', {method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({arxiv_id_or_url: value})});
      }
    });
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
  $('searchMaterialsBtn').onclick = searchMaterials;
  $('compareBtn').onclick = comparePapers;
  $('gapBtn').onclick = gapAnalysis;
  $('graphBtn').onclick = evidenceGraph;
}

setupTabs(); bindEvents(); refreshAll().catch(err => toast(err.message));
