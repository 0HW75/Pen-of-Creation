"""
统一AI服务接口
支持多种AI服务提供商的统一调用
"""
from abc import ABC, abstractmethod
from typing import Dict, Optional, Any, List
from app.config.ai_config import ai_config
import logging

logger = logging.getLogger(__name__)


class AIServiceProvider(ABC):
    """
    AI服务提供商抽象基类
    """
    
    def __init__(self, provider: str):
        """
        初始化服务提供商
        """
        self.provider = provider
        self.config = ai_config.get_provider_config(provider)
    
    @abstractmethod
    def chat_completion(self, messages: List[Dict[str, str]], **kwargs) -> Dict[str, Any]:
        """
        聊天完成接口
        """
        pass
    
    def is_configured(self) -> bool:
        """
        检查是否已配置
        """
        return ai_config.is_provider_configured(self.provider)
    
    @abstractmethod
    def test_connection(self) -> Dict[str, Any]:
        """
        测试API连通性
        """
        pass
    
    @abstractmethod
    def stream_chat_completion(self, messages: List[Dict[str, str]], **kwargs) -> Any:
        """
        流式聊天完成接口
        """
        pass


class AIService:
    """
    统一AI服务类
    """
    
    def __init__(self):
        """
        初始化AI服务
        """
        self.providers = {}
        self._load_providers()
    
    def _load_providers(self):
        """
        加载服务提供商
        """
        # 动态加载提供商实现
        try:
            from app.services.providers.openai_provider import OpenAIProvider
            self.providers['openai'] = OpenAIProvider()
        except Exception as e:
            logger.warning(f"加载OpenAI提供商失败: {e}")
        
        try:
            from app.services.providers.anthropic_provider import AnthropicProvider
            self.providers['anthropic'] = AnthropicProvider()
        except Exception as e:
            logger.warning(f"加载Anthropic提供商失败: {e}")
        
        try:
            from app.services.providers.google_provider import GoogleProvider
            self.providers['google'] = GoogleProvider()
        except Exception as e:
            logger.warning(f"加载Google提供商失败: {e}")
        
        try:
            from app.services.providers.azure_provider import AzureProvider
            self.providers['azure'] = AzureProvider()
        except Exception as e:
            logger.warning(f"加载Azure提供商失败: {e}")
        
        try:
            from app.services.providers.siliconflow_provider import SiliconFlowProvider
            self.providers['siliconflow'] = SiliconFlowProvider()
        except Exception as e:
            logger.warning(f"加载硅基流动提供商失败: {e}")
    
    def get_provider(self, provider: Optional[str] = None) -> Optional[AIServiceProvider]:
        """
        获取服务提供商
        """
        provider = provider or ai_config.get_default_provider()
        return self.providers.get(provider)
    
    def chat_completion(self, messages: List[Dict[str, str]], provider: Optional[str] = None, **kwargs) -> Dict[str, Any]:
        """
        统一聊天完成接口
        """
        ai_provider = self.get_provider(provider)
        if not ai_provider:
            raise ValueError(f"AI服务提供商不存在: {provider}")
        
        if not ai_provider.is_configured():
            raise ValueError(f"AI服务提供商未配置: {provider}")
        
        return ai_provider.chat_completion(messages, **kwargs)
    
    def get_available_providers(self) -> List[str]:
        """
        获取可用的服务提供商
        """
        return list(self.providers.keys())
    
    def get_configured_providers(self) -> List[str]:
        """
        获取已配置的服务提供商
        """
        return [provider for provider, instance in self.providers.items() if instance.is_configured()]
    
    def test_connection(self, provider: Optional[str] = None) -> Dict[str, Any]:
        """
        测试API连通性
        """
        ai_provider = self.get_provider(provider)
        if not ai_provider:
            raise ValueError(f"AI服务提供商不存在: {provider}")
        
        if not ai_provider.is_configured():
            raise ValueError(f"AI服务提供商未配置: {provider}")
        
        return ai_provider.test_connection()
    
    def stream_chat_completion(self, messages: List[Dict[str, str]], provider: Optional[str] = None, **kwargs) -> Any:
        """
        流式聊天完成接口
        """
        ai_provider = self.get_provider(provider)
        if not ai_provider:
            raise ValueError(f"AI服务提供商不存在: {provider}")
        
        if not ai_provider.is_configured():
            raise ValueError(f"AI服务提供商未配置: {provider}")
        
        return ai_provider.stream_chat_completion(messages, **kwargs)


# 创建全局AI服务实例
ai_service = AIService()


if __name__ == "__main__":
    # 测试AI服务
    print(f"可用的服务提供商: {ai_service.get_available_providers()}")
    print(f"已配置的服务提供商: {ai_service.get_configured_providers()}")
    
    # 测试聊天完成
    try:
        messages = [
            {"role": "system", "content": "你是一位专业的小说作家"},
            {"role": "user", "content": "请写一个简短的故事开头"}
        ]
        result = ai_service.chat_completion(messages)
        print(f"聊天完成结果: {result}")
    except Exception as e:
        print(f"测试失败: {e}")
