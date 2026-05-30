from __future__ import annotations

from .models import DimensionConfig, ExtractionTemplate


def default_experience_template() -> ExtractionTemplate:
    return ExtractionTemplate(
        id="tmpl_experience_v2",
        name="经验机制文献抽取模板 V2",
        version="2.0",
        description="面向经验/记忆/知识/反馈机制研究的文献精读抽取模板。强调证据绑定、claim-实验区分和可复用研究素材。",
        system_prompt=(
            "你是严谨的科研文献精读助手。只基于论文片段抽取结构化研究素材。"
            "每条结果必须尽量绑定原文证据，区分作者claim、实验支持、系统推断和局限。"
            "没有明确证据时返回 not_found。输出必须是合法 JSON。"
        ),
        dimensions=[
            DimensionConfig(
                name="research_task",
                label="研究任务",
                description="论文试图解决的核心研究任务、输入输出、应用场景。",
                fields=["task", "input", "output", "scenario"],
                retrieval_keywords=["task", "problem", "input", "output", "benchmark", "setting", "研究任务", "问题"],
            ),
            DimensionConfig(
                name="core_claim",
                label="核心 Claim",
                description="作者明确提出并试图证明的核心主张，注意不要把模型推断当作作者主张。",
                fields=["claim", "claim_type", "supporting_evidence", "conditions"],
                retrieval_keywords=["claim", "contribution", "we show", "we demonstrate", "本文", "贡献"],
            ),
            DimensionConfig(
                name="method_innovation",
                label="方法创新性",
                description="方法相对已有工作的关键创新、模块、机制或流程差异。",
                fields=["innovation", "module", "difference_from_prior_work"],
                retrieval_keywords=["method", "approach", "framework", "architecture", "innovation", "novel", "方法", "创新"],
            ),
            DimensionConfig(
                name="experience_definition",
                label="经验定义",
                description="论文是否定义 experience、memory、knowledge、feedback、lesson、reflection 等经验性对象，以及定义方式。",
                fields=["term", "definition", "scope", "explicit_or_implicit"],
                retrieval_keywords=["experience", "memory", "knowledge", "feedback", "lesson", "reflection", "definition", "经验", "记忆", "反馈"],
            ),
            DimensionConfig(
                name="experience_source",
                label="经验来源",
                description="经验来自哪里，如交互轨迹、用户反馈、专家标注、模型反思、失败案例、环境反馈或外部知识库。",
                fields=["source", "collection_process", "human_or_automatic"],
                retrieval_keywords=["trajectory", "feedback", "interaction", "logs", "demonstration", "human", "environment", "来源", "轨迹"],
            ),
            DimensionConfig(
                name="experience_extraction_method",
                label="经验抽取方法",
                description="经验如何被获得、总结、抽取、学习、压缩或构建。",
                fields=["extraction_method", "algorithm", "prompting", "learning_process"],
                retrieval_keywords=["extract", "summarize", "reflection", "learn", "cluster", "compress", "preference", "抽取", "总结"],
            ),
            DimensionConfig(
                name="experience_representation",
                label="经验表示方式",
                description="经验被表示成自然语言、规则、向量、key-value memory、图、案例、prompt demonstration、policy 参数等形式。",
                fields=["representation", "storage", "granularity", "updateability"],
                retrieval_keywords=["representation", "memory", "embedding", "rule", "case", "graph", "key-value", "表示", "存储"],
            ),
            DimensionConfig(
                name="experience_usage",
                label="经验使用方式",
                description="经验如何被用于检索增强、规划、推理、生成、重排序、纠错、决策、训练或 agent memory recall。",
                fields=["usage", "stage", "mechanism", "target_task"],
                retrieval_keywords=["retrieve", "retrieval", "use", "augment", "planning", "reasoning", "rerank", "decision", "使用", "检索"],
            ),
            DimensionConfig(
                name="experience_update",
                label="经验更新机制",
                description="经验是否会动态更新、遗忘、合并、验证、迁移，或在新任务中适配。",
                fields=["update_trigger", "update_rule", "forgetting", "transfer"],
                retrieval_keywords=["update", "adapt", "continual", "online", "merge", "forget", "transfer", "更新", "迁移"],
            ),
            DimensionConfig(
                name="experimental_evidence",
                label="实验效果与证据",
                description="论文如何证明方法有效，包括数据集、指标、baseline、消融实验、提升幅度和证据位置。",
                fields=["dataset", "metric", "baseline", "result", "ablation"],
                retrieval_keywords=["experiment", "evaluation", "dataset", "metric", "baseline", "ablation", "results", "实验", "指标"],
            ),
            DimensionConfig(
                name="limitations",
                label="局限性与适用条件",
                description="作者承认的局限、实验暴露的局限、方法适用边界。需要区分作者明确说明和系统推断。",
                fields=["limitation", "condition", "risk", "explicit_or_inferred"],
                retrieval_keywords=["limitation", "future work", "fail", "challenge", "only", "assume", "局限", "未来工作"],
            ),
            DimensionConfig(
                name="reusable_design_pattern",
                label="可复用设计模式",
                description="对后续研究方案设计有复用价值的机制、流程、模块组合或实验设计。可以包含系统推断，但必须标明推断性质。",
                fields=["pattern", "reuse_context", "why_useful", "evidence_or_inference"],
                retrieval_keywords=["framework", "pipeline", "module", "design", "workflow", "reusable", "pipeline", "设计"],
            ),
            DimensionConfig(
                name="review_material",
                label="综述写作素材",
                description="适合作为综述中的定义、分类、对比、motivation、related work 或 future work 的素材。",
                fields=["material_type", "draft_sentence", "citation_use", "evidence"],
                retrieval_keywords=["contribution", "related work", "motivation", "future work", "definition", "综述", "引用"],
            ),
        ],
    )
