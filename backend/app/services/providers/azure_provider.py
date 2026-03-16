"""
Azure OpenAI服务提供商实现
"""
import openai
from typing import Dict, List, Any
from app.services.ai_service import AIServiceProvider
import logging

logger = logging.getLogger(__name__)


class AzureProvider(AIServiceProvider):
    """
    Azure OpenAI服务提供商实现
    """
    
    def __init__(self):
        """
        初始化Azure提供商
        """
        super().__init__('azure')
        self._configure_client()
    
    def _configure_client(self):
        """
        配置Azure OpenAI客户端
        """
        if self.config.get('api_key'):
            openai.api_key = self.config['api_key']
        if self.config.get('api_base'):
            openai.api_base = self.config['api_base']
        if self.config.get('api_version'):
            openai.api_version = self.config['api_version']
    
    def chat_completion(self, messages: List[Dict[str, str]], **kwargs) -> Dict[str, Any]:
        """
        聊天完成接口
        """
        try:
            logger.info(f"Azure聊天完成请求: messages={messages[:1]}..., kwargs={kwargs}")
            
            # 构建请求参数
            params = {
                'engine': kwargs.get('model', self.config.get('model', 'gpt-35-turbo')),
                'messages': messages,
                'max_tokens': kwargs.get('max_tokens', 1000),
                'temperature': kwargs.get('temperature', 0.7),
                'timeout': kwargs.get('timeout', self.config.get('timeout', 30))
            }
            
            # 添加可选参数
            if 'top_p' in kwargs:
                params['top_p'] = kwargs['top_p']
            if 'n' in kwargs:
                params['n'] = kwargs['n']
            if 'stop' in kwargs:
                params['stop'] = kwargs['stop']
            if 'frequency_penalty' in kwargs:
                params['frequency_penalty'] = kwargs['frequency_penalty']
            if 'presence_penalty' in kwargs:
                params['presence_penalty'] = kwargs['presence_penalty']
            
            # 发送请求
            response = openai.ChatCompletion.create(**params)
            
            # 处理响应
            result = {
                'content': response.choices[0].message.content.strip(),
                'model': response.model,
                'usage': {
                    'prompt_tokens': response.usage.prompt_tokens,
                    'completion_tokens': response.usage.completion_tokens,
                    'total_tokens': response.usage.total_tokens
                },
                'provider': 'azure'
            }
            
            logger.info(f"Azure聊天完成成功: content_length={len(result['content'])}")
            return result
            
        except openai.error.AuthenticationError as e:
            logger.error(f"Azure认证错误: {e}")
            raise ValueError(f"Azure API密钥错误: {str(e)}")
        except openai.error.APIError as e:
            logger.error(f"Azure API错误: {e}")
            raise ValueError(f"Azure API错误: {str(e)}")
        except openai.error.RateLimitError as e:
            logger.error(f"Azure速率限制错误: {e}")
            raise ValueError(f"API调用频率过高: {str(e)}")
        except openai.error.Timeout as e:
            logger.error(f"Azure超时错误: {e}")
            raise ValueError(f"Azure请求超时: {str(e)}")
        except Exception as e:
            logger.error(f"Azure聊天完成错误: {e}")
            raise ValueError(f"Azure服务错误: {str(e)}")
    
    def test_connection(self) -> Dict[str, Any]:
        """
        测试Azure API连通性
        """
        try:
            logger.info("测试Azure API连通性")
            
            # 发送一个简单的聊天完成请求
            messages = [
                {"role": "system", "content": "你是一个测试助手"},
                {"role": "user", "content": "测试连接"}
            ]
            
            # 构建请求参数
            params = {
                'engine': self.config.get('model', 'gpt-35-turbo'),
                'messages': messages,
                'max_tokens': 10,
                'temperature': 0.0,
                'timeout': self.config.get('timeout', 10)
            }
            
            # 发送请求
            response = openai.ChatCompletion.create(**params)
            
            # 处理响应
            result = {
                'success': True,
                'provider': 'azure',
                'model': response.model,
                'message': '连接成功'
            }
            
            logger.info("Azure API连通性测试成功")
            return result
            
        except openai.error.AuthenticationError as e:
            logger.error(f"Azure认证错误: {e}")
            return {
                'success': False,
                'provider': 'azure',
                'error': f"API密钥错误: {str(e)}"
            }
        except openai.error.APIError as e:
            logger.error(f"Azure API错误: {e}")
            return {
                'success': False,
                'provider': 'azure',
                'error': f"API错误: {str(e)}"
            }
        except openai.error.RateLimitError as e:
            logger.error(f"Azure速率限制错误: {e}")
            return {
                'success': False,
                'provider': 'azure',
                'error': f"速率限制: {str(e)}"
            }
        except openai.error.Timeout as e:
            logger.error(f"Azure超时错误: {e}")
            return {
                'success': False,
                'provider': 'azure',
                'error': f"请求超时: {str(e)}"
            }
        except Exception as e:
            logger.error(f"Azure测试连接错误: {e}")
            return {
                'success': False,
                'provider': 'azure',
                'error': f"连接失败: {str(e)}"
            }
    
    def stream_chat_completion(self, messages: List[Dict[str, str]], **kwargs) -> Any:
        """
        流式聊天完成接口
        """
        try:
            logger.info(f"Azure流式聊天完成请求: messages={messages[:1]}..., kwargs={kwargs}")
            
            # 构建请求参数
            params = {
                'engine': kwargs.get('model', self.config.get('model', 'gpt-35-turbo')),
                'messages': messages,
                'max_tokens': kwargs.get('max_tokens', 1000),
                'temperature': kwargs.get('temperature', 0.7),
                'timeout': kwargs.get('timeout', self.config.get('timeout', 30)),
                'stream': True
            }
            
            # 添加可选参数
            if 'top_p' in kwargs:
                params['top_p'] = kwargs['top_p']
            if 'n' in kwargs:
                params['n'] = kwargs['n']
            if 'stop' in kwargs:
                params['stop'] = kwargs['stop']
            if 'frequency_penalty' in kwargs:
                params['frequency_penalty'] = kwargs['frequency_penalty']
            if 'presence_penalty' in kwargs:
                params['presence_penalty'] = kwargs['presence_penalty']
            
            # 发送流式请求
            response = openai.ChatCompletion.create(**params)
            
            # 处理流式响应
            for chunk in response:
                if 'choices' in chunk and chunk['choices']:
                    choice = chunk['choices'][0]
                    if 'delta' in choice and 'content' in choice['delta']:
                        yield {
                            'content': choice['delta']['content'],
                            'finish_reason': choice.get('finish_reason'),
                            'provider': 'azure'
                        }
            
        except openai.error.AuthenticationError as e:
            logger.error(f"Azure认证错误: {e}")
            raise ValueError(f"Azure API密钥错误: {str(e)}")
        except openai.error.APIError as e:
            logger.error(f"Azure API错误: {e}")
            raise ValueError(f"Azure API错误: {str(e)}")
        except openai.error.RateLimitError as e:
            logger.error(f"Azure速率限制错误: {e}")
            raise ValueError(f"API调用频率过高: {str(e)}")
        except openai.error.Timeout as e:
            logger.error(f"Azure超时错误: {e}")
            raise ValueError(f"Azure请求超时: {str(e)}")
        except Exception as e:
            logger.error(f"Azure流式聊天完成错误: {e}")
            raise ValueError(f"Azure服务错误: {str(e)}")
