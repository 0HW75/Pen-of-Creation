"""
Google服务提供商实现
"""
from typing import Dict, List, Any
import requests
from app.services.ai_service import AIServiceProvider
import logging

logger = logging.getLogger(__name__)


class GoogleProvider(AIServiceProvider):
    """
    Google服务提供商实现
    """
    
    def __init__(self):
        """
        初始化Google提供商
        """
        super().__init__('google')
    
    def chat_completion(self, messages: List[Dict[str, str]], **kwargs) -> Dict[str, Any]:
        """
        聊天完成接口
        """
        try:
            logger.info(f"Google聊天完成请求: messages={messages[:1]}..., kwargs={kwargs}")
            
            # 构建请求参数
            api_key = self.config.get('api_key')
            if not api_key:
                raise ValueError("Google API密钥未配置")
            
            model = kwargs.get('model', self.config.get('model', 'gemini-1.5-flash'))
            url = f"{self.config.get('api_base', 'https://generativelanguage.googleapis.com/v1')}/models/{model}:generateContent"
            url += f"?key={api_key}"
            
            headers = {
                'Content-Type': 'application/json'
            }
            
            # 转换消息格式
            google_messages = []
            for msg in messages:
                if msg['role'] == 'system':
                    # Google使用system instruction
                    system_instruction = msg['content']
                else:
                    google_messages.append({
                        'role': msg['role'],
                        'parts': [{'text': msg['content']}]
                    })
            
            data = {
                'contents': google_messages,
                'generationConfig': {
                    'maxOutputTokens': kwargs.get('max_tokens', 1000),
                    'temperature': kwargs.get('temperature', 0.7)
                }
            }
            
            # 添加system instruction
            if 'system_instruction' in kwargs:
                data['systemInstruction'] = {'parts': [{'text': kwargs['system_instruction']}]}
            elif 'system_instruction' in locals():
                data['systemInstruction'] = {'parts': [{'text': system_instruction}]}
            
            # 添加可选参数
            if 'top_p' in kwargs:
                data['generationConfig']['topP'] = kwargs['top_p']
            if 'top_k' in kwargs:
                data['generationConfig']['topK'] = kwargs['top_k']
            if 'stopSequences' in kwargs:
                data['generationConfig']['stopSequences'] = kwargs['stopSequences']
            
            # 发送请求
            timeout = kwargs.get('timeout', self.config.get('timeout', 30))
            response = requests.post(url, headers=headers, json=data, timeout=timeout)
            response.raise_for_status()
            
            # 处理响应
            response_data = response.json()
            content = ''
            for part in response_data['candidates'][0]['content']['parts']:
                if 'text' in part:
                    content += part['text']
            
            result = {
                'content': content.strip(),
                'model': model,
                'usage': {
                    'prompt_tokens': response_data.get('usageMetadata', {}).get('promptTokenCount', 0),
                    'completion_tokens': response_data.get('usageMetadata', {}).get('candidatesTokenCount', 0),
                    'total_tokens': response_data.get('usageMetadata', {}).get('totalTokenCount', 0)
                },
                'provider': 'google'
            }
            
            logger.info(f"Google聊天完成成功: content_length={len(result['content'])}")
            return result
            
        except requests.exceptions.RequestException as e:
            logger.error(f"Google HTTP错误: {e}")
            raise ValueError(f"Google服务错误: {str(e)}")
        except Exception as e:
            logger.error(f"Google聊天完成错误: {e}")
            raise ValueError(f"Google服务错误: {str(e)}")
    
    def test_connection(self) -> Dict[str, Any]:
        """
        测试Google API连通性
        """
        try:
            logger.info("测试Google API连通性")
            
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
                    'provider': 'google',
                    'error': 'API密钥未配置'
                }
            
            model = self.config.get('model', 'gemini-1.5-flash')
            url = f"{self.config.get('api_base', 'https://generativelanguage.googleapis.com/v1')}/models/{model}:generateContent"
            url += f"?key={api_key}"
            
            headers = {
                'Content-Type': 'application/json'
            }
            
            # 转换消息格式
            google_messages = []
            for msg in messages:
                if msg['role'] == 'system':
                    # Google使用system instruction
                    system_instruction = msg['content']
                else:
                    google_messages.append({
                        'role': msg['role'],
                        'parts': [{'text': msg['content']}]
                    })
            
            data = {
                'contents': google_messages,
                'generationConfig': {
                    'maxOutputTokens': 10,
                    'temperature': 0.0
                }
            }
            
            # 添加system instruction
            if 'system_instruction' in locals():
                data['systemInstruction'] = {'parts': [{'text': system_instruction}]}
            
            # 发送请求
            timeout = self.config.get('timeout', 10)
            response = requests.post(url, headers=headers, json=data, timeout=timeout)
            response.raise_for_status()
            
            # 处理响应
            response_data = response.json()
            result = {
                'success': True,
                'provider': 'google',
                'model': model,
                'message': '连接成功'
            }
            
            logger.info("Google API连通性测试成功")
            return result
            
        except requests.exceptions.RequestException as e:
            logger.error(f"Google HTTP错误: {e}")
            return {
                'success': False,
                'provider': 'google',
                'error': f"连接失败: {str(e)}"
            }
        except Exception as e:
            logger.error(f"Google测试连接错误: {e}")
            return {
                'success': False,
                'provider': 'google',
                'error': f"连接失败: {str(e)}"
            }
    
    def stream_chat_completion(self, messages: List[Dict[str, str]], **kwargs) -> Any:
        """
        流式聊天完成接口
        """
        try:
            logger.info(f"Google流式聊天完成请求: messages={messages[:1]}..., kwargs={kwargs}")
            
            # 构建请求参数
            api_key = self.config.get('api_key')
            if not api_key:
                raise ValueError("Google API密钥未配置")
            
            model = kwargs.get('model', self.config.get('model', 'gemini-1.5-flash'))
            url = f"{self.config.get('api_base', 'https://generativelanguage.googleapis.com/v1')}/models/{model}:streamGenerateContent"
            url += f"?key={api_key}"
            
            headers = {
                'Content-Type': 'application/json'
            }
            
            # 转换消息格式
            google_messages = []
            for msg in messages:
                if msg['role'] == 'system':
                    # Google使用system instruction
                    system_instruction = msg['content']
                else:
                    google_messages.append({
                        'role': msg['role'],
                        'parts': [{'text': msg['content']}]
                    })
            
            data = {
                'contents': google_messages,
                'generationConfig': {
                    'maxOutputTokens': kwargs.get('max_tokens', 1000),
                    'temperature': kwargs.get('temperature', 0.7)
                }
            }
            
            # 添加system instruction
            if 'system_instruction' in kwargs:
                data['systemInstruction'] = {'parts': [{'text': kwargs['system_instruction']}]}
            elif 'system_instruction' in locals():
                data['systemInstruction'] = {'parts': [{'text': system_instruction}]}
            
            # 添加可选参数
            if 'top_p' in kwargs:
                data['generationConfig']['topP'] = kwargs['top_p']
            if 'top_k' in kwargs:
                data['generationConfig']['topK'] = kwargs['top_k']
            if 'stopSequences' in kwargs:
                data['generationConfig']['stopSequences'] = kwargs['stopSequences']
            
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
                            if 'candidates' in chunk_data and chunk_data['candidates']:
                                for candidate in chunk_data['candidates']:
                                    if 'content' in candidate and candidate['content']:
                                        for part in candidate['content']['parts']:
                                            if 'text' in part:
                                                yield {
                                                    'content': part['text'],
                                                    'finish_reason': candidate.get('finishReason'),
                                                    'provider': 'google'
                                                }
                        except json.JSONDecodeError as e:
                            logger.warning(f"解析流式响应失败: {e}")
                            continue
            
        except requests.exceptions.RequestException as e:
            logger.error(f"Google HTTP错误: {e}")
            raise ValueError(f"Google服务错误: {str(e)}")
        except Exception as e:
            logger.error(f"Google流式聊天完成错误: {e}")
            raise ValueError(f"Google服务错误: {str(e)}")
