import requests

# 测试流式API端点
url = "http://localhost:5000/api/ai/stream"
data = {
    "messages": [
        {
            "role": "system",
            "content": "你是一位专业的小说作家"
        },
        {
            "role": "user",
            "content": "测试"
        }
    ],
    "max_tokens": 50
}

print("测试流式API端点...")
print(f"请求数据: {data}")

try:
    response = requests.post(url, json=data, stream=True, timeout=30)
    print(f"响应状态码: {response.status_code}")
    
    if response.status_code == 200:
        print("\n流式响应内容:")
        for chunk in response.iter_content(chunk_size=1024):
            if chunk:
                print(chunk.decode('utf-8'), end='')
        print("\n\n流式响应结束")
    else:
        print(f"\n错误响应: {response.text}")
        
except Exception as e:
    print(f"\n请求异常: {e}")
