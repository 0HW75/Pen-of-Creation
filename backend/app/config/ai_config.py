"""
AI API配置模块
支持多种AI服务提供商的配置管理
"""
import os
import json
from typing import Dict, Optional, Any


class AIConfig:
    """
    AI服务配置管理类
    """
    
    def __init__(self):
        """
        初始化AI配置
        """
        self.config_file = os.path.join(os.path.dirname(__file__), 'ai_config.json')
        self.config = self._load_config()
        self.default_provider = self.config.get('default_provider', 'openai')
    
    def _load_config(self) -> Dict[str, Any]:
        """
        加载配置文件
        """
        default_config = {
            "default_provider": "openai",
            "providers": {
                "openai": {
                    "api_key": os.getenv('OPENAI_API_KEY', 'your-api-key-here'),
                    "api_base": "https://api.openai.com/v1",
                    "model": "gpt-3.5-turbo",
                    "timeout": 30
                },
                "anthropic": {
                    "api_key": os.getenv('ANTHROPIC_API_KEY', ''),
                    "api_base": "https://api.anthropic.com/v1",
                    "model": "claude-3-sonnet-20240229",
                    "timeout": 30
                },
                "google": {
                    "api_key": os.getenv('GOOGLE_API_KEY', ''),
                    "api_base": "https://generativelanguage.googleapis.com/v1",
                    "model": "gemini-1.5-flash",
                    "timeout": 30
                },
                "azure": {
                    "api_key": os.getenv('AZURE_OPENAI_API_KEY', ''),
                    "api_base": os.getenv('AZURE_OPENAI_ENDPOINT', ''),
                    "model": os.getenv('AZURE_OPENAI_MODEL', 'gpt-35-turbo'),
                    "api_version": "2024-02-15-preview",
                    "timeout": 30
                },
                "siliconflow": {
                    "api_key": os.getenv('SILICONFLOW_API_KEY', ''),
                    "api_base": "https://api.siliconflow.cn/v1",
                    "model": "gpt-3.5-turbo",
                    "timeout": 30
                }
            }
        }
        
        # 为默认配置中的每个提供商添加缺失的字段
        for provider in default_config['providers']:
            if 'temperature' not in default_config['providers'][provider]:
                default_config['providers'][provider]['temperature'] = 0.7
            if 'max_tokens' not in default_config['providers'][provider]:
                default_config['providers'][provider]['max_tokens'] = 1000
        
        # 如果配置文件存在，加载并合并
        if os.path.exists(self.config_file):
            try:
                with open(self.config_file, 'r', encoding='utf-8') as f:
                    user_config = json.load(f)
                    # 合并配置
                    for provider, provider_config in user_config.get('providers', {}).items():
                        # 不管提供商是否在默认配置中，都添加或更新
                        if provider not in default_config['providers']:
                            default_config['providers'][provider] = {
                                "api_key": provider_config.get('api_key', ''),
                                "api_base": provider_config.get('api_base', ''),
                                "model": provider_config.get('model', ''),
                                "timeout": provider_config.get('timeout', 30),
                                "temperature": provider_config.get('temperature', 0.7),
                                "max_tokens": provider_config.get('max_tokens', 1000)
                            }
                        else:
                            # 更新配置，确保所有必要字段都存在
                            default_config['providers'][provider].update(provider_config)
                            # 确保缺失字段有默认值
                            if 'temperature' not in default_config['providers'][provider]:
                                default_config['providers'][provider]['temperature'] = 0.7
                            if 'max_tokens' not in default_config['providers'][provider]:
                                default_config['providers'][provider]['max_tokens'] = 1000
                    if 'default_provider' in user_config:
                        default_config['default_provider'] = user_config['default_provider']
            except Exception as e:
                print(f"加载配置文件失败: {e}")
        
        return default_config
    
    def get_provider_config(self, provider: Optional[str] = None) -> Dict[str, Any]:
        """
        获取指定提供商的配置
        """
        provider = provider or self.default_provider
        return self.config['providers'].get(provider, {})
    
    def get_default_provider(self) -> str:
        """
        获取默认提供商
        """
        return self.default_provider
    
    def set_default_provider(self, provider: str) -> bool:
        """
        设置默认提供商
        """
        if provider in self.config['providers']:
            self.default_provider = provider
            self.config['default_provider'] = provider
            self.save_config()
            return True
        return False
    
    def update_provider_config(self, provider: str, config: Dict[str, Any]) -> bool:
        """
        更新提供商配置
        """
        # 如果提供商不存在，添加新的提供商配置
        if provider not in self.config['providers']:
            self.config['providers'][provider] = {
                "api_key": config.get('api_key', ''),
                "api_base": config.get('api_base', ''),
                "model": config.get('model', ''),
                "timeout": config.get('timeout', 30),
                "temperature": config.get('temperature', 0.7),
                "max_tokens": config.get('max_tokens', 1000)
            }
        else:
            # 更新现有提供商配置
            self.config['providers'][provider].update(config)
        
        self.save_config()
        return True
    
    def save_config(self) -> bool:
        """
        保存配置到文件
        """
        try:
            # 确保配置文件目录存在
            config_dir = os.path.dirname(self.config_file)
            if not os.path.exists(config_dir):
                os.makedirs(config_dir)
            
            with open(self.config_file, 'w', encoding='utf-8') as f:
                json.dump(self.config, f, indent=2, ensure_ascii=False)
            return True
        except Exception as e:
            print(f"保存配置文件失败: {e}")
            print(f"配置文件路径: {self.config_file}")
            return False
    
    def is_provider_configured(self, provider: Optional[str] = None) -> bool:
        """
        检查提供商是否已配置
        """
        provider_config = self.get_provider_config(provider)
        api_key = provider_config.get('api_key', '')
        return bool(api_key and api_key != 'your-api-key-here')


# 创建全局配置实例
ai_config = AIConfig()


if __name__ == "__main__":
    # 测试配置
    print(f"默认提供商: {ai_config.get_default_provider()}")
    print(f"OpenAI配置: {ai_config.get_provider_config('openai')}")
    print(f"OpenAI是否已配置: {ai_config.is_provider_configured('openai')}")
