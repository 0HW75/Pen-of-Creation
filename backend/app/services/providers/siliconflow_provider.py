"""
硅基流动服务提供商实现
"""
import requests
from app.services.ai_service import AIServiceProvider
from typing import Dict, List, Any
import logging

logger = logging.getLogger(__name__)


class SiliconFlowProvider(AIServiceProvider):
    """
    硅基流动服务提供商实现
    """
    
    def __init__(self):
        """
        初始化硅基流动提供商
        """
        super().__init__('siliconflow')
        
    def chat_completion(self, messages: List[Dict[str, str]], **kwargs) -> Dict[str, Any]:
        """
        聊天完成接口
        """
        try:
            logger.info(f"硅基流动聊天完成请求: messages={messages[:1]}..., kwargs={kwargs}")
            
            # 构建请求参数
            params = {
                'model': kwargs.get('model', self.config.get('model', 'gpt-3.5-turbo')),
                'messages': messages,
                'max_tokens': kwargs.get('max_tokens', 1000),
                'temperature': kwargs.get('temperature', 0.7),
                'timeout': float(kwargs.get('timeout', self.config.get('timeout', 30)))
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
            
            # 构建API请求
            api_base = self.config.get('api_base', 'https://api.siliconflow.cn/v1').rstrip('/')
            api_key = self.config.get('api_key', '')
            if not api_key:
                return {
                    'success': False,
                    'provider': 'siliconflow',
                    'error': 'API密钥未配置'
                }
            headers = {
                'Content-Type': 'application/json',
                'Authorization': f"Bearer {api_key}"
            }
            
            # 发送请求
            response = requests.post(
                f"{api_base}/chat/completions",
                json=params,
                headers=headers,
                timeout=params['timeout']
            )
            
            # 检查响应状态
            response.raise_for_status()
            
            # 处理响应
            response_data = response.json()
            result = {
                'content': response_data['choices'][0]['message']['content'].strip(),
                'model': response_data['model'],
                'usage': {
                    'prompt_tokens': response_data['usage']['prompt_tokens'],
                    'completion_tokens': response_data['usage']['completion_tokens'],
                    'total_tokens': response_data['usage']['total_tokens']
                },
                'provider': 'siliconflow'
            }
            
            logger.info(f"硅基流动聊天完成成功: content_length={len(result['content'])}")
            return result
            
        except requests.exceptions.HTTPError as e:
            error_details = ""
            if e.response:
                try:
                    error_details = e.response.json()
                except:
                    error_details = e.response.text
            logger.error(f"硅基流动HTTP错误: {e}, 详情: {error_details}")
            if e.response and e.response.status_code == 401:
                raise ValueError(f"硅基流动API密钥错误: {str(e)}")
            raise ValueError(f"硅基流动API错误: {str(e)}, 详情: {error_details}")
        except requests.exceptions.Timeout as e:
            logger.error(f"硅基流动超时错误: {e}")
            raise ValueError(f"硅基流动请求超时: {str(e)}")
        except Exception as e:
            logger.error(f"硅基流动聊天完成错误: {e}")
            raise ValueError(f"硅基流动服务错误: {str(e)}")
    
    def test_connection(self) -> Dict[str, Any]:
        """
        测试硅基流动API连通性
        """
        try:
            logger.info("测试硅基流动API连通性")
            
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
                'timeout': float(self.config.get('timeout', 10))
            }
            
            # 构建API请求
            api_base = self.config.get('api_base', 'https://api.siliconflow.cn/v1').rstrip('/')
            api_key = self.config.get('api_key', '')
            if not api_key:
                return {
                    'success': False,
                    'provider': 'siliconflow',
                    'error': 'API密钥未配置'
                }
            headers = {
                'Content-Type': 'application/json',
                'Authorization': f"Bearer {api_key}"
            }
            
            # 发送请求
            response = requests.post(
                f"{api_base}/chat/completions",
                json=params,
                headers=headers,
                timeout=params['timeout']
            )
            
            # 检查响应状态
            response.raise_for_status()
            
            # 处理响应
            response_data = response.json()
            result = {
                'success': True,
                'provider': 'siliconflow',
                'model': response_data['model'],
                'message': '连接成功'
            }
            
            logger.info("硅基流动API连通性测试成功")
            return result
            
        except requests.exceptions.HTTPError as e:
            error_details = ""
            if e.response:
                try:
                    error_details = e.response.json()
                except:
                    error_details = e.response.text
            logger.error(f"硅基流动HTTP错误: {e}, 详情: {error_details}")
            if e.response and e.response.status_code == 401:
                return {
                    'success': False,
                    'provider': 'siliconflow',
                    'error': f"API密钥错误: {str(e)}"
                }
            return {
                'success': False,
                'provider': 'siliconflow',
                'error': f"API错误: {str(e)}, 详情: {error_details}"
            }
        except requests.exceptions.Timeout as e:
            logger.error(f"硅基流动超时错误: {e}")
            return {
                'success': False,
                'provider': 'siliconflow',
                'error': f"请求超时: {str(e)}"
            }
        except Exception as e:
            logger.error(f"硅基流动测试连接错误: {e}")
            return {
                'success': False,
                'provider': 'siliconflow',
                'error': f"连接失败: {str(e)}"
            }
    
    def stream_chat_completion(self, messages: List[Dict[str, str]], **kwargs) -> Any:
        """
        流式聊天完成接口
        """
        try:
            logger.info(f"硅基流动流式聊天完成请求: messages={messages[:1]}..., kwargs={kwargs}")
            
            # 构建请求参数
            params = {
                'model': kwargs.get('model', self.config.get('model', 'gpt-3.5-turbo')),
                'messages': messages,
                'max_tokens': kwargs.get('max_tokens', 1000),
                'temperature': kwargs.get('temperature', 0.7),
                'timeout': float(kwargs.get('timeout', self.config.get('timeout', 30))),
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
            
            # 构建API请求
            api_base = self.config.get('api_base', 'https://api.siliconflow.cn/v1').rstrip('/')
            api_key = self.config.get('api_key', '')
            if not api_key:
                raise ValueError("硅基流动API密钥未配置")
            headers = {
                'Content-Type': 'application/json',
                'Authorization': f"Bearer {api_key}"
            }
            
            # 发送流式请求
            response = requests.post(
                f"{api_base}/chat/completions",
                json=params,
                headers=headers,
                timeout=params['timeout'],
                stream=True
            )
            
            # 检查响应状态
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
                            if 'choices' in chunk_data and chunk_data['choices']:
                                choice = chunk_data['choices'][0]
                                if 'delta' in choice and 'content' in choice['delta']:
                                    yield {
                                        'content': choice['delta']['content'],
                                        'finish_reason': choice.get('finish_reason'),
                                        'provider': 'siliconflow'
                                    }
                        except json.JSONDecodeError as e:
                            logger.warning(f"解析流式响应失败: {e}")
                            continue
            
        except requests.exceptions.HTTPError as e:
            error_details = ""
            if e.response:
                try:
                    error_details = e.response.json()
                except:
                    error_details = e.response.text
            logger.error(f"硅基流动HTTP错误: {e}, 详情: {error_details}")
            if e.response and e.response.status_code == 401:
                raise ValueError(f"硅基流动API密钥错误: {str(e)}")
            raise ValueError(f"硅基流动API错误: {str(e)}, 详情: {error_details}")
        except requests.exceptions.Timeout as e:
            logger.error(f"硅基流动超时错误: {e}")
            raise ValueError(f"硅基流动请求超时: {str(e)}")
        except Exception as e:
            logger.error(f"硅基流动流式聊天完成错误: {e}")
            raise ValueError(f"硅基流动服务错误: {str(e)}")
