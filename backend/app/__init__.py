from flask import Flask, request
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask_compress import Compress
import os
import time

# 创建数据库实例
db = SQLAlchemy()

# 创建压缩实例
compress = Compress()

def create_app():
    # 创建Flask应用
    app = Flask(__name__)
    
    # 配置CORS
    CORS(app)
    
    # 配置数据库
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///../novel_editor.db'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    
    # 配置压缩
    app.config['COMPRESS_MIMETYPES'] = ['text/html', 'text/css', 'text/xml', 'application/json', 'application/javascript']
    app.config['COMPRESS_LEVEL'] = 6
    app.config['COMPRESS_MIN_SIZE'] = 500
    
    # 初始化数据库和压缩
    db.init_app(app)
    compress.init_app(app)
    
    # 添加响应时间中间件
    @app.before_request
    def before_request():
        request.start_time = time.time()
    
    @app.after_request
    def after_request(response):
        # 计算响应时间
        if hasattr(request, 'start_time'):
            response_time = time.time() - request.start_time
            response.headers['X-Response-Time'] = str(response_time)
        
        # 添加缓存控制头
        if response.mimetype == 'application/json':
            response.headers['Cache-Control'] = 'no-cache, no-store, must-revalidate'
            response.headers['Pragma'] = 'no-cache'
            response.headers['Expires'] = '0'
        
        return response
    
    # 导入并注册蓝图
    from app.api import api_bp
    app.register_blueprint(api_bp, url_prefix='/api')
    
    # 创建数据库表
    with app.app_context():
        db.create_all()
    
    return app