import requests
import json

# 测试硅基流动API
api_key = "your-api-key-here"
api_base = "https://api.siliconflow.cn/v1"

# 构建请求数据
data = {
    "model": "deepseek-ai/DeepSeek-V3.2",
    "messages": [
        {"role": "system", "content": "你是一位专业的小说作家"},
        {"role": "user", "content": "测试连接"}
    ],
    "max_tokens": 10
}

# 构建请求头
headers = {
    "Content-Type": "application/json",
    "Authorization": f"Bearer {api_key}"
}

print("测试硅基流动API...")
print(f"API基础URL: {api_base}")
print(f"请求数据: {json.dumps(data, indent=2, ensure_ascii=False)}")

try:
    # 发送请求
    response = requests.post(
        f"{api_base}/chat/completions",
        json=data,
        headers=headers,
        timeout=30
    )
    
    print(f"\n响应状态码: {response.status_code}")
    print(f"响应内容: {response.text}")
    
    if response.status_code != 200:
        print("\n错误详情:")
        try:
            error_data = response.json()
            print(json.dumps(error_data, indent=2, ensure_ascii=False))
        except:
            print("无法解析错误响应")
            
except Exception as e:
    print(f"\n请求异常: {e}")
