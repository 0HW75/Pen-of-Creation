"""
基础生成器类
所有实体生成器的基类
"""
from abc import ABC, abstractmethod
from typing import Dict, Any, Optional, List
import logging

from app.services.ai_service import ai_service
from app.services.generation.prompt_template_manager import template_manager
from app.services.generation.generation_strategy import strategy_selector, GenerationStrategy
from app.services.generation.context_assembler import context_assembler
from app.services.generation.result_parser import result_parser

logger = logging.getLogger(__name__)


class BaseGenerator(ABC):
    """基础生成器抽象类"""
    
    def __init__(self, entity_type: str):
        """
        初始化生成器
        
        Args:
            entity_type: 实体类型标识
        """
        self.entity_type = entity_type
        self.ai_service = ai_service
        self.template_manager = template_manager
        self.strategy_selector = strategy_selector
        self.context_assembler = context_assembler
        self.result_parser = result_parser
    
    def generate(self,
                 prompt: str,
                 world_id: Optional[int] = None,
                 project_id: Optional[int] = None,
                 strategy: str = 'detailed',
                 style: str = "",
                 custom_parameters: Optional[Dict[str, Any]] = None,
                 include_related_entities: Optional[List[str]] = None) -> Dict[str, Any]:
        """
        生成实体设定
        
        Args:
            prompt: 用户输入的生成提示
            world_id: 世界观ID
            project_id: 项目ID
            strategy: 生成策略
            style: 风格要求
            custom_parameters: 自定义生成参数
            include_related_entities: 需要包含的相关实体类型
        
        Returns:
            生成结果
        """
        try:
            # 1. 选择生成策略
            gen_strategy = self.strategy_selector.select_strategy(
                self.entity_type, strategy
            )
            
            # 2. 获取生成参数
            gen_params = self.strategy_selector.get_parameters(
                gen_strategy, custom_parameters or {}
            )
            
            # 3. 获取提示词模板
            template = self.template_manager.get_template(
                self.entity_type, strategy
            )
            
            if not template:
                return {
                    'success': False,
                    'error': f'未找到 {self.entity_type} 类型的生成模板'
                }
            
            # 4. 组装上下文
            variables = self.context_assembler.build_prompt_variables(
                user_prompt=prompt,
                style=style,
                world_id=world_id,
                project_id=project_id,
                include_world_info=True,
                include_related_entities=include_related_entities
            )
            
            # 5. 渲染提示词
            final_prompt = template.render(variables)
            
            # 6. 调用AI服务
            messages = [
                {"role": "system", "content": "你是一位专业的小说设定创作助手。请根据提供的世界观信息和用户要求，生成详细的设定内容。必须以JSON格式返回结果。"},
                {"role": "user", "content": final_prompt}
            ]
            
            logger.info(f"开始生成 {self.entity_type}，策略: {strategy}")
            
            ai_result = self.ai_service.chat_completion(
                messages=messages,
                **gen_params.to_dict()
            )
            
            # 7. 解析结果
            raw_content = ai_result.get('content', '')
            parsed_result = self.result_parser.parse(raw_content, self.entity_type)
            
            # 8. 验证结果
            if parsed_result['success']:
                validation = self.result_parser.validate_result(
                    parsed_result['data'], self.entity_type
                )
                parsed_result['validation'] = validation
            
            # 9. 添加元数据
            parsed_result['metadata'] = {
                'entity_type': self.entity_type,
                'strategy': strategy,
                'world_id': world_id,
                'project_id': project_id,
                'prompt': prompt,
                'tokens_used': ai_result.get('tokens_used', 0),
                'provider': ai_result.get('provider', 'unknown')
            }
            
            logger.info(f"生成 {self.entity_type} 完成")
            return parsed_result
            
        except Exception as e:
            logger.error(f"生成 {self.entity_type} 失败: {e}")
            return {
                'success': False,
                'error': str(e),
                'entity_type': self.entity_type
            }
    
    def generate_batch(self,
                      prompts: List[str],
                      world_id: Optional[int] = None,
                      project_id: Optional[int] = None,
                      batch_size: int = 3,
                      **kwargs) -> List[Dict[str, Any]]:
        """
        批量生成实体
        
        Args:
            prompts: 提示列表
            world_id: 世界观ID
            project_id: 项目ID
            batch_size: 每批生成的数量
            **kwargs: 其他参数
        
        Returns:
            生成结果列表
        """
        results = []
        
        for i, prompt in enumerate(prompts):
            logger.info(f"批量生成进度: {i+1}/{len(prompts)}")
            result = self.generate(
                prompt=prompt,
                world_id=world_id,
                project_id=project_id,
                **kwargs
            )
            results.append(result)
        
        return results
    
    @abstractmethod
    def save_to_database(self, data: Dict[str, Any], 
                        world_id: Optional[int] = None,
                        project_id: Optional[int] = None) -> Dict[str, Any]:
        """
        保存生成的数据到数据库
        
        Args:
            data: 生成的数据
            world_id: 世界观ID
            project_id: 项目ID
        
        Returns:
            保存结果
        """
        pass
    
    def get_supported_fields(self) -> List[str]:
        """获取支持的字段列表"""
        return self.result_parser._get_valid_fields(self.entity_type)
    
    def get_required_fields(self) -> List[str]:
        """获取必要字段列表"""
        return self.result_parser._get_required_fields(self.entity_type)
