"""
Anthropic服务提供商实现
"""
import os
from typing import Dict, List, Any
import requests
from app.services.ai_service import AIServiceProvider
import logging

logger = logging.getLogger(__name__)


class AnthropicProvider(AIServiceProvider):
    """
    Anthropic服务提供商实现
    """
    
    def __init__(self):
        """
        初始化Anthropic提供商
        """
        super().__init__('anthropic')
    
    def chat_completion(self, messages: List[Dict[str, str]], **kwargs) -> Dict[str, Any]:
        """
        聊天完成接口
        """
        try:
            logger.info(f"Anthropic聊天完成请求: messages={messages[:1]}..., kwargs={kwargs}")
            
            # 构建请求参数
            api_key = self.config.get('api_key')
            if not api_key:
                raise ValueError("Anthropic API密钥未配置")
            
            url = f"{self.config.get('api_base', 'https://api.anthropic.com/v1')}/messages"
            headers = {
                'Content-Type': 'application/json',
                'x-api-key': api_key,
                'anthropic-version': '2023-06-01'
            }
            
            # 转换消息格式
            anthropic_messages = []
            for msg in messages:
                if msg['role'] == 'system':
                    # Anthropic使用system prompt
                    system_prompt = msg['content']
                else:
                    anthropic_messages.append({
                        'role': msg['role'],
                        'content': msg['content']
                    })
            
            data = {
                'model': kwargs.get('model', self.config.get('model', 'claude-3-sonnet-20240229')),
                'messages': anthropic_messages,
                'max_tokens': kwargs.get('max_tokens', 1000),
                'temperature': kwargs.get('temperature', 0.7)
            }
            
            # 添加system prompt
            if 'system_prompt' in kwargs:
                data['system'] = kwargs['system_prompt']
            elif 'system' in locals():
                data['system'] = system_prompt
            
            # 添加可选参数
            if 'top_p' in kwargs:
                data['top_p'] = kwargs['top_p']
            if 'stop_sequences' in kwargs:
                data['stop_sequences'] = kwargs['stop_sequences']
            if 'stream' in kwargs:
                data['stream'] = kwargs['stream']
            
            # 发送请求
            timeout = kwargs.get('timeout', self.config.get('timeout', 30))
            response = requests.post(url, headers=headers, json=data, timeout=timeout)
            response.raise_for_status()
            
            # 处理响应
            response_data = response.json()
            result = {
                'content': response_data['content'][0]['text'].strip(),
                'model': response_data['model'],
                'usage': {
                    'prompt_tokens': response_data['usage']['input_tokens'],
                    'completion_tokens': response_data['usage']['output_tokens'],
                    'total_tokens': response_data['usage']['input_tokens'] + response_data['usage']['output_tokens']
                },
                'provider': 'anthropic'
            }
            
            logger.info(f"Anthropic聊天完成成功: content_length={len(result['content'])}")
            return result
            
        except requests.exceptions.RequestException as e:
            logger.error(f"Anthropic HTTP错误: {e}")
            raise ValueError(f"Anthropic服务错误: {str(e)}")
        except Exception as e:
            logger.error(f"Anthropic聊天完成错误: {e}")
            raise ValueError(f"Anthropic服务错误: {str(e)}")
    
    def test_connection(self) -> Dict[str, Any]:
        """
        测试Anthropic API连通性
        """
        try:
            logger.info("测试Anthropic API连通性")
            
            # 发送一个简单的聊天完成请求
            messages = [
                {"role": "system", "content": "你是一个测试助手"},
                {"role": "user", "content": "测试连接"}
            ]
            
            # 构建请求参数
            api_key = self.config.get('api_key')
            if not api_key:
                return {
                    'success': False,
                    'provider': 'anthropic',
                    'error': 'API密钥未配置'
                }
            
            url = f"{self.config.get('api_base', 'https://api.anthropic.com/v1')}/messages"
            headers = {
                'Content-Type': 'application/json',
                'x-api-key': api_key,
                'anthropic-version': '2023-06-01'
            }
            
            data = {
                'model': self.config.get('model', 'claude-3-sonnet-20240229'),
                'messages': messages,
                'max_tokens': 10,
                'temperature': 0.0
            }
            
            # 发送请求
            timeout = self.config.get('timeout', 10)
            response = requests.post(url, headers=headers, json=data, timeout=timeout)
            response.raise_for_status()
            
            # 处理响应
            response_data = response.json()
            result = {
                'success': True,
                'provider': 'anthropic',
                'model': response_data['model'],
                'message': '连接成功'
            }
            
            logger.info("Anthropic API连通性测试成功")
            return result
            
        except requests.exceptions.RequestException as e:
            logger.error(f"Anthropic HTTP错误: {e}")
            return {
                'success': False,
                'provider': 'anthropic',
                'error': f"连接失败: {str(e)}"
            }
        except Exception as e:
            logger.error(f"Anthropic测试连接错误: {e}")
            return {
                'success': False,
                'provider': 'anthropic',
                'error': f"连接失败: {str(e)}"
            }
    
    def stream_chat_completion(self, messages: List[Dict[str, str]], **kwargs) -> Any:
        """
        流式聊天完成接口
        """
        try:
            logger.info(f"Anthropic流式聊天完成请求: messages={messages[:1]}..., kwargs={kwargs}")
            
            # 构建请求参数
            api_key = self.config.get('api_key')
            if not api_key:
                raise ValueError("Anthropic API密钥未配置")
            
            url = f"{self.config.get('api_base', 'https://api.anthropic.com/v1')}/messages"
            headers = {
                'Content-Type': 'application/json',
                'x-api-key': api_key,
                'anthropic-version': '2023-06-01'
            }
            
            # 转换消息格式
            anthropic_messages = []
            for msg in messages:
                if msg['role'] == 'system':
                    # Anthropic使用system prompt
                    system_prompt = msg['content']
                else:
                    anthropic_messages.append({
                        'role': msg['role'],
                        'content': msg['content']
                    })
            
            data = {
                'model': kwargs.get('model', self.config.get('model', 'claude-3-sonnet-20240229')),
                'messages': anthropic_messages,
                'max_tokens': kwargs.get('max_tokens', 1000),
                'temperature': kwargs.get('temperature', 0.7),
                'stream': True
            }
            
            # 添加system prompt
            if 'system_prompt' in kwargs:
                data['system'] = kwargs['system_prompt']
            elif 'system' in locals():
                data['system'] = system_prompt
            
            # 添加可选参数
            if 'top_p' in kwargs:
                data['top_p'] = kwargs['top_p']
            if 'stop_sequences' in kwargs:
                data['stop_sequences'] = kwargs['stop_sequences']
            
            # 发送请求
            timeout = kwargs.get('timeout', self.config.get('timeout', 30))
            response = requests.post(url, headers=headers, json=data, timeout=timeout, stream=True)
            response.raise_for_status()
            
            # 处理流式响应
            for chunk in response.iter_lines():
                if chunk:
                    # 移除数据前缀
                    chunk_str = chunk.decode('utf-8')
                    if chunk_str.startswith('data: '):
                        chunk_str = chunk_str[6:]
                    if chunk_str == '[DONE]':
                        break
                    if chunk_str:
                        try:
                            import json
                            chunk_data = json.loads(chunk_str)
                            if 'content' in chunk_data and chunk_data['content']:
                                for content_block in chunk_data['content']:
                                    if content_block['type'] == 'text':
                                        yield {
                                            'content': content_block['text'],
                                            'finish_reason': chunk_data.get('stop_reason'),
                                            'provider': 'anthropic'
                                        }
                        except json.JSONDecodeError as e:
                            logger.warning(f"解析流式响应失败: {e}")
                            continue
            
        except requests.exceptions.RequestException as e:
            logger.error(f"Anthropic HTTP错误: {e}")
            raise ValueError(f"Anthropic服务错误: {str(e)}")
        except Exception as e:
            logger.error(f"Anthropic流式聊天完成错误: {e}")
            raise ValueError(f"Anthropic服务错误: {str(e)}")
