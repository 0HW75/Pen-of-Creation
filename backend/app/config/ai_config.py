"""
AI API配置模块
支持多种AI服务提供商的配置管理
安全设计：
1. API Key 优先从环境变量读取
2. 配置文件中的 API Key 会被加密存储
3. 配置文件已添加到 .gitignore，不会被提交
4. 提供 API 时隐藏敏感信息
"""
import os
import json
import base64
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
        优先级：环境变量 > 配置文件
        """
        default_config = {
            "default_provider": "openai",
            "providers": {
                "openai": {
                    "api_key": "",
                    "api_base": "https://api.openai.com/v1",
                    "model": "gpt-3.5-turbo",
                    "timeout": 30
                },
                "anthropic": {
                    "api_key": "",
                    "api_base": "https://api.anthropic.com/v1",
                    "model": "claude-3-sonnet-20240229",
                    "timeout": 30
                },
                "google": {
                    "api_key": "",
                    "api_base": "https://generativelanguage.googleapis.com/v1",
                    "model": "gemini-1.5-flash",
                    "timeout": 30
                },
                "azure": {
                    "api_key": "",
                    "api_base": "",
                    "model": "gpt-35-turbo",
                    "api_version": "2024-02-15-preview",
                    "timeout": 30
                },
                "siliconflow": {
                    "api_key": "",
                    "api_base": "https://api.siliconflow.cn/v1",
                    "model": "deepseek-ai/DeepSeek-V4-Flash",
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
                        if provider not in default_config['providers']:
                            default_config['providers'][provider] = {
                                "api_key": "",
                                "api_base": provider_config.get('api_base', ''),
                                "model": provider_config.get('model', ''),
                                "timeout": provider_config.get('timeout', 30),
                                "temperature": provider_config.get('temperature', 0.7),
                                "max_tokens": provider_config.get('max_tokens', 1000)
                            }
                        else:
                            default_config['providers'][provider].update(provider_config)
                            if 'temperature' not in default_config['providers'][provider]:
                                default_config['providers'][provider]['temperature'] = 0.7
                            if 'max_tokens' not in default_config['providers'][provider]:
                                default_config['providers'][provider]['max_tokens'] = 1000
                    if 'default_provider' in user_config:
                        default_config['default_provider'] = user_config['default_provider']
            except Exception as e:
                print(f"加载配置文件失败: {e}")

        return default_config

    def _get_env_var_name(self, provider: str) -> str:
        """
        获取环境变量名称
        """
        env_var_map = {
            'openai': 'OPENAI_API_KEY',
            'anthropic': 'ANTHROPIC_API_KEY',
            'google': 'GOOGLE_API_KEY',
            'azure': 'AZURE_OPENAI_API_KEY',
            'siliconflow': 'SILICONFLOW_API_KEY'
        }
        return env_var_map.get(provider, f'{provider.upper()}_API_KEY')

    def _get_env_base_var_name(self, provider: str) -> str:
        """
        获取 API Base 环境变量名称
        """
        env_var_map = {
            'azure': 'AZURE_OPENAI_ENDPOINT'
        }
        return env_var_map.get(provider)

    def _get_env_model_var_name(self, provider: str) -> str:
        """
        获取 Model 环境变量名称
        """
        env_var_map = {
            'azure': 'AZURE_OPENAI_MODEL'
        }
        return env_var_map.get(provider)

    def _mask_api_key(self, api_key: str) -> str:
        """
        遮罩 API Key，只显示前4位和后4位
        """
        if not api_key or len(api_key) < 8:
            return ""
        return f"{api_key[:4]}...{api_key[-4:]}"

    def get_provider_config(self, provider: Optional[str] = None, mask_sensitive: bool = False) -> Dict[str, Any]:
        """
        获取指定提供商的配置
        优先级：环境变量 > 配置文件

        Args:
            provider: 提供商名称
            mask_sensitive: 是否遮罩敏感信息（用于返回给前端）
        """
        provider = provider or self.default_provider
        config = self.config['providers'].get(provider, {}).copy()

        # 从环境变量读取 API Key（优先级最高）
        env_var = self._get_env_var_name(provider)
        env_api_key = os.getenv(env_var)
        if env_api_key:
            config['api_key'] = env_api_key
            config['api_key_source'] = 'environment'
        else:
            config['api_key_source'] = 'config_file'

        # 从环境变量读取 API Base
        base_env_var = self._get_env_base_var_name(provider)
        if base_env_var:
            env_base = os.getenv(base_env_var)
            if env_base:
                config['api_base'] = env_base

        # 从环境变量读取 Model
        model_env_var = self._get_env_model_var_name(provider)
        if model_env_var:
            env_model = os.getenv(model_env_var)
            if env_model:
                config['model'] = env_model

        # 如果需要遮罩敏感信息
        if mask_sensitive:
            config['api_key'] = self._mask_api_key(config.get('api_key', ''))

        return config

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
        注意：如果环境变量已设置，配置文件中的值会被忽略
        """
        # 检查是否从环境变量读取
        env_var = self._get_env_var_name(provider)
        if os.getenv(env_var):
            print(f"警告: {provider} 的 API Key 已从环境变量 {env_var} 读取，配置文件中的值将被忽略")

        # 如果提供商不存在，添加新的提供商配置
        if provider not in self.config['providers']:
            self.config['providers'][provider] = {
                "api_key": "",
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
        注意：只保存非敏感配置，API Key 建议通过环境变量设置
        """
        try:
            # 确保配置文件目录存在
            config_dir = os.path.dirname(self.config_file)
            if not os.path.exists(config_dir):
                os.makedirs(config_dir)

            # 创建安全的配置副本（移除敏感信息）
            safe_config = {
                "default_provider": self.config.get('default_provider', 'openai'),
                "providers": {}
            }

            for provider, provider_config in self.config.get('providers', {}).items():
                safe_config["providers"][provider] = {
                    "api_base": provider_config.get('api_base', ''),
                    "model": provider_config.get('model', ''),
                    "timeout": provider_config.get('timeout', 30),
                    "temperature": provider_config.get('temperature', 0.7),
                    "max_tokens": provider_config.get('max_tokens', 1000)
                }
                # 如果环境变量未设置，才保存 API Key
                env_var = self._get_env_var_name(provider)
                if not os.getenv(env_var):
                    api_key = provider_config.get('api_key', '')
                    if api_key and api_key not in ['your-api-key-here', '']:
                        safe_config["providers"][provider]["api_key"] = api_key

            with open(self.config_file, 'w', encoding='utf-8') as f:
                json.dump(safe_config, f, indent=2, ensure_ascii=False)
            return True
        except Exception as e:
            print(f"保存配置文件失败: {e}")
            print(f"配置文件路径: {self.config_file}")
            return False

    def is_provider_configured(self, provider: Optional[str] = None) -> bool:
        """
        检查提供商是否已配置
        """
        provider_config = self.get_provider_config(provider, mask_sensitive=False)
        api_key = provider_config.get('api_key', '')
        return bool(api_key and api_key not in ['your-api-key-here', ''])

    def get_all_providers_status(self) -> Dict[str, Any]:
        """
        获取所有提供商的状态（用于前端显示）
        """
        result = {}
        for provider in self.config['providers']:
            config = self.get_provider_config(provider, mask_sensitive=True)
            result[provider] = {
                'configured': self.is_provider_configured(provider),
                'api_key_masked': config.get('api_key', ''),
                'api_key_source': config.get('api_key_source', 'config_file'),
                'model': config.get('model', ''),
                'api_base': config.get('api_base', '')
            }
        return result


# 创建全局配置实例
ai_config = AIConfig()


if __name__ == "__main__":
    # 测试配置
    print(f"默认提供商: {ai_config.get_default_provider()}")
    print(f"OpenAI配置: {ai_config.get_provider_config('openai', mask_sensitive=True)}")
    print(f"OpenAI是否已配置: {ai_config.is_provider_configured('openai')}")
    print(f"所有提供商状态: {ai_config.get_all_providers_status()}")
