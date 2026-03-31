"""
智能概念合并服务
用于合并从不同章节提取的重复或相似概念元素
"""
import re
import difflib
from typing import List, Dict, Any, Tuple, Optional
from dataclasses import dataclass, field
from collections import defaultdict
import logging

logger = logging.getLogger(__name__)


@dataclass
class MergeInfo:
    """合并信息"""
    strategy: str  # 合并策略：name_match, semantic_match, evidence_merge
    similarity: float  # 相似度分数
    merge_reason: str  # 合并原因说明
    merged_count: int  # 合并的元素数量


@dataclass
class AttributeChange:
    """属性变化轨迹"""
    field: str  # 字段名
    chapter: str  # 章节信息
    old_value: Any  # 旧值
    new_value: Any  # 新值
    change_type: str  # 变化类型：add, update, delete


@dataclass
class ElementSource:
    """元素来源信息"""
    chapter: str  # 章节名称
    chapter_id: Optional[str] = None  # 章节ID
    evidence: str = ""  # 原文证据
    confidence: float = 1.0  # 置信度


@dataclass
class MergedElement:
    """合并后的元素"""
    # 原始字段
    id: str
    name: str
    type: str
    brief: str = ""
    description: str = ""

    # 合并相关字段
    sources: List[ElementSource] = field(default_factory=list)  # 来源列表
    attribute_changes: List[AttributeChange] = field(default_factory=list)  # 属性变化轨迹
    merge_info: Optional[MergeInfo] = None  # 合并信息

    # 扩展字段（动态存储其他属性）
    extra_fields: Dict[str, Any] = field(default_factory=dict)

    def to_dict(self) -> Dict[str, Any]:
        """转换为字典格式"""
        result = {
            'id': self.id,
            'name': self.name,
            'type': self.type,
            'brief': self.brief,
            'description': self.description,
            'sources': [
                {
                    'chapter': s.chapter,
                    'chapter_id': s.chapter_id,
                    'evidence': s.evidence,
                    'confidence': s.confidence
                } for s in self.sources
            ],
            'attribute_changes': [
                {
                    'field': c.field,
                    'chapter': c.chapter,
                    'old_value': c.old_value,
                    'new_value': c.new_value,
                    'change_type': c.change_type
                } for c in self.attribute_changes
            ],
            'merge_info': {
                'strategy': self.merge_info.strategy,
                'similarity': self.merge_info.similarity,
                'merge_reason': self.merge_info.merge_reason,
                'merged_count': self.merge_info.merged_count
            } if self.merge_info else None
        }
        result.update(self.extra_fields)
        return result


class ConceptMergeService:
    """
    概念合并服务

    用于智能合并从不同章节提取的重复或相似概念元素。
    支持基于名称相似度和语义相似度的合并策略。
    """

    def __init__(self, similarity_threshold: float = 0.85):
        """
        初始化合并服务

        Args:
            similarity_threshold: 相似度阈值，默认0.85
        """
        self.similarity_threshold = similarity_threshold
        self._name_similarity_threshold = 0.85
        logger.info(f"ConceptMergeService 初始化完成，相似度阈值: {similarity_threshold}")

    def merge_elements(self, elements: List[Dict[str, Any]], concept_type: str) -> List[MergedElement]:
        """
        主合并方法

        对同一类型的概念元素进行智能合并，识别重复或相似的概念。

        Args:
            elements: 原始元素列表，每个元素是字典格式
            concept_type: 概念类型（如 character, location 等）

        Returns:
            合并后的元素列表

        Example:
            >>> service = ConceptMergeService()
            >>> elements = [
            ...     {'id': 'char_001', 'name': '张三', 'type': 'protagonist', 'brief': '主角'},
            ...     {'id': 'char_002', 'name': '张三', 'type': 'protagonist', 'brief': '主角，武功高强'},
            ... ]
            >>> result = service.merge_elements(elements, 'character')
        """
        if not elements:
            return []

        logger.info(f"开始合并 {concept_type} 类型元素，共 {len(elements)} 个")

        try:
            # 1. 查找重复概念组
            duplicate_groups = self._find_duplicate_groups(elements)
            logger.info(f"找到 {len(duplicate_groups)} 个重复组")

            # 2. 合并每组重复概念
            merged_elements = []
            processed_ids = set()

            for group in duplicate_groups:
                if len(group) > 1:
                    merged = self._merge_group(group)
                    merged_elements.append(merged)
                    for elem in group:
                        processed_ids.add(elem.get('id'))
                else:
                    # 单独的元素，转换为 MergedElement
                    elem = group[0]
                    merged = self._create_single_element(elem)
                    merged_elements.append(merged)
                    processed_ids.add(elem.get('id'))

            # 3. 处理未被分组的元素
            for elem in elements:
                if elem.get('id') not in processed_ids:
                    merged = self._create_single_element(elem)
                    merged_elements.append(merged)

            logger.info(f"合并完成，结果: {len(merged_elements)} 个元素")
            return merged_elements

        except Exception as e:
            logger.error(f"合并元素时出错: {str(e)}", exc_info=True)
            # 出错时返回原始元素的简单转换
            return [self._create_single_element(elem) for elem in elements]

    def _find_duplicate_groups(self, elements: List[Dict[str, Any]]) -> List[List[Dict[str, Any]]]:
        """
        查找重复概念组

        基于名称相似度和语义相似度将元素分组。

        Args:
            elements: 元素列表

        Returns:
            分组后的元素列表，每个组是一个元素列表
        """
        if not elements:
            return []

        n = len(elements)
        visited = [False] * n
        groups = []

        for i in range(n):
            if visited[i]:
                continue

            # 开始新组
            group = [elements[i]]
            visited[i] = True

            for j in range(i + 1, n):
                if visited[j]:
                    continue

                # 检查两个元素是否匹配
                if self._is_match(elements[i], elements[j]):
                    group.append(elements[j])
                    visited[j] = True

            groups.append(group)

        return groups

    def _is_match(self, elem1: Dict[str, Any], elem2: Dict[str, Any]) -> bool:
        """
        检查两个元素是否匹配（应该被合并）

        Args:
            elem1: 第一个元素
            elem2: 第二个元素

        Returns:
            是否匹配
        """
        # 1. 检查名称匹配
        if self._is_name_match(elem1.get('name', ''), elem2.get('name', '')):
            return True

        # 2. 检查语义匹配
        if self._is_semantic_match(elem1, elem2):
            return True

        return False

    def _is_name_match(self, name1: str, name2: str) -> bool:
        """
        检查两个名称是否匹配

        只匹配完全相同的名称，不同人名绝不合并。

        Args:
            name1: 第一个名称
            name2: 第二个名称

        Returns:
            是否匹配
        """
        if not name1 or not name2:
            return False

        norm1 = self._normalize_name(name1)
        norm2 = self._normalize_name(name2)

        if norm1 == norm2:
            return True

        return False

    def _calculate_similarity(self, name1: str, name2: str) -> float:
        """
        计算两个名称的相似度

        使用编辑距离（Levenshtein距离）和序列匹配器综合计算。

        Args:
            name1: 第一个名称
            name2: 第二个名称

        Returns:
            相似度分数（0-1之间）
        """
        if not name1 or not name2:
            return 0.0

        # 使用 difflib 的 SequenceMatcher 计算相似度
        similarity = difflib.SequenceMatcher(None, name1, name2).ratio()

        # 额外检查：包含关系
        if name1 in name2 or name2 in name1:
            # 较长的名称包含较短的名称，提升相似度
            containment_bonus = 0.1
            similarity = min(1.0, similarity + containment_bonus)

        return similarity

    def _is_semantic_match(self, elem1: Dict[str, Any], elem2: Dict[str, Any]) -> bool:
        """
        检查两个元素的语义是否匹配

        基于类型、简介、证据等字段进行语义相似度判断。

        Args:
            elem1: 第一个元素
            elem2: 第二个元素

        Returns:
            是否语义匹配（仅当名称完全相同时才匹配）
        """
        name1 = elem1.get('name', '')
        name2 = elem2.get('name', '')

        if not name1 or not name2:
            return False

        norm1 = self._normalize_name(name1)
        norm2 = self._normalize_name(name2)

        if norm1 == norm2:
            return True

        return False

    def _merge_group(self, group: List[Dict[str, Any]]) -> MergedElement:
        """
        合并一组重复概念

        Args:
            group: 重复概念组

        Returns:
            合并后的元素
        """
        if not group:
            raise ValueError("合并组不能为空")

        if len(group) == 1:
            return self._create_single_element(group[0])

        # 选择主元素（通常选择信息最完整的）
        primary = self._select_primary_element(group)

        # 创建合并后的元素
        merged = MergedElement(
            id=primary.get('id', ''),
            name=primary.get('name', ''),
            type=primary.get('type', ''),
            brief=primary.get('brief', ''),
            description=primary.get('description', '')
        )

        # 收集所有来源
        all_sources = []
        for elem in group:
            source = ElementSource(
                chapter=self._get_chapter_from_source(elem.get('source', '')),
                chapter_id=elem.get('chapter_id'),
                evidence=elem.get('evidence', ''),
                confidence=elem.get('confidence', 1.0)
            )
            all_sources.append(source)

        merged.sources = all_sources

        # 合并字段内容（按章节）
        contents_by_chapter = defaultdict(list)
        for elem in group:
            chapter = self._get_chapter_from_source(elem.get('source', ''))
            contents_by_chapter[chapter].append(elem)

        # 合并描述字段
        merged.description = self._merge_field_content(
            [elem.get('description', '') for elem in group if elem.get('description')]
        )

        # 合并简介字段
        merged.brief = self._merge_field_content(
            [elem.get('brief', '') for elem in group if elem.get('brief')]
        )

        # 检测属性变化
        merged.attribute_changes = self._detect_attribute_changes(group)

        # 设置合并信息
        # 计算平均相似度
        similarities = []
        for i in range(len(group)):
            for j in range(i + 1, len(group)):
                sim = self._calculate_similarity(
                    group[i].get('name', ''),
                    group[j].get('name', '')
                )
                similarities.append(sim)

        avg_similarity = sum(similarities) / len(similarities) if similarities else 1.0

        # 确定合并策略
        if all(e.get('name') == primary.get('name') for e in group):
            strategy = 'name_match'
            reason = '名称完全匹配'
        else:
            strategy = 'semantic_match'
            reason = '语义相似度匹配'

        merged.merge_info = MergeInfo(
            strategy=strategy,
            similarity=avg_similarity,
            merge_reason=reason,
            merged_count=len(group)
        )

        # 收集其他字段
        extra_fields = set()
        for elem in group:
            extra_fields.update(elem.keys())

        # 排除已处理的字段
        processed_fields = {'id', 'name', 'type', 'brief', 'description', 'source', 'chapter_id', 'evidence', 'confidence'}
        for field in extra_fields - processed_fields:
            values = [elem.get(field) for elem in group if elem.get(field) is not None]
            if values:
                if isinstance(values[0], list):
                    # 合并列表
                    merged_list = []
                    for v in values:
                        if isinstance(v, list):
                            merged_list.extend(v)
                        else:
                            merged_list.append(v)
                    merged.extra_fields[field] = list(set(merged_list))
                elif isinstance(values[0], dict):
                    # 合并字典（取最后一个非空值）
                    merged.extra_fields[field] = values[-1]
                else:
                    # 字符串或其他类型，合并内容
                    merged.extra_fields[field] = self._merge_field_content([str(v) for v in values])

        return merged

    def _select_primary_element(self, group: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        从组中选择主元素

        选择信息最完整的元素作为主元素。

        Args:
            group: 元素组

        Returns:
            主元素
        """
        def score_element(elem):
            """计算元素的信息完整度分数"""
            score = 0
            if elem.get('name'):
                score += 10
            if elem.get('description'):
                score += len(elem.get('description', ''))
            if elem.get('brief'):
                score += len(elem.get('brief', ''))
            if elem.get('evidence'):
                score += 5
            return score

        return max(group, key=score_element)

    def _merge_field_content(self, contents: List[str]) -> str:
        """
        按章节合并字段内容

        智能合并多个内容片段，去除重复信息。

        Args:
            contents: 内容列表

        Returns:
            合并后的内容
        """
        if not contents:
            return ''

        if len(contents) == 1:
            return contents[0]

        # 去重（基于相似度）
        unique_contents = [contents[0]]
        for content in contents[1:]:
            is_duplicate = False
            for existing in unique_contents:
                similarity = difflib.SequenceMatcher(None, content, existing).ratio()
                if similarity >= self.similarity_threshold:
                    is_duplicate = True
                    break
            if not is_duplicate:
                unique_contents.append(content)

        # 合并内容
        if len(unique_contents) == 1:
            return unique_contents[0]

        # 智能合并：保留所有独特信息
        merged_parts = []
        for i, content in enumerate(unique_contents):
            if i == 0:
                merged_parts.append(content)
            else:
                # 检查新内容是否包含已有信息
                is_contained = any(content in existing for existing in merged_parts)
                if not is_contained:
                    # 检查是否有重叠部分
                    overlap_found = False
                    for j, existing in enumerate(merged_parts):
                        # 查找最长公共子串
                        s = difflib.SequenceMatcher(None, existing, content)
                        match = s.find_longest_match(0, len(existing), 0, len(content))
                        if match.size > 10:  # 有显著重叠
                            # 合并重叠部分
                            overlap_found = True
                            # 取较长的版本
                            if len(content) > len(existing):
                                merged_parts[j] = content
                            break

                    if not overlap_found:
                        merged_parts.append(content)

        return '\n\n'.join(merged_parts)

    def _detect_attribute_changes(self, group: List[Dict[str, Any]]) -> List[AttributeChange]:
        """
        检测属性变化轨迹

        分析组内元素的属性变化情况。

        Args:
            group: 元素组

        Returns:
            属性变化列表
        """
        changes = []

        if len(group) < 2:
            return changes

        # 按章节排序（假设章节有顺序）
        sorted_group = sorted(group, key=lambda e: self._get_chapter_from_source(e.get('source', '')))

        # 检测各字段的变化
        fields_to_check = ['brief', 'description', 'type', 'evidence']

        for i in range(1, len(sorted_group)):
            prev_elem = sorted_group[i - 1]
            curr_elem = sorted_group[i]

            prev_chapter = self._get_chapter_from_source(prev_elem.get('source', ''))
            curr_chapter = self._get_chapter_from_source(curr_elem.get('source', ''))

            for field in fields_to_check:
                prev_val = prev_elem.get(field)
                curr_val = curr_elem.get(field)

                if prev_val != curr_val:
                    if not prev_val and curr_val:
                        change_type = 'add'
                    elif prev_val and not curr_val:
                        change_type = 'delete'
                    else:
                        change_type = 'update'

                    changes.append(AttributeChange(
                        field=field,
                        chapter=curr_chapter,
                        old_value=prev_val,
                        new_value=curr_val,
                        change_type=change_type
                    ))

        return changes

    def _extract_key_attributes(self, text: str) -> Dict[str, Any]:
        """
        从文本提取关键属性

        从描述文本中提取关键属性信息。

        Args:
            text: 描述文本

        Returns:
            提取的属性字典
        """
        attributes = {}

        if not text:
            return attributes

        # 提取关键信息模式
        patterns = {
            'age': r'(\d+)[岁歲]',
            'gender': r'(男|女|男性|女性|少年|少女|青年|中年|老年)',
            'title': r'称号[为是][:：]?([^，。；]+)',
            'position': r'(位于|在|地处)([^，。；]+)',
            'level': r'(等级|境界|修为|实力)[为是][:：]?(\w+)',
        }

        for attr_name, pattern in patterns.items():
            matches = re.findall(pattern, text)
            if matches:
                attributes[attr_name] = matches[0] if isinstance(matches[0], str) else matches[0][-1]

        return attributes

    def _normalize_name(self, name: str) -> str:
        """
        标准化名称

        去除空格、统一大小写、去除常见前缀后缀。

        Args:
            name: 原始名称

        Returns:
            标准化后的名称
        """
        if not name:
            return ''

        # 去除前后空格
        normalized = name.strip()

        # 统一为小写（中文不受影响）
        normalized = normalized.lower()

        # 去除常见前缀
        prefixes = ['the ', 'a ', 'an ']
        for prefix in prefixes:
            if normalized.startswith(prefix):
                normalized = normalized[len(prefix):]

        # 去除常见后缀（如"大人"、"先生"等敬称）
        suffixes = ['大人', '先生', '女士', '小姐', '阁下', '殿下']
        for suffix in suffixes:
            if normalized.endswith(suffix):
                normalized = normalized[:-len(suffix)]

        # 去除多余空格
        normalized = ' '.join(normalized.split())

        return normalized

    def _get_chapter_from_source(self, source: str) -> str:
        """
        从来源提取章节信息

        Args:
            source: 来源字符串

        Returns:
            章节信息
        """
        if not source:
            return '未知章节'

        # 尝试提取章节名称
        chapter_patterns = [
            r'第[一二三四五六七八九十百零\d]+章[：:]?([^，。；\n]+)',
            r'章纲[《\[]?([^》\]]+)[》\]]?',
            r'chapter[\s]*[:：]?([^，。；\n]+)',
        ]

        for pattern in chapter_patterns:
            match = re.search(pattern, source, re.IGNORECASE)
            if match:
                return match.group(1).strip()

        # 返回原始来源的简化版本
        if len(source) > 50:
            return source[:50] + '...'
        return source

    def _create_single_element(self, elem: Dict[str, Any]) -> MergedElement:
        """
        将单个元素转换为 MergedElement

        Args:
            elem: 原始元素

        Returns:
            MergedElement 对象
        """
        merged = MergedElement(
            id=elem.get('id', ''),
            name=elem.get('name', ''),
            type=elem.get('type', ''),
            brief=elem.get('brief', ''),
            description=elem.get('description', '')
        )

        # 添加来源信息
        source = ElementSource(
            chapter=self._get_chapter_from_source(elem.get('source', '')),
            chapter_id=elem.get('chapter_id'),
            evidence=elem.get('evidence', ''),
            confidence=elem.get('confidence', 1.0)
        )
        merged.sources = [source]

        # 收集其他字段
        processed_fields = {'id', 'name', 'type', 'brief', 'description', 'source', 'chapter_id', 'evidence', 'confidence'}
        for key, value in elem.items():
            if key not in processed_fields:
                merged.extra_fields[key] = value

        return merged

    def preview_merge(self, elements: List[Dict[str, Any]], concept_type: str) -> Dict[str, Any]:
        """
        预览合并结果（不实际合并）

        用于前端展示合并预览，让用户确认合并策略。

        Args:
            elements: 原始元素列表
            concept_type: 概念类型

        Returns:
            预览结果，包含合并建议和统计信息
        """
        if not elements:
            return {
                'concept_type': concept_type,
                'total_elements': 0,
                'suggested_groups': [],
                'statistics': {
                    'total': 0,
                    'will_merge': 0,
                    'will_keep': 0
                }
            }

        # 查找重复组
        duplicate_groups = self._find_duplicate_groups(elements)

        # 构建预览信息
        suggested_groups = []
        will_merge_count = 0
        will_keep_count = 0

        for group in duplicate_groups:
            if len(group) > 1:
                # 计算组内相似度
                similarities = []
                for i in range(len(group)):
                    for j in range(i + 1, len(group)):
                        sim = self._calculate_similarity(
                            group[i].get('name', ''),
                            group[j].get('name', '')
                        )
                        similarities.append(sim)

                avg_similarity = sum(similarities) / len(similarities) if similarities else 1.0

                suggested_groups.append({
                    'type': 'merge',
                    'elements': [
                        {
                            'id': elem.get('id'),
                            'name': elem.get('name'),
                            'brief': elem.get('brief', '')[:100] + '...' if len(elem.get('brief', '')) > 100 else elem.get('brief', '')
                        } for elem in group
                    ],
                    'similarity': avg_similarity,
                    'reason': '名称相似' if avg_similarity >= self.similarity_threshold else '语义相似',
                    'suggested_name': self._select_primary_element(group).get('name', '')
                })
                will_merge_count += len(group)
            else:
                suggested_groups.append({
                    'type': 'keep',
                    'elements': [
                        {
                            'id': group[0].get('id'),
                            'name': group[0].get('name'),
                            'brief': group[0].get('brief', '')[:100] + '...' if len(group[0].get('brief', '')) > 100 else group[0].get('brief', '')
                        }
                    ]
                })
                will_keep_count += 1

        return {
            'concept_type': concept_type,
            'total_elements': len(elements),
            'similarity_threshold': self.similarity_threshold,
            'suggested_groups': suggested_groups,
            'statistics': {
                'total': len(elements),
                'will_merge': will_merge_count,
                'will_keep': will_keep_count,
                'merge_groups': len([g for g in suggested_groups if g['type'] == 'merge']),
                'keep_groups': len([g for g in suggested_groups if g['type'] == 'keep'])
            }
        }


# 创建全局实例
concept_merge_service = ConceptMergeService()
