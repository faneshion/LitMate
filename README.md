# Literature Research Assistant V2

面向 V2 研究辅助目标的文献精读与科研对象抽取系统原型。系统包含四个模块：

1. **论文管理版块**：支持 PDF/TXT/MD 上传、arXiv 导入、DOI/Crossref 元数据导入、BibTeX 导入；解析正文、章节、图表标题、参考文献和元数据。
2. **科研对象抽取版块**：支持通过对象建模工作台定义科研对象，并形成具体抽取 Prompt；调用 OpenAI-compatible 本地大模型逐维度抽取知识，并绑定原文证据。
3. **人机协同审查版块**：支持查看、编辑、确认、驳回、标记需修改，并添加研究笔记和标签。
4. **素材管理与分析版块**：将抽取结果同步为素材，支持检索、跨论文对比矩阵、空白分析、证据图数据导出。

## 快速启动

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
python run.py
```

打开：

```text
http://localhost:7860
```

默认模型配置：

```env
OPENAI_API_KEY=EMPTY
OPENAI_API_BASE=http://localhost:8000/v1
OPENAI_MODEL=local-model
```

请把 `OPENAI_API_BASE` 和 `OPENAI_MODEL` 改成你的本地服务实际地址和模型名。

## 数据存储

所有数据均存储为本地 JSONL：

```text
data/
  papers.jsonl
  templates.jsonl
  extraction_runs.jsonl
  materials.jsonl
  notes.jsonl
  uploads/
  figures/
  texts/
```

## 后端 API 概览

### 论文管理

- `POST /api/papers/upload`
- `POST /api/papers/import/arxiv`
- `POST /api/papers/import/doi`
- `POST /api/papers/import/bibtex`
- `GET /api/papers`
- `GET /api/papers/{paper_id}`

### 科研对象抽取

- `GET /api/templates`
- `POST /api/templates`
- `POST /api/extractions/run`
- `GET /api/extractions`
- `GET /api/extractions/{run_id}`

### 人机审查

- `PUT /api/extractions/{run_id}/items/{item_id}/review`
- `POST /api/notes`
- `GET /api/notes`

### 素材与分析

- `GET /api/materials`
- `GET /api/materials/search`
- `GET /api/analysis/compare`
- `GET /api/analysis/gaps`
- `GET /api/analysis/evidence-graph`
- `GET /api/export/all`

## 当前实现边界

- PDF 解析会优先尝试 MinerU：若本机可用 `mineru` 命令，则使用 MinerU 输出的 Markdown / content_list JSON 保留公式、表格、图片 caption 与章节结构；若 MinerU 未安装或运行失败，会自动回落到 pypdf + PyMuPDF 的 best-effort 策略。
- DOI 导入优先使用 Crossref 元数据；只有记录中包含可访问 PDF 链接时才会自动下载正文。
- JSONL 更新采用整文件重写，适合本地研究原型；多人协作或大规模部署建议替换为 SQLite/PostgreSQL + 对象存储。
- 证据绑定依赖模型输出 quote/chunk_id，并带有程序端兜底匹配；正式版本建议加入更强的引用定位与高亮组件。

### 可选：启用 MinerU

MinerU 属于较重的 PDF 解析依赖，默认不会随 `requirements.txt` 安装。需要提升公式、表格和多栏论文解析效果时，先按 MinerU 官方文档安装并确认命令可用：

```bash
mineru --help
```

然后保持 `.env` 中的默认配置即可：

```env
MINERU_ENABLED=true
MINERU_COMMAND=mineru
MINERU_BACKEND=pipeline
MINERU_TIMEOUT_SECONDS=900
MINERU_OUTPUT_DIR=data/mineru
```

## 推荐开发下一步

- 增加向量索引：FAISS / Chroma，用于更准确的 chunk 召回和素材检索。
- 增加 PDF 高亮：把 evidence quote 定位到 PDF 页面坐标。
- 增加项目空间：按研究课题管理论文、模板、素材与综述草稿。
- 增加模板评估：统计每个维度的确认率、修改率、未发现率。
- 增加 Word/LaTeX/Markdown 导出。
