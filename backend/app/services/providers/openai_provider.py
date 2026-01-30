"""
OpenAI服务提供商实现
"""
import openai
from app.services.ai_service import AIServiceProvider
from typing import Dict, List, Any
import logging

logger = logging.getLogger(__name__)


class OpenAIProvider(AIServiceProvider):
    """
    OpenAI服务提供商实现
    """
    
    def __init__(self):
        """
        初始化OpenAI提供商
        """
        super().__init__('openai')
        self._configure_client()
    
    def _configure_client(self):
        """
        配置OpenAI客户端
        """
        if self.config.get('api_key'):
            openai.api_key = self.config['api_key']
        if self.config.get('api_base'):
            openai.api_base = self.config['api_base']
    
    def chat_completion(self, messages: List[Dict[str, str]], **kwargs) -> Dict[str, Any]:
        """
        聊天完成接口
        """
        try:
            logger.info(f"OpenAI聊天完成请求: messages={messages[:1]}..., kwargs={kwargs}")
            
            # 构建请求参数
            params = {
                'model': kwargs.get('model', self.config.get('model', 'gpt-3.5-turbo')),
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
                'provider': 'openai'
            }
            
            logger.info(f"OpenAI聊天完成成功: content_length={len(result['content'])}")
            return result
            
        except openai.error.AuthenticationError as e:
            logger.error(f"OpenAI认证错误: {e}")
            raise ValueError(f"OpenAI API密钥错误: {str(e)}")
        except openai.error.APIError as e:
            logger.error(f"OpenAI API错误: {e}")
            raise ValueError(f"OpenAI API错误: {str(e)}")
        except openai.error.RateLimitError as e:
            logger.error(f"OpenAI速率限制错误: {e}")
            raise ValueError(f"API调用频率过高: {str(e)}")
        except openai.error.Timeout as e:
            logger.error(f"OpenAI超时错误: {e}")
            raise ValueError(f"OpenAI请求超时: {str(e)}")
        except Exception as e:
            logger.error(f"OpenAI聊天完成错误: {e}")
            raise ValueError(f"OpenAI服务错误: {str(e)}")
    
    def test_connection(self) -> Dict[str, Any]:
        """
        测试OpenAI API连通性
        """
        try:
            logger.info("测试OpenAI API连通性")
            
            # 发送一个简单的聊天完成请求
            messages = [
                {"role": "system", "content": "你是一个测试助手"},
                {"role": "user", "content": "测试连接"}
            ]
            
            # 构建请求参数
            params = {
                'model': self.config.get('model', 'gpt-3.5-turbo'),
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
                'provider': 'openai',
                'model': response.model,
                'message': '连接成功'
            }
            
            logger.info("OpenAI API连通性测试成功")
            return result
            
        except openai.error.AuthenticationError as e:
            logger.error(f"OpenAI认证错误: {e}")
            return {
                'success': False,
                'provider': 'openai',
                'error': f"API密钥错误: {str(e)}"
            }
        except openai.error.APIError as e:
            logger.error(f"OpenAI API错误: {e}")
            return {
                'success': False,
                'provider': 'openai',
                'error': f"API错误: {str(e)}"
            }
        except openai.error.RateLimitError as e:
            logger.error(f"OpenAI速率限制错误: {e}")
            return {
                'success': False,
                'provider': 'openai',
                'error': f"速率限制: {str(e)}"
            }
        except openai.error.Timeout as e:
            logger.error(f"OpenAI超时错误: {e}")
            return {
                'success': False,
                'provider': 'openai',
                'error': f"请求超时: {str(e)}"
            }
        except Exception as e:
            logger.error(f"OpenAI测试连接错误: {e}")
            return {
                'success': False,
                'provider': 'openai',
                'error': f"连接失败: {str(e)}"
            }
    
    def stream_chat_completion(self, messages: List[Dict[str, str]], **kwargs) -> Any:
        """
        流式聊天完成接口
        """
        try:
            logger.info(f"OpenAI流式聊天完成请求: messages={messages[:1]}..., kwargs={kwargs}")
            
            # 构建请求参数
            params = {
                'model': kwargs.get('model', self.config.get('model', 'gpt-3.5-turbo')),
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
                            'provider': 'openai'
                        }
            
        except openai.error.AuthenticationError as e:
            logger.error(f"OpenAI认证错误: {e}")
            raise ValueError(f"OpenAI API密钥错误: {str(e)}")
        except openai.error.APIError as e:
            logger.error(f"OpenAI API错误: {e}")
            raise ValueError(f"OpenAI API错误: {str(e)}")
        except openai.error.RateLimitError as e:
            logger.error(f"OpenAI速率限制错误: {e}")
            raise ValueError(f"API调用频率过高: {str(e)}")
        except openai.error.Timeout as e:
            logger.error(f"OpenAI超时错误: {e}")
            raise ValueError(f"OpenAI请求超时: {str(e)}")
        except Exception as e:
            logger.error(f"OpenAI流式聊天完成错误: {e}")
            raise ValueError(f"OpenAI服务错误: {str(e)}")
